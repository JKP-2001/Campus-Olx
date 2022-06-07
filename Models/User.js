require("dotenv").config()
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name:{type:String,required:true},
    email:{type:String,required:true},
    password:{type:String,required:true},
    token:{type:String,required:true},
    seckey:{type:String,required:true,default:process.env.JWT_SECRET},
})


module.exports = mongoose.model("User",userSchema);