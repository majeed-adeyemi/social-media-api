const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    middleName: { type: String }, // Optional
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePicture: { type: String },
    coverPhoto: { type: String },
    phoneNumber: { type: String },
    fromCity: { type: String },
    currentCity: { type: String },
    fromState: { type: String },
    currentState: { type: String },
    fromCountry: { type: String },
    currentCountry: { type: String },
    profession: { type: String },
    bio: { type: String },
    hobbies: { type: String },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // List of users following this user
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // List of users this user is following
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
