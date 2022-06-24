const jwt=require('jsonwebtoken')
const User=require('../Models/User')
const JWT_SECRET = "FriendsReunion";

const auth=async(req,res,next)=>{
    try{
        const token=req.header('Authorization')
        const decoded=jwt.verify(token,JWT_SECRET)
        const user=await User.findOne({_id:decoded._id,token:token})
        if(!user){
            throw new Error()
        }
        req.token=token
        req.user=user
        next()
    }
    catch(error){
        res.status(401).send('Please Authenticate')
    }
}

module.exports=auth