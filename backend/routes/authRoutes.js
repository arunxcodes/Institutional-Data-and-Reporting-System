const express = require("express");
const {verifyOfficial,sendOTP,verifyOTP,createAccount} = require("../controllers/authController");
const router = express.Router();

// verify official mail
router.post("/verify-official", verifyOfficial);

// send OTP to official email
router.post("/send-otp", sendOTP);

// verify OTP
router.post("/verify-otp",verifyOTP);

// create user account
router.post("/create-account",createAccount);

module.exports = router;