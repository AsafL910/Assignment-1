const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const {
  saveComment,
  getCommentById,
  getAllComments,
  updateCommentById,
  deleteCommentById,
  getCommentsByPostId
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

const updateCommentRoute = router.put(
  "/updateComment/:id",
  async (req, res) => {
    try {
      const newContent = req.body.content;
      if (!newContent)
        return res.status(400).json("required body not provided");
      if (typeof newContent !== "string")
        return res.status(400).json("wrong type body parameters");

      const updatedComment = await updateCommentById(req.params.id, newContent);
      if (!updatedComment) {
        return res.status(404).json({
          error: "Comment not found",
        });
      }
      return res.json(updatedComment);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },
);

const deleteCommentRoute = router.delete(
  "/deleteComment/:id",
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: "Invalid comment ID" });
      }

      const deletedComment = await deleteCommentById(id);
      if (!deletedComment) {
        return res.status(404).json({ error: "Comment not found" });
      }

      return res.json({
        message: "Comment deleted successfully",
        deletedComment,
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: err.message });
    }
  },
);

const getCommentsByPostRoute = router.get(
  "/comments/post/:postId",
  async (req, res) => {
    try {
      const { postId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(postId)) {
        return res.status(400).json({ error: "Invalid post ID" });
      }
      const post = await getPostsById(postId);
      console.log(post, postId)
      if (!post) {
        return res.status(404).json({
          error: "Post does not exist",
        });
      }
      const comments = await getCommentsByPostId(postId);
      if (!comments || comments.length === 0) {
        return res
          .status(404)
          .json({ error: "No comments found for this post" });
      }

      return res.json(comments);
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: err.message });
    }
  },
);

module.exports = {
  newCommentRoute,
  getCommentByIdRoute,
  getAllCommentsRoute,
  updateCommentRoute,
  deleteCommentRoute,
  getCommentsByPostRoute,
};
