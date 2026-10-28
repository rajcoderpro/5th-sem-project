const userModel = require('../models/user.model')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')


const registerUser = async (req , res) => {
    const {name , email , password  } = req.body 
    const doesUserAlreadyExists =await userModel.findOne({
        email
    })
    if(doesUserAlreadyExists) {
        return res.status(409).json({
            message : "user with this email already exists" 
        })
    }
    const hashPass = await bcrypt.hash(password , 10) 
    const user = await userModel.create({
        name , email , password : hashPass 
    })
    const token = jwt.sign({
        id : user._id ,
        role : user.role 
    } , process.env.JWT_SECRET )
    res.cookie('token' , token )
    res.status(201).json({
        message : "user created successfully" ,
        name  ,
        email
    })
}
const loginUser = async (req , res) =>{
    const {email , password} = req.body 
    const user =await userModel.findOne({
        email
    })
    if(!user) {
        return res.status(401).json({
            message : "user not found" 
        })
    } 
    const isPasswordCorrect =await bcrypt.compare(password , user.password)
    if(!isPasswordCorrect){
        return res.status(401).json({
            message : "wrong password" 
        })
    }
    const token = jwt.sign({
        id : user._id ,
        role : user.role 
    } , process.env.JWT_SECRET )

    res.cookie('token' , token )

    res.status(200).json({
        message : "login successfully" ,
        name  : user.name
    })
    
}
const logoutUser = async (req , res) =>{
    const token = req.cookies.token 
    if(token){
        res.clearCookie("token")
    }
    res.status(200).json({
        message :"Logout successfully "
    })
}
module.exports = {registerUser , loginUser , logoutUser}

