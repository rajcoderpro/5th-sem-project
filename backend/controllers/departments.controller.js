
const mongoose = require("mongoose");
const departmentModel = require("../models/department.model");

const handleError = (res, error) => {
    if (error.code === 11000) {
        return res.status(409).json({
            message: "A department with this name or code already exists"
        });
    }

    if (
        error.name === "ValidationError" ||
        error.name === "CastError"
    ) {
        return res.status(400).json({
            message: "Invalid department data"
        });
    }

    console.error("Department controller error:", error);

    return res.status(500).json({
        message: "Internal server error"
    });
};

const normalizeDepartmentInput = (body = {}) => ({
    name: typeof body.name === "string"
        ? body.name.trim()
        : "",

    code: typeof body.code === "string"
        ? body.code.trim().toUpperCase()
        : "",

    description: typeof body.description === "string"
        ? body.description.trim()
        : ""
});

// POST /api/departments
const registerDepartment = async (req, res) => {
    try {
        if (!req.user?.id) {
            return res.status(401).json({
                message: "Unauthorized access"
            });
        }

        const { name, code, description } =
            normalizeDepartmentInput(req.body);

        if (!name || !code) {
            return res.status(400).json({
                message: "Department name and code are required"
            });
        }

        if (name.length > 80 || code.length > 10 || description.length > 500) {
            return res.status(400).json({
                message: "Department details exceed allowed length"
            });
        }

        const existing = await departmentModel.findOne({
            $or: [
                { name },
                { code }
            ]
        });

        if (existing) {
            return res.status(409).json({
                message: "A department with this name or code already exists"
            });
        }

        const department = await departmentModel.create({
            name,
            code,
            description,
            createdBy: req.user.id
        });

        return res.status(201).json({
            message: "Department created successfully",
            department
        });
    } catch (error) {
        return handleError(res, error);
    }
};

// GET /api/departments
const getAllDepartments = async (req, res) => {
    try {
        const departments = await departmentModel
            .find()
            .populate("managerId", "name email")
            .populate("createdBy", "name email")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Departments fetched successfully",
            departments
        });
    } catch (error) {
        return handleError(res, error);
    }
};

// GET /api/departments/:id
const getDepartmentById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                message: "Invalid department ID"
            });
        }

        const department = await departmentModel
            .findById(id)
            .populate("managerId", "name email")
            .populate("createdBy", "name email");

        if (!department) {
            return res.status(404).json({
                message: "Department not found"
            });
        }

        return res.status(200).json({
            message: "Department fetched successfully",
            department
        });
    } catch (error) {
        return handleError(res, error);
    }
};

// PUT /api/departments/:id
const updateDepartment = async (req, res) => {
    try {
        const { id } = req.params;

        if (!req.user?.id) {
            return res.status(401).json({
                message: "Unauthorized access"
            });
        }

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                message: "Invalid department ID"
            });
        }

        const { name, code, description } =
            normalizeDepartmentInput(req.body);

        if (!name || !code) {
            return res.status(400).json({
                message: "Department name and code are required"
            });
        }

        if (name.length > 80 || code.length > 10 || description.length > 500) {
            return res.status(400).json({
                message: "Department details exceed allowed length"
            });
        }

        const existing = await departmentModel.findOne({
            _id: { $ne: id },
            $or: [
                { name },
                { code }
            ]
        });

        if (existing) {
            return res.status(409).json({
                message: "Another department already uses this name or code"
            });
        }

        const department = await departmentModel.findByIdAndUpdate(
            id,
            {
                $set: {
                    name,
                    code,
                    description
                }
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!department) {
            return res.status(404).json({
                message: "Department not found"
            });
        }

        return res.status(200).json({
            message: "Department updated successfully",
            department
        });
    } catch (error) {
        return handleError(res, error);
    }
};

// PATCH /api/departments/:id/deactivate
const deactivateDepartment = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                message: "Invalid department ID"
            });
        }

        const department = await departmentModel.findByIdAndUpdate(
            id,
            {
                $set: {
                    isActive: false
                }
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!department) {
            return res.status(404).json({
                message: "Department not found"
            });
        }

        return res.status(200).json({
            message: "Department deactivated successfully",
            department
        });
    } catch (error) {
        return handleError(res, error);
    }
};

// PATCH /api/departments/:id/activate
const activateDepartment = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                message: "Invalid department ID"
            });
        }

        const department = await departmentModel.findByIdAndUpdate(
            id,
            {
                $set: {
                    isActive: true
                }
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!department) {
            return res.status(404).json({
                message: "Department not found"
            });
        }

        return res.status(200).json({
            message: "Department activated successfully",
            department
        });
    } catch (error) {
        return handleError(res, error);
    }
};

module.exports = {
    registerDepartment,
    getAllDepartments,
    getDepartmentById,
    updateDepartment,
    deactivateDepartment,
    activateDepartment
};
