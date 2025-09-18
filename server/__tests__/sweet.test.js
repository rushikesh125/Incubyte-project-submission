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

describe('Sweets Endpoints', () => {
  let userToken, adminToken;

  beforeEach(async () => {
    // Create regular user (role: 'user' by default)
    const userRes = await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'Regular User',
        email: 'user@example.com',
        password: 'password123',
      })
      .expect(201);
    
    const loginUserRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@example.com', password: 'password123' })
      .expect(200);
    
    userToken = loginUserRes.body.token;
    expect(loginUserRes.body.user.role).toBe('user'); // Verify regular user role

    // Create admin user using admin registration endpoint
    const adminRes = await request(app)
      .post('/api/auth/register-admin')
      .send({
        fullName: 'Admin User',
        email: 'admin@example.com',
        password: 'password123',
      })
      .expect(201);
    
    const loginAdminRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@example.com', password: 'password123' })
      .expect(200);
    
    adminToken = loginAdminRes.body.token;
    expect(loginAdminRes.body.user.role).toBe('admin'); // Verify admin role

    // Verify tokens are valid
    expect(userToken).toBeDefined();
    expect(adminToken).toBeDefined();
  });

  describe('GET /api/sweets', () => {
    it('should return all sweets for authenticated user', async () => {
      // First add a sweet (admin)
      await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Chocolate Bar',
          category: 'Chocolate',
          price: 2.99,
          quantity: 10,
        })
        .expect(201);

      const res = await request(app)
        .get('/api/sweets')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(res.body).toHaveLength(1);
      expect(res.body[0]).toMatchObject({
        id: expect.any(String),
        name: 'Chocolate Bar',
        category: 'Chocolate',
        price: 2.99,
        quantity: 10,
      });
    });

    it('should return 401 for unauthenticated user', async () => {
      await request(app)
        .get('/api/sweets')
        .expect(401);
    });
  });

  describe('POST /api/sweets (Admin only)', () => {
    it('should create a new sweet for admin', async () => {
      const newSweet = {
        name: 'Gummy Bears',
        category: 'Candy',
        price: 1.99,
        quantity: 50,
      };

      const res = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newSweet)
        .expect(201);

      expect(res.body).toMatchObject({
        id: expect.any(String),
        ...newSweet,
      });
    });

    it('should return 403 for regular user trying to create sweet', async () => {
      await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'Test', category: 'Test', price: 1, quantity: 1 })
        .expect(403);
    });

    it('should return 400 for missing fields', async () => {
      await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Test' }) // Missing required fields
        .expect(400);
    });
  });

  describe('GET /api/sweets/search?query', () => {
    it('should search sweets by name', async () => {
      // Add test sweets
      await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ 
          name: 'Chocolate Cake', 
          category: 'Dessert', 
          price: 5.99, 
          quantity: 5 
        })
        .expect(201);

      await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ 
          name: 'Vanilla Cake', 
          category: 'Dessert', 
          price: 4.99, 
          quantity: 3 
        })
        .expect(201);

      const res = await request(app)
        .get('/api/sweets/search?query=chocolate')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].name).toBe('Chocolate Cake');
    });

    it('should search sweets by category', async () => {
      await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ 
          name: 'Apple Pie', 
          category: 'Dessert', 
          price: 3.99, 
          quantity: 8 
        })
        .expect(201);

      const res = await request(app)
        .get('/api/sweets/search?query=dessert')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].category).toBe('Dessert');
    });
  });
});