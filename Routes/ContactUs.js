require("dotenv").config()

const Contact = require("../Models/ContactUs");
const express = require("express");
const router = express.Router();

router.post("/send-query",async(req,res)=>{
    const name = req.body.name;
    const email = req.body.email;
    const message = req.body.message;

    const query = await Contact.create({
        name:name,
        email:email,
        Message:message
    });

    res.status(200).send("Success");
})


module.exports = router;