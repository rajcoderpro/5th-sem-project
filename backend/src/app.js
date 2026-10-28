require("dotenv").config()
const express = require( "express" );
const cookieParser = require("cookie-parser")
const authRoutes = require('../routes/auth.routes')
const departmentsRoutes = require('../routes/departments.routes')
const employeeRoutes = require('../routes/employees.routes')

const app = express() 

app.use(express.json())
app.use(cookieParser())
app.use('/api/auth' , authRoutes)
app.use('/api/departments' , departmentsRoutes)
app.use('/api/employees' , employeeRoutes)


module.exports = app 
