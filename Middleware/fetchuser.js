require("dotenv").config()

const jwt = require("jsonwebtoken");       // Importing jsonwebtoken from npm .
const JWT_SECRET = process.env.JWT_SECRET;   // Importing JWT_SECRET from the .env file.


const fetchuser = (req,res,next) =>{          // Fetchuser middleware
    const token = req.header("auth-token");    // Extracting token from the header.
    if(token){             // If token found, 
        try{
            const verify = jwt.verify(token,JWT_SECRET);       // Verify the token with our secret
            req.user = verify.user;                          // Extracting user from the token.
            next();         //Passing the function further.
        }catch(err){
            res.status(403).send(err);       // Else send error.
        }
    }
    else{
        res.status(400).send("User Is Not Logged In");       // If token not found in the header.
    }
};


module.exports = fetchuser;