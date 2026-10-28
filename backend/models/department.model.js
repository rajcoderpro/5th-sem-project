

const mongoose = require( "mongoose" );

const departmentSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            maxlength: 80,
        },

        code: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            uppercase: true,
            maxlength: 10,
        },

        description: {
            type: String,
            trim: true,
            maxlength: 500,
            default: "",
        },

        managerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

const departmentModel = mongoose.model(
    "department",
    departmentSchema
);

module.exports = departmentModel;
