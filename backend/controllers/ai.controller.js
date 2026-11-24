const mongoose = require("mongoose");
const {
    getTaskAllocationRecommendations,
} = require("../services/taskAllocation.service");
const {
    getGeminiConfiguration,
    GeminiServiceError,
} = require("../services/gemini.service");

const getAIStatus = (req, res) => {
    try {
        const { model } = getGeminiConfiguration();
        return res.status(200).json({
            configured: true,
            provider: "Google Gemini",
            model,
        });
    } catch (error) {
        if (error.code === "AI_NOT_CONFIGURED") {
            return res.status(200).json({
                configured: false,
                provider: "Google Gemini",
                model: process.env.GEMINI_MODEL || "gemini-3.8-flash",
            });
        }

        return res.status(error.statusCode || 500).json({
            message: error.message || "Unable to read AI configuration.",
        });
    }
};

const getTaskRecommendations = async (req, res) => {
    const { taskId } = req.params;

    if (!mongoose.isValidObjectId(taskId)) {
        return res.status(400).json({ message: "A valid task ID is required." });
    }

    try {
        const result = await getTaskAllocationRecommendations(taskId, req.user.id);
        return res.status(200).json({
            message: "AI task analysis and employee recommendations generated successfully.",
            ...result,
        });
    } catch (error) {
        if (error instanceof GeminiServiceError || error.statusCode) {
            return res.status(error.statusCode || 500).json({
                message: error.message || "Unable to generate AI recommendations.",
                code: error.code || "AI_ALLOCATION_ERROR",
            });
        }

        console.error("AI recommendation controller error:", error);
        return res.status(500).json({
            message: "Unable to generate employee recommendations.",
        });
    }
};

module.exports = {
    getAIStatus,
    getTaskRecommendations,
};
