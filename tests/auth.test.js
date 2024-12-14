require("dotenv").config();
process.env.DATABASE_URL = "mongodb://127.0.0.1:27017/testauthdb";
process.env.JWT_TOKEN_EXPIRATION=3000;

const mongoose = require("mongoose");
const { User } = require("../src/db/schemas.js"); // Import Post schema for test setup
const app = require("../src/app.js"); // Adjust to your app's file path
const request = require("supertest");

let accessToken;
let refreshToken;
const mockUser = {
  username: "123meir",
  email: "meir@mail.com",
  password: "superSecretPassword",
};
beforeAll(async () => {
    await mongoose.connect(process.env.DATABASE_URL, {
        useUnifiedTopology: true,
      });
})

afterAll(async () => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
});
describe("Restrict access without Auth / ", () => {
    it("should respond with error", async () => {
      const response = await request(app).get("/posts");
      expect(response.statusCode).toEqual(403);
    });
  });
describe("Register and Login", () => {
  it("should add new user", async () => {
    const response = await request(app).post("/auth/register").send(mockUser);
    userId = response.body.id;
    expect(response.statusCode).toEqual(201);
  });
  it("should not create user with missing fields", async () => {
    const response = await request(app).post("/auth/register").send({});
    // userId = response.body.id;
    expect(response.statusCode).toEqual(400);
    expect(response.body.error).toEqual("Missing required fields");
  });
  it("should login user", async () => {
    const response = await request(app).post("/auth/login").send(mockUser);
    
    accessToken = response.body.accessToken;
    refreshToken = response.body.refreshToken;
    expect(response.statusCode).toEqual(200);
    
    expect(response.body.accessToken).not.toEqual(null);
    expect(response.body.refreshToken).not.toEqual(null);
  });
  it("should not login user without email or password", async () => {
    const response = await request(app).post("/auth/login").send({});

    expect(response.statusCode).toEqual(400);
    expect(response.body).toEqual("bad email or password");    
  });
  it("should not login user with non existent email", async () => {
    const response = await request(app).post("/auth/login").send({ email: 'doesnotexist@gmail.com', password: 'password'});

    expect(response.statusCode).toEqual(400);
    expect(response.body).toEqual("bad email or password");    
  });
  it("should not login user with no matching password", async () => {
    const response = await request(app).post("/auth/login").send({ email: mockUser.email, password: mockUser.password + 'wrong-password'});

    expect(response.statusCode).toEqual(400);
    expect(response.body).toEqual("bad email or password");    
  });
});

describe("Token access", () => {
    it("should allow authorized access", async () => {
      const response = await request(app).get("/posts")
      .set("Authorization", "Bearer " + accessToken)
  expect(response.statusCode).toEqual(200);
});

it("should not allow unauthorized access", async () => {
    const wrongToken = accessToken + 'wrong';
    
    const response = await request(app).get("/posts")
    .set("Authorization", "Bearer " + wrongToken);
    
      expect(response.statusCode).toEqual(403);
    });
})

describe("Timeout and Refresh",()=>{
  it("should timeout access", async () => {
    await new Promise(r => setTimeout(r, 3.1 * 1000));
    const response = await request(app).get("/posts")
    .set("Authorization", "Bearer " + accessToken)
    
    expect(response.statusCode).toEqual(403);
  },3200);

  it("should send Refresh Token", async () => {
    const response = await request(app).post("/auth/refreshToken")
    .set("Authorization", "Bearer " + refreshToken)

    const newRefreshToken = response.body.refreshToken;
    accessToken = response.body.accessToken
    expect(response.statusCode).toEqual(200);

    expect(newRefreshToken).not.toEqual(refreshToken);
    refreshToken = newRefreshToken
  });
})
describe("Logout", () => {
  it("should not allow logout without token", async () => {      
      const response = await request(app).post("/auth/logout")
        expect(response.statusCode).toEqual(403);
      });
      it("should not allow logout with incorrect token", async () => {
        const wrongToken = accessToken;
        
        const response = await request(app).post("/auth/logout")
        .set("authorization", "Bearer " + wrongToken)
        
          expect(response.statusCode).toEqual(403);
        });
    it("should allow authorized logout", async () => {
      const response = await request(app).post("/auth/logout")
      .set("authorization", "Bearer " + refreshToken)

  expect(response.statusCode).toEqual(200);
});

})