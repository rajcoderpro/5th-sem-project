
const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
    {
        employeeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "employees",
            required: true,
        },

        // Stored as UTC midnight for the corresponding IST calendar date.
        attendanceDate: {
            type: Date,
            required: true,
        },

        checkInAt: {
            type: Date,
            default: null,
        },

        checkOutAt: {
            type: Date,
            default: null,
        },

        workedMinutes: {
            type: Number,
            min: 0,
            default: 0,
        },

        status: {
            type: String,
            enum: [
                "PRESENT",
                "LATE",
                "HALF_DAY",
                "ABSENT",
            ],
            required: true,
            default: "PRESENT",
        },

        isLate: {
            type: Boolean,
            default: false,
        },

        source: {
            type: String,
            enum: ["SELF", "ADMIN"],
            default: "SELF",
        },

        adminRemarks: {
            type: String,
            trim: true,
            maxlength: 500,
            default: "",
        },

        markedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

// One attendance record per employee per IST date.
attendanceSchema.index(
    {
        employeeId: 1,
        attendanceDate: 1,
    },
    {
        unique: true,
    }
);

// Efficient date and status filtering.
attendanceSchema.index({
    attendanceDate: -1,
    status: 1,
});

// Efficient employee attendance history.
attendanceSchema.index({
    employeeId: 1,
    attendanceDate: -1,
});

const attendanceModel = mongoose.model(
    "attendance",
    attendanceSchema
);

module.exports = attendanceModel;
