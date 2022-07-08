require("dotenv").config()
const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    name:{type:String,required:true},
    email:{type:String,required:true},
    password:{type:String,required:true},
    contact:{type:String,required:true},
    token:{type:String,required:true},
    is_admin:{type:Boolean,required:true,default:true}
})


module.exports = mongoose.model("Admin",adminSchema);