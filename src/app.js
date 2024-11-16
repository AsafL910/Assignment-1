const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("./db/DbConnection");

const {
  newPostRoute,
  getAllPostsRoute,
  getPostsByIdRoute,
  getPostBySenderRoute,
  updatePostRoute,
} = require("./Controllers/posts");

const {
  newCommentRoute,
  getCommentByIdRoute,
  getAllCommentsRoute,
} = require("./Controllers/comments");

app.use(express.json());
app.use(bodyParser.json());

// posts api
app.post("/newPost", newPostRoute);
app.get("/posts", getAllPostsRoute);
app.get("/post/:id", getPostsByIdRoute);
app.get("/post", getPostBySenderRoute);
app.put("/postToUpdate/:id", updatePostRoute);

//comments api
app.use(newCommentRoute);
app.use(getCommentByIdRoute);
app.use(getAllCommentsRoute);

module.exports = app;
