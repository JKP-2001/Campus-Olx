const mongoose=require('mongoose')

const itemSchema=new mongoose.Schema({
    description:{
        type:String,
        trim:true,
        required:true
    },
    details:{
        type:String,
        required:true,
        trim:true
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref: User,
        require:false
    }
})

const Item = mongoose.model('Item', itemSchema)

module.exports=Item