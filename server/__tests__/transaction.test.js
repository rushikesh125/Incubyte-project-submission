// tests/transactions.test.js
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

describe('Transactions Endpoints', () => {
  let userToken, testUser, testSweet, testSweet2;

  // Helper function to create test data
  const createTestData = async () => {
    // Create user
    const userPassword = await bcrypt.hash('password123', 10);
    testUser = await prisma.user.create({
      data: {
        id: 'user-id-123',
        fullName: 'Test User',
        email: 'user@test.com',
        password: userPassword,
        role: 'user',
      },
    });

    // Create sweets
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

    testSweet2 = await prisma.sweet.create({
      data: {
        id: 'sweet-id-456',
        name: 'Vanilla Cupcake',
        category: 'Cupcakes',
        price: 3.50,
        posterURL: 'https://example.com/vanilla-cupcake.jpg',
        quantity: 25,
      },
    });
  };

  // Helper function to login and get token
  const loginAndGetToken = async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@test.com', password: 'password123' });
    userToken = loginRes.body.token;
  };

  beforeEach(async () => {
    await createTestData();
    await loginAndGetToken();
  });

  describe('POST /api/transactions (Create Transaction)', () => {
    it('should create a new transaction for valid data', async () => {
      const transactionData = {
        sweetId: testSweet.id,
        quantity: 2,
      };

      const res = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${userToken}`)
        .send(transactionData)
        .expect(201);

      expect(res.body).toMatchObject({
        id: expect.any(String),
        userId: testUser.id,
        sweetId: testSweet.id,
        quantity: 2,
      });

      // Verify transaction in database
      const transaction = await prisma.transaction.findUnique({
        where: { id: res.body.id },
      });
      expect(transaction).toMatchObject({
        userId: testUser.id,
        sweetId: testSweet.id,
        quantity: 2,
      });

      // Verify sweet quantity was updated
      const updatedSweet = await prisma.sweet.findUnique({
        where: { id: testSweet.id },
      });
      expect(updatedSweet.quantity).toBe(8); // 10 - 2 = 8
    });

    it('should create multiple transactions', async () => {
      // First transaction
      await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          sweetId: testSweet.id,
          quantity: 1,
        })
        .expect(201);

      // Second transaction
      await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          sweetId: testSweet2.id,
          quantity: 5,
        })
        .expect(201);

      // Verify both transactions exist
      const transactions = await prisma.transaction.findMany({
        where: { userId: testUser.id },
      });
      expect(transactions).toHaveLength(2);

      // Verify sweet quantities were updated
      const updatedSweet1 = await prisma.sweet.findUnique({
        where: { id: testSweet.id },
      });
      const updatedSweet2 = await prisma.sweet.findUnique({
        where: { id: testSweet2.id },
      });
      expect(updatedSweet1.quantity).toBe(9);  // 10 - 1 = 9
      expect(updatedSweet2.quantity).toBe(20); // 25 - 5 = 20
    });

    it('should return 400 for invalid transaction data', async () => {
      // Missing sweetId
      await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ quantity: 2 })
        .expect(400);

      // Missing quantity
      await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ sweetId: testSweet.id })
        .expect(400);

      // Zero quantity
      await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ sweetId: testSweet.id, quantity: 0 })
        .expect(400);

      // Negative quantity
      await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ sweetId: testSweet.id, quantity: -1 })
        .expect(400);
    });

    it('should return 404 for non-existent sweet', async () => {
      await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          sweetId: 'non-existent-id',
          quantity: 1,
        })
        .expect(404);
    });

    it('should return 400 when requesting more quantity than available', async () => {
      await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          sweetId: testSweet.id,
          quantity: 15, // More than available (10)
        })
        .expect(400);
    });

    it('should return 401 for missing token', async () => {
      await request(app)
        .post('/api/transactions')
        .send({
          sweetId: testSweet.id,
          quantity: 1,
        })
        .expect(401);
    });

    it('should return 403 for invalid token', async () => {
      await request(app)
        .post('/api/transactions')
        .set('Authorization', 'Bearer invalid-token')
        .send({
          sweetId: testSweet.id,
          quantity: 1,
        })
        .expect(403);
    });
  });

  describe('GET /api/transactions (Get User Transactions)', () => {
    it('should return user transactions with sweet details', async () => {
      // Create transactions
      await prisma.transaction.create({
        data: {
          id: 'trans-1',
          userId: testUser.id,
          sweetId: testSweet.id,
          quantity: 2,
          timestamp: new Date('2023-01-01T10:00:00Z'),
        },
      });

      await prisma.transaction.create({
        data: {
          id: 'trans-2',
          userId: testUser.id,
          sweetId: testSweet2.id,
          quantity: 3,
          timestamp: new Date('2023-01-02T15:00:00Z'),
        },
      });

      const res = await request(app)
        .get('/api/transactions')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(res.body).toHaveLength(2);
      
      // Check first transaction
      expect(res.body[0]).toMatchObject({
        id: 'trans-2',
        userId: testUser.id,
        sweetId: testSweet2.id,
        quantity: 3,
        timestamp: '2023-01-02T15:00:00.000Z',
        sweet: {
          name: 'Vanilla Cupcake',
          category: 'Cupcakes',
          price: 3.50,
          posterURL: 'https://example.com/vanilla-cupcake.jpg',
        },
      });

      // Check second transaction (should be ordered by timestamp desc)
      expect(res.body[1]).toMatchObject({
        id: 'trans-1',
        userId: testUser.id,
        sweetId: testSweet.id,
        quantity: 2,
        timestamp: '2023-01-01T10:00:00.000Z',
        sweet: {
          name: 'Chocolate Cake',
          category: 'Dessert',
          price: 12.99,
          posterURL: 'https://example.com/chocolate-cake.jpg',
        },
      });
    });

    it('should return empty array for user with no transactions', async () => {
      const res = await request(app)
        .get('/api/transactions')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(res.body).toHaveLength(0);
      expect(res.body).toEqual([]);
    });

    it('should only return transactions for the authenticated user', async () => {
      // Create another user
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

      // Create transaction for other user
      await prisma.transaction.create({
        data: {
          id: 'other-trans',
          userId: otherUser.id,
          sweetId: testSweet.id,
          quantity: 1,
        },
      });

      // Create transaction for test user
      await prisma.transaction.create({
        data: {
          id: 'test-trans',
          userId: testUser.id,
          sweetId: testSweet2.id,
          quantity: 2,
        },
      });

      const res = await request(app)
        .get('/api/transactions')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(res.body).toHaveLength(1);
      expect(res.body[0]).toMatchObject({
        id: 'test-trans',
        userId: testUser.id,
        sweetId: testSweet2.id,
        quantity: 2,
      });
    });

    it('should return 401 for missing token', async () => {
      await request(app)
        .get('/api/transactions')
        .expect(401);
    });

    it('should return 403 for invalid token', async () => {
      await request(app)
        .get('/api/transactions')
        .set('Authorization', 'Bearer invalid-token')
        .expect(403);
    });
  });
});