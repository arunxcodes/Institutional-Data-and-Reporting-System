const nodemailer = require("nodemailer");

// create email transpoter
const transpoter = nodemailer.createTransport({
    service : "gmail",
    auth : {
        user : process.env.EMAIL_USER,
        pass : process.env.EMAIL_PASS,
    },
});

// send otp email
const sendOTPEmail = async (email,otp) => {
    try{
        const mailOptions = {
            from : `"IDRS - Institutional Data & Reporting System "<${process.env.EMAIL_USER}>`,
            to : email,
            subject : "IDRS Official Email verification OTP",
            html :`
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
          
          <h2 style="color: #0d47a1;">
            IDRS Email Verification
          </h2>

          <p>
            Your One-Time Password (OTP) for registering your
            IDRS account is:
          </p>

          <h1 style="letter-spacing: 8px; color: #0d47a1;">
            ${otp}
          </h1>

          <p>
            This OTP is valid for <strong>5 minutes</strong>.
          </p>

          <p>
            Please do not share this OTP with anyone.
          </p>

          <hr>

          <p style="font-size: 12px; color: #777;">
            This is an automated email from the Institutional Data
            & Reporting System (IDRS).
          </p>

        </div>
      `,
        };
        await transpoter.sendMail(mailOptions);
        console.log(`OTP email sent successfully to ${email}`)
        return true;
    }catch(error){
        console.error("Error sending OTP email :",error.message);
        return false;
    }
};

module.exports = {
    sendOTPEmail
}