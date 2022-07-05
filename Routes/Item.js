
require("dotenv").config()

const express = require("express");    // Intializing The Express environment
const mongoose = require("mongoose");    // Fecthing mongoose from npm
const jwt = require("jsonwebtoken");    //Fecthing JWt from npm
const router = express.Router();          // Router used to route diffrent paths in a single file
const bcrypt = require("bcrypt");    // Package use to hash a password string.

const Item = require("../Models/Items");  // Fetching The Item Schema
const fetchuser = require("../Middleware/fetchuser");   // Fetching MiddleWare To Check The Login Status
const User = require("../Models/User");  // Fetching The User Schema

const JWT_SECRET = process.env.JWT_SECRET;    // Fetching JWT SECRET from .env file   

const multer = require("multer");   // Package used to deal with files.
const fs = require("fs");       // Help to manage, access and edit file in a folder.

const saltRounds = 10;    // SaltRounds for our password to hash.




const image_storage = multer.diskStorage({        // function for a image storage
    destination: function (req, file, cb) {     // setting destination
        cb(null, "./uploads")
    },
    filename: function (req, file, cb) {        // setting specification of file
        var today = new Date();
        var time = today.getHours() + "-" + today.getMinutes() + "-" + today.getSeconds();
        var date = today.getDate() + '-' + (today.getMonth() + 1) + '-' + today.getFullYear();
        var x = time + "-" + date;
        cb(null, x + "-" + file.originalname);

    }
})




const image_upload = multer({    //function to upload image in the destination
    storage: image_storage, limits: { fileSize: 1024 * 1024 * 5 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
            cb(null, true);
        } else {
            cb(null, false);
            return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
        }
    }
}).single("Image");





const getUserItems = async (item_array) => {        // function to fetch all the liked items of a specific user
    var result = [];

    for (var i = 0; i < item_array.length; i++) {
        const item = await Item.findById(item_array[i]);    // finding the item corresponding to the item_id 
        result.push(item);    //Pushing the item into result array.
    }

    return result;
}



const convertEmail = async (item_array) => {
    var result = [];

    for (var i = 0; i < item_array.length; i++) {
        const item = await User.findOne({email:item_array[i]});    // finding the item corresponding to the item_id 
        result.push(item);    //Pushing the item into result array.
    }

    return result;
}




router.post("/newItem/:cat", fetchuser, async (req, res) => {           // POST function post a new Item.

    const email = req.user.id;                 // Extracting user email from token
    const category = req.params.cat;            // Extracting category from parameter
    const user = await User.findOne({ email: email });     // finding the user in databse
    var img_path;

    image_upload(req, res, async function (err) {       
        // console.log(req.file);
        img_path = "";
        if (req.file === undefined && err) {              // Checking if there is a file in the input
            res.status(403).send(err.message);
        }

        else if (req.file === undefined) {
            res.status(400).send("Image Field Cannot Be Empty");   // Image field cannot be empty.
        }

        else {

            var today = new Date();                 
            const d = new Date();


            function addZero(i) {
                if (i < 10) { i = "0" + i }
                return i;
            }


            let h = addZero(d.getHours());
            let m = addZero(d.getMinutes());
            let s = addZero(d.getSeconds());
            let time = h + ":" + m + ":" + s;
            var date = today.getDate() + '-' + (today.getMonth() + 1) + '-' + today.getFullYear();
            img_path = req.file.path;
            var full = (today.getMonth() + 1) + " " + today.getDate() + ", " + today.getFullYear() + " " + time;
            console.log(req.file);

            const brand = req.body.brand;                         // setting up all the parameters in the req.body reuqiue to create a new item
            const description = req.body.description;
            const price = req.body.price;
            const originalBuyingDate = req.body.buyingDate;
            const ownerDetails = {
                owner: user.name,
                contact: user.contact,
                ownerEmail: user.email,
                hostel:user.hostel,
            };
            const creation_time = time;
            const creation_date = date;
            const getFull = full;
            const img_address = img_path;

            const item = await Item.create({           // Create Item and save item in the Database
                category: category,
                brand: brand,
                description: description,
                price: price,
                originalBuyingDate: originalBuyingDate,
                ownerDetails: ownerDetails,
                img_address: img_address,
                creation_date: creation_date,
                creation_time: creation_time,
                getFull: getFull

            });
            const url = "http://localhost:5000/" + img_path;      // the url of the image uploaded in the server as a response.
            res.status(200).json({ "url": url })
        }

        // Everything went fine.
    })
});




router.get("/allitems/:cat", async (req, res) => {            // Extracting items of a particular category.
    const category = req.params.cat;                   // Requested the category in the parameter.
    const items = await Item.find({ category: category });
    res.status(200).send(items);
});





router.delete("/delItem/:id", fetchuser, async (req, res) => {       // Deleting a particular item according to the parameter providing in the url as parameter.
    const item_id = req.params.id;
    const user_email = req.user.id;

    const item = await Item.findById(item_id);         // Fetching item from database.

    if (!item) {
        res.status(404).send("Item Not Found");             // Item Not Found.
    }
    else {
        if (item.ownerDetails.ownerEmail != user_email) {              // Item Doesn't belongs to the logged in user.
            res.status(403).send("This Item Doesn't Belongs To You");
        }

        else {
            try {
                const result = await Item.deleteOne({ _id: item_id })          // Try to delete the item if error doesn't occur.
                fs.unlinkSync(item.img_address);                 // Unlink the file from the system.
                res.status(200).send("SuccessFully Deleted");

            } catch (err) {
                res.status(400).send(err);
            }

        };
    }
});




router.get("/getItem/:id", fetchuser, async (req, res) => {         // getting item from the id of the item.
    const id = req.params.id;                    // id of item is in the parameter.
    const item = await Item.find({_id:id});        // finding Item in the DB.

    if (item) {
        res.status(200).send(item);
    }
    else {
        res.status(400).send("Item Not Found");
    }
});



router.get("/getAllItem", async (req, res) => {       // getting all the items at same time.
    const items = await Item.find();
    res.status(200).send(items);
});




router.patch("/editItem/:id", fetchuser, async (req, res) => {       // edit a particular item according to the id provided.
    const item_id = req.params.id;           // id is in the parameter.
    const user_email = req.user.id;          // Extarcting user_email from the token in the header.
    const item = await Item.findById(item_id);  // Finding item in the DB.
    

 
    if (!item) {                        // If item not found.
        res.status(400).send("Item Not Found");
    }

    else {
        
        if (item.ownerDetails.ownerEmail !== user_email) {               // If Item found but doesn't belongs to the logged in user.
            res.status(403).send("This Item Doesn't Belongs This You.");
        }

        else {
            old_path = item.img_address;                 // Old path extracted from the item
            var img_path;
            image_upload(req, res, async function (err) {
                img_path = "";
                if (req.file === undefined && err) {             // If the file in the req id not found and neither there is error.
                    res.send(err.message);
                }

                else if (req.file === undefined) {            // If the file in the req id not found, then edit all other details.`
                    var today = new Date();
                    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
                    var date = today.getDate() + '-' + (today.getMonth() + 1) + '-' + today.getFullYear();
                    img_path = old_path;
                    
                    // Updating the corresponding item, by providing data from the form.

                    Item.findByIdAndUpdate(item_id, { category:req.body.category,brand: req.body.brand, description: req.body.description, img_address: img_path, price: req.body.price, updation_date: date, updation_time: time, originalBuyingDate:req.body.buyingDate}, (err) => {
                        if (err) {
                            res.send(err);
                        }
                        else {
                            const url = "http://localhost:5000/" + img_path;
                            res.status(200).json({ "url": url })
                            // res.status(200).send("Item Updated Successfully");
                        }
                    })
                }

                else {                            // If the file in the req found. 
                    var today = new Date();
                    const d = new Date();


                    function addZero(i) {
                        if (i < 10) { i = "0" + i }
                        return i;
                    }


                    let h = addZero(d.getHours());
                    let m = addZero(d.getMinutes());
                    let s = addZero(d.getSeconds());
                    let time = h + ":" + m + ":" + s;
                    var date = today.getDate() + '-' + (today.getMonth() + 1) + '-' + today.getFullYear();
                    img_path = req.file.path;
                    var full = (today.getMonth() + 1) + " " + today.getDate() + ", " + today.getFullYear() + " " + time;
                    console.log(req.file);

                    // Updating the corresponding item, by providing data from the form.

                    Item.updateOne({ _id: item_id }, { category:req.body.category,brand: req.body.brand, description: req.body.description, img_address: img_path, price: req.body.price, updation_date: date, updation_time: time, originalBuyingDate:req.body.buyingDate }, (err) => {
                        if (err) {
                            res.send(err);
                        }
                        else {
                            const url = "http://localhost:5000/" + img_path;
                            fs.unlinkSync(old_path);
                            res.status(200).json({ "url": url })
                            // res.status(200).send("Item Updated Successfully");
                        }
                    })
                }
            });
        }
    }
});



router.get("/addToFavorite/:id", fetchuser, async (req, res) => {       // Add A Item to favourite/ removing item from favourite.
    const item_id = req.params.id;               // id of item.
    const item = await Item.findById(item_id);   // Finding item in the database.
    const user_email = req.user.id;               // Fetching user_email from the token.
    const user = await User.findOne({ email: user_email });    // Finding user from the database.

    if (!item) {                            // If Item not found.
        res.status(404).send("Item Not Found");
    }
    else {
        if (item.ownerDetails.ownerEmail === user_email) {       // Not allowing if user liking his/her own items.
            res.status(403).send("Cannot Like You Own Post.");
        }
        else {
            const isFound = (item.intrestedPeople.find(x => x === user.email));  //Founding If the loggedin in user is already in the intrested list of the item.
            if (isFound === undefined) {            // If not found.
                const item = await Item.findByIdAndUpdate(item_id, { $push: { intrestedPeople: user.email } })   // Push the intrestedPeople array in the item.
                const user_liked = await User.findByIdAndUpdate(user._id, { $push: { item_liked: item_id } });  // Push the item_liked array in the user DB.
                res.status(200).json({ "msg": "successfully liked." })
            }
            else {          // If Found.
                const item = await Item.findByIdAndUpdate(item_id, { $pull: { intrestedPeople: user.email } })   // Pop the intrestedPeople array in the item.
                const user_liked = await User.findByIdAndUpdate(user._id, { $pull: { item_liked: item_id } });   // Pop the item_liked array in the user DB.
                res.status(200).json({ "msg": "successfully disliked." })   
            }
        }
    }

})





router.get("/getOwnerDetails/:id", fetchuser, async (req, res) => {          // Getting the owner details for a specific item.
    const item_id = req.params.id;         // Finding item id from the parameters.
    const item = await Item.findById(item_id);       // Finding item in the ITEM DB.
    if (!item) {
        res.status(404).send("Item Not Found");      // Item not found.
    }
    else {
        const details = item.ownerDetails;           // Item found
        res.status(200).send(details);         // sending detail object in response.
    }
});





router.get("/userLikedItems", fetchuser, async (req, res) => {         // Fetching all the liked items of user.
    const user_email = req.user.id;                // Extracting user_email from the token.
    const user = await User.findOne({ email: user_email });    // Finding user in the DB.
    const result = await getUserItems(user.item_liked);        // Sending the liked by array to UserItems function and extracting items from item_id.
    res.status(200).send(result);        
});


router.patch("/change_password",fetchuser, async (req, res)=>{        // Changing the password after the user logged in.
    const user_email = req.user.id;                // user_email from the token.
    const user = await User.findOne({ email: user_email });  // finding user in the DB.
    
    const old_pass = req.body.password;        //Old Password in the request body
    const new_pass = req.body.new_password;   //New Password in the request body
    const confirm_pass = req.body.confirm_password;    //Confirm new Password in the request body


    bcrypt.compare(old_pass, user.password, async (err, result)=>{      // Comparing the old password with the has stored in the DB.
        if(err){         // If error return error.
            res.status(400).send(err);
        }
        else if(!result){           // if password not matched
            res.status(403).send({msg:"Incorrect Password Entered"});
        }
        else{   // If password Matched
            if (new_pass === confirm_pass){     // If new password matched with confirm password.
                bcrypt.hash(new_pass, saltRounds, async function(err, hash){   // Hashing the new password.
                    if(err){
                        res.send(err);
                    }
                    else{
                        const result = await User.findByIdAndUpdate(user._id,{password:hash});   // Updating the new password in the DB.
                        res.status(200).send({msg:"Success"});
                    }
                })
            }
            else{
                res.status(401).send({msg:"Both Password Doesn't Matched"});    // If new password not matched with confirm password.
            }
        }
    })
    
})


router.get("/user-items",fetchuser, async (req, res)=>{
    const email = req.user.id;

    try{
        const user = await User.findOne({ email: email});
        const details = {
            owner:user.name,
            contact:user.contact,
            ownerEmail:user.email,
            hostel:user.hostel
        }

        const item = await Item.find({ownerDetails:details});
        res.status(200).send(item);
    }catch(err){
        res.status(400).send(err);
    }
})


router.get("/isLiked/:id",fetchuser, async (req, res)=>{
    const email = req.user.id;
    const id = req.params.id;
    try{
        const user = await User.findOne({ email: email});
        const item = await Item.findById(id);
        const intrestedPeople = item.intrestedPeople;
        var x = -1;
        for(var i=0;i<intrestedPeople.length;i++){
            if(intrestedPeople[i]===email){
                x = 1;
                break;
            }
        }

        if(x==1){
            res.status(200).send({msg:"Found"});
        }
        else{
            res.status(403).send({msg:"Not Found"});
        }

    }catch(err){
        res.status(400).send(err);
    }
})


router.get("/getLikedBy/:id",fetchuser,async(req,res)=>{
    const id = req.params.id;

    const item = await Item.findById(id);

    if(!item){
        res.status(400).send({msg:"Not Found"});
    }
    else{
        const likedBy = item.intrestedPeople;
        const x = await convertEmail(likedBy);
        res.status(200).send(x);
    }
})


module.exports = router;


