const { storeOTP, verifyOTP } = require("../utils/otpService");
const User = require("../models/User");
const sendOTPEmail = require("../utils/emailService");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const TOKEN_SECRET = process.env.JWT_SECRET;

// Send OTP for password reset
const sendResetOTP = async (req, res) => {
  const { email } = req.body;

  try {
    // Check if the email exists in the database
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate and store OTP
    const otp = await storeOTP(email);

    // Send OTP to the user's email
    await sendOTPEmail(email, otp);

    // Generate a token with email and OTP verification status
    const token = jwt.sign({ email, otpVerified: false }, TOKEN_SECRET, {
      expiresIn: "15m",
    });

    res
      .status(200)
      .json({ message: "Password reset OTP sent to email", token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Verify OTP for password reset
const verifyResetOTP = async (req, res) => {
  const { otp, token } = req.body;

  try {
    // Decode the token to get email
    const decoded = jwt.verify(token, TOKEN_SECRET);
    const email = decoded.email;

    // Verify OTP
    const isValid = await verifyOTP(email, otp);

    if (!isValid) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Generate a new token marking the OTP as verified
    const newToken = jwt.sign({ email, otpVerified: true }, TOKEN_SECRET, {
      expiresIn: "15m",
    });

    res
      .status(200)
      .json({ message: "OTP verified. Proceed to reset password", token: newToken });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Reset Password
const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    // Decode token to get email and OTP verification status
    const decoded = jwt.verify(token, TOKEN_SECRET);

    if (!decoded.otpVerified) {
      return res.status(400).json({ message: "OTP verification required" });
    }

    const email = decoded.email;

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password
    await User.updateOne({ email }, { password: hashedPassword });

    res.status(200).json({ message: "Password reset successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { sendResetOTP, verifyResetOTP, resetPassword };
