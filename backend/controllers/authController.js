const Official = require("../models/Official");
const OTPToken = require("../models/OTPToken");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { findValidOfficial } = require("../utils/officialHelper");
const { sendOTPEmail } = require("../services/emailService");

// Verify whether the entered email belongs to an authorised official
const verifyOfficial = async (req, res) => {
  try {
    const result = await findValidOfficial(req.body.email);

    if (!result.success) {
      return res.status(result.statusCode).json({
        success: false,
        message: result.message,
      });
    }

    const official = result.official;

    return res.status(200).json({
      success: true,
      message: "Official verified successfully",
      official: {
        officialId: official.officialId,
        name: official.name,
        email: official.email,
        collegeId: official.collegeId,
        departmentId: official.departmentId,
        designation: official.designation,
        role: official.role,
      },
    });
  } catch (error) {
    console.error("Verify Official Email:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error while verifying official",
    });
  }
};

const sendOTP = async (req, res) => {
  try {
    const result = await findValidOfficial(req.body.email);

    if (!result.success) {
      return res.status(result.statusCode).json({
        success: false,
        message: result.message,
      });
    }

    const official = result.official;

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Display OTP in terminal for development/testing
    console.log(`OTP generated for ${official.email}: ${otp}`);

    // OTP expires after 5 minutes
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Remove previous OTP
    await OTPToken.deleteMany({
      officialId: official.officialId,
      verified: false,
    });

    // Save new OTP
    await OTPToken.create({
      officialId: official.officialId,
      email: official.email,
      otp: otp,
      expiresAt: expiresAt,
    });

    // Send OTP email
    const emailSent = await sendOTPEmail(official.email, otp);

    if (!emailSent) {
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP email",
      });
    }

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully to the official email",
    });
  } catch (error) {
    console.error("Send OTP error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error while sending OTP",
    });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Check required fields
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    // Normalize email
    const officialEmail = email.toLowerCase().trim();

    // Find latest OTP
    const otpToken = await OTPToken.findOne({
      email: officialEmail,
      verified: false,
    }).sort({ createdAt: -1 });

    // Check OTP record
    if (!otpToken) {
      return res.status(404).json({
        success: false,
        message: "OTP not found. Please request a new OTP",
      });
    }

    // Check OTP expiry
    if (new Date() > otpToken.expiresAt) {
      return res.status(410).json({
        success: false,
        message: "OTP has expired. Please request a new OTP",
      });
    }

    // Check OTP
    if (otpToken.otp !== otp) {
      otpToken.attempts += 1;

      await otpToken.save();

      return res.status(401).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // Mark OTP as verified
    otpToken.verified = true;

    await otpToken.save();

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    console.error("Verify OTP error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error while verifying OTP",
    });
  }
};

const createAccount = async (req, res) => {
  try {
    const { email, password, confirmPassword } = req.body;

    // Check required fields
    if (!email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Email, password and confirm password are required",
      });
    }

    // Normalize email
    const officialEmail = email.toLowerCase().trim();

    // Check passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    // Check password length
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    // Find official
    const official = await Official.findOne({
      email: officialEmail,
    });

    if (!official) {
      return res.status(404).json({
        success: false,
        message: "Official email not found",
      });
    }

    // Check official account status
    if (official.accountStatus !== "ACTIVE") {
      return res.status(403).json({
        success: false,
        message: "This official account is not active",
      });
    }

    // Check registration status
    if (official.registrationStatus === "REGISTERED") {
      return res.status(409).json({
        success: false,
        message: "This official is already registered",
      });
    }

    // Check whether OTP was verified
    const verifiedOTP = await OTPToken.findOne({
      officialId: official.officialId,
      email: official.email,
      verified: true,
    }).sort({ createdAt: -1 });

    if (!verifiedOTP) {
      return res.status(403).json({
        success: false,
        message: "Please verify your OTP before creating an account",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      email: official.email,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User account already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate user ID
    const userId = `USR-${Date.now()}`;

    // Create user account
    const user = await User.create({
      userId: userId,
      officialId: official.officialId,
      employeeId: official.employeeId,
      name: official.name,
      email: official.email,
      collegeId: official.collegeId,
      departmentId: official.departmentId,
      designation: official.designation,
      role: official.role,
      password: hashedPassword,
      accountStatus: "ACTIVE",
    });

    // Update official registration status
    official.registrationStatus = "REGISTERED";

    await official.save();

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      user: {
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Create account error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error while creating account",
    });
  }
};

module.exports = {
  verifyOfficial,
  sendOTP,
  verifyOTP,
  createAccount
};
