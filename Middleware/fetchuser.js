require("dotenv").config()

const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;


const fetchuser = (req,res,next) =>{
    const token = req.header("auth-token");
    if(token){
        try{
            const verify = jwt.verify(token,JWT_SECRET);
            req.user = verify.user;
            next();
        }catch(err){
            res.status(403).send(err);
        }
    }
    else{
        res.status(400).send("User Is Not Logged In");
    }
};


module.exports = fetchuser;