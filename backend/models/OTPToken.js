const mongoose = require("mongoose");

const otpTokenSchema = new mongoose.Schema(
    {
        officialId : {
            type : String,
            required : true,
            trim : true
        },
        email :{
            type : String,
            required : true,
            lowercase : true,
            trim : true
        },
        otp : {
            type : String,
            required : true
        },
        expiresAt :{
            type : Date,
            required : true
        },
        attempts : {
            type : Number,
            default : 0
        },
        verified : {
            type : Boolean,
            default : false
        },
    },
    {
        timestamps : true,
    }
);

const OTPToken = mongoose.model("OTPToken",otpTokenSchema);
module.exports = OTPToken;