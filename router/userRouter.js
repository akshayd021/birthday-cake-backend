// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const User = require("../model/userModel");
const { default: mongoose } = require("mongoose");

router.post("/create-user", async (req, res) => {
  try {
    const { name, age, message, customUrl } = req.body;

    if (!name) return res.status(400).json({ error: "Name cannot be empty" });
    if (!age) return res.status(400).json({ error: "Age cannot be empty" });
    if (!message)
      return res.status(400).json({ error: "Message cannot be empty" });

    if (customUrl) {
      const existingUser = await User.findOne({ customUrl });
      if (existingUser) {
        return res.status(400).json({ message: "Custom URL already taken" });
      }
    }

    const newUser = new User({ name, age, message, customUrl });
    await newUser.save();

    const dummyLink = `https://www.waiwishes.com//user/${
      customUrl || newUser._id
    }`;

    res.status(201).json({
      message: "User created successfully",
      user: newUser,
      dummyLink: dummyLink,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while creating the user" });
  }
});

router.get("/get-user/:identifier", async (req, res) => {
  try {
    const { identifier } = req.params;

    let user;
    if (mongoose.Types.ObjectId.isValid(identifier)) {
      user = await User.findById(identifier);
    } else {
      user = await User.findOne({ customUrl: identifier });
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ user });
  } catch (error) {
    console.error("Error occurred:", error.message);
    res
      .status(500)
      .json({ error: "An error occurred while retrieving the user" });
  }
});

module.exports = router;
