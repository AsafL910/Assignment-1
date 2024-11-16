const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const mongoose = require("./db/DbConnection");

const {
  newPostRoute,
  getAllPostsRoute,
  getPostsByIdRoute,
  getPostBySenderRoute,
  updatePostRoute,
} = require("./Controllers/posts");

app.use(express.json());
app.use(bodyParser.json());

// posts api
app.post("/newPost", newPostRoute);
app.get("/posts", getAllPostsRoute);
app.get("/post/:id", getPostsByIdRoute);
app.get("/post", getPostBySenderRoute);
app.put("/postToUpdate/:id", updatePostRoute);

module.exports = app;
