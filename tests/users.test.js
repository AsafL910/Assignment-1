// process.env.DATABASE_URL = "mongodb://127.0.0.1:27017/testdb";

// const mongoose = require("mongoose");
// const request = require("supertest");
// const app = require("../src/app.js"); // Adjust this path to match your app
// const { User } = require("../src/db/schemas"); // Replace with the correct schema path

// beforeAll(async () => {
//   await mongoose.connect(process.env.DATABASE_URL, {
//     useUnifiedTopology: true,
//   });
// });

// afterAll(async () => {
//   await mongoose.connection.db.dropDatabase();
//   await mongoose.connection.close();
// });

// describe("Testing User Routes", () => {
//   let userId;

//   beforeEach(async () => {
//     // Create a sample user for testing
//     const sampleUser = new User({
//       username: "TestUser",
//       email: "testuser@example.com",
//       password: "securepassword",
//     });
//     const savedUser = await sampleUser.save();
//     userId = savedUser._id; // Save ID for later tests
//   });

//   afterEach(async () => {
//     await User.deleteMany(); // Clean up the collection after each test
//   });

//   // Test POST /users
//   describe("POST /users", () => {
//     it("should create a new user", async () => {
//       const res = await request(app).post("/users").send({
//         username: "NewUser",
//         email: "newuser@example.com",
//         password: "newpassword",
//       });

//       expect(res.statusCode).toBe(201);
//       expect(res.body).toHaveProperty("username", "NewUser");
//       expect(res.body).toHaveProperty("email", "newuser@example.com");
//     });

//     it("should return 400 for missing required fields", async () => {
//       const res = await request(app).post("/users").send({
//         username: "IncompleteUser",
//       });

//       expect(res.statusCode).toBe(400);
//       expect(res.body).toHaveProperty("error", "Missing required fields");
//     });

//     it("should return 400 if username or email already exists", async () => {
//       const res = await request(app).post("/users").send({
//         username: "TestUser",
//         email: "testuser@example.com",
//         password: "anotherpassword",
//       });

//       expect(res.statusCode).toBe(400);
//       expect(res.body).toHaveProperty("error");
//     });
//   });

//   // Test GET /users
//   describe("GET /users", () => {
//     it("should retrieve all users", async () => {
//       const res = await request(app).get("/users");

//       expect(res.statusCode).toBe(200);
//       expect(Array.isArray(res.body)).toBeTruthy();
//       expect(res.body.length).toBeGreaterThan(0);
//     });

//     it("should return an empty array if no users exist", async () => {
//       await User.deleteMany();
//       const res = await request(app).get("/users");

//       expect(res.statusCode).toBe(200);
//       expect(Array.isArray(res.body)).toBeTruthy();
//       expect(res.body.length).toBe(0);
//     });
//   });

//   // Test GET /users/:id
//   describe("GET /users/:id", () => {
//     it("should retrieve a user by ID", async () => {
//       const res = await request(app).get(`/users/${userId}`);

//       expect(res.statusCode).toBe(200);
//       expect(res.body).toHaveProperty("id", userId.toString());
//       expect(res.body).toHaveProperty("username", "TestUser");
//     });

//     it("should return 404 for non-existent user ID", async () => {
//       const invalidId = new mongoose.Types.ObjectId();
//       const res = await request(app).get(`/users/${invalidId}`);

//       expect(res.statusCode).toBe(404);
//       expect(res.body).toHaveProperty("error", "User not found");
//     });

//     it("should return 500 for invalid user ID format", async () => {
//       const res = await request(app).get(`/users/invalid-id`);

//       expect(res.statusCode).toBe(500);
//     });
//   });

//   // Test PUT /users/:id
//   describe("PUT /users/:id", () => {
//     it("should update a user by ID", async () => {
//       const res = await request(app).put(`/users/${userId}`).send({
//         username: "UpdatedUser",
//         email: "updateduser@example.com",
//       });

//       expect(res.statusCode).toBe(200);
//       expect(res.body).toHaveProperty("username", "UpdatedUser");
//       expect(res.body).toHaveProperty("email", "updateduser@example.com");
//     });

//     it("should return 404 for non-existent user ID", async () => {
//       const invalidId = new mongoose.Types.ObjectId();
//       const res = await request(app).put(`/users/${invalidId}`).send({
//         username: "NonExistentUser",
//         email: "nonexistent@example.com",
//       });

//       expect(res.statusCode).toBe(400);
//       expect(res.body).toHaveProperty("error", "user Not Found");
//     });
//   });

//   // Test DELETE /users/:id
//   describe("DELETE /users/:id", () => {
//     it("should delete a user by ID", async () => {
//       const res = await request(app).delete(`/users/${userId}`);

//       expect(res.statusCode).toBe(200);
//       expect(res.body).toHaveProperty("message", "User deleted successfully");
//     });

//     it("should return 404 for non-existent user ID", async () => {
//       const invalidId = new mongoose.Types.ObjectId();
//       const res = await request(app).delete(`/users/${invalidId}`);

//       expect(res.statusCode).toBe(404);
//       expect(res.body).toHaveProperty("error", "User not found");
//     });

//     it("should return 400 for invalid user ID format", async () => {
//       const res = await request(app).delete("/users/invalid-id");

//       expect(res.statusCode).toBe(400);
//     });
//   });
// });
