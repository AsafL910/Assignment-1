const request = require('supertest');
const mongoose = require('mongoose');
const app = require('./index.js');

process.env.DATABASE_URL = 'mongodb://localhost:27017/testdatabase';
process.env.PORT = 3000;

beforeAll(async () => {
  await mongoose.connect(process.env.DATABASE_URL);
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('GET /', () => {
  it('should return Hello World!', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe('Hello World!');
  });
});