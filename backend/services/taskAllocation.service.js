const taskModel = require("../models/task.model");
const employeeModel = require("../models/employee.model");
const leaveModel = require("../models/leave.model");
const attendanceModel = require("../models/attendance.model");
const { recordTaskActivity } = require("./taskActivity.service");
const { analyzeTaskWithGemini, getGeminiConfiguration } = require("./gemini.service");
const {
    WEIGHTS,
    normalizeSkillName,
    calculateSkillCompatibility,
    calculateCapacityScore,
    calculateWorkloadBalanceScore,
    calculateOverallScore,
    countWorkingDaysInclusive,
    calculateRemainingTaskHours,
} = require("../utils/allocationScoring");

const OPEN_TASK_STATUSES = ["TODO", "IN_PROGRESS", "BLOCKED", "IN_REVIEW"];
const ACTIVE_LEAVE_STATUSES = ["APPROVED", "PENDING"];

class AllocationServiceError extends Error {
    constructor(message, statusCode = 400, code = "ALLOCATION_ERROR") {
        super(message);
        this.name = "AllocationServiceError";
        this.statusCode = statusCode;
        this.code = code;
    }
}

const getIndiaDateKey = (date = new Date()) => {
    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).formatToParts(date);

    const values = {};
    for (const part of parts) values[part.type] = part.value;
    return `${values.year}-${values.month}-${values.day}`;
};

const getIndiaAttendanceDate = () => {
    return new Date(`${getIndiaDateKey()}T00:00:00.000Z`);
};

const sameId = (left, right) => String(left || "") === String(right || "");

const normalizeImportance = (value) => {
    const importance = String(value || "IMPORTANT").toUpperCase();
    return ["CRITICAL", "IMPORTANT", "OPTIONAL"].includes(importance)
        ? importance
        : "IMPORTANT";
};

function normalizeAIAnalysis(raw, task) {
    const complexity = String(raw?.complexity || "MEDIUM").toUpperCase();
    const requiredSkills = Array.isArray(raw?.requiredSkills)
        ? raw.requiredSkills
        : [];
    const cleanedSkills = [];
    const seenSkills = new Set();

    for (const skill of requiredSkills.slice(0, 8)) {
        const name = typeof skill?.name === "string" ? skill.name.trim().slice(0, 60) : "";
        const key = normalizeSkillName(name);
        const minimumLevel = Number(skill?.minimumLevel);

        if (!name || !key || !Number.isInteger(minimumLevel) || minimumLevel < 1 || minimumLevel > 5) {
            continue;
        }

        if (seenSkills.has(key)) continue;
        seenSkills.add(key);

        cleanedSkills.push({
            name,
            minimumLevel,
            importance: normalizeImportance(skill.importance),
        });
    }

    const merged = new Map();

    // Preserve skills that the administrator explicitly entered on the task.
    for (const skill of task.skillsRequired || []) {
        const name = String(skill.name || "").trim();
        const key = normalizeSkillName(name);
        if (!name || !key) continue;
        merged.set(key, {
            name,
            minimumLevel: Math.max(1, Math.min(5, Number(skill.minimumLevel) || 1)),
            importance: "IMPORTANT",
        });
    }

    // Add AI-extracted requirements without lowering any administrator-defined level.
    for (const skill of cleanedSkills) {
        const key = normalizeSkillName(skill.name);
        const existing = merged.get(key);

        if (existing) {
            existing.minimumLevel = Math.max(existing.minimumLevel, skill.minimumLevel);
            if (skill.importance === "CRITICAL") existing.importance = "CRITICAL";
        } else {
            merged.set(key, skill);
        }
    }

    const recommendedHours = Number(raw?.recommendedEstimatedHours);
    const safeHours = Number.isFinite(recommendedHours)
        ? Math.max(0.5, Math.min(500, recommendedHours))
        : Number(task.estimatedHours) || 1;

    return {
        summary: String(raw?.summary || "AI analysed the task requirements.").trim().slice(0, 500),
        complexity: ["LOW", "MEDIUM", "HIGH"].includes(complexity) ? complexity : "MEDIUM",
        recommendedEstimatedHours: Math.round(safeHours * 10) / 10,
        requiredSkills: [...merged.values()].map(({ name, minimumLevel, importance }) => ({
            name,
            minimumLevel,
            importance,
        })),
        allocationRationale: String(raw?.allocationRationale || "Recommendations are based on skills, capacity and current workload.").trim().slice(0, 600),
    };
}

function buildExclusion(employee, reason) {
    return {
        employeeId: String(employee._id),
        name: employee.userId?.name || "Employee",
        employeeCode: employee.employeeCode,
        reason,
    };
}

function buildCandidate(employee, skillResult, stats) {
    const capacityScore = calculateCapacityScore(stats.availableHours, stats.taskHours);
    const workloadScore = calculateWorkloadBalanceScore(
        stats.activeTaskCount,
        stats.maxConcurrentTasks
    );
    const totalScore = calculateOverallScore({
        skillScore: skillResult.score,
        capacityScore,
        workloadScore,
    });

    const reasons = [];

    if (skillResult.matchedSkills.length) {
        reasons.push(skillResult.explanation);
    }
    reasons.push(`${stats.availableHours.toFixed(1)} available hours remain in the task window before adding this task.`);
    reasons.push(`${stats.activeTaskCount} active overlapping task(s) out of ${stats.maxConcurrentTasks} allowed concurrently.`);

    if (stats.pendingLeave) {
        reasons.push("Has a pending leave request that overlaps the task dates; admin review is advised.");
    }

    if (stats.attendanceAdjustment) {
        reasons.push(stats.attendanceAdjustment);
    }

    return {
        employee: {
            id: String(employee._id),
            name: employee.userId?.name || "Employee",
            employeeCode: employee.employeeCode,
            designation: employee.designation,
            department: employee.departmentId?.name || "",
        },
        score: totalScore,
        scoreBreakdown: {
            skillCompatibility: skillResult.score,
            availableCapacity: capacityScore,
            workloadBalance: workloadScore,
            weights: WEIGHTS,
        },
        workload: {
            activeTasks: stats.activeTaskCount,
            maxConcurrentTasks: stats.maxConcurrentTasks,
            assignedHours: Math.round(stats.assignedHours * 10) / 10,
            availableHours: Math.round(stats.availableHours * 10) / 10,
            utilizationAfterAssignment: Math.round(stats.utilizationAfterAssignment * 10) / 10,
        },
        matchedSkills: skillResult.matchedSkills,
        missingSkills: skillResult.missingSkills,
        reasons,
        warnings: stats.pendingLeave ? ["Pending leave overlaps the task dates."] : [],
    };
}

async function getTaskAllocationRecommendations(taskId, requestedBy) {
    // Fail clearly before doing database work when the key is not configured.
    const { model } = getGeminiConfiguration();

    const task = await taskModel.findById(taskId).populate("departmentId", "name code");

    if (!task) {
        throw new AllocationServiceError("Task not found.", 404, "TASK_NOT_FOUND");
    }

    if (["COMPLETED", "CANCELLED"].includes(task.status)) {
        throw new AllocationServiceError("Closed tasks cannot receive allocation recommendations.", 409, "TASK_CLOSED");
    }

    const employees = await employeeModel.find({})
        .select("employeeCode designation employmentStatus departmentId userId skills capacity")
        .populate("userId", "name")
        .populate("departmentId", "name")
        .lean();

    const taskDepartmentId = String(task.departmentId?._id || task.departmentId);
    const sameDepartmentEmployees = employees.filter((employee) =>
        sameId(employee.departmentId?._id || employee.departmentId, taskDepartmentId)
    );

    const skillCatalog = sameDepartmentEmployees
        .filter((employee) => employee.employmentStatus === "ACTIVE")
        .flatMap((employee) => (employee.skills || []).map((skill) => skill.name))
        .filter(Boolean);

    const { parsed: rawAnalysis, model: actualModel } = await analyzeTaskWithGemini(task, skillCatalog);
    const analysis = normalizeAIAnalysis(rawAnalysis, task);

    const previousSkills = (task.skillsRequired || []).map((skill) => ({
        name: skill.name,
        minimumLevel: skill.minimumLevel,
    }));
    const nextSkills = analysis.requiredSkills.map((skill) => ({
        name: skill.name,
        minimumLevel: skill.minimumLevel,
    }));
    const skillsChanged = JSON.stringify(previousSkills) !== JSON.stringify(nextSkills);

    if (skillsChanged) {
        task.skillsRequired = nextSkills;
        task.updatedBy = requestedBy;
        await task.save();
        await recordTaskActivity({
            taskId: task._id,
            actor: requestedBy,
            action: "AI_ANALYZED",
            message: "AI analysed this task and updated its required skills.",
        });
    }

    const startDate = task.startDate || new Date();
    const dueDate = task.dueDate || startDate;
    const workingDays = countWorkingDaysInclusive(startDate, dueDate);
    const attendanceDate = getIndiaAttendanceDate();
    const includesToday = attendanceDate >= new Date(`${getIndiaDateKey(startDate)}T00:00:00.000Z`)
        && attendanceDate <= new Date(`${getIndiaDateKey(dueDate)}T23:59:59.999Z`);

    const employeeIds = sameDepartmentEmployees.map((employee) => employee._id);
    const [overlappingLeaves, attendanceRecords, overlappingTasks] = await Promise.all([
        employeeIds.length
            ? leaveModel.find({
                employeeId: { $in: employeeIds },
                status: { $in: ACTIVE_LEAVE_STATUSES },
                startDate: { $lte: dueDate },
                endDate: { $gte: startDate },
            }).select("employeeId status startDate endDate leaveType").lean()
            : [],
        employeeIds.length && includesToday
            ? attendanceModel.find({
                employeeId: { $in: employeeIds },
                attendanceDate,
            }).select("employeeId status").lean()
            : [],
        employeeIds.length
            ? taskModel.find({
                assignedTo: { $in: employeeIds },
                _id: { $ne: task._id },
                status: { $in: OPEN_TASK_STATUSES },
                startDate: { $lte: dueDate },
                dueDate: { $gte: startDate },
            }).select("assignedTo estimatedHours progressPercentage").lean()
            : [],
    ]);

    const leavesByEmployee = new Map();
    for (const leave of overlappingLeaves) {
        const key = String(leave.employeeId);
        if (!leavesByEmployee.has(key)) leavesByEmployee.set(key, []);
        leavesByEmployee.get(key).push(leave);
    }

    const attendanceByEmployee = new Map(
        attendanceRecords.map((record) => [String(record.employeeId), record])
    );

    const tasksByEmployee = new Map();
    for (const existingTask of overlappingTasks) {
        const key = String(existingTask.assignedTo);
        if (!tasksByEmployee.has(key)) tasksByEmployee.set(key, []);
        tasksByEmployee.get(key).push(existingTask);
    }

    const candidates = [];
    const excluded = [];

    for (const employee of employees) {
        const employeeId = String(employee._id);
        const name = employee.userId?.name || "Employee";

        if (employee.employmentStatus !== "ACTIVE") {
            excluded.push(buildExclusion(employee, `Employment status is ${employee.employmentStatus || "not active"}.`));
            continue;
        }

        if (!sameId(employee.departmentId?._id || employee.departmentId, taskDepartmentId)) {
            excluded.push(buildExclusion(employee, "Employee belongs to a different department."));
            continue;
        }

        const employeeLeaves = leavesByEmployee.get(employeeId) || [];
        const approvedLeave = employeeLeaves.find((leave) => leave.status === "APPROVED");

        if (approvedLeave) {
            excluded.push(buildExclusion(employee, "Approved leave overlaps the task dates."));
            continue;
        }

        const employeeTasks = tasksByEmployee.get(employeeId) || [];
        const capacity = employee.capacity || {};
        const maxConcurrentTasks = Math.max(1, Number(capacity.maxConcurrentTasks) || 5);

        if (employeeTasks.length >= maxConcurrentTasks) {
            excluded.push(buildExclusion(employee, `Already has ${employeeTasks.length} active overlapping tasks (limit: ${maxConcurrentTasks}).`));
            continue;
        }

        const weeklyHours = Math.max(0, Number(capacity.weeklyHours) || 40);
        const dailyHours = weeklyHours / 5;
        let capacityHours = dailyHours * workingDays;
        let attendanceAdjustment = "";
        const attendance = attendanceByEmployee.get(employeeId);

        if (attendance?.status === "ABSENT") {
            capacityHours = Math.max(0, capacityHours - dailyHours);
            attendanceAdjustment = "Today's recorded absence reduced available capacity by one workday.";
        } else if (attendance?.status === "HALF_DAY") {
            capacityHours = Math.max(0, capacityHours - dailyHours * 0.5);
            attendanceAdjustment = "Today's half-day attendance reduced available capacity by half a workday.";
        }
        // A missing attendance record is not interpreted as absence.

        const assignedHours = employeeTasks.reduce(
            (sum, existingTask) => sum + calculateRemainingTaskHours(existingTask),
            0
        );
        const availableHours = Math.max(0, capacityHours - assignedHours);
        const taskHours = Math.max(0, Number(task.estimatedHours) || 0);

        if (availableHours < taskHours) {
            excluded.push(buildExclusion(employee, `Insufficient capacity: ${availableHours.toFixed(1)} hours available, ${taskHours.toFixed(1)} hours required.`));
            continue;
        }

        const skillResult = calculateSkillCompatibility(
            employee.skills || [],
            analysis.requiredSkills
        );

        if (analysis.requiredSkills.length && skillResult.score === 0) {
            excluded.push(buildExclusion(employee, "No matching required skills were found in the employee profile."));
            continue;
        }

        const pendingLeave = employeeLeaves.some((leave) => leave.status === "PENDING");
        const utilizationAfterAssignment = capacityHours > 0
            ? ((assignedHours + taskHours) / capacityHours) * 100
            : 100;

        candidates.push(buildCandidate(employee, skillResult, {
            availableHours,
            taskHours,
            activeTaskCount: employeeTasks.length,
            maxConcurrentTasks,
            assignedHours,
            utilizationAfterAssignment,
            pendingLeave,
            attendanceAdjustment,
        }));
    }

    candidates.sort((a, b) =>
        b.score - a.score ||
        a.workload.activeTasks - b.workload.activeTasks ||
        a.employee.employeeCode.localeCompare(b.employee.employeeCode)
    );

    return {
        task: {
            id: String(task._id),
            title: task.title,
            department: task.departmentId?.name || "",
            priority: task.priority,
            estimatedHours: task.estimatedHours,
            startDate: task.startDate,
            dueDate: task.dueDate,
        },
        analysis: {
            ...analysis,
            requiredSkills: analysis.requiredSkills,
        },
        scoringWeights: {
            skillCompatibility: 40,
            availableCapacity: 35,
            workloadBalance: 25,
        },
        model: actualModel || model,
        candidates: candidates.slice(0, 10),
        excluded: excluded.slice(0, 20),
        counts: {
            employeesReviewed: employees.length,
            eligibleCandidates: candidates.length,
            excludedEmployees: excluded.length,
        },
        notes: [
            "The AI model analyses the task requirements; employee eligibility and scores are calculated by the backend.",
            "Only employees in the task's department are considered eligible.",
            "Pending leave is shown as a warning; approved leave is an exclusion.",
            "A missing attendance record is not treated as an absence.",
            "The AI's suggested hours do not overwrite the task's saved estimate.",
        ],
    };
}

module.exports = {
    getTaskAllocationRecommendations,
    AllocationServiceError,
};
