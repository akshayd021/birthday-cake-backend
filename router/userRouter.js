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
        return res.status(400).json({ error: "Custom URL already taken" });
      }
    }

    const newUser = new User({ name, age, message, customUrl });
    await newUser.save();

    const dummyLink = `http://192.168.29.47:3000/user/${
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
    console.log("Received identifier:", identifier);

    let user;

    // Check if identifier is a valid MongoDB ObjectId
    if (mongoose.Types.ObjectId.isValid(identifier)) {
      console.log("Searching by ObjectId...");
      user = await User.findById(identifier);
    } else {
      console.log("Searching by customUrl...");
      user = await User.findOne({ customUrl: identifier });
    }

    if (!user) {
      console.log("User not found"); // Log if user is not found
      return res.status(404).json({ error: "User not found" });
    }

    console.log("User found:", user); // Log the found user
    res.status(200).json({ user });
  } catch (error) {
    console.error("Error occurred:", error.message); // Log the error
    res
      .status(500)
      .json({ error: "An error occurred while retrieving the user" });
  }
});

module.exports = router;
