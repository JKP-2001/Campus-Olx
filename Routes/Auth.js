




require("dotenv").config();      //Help to retrieve secrets from .env file


const express = require("express");

const mongoose = require("mongoose");   // Helps to handle mongodb operations

const User = require("../Models/User");

const {google} = require('googleapis');

const oAuthClient = new google.auth.OAuth2(process.env.CLIENT_ID, process.env.CLIENT_SECRET,process.env.REDIRECT_URI )
oAuthClient.setCredentials({refresh_token:process.env.REFRESH_TOKEN})





const router = express.Router();

const bcrypt = require("bcryptjs");    //Help to hash password with saltRounds
const saltRounds = 10;     // No Of saltRounds

const { body, validationResult } = require('express-validator'); // It helps to validate you requirements

// const fetchuser = require("../middleware/fetchuser");    // A MiddleWare to Fetch User Details from the token generated to corresponding.

var jwt = require('jsonwebtoken');   // Module For generation of JWT by giving signature and Payload data

var nodemailer = require('nodemailer');   // Module to send mail to register user.


const JWT_SECRET = process.env.JWT_SECRET;    // JWT secret from .env file









// var transporter = nodemailer.createTransport({        // function to send mail to register user
//     service: 'gmail',     // mail sending platform
//     auth: {
//         user: 'cybermessagehub@gmail.com',    // Sender Mail Address
//         pass: process.env.EMAIL_PASSWORD    // Sender Mail Password
//     }
// });



async function sendEmail(email,body,subject){

    try{
        const accessToken = await oAuthClient.getAccessToken();
        var transporter = nodemailer.createTransport({        // function to send mail to register user
            service: 'gmail',     // mail sending platform
            auth: {
                type:'OAuth2',
                user: 'innovatorsolx@gmail.com',    // Sender Mail Address
                pass: process.env.EMAIL_PASSWORD,   // Sender Mail Password
                clientId: process.env.CLIENT_ID, 
                clientSecret: process.env.CLIENT_SECRET,
                refreshToken: process.env.REFRESH_TOKEN,
                accessToken: accessToken
            }
        });

        var mailOptions = {
            from: 'cybermessagehub@gmail.com',             // Sender Email
            to: email,                             // Email requested by user
            subject: subject,         // Subject Of The Mail
            text: body,
            //Custom Mail Message With the link to confirm email address (The link contain the user id and token corresponding)
        };


        transporter.sendMail(mailOptions, function (error, info) {  // Reciving Conformation Of Sent Mail
            if (error) {
                console.log(error);
            } else {
                res.status(200).json({ "msg": "Email sent" });
            }
        });


    }catch(err){
        return err;
    }



}



// Route2: API for SigningUp new user by sending confirmation email to the id provided at route "/api/auth/createuser"
router.post("/createuser", [
    body('name', 'min length 3 required').isLength({ min: 3 }),    // Validations
    body('email', 'Invalid Email').isEmail()
], async (req, res) => {

    const errors = validationResult(req);    // If Error Then store all errors in the array
    if (!errors.isEmpty()) {                 // If not empty then send all the errors as an ARRAY
        return res.status(400).json({ errors: errors.array() });
    }


    let user = await User.findOne({ email: req.body.email });    // Found If The User With Same Email id existed or not.


    if (user) {                         // If User Already Exists then send the corresponding message
        res.status(401).json({ "msg": "User Already Existed" });
    }

    else {                           // If Not Then 

        const token2 = jwt.sign({                           // Create A JWT with the payload and the JWT_SECRET
            data: {
                name: req.body.name,
                email: req.body.email,
            }
        }, JWT_SECRET);

        const body = `Hello ${req.body.name}, Thank you for showing intrest in https://campus-olx.in . To finish signing up, you just need to confirm your email by clicking the link below.\n\nhttp://localhost:5000/api/auth/confirm-email/${token2} `
        const email = req.body.email;
        const subject = 'Email Confirmation Mail'
        sendEmail(email,body,subject)
        console.log("Email Sent");
        res.send("Email Sent SuccessFully")
    };
}
);


router.post("/confirm-email/:token", [             //Validations
    body('password', 'Min length 8 required').isLength({ min: 8 })
], async (req, res) => {

    const errors = validationResult(req);    // If Error Then store all errors in the array
    if (!errors.isEmpty()) {                 // If not empty then send all the errors as an ARRAY
        return res.status(400).json({ errors: errors.array() });
    }


    const token2 = req.params.token;               // Recive token from url parameter
    const user = jwt.verify(token2, JWT_SECRET);   // decode token in recived for retreiving the information.
    const token = jwt.sign({ user: { id: user.data.email } }, JWT_SECRET);   // Create A JWT with the payload and the JWT_SECRET for user id.

    let usexr = await User.findOne({ email: user.data.email });

    if (usexr) {
        res.status(400).json({ "msg": "User Already Existed" });

    }
    else {
        bcrypt.hash(req.body.password, saltRounds, async (err, hash) => {            // Helps to hash password 

            if (err) {
                res.status(401).json({ "msg": "Error" });       // If any error then send error
            }

            const users = await User.create({           // Create User and save user in the Database
                name: user.data.name,
                email: user.data.email,
                password: hash,
                token: token,
                id: user.data.email
            });
            res.status(200).json({ "msg": token })
            // In the response sent the token.

        })
    }
})


router.post("/login",[
    body('email', 'Invalid Email').isEmail(),
    body('password', 'min length 8 required').isLength({ min: 8 }),    // Validations
],async (req,res)=>{

    const errors = validationResult(req);    // If Error Then store all errors in the array
    if (!errors.isEmpty()) {                 // If not empty then send all the errors as an ARRAY
        return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findOne({email:req.body.email});
    if(!user){
        res.status(400).send({err:"User Not Exisited"});
    }
    else{
        bcrypt.compare(req.body.password,user.password,(err,result)=>{
            if(result){
                res.status(200).send({token:user.token});
            }
            else{
                res.status(403).send({msg:"Invalid password"});
            }
        })
    }
})

router.post("/resetpassword-email",[
    body("email").isEmail()
],async (req,res)=>{
    const errors = validationResult(req);    // If Error Then store all errors in the array
    if (!errors.isEmpty()) {                 // If not empty then send all the errors as an ARRAY
        return res.status(400).json({ errors: errors.array() });
    }
    
    const user = await User.findOne({email:req.body.email});
    if(!user){
        res.status(400).send({"msg":"User Not Exisited"});
    }
    else{

        const body = `Hello ${user.name}, Somebody requested a new password for the https://campus-olx.com account associated with ${user.email}.\n\n No changes have been made to your account yet.\n\nYou can reset your password by clicking the link below:\nhttp://localhost:5000/api/auth/resettingpassword/${user.email}/${user.token}  \n\nIf you did not request a new password, please let us know immediately by replying to this email.\n\n Yours, \nThe Campus Olx Team`
        const email = req.body.email;
        const subject = 'Password Change Request'
        sendEmail(email,body,subject)
        console.log("Email Sent");
        res.send("Email Sent SuccessFully")
    }
})


router.patch("/resettingpassword/:email/:token",[
    body('password', 'Min length 8 required').isLength({ min: 8 })
],async (req,res)=>{
    const errors = validationResult(req);    // If Error Then store all errors in the array
    if (!errors.isEmpty()) {                 // If not empty then send all the errors as an ARRAY
        return res.status(400).json({ errors: errors.array() });
    }
    const token = req.params.token;
    const email = req.params.email;
    const m = await User.findOne({email:email});
    
    
    try{
        const decode = jwt.verify(token,m.seckey );

        const user = await User.findOne({email:decode.user.id});
        if(!user){
            res.status(400).send("User Doesn't Exists");
        }

        else{
            const seckey = user.seckey+req.body.password;
            const newtoken = jwt.sign({ user: { id: user.email } }, seckey); 
            bcrypt.hash(req.body.password,saltRounds,async(err,hash)=>{
                if(err){
                    res.status(400).send({err})
                }
                else{
                    const x = await User.findByIdAndUpdate(user._id,{password:hash,token:newtoken,seckey:seckey});
                    res.status(200).send({msg:"Password Reset Successfully"})
                }
            })
        }
    }catch(err){
        res.status(404).send("Link Expired");
    }
})










module.exports = router;