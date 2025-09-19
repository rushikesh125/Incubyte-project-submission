import { prisma } from "../prisma/client.js";

// READ: Get all sweets (User)
export const getAllSweets = async (req, res) => {
  try {
    const sweets = await prisma.sweet.findMany({
      select: {
        id: true,
        name: true,
        category: true,
        posterURL:true,
        price: true,
        quantity: true,
        createdAt: true,
      },
    });
    res.status(200).json(sweets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// READ: Search sweets by name/category (User)
export const searchSweets = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ error: 'Query parameter required' });
    }

    const sweets = await prisma.sweet.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { category: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        name: true,
        category: true,
        posterURL:true,
        price: true,
        quantity: true,
      },
    });
    res.status(200).json(sweets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// CREATE: Add new sweet (Admin)
export const createSweet = async (req, res) => {
  try {
    const { name, category, price, quantity,posterURL } = req.body;
    if (!name || !category || price === undefined || quantity === undefined || posterURL === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    if (price < 0 || quantity < 0) {
      return res.status(400).json({ error: 'Price and quantity must be non-negative' });
    }

    const sweet = await prisma.sweet.create({
      data: {
        id: crypto.randomUUID(),
        name,
        category,
        posterURL,
        price,
        quantity,
      },
      select: {
        id: true,
        name: true,
        category: true,
        price: true,
        quantity: true,
      },
    });
    res.status(201).json(sweet);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// UPDATE: Update sweet (Admin)
export const updateSweet = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, price, quantity,posterURL } = req.body;
    if (!name || !category || price === undefined || quantity === undefined || posterURL == undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    if (price < 0 || quantity < 0) {
      return res.status(400).json({ error: 'Price and quantity must be non-negative' });
    }

    const sweet = await prisma.sweet.findUnique({ where: { id } });
    if (!sweet) {
      return res.status(404).json({ error: 'Sweet not found' });
    }

    const updatedSweet = await prisma.sweet.update({
      where: { id },
      data: { name, category, price, quantity },
      select: {
        id: true,
        name: true,
        category: true,
        posterURL:true,
        price: true,
        quantity: true,
      },
    });
    res.status(200).json(updatedSweet);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// DELETE: Delete sweet (Admin)
export const deleteSweet = async (req, res) => {
  try {
    const { id } = req.params;

    const sweet = await prisma.sweet.findUnique({ where: { id } });
    if (!sweet) {
      return res.status(404).json({ error: 'Sweet not found' });
    }

    await prisma.sweet.delete({ where: { id } });
    res.status(200).json({ message: 'Sweet deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};