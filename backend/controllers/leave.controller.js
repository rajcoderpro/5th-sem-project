
const mongoose = require("mongoose");

const leaveModel = require("../models/leave.model");
const employeeModel = require("../models/employee.model");

const LEAVE_TYPES = [
    "CASUAL",
    "SICK",
    "EARNED",
    "UNPAID",
    "OTHER",
];

const LEAVE_STATUSES = [
    "PENDING",
    "APPROVED",
    "REJECTED",
    "CANCELLED",
];

const ACTIVE_LEAVE_STATUSES = [
    "PENDING",
    "APPROVED",
];

// Shared error handler
const handleError = (res, error) => {
    if (error.code === 11000) {
        return res.status(409).json({
            message: "A duplicate record already exists",
        });
    }

    if (
        error.name === "ValidationError" ||
        error.name === "CastError"
    ) {
        return res.status(400).json({
            message: "Invalid leave data provided",
        });
    }

    console.error("Leave controller error:", error);

    return res.status(500).json({
        message: "Internal server error",
    });
};

// Async controller wrapper
const asyncHandler = (controller) => {
    return async (req, res) => {
        try {
            await controller(req, res);
        } catch (error) {
            return handleError(res, error);
        }
    };
};

// Validate MongoDB ID
const isValidId = (id) => {
    return mongoose.isValidObjectId(id);
};

// Parse YYYY-MM-DD without timezone shifting
const parseDateOnly = (value) => {
    if (
        typeof value !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(value)
    ) {
        return null;
    }

    const date = new Date(`${value}T00:00:00.000Z`);

    if (
        Number.isNaN(date.getTime()) ||
        date.toISOString().slice(0, 10) !== value
    ) {
        return null;
    }

    return date;
};

// Shared pagination
const getPagination = (query) => {
    const requestedPage = Number.parseInt(query.page, 10) || 1;
    const requestedLimit = Number.parseInt(query.limit, 10) || 10;

    const page = Math.max(1, requestedPage);
    const limit = Math.min(100, Math.max(1, requestedLimit));

    return {
        page,
        limit,
        skip: (page - 1) * limit,
    };
};

// Find employee profile using logged-in User ID
const getEmployeeForUser = async (userId) => {
    const employee = await employeeModel.findOne({
        userId,
    });

    if (
        !employee ||
        ["INACTIVE", "TERMINATED"].includes(
            employee.employmentStatus
        )
    ) {
        return null;
    }

    return employee;
};

// Shared leave population
const populateLeave = (query) => {
    return query
        .populate({
            path: "employeeId",
            select: "employeeCode designation employmentStatus userId departmentId",
            populate: [
                {
                    path: "userId",
                    select: "name email",
                },
                {
                    path: "departmentId",
                    select: "name code",
                },
            ],
        })
        .populate("reviewedBy", "name email");
};

// POST /api/leaves
// Employee applies for leave
const applyForLeave = asyncHandler(async (req, res) => {
    const employee = await getEmployeeForUser(req.user.id);

    if (!employee) {
        return res.status(404).json({
            message: "Active employee profile not found",
        });
    }

    const body = req.body || {};

    const leaveType =
        typeof body.leaveType === "string"
            ? body.leaveType.trim().toUpperCase()
            : "";

    const reason =
        typeof body.reason === "string"
            ? body.reason.trim()
            : "";

    const startDate = parseDateOnly(body.startDate);
    const endDate = parseDateOnly(body.endDate);

    if (
        !leaveType ||
        !body.startDate ||
        !body.endDate ||
        !reason
    ) {
        return res.status(400).json({
            message: "Leave type, dates and reason are required",
        });
    }

    if (!LEAVE_TYPES.includes(leaveType)) {
        return res.status(400).json({
            message: "Invalid leave type",
        });
    }

    if (!startDate || !endDate) {
        return res.status(400).json({
            message: "Invalid date format. Use YYYY-MM-DD",
        });
    }

    if (endDate < startDate) {
        return res.status(400).json({
            message: "End date cannot be before start date",
        });
    }

    if (reason.length > 1000) {
        return res.status(400).json({
            message: "Reason cannot exceed 1000 characters",
        });
    }

    // Check for overlapping pending or approved leave
    const overlappingLeave = await leaveModel.findOne({
        employeeId: employee._id,
        status: {
            $in: ACTIVE_LEAVE_STATUSES,
        },
        startDate: {
            $lte: endDate,
        },
        endDate: {
            $gte: startDate,
        },
    }).select("_id leaveType startDate endDate status");

    if (overlappingLeave) {
        return res.status(409).json({
            message: "You already have a pending or approved leave request overlapping these dates",
            conflictingLeave: overlappingLeave,
        });
    }

    const leave = await leaveModel.create({
        employeeId: employee._id,
        leaveType,
        startDate,
        endDate,
        reason,
    });

    const populatedLeave = await populateLeave(
        leaveModel.findById(leave._id)
    );

    return res.status(201).json({
        message: "Leave request submitted successfully",
        leave: populatedLeave,
    });
});

// GET /api/leaves/me
// Employee views own leave history
const getMyLeaves = asyncHandler(async (req, res) => {
    const employee = await getEmployeeForUser(req.user.id);

    if (!employee) {
        return res.status(404).json({
            message: "Employee profile not found",
        });
    }

    const filter = {
        employeeId: employee._id,
    };

    if (req.query.status) {
        const status = req.query.status.toUpperCase();

        if (!LEAVE_STATUSES.includes(status)) {
            return res.status(400).json({
                message: "Invalid leave status filter",
            });
        }

        filter.status = status;
    }

    if (req.query.leaveType) {
        const leaveType = req.query.leaveType.toUpperCase();

        if (!LEAVE_TYPES.includes(leaveType)) {
            return res.status(400).json({
                message: "Invalid leave type filter",
            });
        }

        filter.leaveType = leaveType;
    }

    const { page, limit, skip } = getPagination(req.query);

    const [leaves, total] = await Promise.all([
        populateLeave(
            leaveModel.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
        ),
        leaveModel.countDocuments(filter),
    ]);

    return res.status(200).json({
        message: "Leave history fetched successfully",
        leaves,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    });
});

// GET /api/leaves
// Admin views all employee leave requests
const getAllLeaves = asyncHandler(async (req, res) => {
    const filter = {};

    if (req.query.status) {
        const status = req.query.status.toUpperCase();

        if (!LEAVE_STATUSES.includes(status)) {
            return res.status(400).json({
                message: "Invalid leave status filter",
            });
        }

        filter.status = status;
    }

    if (req.query.leaveType) {
        const leaveType = req.query.leaveType.toUpperCase();

        if (!LEAVE_TYPES.includes(leaveType)) {
            return res.status(400).json({
                message: "Invalid leave type filter",
            });
        }

        filter.leaveType = leaveType;
    }

    if (req.query.employeeId) {
        if (!isValidId(req.query.employeeId)) {
            return res.status(400).json({
                message: "Invalid employee ID",
            });
        }

        filter.employeeId = req.query.employeeId;
    }

    // Optional date-window filter.
    // Returns leaves which overlap the requested date range.
    if (req.query.fromDate || req.query.toDate) {
        const fromDate = req.query.fromDate
            ? parseDateOnly(req.query.fromDate)
            : null;

        const toDate = req.query.toDate
            ? parseDateOnly(req.query.toDate)
            : null;

        if (
            (req.query.fromDate && !fromDate) ||
            (req.query.toDate && !toDate)
        ) {
            return res.status(400).json({
                message: "Invalid date filter. Use YYYY-MM-DD",
            });
        }

        if (fromDate && toDate && toDate < fromDate) {
            return res.status(400).json({
                message: "toDate cannot be before fromDate",
            });
        }

        if (toDate) {
            filter.startDate = {
                $lte: toDate,
            };
        }

        if (fromDate) {
            filter.endDate = {
                $gte: fromDate,
            };
        }
    }

    const { page, limit, skip } = getPagination(req.query);

    const [leaves, total] = await Promise.all([
        populateLeave(
            leaveModel.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
        ),
        leaveModel.countDocuments(filter),
    ]);

    return res.status(200).json({
        message: "Leave requests fetched successfully",
        leaves,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    });
});

// GET /api/leaves/:id
// Admin can view any request; employee can view own request
const getLeaveById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!isValidId(id)) {
        return res.status(400).json({
            message: "Invalid leave ID",
        });
    }

    const leave = await populateLeave(
        leaveModel.findById(id)
    );

    if (!leave) {
        return res.status(404).json({
            message: "Leave request not found",
        });
    }

    if (req.user.role === "EMPLOYEE") {
        const employee = await employeeModel.findOne({
            userId: req.user.id,
        }).select("_id");

        if (
            !employee ||
            leave.employeeId._id.toString() !== employee._id.toString()
        ) {
            return res.status(403).json({
                message: "You cannot access this leave request",
            });
        }
    }

    return res.status(200).json({
        message: "Leave request fetched successfully",
        leave,
    });
});

// PATCH /api/leaves/:id/review
// Admin approves or rejects leave
const reviewLeave = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const status =
        typeof req.body?.status === "string"
            ? req.body.status.trim().toUpperCase()
            : "";

    const adminRemarks =
        typeof req.body?.adminRemarks === "string"
            ? req.body.adminRemarks.trim()
            : "";

    if (!isValidId(id)) {
        return res.status(400).json({
            message: "Invalid leave ID",
        });
    }

    if (!["APPROVED", "REJECTED"].includes(status)) {
        return res.status(400).json({
            message: "Review status must be APPROVED or REJECTED",
        });
    }

    if (adminRemarks.length > 500) {
        return res.status(400).json({
            message: "Admin remarks cannot exceed 500 characters",
        });
    }

    const leave = await leaveModel.findById(id);

    if (!leave) {
        return res.status(404).json({
            message: "Leave request not found",
        });
    }

    if (leave.status !== "PENDING") {
        return res.status(409).json({
            message: "Only pending leave requests can be reviewed",
        });
    }

    // Before approving, check if another pending/approved leave
    // overlaps this request.
    if (status === "APPROVED") {
        const conflict = await leaveModel.findOne({
            _id: {
                $ne: leave._id,
            },
            employeeId: leave.employeeId,
            status: {
                $in: ACTIVE_LEAVE_STATUSES,
            },
            startDate: {
                $lte: leave.endDate,
            },
            endDate: {
                $gte: leave.startDate,
            },
        }).select("_id");

        if (conflict) {
            return res.status(409).json({
                message: "Another pending or approved leave overlaps this request",
            });
        }
    }

    leave.status = status;
    leave.adminRemarks = adminRemarks;
    leave.reviewedBy = req.user.id;
    leave.reviewedAt = new Date();

    await leave.save();

    const populatedLeave = await populateLeave(
        leaveModel.findById(leave._id)
    );

    return res.status(200).json({
        message: `Leave request ${status.toLowerCase()} successfully`,
        leave: populatedLeave,
    });
});

// PATCH /api/leaves/:id/cancel
// Employee cancels own pending request
const cancelLeave = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!isValidId(id)) {
        return res.status(400).json({
            message: "Invalid leave ID",
        });
    }

    const employee = await employeeModel.findOne({
        userId: req.user.id,
    }).select("_id");

    if (!employee) {
        return res.status(404).json({
            message: "Employee profile not found",
        });
    }

    const leave = await leaveModel.findOne({
        _id: id,
        employeeId: employee._id,
    });

    if (!leave) {
        return res.status(404).json({
            message: "Leave request not found",
        });
    }

    if (leave.status !== "PENDING") {
        return res.status(409).json({
            message: "Only pending leave requests can be cancelled",
        });
    }

    leave.status = "CANCELLED";

    await leave.save();

    return res.status(200).json({
        message: "Leave request cancelled successfully",
        leave,
    });
});

module.exports = {
    applyForLeave,
    getMyLeaves,
    getAllLeaves,
    getLeaveById,
    reviewLeave,
    cancelLeave,
};
