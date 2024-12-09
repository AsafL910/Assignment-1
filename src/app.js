const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("./db/DbConnection");

const postRouter = require("./Controllers/posts");
const commentRouter = require("./Controllers/comments");
const userRouter = require("./Controllers/users");
const authRouter = require("./Controllers/auth");

const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const swaggerOptions = require("../swagger.json");

app.use(express.json());
app.use(bodyParser.json());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerOptions));
app.use("/posts", postRouter);
app.use("/comments", commentRouter);
app.use("/users", userRouter);
app.use("/auth", authRouter);

module.exports = app;
