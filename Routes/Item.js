require("dotenv").config()

const express = require("express");
const Item = require("../Models/Item");
const mongoose = require("mongoose");

const jwt = require("jsonwebtoken");
const User = require("../Models/User");

const fetchuser = require("../Middleware/fetchuser");
const JWT_SECRET = process.env.JWT_SECRET;

const router = express.Router();
const { body, validationResult } = require('express-validator');

const multer = require("multer");
const fs = require("fs");


const image_storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./uploads")
    },
    filename: function (req, file, cb) {
        var today = new Date();
        var time = today.getHours() + "-" + today.getMinutes() + "-" + today.getSeconds();
        var date = today.getDate() + '-' + (today.getMonth() + 1) + '-' + today.getFullYear();
        var x = time + "-" + date;
        cb(null, x + "-" + file.originalname);

    }
})




const image_upload = multer({
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




router.post("/newItem/:cat", fetchuser, async (req, res) => {

    const email = req.user.id;
    const category = req.params.cat;
    const user = await User.findOne({ email: email });
    var img_path;

    image_upload(req, res, async function (err) {
        // console.log(req.file);
        img_path = "";
        if (req.file === undefined && err) {
            res.status(403).send(err.message);
        }

        else if (req.file === undefined) {
            res.status(400).send("Image Field Cannot Be Empty");
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

            const brand = req.body.brand;
            const description = req.body.description;
            const price = req.body.price;
            const originalBuyingDate = req.body.buyingDate;
            const ownerDetails = {
                owner: user.name,
                contact: user.contact,
                ownerEmail: user.email,
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
            const url = "http://localhost:5000/" + img_path;
            res.status(200).json({ "url": url })
        }

        // Everything went fine.
    })
});


router.get("/allitems/:cat", async (req, res) => {
    const category = req.params.cat;
    const items = await Item.find({ category: category });
    res.status(200).send(items);
});

router.delete("/delItem/:id", fetchuser, async (req, res) => {
    const item_id = req.params.id;
    const user_email = req.user.id;

    const item = await Item.findById(item_id);

    if (!item) {
        res.status(404).send("Item Not Found");
    }
    else {
        if (item.ownerDetails.ownerEmail != user_email) {
            res.status(403).send("This Item Doesn't Belongs To You");
        }

        else {
            try {
                const result = await Item.deleteOne({ _id: item_id })
                fs.unlinkSync(item.img_address);
                res.status(200).send("SuccessFully Deleted");

            } catch (err) {
                res.status(400).send(err);
            }

        };
    }
});


router.get("/getItem/:id", fetchuser, async (req, res) => {
    const id = req.params.id;
    const item = await Item.findById(id);

    if (item) {
        res.status(200).send(item);
    }
    else {
        res.status(400).send("Item Not Found");
    }
});

router.get("/getAllItem", async (req, res) => {
    const items = await Item.find();
    res.status(200).send(items);
});


router.patch("/editItem/:id", fetchuser, async (req, res) => {
    const item_id = req.params.id;
    const user_email = req.user.id;
    const item = await Item.findById(item_id);
    console.log(item);


    


    if (!item) {
        res.status(400).send("Item Not Found");
    }
    else {
        if (item.ownerDetails.ownerEmail !== user_email) {
            res.status(403).send("This Item Doesn't Belongs This You.");
        }
        else {
            old_path = item.img_address;
            var img_path;
            image_upload(req, res, async function (err) {
                img_path = "";
                if (req.file === undefined && err) {
                    res.send(err.message);
                }

                else if (req.file === undefined) {
                    var today = new Date();
                    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
                    var date = today.getDate() + '-' + (today.getMonth() + 1) + '-' + today.getFullYear();
                    img_path = old_path;

                    Item.findByIdAndUpdate(item_id , { brand: req.body.brand, description: req.body.description, img_address: img_path, price:req.body.price, updation_date: date, updation_time: time }, (err) => {
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

                    

                    Item.updateOne({ _id: item_id }, { brand: brand, description: description, img_address: img_path, price:price, updation_date: date, updation_time: time }, (err) => {
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



module.exports = router;

