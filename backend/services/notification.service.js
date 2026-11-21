const userModel = require("../models/user.model");
const notificationModel = require("../models/notification.model");

async function createNotification(data) {
    try {
        if (!data?.recipient || !data?.type || !data?.entityType || !data?.entityId) {
            return null;
        }

        return await notificationModel.create({
            recipient: data.recipient,
            type: data.type,
            title: data.title,
            message: data.message,
            entityType: data.entityType,
            entityId: data.entityId,
        });
    } catch (error) {
        // Notifications are secondary to the business operation. A notification
        // failure must not turn a successful task/leave operation into an API error.
        console.error("Notification creation failed:", error.message);
        return null;
    }
}

async function notifyAdmins(data) {
    try {
        const admins = await userModel.find({ role: "ADMIN", status: "ACTIVE" }).select("_id");
        return await Promise.all(admins.map((admin) => createNotification({
            ...data,
            recipient: admin._id,
        })));
    } catch (error) {
        console.error("Admin notification dispatch failed:", error.message);
        return [];
    }
}

module.exports = { createNotification, notifyAdmins };
