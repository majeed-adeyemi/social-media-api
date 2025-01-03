const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");
const {
  createPost,
  getAllPosts,
  editPost,
  deletePost,
  likeUnlikePost,
  getAllPostLikes,
  addCommentToPost,
  getPostComments,
  toggleLikeOnComment,
  getAllLikesOfComment,
  editAPostComment,
  deleteAPostComment,
  likeUnlikeCommentReply,
  getAllLikesOfReply,
  replyToComment,
  getAllReplies,
  editReplytoComment,
  deleteReplytoComment,
  uploadProfilePicture,
  uploadCoverPhoto,
} = require("../controllers/postController");

const router = express.Router();

// Post related routes
router.post("/", protect, upload.single("image"), createPost); // Create a post with image uploaded
router.get("/", getAllPosts); // Get all posts
router.put("/:postId", protect, editPost); // Edit a post
router.patch("/:postId/like", protect, likeUnlikePost); // Like and Unlike a Post
router.get("/:postId/likes", protect, getAllPostLikes); // Get all likes on a post
router.delete("/:postId", protect, deletePost); // Delete a post

// Comment related routes
router.post("/:postId/comments", protect, addCommentToPost); // Add a comment to a post
router.get("/:postId/comments", getPostComments); // Get all comments under a post
router.put("/:postId/comments/:commentId", protect, editAPostComment); // Edit a comment
router.patch("/:postId/comments/:commentId/like", protect, toggleLikeOnComment); // Like and Unlike a comment
router.get("/:postId/comments/:commentId/likes", protect, getAllLikesOfComment); // Get all likes on a comment
router.delete("/:postId/comments/:commentId", protect, deleteAPostComment); // Delete a comment

// Reply related routes
router.post("/:postId/comments/:commentId/replies", protect, replyToComment); // Add a reply to a comment
router.get("/:postId/comments/:commentId/replies", protect, getAllReplies); // Get all replies under a comment
router.put( "/:postId/comments/:commentId/replies/:replyId", protect, editReplytoComment);// Edit a reply
router.patch("/:postId/comments/:commentId/replies/:replyId/like", protect, likeUnlikeCommentReply); // Like and Unlike a reply to a comment
router.get("/:postId/comments/:commentId/replies/:replyId/likes", protect, getAllLikesOfReply); // Like and Unlike a reply to a comment
router.delete("/:postId/comments/:commentId/replies/:replyId", protect, deleteReplytoComment); // Delete a reply

// User-related routes for profile and cover photos
router.post("/profile-picture", protect, upload.single("profilePicture"), uploadProfilePicture); // Upload profile picture
router.post("/cover-photo", protect, upload.single("coverPhoto"), uploadCoverPhoto); // Upload cover photo

module.exports = router;
