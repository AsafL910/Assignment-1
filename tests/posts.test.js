require('dotenv').config();
process.env.DATABASE_URL = "mongodb://127.0.0.1:27017/testdb";

const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../src/app.js");
const { Post } = require("../src/db/schemas");

let postId;
let accessToken;
let senderId;
const username = "0123meir" 
const userEmail = "meir@mail.com";
const userPassword = "superSecretPassword";

beforeAll(async () => {
  await mongoose.connect(process.env.DATABASE_URL, {
    useUnifiedTopology: true,
  });

  const res = await request(app).post("/auth/register").send({
    username,
    email: userEmail,
    password: userPassword,
  });

  senderId = res.body._id;
});

const loginUser = async () => {
  const response = await request(app).post("/auth/login").send({
    username,
    email: userEmail,
    password: userPassword,
  });

  accessToken = response.body.accessToken;  
};

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

describe("Testing Post Routes", () => {
  // Test POST /posts
  describe("POST /posts", () => {
    it("should create a new post", async () => {
      const res = await request(app)
      .post("/posts")
      .set("Authorization", "Bearer " + accessToken)
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
      .set("Authorization", "Bearer " + accessToken)
        .send({
          message: "No sender",
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toBe("required body not provided");
    });

    it("should return 400 for invalid parameter types", async () => {
      const res = await request(app)
      .post("/posts")
      .set("Authorization", "Bearer " + accessToken)
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
        .set("Authorization", "Bearer " + accessToken);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBeTruthy();
      expect(res.body.length).toBeGreaterThan(0);
    });

    it("should return an empty array if no posts exist", async () => {
      await Post.deleteMany();
      const res = await request(app)
        .get("/posts")
        .set("Authorization", "Bearer " + accessToken);

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
        .set("Authorization", "Bearer " + accessToken)
        .query({ id: senderId.toString() });
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBeTruthy();
      expect(res.body[0]).toHaveProperty("senderId", senderId.toString());
    });

    it("should return 404 if senderId is not provided", async () => {
      const res = await request(app)
        .get("/posts/sender")
        .set("Authorization", "Bearer " + accessToken);

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("error", "senderId not provided");
    });

    it("should return an empty array if no posts match senderId", async () => {
      const res = await request(app)
        .get("/posts/sender")
        .set("Authorization", "Bearer " + accessToken)
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
        .set("Authorization", "Bearer " + accessToken);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("_id", postId.toString());
    });

    it("should return 404 for non-existent post ID", async () => {
      const newId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/posts/${newId}`)
        .set("Authorization", "Bearer " + accessToken);

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("error", "Post not found");
    });

    it("should return 400 for invalid post ID format", async () => {
      const res = await request(app)
        .get("/posts/invalid-id")
        .set("Authorization", "Bearer " + accessToken);

      expect(res.statusCode).toBe(400);
    });
  });

  // Test PUT /posts/:id
  describe("PUT /posts/:id", () => {
    it("should update a post by ID", async () => {
      const res = await request(app)
        .put(`/posts/${postId}`)
        .set("Authorization", "Bearer " + accessToken)
        .send({
          message: "Updated message!",
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("_id", postId.toString());
      expect(res.body).toHaveProperty("message", "Updated message!");
    });

    it("should return 400 for missing body parameters", async () => {
      const res = await request(app)
        .put(`/posts/${postId}`)
        .set("Authorization", "Bearer " + accessToken)
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body).toBe("required body not provided");
    });

    it("should return 400 for invalid message type", async () => {
      const res = await request(app)
        .put(`/posts/${postId}`)
        .set("Authorization", "Bearer " + accessToken)
        .send({
          message: 12345, // Invalid type
        });
        
      expect(res.statusCode).toBe(400);
      expect(res.body).toBe("wrong type body parameters");
    });

    it("should return 404 for non-existent post ID", async () => {
      const invalidId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .put(`/posts/${invalidId}`)
        .set("Authorization", "Bearer " + accessToken)
        .send({
          message: "Non-existent post update",
        });

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("error", "Post not found");
    });

    it("should return 400 for invalid post ID format", async () => {
      const res = await request(app)
        .put("/posts/invalid-id")
        .set("Authorization", "Bearer " + accessToken)
        .send({
          message: "Invalid ID format test",
        });
        console.log("invaid ID", accessToken, res.body, res.statusCode);

      expect(res.statusCode).toBe(400);
    });
  });
});
