import express from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

// Transform Prisma camelCase to frontend snake_case
const transformUser = (user) => ({
  id: user.id,
  email: user.email,
  full_name: user.fullName,
  role: user.role,
  created_date: user.createdDate
});

router.use(authenticateToken);
router.use(requireAdmin);

// Get all users
router.get('/', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        createdDate: true
      },
      orderBy: { createdDate: 'desc' }
    });
    res.json(users.map(transformUser));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get single user
router.get('/:id', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        createdDate: true
      }
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(transformUser(user));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update user
router.put('/:id', async (req, res) => {
  try {
    const data = {};
    if (req.body.email) data.email = req.body.email;
    if (req.body.fullName) data.fullName = req.body.fullName;
    if (req.body.role) data.role = req.body.role;
    if (req.body.password) {
      data.password = await bcrypt.hash(req.body.password, 10);
    }
    
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data,
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        createdDate: true
      }
    });
    
    res.json(transformUser(user));
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete user
router.delete('/:id', async (req, res) => {
  try {
    // Prevent deleting yourself
    if (req.params.id === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }
    
    await prisma.user.delete({
      where: { id: req.params.id }
    });
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

export default router;
