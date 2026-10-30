
require("dotenv").config();

const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const authRoutes = require("../routes/auth.routes");
const departmentsRoutes = require("../routes/departments.routes");
const employeeRoutes = require("../routes/employees.routes");
const taskRoutes = require("../routes/tasks.routes");

const app = express();

app.use(
    cors({
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        credentials: true,
    })
);

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/departments", departmentsRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/tasks", taskRoutes);

module.exports = app;
