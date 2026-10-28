
require( "dotenv" ).config();

const mongoose = require( "mongoose" );
const bcrypt = require( "bcryptjs" );

const userModel = require( "./models/user.model" );
const departmentModel = require( "./models/department.model" );

const users = [
    {
        name: "System Admin",
        email: "admin@workforce.local",
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

async function seedDepartments( adminId ) {
    for ( const data of departments ) {
        const existingByName = await departmentModel.findOne( {
            name: data.name,
        } );

        const existingByCode = await departmentModel.findOne( {
            code: data.code,
        } );

        if ( existingByName || existingByCode ) {
            const sameDepartment =
                existingByName &&
                existingByCode &&
                existingByName._id.equals( existingByCode._id );

            if ( !sameDepartment ) {
                throw new Error(
                    `Department name/code conflict for ${data.name} (${data.code})`
                );
            }

            console.log( `Skipped existing department: ${data.name}` );
            continue;
        }

        await departmentModel.create( {
            name: data.name,
            code: data.code,
            description: data.description,
            createdBy: adminId,
        } );

        console.log( `Created department: ${data.name}` );
    }
}

async function seedDatabase() {
    if ( process.env.NODE_ENV === "production" ) {
        throw new Error( "Seed script is disabled in production." );
    }

    const mongoUri =
        process.env.MONGOOSE_URI || process.env.MONGODB_URI;

    if ( !mongoUri ) {
        throw new Error( "MongoDB connection string is missing from .env" );
    }

    await mongoose.connect( mongoUri );
    console.log( "MongoDB connected" );

    const seededUsers = await seedUsers();

    const admin = seededUsers["admin@workforce.local"];

    await seedDepartments( admin._id );

    console.log( "Database seeding completed successfully!" );
}

seedDatabase()
    .catch( ( error ) => {
        console.error( "Seeding failed:", error.message );
        process.exitCode = 1;
    } )
    .finally( async () => {
        await mongoose.disconnect();
    } );
