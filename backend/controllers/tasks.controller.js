
const mongoose = require("mongoose");

const taskModel = require("../models/task.model");
const employeeModel = require("../models/employee.model");
const departmentModel = require("../models/department.model");

const STATUSES = [
    "TODO",
    "IN_PROGRESS",
    "BLOCKED",
    "IN_REVIEW",
    "COMPLETED",
    "CANCELLED"
];

const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"];

const EMPLOYEE_STATUSES = [
    "IN_PROGRESS",
    "BLOCKED",
    "IN_REVIEW"
];

// Shared error handling
const asyncHandler = (controller) => async (req, res) => {
    try {
        await controller(req, res);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                message: "A record with these unique details already exists"
            });
        }

        if (
            error.name === "ValidationError" ||
            error.name === "CastError"
        ) {
            return res.status(400).json({
                message: "Invalid data provided"
            });
        }

        console.error("Task controller error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

// Shared ID validation
const isValidId = (id) => mongoose.isValidObjectId(id);

// Shared population for task responses
const populateTask = (query) => query
    .populate("createdBy", "name email")
    .populate({
        path: "assignedTo",
        select: "employeeCode designation employmentStatus userId",
        populate: {
            path: "userId",
            select: "name email"
        }
    })
    .populate("departmentId", "name code");

// Shared pagination
const getPagination = (query) => {
    const requestedPage = Number.parseInt(query.page, 10) || 1;
    const requestedLimit = Number.parseInt(query.limit, 10) || 20;

    const page = Math.max(1, requestedPage);
    const limit = Math.min(100, Math.max(1, requestedLimit));

    return {
        page,
        limit,
        skip: (page - 1) * limit
    };
};

// Shared skills validation
const normalizeSkills = (skills) => {
    if (!Array.isArray(skills)) {
        return { error: "skillsRequired must be an array" };
    }

    const result = [];

    for (const skill of skills) {
        const name =
            typeof skill?.name === "string"
                ? skill.name.trim()
                : "";

        const minimumLevel =
            skill?.minimumLevel == null
                ? 1
                : Number(skill.minimumLevel);

        if (
            !name ||
            !Number.isInteger(minimumLevel) ||
            minimumLevel < 1 ||
            minimumLevel > 5
        ) {
            return {
                error: "Each required skill needs a name and level from 1 to 5"
            };
        }

        result.push({ name, minimumLevel });
    }

    return { value: result };
};

// Shared tags validation
const normalizeTags = (tags) => {
    if (!Array.isArray(tags)) {
        return { error: "tags must be an array" };
    }

    if (tags.some(tag => typeof tag !== "string" || !tag.trim())) {
        return { error: "Each tag must be a non-empty string" };
    }

    return {
        value: [...new Set(tags.map(tag => tag.trim()))]
    };
};

// POST /api/tasks — Admin creates a task
const createTask = asyncHandler(async (req, res) => {
    const body = req.body || {};

    const title =
        typeof body.title === "string" ? body.title.trim() : "";

    const description =
        typeof body.description === "string"
            ? body.description.trim()
            : "";

    const { departmentId } = body;

    const priority =
        typeof body.priority === "string"
            ? body.priority.trim().toUpperCase()
            : "MEDIUM";

    const estimatedHours = Number(body.estimatedHours);

    const startDate = body.startDate
        ? new Date(body.startDate)
        : new Date();

    const dueDate = body.dueDate
        ? new Date(body.dueDate)
        : null;

    if (!req.user?.id || req.user.role !== "ADMIN") {
        return res.status(403).json({
            message: "Admin access required"
        });
    }

    if (!title || title.length > 150) {
        return res.status(400).json({
            message: "A valid task title is required"
        });
    }

    if (description.length > 2000) {
        return res.status(400).json({
            message: "Description must not exceed 2000 characters"
        });
    }

    if (!isValidId(departmentId)) {
        return res.status(400).json({
            message: "Valid department ID is required"
        });
    }

    if (!PRIORITIES.includes(priority)) {
        return res.status(400).json({
            message: "Invalid task priority"
        });
    }

    if (
        !Number.isFinite(estimatedHours) ||
        estimatedHours <= 0
    ) {
        return res.status(400).json({
            message: "Estimated hours must be greater than zero"
        });
    }

    if (
        Number.isNaN(startDate.getTime()) ||
        !dueDate ||
        Number.isNaN(dueDate.getTime()) ||
        dueDate < startDate
    ) {
        return res.status(400).json({
            message: "Valid dates are required, and dueDate cannot precede startDate"
        });
    }

    const skillsResult = normalizeSkills(
        body.skillsRequired ?? []
    );

    if (skillsResult.error) {
        return res.status(400).json({
            message: skillsResult.error
        });
    }

    const tagsResult = normalizeTags(body.tags ?? []);

    if (tagsResult.error) {
        return res.status(400).json({
            message: tagsResult.error
        });
    }

    const department = await departmentModel.findOne({
        _id: departmentId,
        isActive: true
    });

    if (!department) {
        return res.status(404).json({
            message: "Department not found or inactive"
        });
    }

    const task = await taskModel.create({
        title,
        description,
        createdBy: req.user.id,
        updatedBy: req.user.id,
        assignedTo: null,
        departmentId,
        priority,
        startDate,
        dueDate,
        estimatedHours,
        skillsRequired: skillsResult.value,
        tags: tagsResult.value
    });

    const populatedTask = await populateTask(
        taskModel.findById(task._id)
    );

    return res.status(201).json({
        message: "Task created successfully",
        task: populatedTask
    });
});

// GET /api/tasks — Admin lists and filters tasks
const getAllTasks = asyncHandler(async (req, res) => {
    const filter = {};

    if (req.query.status) {
        if (!STATUSES.includes(req.query.status)) {
            return res.status(400).json({
                message: "Invalid task status filter"
            });
        }

        filter.status = req.query.status;
    }

    if (req.query.priority) {
        if (!PRIORITIES.includes(req.query.priority)) {
            return res.status(400).json({
                message: "Invalid task priority filter"
            });
        }

        filter.priority = req.query.priority;
    }

    for (const field of ["departmentId", "assignedTo"]) {
        if (req.query[field]) {
            if (!isValidId(req.query[field])) {
                return res.status(400).json({
                    message: `Invalid ${field}`
                });
            }

            filter[field] = req.query[field];
        }
    }

    const { page, limit, skip } = getPagination(req.query);

    const [tasks, total] = await Promise.all([
        populateTask(
            taskModel.find(filter)
                .sort({ dueDate: 1, createdAt: -1 })
                .skip(skip)
                .limit(limit)
        ),
        taskModel.countDocuments(filter)
    ]);

    return res.status(200).json({
        tasks,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    });
});

// GET /api/tasks/me — Employee views assigned tasks
const getMyTasks = asyncHandler(async (req, res) => {
    const employee = await employeeModel.findOne({
        userId: req.user.id
    });

    if (
        !employee ||
        ["INACTIVE", "TERMINATED"].includes(employee.employmentStatus)
    ) {
        return res.status(404).json({
            message: "Active employee profile not found"
        });
    }

    const filter = { assignedTo: employee._id };

    if (req.query.status) {
        if (!STATUSES.includes(req.query.status)) {
            return res.status(400).json({
                message: "Invalid task status filter"
            });
        }

        filter.status = req.query.status;
    }

    const { page, limit, skip } = getPagination(req.query);

    const [tasks, total] = await Promise.all([
        populateTask(
            taskModel.find(filter)
                .sort({ dueDate: 1 })
                .skip(skip)
                .limit(limit)
        ),
        taskModel.countDocuments(filter)
    ]);

    return res.status(200).json({
        tasks,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    });
});

// GET /api/tasks/:id — Admin or assigned employee
const getTaskById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!isValidId(id)) {
        return res.status(400).json({
            message: "Invalid task ID"
        });
    }

    const task = await taskModel.findById(id);

    if (!task) {
        return res.status(404).json({
            message: "Task not found"
        });
    }

    if (req.user.role !== "ADMIN") {
        const employee = await employeeModel.findOne({
            userId: req.user.id
        });

        if (
            !employee ||
            ["INACTIVE", "TERMINATED"].includes(employee.employmentStatus) ||
            !task.assignedTo ||
            task.assignedTo.toString() !== employee._id.toString()
        ) {
            return res.status(403).json({
                message: "You cannot access this task"
            });
        }
    }

    const populatedTask = await populateTask(
        taskModel.findById(id)
    );

    return res.status(200).json({
        task: populatedTask
    });
});

// PUT /api/tasks/:id — Admin updates task details
const updateTask = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const body = req.body || {};

    if (!isValidId(id)) {
        return res.status(400).json({
            message: "Invalid task ID"
        });
    }

    const task = await taskModel.findById(id);

    if (!task) {
        return res.status(404).json({
            message: "Task not found"
        });
    }

    // Assignment and status have their own dedicated endpoints.
    const protectedFields = [
        "assignedTo",
        "status",
        "createdBy",
        "completedAt",
        "updatedBy"
    ];

    if (protectedFields.some(field => body[field] !== undefined)) {
        return res.status(400).json({
            message: "Use the dedicated assignment or status endpoint for these fields"
        });
    }

    const allowedFields = [
        "title",
        "description",
        "departmentId",
        "priority",
        "startDate",
        "dueDate",
        "estimatedHours",
        "skillsRequired",
        "tags"
    ];

    const unknownFields = Object.keys(body).filter(
        field => !allowedFields.includes(field)
    );

    if (unknownFields.length) {
        return res.status(400).json({
            message: "Request contains unsupported fields",
            fields: unknownFields
        });
    }

    if (!Object.keys(body).length) {
        return res.status(400).json({
            message: "Provide at least one field to update"
        });
    }

    const updates = {};

    if (body.title !== undefined) {
        if (
            typeof body.title !== "string" ||
            !body.title.trim() ||
            body.title.trim().length > 150
        ) {
            return res.status(400).json({
                message: "Invalid task title"
            });
        }

        updates.title = body.title.trim();
    }

    if (body.description !== undefined) {
        if (
            typeof body.description !== "string" ||
            body.description.trim().length > 2000
        ) {
            return res.status(400).json({
                message: "Invalid task description"
            });
        }

        updates.description = body.description.trim();
    }

    if (body.priority !== undefined) {
        const priority =
            typeof body.priority === "string"
                ? body.priority.trim().toUpperCase()
                : "";

        if (!PRIORITIES.includes(priority)) {
            return res.status(400).json({
                message: "Invalid task priority"
            });
        }

        updates.priority = priority;
    }

    if (body.departmentId !== undefined) {
        if (!isValidId(body.departmentId)) {
            return res.status(400).json({
                message: "Invalid department ID"
            });
        }

        const department = await departmentModel.findOne({
            _id: body.departmentId,
            isActive: true
        });

        if (!department) {
            return res.status(404).json({
                message: "Department not found or inactive"
            });
        }

        updates.departmentId = body.departmentId;
    }

    for (const field of ["startDate", "dueDate"]) {
        if (body[field] !== undefined) {
            const date = new Date(body[field]);

            if (Number.isNaN(date.getTime())) {
                return res.status(400).json({
                    message: `Invalid ${field}`
                });
            }

            updates[field] = date;
        }
    }

    const effectiveStartDate = updates.startDate || task.startDate;
    const effectiveDueDate = updates.dueDate || task.dueDate;

    if (effectiveDueDate < effectiveStartDate) {
        return res.status(400).json({
            message: "Due date cannot precede start date"
        });
    }

    if (body.estimatedHours !== undefined) {
        const hours = Number(body.estimatedHours);

        if (!Number.isFinite(hours) || hours <= 0) {
            return res.status(400).json({
                message: "Estimated hours must be greater than zero"
            });
        }

        updates.estimatedHours = hours;
    }

    if (body.skillsRequired !== undefined) {
        const result = normalizeSkills(body.skillsRequired);

        if (result.error) {
            return res.status(400).json({
                message: result.error
            });
        }

        updates.skillsRequired = result.value;
    }

    if (body.tags !== undefined) {
        const result = normalizeTags(body.tags);

        if (result.error) {
            return res.status(400).json({
                message: result.error
            });
        }

        updates.tags = result.value;
    }

    updates.updatedBy = req.user.id;

    await taskModel.findByIdAndUpdate(
        id,
        { $set: updates },
        { new: true, runValidators: true }
    );

    const updatedTask = await populateTask(
        taskModel.findById(id)
    );

    return res.status(200).json({
        message: "Task updated successfully",
        task: updatedTask
    });
});

// PATCH /api/tasks/:id/assign — Admin assigns a task
const assignTask = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { employeeId } = req.body || {};

    if (!isValidId(id) || !isValidId(employeeId)) {
        return res.status(400).json({
            message: "Valid task ID and employee ID are required"
        });
    }

    const task = await taskModel.findById(id);

    if (!task) {
        return res.status(404).json({
            message: "Task not found"
        });
    }

    if (["COMPLETED", "CANCELLED"].includes(task.status)) {
        return res.status(409).json({
            message: "Completed or cancelled tasks cannot be assigned"
        });
    }

    const employee = await employeeModel.findOne({
        _id: employeeId,
        employmentStatus: "ACTIVE"
    });

    if (!employee) {
        return res.status(404).json({
            message: "Active employee not found"
        });
    }

    task.assignedTo = employee._id;
    task.updatedBy = req.user.id;

    await task.save();

    const populatedTask = await populateTask(
        taskModel.findById(task._id)
    );

    return res.status(200).json({
        message: "Task assigned successfully",
        task: populatedTask
    });
});

// PATCH /api/tasks/:id/status — Admin or assigned employee
const updateTaskStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status, progressPercentage } = req.body || {};

    if (!isValidId(id)) {
        return res.status(400).json({
            message: "Invalid task ID"
        });
    }

    if (!STATUSES.includes(status)) {
        return res.status(400).json({
            message: "Invalid task status"
        });
    }

    if (
        progressPercentage !== undefined &&
        (
            !Number.isFinite(Number(progressPercentage)) ||
            Number(progressPercentage) < 0 ||
            Number(progressPercentage) > 100
        )
    ) {
        return res.status(400).json({
            message: "Progress must be between 0 and 100"
        });
    }

    const task = await taskModel.findById(id);

    if (!task) {
        return res.status(404).json({
            message: "Task not found"
        });
    }

    if (req.user.role !== "ADMIN") {
        if (!EMPLOYEE_STATUSES.includes(status)) {
            return res.status(403).json({
                message: "Employees cannot set this task status"
            });
        }

        if (["COMPLETED", "CANCELLED"].includes(task.status)) {
            return res.status(409).json({
                message: "This task is already closed"
            });
        }

        const employee = await employeeModel.findOne({
            userId: req.user.id
        });

        if (
            !employee ||
            ["INACTIVE", "TERMINATED"].includes(employee.employmentStatus) ||
            !task.assignedTo ||
            task.assignedTo.toString() !== employee._id.toString()
        ) {
            return res.status(403).json({
                message: "Only the assigned employee can update this task"
            });
        }
    }

    task.status = status;
    task.updatedBy = req.user.id;

    if (status === "COMPLETED") {
        task.progressPercentage = 100;
        task.completedAt = new Date();
    } else if (status === "IN_REVIEW") {
        task.progressPercentage = 100;
        task.completedAt = null;
    } else if (status === "TODO") {
        task.progressPercentage = 0;
        task.completedAt = null;
    } else {
        task.completedAt = null;

        if (progressPercentage !== undefined) {
            task.progressPercentage = Number(progressPercentage);
        }
    }

    await task.save();

    const populatedTask = await populateTask(
        taskModel.findById(task._id)
    );

    return res.status(200).json({
        message: "Task status updated successfully",
        task: populatedTask
    });
});

module.exports = {
    createTask,
    getAllTasks,
    getMyTasks,
    getTaskById,
    updateTask,
    assignTask,
    updateTaskStatus
};
