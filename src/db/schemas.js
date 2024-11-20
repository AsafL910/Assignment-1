const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
  },
  sender: {
    type: String,
    required: true,
  },
});

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  sender: {
    type: String,
    required: true,
  },
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post", // Refers to the Post model
    required: true,
  },
});

module.exports = {
  Post: mongoose.model("Post", postSchema),
  Comment: mongoose.model("Comment", commentSchema),
};
