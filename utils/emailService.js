// // Email Service for registration
// const nodemailer = require("nodemailer");

// // Configure Nodemailer transport using Gmail (you can use other email providers)
// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL_USER, // Your email
//     pass: process.env.EMAIL_PASS, // Your email password or app password
//   },
// });

// // Function to send OTP email
// const sendOTPEmail = (to, otp) => {
//   const mailOptions = {
//     from: process.env.EMAIL_USER,
//     to,
//     subject: "Your OTP for Email Verification",
//     text: `Your OTP for email verification is: ${otp}`,
//   };

//   return transporter.sendMail(mailOptions);
// };

// module.exports = { sendOTPEmail };

const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // Your email
    pass: process.env.EMAIL_PASS, // Your app password
  },
});

// Function to send OTP email
const sendOTPEmail = (to, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: "Your OTP for Email Verification",
    text: `Your OTP is: ${otp}. It is valid for 5 minutes.`,
  };

  return transporter.sendMail(mailOptions);
};

module.exports = sendOTPEmail;
