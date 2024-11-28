const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("./db/DbConnection");

const postRouter = require("./Controllers/posts");
const commentRouter = require("./Controllers/comments");
const userRouter = require("./Controllers/users");

app.use(express.json());
app.use(bodyParser.json());

app.use("/posts", postRouter);
app.use("/comments", commentRouter);
app.use("/users", userRouter);

module.exports = app;
