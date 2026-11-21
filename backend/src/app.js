require("dotenv").config();

const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const authRoutes = require("../routes/auth.routes");
const departmentsRoutes = require("../routes/departments.routes");
const employeeRoutes = require("../routes/employees.routes");
const taskRoutes = require("../routes/tasks.routes");
const leaveRoutes = require("../routes/leave.routes");
const attendanceRoutes = require("../routes/attendance.routes");
const notificationRoutes = require("../routes/notifications.routes");
const { createRateLimiter } = require("../middlewares/rateLimit.middleware");

const app = express();

if (process.env.TRUST_PROXY === "true") {
    app.set("trust proxy", 1);
}

const allowedOrigins = (process.env.FRONTEND_URLS || process.env.FRONTEND_URL || "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

app.disable("x-powered-by");

app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    res.setHeader("Cross-Origin-Resource-Policy", "same-site");
    next();
});

app.use(cors({
    origin(origin, callback) {
        // Requests without an Origin header are commonly server-to-server or Postman.
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error("Origin is not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Accept"],
}));

app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: false, limit: "100kb" }));
app.use(cookieParser());

app.get("/api/health", (req, res) => {
    const mongoose = require("mongoose");
    const databaseReady = mongoose.connection.readyState === 1;

    return res.status(databaseReady ? 200 : 503).json({
        status: databaseReady ? "ok" : "unavailable",
        database: databaseReady ? "connected" : "disconnected",
        timestamp: new Date().toISOString(),
    });
});

const loginLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: "Too many login attempts from this network. Please try again in 15 minutes.",
});

app.use("/api/auth/login", loginLimiter);
app.use("/api/auth", authRoutes);
app.use("/api/departments", departmentsRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/notifications", notificationRoutes);

app.use((req, res) => {
    return res.status(404).json({ message: "API route not found" });
});

app.use((error, req, res, next) => {
    if (res.headersSent) return next(error);

    if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
        return res.status(400).json({ message: "Request body contains invalid JSON" });
    }

    if (error.message === "Origin is not allowed by CORS") {
        return res.status(403).json({ message: "Origin is not allowed" });
    }

    console.error("Unhandled API error:", error);
    return res.status(500).json({ message: "Internal server error" });
});

module.exports = app;
