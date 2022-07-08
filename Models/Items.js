




require ("dotenv").config()
const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
    category: {type:String,required:true},
    brand:{type:String,required:true},
    description:{type:String,required:true},
    price:{type:Number,required:true},
    originalBuyingDate:{type:String,required:true},
    ownerDetails:{
        owner:{type:String,required:true},
        contact:{type:String,required:true},
        ownerEmail:{type:String,required:true},
        hostel:{type:String,default:""},
    },

    img_address:{type:String,required:true},
    intrestedPeople:[{type:String,default:[]}],
    creation_date:{type:String,required:true},
    creation_time:{type:String,required:true},
    getFull:{type:String},
    updation_date:{type:String,required:false},
    updation_time:{type:String,required:false},
    is_banned:{type:Boolean,required:true,default:false},
})


module.exports = mongoose.model("Item",itemSchema);

