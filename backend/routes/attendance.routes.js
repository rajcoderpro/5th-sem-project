
const express = require("express");
const router = express.Router();

const attendanceController = require("../controllers/attendance.controller");

const {
    authAdmin,
    authEmployee,
    authUser,
} = require("../middlewares/auth.middleware");

// Employee routes
router.post(
    "/check-in",
    authEmployee,
    attendanceController.checkIn
);

router.patch(
    "/check-out",
    authEmployee,
    attendanceController.checkOut
);

router.get(
    "/today",
    authEmployee,
    attendanceController.getTodayAttendance
);

router.get(
    "/me",
    authEmployee,
    attendanceController.getMyAttendance
);

// Admin routes
router.get(
    "/summary",
    authAdmin,
    attendanceController.getAttendanceSummary
);

router.get(
    "/",
    authAdmin,
    attendanceController.getAllAttendance
);

router.post(
    "/:employeeId/absent",
    authAdmin,
    attendanceController.markAbsent
);

// Shared authenticated route
router.get(
    "/:id",
    authUser,
    attendanceController.getAttendanceById
);

module.exports = router;
