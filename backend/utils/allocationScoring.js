const WEIGHTS = Object.freeze({
    skillCompatibility: 0.4,
    availableCapacity: 0.35,
    workloadBalance: 0.25,
});

const SKILL_ALIASES = Object.freeze({
    "react.js": "react",
    reactjs: "react",
    "react js": "react",
    "node.js": "nodejs",
    "node js": "nodejs",
    "node-js": "nodejs",
    js: "javascript",
    "ecmascript": "javascript",
    "express.js": "express",
    expressjs: "express",
    "mongo db": "mongodb",
    "mongo-db": "mongodb",
    tailwindcss: "tailwind css",
    html5: "html",
    css3: "css",
    "c++": "cpp",
});

const clamp = (value, min = 0, max = 100) => Math.min(max, Math.max(min, value));

function normalizeSkillName(value) {
    const cleaned = String(value || "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");

    return SKILL_ALIASES[cleaned] || cleaned;
}

function calculateSkillCompatibility(employeeSkills = [], requiredSkills = []) {
    if (!requiredSkills.length) {
        return {
            score: 50,
            matchedSkills: [],
            missingSkills: [],
            explanation: "No specific skills were extracted; skill compatibility is neutral.",
        };
    }

    const employeeSkillMap = new Map();

    for (const skill of employeeSkills) {
        const key = normalizeSkillName(skill.name);
        if (!key) continue;

        const current = employeeSkillMap.get(key) || 0;
        employeeSkillMap.set(key, Math.max(current, Number(skill.proficiencyLevel) || 0));
    }

    const importanceWeights = {
        CRITICAL: 3,
        IMPORTANT: 2,
        OPTIONAL: 1,
    };

    let weightedScore = 0;
    let totalWeight = 0;
    const matchedSkills = [];
    const missingSkills = [];

    for (const required of requiredSkills) {
        const key = normalizeSkillName(required.name);
        const minimumLevel = clamp(Number(required.minimumLevel) || 1, 1, 5);
        const importance = String(required.importance || "IMPORTANT").toUpperCase();
        const weight = importanceWeights[importance] || 2;
        const actualLevel = employeeSkillMap.get(key);

        totalWeight += weight;

        if (actualLevel == null) {
            missingSkills.push(required.name);
            continue;
        }

        const matchScore = clamp((actualLevel / minimumLevel) * 100);
        weightedScore += matchScore * weight;
        matchedSkills.push({
            name: required.name,
            employeeLevel: actualLevel,
            requiredLevel: minimumLevel,
            meetsRequirement: actualLevel >= minimumLevel,
        });
    }

    const score = totalWeight ? weightedScore / totalWeight : 50;

    return {
        score: Math.round(score),
        matchedSkills,
        missingSkills,
        explanation: `${matchedSkills.filter((skill) => skill.meetsRequirement).length} of ${requiredSkills.length} required skills meet the requested proficiency level.`,
    };
}

function calculateCapacityScore(availableHours, taskHours) {
    const available = Math.max(0, Number(availableHours) || 0);
    const required = Math.max(0, Number(taskHours) || 0);

    if (required <= 0) return 100;
    if (available < required) return 0;
    if (available === 0) return 0;

    return Math.round(clamp(((available - required) / available) * 100));
}

function calculateWorkloadBalanceScore(activeTaskCount, maxConcurrentTasks) {
    const active = Math.max(0, Number(activeTaskCount) || 0);
    const maximum = Math.max(1, Number(maxConcurrentTasks) || 1);

    return Math.round(clamp((1 - active / maximum) * 100));
}

function calculateOverallScore({ skillScore, capacityScore, workloadScore }) {
    return Math.round(
        skillScore * WEIGHTS.skillCompatibility +
        capacityScore * WEIGHTS.availableCapacity +
        workloadScore * WEIGHTS.workloadBalance
    );
}

function countWorkingDaysInclusive(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) {
        return 1;
    }

    const cursor = new Date(Date.UTC(
        start.getUTCFullYear(),
        start.getUTCMonth(),
        start.getUTCDate()
    ));
    const lastDay = Date.UTC(
        end.getUTCFullYear(),
        end.getUTCMonth(),
        end.getUTCDate()
    );

    let workingDays = 0;

    while (cursor.getTime() <= lastDay) {
        const day = cursor.getUTCDay();
        if (day !== 0 && day !== 6) workingDays += 1;
        cursor.setUTCDate(cursor.getUTCDate() + 1);
    }

    return Math.max(1, workingDays);
}

function calculateRemainingTaskHours(task) {
    const estimatedHours = Math.max(0, Number(task.estimatedHours) || 0);
    const progress = clamp(Number(task.progressPercentage) || 0);
    return Math.max(0, estimatedHours * (1 - progress / 100));
}

module.exports = {
    WEIGHTS,
    normalizeSkillName,
    calculateSkillCompatibility,
    calculateCapacityScore,
    calculateWorkloadBalanceScore,
    calculateOverallScore,
    countWorkingDaysInclusive,
    calculateRemainingTaskHours,
};
