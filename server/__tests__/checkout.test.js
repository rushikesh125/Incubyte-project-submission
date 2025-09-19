// __tests__/checkout.test.js
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

describe('Checkout and Payment Flow', () => {
  let userToken, testUser, testSweet;

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

    // Create sweet with specific quantity
    testSweet = await prisma.sweet.create({
      data: {
        id: 'sweet-id-123',
        name: 'Chocolate Cake',
        category: 'Dessert',
        price: 12.99,
        posterURL: 'https://example.com/chocolate-cake.jpg',
        quantity: 5, // Specific quantity for testing
      },
    });
  };

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

  describe('Transaction Creation', () => {
    it('should create transaction and decrease sweet quantity', async () => {
      const transactionData = {
        sweetId: testSweet.id,
        quantity: 2,
      };

      // Create transaction
      const res = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${userToken}`)
        .send(transactionData)
        .expect(201);

      expect(res.body).toMatchObject({
        userId: testUser.id,
        sweetId: testSweet.id,
        quantity: 2,
      });

      // Verify sweet quantity was decreased
      const updatedSweet = await prisma.sweet.findUnique({
        where: { id: testSweet.id },
      });
      expect(updatedSweet.quantity).toBe(3); // 5 - 2 = 3
    });

    it('should allow purchasing exact available quantity', async () => {
      const transactionData = {
        sweetId: testSweet.id,
        quantity: 5, // Exact quantity available
      };

      await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${userToken}`)
        .send(transactionData)
        .expect(201);

      // Verify sweet quantity is now 0
      const updatedSweet = await prisma.sweet.findUnique({
        where: { id: testSweet.id },
      });
      expect(updatedSweet.quantity).toBe(0);
    });

    it('should reject transaction when requesting more than available', async () => {
      const transactionData = {
        sweetId: testSweet.id,
        quantity: 10, // More than available (5)
      };

      await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${userToken}`)
        .send(transactionData)
        .expect(400);
    });

    it('should reject transaction for non-existent sweet', async () => {
      const transactionData = {
        sweetId: 'non-existent-id',
        quantity: 1,
      };

      await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${userToken}`)
        .send(transactionData)
        .expect(404);
    });

    it('should reject transaction with invalid quantity', async () => {
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

      // Non-integer quantity (decimal)
      await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ sweetId: testSweet.id, quantity: 1.5 })
        .expect(400);

      // String quantity
      await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ sweetId: testSweet.id, quantity: "abc" })
        .expect(400);
    });
  });

  describe('Multiple Transactions', () => {
    it('should handle multiple transactions for same sweet', async () => {
      // First transaction
      await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ sweetId: testSweet.id, quantity: 2 })
        .expect(201);

      // Second transaction
      await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ sweetId: testSweet.id, quantity: 2 })
        .expect(201);

      // Verify sweet quantity was decreased correctly
      const updatedSweet = await prisma.sweet.findUnique({
        where: { id: testSweet.id },
      });
      expect(updatedSweet.quantity).toBe(1); // 5 - 2 - 2 = 1
    });

    it('should reject second transaction if exceeds remaining quantity', async () => {
      // First transaction - use 4 of 5 available
      await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ sweetId: testSweet.id, quantity: 4 })
        .expect(201);

      // Second transaction - try to use 2 more (only 1 available)
      await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ sweetId: testSweet.id, quantity: 2 })
        .expect(400);
    });
  });
});