const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { storeOTP, verifyOTP } = require("../utils/otpService");
const sendOTPEmail = require("../utils/emailService");
const dotenv = require("dotenv");

dotenv.config();

const TOKEN_SECRET = process.env.JWT_SECRET;

// Request OTP
const requestOTP = async (req, res) => {
  const { email } = req.body;

  try {
    // Check if the email already exists in the database
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already registered with this email" });
    }

    // Generate and store OTP
    const otp = await storeOTP(email);

    // Send OTP to the user's email
    await sendOTPEmail(email, otp);

    // Generate a token with the email
    const token = jwt.sign({ email }, TOKEN_SECRET, { expiresIn: "15m" });

    // Set the token in an HTTP-only cookie
    res.cookie("otpToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
      sameSite: "Strict",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.status(200).json({ message: "OTP sent to email" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Verify OTP and return a verified token
const verifyOTPandTOKEN = async (req, res) => {
  const { otp } = req.body;

  try {
    // Extract token from cookies
    const token = req.cookies.otpToken;

    if (!token) {
      return res.status(400).json({ message: "Token is missing or invalid" });
    }

    // Verify token and extract email
    const decoded = jwt.verify(token, TOKEN_SECRET);
    const email = decoded.email;

    // Verify OTP
    const isValid = await verifyOTP(email, otp);

    if (!isValid) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Generate a verified token for the next step
    const verifiedToken = jwt.sign({ email, otpVerified: true }, TOKEN_SECRET, {
      expiresIn: "15m",
    });

    // Set the verified token in an HTTP-only cookie
    res.cookie("verifiedOtpToken", verifiedToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
      sameSite: "Strict",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.status(200).json({ message: "OTP verified successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Complete Registration
const register = async (req, res) => {
  const { firstName, middleName, lastName, password } = req.body;

  try {
    // Extract the verified token from cookies
    const verifiedToken = req.cookies.verifiedOtpToken;

    if (!verifiedToken) {
      return res.status(400).json({ message: "Token is missing or invalid" });
    }

    // Verify the token to ensure the email is valid and OTP was verified
    const decoded = jwt.verify(verifiedToken, TOKEN_SECRET);

    if (!decoded.otpVerified) {
      return res.status(400).json({ message: "OTP verification required" });
    }

    const email = decoded.email;

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already registered with this email" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Proceed with user registration
    const newUser = new User({
      email,
      firstName,
      middleName,
      lastName,
      password: hashedPassword,
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Google OAuth initiation
const googleAuth = (req, res, next) => {
  const passport = require("passport");
  passport.authenticate("google", { scope: ["profile", "email"] })(req, res, next);
};

// Google OAuth callback
const googleAuthCallback = (req, res, next) => {
  const passport = require("passport");

  passport.authenticate("google", { failureRedirect: "/login" }, (err, user) => {
    if (err || !user) {
      return res.redirect("/login"); // Redirect to login on failure
    }

    // Generate JWT for authenticated user
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });

    // Redirect to frontend with token
    res.redirect(`http://localhost:5173?token=${token}`); // Adjust frontend URI
  })(req, res, next);
};

// // Login
// const login = async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     const user = await User.findOne({ email });

//     // console.log(user)
//     if (!user) {
//       return res.status(404).json({ message: "User not Found" });
//     }

//     const isMatch = await bcrypt.compare(password, user.password);

//     if (!isMatch) {
//       return res.status(404).json({ message: "Invalid credentials" });
//     }

//     const token = jwt.sign({ id: user._id }, TOKEN_SECRET, {
//       expiresIn: "1h",
//     });
//     res.json({ token, userId: user._id });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not Found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(404).json({ message: "Invalid credentials" });
    }

    // Generate token
    const token = jwt.sign({ id: user._id }, TOKEN_SECRET, {
      expiresIn: "1h",
    });

    // Set the token and userId in HTTP-only cookies
    res.cookie("authToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Use HTTPS in production
      sameSite: "Strict",
      maxAge: 60 * 60 * 1000, // 1 hour
    });

    res.cookie("userId", user._id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Use HTTPS in production
      sameSite: "Strict",
      maxAge: 60 * 60 * 1000, // 1 hour
    });

    res.status(200).json({ message: "Login successful" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { requestOTP, verifyOTPandTOKEN, register, googleAuth, googleAuthCallback, login };
