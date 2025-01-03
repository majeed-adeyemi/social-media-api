const express = require("express");
const {
  followUnfollowUser,
  getFollowers,
  getFollowing,
  removeFollower,
} = require("../controllers/followController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Follow or Unfollow a user
router.post("/follow/:userId", protect, followUnfollowUser);

// Get followers of a user
router.get("/followers/:id", protect, getFollowers);

// Get users a user is following
router.get("/following/:id", protect, getFollowing);

// Route to remove a follower (protected route)
router.delete("/remove-follower/:followerId", protect, removeFollower);

module.exports = router;
