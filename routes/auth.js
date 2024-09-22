const express = require("express");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const User = require("../models/user.js");

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    console.log(req.body);
    
    const { email, password } = req.body;
    
    if (!email || !password)
      res.status(500).json({ msg: "Please enter valid details" });

    const user = await User.findOne({ email });

    if (!user) res.status(403).json({ msg: "Unauthorized" });

    const isAuthorized = await bcrypt.compare(password, user.password);
    if (!isAuthorized) res.status(403).json({ msg: "Unauthorized" });

    res.status(200).json({
      _id: user._id,
      fullname: user.fullname,
      email: user.email,
    });
  } catch (error) {
    console.log("Error: ", error);
  }
});

router.post("/register", async (req, res) => {
  try {
    const { fullname, email, password } = req.body;

    if (!fullname || !email || !password)
      res.status(500).json({ error: "Please enter valid details" });

    const salt = await bcrypt.genSalt(10);
    const hashPass = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      fullname,
      email,
      password: hashPass,
    });
    res.status(200).json({
      _id: newUser._id,
      fullname: newUser.fullname,
      email: newUser.email,
    });
  } catch (error) {
    console.log("Error: ", error);
  }
});

module.exports = router;
