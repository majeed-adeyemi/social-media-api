const fs = require("fs");
const multer = require("multer");
const path = require("path");

// Set up storage with user-specific folders
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const userId = req.params.id; // Ensure user ID is passed in the request params
    const userUploadDir = path.join("uploads", userId);

    // Create user's folder if it doesn't exist
    fs.mkdirSync(userUploadDir, { recursive: true });
    cb(null, userUploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// Filter for image files
const fileFilter = (req, file, cb) => {
  const fileTypes = /jpeg|jpg|png|gif/;
  const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimeType = fileTypes.test(file.mimetype);

  if (extname && mimeType) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

// Multer configuration
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 4 * 1024 * 1024 }, // 4MB limit
});

module.exports = upload;
