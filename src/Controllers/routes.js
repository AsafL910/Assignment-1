const express = require("express");
const router = express.Router();
const {
  savePost,
  getAllPosts,
  getPostsById,
  getPostsBySender,
  updatePostById,
} = require("../DAL");

const newPostRoute = router.post("/newpost", async (req, res) => {
  try {
    const body = req.body;

    if (!body.message || !body.sender)
      res.status(400).json("required body not provided");
    if (typeof body.message !== "string" || typeof body.sender !== "string")
      res.status(400).json("wrong type in one of the body parameters");

    const addedPost = await savePost(body);

    res.json({ message: "post saved successfulyB", post: addedPost });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: err.message });
  }
});

const getAllPostsRoute = router.get("/posts", async (req, res) => {
  try {
    const posts = await getAllPosts();
    res.json(posts);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

const getPostsByIdRoute = router.get("/post/:id", async (req, res) => {
  try {
    const post = await getPostsById(req.params.id);

    if (!post) return res.status(404).json({ error: "Post not found" });

    res.json(post);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

const getPostBySenderRoute = router.get("/post", async (req, res) => {
  try {
    const sender = req.query.sender;
    if (!sender) return res.status(404).json({ error: "sender not provided" });

    const posts = await getPostsBySender(sender);
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const updatePostRoute = router.put("/postToUpdate/:id", async (req, res) => {
  try {
    const newMessage = req.body.message;
    if (!newMessage) res.status(400).json("required body not provided");
    if (typeof newMessage !== "string")
      res.status(400).json("wrong type body parameters");

    const updatedPost = await updatePostById(req.params.id, newMessage);
    if (!updatedPost) {
      return res.status(404).json({
        error: "Post not found",
      });
    }
    res.json(updatedPost);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = {
  newPostRoute,
  getAllPostsRoute,
  getPostsByIdRoute,
  getPostBySenderRoute,
  updatePostRoute,
};
