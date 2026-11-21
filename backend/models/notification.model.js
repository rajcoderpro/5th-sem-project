const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
    {
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        type: {
            type: String,
            enum: [
                "TASK_ASSIGNED",
                "TASK_REASSIGNED",
                "TASK_STATUS_UPDATED",
                "TASK_REVIEW_SUBMITTED",
                "LEAVE_SUBMITTED",
                "LEAVE_REVIEWED",
            ],
            required: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 120,
        },
        message: {
            type: String,
            required: true,
            trim: true,
            maxlength: 500,
        },
        entityType: {
            type: String,
            enum: ["TASK", "LEAVE"],
            required: true,
        },
        entityId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        isRead: {
            type: Boolean,
            default: false,
        },
        readAt: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true }
);

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, createdAt: -1 });

module.exports = mongoose.model("notification", notificationSchema);
