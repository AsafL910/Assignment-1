const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const {
  savePost,
  getAllPosts,
  getPostsById,
  getPostsBySenderId,
  updatePostById,
} = require("../DAL/posts");

router.post("/", async (req, res) => {
  try {
    const body = req.body;

    if (!body.message || !body.senderId)
      return res.status(400).json("required body not provided");
    if (
      typeof body.message !== "string" ||
      !mongoose.Types.ObjectId.isValid(req.body.senderId)
    )
      return res.status(400).json("wrong type in one of the body parameters");

    const addedPost = await savePost(body);

    return res.json({ message: "post saved successfuly", post: addedPost });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const posts = await getAllPosts();
    return res.json(posts);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: err.message });
  }
});

router.get("/sender", async (req, res) => {
  try {
    const senderId = req.query.id;
    if (!senderId)
      return res.status(404).json({ error: "senderId not provided" });

    const posts = await getPostsBySenderId(senderId);
    return res.json(posts);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const post = await getPostsById(req.params.id);

    if (!post) return res.status(404).json({ error: "Post not found" });

    return res.json(post);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const newMessage = req.body.message;
    if (!newMessage) return res.status(400).json("required body not provided");
    if (typeof newMessage !== "string")
      return res.status(400).json("wrong type body parameters");

    const updatedPost = await updatePostById(req.params.id, newMessage);
    if (!updatedPost) {
      return res.status(404).json({
        error: "Post not found",
      });
    }
    return res.json(updatedPost);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
