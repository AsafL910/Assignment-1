const mongoose = require("mongoose");

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
  
  
  module.exports = mongoose.model("Comment", commentSchema)