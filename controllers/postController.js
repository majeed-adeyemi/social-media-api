const Post = require("../models/Post");
const User = require("../models/User")

// Create Post with Image Upload
const createPost = async (req, res) => {
  const { content } = req.body;
  const image = req.file ? req.file.path : null;

  try {
    const post = new Post({ userId: req.user._id, content, image });
    await post.save();
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get All Posts
const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("userId", "firstName middleName lastName") // Populate full name
      .populate("likes", "firstName middleName lastName");

    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Edit a post
const editPost = async (req, res) => {
  const { postId } = req.params;
  const { content } = req.body; // New post content
  const userId = req.user._id;

  try {
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.userId.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "You can only edit your own post" });
    }

    // Edit the post content
    post.content = content;
    await post.save();
    res.status(200).json({ message: "Post edited", post });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a Post
const deletePost = async (req, res) => {
  const { postId } = req.params;
  const userId = req.user._id;

  try {
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.userId.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "You can only delete your own post" });
    }

    // Delete the post
    await Post.deleteOne({ _id: postId });
    res.status(200).json({ message: "Post deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Like or Unlike a Post
const likeUnlikePost = async (req, res) => {
  const { postId } = req.params;

  try {
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const isLiked = post.likes.includes(req.user._id);

    if (isLiked) {
      // Unlike the post
      post.likes = post.likes.filter(
        (userId) => userId.toString() !== req.user._id.toString()
      );
      await post.save();
      return res
        .status(200)
        .json({ message: "Post unliked", likes: post.likes.length });
    }

    // Like the post
    post.likes.push(req.user._id);
    await post.save();
    res.status(200).json({ message: "Post liked", likes: post.likes.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all likes on a post with user details
const getAllPostLikes = async (req, res) => {
  const { postId } = req.params;

  try {
    // Find the post and populate user details for likes
    const post = await Post.findById(postId).populate({
      path: "likes",
      select: "firstName lastName profilePicture",
    });

    if (!post) return res.status(404).json({ message: "Post not found" });

    res.status(200).json({ likes: post.likes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Add a comment to a post
const addCommentToPost = async (req, res) => {
  const { postId } = req.params;
  const { content } = req.body; // Comment content
  const userId = req.user._id;

  try {
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    // Add the new comment to the post
    const newComment = {
      userId,
      content,
      createdAt: Date.now(),
    };

    post.comments.push(newComment);
    await post.save();
    res.status(201).json({ message: 'Comment added', comment: newComment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all comments under a post
const getPostComments = async (req, res) => {
  const { postId } = req.params;

  try {
    const post = await Post.findById(postId).populate(
      "comments.userId",
      "firstName middleName lastName profilePicture" // Populate user details for frontend rendering if needed
    );
    if (!post) return res.status(404).json({ message: "Post not found" });

    res.json(post.comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const toggleLikeOnComment = async (req, res) => {
  const { postId, commentId } = req.params;

  try {
    // Find the post
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // Find the comment in the post
    const comment = post.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    // Check if the user already liked the comment
    const isLiked = comment.likes.includes(req.user._id);

    if (isLiked) {
      // Unlike the comment
      comment.likes = comment.likes.filter(
        (userId) => userId.toString() !== req.user._id.toString()
      );
      await post.save();
      return res
        .status(200)
        .json({ message: "Comment unliked", likes: comment.likes.length });
    }

    // Like the comment
    comment.likes.push(req.user._id);
    await post.save();
    res
      .status(200)
      .json({ message: "Comment liked", likes: comment.likes.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all likes of a comment with user details
const getAllLikesOfComment = async (req, res) => {
  const { postId, commentId } = req.params;

  try {
    // Find the post and populate the user details for the likes of the comment
    const post = await Post.findById(postId).populate({
      path: 'comments.likes', // Path to populate likes within comments
      select: 'firstName lastName profilePicture', // Fields to include from the User model
    });

    if (!post) return res.status(404).json({ message: 'Post not found' });

    const comment = post.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    // Send the populated likes (user details) of the comment
    res.status(200).json({ likes: comment.likes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Edit a comment
const editAPostComment = async (req, res) => {
  const { postId, commentId } = req.params;
    const { content } = req.body; // New comment content
    const userId = req.user._id;

    try {
      const post = await Post.findById(postId);
      if (!post) return res.status(404).json({ message: 'Post not found' });

      const comment = post.comments.id(commentId);
      if (!comment) return res.status(404).json({ message: 'Comment not found' });

      if (comment.userId.toString() !== userId.toString()) {
        return res.status(403).json({ message: 'You can only edit your own comment' });
      }

      // Edit the comment
      comment.content = content;
      await post.save();
      res.status(200).json({ message: 'Comment edited', comment });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
};

// Delete a comment
const deleteAPostComment = async (req, res) => {
    const { postId, commentId } = req.params;
    const userId = req.user._id;
    try {
      const post = await Post.findById(postId);
      if (!post) return res.status(404).json({ message: 'Post not found' });
      const comment = post.comments.id(commentId);
      if (!comment) return res.status(404).json({ message: 'Comment not found' });
      if (comment.userId.toString() !== userId.toString()) {
        return res.status(403).json({ message: 'You can only delete your own comment' });
      }
      // Delete the comment
      post.comments.pull(commentId);
      await post.save();
      res.status(200).json({ message: 'Comment deleted' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
};

// Like a reply to a comment
const likeUnlikeCommentReply = async (req, res) => {
  const { postId, commentId, replyId } = req.params;
    const userId = req.user._id;

    try {
      const post = await Post.findById(postId);
      if (!post) return res.status(404).json({ message: 'Post not found' });

      const comment = post.comments.id(commentId);
      if (!comment) return res.status(404).json({ message: 'Comment not found' });

      const reply = comment.replies.id(replyId);
      if (!reply) return res.status(404).json({ message: 'Reply not found' });

      // Check if the user has already liked the reply
      const isLiked = reply.likes.includes(userId);
      if (isLiked) {
        // Unlike the reply
        reply.likes = reply.likes.filter((likeId) => likeId.toString() !== userId.toString());
      res
        .status(200)
        .json({ message: "Reply unliked", likes: reply.likes.length });
      } else {
        // Like the reply
        reply.likes.push(userId);
        res.status(200).json({ message: 'Reply liked', likes: reply.likes.length });
      }

      await post.save();
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
};

// Get all likes of a reply under a comment with user details
const getAllLikesOfReply = async (req, res) => {
  const { postId, commentId, replyId } = req.params;

  try {
    // Find the post and populate the user details for the likes of the reply
    const post = await Post.findById(postId).populate({
      path: 'comments.replies.likes', // Path to populate likes within replies
      select: 'firstName lastName profilePicture',
    });

    if (!post) return res.status(404).json({ message: 'Post not found' });

    const comment = post.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    const reply = comment.replies.id(replyId);
    if (!reply) return res.status(404).json({ message: 'Reply not found' });

    // Send the populated likes (user details) of the reply
    res.status(200).json({ likes: reply.likes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Add a reply to a comment
const replyToComment = async (req, res) => {
  const { postId, commentId } = req.params;
    const { content } = req.body; // Reply content
    const userId = req.user._id;

    try {
      const post = await Post.findById(postId);
      if (!post) return res.status(404).json({ message: 'Post not found' });

      const comment = post.comments.id(commentId);
      if (!comment) return res.status(404).json({ message: 'Comment not found' });

      // Add the reply to the comment
      const newReply = {
        userId,
        content,
      };

      comment.replies.push(newReply);
      await post.save();
      res.status(200).json({ message: 'Reply added', reply: newReply });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
};

// Get all replies under a comment
const getAllReplies = async (req, res) => {
  const { postId, commentId } = req.params;

  try {
    const post = await Post.findById(postId).populate(
      "comments.replies.userId",
      "firstName middleName lastName profilePicture" // Populate user details for frontend rendering if needed
    );
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const comment = post.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    res.status(200).json({ replies: comment.replies });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Edit a reply
const editReplytoComment = async (req, res) => {
  const { postId, commentId, replyId } = req.params;
    const { content } = req.body; // New reply content
    const userId = req.user._id;

    try {
      const post = await Post.findById(postId);
      if (!post) return res.status(404).json({ message: 'Post not found' });

      const comment = post.comments.id(commentId);
      if (!comment) return res.status(404).json({ message: 'Comment not found' });

      const reply = comment.replies.id(replyId);
      if (!reply) return res.status(404).json({ message: 'Reply not found' });

      if (reply.userId.toString() !== userId.toString()) {
        return res.status(403).json({ message: 'You can only edit your own reply' });
      }

      // Edit the reply
      reply.content = content;
      await post.save();
      res.status(200).json({ message: 'Reply edited', reply });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
};

// Delete a reply
const deleteReplytoComment = async (req, res) => {
  const { postId, commentId, replyId } = req.params;
    const userId = req.user._id;

    try {
      const post = await Post.findById(postId);
      if (!post) return res.status(404).json({ message: 'Post not found' });

      const comment = post.comments.id(commentId);
      if (!comment) return res.status(404).json({ message: 'Comment not found' });

      const reply = comment.replies.id(replyId);
      if (!reply) return res.status(404).json({ message: 'Reply not found' });

      if (reply.userId.toString() !== userId.toString()) {
        return res.status(403).json({ message: 'You can only delete your own reply' });
      }

      // Delete the reply
      comment.replies.pull(replyId);
      await post.save();
      res.status(200).json({ message: 'Reply deleted' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
};

// Upload Profile Picture
const uploadProfilePicture = async (req, res) => {
  try {
    const userId = req.user._id;
    const profilePicturePath = req.file.path;

    // Update user's profile with the uploaded profile picture path
    // Assuming `User` is your User model
    await User.findByIdAndUpdate(userId, {
      profilePicture: profilePicturePath,
    });

    res
      .status(200)
      .json({
        message: "Profile picture uploaded successfully",
        path: profilePicturePath,
      });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Upload Cover Photo
const uploadCoverPhoto = async (req, res) => {
  try {
    const userId = req.user._id;
    const coverPhotoPath = req.file.path;

    // Update user's profile with the uploaded cover photo path
    // Assuming `User` is your User model
    await User.findByIdAndUpdate(userId, { coverPhoto: coverPhotoPath });

    res
      .status(200)
      .json({
        message: "Cover photo uploaded successfully",
        path: coverPhotoPath,
      });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



module.exports = {
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
};
