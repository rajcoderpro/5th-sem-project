const taskActivityModel = require("../models/taskActivity.model");

async function recordTaskActivity(data) {
    try {
        if (!data?.taskId || !data?.actor || !data?.action || !data?.message) {
            return null;
        }

        return await taskActivityModel.create(data);
    } catch (error) {
        // The activity feed is audit support and must not block the main task API.
        console.error("Task activity recording failed:", error.message);
        return null;
    }
}

module.exports = { recordTaskActivity };
