const mongoose = require("mongoose");
const User = require("../models/User");

// Follow/Unfollow User
const followUnfollowUser = async (req, res) => {
  const { userId } = req.params;

  try {
    // Validate the userId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    // Prevent user from following themselves
    if (userId === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    const targetUser = await User.findById(userId);
    const currentUser = await User.findById(req.user._id);

    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const isFollowing = targetUser.followers.includes(req.user._id);

    if (isFollowing) {
      // Unfollow the user
      targetUser.followers = targetUser.followers.filter(
        (id) => id.toString() !== req.user._id.toString()
      );
      currentUser.following = currentUser.following.filter(
        (id) => id.toString() !== userId.toString()
      );

      await targetUser.save();
      await currentUser.save();

      return res.status(200).json({
        message: "Unfollowed user successfully",
        followers: targetUser.followers.length,
        following: currentUser.following.length,
      });
    }

    // Follow the user
    targetUser.followers.push(req.user._id);
    currentUser.following.push(userId);

    await targetUser.save();
    await currentUser.save();

    res.status(200).json({
      message: "Followed user successfully",
      followers: targetUser.followers.length,
      following: currentUser.following.length,
    });
  } catch (err) {
    console.error("Error in follow/unfollow operation:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Get followers of a user
const getFollowers = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).populate(
      "followers",
      "firstName lastName email profilePicture"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({ followers: user.followers });
  } catch (error) {
    console.error("Error fetching followers:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// Get users a user is following
const getFollowing = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).populate(
      "following",
      "firstName lastName email profilePicture"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({ following: user.following });
  } catch (error) {
    console.error("Error fetching following:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// Remove a follower
const removeFollower = async (req, res) => {
  const { followerId } = req.params;

  try {
    // Ensure the provided followerId is valid
    if (!mongoose.Types.ObjectId.isValid(followerId)) {
      return res.status(400).json({ message: "Invalid follower ID format" });
    }

    // Find the current user (authenticated user)
    const currentUser = await User.findById(req.user._id);
    if (!currentUser) {
      return res.status(404).json({ message: "Current user not found" });
    }

    // Check if the follower exists in the user's followers list
    const isFollower = currentUser.followers.includes(followerId);
    if (!isFollower) {
      return res
        .status(404)
        .json({ message: "Follower not found in your list" });
    }

    // Remove the follower from the user's followers list
    currentUser.followers = currentUser.followers.filter(
      (id) => id.toString() !== followerId.toString()
    );

    // Save the updated user
    await currentUser.save();

    // Also, remove the current user from the follower's following list
    const follower = await User.findById(followerId);
    if (follower) {
      follower.following = follower.following.filter(
        (id) => id.toString() !== req.user._id.toString()
      );
      await follower.save();
    }

    res.status(200).json({
      message: "Follower removed successfully",
      followers: currentUser.followers.length,
    });
  } catch (error) {
    console.error("Error in removing follower:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { followUnfollowUser, getFollowers, getFollowing, removeFollower };
