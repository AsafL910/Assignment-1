process.env.DATABASE_URL = "mongodb://127.0.0.1:27017/testdb";

const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../src/app.js");
const { Post } = require("../src/db/schemas");

let postId;
let accessToken;
let newPostSender;
const userEmail = "meir@mail.com";
const userPassword = "superSecretPassword";

beforeAll(async () => {
  await mongoose.connect(process.env.DATABASE_URL, {
    useUnifiedTopology: true,
  });

  const res = await request(app)
    .set("Authorization", "JWT " + accessToken)
    .post("/auth/register")
    .send({
      email: userEmail,
      password: userPassword,
    });

  newPostSender = res.body._id;
});

async function loginUser() {
  const response = await request(app)
    .set("Authorization", "JWT " + accessToken)
    .post("/auth/login")
    .send({
      email: userEmail,
      password: userPassword,
    });

  accessToken = response.body.accessToken;
}

beforeEach(async () => {
  await loginUser();

  const samplePost = new Post({
    message: "Sample Post",
    senderId: new mongoose.Types.ObjectId(),
  });
  const savedPost = await samplePost.save();
  postId = savedPost._id;
});

afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.connection.close();
});

afterEach(async () => {
  await Post.deleteMany(); // Clean up the collection after each test
});

describe("Testing Post Routes", () => {
  // Test POST /posts
  describe("POST /posts", () => {
    it("should create a new post", async () => {
      const res = await request(app)
        .post("/posts")
        .set("Authorization", "JWT " + accessToken)
        .send({
          message: "Hello, world!",
          senderId: new mongoose.Types.ObjectId(),
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("post");
      expect(res.body.post).toHaveProperty("message", "Hello, world!");
    });

    it("should return 400 for missing body parameters", async () => {
      const res = await request(app)
        .post("/posts")
        .set("Authorization", "JWT " + accessToken)
        .send({
          message: "No sender",
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toBe("required body not provided");
    });

    it("should return 400 for invalid parameter types", async () => {
      const res = await request(app)
        .post("/posts")
        .set("Authorization", "JWT " + accessToken)
        .send({
          message: 12345, // Invalid type
          senderId: "invalid-id", // Invalid ObjectId
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toBe("wrong type in one of the body parameters");
    });
  });

  // Test GET /posts
  describe("GET /posts", () => {
    it("should retrieve all posts", async () => {
      const res = await request(app)
        .get("/posts")
        .set("Authorization", "JWT " + accessToken);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBeTruthy();
      expect(res.body.length).toBeGreaterThan(0);
    });

    it("should return an empty array if no posts exist", async () => {
      await Post.deleteMany();
      const res = await request(app)
        .get("/posts")
        .set("Authorization", "JWT " + accessToken);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBeTruthy();
      expect(res.body.length).toBe(0);
    });
  });

  // Test GET /posts/sender
  describe("GET /posts/sender", () => {
    it("should retrieve posts by senderId", async () => {
      const senderId = new mongoose.Types.ObjectId();
      const samplePost = new Post({ message: "By sender", senderId });
      await samplePost.save();

      const res = await request(app)
        .get("/posts/sender")
        .set("Authorization", "JWT " + accessToken)
        .query({ id: senderId.toString() });
      console.log("asaf" + res.error.message);
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBeTruthy();
      expect(res.body[0]).toHaveProperty("senderId", senderId.toString());
    });

    it("should return 404 if senderId is not provided", async () => {
      const res = await request(app)
        .get("/posts/sender")
        .set("Authorization", "JWT " + accessToken);

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("error", "senderId not provided");
    });

    it("should return an empty array if no posts match senderId", async () => {
      const res = await request(app)
        .get("/posts/sender")
        .set("Authorization", "JWT " + accessToken)
        .query({
          id: new mongoose.Types.ObjectId().toString(),
        });

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBeTruthy();
      expect(res.body.length).toBe(0);
    });
  });

  // Test GET /posts/:id
  describe("GET /posts/:id", () => {
    it("should retrieve a post by ID", async () => {
      const res = await request(app)
        .get(`/posts/${postId}`)
        .set("Authorization", "JWT " + accessToken);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("_id", postId.toString());
    });

    it("should return 404 for non-existent post ID", async () => {
      const invalidId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/posts/${invalidId}`)
        .set("Authorization", "JWT " + accessToken);

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("error", "Post not found");
    });

    it("should return 500 for invalid post ID format", async () => {
      const res = await request(app)
        .get("/posts/invalid-id")
        .set("Authorization", "JWT " + accessToken);

      expect(res.statusCode).toBe(500);
    });
  });

  // Test PUT /posts/:id
  describe("PUT /posts/:id", () => {
    it("should update a post by ID", async () => {
      const res = await request(app)
        .set("Authorization", "JWT " + accessToken)
        .put(`/posts/${postId}`)
        .send({
          message: "Updated message!",
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("_id", postId.toString());
      expect(res.body).toHaveProperty("message", "Updated message!");
    });

    it("should return 400 for missing body parameters", async () => {
      const res = await request(app)
        .set("Authorization", "JWT " + accessToken)
        .put(`/posts/${postId}`)
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body).toBe("required body not provided");
    });

    it("should return 400 for invalid message type", async () => {
      const res = await request(app)
        .set("Authorization", "JWT " + accessToken)
        .put(`/posts/${postId}`)
        .send({
          message: 12345, // Invalid type
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toBe("wrong type body parameters");
    });

    it("should return 404 for non-existent post ID", async () => {
      const invalidId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .set("Authorization", "JWT " + accessToken)
        .put(`/posts/${invalidId}`)
        .send({
          message: "Non-existent post update",
        });

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("error", "Post not found");
    });

    it("should return 500 for invalid post ID format", async () => {
      const res = await request(app)
        .set("Authorization", "JWT " + accessToken)
        .put("/posts/invalid-id")
        .send({
          message: "Invalid ID format test",
        });

      expect(res.statusCode).toBe(500);
    });
  });
});
