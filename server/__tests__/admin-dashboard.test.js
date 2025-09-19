// tests/admin-dashboard.test.js
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

describe('Admin Dashboard Endpoints', () => {
  let adminToken, userToken, testAdmin, testUser, testSweet, testTransaction;

  const createTestData = async () => {
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

    // Create sweet
    testSweet = await prisma.sweet.create({
      data: {
        id: 'sweet-id-123',
        name: 'Chocolate Cake',
        category: 'Dessert',
        price: 12.99,
        posterURL: 'https://example.com/chocolate-cake.jpg',
        quantity: 10,
      },
    });

    // Create transaction
    testTransaction = await prisma.transaction.create({
      data: {
        id: 'trans-id-123',
        userId: testUser.id,
        sweetId: testSweet.id,
        quantity: 2,
      },
    });
  };

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
    userToken = userLogin.body.token;
  };

  beforeEach(async () => {
    await createTestData();
    await loginAndGetTokens();
  });

  describe('GET /api/transactions/all (Admin Transactions)', () => {
    it('should return all transactions for admin', async () => {
      const res = await request(app)
        .get('/api/transactions/all')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body).toHaveLength(1);
      expect(res.body[0]).toMatchObject({
        id: testTransaction.id,
        userId: testUser.id,
        sweetId: testSweet.id,
        quantity: 2,
        user: {
          id: testUser.id,
          fullName: 'Regular User',
          email: 'user@test.com',
        },
        sweet: {
          id: testSweet.id,
          name: 'Chocolate Cake',
          category: 'Dessert',
          price: 12.99,
        },
      });
    });

    it('should return 403 for regular user', async () => {
      await request(app)
        .get('/api/transactions/all')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('should return 401 for missing token', async () => {
      await request(app)
        .get('/api/transactions/all')
        .expect(401);
    });

    it('should return 403 for invalid token', async () => {
      await request(app)
        .get('/api/transactions/all')
        .set('Authorization', 'Bearer invalid-token')
        .expect(403);
    });
  });

  describe('Admin Dashboard Data Aggregation', () => {
    it('should calculate total revenue correctly', async () => {
      // Create additional transaction
      await prisma.transaction.create({
        data: {
          id: 'trans-id-456',
          userId: testUser.id,
          sweetId: testSweet.id,
          quantity: 3,
        },
      });

      const res = await request(app)
        .get('/api/transactions/all')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // Calculate expected revenue: (2 * 12.99) + (3 * 12.99) = 64.95
      const expectedRevenue = 2 * 12.99 + 3 * 12.99;
      const totalRevenue = res.body.reduce(
        (sum, t) => sum + (t.sweet.price * t.quantity),
        0
      );
      
      expect(totalRevenue).toBeCloseTo(expectedRevenue, 2);
    });

    it('should count unique customers correctly', async () => {
      // Create another user and transaction
      const otherUserPassword = await bcrypt.hash('other123', 10);
      const otherUser = await prisma.user.create({
        data: {
          id: 'other-user-id',
          fullName: 'Other User',
          email: 'other@test.com',
          password: otherUserPassword,
          role: 'user',
        },
      });

      await prisma.transaction.create({
        data: {
          id: 'trans-id-789',
          userId: otherUser.id,
          sweetId: testSweet.id,
          quantity: 1,
        },
      });

      const res = await request(app)
        .get('/api/transactions/all')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // Should have 2 unique customers now
      const uniqueCustomers = [...new Set(res.body.map(t => t.userId))].length;
      expect(uniqueCustomers).toBe(2);
    });
  });
});