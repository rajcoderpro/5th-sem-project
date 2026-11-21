const mongoose = require("mongoose");

async function connectDB(uri = process.env.MONGOOSE_URI) {
    if (!uri) {
        throw new Error("MONGOOSE_URI is missing from the backend environment");
    }

    mongoose.set("strictQuery", true);

    await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 10000,
    });

    console.log("MongoDB connected");
    return mongoose.connection;
}

module.exports = connectDB;
