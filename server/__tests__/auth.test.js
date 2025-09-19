import request from 'supertest';
import app from '../index.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

beforeEach(async () => {
  await prisma.$transaction([
    prisma.user.deleteMany(),
    prisma.sweet.deleteMany(),
    prisma.transaction.deleteMany(),
  ]);
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('Auth Endpoints', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user and return 201', async () => {
      const newUser = {
        fullName: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      const res = await request(app)
        .post('/api/auth/register')
        .send(newUser)
        .expect(201);

      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toMatchObject({
        id: expect.any(String),
        fullName: 'Test User',
        email: 'test@example.com',
        role: 'user', // Default role for regular registration
      });
    });

    it('should return 400 if email exists', async () => {
      const newUser = {
        fullName: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };
      await request(app).post('/api/auth/register').send(newUser);

      const duplicateUser = {
        fullName: 'Duplicate User',
        email: 'test@example.com',
        password: 'password456',
      };
      await request(app)
        .post('/api/auth/register')
        .send(duplicateUser)
        .expect(400);
    });

    it('should return 400 if required fields are missing', async () => {
      const incompleteUser = { fullName: 'Test User' }; // Missing email or password
      await request(app)
        .post('/api/auth/register')
        .send(incompleteUser)
        .expect(400);
    });
  });

  describe('POST /api/auth/register-admin', () => {
    it('should register an admin user and return 201', async () => {
      const newAdmin = {
        fullName: 'Admin User',
        email: 'admin@example.com',
        password: 'admin123',
      };

      const res = await request(app)
        .post('/api/auth/register-admin')
        .send(newAdmin)
        .expect(201);

      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toMatchObject({
        id: expect.any(String),
        fullName: 'Admin User',
        email: 'admin@example.com',
        role: 'admin', // Explicit admin role
      });
    });

    it('should return 400 if email already exists', async () => {
      const newAdmin = {
        fullName: 'Admin User',
        email: 'admin@example.com',
        password: 'admin123',
      };
      await request(app).post('/api/auth/register-admin').send(newAdmin);

      const duplicateAdmin = {
        fullName: 'Duplicate Admin',
        email: 'admin@example.com',
        password: 'admin456',
      };
      await request(app)
        .post('/api/auth/register-admin')
        .send(duplicateAdmin)
        .expect(400);
    });

    it('should return 400 if required fields are missing', async () => {
      const incompleteAdmin = { fullName: 'Admin User' }; // Missing email or password
      await request(app)
        .post('/api/auth/register-admin')
        .send(incompleteAdmin)
        .expect(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login a regular user and return 200 with token', async () => {
      const newUser = {
        fullName: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };
      await request(app).post('/api/auth/register').send(newUser);

      const loginData = {
        email: 'test@example.com',
        password: 'password123',
      };

      const res = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toMatchObject({
        id: expect.any(String),
        fullName: 'Test User',
        email: 'test@example.com',
        role: 'user', // Regular user role
      });
    });

    it('should login an admin user and return 200 with token', async () => {
      const newAdmin = {
        fullName: 'Admin User',
        email: 'admin@example.com',
        password: 'admin123',
      };
      await request(app).post('/api/auth/register-admin').send(newAdmin);

      const loginData = {
        email: 'admin@example.com',
        password: 'admin123',
      };

      const res = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toMatchObject({
        id: expect.any(String),
        fullName: 'Admin User',
        email: 'admin@example.com',
        role: 'admin', // Admin role
      });
    });

    it('should return 401 for invalid credentials (regular user)', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };
      await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);
    });

    it('should return 401 for invalid credentials (admin user)', async () => {
      const newAdmin = {
        fullName: 'Admin User',
        email: 'admin@example.com',
        password: 'admin123',
      };
      await request(app).post('/api/auth/register-admin').send(newAdmin);

      const loginData = {
        email: 'admin@example.com',
        password: 'wrongpassword',
      };
      await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);
    });

    it('should return 400 if required fields are missing', async () => {
      const incompleteLogin = { email: 'test@example.com' }; // Missing password
      await request(app)
        .post('/api/auth/login')
        .send(incompleteLogin)
        .expect(400);
    });
  });

  describe('Role-based Access in JWT', () => {
    it('should include user role in JWT payload', async () => {
      // Register regular user
      await request(app).post('/api/auth/register').send({
        fullName: 'Regular User',
        email: 'user@example.com',
        password: 'password123',
      });
      const userLogin = await request(app)
        .post('/api/auth/login')
        .send({ email: 'user@example.com', password: 'password123' });

      // Register admin user
      await request(app).post('/api/auth/register-admin').send({
        fullName: 'Admin User',
        email: 'admin@example.com',
        password: 'admin123',
      });
      const adminLogin = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@example.com', password: 'admin123' });

      // Verify role is included in response (JWT payload decoded by middleware)
      expect(userLogin.body.user.role).toBe('user');
      expect(adminLogin.body.user.role).toBe('admin');
    });
  });
  describe('GET /api/auth/me (Protected)', () => {
  it('should return current user for valid token', async () => {
    // Register and login
    await request(app).post('/api/auth/register').send({
      fullName: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password123' })
      .expect(200);

    const token = loginRes.body.token;

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.user).toMatchObject({
      id: expect.any(String),
      fullName: 'Test User',
      email: 'test@example.com',
      role: 'user',
    });
  });

  it('should return 401 for missing token', async () => {
    await request(app).get('/api/auth/me').expect(401);
  });

  it('should return 403 for invalid token', async () => {
    await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalid-token')
      .expect(403);
  });
});
});