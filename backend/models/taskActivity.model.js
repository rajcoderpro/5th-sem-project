const mongoose = require("mongoose");

const taskActivitySchema = new mongoose.Schema(
    {
        taskId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "task",
            required: true,
        },
        actor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        action: {
            type: String,
            enum: ["CREATED", "ASSIGNED", "REASSIGNED", "STATUS_CHANGED", "DETAILS_UPDATED", "AI_ANALYZED"],
            required: true,
        },
        message: {
            type: String,
            required: true,
            trim: true,
            maxlength: 300,
        },
        fromValue: {
            type: String,
            default: "",
            maxlength: 120,
        },
        toValue: {
            type: String,
            default: "",
            maxlength: 120,
        },
    },
    { timestamps: true }
);

taskActivitySchema.index({ taskId: 1, createdAt: -1 });

module.exports = mongoose.model("taskActivity", taskActivitySchema);
