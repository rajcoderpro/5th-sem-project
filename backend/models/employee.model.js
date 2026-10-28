
const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    employeeCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },

    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "department",
      required: true,
    },

    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "employees",
      default: null,
    },

    designation: {
      type: String,
      required: true,
      trim: true,
    },

    employmentType: {
      type: String,
      enum: ["FULL_TIME", "PART_TIME", "CONTRACT", "INTERN"],
      default: "FULL_TIME",
    },

    employmentStatus: {
      type: String,
      enum: ["ACTIVE", "ON_LEAVE", "INACTIVE", "TERMINATED"],
      default: "ACTIVE",
    },

    joiningDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      default: null,
    },

    workMode: {
      type: String,
      enum: ["ONSITE", "REMOTE", "HYBRID"],
      default: "ONSITE",
    },

    skills: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },

        proficiencyLevel: {
          type: Number,
          min: 1,
          max: 5,
          required: true,
        },

        yearsOfExperience: {
          type: Number,
          min: 0,
          default: 0,
        },
      },
    ],

    capacity: {
      weeklyHours: {
        type: Number,
        min: 0,
        max: 168,
        default: 40,
      },

      maxConcurrentTasks: {
        type: Number,
        min: 1,
        default: 5,
      },
    },

    profile: {
      bio: {
        type: String,
        trim: true,
        maxlength: 500,
        default: "",
      },

      location: {
        type: String,
        trim: true,
        default: "",
      },
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const employeeModel = mongoose.model("employees", employeeSchema);

module.exports = employeeModel;
