const express = require("express");
const router = express.Router();

const taskController = require("../controllers/tasks.controller");
const { authAdmin, authEmployee, authUser } = require("../middlewares/auth.middleware");

router.post("/", authAdmin, taskController.createTask);
router.get("/", authAdmin, taskController.getAllTasks);
router.get("/me", authEmployee, taskController.getMyTasks);
router.get("/:id", authUser, taskController.getTaskById);
router.put("/:id", authAdmin, taskController.updateTask);
router.patch("/:id/assign", authAdmin, taskController.assignTask);
router.patch("/:id/status", authUser, taskController.updateTaskStatus);

module.exports = router;
