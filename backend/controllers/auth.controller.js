
const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const TOKEN_AGE = 7 * 24 * 60 * 60 * 1000;
const COOKIE_SAME_SITE = ["lax", "strict", "none"].includes(
    String(process.env.COOKIE_SAME_SITE || "lax").toLowerCase()
)
    ? String(process.env.COOKIE_SAME_SITE || "lax").toLowerCase()
    : "lax";
const COOKIE_SECURE = process.env.NODE_ENV === "production" || COOKIE_SAME_SITE === "none";

const cookieOptions = {
    httpOnly: true,
    secure: COOKIE_SECURE,
    sameSite: COOKIE_SAME_SITE,
    path: "/",
    maxAge: TOKEN_AGE,
};

const clearCookieOptions = {
    httpOnly: true,
    secure: COOKIE_SECURE,
    sameSite: COOKIE_SAME_SITE,
    path: "/",
};

const getPublicUser = (user) => ({
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
});

const createToken = (user) => {
    return jwt.sign(
        {
            id: user._id.toString(),
            role: user.role,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "7d",
        }
    );
};

// Public registration is disabled because every employee account must be
// created together with its Employee profile by an administrator.
const registerUser = async (req, res) => {
    return res.status(403).json({
        message: "Public registration is disabled. Please contact an administrator for an employee account.",
    });
};

// Login user
const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body || {};

        if (
            typeof email !== "string" ||
            typeof password !== "string" ||
            !email.trim() ||
            !password ||
            email.trim().length > 254 ||
            Buffer.byteLength(password, "utf8") > 72
        ) {
            return res.status(400).json({
                message: "A valid email and password are required",
            });
        }

        if (!process.env.JWT_SECRET) {
            return res.status(500).json({
                message: "Authentication is not configured",
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const user = await userModel.findOne({
            email: normalizedEmail,
        });

        // Use a generic message so the response doesn't reveal
        // whether an email address exists.
        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password",
            });
        }

        if (user.status !== "ACTIVE") {
            return res.status(403).json({
                message: "Your account is currently inactive",
            });
        }

        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordCorrect) {
            return res.status(401).json({
                message: "Invalid email or password",
            });
        }

        const token = createToken(user);

        res.cookie("token", token, cookieOptions);

        return res.status(200).json({
            message: "Login successful",
            user: getPublicUser(user),
        });
    } catch (error) {
        next(error);
    }
};

// Get currently logged-in user
const getCurrentUser = async (req, res, next) => {
    try {
        const user = await userModel
            .findById(req.user.id)
            .select("name email role status");

        if (!user || user.status !== "ACTIVE") {
            res.clearCookie("token", clearCookieOptions);

            return res.status(401).json({
                message: "Session is no longer valid",
            });
        }

        return res.status(200).json({
            user: getPublicUser(user),
        });
    } catch (error) {
        next(error);
    }
};

// Logout user
const logoutUser = async (req, res) => {
    res.clearCookie("token", clearCookieOptions);

    return res.status(200).json({
        message: "Logout successful",
    });
};

module.exports = {
    registerUser,
    loginUser,
    getCurrentUser,
    logoutUser,
};
