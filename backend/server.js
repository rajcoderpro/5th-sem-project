require("dotenv").config();

const app = require("./src/app");
const connectDB = require("./db/db");

const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is missing from the backend environment");
    }

    if (process.env.JWT_SECRET.length < 32 && process.env.NODE_ENV === "production") {
        throw new Error("JWT_SECRET must contain at least 32 characters in production");
    }

    if (process.env.JWT_SECRET.length < 32) {
        console.warn("Warning: use a JWT_SECRET with at least 32 characters, even in development.");
    }

    await connectDB();

    const server = app.listen(PORT, () => {
        console.log(`Backend listening on port ${PORT}`);
    });

    const shutdown = (signal) => {
        console.log(`${signal} received. Closing HTTP server...`);
        server.close(async (error) => {
            if (error) {
                console.error("Error while closing HTTP server:", error);
                process.exitCode = 1;
            }

            try {
                const mongoose = require("mongoose");
                await mongoose.disconnect();
            } catch (disconnectError) {
                console.error("Error while disconnecting MongoDB:", disconnectError);
                process.exitCode = 1;
            }
        });
    };

    process.once("SIGINT", () => shutdown("SIGINT"));
    process.once("SIGTERM", () => shutdown("SIGTERM"));

    return server;
}

startServer().catch((error) => {
    console.error("Backend startup failed:", error.message);
    process.exit(1);
});
