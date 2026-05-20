const request = require('supertest');
const mongoose = require('mongoose');

let app;

beforeAll(async () => {
  // connect is handled in setup.js which Jest runs before tests
  app = require('../src/app');
});

afterAll(async () => {
  await mongoose.disconnect();
});

beforeEach(async () => {
  if (global.__clearDB) await global.__clearDB();
});

test('register -> login -> me flow', async () => {
  const user = { username: 'testuser', email: 'testuser@example.com', password: 'Password123' };

  const reg = await request(app).post('/api/auth/register').send(user);
  expect(reg.statusCode).toBe(201);
  expect(reg.body.user).toHaveProperty('id');

  const login = await request(app).post('/api/auth/login').send({ username: 'testuser', password: 'Password123' });
  expect(login.statusCode).toBe(200);
  expect(login.body.user).toHaveProperty('id');

  // extract cookie
  const cookie = login.headers['set-cookie'] || login.header['set-cookie'];
  const me = await request(app).get('/api/auth/me').set('Cookie', cookie || []);
  expect(me.statusCode).toBe(200);
  expect(me.body.user).toHaveProperty('username', 'testuser');
});
