const test = require("node:test");
const assert = require("node:assert/strict");
const {
    normalizeSkillName,
    calculateSkillCompatibility,
    calculateCapacityScore,
    calculateWorkloadBalanceScore,
    calculateOverallScore,
    countWorkingDaysInclusive,
    calculateRemainingTaskHours,
} = require("../utils/allocationScoring");

test("skill names normalize common technology aliases", () => {
    assert.equal(normalizeSkillName("React.js"), "react");
    assert.equal(normalizeSkillName("Node JS"), "nodejs");
    assert.equal(normalizeSkillName("JS"), "javascript");
});

test("skill compatibility rewards matches and reports missing requirements", () => {
    const result = calculateSkillCompatibility(
        [
            { name: "React.js", proficiencyLevel: 4 },
            { name: "Node.js", proficiencyLevel: 2 },
        ],
        [
            { name: "React", minimumLevel: 3, importance: "CRITICAL" },
            { name: "NodeJS", minimumLevel: 3, importance: "IMPORTANT" },
            { name: "MongoDB", minimumLevel: 2, importance: "OPTIONAL" },
        ]
    );

    assert.equal(result.matchedSkills.length, 2);
    assert.deepEqual(result.missingSkills, ["MongoDB"]);
    assert.ok(result.score > 0 && result.score < 100);
});

test("capacity and workload scores remain within a 0 to 100 range", () => {
    assert.equal(calculateCapacityScore(20, 5), 75);
    assert.equal(calculateCapacityScore(4, 5), 0);
    assert.equal(calculateWorkloadBalanceScore(0, 5), 100);
    assert.equal(calculateWorkloadBalanceScore(5, 5), 0);
});

test("overall score uses the configured 40/35/25 weights", () => {
    assert.equal(
        calculateOverallScore({ skillScore: 100, capacityScore: 100, workloadScore: 100 }),
        100
    );
    assert.equal(
        calculateOverallScore({ skillScore: 100, capacityScore: 0, workloadScore: 0 }),
        40
    );
});

test("working-day count excludes weekend days and includes weekdays", () => {
    // Monday 2026-11-16 through Friday 2026-11-20.
    assert.equal(
        countWorkingDaysInclusive(new Date("2026-11-16T00:00:00.000Z"), new Date("2026-11-20T00:00:00.000Z")),
        5
    );
});

test("remaining task hours decrease with recorded progress", () => {
    assert.equal(calculateRemainingTaskHours({ estimatedHours: 20, progressPercentage: 25 }), 15);
    assert.equal(calculateRemainingTaskHours({ estimatedHours: 20, progressPercentage: 100 }), 0);
});
