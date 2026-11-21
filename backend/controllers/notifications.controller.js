const mongoose = require("mongoose");
const notificationModel = require("../models/notification.model");

function pagination(query = {}) {
    const pageValue = Number.parseInt(query.page, 10);
    const limitValue = Number.parseInt(query.limit, 10);
    const page = Number.isInteger(pageValue) && pageValue > 0 ? pageValue : 1;
    const limit = Number.isInteger(limitValue) ? Math.min(50, Math.max(1, limitValue)) : 15;
    return { page, limit, skip: (page - 1) * limit };
}

const getMyNotifications = async (req, res, next) => {
    try {
        const { page, limit, skip } = pagination(req.query);
        const filter = { recipient: req.user.id };

        if (req.query.unreadOnly === "true") filter.isRead = false;
        if (req.query.unreadOnly !== undefined && !["true", "false"].includes(req.query.unreadOnly)) {
            return res.status(400).json({ message: "unreadOnly must be true or false" });
        }

        const [notifications, total, unreadCount] = await Promise.all([
            notificationModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
            notificationModel.countDocuments(filter),
            notificationModel.countDocuments({ recipient: req.user.id, isRead: false }),
        ]);

        return res.status(200).json({
            notifications,
            unreadCount,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        });
    } catch (error) {
        return next(error);
    }
};

const markNotificationRead = async (req, res, next) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: "Invalid notification ID" });
        }

        const notification = await notificationModel.findOneAndUpdate(
            { _id: req.params.id, recipient: req.user.id },
            { $set: { isRead: true, readAt: new Date() } },
            { new: true, runValidators: true }
        );

        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }

        return res.status(200).json({ message: "Notification marked as read", notification });
    } catch (error) {
        return next(error);
    }
};

const markAllNotificationsRead = async (req, res, next) => {
    try {
        const result = await notificationModel.updateMany(
            { recipient: req.user.id, isRead: false },
            { $set: { isRead: true, readAt: new Date() } }
        );

        return res.status(200).json({
            message: "All notifications marked as read",
            modifiedCount: result.modifiedCount,
        });
    } catch (error) {
        return next(error);
    }
};

module.exports = { getMyNotifications, markNotificationRead, markAllNotificationsRead };
