require("dotenv").config()

const jwt = require("jsonwebtoken");       // Importing jsonwebtoken from npm .
const JWT_SECRET = process.env.JWT_SECRET;   // Importing JWT_SECRET from the .env file.
const Admin = require("../Models/Admin");
const User = require("../Models/User");

const fetchadmin = async (req,res,next) =>{          // Fetchuser middleware
    const token = req.header("auth-token");    // Extracting token from the header.
    if(token){             // If token found, 
        try{
            const verify = jwt.verify(token,JWT_SECRET);       // Verify the token with our secret
            const email = verify.user.id;
            const user = await Admin.findOne({email:email});
            const normaluser = await User.findOne({email:email});
            if(user){
                if(user.is_admin){
                    req.user = verify.user;                          // Extracting user from the token.
                    next();         //Passing the function further.
                }
                else{
                    res.status(401).send({msg:"Not Admin"});
                }
            }
            else if(normaluser){
                res.status(404).send({msg:"Normal User"});
            }
            else{
                res.status(402).send({msg:"User Not Exist"});
            }
        }catch(err){
            res.status(403).send(err);       // Else send error.
        }
    }
    else{
        res.status(400).send("User Is Not Logged In");       // If token not found in the header.
    }
};


module.exports = fetchadmin;