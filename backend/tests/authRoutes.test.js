const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const { setupDB } = require('./setup');

process.env.JWT_SECRET = 'test-secret-key';
setupDB();

describe('Auth Routes', () => {

  // ── Registration ──────────────────────────────────────────────

  describe('POST /api/auth/register', () => {
    it('should register a new user and return a token', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          password: 'password123',
          email: 'test@example.com',
          fullName: 'Test User'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('username', 'testuser');
      expect(res.body.user).toHaveProperty('email', 'test@example.com');
      expect(res.body.user).toHaveProperty('fullName', 'Test User');
    });

    it('should return 400 if username is missing', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ password: 'password123' });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Username and password are required');
    });

    it('should return 400 if password is missing', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'testuser' });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Username and password are required');
    });

    it('should return 400 if password is too short', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'testuser', password: '123' });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Password must be at least 6 characters');
    });

    it('should return 400 if username already exists', async () => {
      // Register first user
      await request(app)
        .post('/api/auth/register')
        .send({ username: 'testuser', password: 'password123' });

      // Try to register with same username
      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'testuser', password: 'password456' });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Username already exists');
    });

    it('should return 400 if email already exists', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({ username: 'user1', password: 'password123', email: 'same@test.com' });

      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'user2', password: 'password123', email: 'same@test.com' });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Email already registered');
    });
  });

  // ── Login ─────────────────────────────────────────────────────

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a user to log in with
      await request(app)
        .post('/api/auth/register')
        .send({
          username: 'loginuser',
          password: 'password123',
          email: 'login@example.com'
        });
    });

    it('should login with valid username and return a token', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'loginuser', password: 'password123' });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('username', 'loginuser');
    });

    it('should login with valid email and return a token', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'login@example.com', password: 'password123' });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
    });

    it('should return 400 if username/password is missing', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'loginuser' });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Username and password are required');
    });

    it('should return 400 for wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'loginuser', password: 'wrongpassword' });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Invalid credentials');
    });

    it('should return 400 for non-existent user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'nouser', password: 'password123' });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Invalid credentials');
    });
  });
});
