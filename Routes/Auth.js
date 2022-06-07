




require("dotenv").config();      //Help to retrieve secrets from .env file


const express = require("express");

const mongoose = require("mongoose");   // Helps to handle mongodb operations

const User = require("../Models/User");





const router = express.Router();

const bcrypt = require("bcryptjs");    //Help to hash password with saltRounds
const saltRounds = 10;     // No Of saltRounds

const { body, validationResult } = require('express-validator'); // It helps to validate you requirements

// const fetchuser = require("../middleware/fetchuser");    // A MiddleWare to Fetch User Details from the token generated to corresponding.

var jwt = require('jsonwebtoken');   // Module For generation of JWT by giving signature and Payload data

var nodemailer = require('nodemailer');   // Module to send mail to register user.


const JWT_SECRET = process.env.JWT_SECRET;    // JWT secret from .env file









var transporter = nodemailer.createTransport({        // function to send mail to register user
    service: 'gmail',     // mail sending platform
    auth: {
        user: 'cybermessagehub@gmail.com',    // Sender Mail Address
        pass: process.env.EMAIL_PASSWORD    // Sender Mail Password
    }
});






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


        var mailOptions = {
            from: 'cybermessagehub@gmail.com',             // Sender Email
            to: req.body.email,                             // Email requested by user
            subject: 'Email Confirmation Mail',         // Subject Of The Mail
            text: `Hello ${req.body.name}, Thank you for showing intrest in https://campus-olx.in . To finish signing up, you just need to confirm your email by clicking the link below.\n\nhttp://localhost:5000/api/auth/confirm-email/${token2} `,
            //Custom Mail Message With the link to confirm email address (The link contain the user id and token corresponding)
        };

        transporter.sendMail(mailOptions, function (error, info) {  // Reciving Conformation Of Sent Mail
            if (error) {
                console.log(error);
            } else {
                res.status(200).json({ "msg": "Email sent" });
            }
        });


        console.log("Email Sent");
    };
}
);


router.post("/confirm-email/:token", [             //Validations
    body('password', 'Min length 8 required').isLength({ min: 8 })
], async (req, res) => {
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
                id: user.data.email,
                seckey: JWT_SECRET
            });
            res.status(200).json({ "msg": token })
            // In the response sent the token.

        })
    }
})







module.exports = router;