process.env.DATABASE_URL = "mongodb://127.0.0.1:27017/testdb2";

const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../src/app.js"); // Adjust to your app's file path
const { Post } = require("../src/db/schemas.js"); // Import Post schema for test setup

beforeAll(async () => {
  // Connect to the test database
  await mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  // Create a sample post for testing
  const samplePost = new Post({
    message: "Sample Post",
    sender: "JohnDoe",
  });
  await samplePost.save();
});

afterAll(async () => {
  // Clean up the database and close the connection
  await mongoose.connection.db.dropDatabase();
  await mongoose.connection.close();
});

describe("Comment Routes Tests", () => {
  let postId;
  let commentId;

  beforeEach(async () => {
    const post = await Post.findOne({ message: "Sample Post" });
    postId = post._id;
  });

  // Test POST /newComment
  it("should save a new comment", async () => {
    const res = await request(app).post("/newComment").send({
      content: "This is a test comment",
      sender: "TestUser",
      postId: postId.toString(),
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("post");
    expect(res.body.post).toHaveProperty("_id");
    expect(res.body.post).toHaveProperty("content", "This is a test comment");

    commentId = res.body.post._id; // Save the comment ID for later tests
  });

  it("should return 400 for invalid body parameters", async () => {
    const res = await request(app).post("/newComment").send({
      sender: "TestUser", // Missing content and postId
    });

    expect(res.statusCode).toBe(400);
    expect(res.body).toBe("required body not provided");
  });

  it("should return 400 for invalid postId format", async () => {
    const res = await request(app).post("/newComment").send({
      content: "Invalid postId test",
      sender: "TestUser",
      postId: "invalid-id",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body).toBe("wrong type in one of the body parameters");
  });

  it("should return 400 for non-existent postId", async () => {
    const res = await request(app).post("/newComment").send({
      content: "Non-existent postId test",
      sender: "TestUser",
      postId: new mongoose.Types.ObjectId(),
    });

    expect(res.statusCode).toBe(400);
    expect(res.body).toBe("post does not exist");
  });

  // Test GET /comment/:id
  it("should retrieve a comment by ID", async () => {
    const res = await request(app).get(`/comment/${commentId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("_id", commentId);
  });

  it("should return 404 for non-existent comment ID", async () => {
    const res = await request(app).get(`/comment/${new mongoose.Types.ObjectId()}`);
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty("error", "Comment not found");
  });

  // Test GET /comments
  it("should retrieve all comments", async () => {
    const res = await request(app).get("/comments");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBeTruthy();
    expect(res.body.length).toBeGreaterThan(0);
  });

  // Test GET /comments/post/:postId
  it("should retrieve comments by postId", async () => {
    const res = await request(app).get(`/comments/post/${postId}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBeTruthy();
  });

  it("should return 400 for invalid postId format", async () => {
    const res = await request(app).get("/comments/post/invalid-id");
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error", "Invalid post ID");
  });

  // Test PUT /updateComment/:id
  it("should update a comment by ID", async () => {
    const res = await request(app).put(`/updateComment/${commentId}`).send({
      content: "Updated comment content",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("content", "Updated comment content");
  });

  it("should return 400 for missing body in update", async () => {
    const res = await request(app).put(`/updateComment/${commentId}`).send({});
    expect(res.statusCode).toBe(400);
    expect(res.body).toBe("required body not provided");
  });

  // Test DELETE /deleteComment/:id
  it("should delete a comment by ID", async () => {
    const res = await request(app).delete(`/deleteComment/${commentId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message", "Comment deleted successfully");

    // Verify comment is deleted
    const check = await request(app).get(`/comment/${commentId}`);
    expect(check.statusCode).toBe(404);
  });

  it("should return 400 for invalid comment ID format in delete", async () => {
    const res = await request(app).delete(`/deleteComment/invalid-id`);
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error", "Invalid comment ID");
  });

  it("should return 404 for non-existent comment ID in delete", async () => {
    const res = await request(app).delete(`/deleteComment/${new mongoose.Types.ObjectId()}`);
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty("error", "Comment not found");
  });
});
