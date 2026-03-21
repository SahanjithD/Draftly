const request = require('supertest');
const app = require('../app');
const { setupDB } = require('./setup');

process.env.JWT_SECRET = 'test-secret-key';
setupDB();

// Helper: register a user and return their token
async function getAuthToken(username = 'testauthor', password = 'password123') {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ username, password });
  return res.body.token;
}

describe('Post Routes', () => {

  // ── Create Post ───────────────────────────────────────────────

  describe('POST /api/posts', () => {
    it('should create a post when authenticated', async () => {
      const token = await getAuthToken();

      const res = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Test Post', content: 'This is test content' });

      expect(res.statusCode).toBe(201);
      expect(res.body.post).toHaveProperty('title', 'Test Post');
      expect(res.body.post).toHaveProperty('content', 'This is test content');
      expect(res.body.message).toBe('Post created successfully');
    });

    it('should return 401 without authentication', async () => {
      const res = await request(app)
        .post('/api/posts')
        .send({ title: 'Test Post', content: 'Content' });

      expect(res.statusCode).toBe(401);
    });

    it('should return 400 if title is missing', async () => {
      const token = await getAuthToken();

      const res = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${token}`)
        .send({ content: 'Content without title' });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Title and content are required');
    });

    it('should return 400 if content is missing', async () => {
      const token = await getAuthToken();

      const res = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Title without content' });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Title and content are required');
    });
  });

  // ── Get Posts ─────────────────────────────────────────────────

  describe('GET /api/posts', () => {
    it('should return an empty list when no posts exist', async () => {
      const res = await request(app).get('/api/posts');

      expect(res.statusCode).toBe(200);
      expect(res.body.posts).toHaveLength(0);
      expect(res.body.pagination).toBeDefined();
    });

    it('should return posts with pagination', async () => {
      const token = await getAuthToken();

      // Create 3 posts
      for (let i = 1; i <= 3; i++) {
        await request(app)
          .post('/api/posts')
          .set('Authorization', `Bearer ${token}`)
          .send({ title: `Post ${i}`, content: `Content ${i}` });
      }

      const res = await request(app).get('/api/posts?page=1&limit=2');

      expect(res.statusCode).toBe(200);
      expect(res.body.posts).toHaveLength(2);
      expect(res.body.pagination.total).toBe(3);
      expect(res.body.pagination.pages).toBe(2);
    });

    it('should search posts by title', async () => {
      const token = await getAuthToken();

      await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'JavaScript Tips', content: 'Some tips' });

      await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Python Guide', content: 'A guide' });

      const res = await request(app).get('/api/posts?search=JavaScript');

      expect(res.statusCode).toBe(200);
      expect(res.body.posts).toHaveLength(1);
      expect(res.body.posts[0].title).toBe('JavaScript Tips');
    });
  });

  // ── Get Single Post ───────────────────────────────────────────

  describe('GET /api/posts/:id', () => {
    it('should return a single post by ID', async () => {
      const token = await getAuthToken();

      const createRes = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Single Post', content: 'Read me' });

      const postId = createRes.body.post._id;

      const res = await request(app).get(`/api/posts/${postId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.post).toHaveProperty('title', 'Single Post');
    });

    it('should return 400 for invalid post ID', async () => {
      const res = await request(app).get('/api/posts/invalid-id');

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Invalid post ID');
    });
  });

  // ── Update Post ───────────────────────────────────────────────

  describe('PUT /api/posts/:id', () => {
    it('should update a post by the author', async () => {
      const token = await getAuthToken();

      const createRes = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Original Title', content: 'Original content' });

      const postId = createRes.body.post._id;

      const res = await request(app)
        .put(`/api/posts/${postId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Updated Title', content: 'Updated content' });

      expect(res.statusCode).toBe(200);
      expect(res.body.post).toHaveProperty('title', 'Updated Title');
      expect(res.body.message).toBe('Post updated successfully');
    });

    it('should return 403 if user is not the author', async () => {
      const authorToken = await getAuthToken('author1');
      const otherToken = await getAuthToken('otheruser');

      const createRes = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${authorToken}`)
        .send({ title: 'Author Post', content: 'Content' });

      const postId = createRes.body.post._id;

      const res = await request(app)
        .put(`/api/posts/${postId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ title: 'Hacked Title' });

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toBe('Not authorized to update this post');
    });
  });

  // ── Delete Post ───────────────────────────────────────────────

  describe('DELETE /api/posts/:id', () => {
    it('should delete a post by the author', async () => {
      const token = await getAuthToken();

      const createRes = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Delete Me', content: 'Goodbye' });

      const postId = createRes.body.post._id;

      const res = await request(app)
        .delete(`/api/posts/${postId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Post deleted successfully');

      // Verify post is gone
      const getRes = await request(app).get(`/api/posts/${postId}`);
      expect(getRes.statusCode).toBe(404);
    });

    it('should return 403 if user is not the author', async () => {
      const authorToken = await getAuthToken('delauthor');
      const otherToken = await getAuthToken('delother');

      const createRes = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${authorToken}`)
        .send({ title: 'Protected Post', content: 'No delete' });

      const postId = createRes.body.post._id;

      const res = await request(app)
        .delete(`/api/posts/${postId}`)
        .set('Authorization', `Bearer ${otherToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toBe('Not authorized to delete this post');
    });

    it('should return 404 for non-existent post', async () => {
      const token = await getAuthToken();
      const fakeId = '507f1f77bcf86cd799439011';

      const res = await request(app)
        .delete(`/api/posts/${fakeId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('Post not found');
    });
  });
});
