const request = require('supertest');
const app = require('../src/app');

describe('AIEduAssist API Tests', () => {
  let accessToken, refreshToken, userId, courseId;

  // Auth Tests
  describe('Auth Endpoints', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: `test${Date.now()}@example.com`,
          password: 'TestPassword123',
          confirmPassword: 'TestPassword123',
          role: 'student'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.tokens).toHaveProperty('accessToken');
      expect(res.body.data.tokens).toHaveProperty('refreshToken');

      accessToken = res.body.data.tokens.accessToken;
      refreshToken = res.body.data.tokens.refreshToken;
      userId = res.body.data.user.id;
    });

    it('should reject invalid email format', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'invalid-email',
          password: 'TestPassword123',
          confirmPassword: 'TestPassword123'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject weak password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: `test${Date.now()}@example.com`,
          password: 'weak',
          confirmPassword: 'weak'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should login with correct credentials', async () => {
      const email = `test${Date.now()}@example.com`;

      // First register
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email,
          password: 'TestPassword123',
          confirmPassword: 'TestPassword123'
        });

      // Then login
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email,
          password: 'TestPassword123'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.tokens).toHaveProperty('accessToken');
    });

    it('should refresh access token', async () => {
      const res = await request(app)
        .post('/api/auth/refresh')
        .send({
          refreshToken
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.tokens).toHaveProperty('accessToken');
    });
  });

  // User Tests
  describe('User Endpoints', () => {
    it('should get user profile', async () => {
      const res = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toHaveProperty('id');
      expect(res.body.data.user).toHaveProperty('email');
    });

    it('should update user profile', async () => {
      const res = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Updated Name',
          bio: 'New bio',
          location: 'New York'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.name).toBe('Updated Name');
    });

    it('should reject unauthenticated request', async () => {
      const res = await request(app)
        .get('/api/users/profile');

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  // Course Tests
  describe('Course Endpoints', () => {
    it('should list courses without auth', async () => {
      const res = await request(app)
        .get('/api/courses?page=1&limit=10');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('courses');
      expect(res.body.data).toHaveProperty('pagination');
    });

    it('should create a course as instructor', async () => {
      // Create instructor account
      const instructorRes = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Instructor User',
          email: `instructor${Date.now()}@example.com`,
          password: 'InstructorPass123',
          confirmPassword: 'InstructorPass123',
          role: 'instructor'
        });

      const instructorToken = instructorRes.body.data.tokens.accessToken;

      const res = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${instructorToken}`)
        .send({
          title: 'Test Course',
          description: 'Test Description',
          category: 'Programming',
          difficulty: 'beginner',
          duration: 20
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.course).toHaveProperty('id');

      courseId = res.body.data.course.id;
    });

    it('should get course details', async () => {
      if (!courseId) return; // Skip if no course created

      const res = await request(app)
        .get(`/api/courses/${courseId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.course.id).toBe(courseId);
    });
  });

  // Health Check
  describe('Health Check', () => {
    it('should return health status', async () => {
      const res = await request(app)
        .get('/api/health');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Backend server is running');
    });
  });
});

module.exports = { accessToken, userId };
