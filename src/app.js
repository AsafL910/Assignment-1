const express = require("express");
const app = express();
const db = require("./db/DbConnection");
const {
  newPostRoute,
  getAllPostsRoute,
  getPostsByIdRoute,
  getPostBySenderRoute
} = require("./Controllers/routes");

app.use(express.json());
app.post("/newPost", newPostRoute);
app.get("/posts", getAllPostsRoute);
app.get("/post/:id", getPostsByIdRoute);
app.get("/post", getPostBySenderRoute);

module.exports = app;
