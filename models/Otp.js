const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
  {
    email: { type: String, required: true }, // Email associated with the OTP
    otp: { type: String, required: true }, // The OTP code
    expiresAt: { type: Date, required: true }, // Expiration time for the OTP
  },
  { timestamps: true }
);

// TTL index for automatic expiration
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Otp = mongoose.model("Otp", otpSchema);
module.exports = Otp;
