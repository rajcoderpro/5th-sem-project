
const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 150
        },

        description: {
            type: String,
            trim: true,
            default: "",
            maxlength: 2000
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: true
        },

        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "employees",
            default: null
        },

        departmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "departments",
            required: true
        },

        status: {
            type: String,
            enum: [
                "TODO",
                "IN_PROGRESS",
                "BLOCKED",
                "IN_REVIEW",
                "COMPLETED",
                "CANCELLED"
            ],
            default: "TODO"
        },

        priority: {
            type: String,
            enum: ["LOW", "MEDIUM", "HIGH", "URGENT"],
            default: "MEDIUM"
        },

        startDate: {
            type: Date,
            default: Date.now
        },

        dueDate: {
            type: Date,
            required: true
        },

        estimatedHours: {
            type: Number,
            required: true,
            min: 0
        },

        actualHours: {
            type: Number,
            default: 0,
            min: 0
        },

        progressPercentage: {
            type: Number,
            min: 0,
            max: 100,
            default: 0
        },

        skillsRequired: [
            {
                _id: false,

                name: {
                    type: String,
                    required: true,
                    trim: true
                },

                minimumLevel: {
                    type: Number,
                    min: 1,
                    max: 5,
                    default: 1
                }
            }
        ],

        tags: [{
            type: String,
            trim: true
        }],

        completedAt: {
            type: Date,
            default: null
        },

        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            default: null
        }
    },
    {
        timestamps: true
    }
);

taskSchema.index({ assignedTo: 1, status: 1 });
taskSchema.index({ departmentId: 1, priority: 1 });
taskSchema.index({ dueDate: 1, status: 1 });

const taskModel = mongoose.model("task", taskSchema);

module.exports = taskModel;
