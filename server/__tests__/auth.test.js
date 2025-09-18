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
        role: 'user',
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

  describe('POST /api/auth/login', () => {
    it('should login a user and return 200 with token', async () => {
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
        role: 'user',
      });
    });

    it('should return 401 for invalid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
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
});