require("dotenv").config()

const mongoose = require("mongoose");
const Admin = require("../Models/Admin");
const bcrypt = require("bcrypt");
const User = require("../Models/User")
const express = require("express");
const router = express.Router();
const saltRounds = 10;
const fetchadmin = require("../Middleware/fetchadmin");
const JWT_SECRET = process.env.JWT_SECRET;
const Items = require("../Models/Items");
const jwt = require("jsonwebtoken")



const setitembanned = async (items) => {
    console.log(items);
    for (var i = 0; i < items.length; i++) {
        const item = await Items.findById(items[i]._id);
        if (item) {
            if (item.is_banned) {
                const updateItem = await Items.findByIdAndUpdate(items[i]._id, { is_banned: false });
            } else {
                const updateItem = await Items.findByIdAndUpdate(items[i]._id, { is_banned: true });
            }
        }
    }
}

router.post("/createadmin", async (req, res) => {
    const { name, email, contact, password } = req.body;

    const adminPresent = await Admin.findOne({ email: email });
    const isOther = await User.findOne({ email: email });
    const token = jwt.sign({ user: { id: email } }, JWT_SECRET);   // Create A JWT with the payload and the JWT_SECRET for user id.

    if (!isOther) {
        if (!adminPresent) {
            bcrypt.hash(password, 10, async (err, hash) => {
                if (err) {
                    res.status(400).send({ err });
                }
                else {
                    const admin = await Admin.create({
                        name: name,
                        email: email,
                        contact: contact,
                        password: hash,
                        token: token
                    })
                    res.status(200).send({ msg: "Success" });
                }
            })
        } else {
            res.status(402).send({ msg: "Admin already exists" });
        }
    } else {
        res.status(404).send({ msg: "User already exists as normal user" });
    }
})

router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    const user = await Admin.findOne({ email: email });
    const normaluser = await User.findOne({ email: email });
    if (normaluser) {
        res.status(404).send({ "msg": "Not A Admin" });
    }
    else {
        if (!user) {
            res.status(402).send({ err: "User Not Exisited" });
        }
        else {
            bcrypt.compare(password, user.password, (err, result) => {
                if (err) {
                    res.status(401).send({ error: err });
                }
                if (result) {
                    res.status(200).send({ token: user.token });
                }
                else {
                    res.status(403).send({ msg: "Invalid password" });
                }
            })
        }
    }

})


router.get("/allitems", fetchadmin, async (req, res) => {
    const items = await Items.find();
    res.status(200).send(items);
})

router.get("/users", fetchadmin, async (req, res) => {
    const users = await User.find();
    res.status(200).send(users);
})


router.patch("/banItem/:id", fetchadmin, async (req, res) => {
    const item_id = req.params.id;
    const item = await Items.findById(item_id);
    if (!item) {
        res.status(404).send("Item Not Found");
    }
    else {
        if (item.is_banned) {
            const delItem = await Items.findByIdAndUpdate(item_id, { is_banned: false });
        } else {
            const delItem = await Items.findByIdAndUpdate(item_id, { is_banned: true });
        }

        res.status(200).send({ msg: "Success" });
    }

})


router.patch("/banuser/:id", fetchadmin, async (req, res) => {
    const user_id = req.params.id;
    const user = await User.findById(user_id);
    if (!user) {
        res.status(404).send("User Not Found");
    }
    else {
        const ownerDetails = {
            owner: user.name,
            contact: user.contact,
            ownerEmail: user.email,
            hostel: user.hostel,
        }
        const items = await Items.find({ ownerDetails: ownerDetails });

        await setitembanned(items);
        if (user.is_banned) {
            const delUser = await User.findByIdAndUpdate(user_id, { is_banned: false });
        } else {
            const delUser = await User.findByIdAndUpdate(user_id, { is_banned: true });
        }
        res.status(200).send({ msg: "Success" });
    }
})


router.get("/getuser/:id", fetchadmin, async (req, res) => {
    const email = req.params.id;
    try {
        const user = await User.find({ _id: email }).select("-password -seckey -token");
        if (user) {
            res.status(200).send(user);
        }
        else {
            res.status(404).send("User Not Found")
        }
    } catch (err) {
        res.status(400).send(err);
    }
})



router.get("/getItem/:id", fetchadmin, async (req, res) => {

    const id = req.params.id;                    // id of item is in the parameter.
    const item = await Items.find({ _id: id, is_banned: false });        // finding Item in the DB.

    if (item) {
        res.status(200).send(item);
    }
    else {
        res.status(400).send("Item Not Found");
    }

})







module.exports = router;