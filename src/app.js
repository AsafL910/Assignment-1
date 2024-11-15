const express = require("express");
const app = express();
const db = require("./db/DbConnection");
const {
  newPostRoute,
  getAllPostsRoute,
  getPostsByIdRoute,
} = require("./Controllers/routes");

app.use(express.json());
app.post("/newPost", newPostRoute);
app.get("/posts", getAllPostsRoute);
app.get("/post/:id", getPostsByIdRoute);
module.exports = app;
