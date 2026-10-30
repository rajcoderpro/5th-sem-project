
const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const TOKEN_AGE = 7 * 24 * 60 * 60 * 1000;

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: TOKEN_AGE,
};

const clearCookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
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

// Register user
const registerUser = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email and password are required",
            });
        }

        if (!process.env.JWT_SECRET) {
            return res.status(500).json({
                message: "Authentication is not configured",
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await userModel.findOne({
            email: normalizedEmail,
        });

        if (existingUser) {
            return res.status(409).json({
                message: "User with this email already exists",
            });
        }

        const hashPass = await bcrypt.hash(password, 10);

        // Role is deliberately not accepted from public input.
        // The schema assigns the default EMPLOYEE role.
        const user = await userModel.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashPass,
        });

        const token = createToken(user);

        res.cookie("token", token, cookieOptions);

        return res.status(201).json({
            message: "User created successfully",
            user: getPublicUser(user),
        });
    } catch (error) {
        next(error);
    }
};

// Login user
const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required",
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
