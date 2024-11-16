const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const {
  saveComment,
  getCommentById,
  getAllComments,
} = require("../DAL/comments");
const { getPostsById } = require("../DAL/posts");

const newCommentRoute = router.post("/newComment", async (req, res) => {
  try {
    if (!req.body.content || !req.body.sender || !req.body.postId)
      return res.status(400).json("required body not provided");
    if (
      typeof req.body.content !== "string" ||
      typeof req.body.sender !== "string" ||
      !mongoose.Types.ObjectId.isValid(req.body.postId)
    )
      return res.status(400).json("wrong type in one of the body parameters");
    const post = await getPostsById(req.body.postId);
    if (!post) return res.status(400).json("post does not exist");
    const addedComment = await saveComment(req.body);

    return res.json({
      comment: "comment saved successfuly",
      post: addedComment,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.comment });
  }
});

const getCommentByIdRoute = router.get("/comment/:id", async (req, res) => {
  try {
    const comment = await getCommentById(req.params.id);

    if (!comment) return res.status(404).json({ error: "Comment not found" });

    return res.json(comment);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: err.message });
  }
});

const getAllCommentsRoute = router.get("/comments", async (req, res) => {
  try {
    const comments = await getAllComments();
    return res.json(comments);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = { newCommentRoute, getCommentByIdRoute, getAllCommentsRoute };
