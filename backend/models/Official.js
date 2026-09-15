const mongoose = require("mongoose");

const officialSchema = new mongoose.Schema(
  {
    officialId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    employeeId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    mobile: {
      type: String,
      required: true,
      trim: true,
    },
    collegeId: {
      type: String,
      required: true,
      trim: true,
    },
    departmentId: {
      type: String,
      required: true,
      trim: true,
    },
    designation: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      required: true,
      enum: ["SUPER_ADMIN", "AUTHORITY", "HOD"],
    },
    registrationStatus: {
      type: String,
      enum: ["PENDING", "REGISTERED"],
      default: "PENDING",
    },
    accountStatus: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "SUSPENDED"],
      default: "ACTIVE",
    },
  },
  {
    timestamps: true,
  },
);

const Official = mongoose.model("Official", officialSchema);
module.exports = Official;
