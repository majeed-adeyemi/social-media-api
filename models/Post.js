const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: { type: String, required: true },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        content: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
        likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Likes for this comment
        replies: [
          {
            userId: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "User",
              required: true,
            },
            content: { type: String, required: true },
            createdAt: { type: Date, default: Date.now },
            likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Likes for this reply
          },
        ],
      },
    ],
    image: { type: String }, // Optional field for storing image path
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", PostSchema);
