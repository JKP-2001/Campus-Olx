require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");

const User = require("../Models/User");


const router = express.Router();


router.get("/login",(req,res)=>{
    res.send("Login");
})



module.exports = router;