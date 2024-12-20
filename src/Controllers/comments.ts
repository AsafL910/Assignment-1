import express, { Request, Response } from "express";
import mongoose from "mongoose";
import {
  saveComment,
  getCommentById,
  getAllComments,
  updateCommentById,
  deleteCommentById,
  getCommentsByPostId,
} from "../DAL/comments";
import { getPostsById } from "../DAL/posts";
import authenticate from "../Middlewares/authMiddleware";

const router = express.Router();

router.post("/", authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { content, senderId, postId } = req.body;
    if (!content || !senderId || !postId) res.status(400).json("required body not provided");
    if (typeof content !== "string" || typeof senderId !== "string" || !mongoose.Types.ObjectId.isValid(postId))
      res.status(400).json("wrong type in one of the body parameters");

    const post = await getPostsById(postId);
    if (!post) res.status(400).json("post does not exist");

    const addedComment = await saveComment(req.body);

    res.json({
      comment: "comment saved successfully",
      post: addedComment,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id", authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const comment = await getCommentById(req.params.id);

    if (!comment) res.status(404).json({ error: "Comment not found" });

    res.json(comment);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/", authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const comments = await getAllComments();
    res.json(comments);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const newContent = req.body.content;
    if (!newContent) res.status(400).json("required body not provided");
    if (typeof newContent !== "string") res.status(400).json("wrong type body parameters");

    const updatedComment = await updateCommentById(req.params.id, newContent);
    if (!updatedComment) {
      res.status(404).json({
        error: "Comment not found",
      });
    }
    res.json(updatedComment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: "Invalid comment ID" });
    }

    const deletedComment = await deleteCommentById(id);

    if (!deletedComment) {
      res.status(404).json({ error: "Comment not found" });
    }

    res.json({
      message: "Comment deleted successfully",
      deletedComment,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/post/:postId", authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { postId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      res.status(400).json({ error: "Invalid post ID" });
    }

    const post = await getPostsById(postId);
    if (!post) {
      res.status(404).json({
        error: "Post does not exist",
      });
    }

    const comments = await getCommentsByPostId(postId);
    if (!comments || comments.length === 0) {
      res.status(404).json({ error: "No comments found for this post" });
    }

    res.json(comments);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
