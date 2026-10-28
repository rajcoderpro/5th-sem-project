const mongoose  = require("mongoose") 
const connectDB = async() =>{
    try{
        await mongoose.connect(process.env.MONGOOSE_URI)
        console.log("Database connected")
    }
    catch(err){
        console.log(err)
    }
}
module.exports = connectDB 