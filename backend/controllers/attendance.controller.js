
const mongoose = require("mongoose");

const attendanceModel = require("../models/attendance.model");
const employeeModel = require("../models/employee.model");
const leaveModel = require("../models/leave.model");

const ATTENDANCE_TIMEZONE = "Asia/Kolkata";
const IST_OFFSET_MINUTES = 330;

const ATTENDANCE_STATUSES = [
    "PRESENT",
    "LATE",
    "HALF_DAY",
    "ABSENT",
];

// --------------------------------------------------
// DATE AND TIME HELPERS
// --------------------------------------------------

// Get YYYY-MM-DD in Indian Standard Time.
const getIndiaDateKey = (date = new Date()) => {
    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: ATTENDANCE_TIMEZONE,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).formatToParts(date);

    const values = {};

    for (const part of parts) {
        values[part.type] = part.value;
    }

    return `${values.year}-${values.month}-${values.day}`;
};

// Validate a YYYY-MM-DD date.
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

// Canonical date representation: UTC midnight.
const getAttendanceDate = (dateKey) => {
    return parseDateOnly(dateKey);
};

// End of a calendar day.
const getDayEnd = (date) => {
    return new Date(
        date.getTime() + 24 * 60 * 60 * 1000 - 1
    );
};

// Convert an IST wall-clock time into an actual UTC instant.
// India has a fixed UTC+05:30 offset.
const indiaDateTimeToUtc = (dateKey, time) => {
    const date = parseDateOnly(dateKey);

    if (!date || !/^\d{2}:\d{2}$/.test(time)) {
        return null;
    }

    const [hours, minutes] = time.split(":").map(Number);

    if (
        !Number.isInteger(hours) ||
        !Number.isInteger(minutes) ||
        hours < 0 ||
        hours > 23 ||
        minutes < 0 ||
        minutes > 59
    ) {
        return null;
    }

    return new Date(
        Date.UTC(
            date.getUTCFullYear(),
            date.getUTCMonth(),
            date.getUTCDate(),
            hours,
            minutes
        ) - IST_OFFSET_MINUTES * 60 * 1000
    );
};

// Get validated shift configuration.
const getShiftConfiguration = () => {
    const shiftStart = process.env.ATTENDANCE_SHIFT_START || "09:30";

    const graceMinutes = Number(
        process.env.ATTENDANCE_GRACE_MINUTES ?? 15
    );

    const halfDayMinutes = Number(
        process.env.ATTENDANCE_HALF_DAY_MINUTES ?? 240
    );

    if (!/^\d{2}:\d{2}$/.test(shiftStart)) {
        throw new Error("Invalid ATTENDANCE_SHIFT_START configuration");
    }

    const [hours, minutes] = shiftStart.split(":").map(Number);

    if (
        hours > 23 ||
        minutes > 59 ||
        !Number.isFinite(graceMinutes) ||
        graceMinutes < 0 ||
        !Number.isInteger(graceMinutes) ||
        !Number.isFinite(halfDayMinutes) ||
        halfDayMinutes <= 0
    ) {
        throw new Error("Invalid attendance configuration");
    }

    return {
        shiftStart,
        graceMinutes,
        halfDayMinutes,
    };
};

// --------------------------------------------------
// COMMON HELPERS
// --------------------------------------------------

const handleError = (res, error) => {
    if (error.code === 11000) {
        return res.status(409).json({
            message: "Attendance for this employee and date already exists",
        });
    }

    if (
        error.name === "ValidationError" ||
        error.name === "CastError"
    ) {
        return res.status(400).json({
            message: "Invalid attendance data",
        });
    }

    console.error("Attendance controller error:", error);

    return res.status(500).json({
        message: "Internal server error",
    });
};

const asyncHandler = (controller) => {
    return async (req, res) => {
        try {
            await controller(req, res);
        } catch (error) {
            return handleError(res, error);
        }
    };
};

const isValidId = (id) => {
    return mongoose.isValidObjectId(id);
};

// Get employee profile belonging to the logged-in user.
const getEmployeeForUser = async (userId) => {
    return employeeModel.findOne({
        userId,
    });
};

// Check whether the employee has approved leave on this day.
const getApprovedLeave = async (employeeId, attendanceDate) => {
    return leaveModel.findOne({
        employeeId,
        status: "APPROVED",
        startDate: {
            $lte: getDayEnd(attendanceDate),
        },
        endDate: {
            $gte: attendanceDate,
        },
    }).select("_id leaveType startDate endDate");
};

// Populate attendance data consistently.
const populateAttendance = (query) => {
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
        .populate("markedBy", "name email");
};

// Build common date/status filters.
const buildAttendanceFilters = (query, filter = {}) => {
    if (query.status) {
        const status = query.status.toUpperCase();

        if (!ATTENDANCE_STATUSES.includes(status)) {
            return {
                error: "Invalid attendance status",
            };
        }

        filter.status = status;
    }

    if (query.isLate !== undefined) {
        if (!["true", "false"].includes(query.isLate)) {
            return {
                error: "isLate must be true or false",
            };
        }

        filter.isLate = query.isLate === "true";
    }

    let fromDate = null;
    let toDate = null;

    if (query.fromDate) {
        fromDate = parseDateOnly(query.fromDate);

        if (!fromDate) {
            return {
                error: "Invalid fromDate. Use YYYY-MM-DD",
            };
        }
    }

    if (query.toDate) {
        toDate = parseDateOnly(query.toDate);

        if (!toDate) {
            return {
                error: "Invalid toDate. Use YYYY-MM-DD",
            };
        }
    }

    if (fromDate && toDate && toDate < fromDate) {
        return {
            error: "toDate cannot be before fromDate",
        };
    }

    if (fromDate || toDate) {
        filter.attendanceDate = {};

        if (fromDate) {
            filter.attendanceDate.$gte = fromDate;
        }

        if (toDate) {
            filter.attendanceDate.$lte = toDate;
        }
    }

    return {
        filter,
    };
};

// Pagination helper.
const getPagination = (query) => {
    const page = Math.max(
        1,
        Number.parseInt(query.page, 10) || 1
    );

    const limit = Math.min(
        100,
        Math.max(1, Number.parseInt(query.limit, 10) || 10)
    );

    return {
        page,
        limit,
        skip: (page - 1) * limit,
    };
};

// --------------------------------------------------
// EMPLOYEE: CHECK IN
// POST /api/attendance/check-in
// --------------------------------------------------

const checkIn = asyncHandler(async (req, res) => {
    const employee = await getEmployeeForUser(req.user.id);

    if (!employee) {
        return res.status(404).json({
            message: "Employee profile not found",
        });
    }

    if (employee.employmentStatus === "ON_LEAVE") {
        return res.status(409).json({
            message: "You are currently marked as on leave",
        });
    }

    if (employee.employmentStatus !== "ACTIVE") {
        return res.status(403).json({
            message: "Only active employees can check in",
        });
    }

    const now = new Date();

    // Attendance day is determined using IST.
    const todayKey = getIndiaDateKey(now);
    const attendanceDate = getAttendanceDate(todayKey);

    // Do not allow check-in during approved leave.
    const approvedLeave = await getApprovedLeave(
        employee._id,
        attendanceDate
    );

    if (approvedLeave) {
        return res.status(409).json({
            message: "You cannot check in on an approved leave date",
            leave: approvedLeave,
        });
    }

    // Check for an already existing daily record.
    const existing = await attendanceModel.findOne({
        employeeId: employee._id,
        attendanceDate,
    });

    if (existing) {
        return res.status(409).json({
            message: "Attendance has already been marked for today",
            attendance: existing,
        });
    }

    const {
        shiftStart,
        graceMinutes,
    } = getShiftConfiguration();

    const shiftStartTime = indiaDateTimeToUtc(
        todayKey,
        shiftStart
    );

    const lateThreshold = new Date(
        shiftStartTime.getTime() + graceMinutes * 60 * 1000
    );

    const isLate = now > lateThreshold;

    const attendance = await attendanceModel.create({
        employeeId: employee._id,
        attendanceDate,
        checkInAt: now,
        checkOutAt: null,
        workedMinutes: 0,
        status: isLate ? "LATE" : "PRESENT",
        isLate,
        source: "SELF",
    });

    return res.status(201).json({
        message: isLate
            ? "Check-in recorded. You are marked late."
            : "Check-in successful",
        attendance,
    });
});

// --------------------------------------------------
// EMPLOYEE: CHECK OUT
// PATCH /api/attendance/check-out
// --------------------------------------------------

const checkOut = asyncHandler(async (req, res) => {
    const employee = await getEmployeeForUser(req.user.id);

    if (!employee) {
        return res.status(404).json({
            message: "Employee profile not found",
        });
    }

    const todayKey = getIndiaDateKey();
    const attendanceDate = getAttendanceDate(todayKey);

    const attendance = await attendanceModel.findOne({
        employeeId: employee._id,
        attendanceDate,
    });

    if (!attendance) {
        return res.status(404).json({
            message: "No check-in record found for today",
        });
    }

    if (attendance.status === "ABSENT") {
        return res.status(409).json({
            message: "An absent attendance record cannot be checked out",
        });
    }

    if (!attendance.checkInAt) {
        return res.status(409).json({
            message: "Check-in timestamp is missing",
        });
    }

    if (attendance.checkOutAt) {
        return res.status(409).json({
            message: "You have already checked out today",
        });
    }

    const now = new Date();

    if (now <= attendance.checkInAt) {
        return res.status(400).json({
            message: "Check-out time must be after check-in time",
        });
    }

    const workedMinutes = Math.floor(
        (now.getTime() - attendance.checkInAt.getTime()) / 60000
    );

    const { halfDayMinutes } = getShiftConfiguration();

    let status;

    if (workedMinutes < halfDayMinutes) {
        status = "HALF_DAY";
    } else {
        status = attendance.isLate ? "LATE" : "PRESENT";
    }

    attendance.checkOutAt = now;
    attendance.workedMinutes = workedMinutes;
    attendance.status = status;

    await attendance.save();

    return res.status(200).json({
        message: "Check-out successful",
        attendance,
    });
});

// --------------------------------------------------
// EMPLOYEE: TODAY'S ATTENDANCE
// GET /api/attendance/today
// --------------------------------------------------

const getTodayAttendance = asyncHandler(async (req, res) => {
    const employee = await getEmployeeForUser(req.user.id);

    if (!employee) {
        return res.status(404).json({
            message: "Employee profile not found",
        });
    }

    const attendanceDate = getAttendanceDate(
        getIndiaDateKey()
    );

    const attendance = await attendanceModel.findOne({
        employeeId: employee._id,
        attendanceDate,
    });

    return res.status(200).json({
        message: "Today's attendance fetched successfully",
        attendance,
        isCheckedIn: Boolean(attendance?.checkInAt),
        isCheckedOut: Boolean(attendance?.checkOutAt),
    });
});

// --------------------------------------------------
// EMPLOYEE: PERSONAL ATTENDANCE HISTORY
// GET /api/attendance/me
// --------------------------------------------------

const getMyAttendance = asyncHandler(async (req, res) => {
    const employee = await getEmployeeForUser(req.user.id);

    if (!employee) {
        return res.status(404).json({
            message: "Employee profile not found",
        });
    }

    const { filter, error } = buildAttendanceFilters(
        req.query,
        {
            employeeId: employee._id,
        }
    );

    if (error) {
        return res.status(400).json({
            message: error,
        });
    }

    const { page, limit, skip } = getPagination(req.query);

    const [records, total] = await Promise.all([
        populateAttendance(
            attendanceModel.find(filter)
                .sort({ attendanceDate: -1 })
                .skip(skip)
                .limit(limit)
        ),

        attendanceModel.countDocuments(filter),
    ]);

    return res.status(200).json({
        message: "Attendance history fetched successfully",
        attendance: records,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    });
});

// --------------------------------------------------
// ADMIN: ALL ATTENDANCE RECORDS
// GET /api/attendance
// --------------------------------------------------

const getAllAttendance = asyncHandler(async (req, res) => {
    const filter = {};

    if (req.query.employeeId) {
        if (!isValidId(req.query.employeeId)) {
            return res.status(400).json({
                message: "Invalid employee ID",
            });
        }

        filter.employeeId = req.query.employeeId;
    }

    const result = buildAttendanceFilters(req.query, filter);

    if (result.error) {
        return res.status(400).json({
            message: result.error,
        });
    }

    const { page, limit, skip } = getPagination(req.query);

    const [records, total] = await Promise.all([
        populateAttendance(
            attendanceModel.find(result.filter)
                .sort({
                    attendanceDate: -1,
                    checkInAt: -1,
                })
                .skip(skip)
                .limit(limit)
        ),

        attendanceModel.countDocuments(result.filter),
    ]);

    return res.status(200).json({
        message: "Attendance records fetched successfully",
        attendance: records,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    });
});

// --------------------------------------------------
// ADMIN: DAILY ATTENDANCE SUMMARY
// GET /api/attendance/summary
// --------------------------------------------------

const getAttendanceSummary = asyncHandler(async (req, res) => {
    const dateKey = req.query.date || getIndiaDateKey();
    const attendanceDate = parseDateOnly(dateKey);

    if (!attendanceDate) {
        return res.status(400).json({
            message: "Invalid date. Use YYYY-MM-DD",
        });
    }

    const dayEnd = getDayEnd(attendanceDate);

    const [
        workforce,
        records,
        approvedLeaves,
    ] = await Promise.all([
        employeeModel.find({
            employmentStatus: {
                $in: ["ACTIVE", "ON_LEAVE"],
            },
        }).select("_id employmentStatus"),

        attendanceModel.find({
            attendanceDate,
        }).select("employeeId status isLate"),

        leaveModel.find({
            status: "APPROVED",
            startDate: {
                $lte: dayEnd,
            },
            endDate: {
                $gte: attendanceDate,
            },
        }).select("employeeId"),
    ]);

    const attendanceEmployeeIds = new Set(
        records.map((record) => String(record.employeeId))
    );

    const onLeaveIds = new Set(
        workforce
            .filter((employee) =>
                employee.employmentStatus === "ON_LEAVE"
            )
            .map((employee) => String(employee._id))
    );

    approvedLeaves.forEach((leave) => {
        const id = String(leave.employeeId);

        if (workforce.some(
            (employee) => String(employee._id) === id
        )) {
            onLeaveIds.add(id);
        }
    });

    const present = records.filter(
        (record) =>
            record.status === "PRESENT" ||
            record.status === "LATE"
    ).length;

    const late = records.filter(
        (record) => record.isLate
    ).length;

    const halfDay = records.filter(
        (record) => record.status === "HALF_DAY"
    ).length;

    const absent = records.filter(
        (record) => record.status === "ABSENT"
    ).length;

    const notMarked = workforce.filter((employee) => {
        const id = String(employee._id);

        return (
            !attendanceEmployeeIds.has(id) &&
            !onLeaveIds.has(id)
        );
    }).length;

    return res.status(200).json({
        message: "Attendance summary fetched successfully",
        date: dateKey,
        summary: {
            totalEmployees: workforce.length,
            present,
            late,
            halfDay,
            absent,
            onLeave: onLeaveIds.size,
            notMarked,
            totalRecords: records.length,
        },
    });
});

// --------------------------------------------------
// ADMIN: MARK EMPLOYEE ABSENT
// POST /api/attendance/:employeeId/absent
// --------------------------------------------------

const markAbsent = asyncHandler(async (req, res) => {
    const { employeeId } = req.params;

    if (!isValidId(employeeId)) {
        return res.status(400).json({
            message: "Invalid employee ID",
        });
    }

    const dateKey = req.body?.date;
    const attendanceDate = parseDateOnly(dateKey);

    if (!attendanceDate) {
        return res.status(400).json({
            message: "A valid date in YYYY-MM-DD format is required",
        });
    }

    // Only past dates may be marked absent.
    const todayKey = getIndiaDateKey();

    if (dateKey >= todayKey) {
        return res.status(400).json({
            message: "You can only mark a past date as absent",
        });
    }

    const employee = await employeeModel.findById(employeeId);

    if (!employee) {
        return res.status(404).json({
            message: "Employee not found",
        });
    }

    if (employee.employmentStatus !== "ACTIVE") {
        return res.status(409).json({
            message: "Only currently active employees can be marked absent",
        });
    }

    // Approved leave must never be classified as absence.
    const approvedLeave = await getApprovedLeave(
        employee._id,
        attendanceDate
    );

    if (approvedLeave) {
        return res.status(409).json({
            message: "Employee has approved leave on this date",
            leave: approvedLeave,
        });
    }

    const existing = await attendanceModel.findOne({
        employeeId,
        attendanceDate,
    });

    if (existing) {
        return res.status(409).json({
            message: "Attendance has already been recorded for this date",
            attendance: existing,
        });
    }

    const remarks =
        typeof req.body.adminRemarks === "string"
            ? req.body.adminRemarks.trim()
            : "";

    if (remarks.length > 500) {
        return res.status(400).json({
            message: "Admin remarks cannot exceed 500 characters",
        });
    }

    const attendance = await attendanceModel.create({
        employeeId,
        attendanceDate,
        checkInAt: null,
        checkOutAt: null,
        workedMinutes: 0,
        status: "ABSENT",
        isLate: false,
        source: "ADMIN",
        adminRemarks: remarks,
        markedBy: req.user.id,
    });

    return res.status(201).json({
        message: "Employee marked absent successfully",
        attendance,
    });
});

// --------------------------------------------------
// SHARED: GET ATTENDANCE BY ID
// GET /api/attendance/:id
// --------------------------------------------------

const getAttendanceById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!isValidId(id)) {
        return res.status(400).json({
            message: "Invalid attendance ID",
        });
    }

    const attendance = await populateAttendance(
        attendanceModel.findById(id)
    );

    if (!attendance) {
        return res.status(404).json({
            message: "Attendance record not found",
        });
    }

    // Employees can only view their own records.
    if (req.user.role === "EMPLOYEE") {
        const employee = await getEmployeeForUser(req.user.id);

        if (
            !employee ||
            String(attendance.employeeId._id) !== String(employee._id)
        ) {
            return res.status(403).json({
                message: "You cannot access this attendance record",
            });
        }
    }

    return res.status(200).json({
        message: "Attendance record fetched successfully",
        attendance,
    });
});

module.exports = {
    checkIn,
    checkOut,
    getTodayAttendance,
    getMyAttendance,
    getAllAttendance,
    getAttendanceSummary,
    markAbsent,
    getAttendanceById,
};
