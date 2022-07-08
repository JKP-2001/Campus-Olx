require("dotenv").config()
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name:{type:String,required:true},
    email:{type:String,required:true},
    password:{type:String,required:true},
    token:{type:String,required:true},
    seckey:{type:String,required:true,default:process.env.JWT_SECRET},
    contact:{type:String,required:true},
    hostel:{type:String,default:"Choose"},
    item_liked:[{type:mongoose.Schema.Types.ObjectId,default:[]}],
    is_banned:{type:Boolean,required:true,default:false},
    is_admin:{type:Boolean,required:true,default:false}
})


module.exports = mongoose.model("User",userSchema);