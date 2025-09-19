// tests/users.test.js
import request from 'supertest';
import app from '../index.js';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

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

describe('Users Management Endpoints', () => {
  let adminToken, regularUserToken, testUser, testAdmin;

  // Helper function to create test users
  const createTestUsers = async () => {
    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    testAdmin = await prisma.user.create({
      data: {
        id: 'admin-id-123',
        fullName: 'Admin User',
        email: 'admin@test.com',
        password: adminPassword,
        role: 'admin',
      },
    });

    // Create regular user
    const userPassword = await bcrypt.hash('user123', 10);
    testUser = await prisma.user.create({
      data: {
        id: 'user-id-123',
        fullName: 'Regular User',
        email: 'user@test.com',
        password: userPassword,
        role: 'user',
      },
    });

    // Create another regular user to test actions on
    const targetUserPassword = await bcrypt.hash('target123', 10);
    targetUser = await prisma.user.create({
      data: {
        id: 'target-id-123',
        fullName: 'Target User',
        email: 'target@test.com',
        password: targetUserPassword,
        role: 'user',
      },
    });
  };

  // Helper function to login and get tokens
  const loginAndGetTokens = async () => {
    // Login as admin
    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.com', password: 'admin123' });
    adminToken = adminLogin.body.token;

    // Login as regular user
    const userLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@test.com', password: 'user123' });
    regularUserToken = userLogin.body.token;
  };

  beforeEach(async () => {
    await createTestUsers();
    await loginAndGetTokens();
  });

  describe('GET /api/users (Get All Users)', () => {
    it('should return all users for admin', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body).toHaveLength(3);
      expect(res.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: testAdmin.id,
            fullName: 'Admin User',
            email: 'admin@test.com',
            role: 'admin',
          }),
          expect.objectContaining({
            id: testUser.id,
            fullName: 'Regular User',
            email: 'user@test.com',
            role: 'user',
          }),
          expect.objectContaining({
            id: targetUser.id,
            fullName: 'Target User',
            email: 'target@test.com',
            role: 'user',
          }),
        ])
      );
    });

    it('should return 403 for regular user', async () => {
      await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .expect(403);
    });

    it('should return 401 for missing token', async () => {
      await request(app)
        .get('/api/users')
        .expect(401);
    });

    it('should return 403 for invalid token', async () => {
      await request(app)
        .get('/api/users')
        .set('Authorization', 'Bearer invalid-token')
        .expect(403);
    });
  });

  describe('PUT /api/users/:id/promote (Promote User)', () => {
    it('should promote user to admin for admin', async () => {
      const res = await request(app)
        .put(`/api/users/${targetUser.id}/promote`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body).toMatchObject({
        id: targetUser.id,
        fullName: 'Target User',
        email: 'target@test.com',
        role: 'admin',
      });

      // Verify in database
      const updatedUser = await prisma.user.findUnique({
        where: { id: targetUser.id },
      });
      expect(updatedUser.role).toBe('admin');
    });

    it('should return 404 for non-existent user', async () => {
      await request(app)
        .put('/api/users/non-existent-id/promote')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    it('should return 400 when trying to promote already admin user', async () => {
      await request(app)
        .put(`/api/users/${testAdmin.id}/promote`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);
    });

    it('should return 400 when admin tries to promote themselves', async () => {
      await request(app)
        .put(`/api/users/${testAdmin.id}/promote`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);
    });

    it('should return 403 for regular user', async () => {
      await request(app)
        .put(`/api/users/${targetUser.id}/promote`)
        .set('Authorization', `Bearer ${regularUserToken}`)
        .expect(403);
    });

    it('should return 401 for missing token', async () => {
      await request(app)
        .put(`/api/users/${targetUser.id}/promote`)
        .expect(401);
    });

    it('should return 403 for invalid token', async () => {
      await request(app)
        .put(`/api/users/${targetUser.id}/promote`)
        .set('Authorization', 'Bearer invalid-token')
        .expect(403);
    });
  });

  describe('DELETE /api/users/:id (Delete User)', () => {
    it('should delete user for admin', async () => {
      await request(app)
        .delete(`/api/users/${targetUser.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // Verify user is deleted
      const deletedUser = await prisma.user.findUnique({
        where: { id: targetUser.id },
      });
      expect(deletedUser).toBeNull();

      // Verify other users still exist
      const users = await prisma.user.findMany();
      expect(users).toHaveLength(2);
    });

    it('should return 404 for non-existent user', async () => {
      await request(app)
        .delete('/api/users/non-existent-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    it('should return 400 when admin tries to delete themselves', async () => {
      await request(app)
        .delete(`/api/users/${testAdmin.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);
    });

    it('should return 403 for regular user', async () => {
      await request(app)
        .delete(`/api/users/${targetUser.id}`)
        .set('Authorization', `Bearer ${regularUserToken}`)
        .expect(403);
    });

    it('should return 401 for missing token', async () => {
      await request(app)
        .delete(`/api/users/${targetUser.id}`)
        .expect(401);
    });

    it('should return 403 for invalid token', async () => {
      await request(app)
        .delete(`/api/users/${targetUser.id}`)
        .set('Authorization', 'Bearer invalid-token')
        .expect(403);
    });
  });
});