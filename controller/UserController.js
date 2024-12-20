const { default: mongoose } = require("mongoose");
const User = require("../model/userModel");

const CreateUser = async (req, res) => {
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
};

const GetUser = async (req, res) => {
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

  } catch (error) {
    console.error("Error occurred:", error.message);
    res
      .status(500)
      .json({ error: "An error occurred while retrieving the user" });
  }
};

const CheckCustomUrl = async (req, res) => {
  try {
    const { customUrl } = req.params;
    console.log("Custom url: ", customUrl);

    if (!customUrl) {
      return res.status(400).json({ error: "Custom URL cannot be empty" });
    }

    const existingUser = await User.findOne({ customUrl });

    if (existingUser) {
      return res.status(200).json({ exists: true, message: "Custom URL already taken" });
    }

    res.status(200).json({ exists: false, message: "Custom URL is available" });
  } catch (error) {
    console.error("Error occurred:", error.message);
    res.status(500).json({ error: "An error occurred while checking the custom URL" });
  }
};

module.exports = { CreateUser, GetUser, CheckCustomUrl };
