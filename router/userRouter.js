// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const { CreateUser, GetUser, CheckCustomUrl } = require("../controller/UserController");

router.post("/create-user", CreateUser);

router.get("/get-user/:identifier", GetUser);

router.get("/check-custom/:customUrl", CheckCustomUrl);

module.exports = router;
