const express = require("express");
const { requestOTP, verifyOTPandTOKEN, register, googleAuth, googleAuthCallback, login } = require("../controllers/authController");
const { sendResetOTP, verifyResetOTP, resetPassword } = require("../controllers/passwordResetControll");

const router = express.Router();
// Route to verify email, register and then login
router.post('/request-otp', requestOTP );
router.post('/verify-otp', verifyOTPandTOKEN );
router.post('/register', register );
router.post('/login', login );

// OR
// Sign in with Google account

// Route to initiate Google OAuth
router.get("/google", googleAuth);
// Google OAuth callback route
router.get("/google/callback", googleAuthCallback);

// Password Reset
router.post("/password-reset/send-otp", sendResetOTP);
router.post("/password-reset/verify-otp", verifyResetOTP);
router.post("/password-reset/reset-password", resetPassword);

module.exports = router;