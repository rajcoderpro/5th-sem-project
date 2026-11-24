const express = require("express");
const router = express.Router();

const aiController = require("../controllers/ai.controller");
const { authAdmin } = require("../middlewares/auth.middleware");
const { createRateLimiter } = require("../middlewares/rateLimit.middleware");

const aiRequestLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 12,
    message: "Too many AI recommendation requests. Please wait 15 minutes before trying again.",
});

router.get("/status", authAdmin, aiController.getAIStatus);
router.post("/tasks/:taskId/recommendations", authAdmin, aiRequestLimiter, aiController.getTaskRecommendations);

module.exports = router;
