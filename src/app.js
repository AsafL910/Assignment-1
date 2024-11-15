const express = require("express");
const app = express();
const db = require("./db/DbConnection");
const {
  newPostRoute,
  getAllPostsRoute,
  getPostsByIdRoute,
  getPostBySenderRoute,
  updatePostRoute,
} = require("./Controllers/routes");

app.use(express.json());
app.post("/newPost", newPostRoute);
app.get("/posts", getAllPostsRoute);
app.get("/post/:id", getPostsByIdRoute);
app.get("/post", getPostBySenderRoute);
app.put("/postToUpdate/:id", updatePostRoute);

module.exports = app;
