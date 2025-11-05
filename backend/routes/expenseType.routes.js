import express from 'express';
import prisma from '../lib/prisma.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Transform Prisma camelCase to frontend snake_case
const transformExpenseType = (type) => ({
  id: type.id,
  type_name: type.typeName,
  color: type.color,
  created_date: type.createdDate,
  created_by: type.createdBy
});

router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const types = await prisma.expenseType.findMany({
      orderBy: { createdDate: 'desc' }
    });
    res.json(types.map(transformExpenseType));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch expense types' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const type = await prisma.expenseType.findUnique({
      where: { id: req.params.id }
    });
    if (!type) {
      return res.status(404).json({ error: 'Expense type not found' });
    }
    res.json(transformExpenseType(type));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch expense type' });
  }
});

router.post('/', async (req, res) => {
  try {
    // Accept both camelCase and snake_case
    const typeName = req.body.typeName || req.body.type_name;
    const color = req.body.color;
    
    const type = await prisma.expenseType.create({
      data: {
        typeName,
        color: color || 'blue',
        createdBy: req.user.email
      }
    });
    res.status(201).json(transformExpenseType(type));
  } catch (error) {
    console.error('Create expense type error:', error);
    res.status(500).json({ error: 'Failed to create expense type' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const data = {};
    // Accept both camelCase and snake_case
    const typeName = req.body.typeName || req.body.type_name;
    const color = req.body.color;
    
    if (typeName) data.typeName = typeName;
    if (color) data.color = color;
    
    const type = await prisma.expenseType.update({
      where: { id: req.params.id },
      data
    });
    res.json(transformExpenseType(type));
  } catch (error) {
    res.status(500).json({ error: 'Failed to update expense type' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await prisma.expenseType.delete({
      where: { id: req.params.id }
    });
    res.json({ message: 'Expense type deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete expense type' });
  }
});

export default router;
