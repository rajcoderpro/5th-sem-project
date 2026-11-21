const express = require("express");
const { authUser } = require("../middlewares/auth.middleware");
const notificationController = require("../controllers/notifications.controller");

const router = express.Router();

router.use(authUser);
router.get("/", notificationController.getMyNotifications);
router.patch("/read-all", notificationController.markAllNotificationsRead);
router.patch("/:id/read", notificationController.markNotificationRead);

module.exports = router;
