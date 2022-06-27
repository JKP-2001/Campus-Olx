require("dotenv").config();

const express = require("express");
const app = express();
var cors = require('cors')

const corsOptions ={
  origin:'*', 
  credentials:true,            //access-control-allow-credentials:true
  optionSuccessStatus:200,
}


app.use(cors(corsOptions))
const bodyParser = require("body-parser");
const mongoose = require("mongoose");




app.use(bodyParser.urlencoded({extended:false}));
app.use(express.static("public"));




const url = "mongodb+srv://Freinds:"+process.env.mongo_password+"@cluster0.azngz.mongodb.net/?retryWrites=true&w=majority"
mongoose.connect(url);
app.use(express.json());
app.use('/uploads', express.static('uploads'));




app.use("/api/auth",require("./Routes/Auth"));
app.use("/api/item",require("./Routes/Item"))


app.get("/",function(req,res){
	res.send("login");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 5000;
}



app.listen(port,(err)=>{
    if(err){
        console.log(err);
    }
    else{
        console.log("Server Run On Port 5000");
    }
})



