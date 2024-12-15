require("dotenv").config();
process.env.DATABASE_URL = "mongodb://127.0.0.1:27017/testcommentsdb";

const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../src/app.js"); // Adjust to your app's file path
const { Post, User, Comment } = require("../src/db/schemas.js"); // Import Post schema for test setup

let postId;
let senderId;
let commentPostId;
let accessToken;
const mockUser = {
  username: "123meir",
  email: "meir@mail.com",
  password: "superSecretPassword",
};

beforeAll(async () => {
  // Connect to the test database
  await mongoose.connect(process.env.DATABASE_URL, {
    useUnifiedTopology: true,
  });

  const res = await request(app).post("/auth/register").send(mockUser);

  senderId = res.body._id; // Save the senderId for later use

  const samplePost = new Post({
    message: "Sample Post",
    senderId: new mongoose.Types.ObjectId(),
  });
  const savedPost = await samplePost.save();
  postId = savedPost._id;
});

const loginUser = async () => {
  const response = await request(app).post("/auth/login").send(mockUser);

  accessToken = response.body.accessToken;
};

beforeEach(async () => {
  await loginUser();
});

afterAll(async () => {
  // Clean up the database and close the connection
  await mongoose.connection.db.dropDatabase();
  await mongoose.connection.close();
});

describe("Comment Routes Tests", () => {
  // Test POST /newComment
  it("should save a new comment", async () => {
    const res = await request(app)
      .post("/comments/")
      .set("Authorization", "Bearer " + accessToken)
      .send({
        content: "This is a test comment",
        senderId: senderId,
        postId: postId,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("post");
    expect(res.body.post).toHaveProperty("_id");
    expect(res.body.post).toHaveProperty("content", "This is a test comment");

    commentPostId = res.body.post._id; // Save the comment ID for later tests
  });

  it("should return 400 for invalid body parameters", async () => {
    const res = await request(app)
      .post("/comments/")
      .set("Authorization", "Bearer " + accessToken)
      .send({
        senderId: senderId.toString(), // Only passing senderId, missing content and postId
      });

    expect(res.statusCode).toBe(400);
    expect(res.body).toBe("required body not provided");
  });

  it("should return 400 for invalid postId format", async () => {
    const res = await request(app)
      .post("/comments/")
      .set("Authorization", "Bearer " + accessToken)
      .send({
        content: "Invalid postId test",
        senderId: senderId.toString(),
        postId: "invalid-id", // Invalid postId format
      });

    expect(res.statusCode).toBe(400);
    expect(res.body).toBe("wrong type in one of the body parameters");
  });

  it("should return 400 for non-existent postId", async () => {
    const res = await request(app)
      .post("/comments/")
      .set("Authorization", "Bearer " + accessToken)
      .send({
        content: "Non-existent postId test",
        senderId: senderId.toString(),
        postId: new mongoose.Types.ObjectId(), // Non-existent postId
      });

    expect(res.statusCode).toBe(400);
    expect(res.body).toBe("post does not exist");
  });

  // Test GET /comment/:id
  it("should retrieve a comment by ID", async () => {
    const res = await request(app)
      .get(`/comments/${commentPostId}`)
      .set("Authorization", "Bearer " + accessToken);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("_id", commentPostId);
  });

  it("should return 404 for non-existent comment ID", async () => {
    const res = await request(app)
      .get(
        `/comment/${new mongoose.Types.ObjectId()}` // Non-existent comment ID
      )
      .set("Authorization", "Bearer " + accessToken);
    expect(res.statusCode).toBe(404);
  });

  // Test GET /comments
  it("should retrieve all comments", async () => {
    const res = await request(app)
      .get("/comments")
      .set("Authorization", "Bearer " + accessToken);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBeTruthy();
    expect(res.body.length).toBeGreaterThan(0);
  });

  // Test GET /comments/post/:postId
  it("should retrieve comments by postId", async () => {
    const comments = await Comment.find();

    const res = await request(app)
      .get(`/comments/post/${postId}`)
      .set("Authorization", "Bearer " + accessToken);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBeTruthy();
  });

  it("should return 400 for invalid postId format", async () => {
    const res = await request(app)
      .get("/comments/post/invalid-id")
      .set("Authorization", "Bearer " + accessToken);
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error", "Invalid post ID");
  });

  // Test PUT /updateComment/:id
  it("should update a comment by ID", async () => {
    const res = await request(app)
      .put(`/comments/${commentPostId}`)
      .set("Authorization", "Bearer " + accessToken)
      .send({
        content: "Updated comment content",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("content", "Updated comment content");
  });

  it("should return 400 for missing body in update", async () => {
    const res = await request(app)
      .put(`/comments/${commentPostId}`)
      .set("Authorization", "Bearer " + accessToken)
      .send({});
    expect(res.statusCode).toBe(400);
    expect(res.body).toBe("required body not provided");
  });

  // Test DELETE /deleteComment/:id
  it("should delete a comment by ID", async () => {
    const res = await request(app)
      .delete(`/comments/${commentPostId}`)
      .set("Authorization", "Bearer " + accessToken);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message", "Comment deleted successfully");

    // Verify comment is deleted
    const check = await request(app)
      .get(`/comments/${commentPostId}`)
      .set("Authorization", "Bearer " + accessToken);
    expect(check.statusCode).toBe(404);
  });

  it("should return 400 for invalid comment ID format in delete", async () => {
    const res = await request(app)
      .delete(`/comments/invalid-id`)
      .set("Authorization", "Bearer " + accessToken);
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error", "Invalid comment ID");
  });

  it("should return 404 for non-existent comment ID in delete", async () => {
    const res = await request(app)
      .delete(
        `/deleteComment/${new mongoose.Types.ObjectId()}` // Non-existent comment ID
      )
      .set("Authorization", "Bearer " + accessToken);
    expect(res.statusCode).toBe(404);
  });
});
