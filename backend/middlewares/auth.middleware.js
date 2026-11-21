const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const userModel = require("../models/user.model");

const COOKIE_SAME_SITE = ["lax", "strict", "none"].includes(
    String(process.env.COOKIE_SAME_SITE || "lax").toLowerCase()
)
    ? String(process.env.COOKIE_SAME_SITE || "lax").toLowerCase()
    : "lax";
const COOKIE_SECURE = process.env.NODE_ENV === "production" || COOKIE_SAME_SITE === "none";

const clearAuthCookie = (res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: COOKIE_SECURE,
        sameSite: COOKIE_SAME_SITE,
        path: "/",
    });
};

const authenticate = (requiredRole = null) => async (req, res, next) => {
    const token = req.cookies?.token;

    if (!token) {
        return res.status(401).json({ message: "Authentication required" });
    }

    if (!process.env.JWT_SECRET) {
        console.error("JWT_SECRET is missing");
        return res.status(500).json({ message: "Authentication is not configured" });
    }

    let decoded;

    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
        clearAuthCookie(res);
        return res.status(401).json({ message: "Invalid or expired token" });
    }

    if (
        !decoded ||
        typeof decoded !== "object" ||
        !mongoose.isValidObjectId(decoded.id)
    ) {
        clearAuthCookie(res);
        return res.status(401).json({ message: "Invalid token" });
    }

    try {
        // The database is authoritative. This immediately revokes access when
        // an account is suspended or its role is changed after token creation.
        const user = await userModel.findById(decoded.id).select("role status");

        if (!user || user.status !== "ACTIVE") {
            clearAuthCookie(res);
            return res.status(401).json({ message: "Your session is no longer active" });
        }

        if (!["ADMIN", "EMPLOYEE"].includes(user.role)) {
            clearAuthCookie(res);
            return res.status(403).json({ message: "This account has no application role" });
        }

        req.user = {
            id: user._id.toString(),
            role: user.role,
        };

        if (requiredRole && req.user.role !== requiredRole) {
            return res.status(403).json({ message: "Access denied" });
        }

        return next();
    } catch (error) {
        return next(error);
    }
};

const authUser = authenticate();
const authAdmin = authenticate("ADMIN");
const authEmployee = authenticate("EMPLOYEE");

module.exports = { authAdmin, authEmployee, authUser };
