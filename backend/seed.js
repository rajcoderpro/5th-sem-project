
// Run from the backend directory with: node seed.js
// Required in backend/.env: MONGOOSE_URI, SEED_ADMIN_PASSWORD,
// and SEED_EMPLOYEE_PASSWORD.
const mongoose = require('mongoose')
require( "dotenv" ).config();

async function seedDatabase() {
    const mongoUri = process.env.MONGOOSE_URI;

    if (!mongoUri) {
        throw new Error("Missing MONGOOSE_URI in your .env file");
    }

    await mongoose.connect(mongoUri);
const employeeModel = require("./models/employee.model");
const taskModel = require("./models/task.model");
const bcrypt = require( "bcryptjs" );

const userModel = require( "./models/user.model" );
const departmentModel = require( "./models/department.model" );

const users = [
    {
        name: "Raj",
        email: "admin@workforce.local",
        role: "ADMIN",
        passwordEnv: "SEED_ADMIN_PASSWORD",
    },
    {
        name: "Rachit",
        email: "rachit@workforce.local",
        role: "ADMIN",
        passwordEnv: "SEED_ADMIN_PASSWORD",
    },
    {
        name: "Aarav Sharma",
        email: "aarav@workforce.local",
        role: "EMPLOYEE",
        passwordEnv: "SEED_EMPLOYEE_PASSWORD",
    },
    {
        name: "Priya Verma",
        email: "priya@workforce.local",
        role: "EMPLOYEE",
        passwordEnv: "SEED_EMPLOYEE_PASSWORD",
    },
    {
        name: "Kabir Singh",
        email: "kabir@workforce.local",
        role: "EMPLOYEE",
        passwordEnv: "SEED_EMPLOYEE_PASSWORD",
    },
    {
        name: "Ananya Gupta",
        email: "ananya@workforce.local",
        role: "EMPLOYEE",
        passwordEnv: "SEED_EMPLOYEE_PASSWORD",
    },
    {
        name: "Rohan Mehta",
        email: "rohan@workforce.local",
        role: "EMPLOYEE",
        passwordEnv: "SEED_EMPLOYEE_PASSWORD",
    },
    {
        name: "Ishita Kapoor",
        email: "ishita@workforce.local",
        role: "EMPLOYEE",
        passwordEnv: "SEED_EMPLOYEE_PASSWORD",
    },
    {
        name: "Arjun Malhotra",
        email: "arjun@workforce.local",
        role: "EMPLOYEE",
        passwordEnv: "SEED_EMPLOYEE_PASSWORD",
    },
    {
        name: "Sneha Reddy",
        email: "sneha@workforce.local",
        role: "EMPLOYEE",
        passwordEnv: "SEED_EMPLOYEE_PASSWORD",
    },
    {
        name: "Aditya Joshi",
        email: "aditya@workforce.local",
        role: "EMPLOYEE",
        passwordEnv: "SEED_EMPLOYEE_PASSWORD",
    },
    {
        name: "Meera Iyer",
        email: "meera@workforce.local",
        role: "EMPLOYEE",
        passwordEnv: "SEED_EMPLOYEE_PASSWORD",
    },
    {
        name: "Vikram Patel",
        email: "vikram@workforce.local",
        role: "EMPLOYEE",
        passwordEnv: "SEED_EMPLOYEE_PASSWORD",
    },
    {
        name: "Kavya Nair",
        email: "kavya@workforce.local",
        role: "EMPLOYEE",
        passwordEnv: "SEED_EMPLOYEE_PASSWORD",
    },
    {
        name: "Rahul Verma",
        email: "rahul.verma@workforce.local",
        role: "EMPLOYEE",
        passwordEnv: "SEED_EMPLOYEE_PASSWORD",
    },
    {
        name: "Simran Kaur",
        email: "simran@workforce.local",
        role: "EMPLOYEE",
        passwordEnv: "SEED_EMPLOYEE_PASSWORD",
    },
    {
        name: "Dev Patel",
        email: "dev@workforce.local",
        role: "EMPLOYEE",
        passwordEnv: "SEED_EMPLOYEE_PASSWORD",
    },
    {
        name: "Neha Agarwal",
        email: "neha@workforce.local",
        role: "EMPLOYEE",
        passwordEnv: "SEED_EMPLOYEE_PASSWORD",
    },
    {
        name: "Karan Oberoi",
        email: "karan@workforce.local",
        role: "EMPLOYEE",
        passwordEnv: "SEED_EMPLOYEE_PASSWORD",
    },
    {
        name: "Pooja Mishra",
        email: "pooja@workforce.local",
        role: "EMPLOYEE",
        passwordEnv: "SEED_EMPLOYEE_PASSWORD",
    },
    {
        name: "Yash Thakur",
        email: "yash@workforce.local",
        role: "EMPLOYEE",
        passwordEnv: "SEED_EMPLOYEE_PASSWORD",
    },
    {
        name: "Tanya Sinha",
        email: "tanya@workforce.local",
        role: "EMPLOYEE",
        passwordEnv: "SEED_EMPLOYEE_PASSWORD",
    },
    {
        name: "Manish Kumar",
        email: "manish@workforce.local",
        role: "EMPLOYEE",
        passwordEnv: "SEED_EMPLOYEE_PASSWORD",
    },
    {
        name: "Riya Chawla",
        email: "riya@workforce.local",
        role: "EMPLOYEE",
        passwordEnv: "SEED_EMPLOYEE_PASSWORD",
    },
    {
        name: "Siddharth Rao",
        email: "siddharth@workforce.local",
        role: "EMPLOYEE",
        passwordEnv: "SEED_EMPLOYEE_PASSWORD",
    },
    {
        name: "Aditi Saxena",
        email: "aditi@workforce.local",
        role: "EMPLOYEE",
        passwordEnv: "SEED_EMPLOYEE_PASSWORD",
    },
    {
        name: "Nikhil Bansal",
        email: "nikhil@workforce.local",
        role: "EMPLOYEE",
        passwordEnv: "SEED_EMPLOYEE_PASSWORD",
    },
    {
        name: "Shreya Das",
        email: "shreya@workforce.local",
        role: "EMPLOYEE",
        passwordEnv: "SEED_EMPLOYEE_PASSWORD",
    },
    {
        name: "Varun Khanna",
        email: "varun@workforce.local",
        role: "EMPLOYEE",
        passwordEnv: "SEED_EMPLOYEE_PASSWORD",
    },
    {
        name: "Divya Menon",
        email: "divya@workforce.local",
        role: "EMPLOYEE",
        passwordEnv: "SEED_EMPLOYEE_PASSWORD",
    },
    {
        name: "Akash Yadav",
        email: "akash@workforce.local",
        role: "EMPLOYEE",
        passwordEnv: "SEED_EMPLOYEE_PASSWORD",
    },
    {
        name: "Nandini Bose",
        email: "nandini@workforce.local",
        role: "EMPLOYEE",
        passwordEnv: "SEED_EMPLOYEE_PASSWORD",
    },
    {
        name: "Harsh Shah",
        email: "harsh@workforce.local",
        role: "EMPLOYEE",
        passwordEnv: "SEED_EMPLOYEE_PASSWORD",
    },
    {
        name: "Ira Desai",
        email: "ira@workforce.local",
        role: "EMPLOYEE",
        passwordEnv: "SEED_EMPLOYEE_PASSWORD",
    },
    {
        name: "Sahil Arora",
        email: "sahil@workforce.local",
        role: "EMPLOYEE",
        passwordEnv: "SEED_EMPLOYEE_PASSWORD",
    },
    {
        name: "Maya Thomas",
        email: "maya@workforce.local",
        role: "EMPLOYEE",
        passwordEnv: "SEED_EMPLOYEE_PASSWORD",
    },
];
const departments = [
    {
        name: "Engineering",
        code: "ENG",
        description: "Software development and engineering",
    },
    {
        name: "Human Resources",
        code: "HR",
        description: "Employee management and recruitment",
    },
    {
        name: "Marketing",
        code: "MKT",
        description: "Marketing and brand management",
    },
    {
        name: "Finance",
        code: "FIN",
        description: "Financial planning and operations",
    },
    {
        name: "Product",
        code: "PROD",
        description: "Product strategy, discovery, and delivery",
    },
    {
        name: "Data & Analytics",
        code: "DATA",
        description: "Business intelligence, reporting, and data engineering",
    },
    {
        name: "Sales",
        code: "SALES",
        description: "Business development and customer relationships",
    },
    {
        name: "Operations",
        code: "OPS",
        description: "Business operations and process improvement",
    },
];

async function seedUsers() {
    const createdUsers = {};

    for ( const data of users ) {
        const password = process.env[data.passwordEnv];

        if ( !password ) {
            throw new Error(
                `Missing ${data.passwordEnv} in your .env file`
            );
        }

        const email = data.email.toLowerCase().trim();
        const passwordHash = await bcrypt.hash( password, 10 );

        const user = await userModel.findOneAndUpdate(
            { email },
            {
                $set: {
                    name: data.name,
                    email,
                    password: passwordHash,
                    role: data.role,
                },
            },
            {
                upsert: true,
                new: true,
                runValidators: true,
                setDefaultsOnInsert: true,
            }
        );

        createdUsers[email] = user;

        console.log( `Seeded user: ${email} (${data.role})` );
    }

    return createdUsers;
}


async function seedDepartments(adminId) {
    const departmentsByCode = {};

    for (const data of departments) {
        const existingByName = await departmentModel.findOne({
            name: data.name,
        });

        const existingByCode = await departmentModel.findOne({
            code: data.code,
        });

        if (existingByName || existingByCode) {
            const sameDepartment =
                existingByName &&
                existingByCode &&
                existingByName._id.equals(existingByCode._id);

            if (!sameDepartment) {
                throw new Error(
                    `Department name/code conflict for ${data.name} (${data.code})`
                );
            }

            departmentsByCode[data.code] = existingByCode;

            console.log(`Found existing department: ${data.name}`);
            continue;
        }

        const department = await departmentModel.create({
            name: data.name,
            code: data.code,
            description: data.description,
            createdBy: adminId,
        });

        departmentsByCode[data.code] = department;

        console.log(`Created department: ${data.name}`);
    }

    return departmentsByCode;
}

async function seedEmployees(seededUsers, departmentsByCode, adminId) {
    const employeeUsers = users.filter(
        (user) => user.role === "EMPLOYEE"
    );

    const departmentCodes = ["ENG", "HR", "MKT", "FIN", "PROD", "DATA", "SALES", "OPS"];

    const skillSets = {
        ENG: ["JavaScript", "React", "Node.js"],
        HR: ["Recruitment", "Communication", "HR Operations"],
        MKT: ["Content Strategy", "SEO", "Marketing Analytics"],
        FIN: ["Financial Analysis", "Excel", "Budgeting"],
        PROD: ["Product Strategy", "User Research", "Agile"],
        DATA: ["SQL", "Data Analysis", "Power BI"],
        SALES: ["Negotiation", "CRM", "Communication"],
        OPS: ["Process Improvement", "Project Management", "Excel"],
    };

    const designations = {
        ENG: "Software Engineer",
        HR: "HR Executive",
        MKT: "Marketing Associate",
        FIN: "Financial Analyst",
        PROD: "Product Associate",
        DATA: "Data Analyst",
        SALES: "Account Executive",
        OPS: "Operations Coordinator",
    };

    const employeeByEmail = {};

    for (let i = 0; i < employeeUsers.length; i++) {
        const data = employeeUsers[i];
        const email = data.email.toLowerCase().trim();

        const user = seededUsers[email];

        if (!user) {
            throw new Error(`User not found for employee: ${email}`);
        }

        const departmentCode =
            departmentCodes[i % departmentCodes.length];

        const department = departmentsByCode[departmentCode];

        if (!department) {
            throw new Error(
                `Department not found: ${departmentCode}`
            );
        }

        const skills = skillSets[departmentCode].map(
            (name, skillIndex) => ({
                name,
                proficiencyLevel: Math.min(
                    5,
                    2 + ((i + skillIndex) % 4)
                ),
                yearsOfExperience: 1 + ((i + skillIndex) % 4),
            })
        );

        const employeeCode =
            `DEMO${String(i + 1).padStart(3, "0")}`;

        const joiningDate = new Date(
            Date.now() - (90 + i * 15) * 24 * 60 * 60 * 1000
        );

        const employee = await employeeModel.findOneAndUpdate(
            { userId: user._id },
            {
                $set: {
                    userId: user._id,
                    employeeCode,
                    departmentId: department._id,
                    managerId: null,
                    designation: designations[departmentCode],
                    employmentType: "FULL_TIME",
                    employmentStatus: "ACTIVE",
                    joiningDate,
                    workMode: ["ONSITE", "HYBRID", "REMOTE"][i % 3],
                    skills,
                    capacity: {
                        weeklyHours: i % 5 === 0 ? 30 : 40,
                        maxConcurrentTasks: 3 + (i % 3),
                    },
                    profile: {
                        bio: `Demo employee - ${department.name} team`,
                        location: "Faridabad",
                    },
                    createdBy: adminId,
                },
            },
            {
                upsert: true,
                new: true,
                runValidators: true,
                setDefaultsOnInsert: true,
            }
        );

        employeeByEmail[email] = employee;

        console.log(
            `Seeded employee: ${employee.employeeCode} - ${data.name}`
        );
    }

    return employeeByEmail;
}

async function seedTasks(seededUsers, employeeByEmail) {
    const day = 24 * 60 * 60 * 1000;
    const now = Date.now();

    const taskSeeds = [
        {
            title: "Implement authentication middleware",
            email: "aarav@workforce.local",
            priority: "HIGH",
            status: "IN_PROGRESS",
            dueInDays: 2,
            estimatedHours: 8,
            actualHours: 3,
            progress: 45,
            skills: [
                { name: "Node.js", minimumLevel: 3 },
                { name: "JavaScript", minimumLevel: 3 },
            ],
        },
        {
            title: "Review employee onboarding checklist",
            email: "priya@workforce.local",
            priority: "MEDIUM",
            status: "TODO",
            dueInDays: 4,
            estimatedHours: 4,
            actualHours: 0,
            progress: 0,
            skills: [
                { name: "HR Operations", minimumLevel: 2 },
                { name: "Communication", minimumLevel: 2 },
            ],
        },
        {
            title: "Prepare workforce campaign assets",
            email: "kabir@workforce.local",
            priority: "HIGH",
            status: "IN_REVIEW",
            dueInDays: 1,
            estimatedHours: 6,
            actualHours: 6,
            progress: 100,
            skills: [
                { name: "Content Strategy", minimumLevel: 2 },
            ],
        },
        {
            title: "Prepare monthly budget summary",
            email: "ananya@workforce.local",
            priority: "MEDIUM",
            status: "COMPLETED",
            dueInDays: -2,
            estimatedHours: 6,
            actualHours: 5,
            progress: 100,
            completedDaysAgo: 1,
            skills: [
                { name: "Financial Analysis", minimumLevel: 2 },
                { name: "Excel", minimumLevel: 2 },
            ],
        },
        {
            title: "Build task assignment endpoint",
            email: "rohan@workforce.local",
            priority: "URGENT",
            status: "BLOCKED",
            dueInDays: -1,
            estimatedHours: 10,
            actualHours: 4,
            progress: 35,
            skills: [
                { name: "Node.js", minimumLevel: 3 },
                { name: "JavaScript", minimumLevel: 3 },
            ],
        },
        {
            title: "Update leave policy documentation",
            email: "ishita@workforce.local",
            priority: "LOW",
            status: "TODO",
            dueInDays: 7,
            estimatedHours: 3,
            actualHours: 0,
            progress: 0,
            skills: [
                { name: "HR Operations", minimumLevel: 2 },
            ],
        },
        {
            title: "Analyze campaign performance",
            email: "arjun@workforce.local",
            priority: "HIGH",
            status: "IN_PROGRESS",
            dueInDays: 5,
            estimatedHours: 8,
            actualHours: 3,
            progress: 65,
            skills: [
                { name: "Marketing Analytics", minimumLevel: 3 },
                { name: "SEO", minimumLevel: 2 },
            ],
        },
        {
            title: "Reconcile monthly expense entries",
            email: "sneha@workforce.local",
            priority: "MEDIUM",
            status: "TODO",
            dueInDays: 6,
            estimatedHours: 4,
            actualHours: 0,
            progress: 0,
            skills: [
                { name: "Excel", minimumLevel: 2 },
                { name: "Financial Analysis", minimumLevel: 2 },
            ],
        },
        {
            title: "Develop employee skills API",
            email: "aditya@workforce.local",
            priority: "URGENT",
            status: "IN_PROGRESS",
            dueInDays: 3,
            estimatedHours: 12,
            actualHours: 5,
            progress: 50,
            skills: [
                { name: "Node.js", minimumLevel: 3 },
                { name: "JavaScript", minimumLevel: 3 },
            ],
        },
        {
            title: "Analyze employee onboarding feedback",
            email: "meera@workforce.local",
            priority: "LOW",
            status: "COMPLETED",
            dueInDays: -3,
            estimatedHours: 5,
            actualHours: 4,
            progress: 100,
            completedDaysAgo: 2,
            skills: [
                { name: "Communication", minimumLevel: 2 },
                { name: "HR Operations", minimumLevel: 2 },
            ],
        },
        {
            title: "Prepare product launch content",
            email: "vikram@workforce.local",
            priority: "MEDIUM",
            status: "CANCELLED",
            dueInDays: -1,
            estimatedHours: 7,
            actualHours: 1,
            progress: 0,
            skills: [
                { name: "Content Strategy", minimumLevel: 2 },
            ],
        },
        {
            title: "Create finance dashboard report",
            email: "kavya@workforce.local",
            priority: "HIGH",
            status: "TODO",
            dueInDays: 10,
            estimatedHours: 8,
            actualHours: 0,
            progress: 0,
            skills: [
                { name: "Excel", minimumLevel: 3 },
                { name: "Financial Analysis", minimumLevel: 2 },
            ],
        },
        {
            title: "Document product discovery findings",
            email: "rahul.verma@workforce.local",
            priority: "MEDIUM",
            status: "IN_PROGRESS",
            dueInDays: 4,
            estimatedHours: 6,
            actualHours: 2,
            progress: 35,
            skills: [{ name: "User Research", minimumLevel: 2 }],
        },
        {
            title: "Build quarterly hiring and headcount report",
            email: "simran@workforce.local",
            priority: "HIGH",
            status: "TODO",
            dueInDays: 5,
            estimatedHours: 7,
            actualHours: 0,
            progress: 0,
            skills: [{ name: "Excel", minimumLevel: 2 }],
        },
        {
            title: "Prepare customer renewal proposals",
            email: "dev@workforce.local",
            priority: "HIGH",
            status: "IN_PROGRESS",
            dueInDays: 3,
            estimatedHours: 5,
            actualHours: 2,
            progress: 40,
            skills: [{ name: "Communication", minimumLevel: 2 }],
        },
        {
            title: "Review monthly sales pipeline",
            email: "neha@workforce.local",
            priority: "MEDIUM",
            status: "IN_REVIEW",
            dueInDays: 1,
            estimatedHours: 4,
            actualHours: 4,
            progress: 100,
            skills: [{ name: "CRM", minimumLevel: 2 }],
        },
        {
            title: "Automate weekly operations report",
            email: "karan@workforce.local",
            priority: "URGENT",
            status: "TODO",
            dueInDays: 2,
            estimatedHours: 8,
            actualHours: 0,
            progress: 0,
            skills: [{ name: "Excel", minimumLevel: 2 }],
        },
        {
            title: "Analyze customer support trends",
            email: "pooja@workforce.local",
            priority: "LOW",
            status: "COMPLETED",
            dueInDays: -2,
            estimatedHours: 5,
            actualHours: 4,
            progress: 100,
            completedDaysAgo: 1,
            skills: [{ name: "Data Analysis", minimumLevel: 2 }],
        },
        {
            title: "Coordinate cross-team release readiness",
            email: "yash@workforce.local",
            priority: "HIGH",
            status: "BLOCKED",
            dueInDays: 2,
            estimatedHours: 6,
            actualHours: 3,
            progress: 50,
            skills: [{ name: "Project Management", minimumLevel: 2 }],
        },
        {
            title: "Prepare product adoption dashboard",
            email: "tanya@workforce.local",
            priority: "MEDIUM",
            status: "TODO",
            dueInDays: 8,
            estimatedHours: 6,
            actualHours: 0,
            progress: 0,
            skills: [{ name: "Power BI", minimumLevel: 2 }],
        },
    ];

    const admin = seededUsers["admin@workforce.local"];

    if (!admin) {
        throw new Error("Seed admin account was not found");
    }

    for (const data of taskSeeds) {
        const email = data.email.toLowerCase();
        const employee = employeeByEmail[email];

        if (!employee) {
            throw new Error(
                `Employee not found for task: ${data.title}`
            );
        }

        const startDate = new Date(now - 3 * day);
        const dueDate = new Date(now + data.dueInDays * day);

        const completedAt =
            data.status === "COMPLETED"
                ? new Date(
                    now - (data.completedDaysAgo || 1) * day
                )
                : null;

        const taskData = {
            title: data.title,
            description: `Demo task for ${employee.designation}`,
            createdBy: admin._id,
            updatedBy: admin._id,
            assignedTo: employee._id,
            departmentId: employee.departmentId,
            status: data.status,
            priority: data.priority,
            startDate,
            dueDate,
            estimatedHours: data.estimatedHours,
            actualHours: data.actualHours,
            progressPercentage: data.progress,
            skillsRequired: data.skills,
            tags: ["demo-seed"],
            completedAt,
        };

        await taskModel.findOneAndUpdate(
            {
                title: data.title,
                tags: "demo-seed",
            },
            { $set: taskData },
            {
                upsert: true,
                new: true,
                runValidators: true,
                setDefaultsOnInsert: true,
            }
        );

        console.log(`Seeded task: ${data.title}`);
    }
}


    console.log("MongoDB connected");

    const seededUsers = await seedUsers();

    const admin = seededUsers["admin@workforce.local"];

    if (!admin) {
        throw new Error("Seed admin account was not found");
    }

    const departmentsByCode = await seedDepartments(admin._id);

    const employeeByEmail = await seedEmployees(
        seededUsers,
        departmentsByCode,
        admin._id
    );

    await seedTasks(seededUsers, employeeByEmail);

    console.log("Database seeding completed successfully!");
    console.log(`Users: ${users.length}`);
    console.log(`Departments: ${departments.length}`);
    console.log(`Employee profiles: ${Object.keys(employeeByEmail).length}`);
    console.log("Demo tasks: 20");
}

seedDatabase()
    .catch( ( error ) => {
        console.error( "Seeding failed:", error.message );
        process.exitCode = 1;
    } )
    .finally( async () => {
        await mongoose.disconnect();
    } );
