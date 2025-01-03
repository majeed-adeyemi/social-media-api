const User = require("../models/User");

// Get User Details
const getUserDetails = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch user details from the database, excluding the password
    const user = await User.findById(id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Edit and Update User Details
const updateUserDetails = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the user
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prepare updated fields
    const updates = { ...req.body };

    // Handle file uploads for profilePicture and coverPhoto
    if (req.files) {
      if (req.files.profilePicture) {
        updates.profilePicture = `${req.protocol}://${req.get(
          "host"
        )}/uploads/${id}/${req.files.profilePicture[0].filename}`;
      }
      if (req.files.coverPhoto) {
        updates.coverPhoto = `${req.protocol}://${req.get(
          "host"
        )}/uploads/${id}/${req.files.coverPhoto[0].filename}`;
      }
    }

    // Exclude restricted fields from being updated
    delete updates.password;
    delete updates.firstName;
    delete updates.middleName;
    delete updates.lastName;
    delete updates.email;

    // Update user in the database
    const updatedUser = await User.findByIdAndUpdate(id, updates, {
      new: true,
    });

    res
      .status(200)
      .json({ message: "User updated successfully", user: updatedUser });
  } catch (error) {
    console.error("Error updating user details:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getUserDetails, updateUserDetails };
