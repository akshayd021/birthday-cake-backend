// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const { CreateUser, GetUser } = require("../controller/UserController");

router.post("/create-user", CreateUser);

router.get("/get-user/:identifier", GetUser);

module.exports = router;
