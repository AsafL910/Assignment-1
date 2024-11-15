const express = require("express");
const router = express.Router();
const { savePost, getAllPosts, getPostsById } = require("../DAL");

const newPostRoute = router.post("/newpost", async (req, res) => {
  try {
    const body = req.body;

    if (!body.message || !body.sender)
      res.status(400).json("required body not provided");
    if (typeof body.message !== "string" || typeof body.sender !== "string")
      res.status(400).json("wrong type in one of the body parameters");

    const addedPost = await savePost(body);
    console.log("im here");

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

module.exports = { newPostRoute, getAllPostsRoute, getPostsByIdRoute };
