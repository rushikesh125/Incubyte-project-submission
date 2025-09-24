import request from "supertest";
import app from "../index.js";
import { PrismaClient } from "@prisma/client";

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

describe("Sweets Endpoints", () => {
  let userToken, adminToken;

  beforeEach(async () => {
    // Create regular user (role: 'user' by default)
    const userRes = await request(app)
      .post("/api/auth/register")
      .send({
        fullName: "Regular User",
        email: "user@example.com",
        password: "password123",
      })
      .expect(201);

    const loginUserRes = await request(app)
      .post("/api/auth/login")
      .send({ email: "user@example.com", password: "password123" })
      .expect(200);

    userToken = loginUserRes.body.token;
    expect(loginUserRes.body.user.role).toBe("user");

    // Create admin user using admin registration endpoint
    const adminRes = await request(app)
      .post("/api/auth/register-admin")
      .send({
        fullName: "Admin User",
        email: "admin@example.com",
        password: "password123",
      })
      .expect(201);

    const loginAdminRes = await request(app)
      .post("/api/auth/login")
      .send({ email: "admin@example.com", password: "password123" })
      .expect(200);

    adminToken = loginAdminRes.body.token;
    expect(loginAdminRes.body.user.role).toBe("admin");

    expect(userToken).toBeDefined();
    expect(adminToken).toBeDefined();
  });

  describe("GET /api/sweets (Public)", () => {
    it("should return all sweets for guests (no auth required)", async () => {
      // Admin creates a sweet (requires auth)
      await request(app)
        .post("/api/sweets")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Chocolate Bar",
          category: "Chocolate",
          price: 2.99,
          quantity: 10,
          posterURL: "https://example.com/chocolate-bar.jpg",
        })
        .expect(201);

      // Guest (no token) can view sweets
      const res = await request(app).get("/api/sweets").expect(200); // ✅ 200 OK for public access

      expect(res.body).toHaveLength(1);
      expect(res.body[0]).toMatchObject({
        id: expect.any(String),
        name: "Chocolate Bar",
        category: "Chocolate",
        posterURL: "https://example.com/chocolate-bar.jpg",
        price: 2.99,
        quantity: 10,
        createdAt: expect.any(String),
      });
    });

    it("should return all sweets for authenticated user", async () => {
      // Admin creates a sweet
      await request(app)
        .post("/api/sweets")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Chocolate Bar",
          category: "Chocolate",
          price: 2.99,
          quantity: 10,
          posterURL: "https://example.com/chocolate-bar.jpg",
        })
        .expect(201);

      const res = await request(app)
        .get("/api/sweets")
        .set("Authorization", `Bearer ${userToken}`)
        .expect(200); // ✅ 200 OK for authenticated users too

      expect(res.body).toHaveLength(1);
      expect(res.body[0]).toMatchObject({
        id: expect.any(String),
        name: "Chocolate Bar",
        category: "Chocolate",
        posterURL: "https://example.com/chocolate-bar.jpg",
        price: 2.99,
        quantity: 10,
        createdAt: expect.any(String),
      });
    });

    it("should return empty array when no sweets exist", async () => {
      const res = await request(app).get("/api/sweets").expect(200); // ✅ 200 OK for empty catalog

      expect(res.body).toEqual([]);
    });

    // ✅ REMOVED: These tests no longer apply since GET is public
    // it('should return 401 for unauthenticated user', async () => { ... });
    // it('should return 403 for invalid token', async () => { ... });
  });

  describe("GET /api/sweets/search?query (Public)", () => {
    beforeEach(async () => {
      // Create test sweets for search testing (admin required)
      await request(app)
        .post("/api/sweets")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Chocolate Cake",
          category: "Dessert",
          price: 5.99,
          quantity: 5,
          posterURL: "https://example.com/chocolate-cake.jpg",
        })
        .expect(201);

      await request(app)
        .post("/api/sweets")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Vanilla Cake",
          category: "Dessert",
          price: 4.99,
          quantity: 3,
          posterURL: "https://example.com/vanilla-cake.jpg",
        })
        .expect(201);

      await request(app)
        .post("/api/sweets")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Apple Pie",
          category: "Dessert",
          price: 3.99,
          quantity: 8,
          posterURL: "https://example.com/apple-pie.jpg",
        })
        .expect(201);
    });

    it("should search sweets by name (case insensitive) for guests", async () => {
      const res = await request(app)
        .get("/api/sweets/search?query=chocolate")
        .expect(200); // ✅ 200 OK for public search

      expect(res.body).toHaveLength(1);
      expect(res.body[0].name).toBe("Chocolate Cake");
      expect(res.body[0].posterURL).toBe(
        "https://example.com/chocolate-cake.jpg"
      );
    });

    it("should search sweets by category (case insensitive) for guests", async () => {
      const res = await request(app)
        .get("/api/sweets/search?query=dessert")
        .expect(200); // ✅ 200 OK for public search

      expect(res.body).toHaveLength(3); // All three are desserts
      expect(res.body.map((sweet) => sweet.category)).toEqual(
        expect.arrayContaining(["Dessert", "Dessert", "Dessert"])
      );
    });

    it("should search sweets by partial name for guests", async () => {
      const res = await request(app)
        .get("/api/sweets/search?query=cake")
        .expect(200); // ✅ 200 OK for public search

      expect(res.body).toHaveLength(2); // Chocolate Cake and Vanilla Cake
      expect(res.body.map((sweet) => sweet.name)).toEqual(
        expect.arrayContaining(["Chocolate Cake", "Vanilla Cake"])
      );
    });

    it("should return empty array for no matches (public)", async () => {
      const res = await request(app)
        .get("/api/sweets/search?query=nonexistent")
        .expect(200); // ✅ 200 OK for public search

      expect(res.body).toEqual([]);
    });

    it("should return 400 if no query provided (public)", async () => {
      await request(app)
        .get("/api/sweets/search")
        .expect(400)
        .expect((res) => {
          expect(res.body.error).toBe("Query parameter required");
        });
    });

    // ✅ REMOVED: No longer test 401 since search is public
    // it('should return 401 for unauthenticated user', async () => { ... });
  });

  describe("POST /api/sweets (Admin only)", () => {
    it("should create a new sweet for admin with posterURL", async () => {
      const newSweet = {
        name: "Gummy Bears",
        category: "Candy",
        price: 1.99,
        quantity: 50,
        posterURL: "https://example.com/gummy-bears.jpg",
      };

      const res = await request(app)
        .post("/api/sweets")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(newSweet)
        .expect(201);

      expect(res.body).toMatchObject({
        id: expect.any(String),
        ...newSweet, // All fields including posterURL
      });

      // Verify in database
      const dbSweet = await prisma.sweet.findUnique({
        where: { id: res.body.id },
      });
      expect(dbSweet).toMatchObject(newSweet);
      expect(dbSweet.posterURL).toBe("https://example.com/gummy-bears.jpg");
    });

    it("should return 403 for regular user trying to create sweet", async () => {
      await request(app)
        .post("/api/sweets")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          name: "Test",
          category: "Test",
          price: 1,
          quantity: 1,
          posterURL: "https://example.com/test.jpg",
        })
        .expect(403)
        .expect((res) => {
          expect(res.body.error).toBe("Admin access required");
        });
    });

    it("should return 401 for unauthenticated user trying to create sweet", async () => {
      await request(app)
        .post("/api/sweets")
        .send({
          name: "Test",
          category: "Test",
          price: 1,
          quantity: 1,
          posterURL: "https://example.com/test.jpg",
        })
        .expect(401)
        .expect((res) => {
          expect(res.body.error).toBe("Access token required");
        });
    });

    it("should return 400 for missing required fields", async () => {
      // Missing posterURL
      await request(app)
        .post("/api/sweets")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Test",
          category: "Test",
          price: 1,
          quantity: 1,
          // Missing: posterURL
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.error).toBe("Missing required fields");
        });

      // Missing multiple fields
      await request(app)
        .post("/api/sweets")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ name: "Test" })
        .expect(400);
    });

    it("should return 400 for invalid price or quantity", async () => {
      // Negative price
      await request(app)
        .post("/api/sweets")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Test",
          category: "Test",
          price: -1,
          quantity: 1,
          posterURL: "https://example.com/test.jpg",
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.error).toBe(
            "Price and quantity must be non-negative"
          );
        });

      // Negative quantity
      await request(app)
        .post("/api/sweets")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Test",
          category: "Test",
          price: 1,
          quantity: -1,
          posterURL: "https://example.com/test.jpg",
        })
        .expect(400);
    });

    it("should return 400 for missing posterURL", async () => {
      await request(app)
        .post("/api/sweets")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Test",
          category: "Test",
          price: 1,
          quantity: 1,
          // Missing posterURL
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.error).toBe("Missing required fields");
        });
    });

    it("should accept valid posterURL format", async () => {
      const res = await request(app)
        .post("/api/sweets")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Valid Sweet",
          category: "Test",
          price: 1.99,
          quantity: 10,
          posterURL: "https://example.com/valid-image.jpg",
        })
        .expect(201);

      expect(res.body.posterURL).toBe("https://example.com/valid-image.jpg");
      expect(res.body).toHaveProperty("id");
      expect(res.body).toHaveProperty("name", "Valid Sweet");
    });
  });

  describe("PUT /api/sweets/:id (Admin only)", () => {
    let sweetId;

    beforeEach(async () => {
      // Create a sweet to update
      const createRes = await request(app)
        .post("/api/sweets")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Old Chocolate",
          category: "Chocolate",
          price: 1.99,
          quantity: 10,
          posterURL: "https://example.com/old-chocolate.jpg",
        })
        .expect(201);

      sweetId = createRes.body.id;
    });

    it("should update a sweet for admin including posterURL", async () => {
      const updateData = {
        name: "Updated Chocolate",
        category: "Premium Chocolate",
        price: 3.99,
        quantity: 15,
        posterURL: "https://example.com/updated-chocolate.jpg",
      };

      const res = await request(app)
        .put(`/api/sweets/${sweetId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(res.body).toMatchObject({
        id: sweetId,
        ...updateData, // All fields including new posterURL
      });

      // Verify in database
      const dbSweet = await prisma.sweet.findUnique({ where: { id: sweetId } });
      expect(dbSweet.name).toBe("Updated Chocolate");
      expect(dbSweet.posterURL).toBe(
        "https://example.com/updated-chocolate.jpg"
      );
    });

    it("should return 403 for regular user trying to update", async () => {
      await request(app)
        .put(`/api/sweets/${sweetId}`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({ name: "Updated by User" })
        .expect(403)
        .expect((res) => {
          expect(res.body.error).toBe("Admin access required");
        });
    });

    it("should return 401 for unauthenticated user trying to update", async () => {
      await request(app)
        .put(`/api/sweets/${sweetId}`)
        .send({ name: "Updated by Guest" })
        .expect(401)
        .expect((res) => {
          expect(res.body.error).toBe("Access token required");
        });
    });

    it("should return 400 for missing required fields during update", async () => {
      await request(app)
        .put(`/api/sweets/${sweetId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ name: "Updated" }) // Missing other required fields
        .expect(400)
        .expect((res) => {
          expect(res.body.error).toBe("Missing required fields");
        });
    });

    it("should return 400 for invalid price or quantity during update", async () => {
      await request(app)
        .put(`/api/sweets/${sweetId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Updated",
          category: "Test",
          price: -1,
          quantity: 10,
          posterURL: "test.jpg",
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.error).toBe(
            "Price and quantity must be non-negative"
          );
        });

      await request(app)
        .put(`/api/sweets/${sweetId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Updated",
          category: "Test",
          price: 1,
          quantity: -10,
          posterURL: "test.jpg",
        })
        .expect(400);
    });

    it("should return 404 for non-existent sweet", async () => {
      await request(app)
        .put("/api/sweets/non-existent-id")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Updated",
          category: "Test",
          price: 1,
          quantity: 1,
          posterURL: "test.jpg",
        })
        .expect(404)
        .expect((res) => {
          expect(res.body.error).toBe("Sweet not found");
        });
    });
  });

  describe("DELETE /api/sweets/:id (Admin only)", () => {
    let sweetId;

    beforeEach(async () => {
      // Create a sweet to delete
      const createRes = await request(app)
        .post("/api/sweets")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Chocolate Bar to Delete",
          category: "Chocolate",
          price: 2.99,
          quantity: 10,
          posterURL: "https://example.com/delete-me.jpg",
        })
        .expect(201);

      sweetId = createRes.body.id;
    });

    it("should delete a sweet for admin", async () => {
      const res = await request(app)
        .delete(`/api/sweets/${sweetId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.message).toBe("Sweet deleted successfully");

      // Verify it's actually deleted from database
      const deletedSweet = await prisma.sweet.findUnique({
        where: { id: sweetId },
      });
      expect(deletedSweet).toBeNull();

      // Verify transactions are cascaded (if any exist)
      const transactions = await prisma.transaction.findMany({
        where: { sweetId },
      });
      expect(transactions).toEqual([]);
    });

    it("should return 403 for regular user trying to delete", async () => {
      await request(app)
        .delete(`/api/sweets/${sweetId}`)
        .set("Authorization", `Bearer ${userToken}`)
        .expect(403)
        .expect((res) => {
          expect(res.body.error).toBe("Admin access required");
        });
    });

    it("should return 401 for unauthenticated user trying to delete", async () => {
      await request(app)
        .delete(`/api/sweets/${sweetId}`)
        .expect(401)
        .expect((res) => {
          expect(res.body.error).toBe("Access token required");
        });
    });

    it("should return 404 for non-existent sweet", async () => {
      await request(app)
        .delete("/api/sweets/non-existent-id")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(404)
        .expect((res) => {
          expect(res.body.error).toBe("Sweet not found");
        });
    });
  });

  describe("Edge Cases and Validation", () => {
    describe("POST /api/sweets Validation", () => {
      it("should handle database constraint violations", async () => {
        await request(app)
          .post("/api/sweets")
          .set("Authorization", `Bearer ${adminToken}`)
          .send({
            name: "Duplicate Sweet",
            category: "Test",
            price: 1,
            quantity: 1,
            posterURL: "test.jpg",
          })
          .expect(201);

        await request(app)
          .post("/api/sweets")
          .set("Authorization", `Bearer ${adminToken}`)
          .send({
            name: "Duplicate Sweet",
            category: "Test",
            price: 2,
            quantity: 2,
            posterURL: "test2.jpg",
          })
          .expect(201);
      });

      it("should validate posterURL format (controller level)", async () => {
        await request(app)
          .post("/api/sweets")
          .set("Authorization", `Bearer ${adminToken}`)
          .send({
            name: "Test",
            category: "Test",
            price: 1,
            quantity: 1,
            posterURL: "", // Empty string - triggers controller validation
          })
          .expect(400)
          .expect((res) => {
            // ✅ FIXED: Match the exact controller error message
            expect(res.body.error).toBe("posterURL must be a non-empty string");
          });
      });
    });

    describe.only("Test case for fetchint data with only 5", () => {
      it("should return only 5 items per request", async () => {
        const adminRes = await request(app)
          .post("/api/auth/register-admin")
          .send({
            fullName: "Admin User",
            email: "admin2@gmail.com",
            password: "password123",
          })
          .expect(201);
          console.log(adminRes.body)
        const token  = adminRes.body.token;

        await request(app)
          .post("/api/sweets")
          .set("Authorization", `Bearer ${token}`)
          .send({
            name: "Cholate",
            category: "Chocolate",
            price: 2.99,
            quantity: 10,
            posterURL: "https://example.com/chocolate-bar.jpg",
          })
          .expect(201);

        await request(app)
          .post("/api/sweets")
          .set("Authorization", `Bearer ${token}`)
          .send({
            name: "Gulab Jamun",
            category: "Sweets",
            price: 2.99,
            quantity: 10,
            posterURL: "https://example.com/chocolate-bar.jpg",
          })
          .expect(201);

        await request(app)
          .get("/api/sweets?items=5")
          .expect(200)
          .expect((res) => {
            // console.log(res)
            expect(res.body.length).toBe(2);
          });
      });
    });
  });
});
