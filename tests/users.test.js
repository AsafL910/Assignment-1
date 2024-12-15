require("dotenv").config();
process.env.DATABASE_URL = "mongodb://127.0.0.1:27017/testusersdb";

const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../src/app.js"); // Adjust this path to match your app
const { User } = require("../src/db/schemas"); // Replace with the correct schema path

let userId;
let accessToken;

beforeAll(async () => {
  await mongoose.connect(process.env.DATABASE_URL, {
    useUnifiedTopology: true,
  });
});

const loginUser = async (user) =>
  await request(app).post("/auth/login").send(user);

beforeEach(async () => {
  const sampleUser = {
    username: "TestUser",
    email: "testuser@example.com",
    password: "securepassword",
  };

  await request(app).post("/auth/register").send(sampleUser);

  const user = (
    await loginUser({
      email: sampleUser.email,
      password: sampleUser.password,
    })
  ).body;

  userId = user.id;
  accessToken = user.accessToken;
});

afterEach(async () => {
  await User.deleteMany(); // Clean up the collection after each test
});

afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.connection.close();
});

describe("Testing User Routes", () => {
  // Test GET /users
  describe("GET /users", () => {
    it("should retrieve all users", async () => {
      const res = await request(app)
        .get("/users")
        .set("Authorization", "Bearer " + accessToken);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBeTruthy();
      expect(res.body.length).toBeGreaterThan(0);
    });

    it("should return an empty array if no users exist", async () => {
      await User.deleteMany();
      const res = await request(app)
        .get("/users")
        .set("Authorization", "Bearer " + accessToken);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBeTruthy();
      expect(res.body.length).toBe(0);
    });
  });

  // Test GET /users/:id
  describe("GET /users/:id", () => {
    it("should retrieve a user by ID", async () => {
      const res = await request(app)
        .get(`/users/${userId}`)
        .set("Authorization", "Bearer " + accessToken);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("_id", userId.toString());
      expect(res.body).toHaveProperty("username", "TestUser");
    });

    it("should return 404 for non-existent user ID", async () => {
      const invalidId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/users/${invalidId}`)
        .set("Authorization", "Bearer " + accessToken);

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("error", "User not found");
    });

    it("should return 500 for invalid user ID format", async () => {
      const res = await request(app)
        .get(`/users/invalid-id`)
        .set("Authorization", "Bearer " + accessToken);

      expect(res.statusCode).toBe(400);
    });
  });

  // Test PUT /users/:id
  describe("PUT /users/:id", () => {
    it("should update a user by ID", async () => {
      const res = await request(app)
        .put(`/users/${userId}`)
        .set("Authorization", "Bearer " + accessToken)
        .send({
          username: "UpdatedUser",
          email: "updateduser@example.com",
        });
        
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("username", "UpdatedUser");
      expect(res.body).toHaveProperty("email", "updateduser@example.com");
    });

    it("should return 404 for non-existent user ID", async () => {
      const invalidId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .put(`/users/${invalidId}`)
        .set("Authorization", "Bearer " + accessToken)
        .send({
          username: "NonExistentUser",
          email: "nonexistent@example.com",
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("error", "user Not Found");
    });
  });

  // Test DELETE /users/:id
  describe("DELETE /users/:id", () => {
    it("should delete a user by ID", async () => {
        
      const res = await request(app)
        .delete(`/users/${userId}`)
        .set("Authorization", "Bearer " + accessToken);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("message", "User deleted successfully");
    });

    it("should return 404 for non-existent user ID", async () => {
      const invalidId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .delete(`/users/${invalidId}`)
        .set("Authorization", "Bearer " + accessToken);

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("error", "User not found");
    });

    it("should return 400 for invalid user ID format", async () => {
      const res = await request(app)
        .delete("/users/invalid-id")
        .set("Authorization", "Bearer " + accessToken);

      expect(res.statusCode).toBe(400);
    });
  });
});
