const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
require("./config/passport"); // Initialize passport configuration
const path = require("path");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");

dotenv.config();

const authRoutes = require("./routes/auth");
const postRoutes = require("./routes/postRoutes");
const userRoutes = require("./routes/userRoutes");
const followRoutes = require("./routes/followRoutes");

const app = express();

// Middleware for sessions
app.use(
  session({
    secret: "session-secret",
    resave: false,
    saveUninitialized: true,
  })
);

// Serve static files for uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Middleware

// Configure CORS
app.use(
  cors({
    origin: "http://localhost:5173", // Replace with frontend origin
    credentials: true, // Allow cookies and other credentials
  })
);
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api", userRoutes);
app.use("/api/follow", followRoutes);

module.exports = app;
