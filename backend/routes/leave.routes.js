
const express = require("express");
const router = express.Router();

const leaveController = require("../controllers/leave.controller");

const {
    authAdmin,
    authEmployee,
    authUser,
} = require("../middlewares/auth.middleware");

// Employee routes
router.post(
    "/",
    authEmployee,
    leaveController.applyForLeave
);

router.get(
    "/me",
    authEmployee,
    leaveController.getMyLeaves
);

router.patch(
    "/:id/cancel",
    authEmployee,
    leaveController.cancelLeave
);

// Admin routes
router.get(
    "/",
    authAdmin,
    leaveController.getAllLeaves
);

router.patch(
    "/:id/review",
    authAdmin,
    leaveController.reviewLeave
);

// Shared authenticated route
router.get(
    "/:id",
    authUser,
    leaveController.getLeaveById
);

module.exports = router;
