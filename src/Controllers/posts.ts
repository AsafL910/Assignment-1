import express, { Request, Response } from "express";
import mongoose from "mongoose";
import authenticate from "../Middlewares/authMiddleware";
import {
  savePost,
  getAllPosts,
  getPostsById,
  getPostsBySenderId,
  updatePostById,
} from "../DAL/posts";

const router = express.Router();

router.post("/", authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { message, senderId } = req.body;

    if (!message || !senderId) res.status(400).json("required body not provided");
    if (typeof message !== "string" || !mongoose.Types.ObjectId.isValid(senderId)) {
      res.status(400).json("wrong type in one of the body parameters");
    }

    const addedPost = await savePost(req.body);

    res.json({ message: "post saved successfully", post: addedPost });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/", authenticate, async (req: Request, res: Response): Promise<void>  => {
  try {
    const posts = await getAllPosts();
    res.json(posts);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/sender", authenticate, async (req: Request, res: Response): Promise<void>  => {
  try {
    const senderId = req.query.id as string;
    if (!senderId) res.status(404).json({ error: "senderId not provided" });

    const posts = await getPostsBySenderId(senderId);
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", authenticate, async (req: Request, res: Response): Promise<void>  => {
  try {
    const postId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      res.status(400).json({ error: "Invalid post ID" });
    }
    const post = await getPostsById(postId);

    if (!post) res.status(404).json({ error: "Post not found" });

    res.json(post);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", authenticate, async (req: Request, res: Response): Promise<void>  => {
  try {
    const postId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      res.status(400).json({ error: "Invalid post ID" });
    }
    const { message } = req.body;
    if (!message) res.status(400).json("required body not provided");
    if (typeof message !== "string") res.status(400).json("wrong type body parameters");

    const updatedPost = await updatePostById(postId, message);
    if (!updatedPost) {
      res.status(404).json({
        error: "Post not found",
      });
    }
    res.json(updatedPost);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
