// controllers/users.js
import { prisma } from "../prisma/client.js";


export const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// UPDATE: Promote user to admin (Admin only)
export const promoteToAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Prevent demoting the current admin
    if (id === req.user.userId) {
      return res.status(400).json({ error: 'Cannot change your own role' });
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if already admin
    if (user.role === 'admin') {
      return res.status(400).json({ error: 'User is already an admin' });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role: 'admin' },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
      },
    });
    
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// DELETE: Delete user (Admin only)
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Prevent self-deletion
    if (id === req.user.userId) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await prisma.user.delete({ where: { id } });
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};