import {prisma} from "../prisma/client.js"


export const getAllTransactions = async (req, res) => {
  try {
    // Verify user is admin (this should be handled by middleware)
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const transactions = await prisma.transaction.findMany({
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        sweet: {
          select: {
            id: true,
            name: true,
            posterURL: true,
            price: true,
            category: true,
          },
        },
      },
      orderBy: { timestamp: 'desc' },
    });

    res.status(200).json(transactions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};


// CREATE: Add new transaction
export const createTransaction = async (req, res) => {
  try {
    const { sweetId, quantity } = req.body;
    const userId = req.user.userId;

    // Validate input
    if (!sweetId || quantity === undefined || quantity <= 0) {
      return res.status(400).json({ error: 'Invalid transaction data' });
    }

    // Ensure quantity is a positive integer
    const requestedQuantity = parseInt(quantity);
    if (isNaN(requestedQuantity) || requestedQuantity <= 0 || !Number.isInteger(parseFloat(quantity))) {
      return res.status(400).json({ error: 'Quantity must be a positive integer' });
    }

    // Check if sweet exists and has enough quantity
    const sweet = await prisma.sweet.findUnique({ where: { id: sweetId } });
    if (!sweet) {
      return res.status(404).json({ error: 'Sweet not found' });
    }

    // Fix: Use < instead of <= to allow purchasing when quantity equals stock
    if (sweet.quantity < requestedQuantity) {
      return res.status(400).json({ 
        error: 'Not enough quantity available',
        available: sweet.quantity,
        requested: requestedQuantity
      });
    }

    // Create transaction
    const transaction = await prisma.transaction.create({
      data: {
        id: crypto.randomUUID(),
        userId,
        sweetId,
        quantity: requestedQuantity,
      },
    });

    // Update sweet quantity - FIXED: Added 'data' property
    await prisma.sweet.update({
      where: { id: sweetId },
      data: { quantity: sweet.quantity - requestedQuantity },
    });

    res.status(201).json(transaction);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// READ: Get user transactions
export const getUserTransactions = async (req, res) => {
  try {
    const userId = req.user.userId;

    const transactions = await prisma.transaction.findMany({
      where: { userId },
      include: {
        sweet: {
          select: {
            name: true,
            posterURL: true,
            price: true,
            category: true,
          },
        },
      },
      orderBy: { timestamp: 'desc' },
    });

    res.status(200).json(transactions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};