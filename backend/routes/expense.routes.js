import express from 'express';
import prisma from '../lib/prisma.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Transform Prisma camelCase to frontend snake_case
const transformExpense = (expense) => ({
  id: expense.id,
  expense_date: expense.expenseDate ? new Date(expense.expenseDate).toISOString().split('T')[0] : null,
  driver_id: expense.driverId,
  driver_name: expense.driverName,
  driver_number: expense.driverNumber,
  expense_type: expense.expenseType,
  hours: expense.hours ? Number(expense.hours) : null,
  hourly_rate: expense.hourlyRate ? Number(expense.hourlyRate) : 0,
  is_overtime: expense.isOvertime,
  amount: expense.amount ? Number(expense.amount) : 0,
  currency: expense.currency,
  is_paid: expense.isPaid,
  is_deleted: expense.isDeleted,
  description: expense.description,
  created_date: expense.createdDate,
  created_by: expense.createdBy,
  driver: expense.driver
});

router.use(authenticateToken);

// Get all expenses with filters
router.get('/', async (req, res) => {
  try {
    const {
      month,
      driverId,
      expenseType,
      currency,
      isPaid,
      isDeleted,
      search,
      page = 1,
      limit = 20
    } = req.query;

    const where = {};

    // Filter by month (format: "YYYY-MM")
    if (month) {
      const [year, monthNum] = month.split('-');
      const startDate = new Date(year, monthNum - 1, 1);
      const endDate = new Date(year, monthNum, 0);
      where.expenseDate = {
        gte: startDate,
        lte: endDate
      };
    }

    if (driverId) where.driverId = driverId;
    if (expenseType) where.expenseType = expenseType;
    if (currency) where.currency = currency;
    if (isPaid !== undefined) where.isPaid = isPaid === 'true';
    if (isDeleted !== undefined) where.isDeleted = isDeleted === 'true';
    
    if (search) {
      where.OR = [
        { driverName: { contains: search, mode: 'insensitive' } },
        { driverNumber: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        orderBy: { expenseDate: 'desc' },
        skip,
        take: parseInt(limit),
        include: {
          driver: {
            select: {
              id: true,
              driverName: true,
              driverNumber: true
            }
          }
        }
      }),
      prisma.expense.count({ where })
    ]);

    res.json({
      data: expenses.map(transformExpense),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

// Get single expense
router.get('/:id', async (req, res) => {
  try {
    const expense = await prisma.expense.findUnique({
      where: { id: req.params.id },
      include: {
        driver: true
      }
    });

    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    res.json(transformExpense(expense));
  } catch (error) {
    console.error('Get expense error:', error);
    res.status(500).json({ error: 'Failed to fetch expense' });
  }
});

// Create expense
router.post('/', async (req, res) => {
  try {
    // Accept both camelCase and snake_case
    const expenseDate = req.body.expenseDate || req.body.expense_date;
    const driverId = req.body.driverId || req.body.driver_id;
    const driverName = req.body.driverName || req.body.driver_name;
    const driverNumber = req.body.driverNumber || req.body.driver_number;
    const expenseType = req.body.expenseType || req.body.expense_type;
    const hours = req.body.hours;
    const hourlyRate = req.body.hourlyRate || req.body.hourly_rate;
    const isOvertime = req.body.isOvertime || req.body.is_overtime;
    const amount = req.body.amount;
    const currency = req.body.currency;
    const isPaid = req.body.isPaid || req.body.is_paid;
    const description = req.body.description;

    const expense = await prisma.expense.create({
      data: {
        expenseDate: new Date(expenseDate),
        driverId,
        driverName,
        driverNumber,
        expenseType,
        hours: hours ? parseFloat(hours) : null,
        hourlyRate: parseFloat(hourlyRate) || 0,
        isOvertime: isOvertime || false,
        amount: parseFloat(amount),
        currency: currency || 'IQD',
        isPaid: isPaid || false,
        isDeleted: false,
        description: description || '',
        createdBy: req.user.email
      }
    });

    res.status(201).json(transformExpense(expense));
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({ error: 'Failed to create expense' });
  }
});

// Update expense
router.put('/:id', async (req, res) => {
  try {
    const data = {};
    const fields = [
      'expenseDate', 'driverId', 'driverName', 'driverNumber', 'expenseType',
      'hours', 'hourlyRate', 'isOvertime', 'amount', 'currency', 'isPaid',
      'isDeleted', 'description'
    ];

    fields.forEach(field => {
      if (req.body[field] !== undefined) {
        if (field === 'expenseDate') {
          data[field] = new Date(req.body[field]);
        } else if (['hours', 'hourlyRate', 'amount'].includes(field)) {
          data[field] = req.body[field] !== null ? parseFloat(req.body[field]) : null;
        } else if (['isOvertime', 'isPaid', 'isDeleted'].includes(field)) {
          data[field] = Boolean(req.body[field]);
        } else {
          data[field] = req.body[field];
        }
      }
    });

    const expense = await prisma.expense.update({
      where: { id: req.params.id },
      data
    });

    res.json(transformExpense(expense));
  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json({ error: 'Failed to update expense' });
  }
});

// Soft delete expense
router.post('/:id/soft-delete', async (req, res) => {
  try {
    const expense = await prisma.expense.update({
      where: { id: req.params.id },
      data: { isDeleted: true }
    });

    res.json(transformExpense(expense));
  } catch (error) {
    console.error('Soft delete error:', error);
    res.status(500).json({ error: 'Failed to delete expense' });
  }
});

// Restore expense
router.post('/:id/restore', async (req, res) => {
  try {
    const expense = await prisma.expense.update({
      where: { id: req.params.id },
      data: { isDeleted: false }
    });

    res.json(transformExpense(expense));
  } catch (error) {
    console.error('Restore error:', error);
    res.status(500).json({ error: 'Failed to restore expense' });
  }
});

// Permanently delete expense
router.delete('/:id', async (req, res) => {
  try {
    await prisma.expense.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Expense permanently deleted' });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({ error: 'Failed to delete expense' });
  }
});

// Bulk operations
router.post('/bulk-delete', async (req, res) => {
  try {
    const { ids } = req.body;

    await prisma.expense.updateMany({
      where: { id: { in: ids } },
      data: { isDeleted: true }
    });

    res.json({ message: 'Expenses deleted successfully' });
  } catch (error) {
    console.error('Bulk delete error:', error);
    res.status(500).json({ error: 'Failed to delete expenses' });
  }
});

router.post('/bulk-restore', async (req, res) => {
  try {
    const { ids } = req.body;

    await prisma.expense.updateMany({
      where: { id: { in: ids } },
      data: { isDeleted: false }
    });

    res.json({ message: 'Expenses restored successfully' });
  } catch (error) {
    console.error('Bulk restore error:', error);
    res.status(500).json({ error: 'Failed to restore expenses' });
  }
});

router.post('/bulk-permanent-delete', async (req, res) => {
  try {
    const { ids } = req.body;

    await prisma.expense.deleteMany({
      where: { id: { in: ids } }
    });

    res.json({ message: 'Expenses permanently deleted' });
  } catch (error) {
    console.error('Bulk permanent delete error:', error);
    res.status(500).json({ error: 'Failed to delete expenses' });
  }
});

export default router;
