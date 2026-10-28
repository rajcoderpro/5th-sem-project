const mongoose = require( "mongoose" );
const bcrypt = require( "bcryptjs" );

const userModel = require( "../models/user.model" );
const employeeModel = require( "../models/employee.model" );
const departmentModel = require( "../models/department.model" );

const registerEmployee = async ( req, res ) => {
    if ( !req.user?.id ) {
        return res.status( 401 ).json( {
            success: false,
            message: "Authentication required"
        } );
    }

    const body = req.body || {};

    const name =
        typeof body.name === "string" ? body.name.trim() : "";

    const email =
        typeof body.email === "string"
            ? body.email.trim().toLowerCase()
            : "";

    const password = body.password;

    const employeeCode =
        typeof body.employeeCode === "string"
            ? body.employeeCode.trim().toUpperCase()
            : "";

    const designation =
        typeof body.designation === "string"
            ? body.designation.trim()
            : "";

    const departmentId = body.departmentId;
    const managerId = body.managerId || null;

    const employmentType = body.employmentType || "FULL_TIME";
    const workMode = body.workMode || "ONSITE";

    const joiningDate = new Date( body.joiningDate );

    // Validate required fields
    if (
        !name ||
        !email ||
        typeof password !== "string" ||
        !password ||
        !employeeCode ||
        !designation ||
        !body.joiningDate ||
        !departmentId
    ) {
        return res.status( 400 ).json( {
            success: false,
            message: "Please provide all required employee details"
        } );
    }

    if ( name.length > 80 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test( email ) ) {
        return res.status( 400 ).json( {
            success: false,
            message: "Please provide a valid name and email"
        } );
    }

    if (
        password.length < 8 ||
        Buffer.byteLength( password, "utf8" ) > 72
    ) {
        return res.status( 400 ).json( {
            success: false,
            message: "Password must contain 8 or more characters and at most 72 UTF-8 bytes"
        } );
    }

    if (
        !mongoose.Types.ObjectId.isValid( departmentId ) ||
        ( managerId && !mongoose.Types.ObjectId.isValid( managerId ) )
    ) {
        return res.status( 400 ).json( {
            success: false,
            message: "Invalid department or manager ID"
        } );
    }

    if ( Number.isNaN( joiningDate.getTime() ) ) {
        return res.status( 400 ).json( {
            success: false,
            message: "Invalid joining date"
        } );
    }

    const allowedEmploymentTypes = [
        "FULL_TIME",
        "PART_TIME",
        "CONTRACT",
        "INTERN"
    ];

    const allowedWorkModes = [
        "ONSITE",
        "REMOTE",
        "HYBRID"
    ];

    if (
        !allowedEmploymentTypes.includes( employmentType ) ||
        !allowedWorkModes.includes( workMode )
    ) {
        return res.status( 400 ).json( {
            success: false,
            message: "Invalid employment type or work mode"
        } );
    }

    // Validate skills
    if ( body.skills !== undefined && !Array.isArray( body.skills ) ) {
        return res.status( 400 ).json( {
            success: false,
            message: "Skills must be an array"
        } );
    }

    const skills = [];

    for ( const skill of body.skills || [] ) {
        const skillName =
            typeof skill?.name === "string" ? skill.name.trim() : "";

        const proficiencyLevel = Number( skill?.proficiencyLevel );

        const yearsOfExperience =
            skill?.yearsOfExperience == null
                ? 0
                : Number( skill.yearsOfExperience );

        if (
            !skillName ||
            !Number.isInteger( proficiencyLevel ) ||
            proficiencyLevel < 1 ||
            proficiencyLevel > 5 ||
            !Number.isFinite( yearsOfExperience ) ||
            yearsOfExperience < 0
        ) {
            return res.status( 400 ).json( {
                success: false,
                message: "Each skill needs a name, proficiency level from 1 to 5, and valid experience"
            } );
        }

        skills.push( {
            name: skillName,
            proficiencyLevel,
            yearsOfExperience
        } );
    }

    // Validate capacity
    const capacityInput = body.capacity || {};

    const weeklyHours =
        capacityInput.weeklyHours == null
            ? 40
            : Number( capacityInput.weeklyHours );

    const maxConcurrentTasks =
        capacityInput.maxConcurrentTasks == null
            ? 5
            : Number( capacityInput.maxConcurrentTasks );

    if (
        !Number.isFinite( weeklyHours ) ||
        weeklyHours < 0 ||
        weeklyHours > 168 ||
        !Number.isInteger( maxConcurrentTasks ) ||
        maxConcurrentTasks < 1
    ) {
        return res.status( 400 ).json( {
            success: false,
            message: "Invalid employee capacity"
        } );
    }

    try {
        // Reject duplicate account emails
        const existingUser = await userModel.findOne( { email } ).select( "_id" );

        if ( existingUser ) {
            return res.status( 409 ).json( {
                success: false,
                message: "A user account with this email already exists"
            } );
        }

        // Reject duplicate employee codes
        const existingEmployee = await employeeModel.findOne( {
            employeeCode
        } ).select( "_id" );

        if ( existingEmployee ) {
            return res.status( 409 ).json( {
                success: false,
                message: "This employee code already exists"
            } );
        }

        // Department must exist and be active
        const department = await departmentModel.findOne( {
            _id: departmentId,
            isActive: true
        } ).select( "_id name" );

        if ( !department ) {
            return res.status( 404 ).json( {
                success: false,
                message: "Department not found or inactive"
            } );
        }

        // Validate the manager if one was provided.
        // managerId references an Employee document, not a User document.
        if ( managerId ) {
            const manager = await employeeModel.findOne( {
                _id: managerId,
                employmentStatus: "ACTIVE"
            } ).select( "_id" );

            if ( !manager ) {
                return res.status( 400 ).json( {
                    success: false,
                    message: "Manager does not exist or is not active"
                } );
            }
        }

        // Hash the password before storing it
        const passwordHash = await bcrypt.hash( password, 10 );

        // Create User and Employee in one transaction
        const session = await mongoose.startSession();

        let createdUser;
        let createdEmployee;

        try {
            await session.withTransaction( async () => {
                const users = await userModel.create(
                    [{
                        name,
                        email,
                        password: passwordHash,
                        role: "EMPLOYEE"
                    }],
                    { session }
                );

                createdUser = users[0];

                const employees = await employeeModel.create(
                    [{
                        userId: createdUser._id,
                        employeeCode,
                        departmentId,
                        managerId,
                        designation,
                        employmentType,
                        employmentStatus: "ACTIVE",
                        joiningDate,
                        workMode,
                        skills,
                        capacity: {
                            weeklyHours,
                            maxConcurrentTasks
                        },
                        profile: {
                            bio: typeof body.profile?.bio === "string"
                                ? body.profile.bio.trim()
                                : "",
                            location: typeof body.profile?.location === "string"
                                ? body.profile.location.trim()
                                : ""
                        },
                        createdBy: req.user.id
                    }],
                    { session }
                );

                createdEmployee = employees[0];
            } );
        } finally {
            await session.endSession();
        }

        return res.status( 201 ).json( {
            success: true,
            message: "Employee created successfully",
            data: {
                user: {
                    id: createdUser._id,
                    name: createdUser.name,
                    email: createdUser.email,
                    role: createdUser.role
                },
                employee: {
                    id: createdEmployee._id,
                    employeeCode: createdEmployee.employeeCode,
                    department: {
                        id: department._id,
                        name: department.name
                    },
                    designation: createdEmployee.designation,
                    employmentStatus: createdEmployee.employmentStatus,
                    skills: createdEmployee.skills,
                    capacity: createdEmployee.capacity
                }
            }
        } );
    } catch ( error ) {
        if ( error.code === 11000 ) {
            return res.status( 409 ).json( {
                success: false,
                message: "An account or employee record with these unique details already exists"
            } );
        }

        if (
            error.name === "ValidationError" ||
            error.name === "CastError"
        ) {
            return res.status( 400 ).json( {
                success: false,
                message: "Invalid employee data"
            } );
        }

        console.error( "Register employee failed:", error );

        return res.status( 500 ).json( {
            success: false,
            message: "Unable to create employee"
        } );
    }
};



const handleError = (res, error) => {
    if (error.code === 11000) {
        return res.status(409).json({
            message: "A record with these details already exists"
        });
    }

    if (["CastError", "ValidationError"].includes(error.name)) {
        return res.status(400).json({
            message: "Invalid data provided"
        });
    }

    console.error(error);
    return res.status(500).json({
        message: "Internal server error"
    });
};

// GET all employees — Admin
const getAllEmployees = async (req, res) => {
    try {
        const employees = await employeeModel.find()
            .populate("userId", "name email role")
            .populate("departmentId", "name code")
            .populate("managerId", "employeeCode designation")
            .sort({ createdAt: -1 });

        return res.status(200).json({ employees });
    } catch (error) {
        return handleError(res, error);
    }
};

// GET my profile — Employee
const getMyProfile = async (req, res) => {
    try {
        if (req.user.role !== "EMPLOYEE") {
            return res.status(403).json({
                message: "Employee access required"
            });
        }

        const employee = await employeeModel.findOne({
            userId: req.user.id
        })
            .populate("userId", "name email")
            .populate("departmentId", "name code")
            .populate("managerId", "employeeCode designation");

        if (!employee) {
            return res.status(404).json({
                message: "Employee profile not found"
            });
        }

        return res.status(200).json({ employee });
    } catch (error) {
        return handleError(res, error);
    }
};

// GET employee by ID — Admin or own profile
const getEmployeeById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                message: "Invalid employee ID"
            });
        }

        const employee = await employeeModel.findById(id);

        if (!employee) {
            return res.status(404).json({
                message: "Employee not found"
            });
        }

        if (
            req.user.role !== "ADMIN" &&
            employee.userId.toString() !== req.user.id
        ) {
            return res.status(403).json({
                message: "Access denied"
            });
        }

        await employee.populate([
            { path: "userId", select: "name email role" },
            { path: "departmentId", select: "name code" },
            { path: "managerId", select: "employeeCode designation" }
        ]);

        return res.status(200).json({ employee });
    } catch (error) {
        return handleError(res, error);
    }
};

// PUT employee details — Admin
const updateEmployee = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                message: "Invalid employee ID"
            });
        }

        const allowedFields = [
            "employeeCode",
            "departmentId",
            "managerId",
            "designation",
            "employmentType",
            "employmentStatus",
            "joiningDate",
            "endDate",
            "workMode",
            "skills",
            "capacity",
            "profile"
        ];

        const updates = {};

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        }

        if (typeof updates.employeeCode === "string") {
            updates.employeeCode =
                updates.employeeCode.trim().toUpperCase();
        }

        if (typeof updates.designation === "string") {
            updates.designation = updates.designation.trim();
        }

        if (
            updates.departmentId &&
            !mongoose.isValidObjectId(updates.departmentId)
        ) {
            return res.status(400).json({
                message: "Invalid department ID"
            });
        }

        if (updates.departmentId) {
            const department = await departmentModel.findOne({
                _id: updates.departmentId,
                isActive: true
            });

            if (!department) {
                return res.status(400).json({
                    message: "Department not found or inactive"
                });
            }
        }

        if (updates.managerId) {
            if (!mongoose.isValidObjectId(updates.managerId)) {
                return res.status(400).json({
                    message: "Invalid manager ID"
                });
            }

            const manager = await employeeModel.findOne({
                _id: updates.managerId,
                employmentStatus: "ACTIVE"
            });

            if (!manager) {
                return res.status(400).json({
                    message: "Manager not found or inactive"
                });
            }
        }

        const employee = await employeeModel.findByIdAndUpdate(
            id,
            {
                $set: {
                    ...updates,
                    updatedBy: req.user.id
                }
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!employee) {
            return res.status(404).json({
                message: "Employee not found"
            });
        }

        return res.status(200).json({
            message: "Employee updated successfully",
            employee
        });
    } catch (error) {
        return handleError(res, error);
    }
};

// PATCH deactivate employee — Admin
const deactivateEmployee = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                message: "Invalid employee ID"
            });
        }

        const employee = await employeeModel.findById(id);

        if (!employee) {
            return res.status(404).json({
                message: "Employee not found"
            });
        }

        if (employee.employmentStatus === "TERMINATED") {
            return res.status(409).json({
                message: "Terminated employee cannot be deactivated"
            });
        }

        employee.employmentStatus = "INACTIVE";
        employee.updatedBy = req.user.id;
        await employee.save();

        await userModel.findByIdAndUpdate(employee.userId, {
            status: "SUSPENDED"
        });

        return res.status(200).json({
            message: "Employee deactivated successfully"
        });
    } catch (error) {
        return handleError(res, error);
    }
};

// PATCH activate employee — Admin
const activateEmployee = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                message: "Invalid employee ID"
            });
        }

        const employee = await employeeModel.findById(id);

        if (!employee) {
            return res.status(404).json({
                message: "Employee not found"
            });
        }

        if (employee.employmentStatus === "TERMINATED") {
            return res.status(409).json({
                message: "Terminated employee cannot be reactivated"
            });
        }

        employee.employmentStatus = "ACTIVE";
        employee.updatedBy = req.user.id;
        await employee.save();

        await userModel.findByIdAndUpdate(employee.userId, {
            status: "ACTIVE"
        });

        return res.status(200).json({
            message: "Employee activated successfully"
        });
    } catch (error) {
        return handleError(res, error);
    }
};

module.exports = {
    registerEmployee ,
    getAllEmployees,
    getMyProfile,
    getEmployeeById,
    updateEmployee,
    deactivateEmployee,
    activateEmployee
};

