
const mongoose = require("mongoose");

const leaveSchema = new mongoose.Schema(
    {
        employeeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "employees",
            required: true,
        },

        leaveType: {
            type: String,
            enum: [
                "CASUAL",
                "SICK",
                "EARNED",
                "UNPAID",
                "OTHER",
            ],
            required: true,
        },

        startDate: {
            type: Date,
            required: true,
        },

        endDate: {
            type: Date,
            required: true,
            validate: {
                validator: function (value) {
                    return !this.startDate || value >= this.startDate;
                },
                message: "End date cannot be before start date",
            },
        },

        reason: {
            type: String,
            required: true,
            trim: true,
            maxlength: 1000,
        },

        status: {
            type: String,
            enum: [
                "PENDING",
                "APPROVED",
                "REJECTED",
                "CANCELLED",
            ],
            default: "PENDING",
        },

        adminRemarks: {
            type: String,
            trim: true,
            maxlength: 500,
            default: "",
        },

        reviewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        reviewedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

// Frequently used queries
leaveSchema.index({
    employeeId: 1,
    status: 1,
    startDate: 1,
    endDate: 1,
});

leaveSchema.index({
    status: 1,
    createdAt: -1,
});

leaveSchema.index({
    leaveType: 1,
    status: 1,
});

const leaveModel = mongoose.model("leave", leaveSchema);

module.exports = leaveModel;
