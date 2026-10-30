
const express = require("express");

const authController = require("../controllers/auth.controller");
const { authUser } = require("../middlewares/auth.middleware");

const router = express.Router();

router.post("/register", authController.registerUser);
router.post("/login", authController.loginUser);

router.get("/me", authUser, authController.getCurrentUser);

router.post("/logout", authController.logoutUser);

module.exports = router;
