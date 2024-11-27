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
  updateCommentRoute,
  deleteCommentRoute,
  getCommentsByPostRoute
} = require("./Controllers/comments");

app.use(express.json());
app.use(bodyParser.json());

// posts api
app.use(newPostRoute);
app.use(getAllPostsRoute);
app.use(getPostsByIdRoute);
app.use(getPostBySenderRoute);
app.use(updatePostRoute);

//comments api
app.use(newCommentRoute);
app.use(getCommentByIdRoute);
app.use(getAllCommentsRoute);
app.use(updateCommentRoute);
app.use(deleteCommentRoute);
app.use(getCommentsByPostRoute);

module.exports = app;
