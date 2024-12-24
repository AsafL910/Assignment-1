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

router.post(
  "/",
  authenticate,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { message, senderId } = req.body;

      if (!message || !senderId) {
        res.status(400).json("required body not provided");
        return;
      }
      if (
        typeof message !== "string" ||
        !mongoose.Types.ObjectId.isValid(senderId)
      ) {
        res.status(400).json("wrong type in one of the body parameters");
        return;
      }

      const addedPost = await savePost(req.body);

      res.json({ message: "post saved successfully", post: addedPost });
      return;
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error.message });
      return;
    }
  },
);

router.get(
  "/",
  authenticate,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const posts = await getAllPosts();
      res.json(posts);
      return;
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
      return;
    }
  },
);

router.get(
  "/sender",
  authenticate,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const senderId = req.query.id as string;
      if (!senderId) {
        res.status(404).json({ error: "senderId not provided" });
        return;
      }

      const posts = await getPostsBySenderId(senderId);
      res.json(posts);
      return;
    } catch (err) {
      res.status(500).json({ error: err.message });
      return;
    }
  },
);

router.get(
  "/:id",
  authenticate,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const postId = req.params.id;

      if (!mongoose.Types.ObjectId.isValid(postId)) {
        res.status(400).json({ error: "Invalid post ID" });
        return;
      }
      const post = await getPostsById(postId);

      if (!post) {
        res.status(404).json({ error: "Post not found" });
        return;
      }

      res.json(post);
      return;
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
      return;
    }
  },
);

router.put(
  "/:id",
  authenticate,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const postId = req.params.id;
      if (!mongoose.Types.ObjectId.isValid(postId)) {
        res.status(400).json({ error: "Invalid post ID" });
        return;
      }
      const { message } = req.body;
      if (!message) {
        res.status(400).json("required body not provided");
        return;
      }
      if (typeof message !== "string") {
        res.status(400).json("wrong type body parameters");
        return;
      }

      const updatedPost = await updatePostById(postId, message);
      if (!updatedPost) {
        res.status(404).json({
          error: "Post not found",
        });
        return;
      }
      res.json(updatedPost);
      return;
    } catch (err) {
      res.status(500).json({ error: err.message });
      return;
    }
  },
);

export default router;
