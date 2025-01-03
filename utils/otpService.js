// OTP Service for registration
const crypto = require("crypto");
const Otp = require("../models/Otp");

// Generate a random OTP
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString(); // Generate a 6-digit OTP
};

// Store OTP in the database
const storeOTP = async (email) => {
  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // Expiration time (5 minutes)

  // Save the OTP to the database
  await Otp.create({ email, otp, expiresAt });

  return otp;
};

// Verify OTP from the database
const verifyOTP = async (email, otp) => {
  const record = await Otp.findOne({ email, otp });

  if (!record) {
    return false; // No matching OTP found
  }

  // Check if the OTP has expired
  if (record.expiresAt < new Date()) {
    await Otp.deleteOne({ _id: record._id }); // Delete expired OTP
    return false;
  }

  // OTP is valid, delete it after verification
  await Otp.deleteOne({ _id: record._id });
  return true;
};

module.exports = { storeOTP, verifyOTP };
