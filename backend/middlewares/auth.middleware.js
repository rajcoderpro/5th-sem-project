const jwt = require("jsonwebtoken");

const createRoleAuth = (requiredRole) => {
    return (req, res, next) => {
        const token = req.cookies?.token;

        if (!token) {
            return res.status(401).json({
                message: "Authentication required"
            });
        }

        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET is missing");
            return res.status(500).json({
                message: "Internal server error"
            });
        }

        let decoded;

        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(401).json({
                message: "Invalid or expired token"
            });
        }

        if (
            !decoded ||
            typeof decoded !== "object" ||
            !decoded.id ||
            !["ADMIN", "EMPLOYEE"].includes(decoded.role)
        ) {
            return res.status(401).json({
                message: "Invalid token"
            });
        }

        req.user = {
            id: decoded.id,
            role: decoded.role
        };

        if (req.user.role !== requiredRole) {
            return res.status(403).json({
                message: "Access denied"
            });
        }

        next();
    };
};
const authUser = (req , res , next) => {
    const token = req.cookies?.token;

    if (!token) {
        return res.status(401).json({
            message: "Authentication required"
        });
    }

    if (!process.env.JWT_SECRET) {
        console.error("JWT_SECRET is missing");
        return res.status(500).json({
            message: "Internal server error"
        });
    }

    let decoded;

    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        return res.status(401).json({
            message: "Invalid or expired token"
        });
    }

    if (
        !decoded ||
        typeof decoded !== "object" ||
        !decoded.id ||
        !["ADMIN", "EMPLOYEE"].includes(decoded.role)
    ) {
        return res.status(401).json({
            message: "Invalid token"
        });
    }

    req.user = {
        id: decoded.id,
        role: decoded.role
    };

    next();
}
const authAdmin = createRoleAuth("ADMIN");
const authEmployee = createRoleAuth("EMPLOYEE");

module.exports = {
    authAdmin,
    authEmployee,
    authUser
};