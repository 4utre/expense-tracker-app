import express from 'express';
import prisma from '../lib/prisma.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Transform Prisma camelCase to frontend snake_case
const transformDriver = (driver) => {
  let assignedMonths = [];
  try {
    if (Array.isArray(driver.assignedMonths)) {
      assignedMonths = driver.assignedMonths;
    } else if (driver.assignedMonths) {
      // Try to parse as JSON, if it fails, treat as empty array
      const parsed = JSON.parse(driver.assignedMonths);
      assignedMonths = Array.isArray(parsed) ? parsed : [];
    }
  } catch (e) {
    // If JSON parsing fails, return empty array
    assignedMonths = [];
  }
  
  return {
    id: driver.id,
    driver_name: driver.driverName,
    driver_number: driver.driverNumber,
    phone: driver.phone,
    hourly_rate: driver.hourlyRate ? Number(driver.hourlyRate) : 0,
    overtime_rate: driver.overtimeRate ? Number(driver.overtimeRate) : 0,
    currency: driver.currency,
    assigned_months: assignedMonths,
    created_date: driver.createdDate,
    created_by: driver.createdBy
  };
};

// All routes require authentication
router.use(authenticateToken);

// Get all drivers
router.get('/', async (req, res) => {
  try {
    const drivers = await prisma.driver.findMany({
      orderBy: { createdDate: 'desc' }
    });
    res.json(drivers.map(transformDriver));
  } catch (error) {
    console.error('Get drivers error:', error);
    res.status(500).json({ error: 'Failed to fetch drivers' });
  }
});

// Get single driver
router.get('/:id', async (req, res) => {
  try {
    const driver = await prisma.driver.findUnique({
      where: { id: req.params.id },
      include: {
        expenses: {
          orderBy: { expenseDate: 'desc' },
          take: 10
        }
      }
    });

    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    res.json(transformDriver(driver));
  } catch (error) {
    console.error('Get driver error:', error);
    res.status(500).json({ error: 'Failed to fetch driver' });
  }
});

// Create driver
router.post('/', async (req, res) => {
  try {
    // Accept both camelCase and snake_case
    const driverName = req.body.driverName || req.body.driver_name;
    const driverNumber = req.body.driverNumber || req.body.driver_number;
    const phone = req.body.phone;
    const hourlyRate = req.body.hourlyRate || req.body.hourly_rate;
    const overtimeRate = req.body.overtimeRate || req.body.overtime_rate;
    const currency = req.body.currency;
    const assignedMonths = req.body.assignedMonths || req.body.assigned_months;

    const driver = await prisma.driver.create({
      data: {
        driverName,
        driverNumber,
        phone: phone || '',
        hourlyRate: parseFloat(hourlyRate) || 0,
        overtimeRate: parseFloat(overtimeRate) || 0,
        currency: currency || 'IQD',
        assignedMonths: JSON.stringify(assignedMonths || []),
        createdBy: req.user.email
      }
    });

    res.status(201).json(transformDriver(driver));
  } catch (error) {
    console.error('Create driver error:', error);
    res.status(500).json({ error: 'Failed to create driver' });
  }
});

// Update driver
router.put('/:id', async (req, res) => {
  try {
    // Accept both camelCase and snake_case
    const driverName = req.body.driverName || req.body.driver_name;
    const driverNumber = req.body.driverNumber || req.body.driver_number;
    const phone = req.body.phone;
    const hourlyRate = req.body.hourlyRate || req.body.hourly_rate;
    const overtimeRate = req.body.overtimeRate || req.body.overtime_rate;
    const currency = req.body.currency;
    const assignedMonths = req.body.assignedMonths || req.body.assigned_months;

    const driver = await prisma.driver.update({
      where: { id: req.params.id },
      data: {
        ...(driverName && { driverName }),
        ...(driverNumber && { driverNumber }),
        ...(phone !== undefined && { phone }),
        ...(hourlyRate !== undefined && { hourlyRate: parseFloat(hourlyRate) }),
        ...(overtimeRate !== undefined && { overtimeRate: parseFloat(overtimeRate) }),
        ...(currency && { currency }),
        ...(assignedMonths !== undefined && { assignedMonths: JSON.stringify(assignedMonths) })
      }
    });

    res.json(transformDriver(driver));
  } catch (error) {
    console.error('Update driver error:', error);
    res.status(500).json({ error: 'Failed to update driver' });
  }
});

// Delete driver
router.delete('/:id', async (req, res) => {
  try {
    await prisma.driver.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Driver deleted successfully' });
  } catch (error) {
    console.error('Delete driver error:', error);
    res.status(500).json({ error: 'Failed to delete driver' });
  }
});

// Bulk update hourly rates
router.post('/bulk-update-rates', async (req, res) => {
  try {
    const { driverIds, hourlyRate, overtimeRate } = req.body;

    // Update drivers
    const updates = driverIds.map(id =>
      prisma.driver.update({
        where: { id },
        data: {
          ...(hourlyRate !== undefined && { hourlyRate: parseFloat(hourlyRate) }),
          ...(overtimeRate !== undefined && { overtimeRate: parseFloat(overtimeRate) })
        }
      })
    );

    await Promise.all(updates);

    // If hourly rate changed, update all expenses for these drivers
    if (hourlyRate !== undefined) {
      for (const driverId of driverIds) {
        const expenses = await prisma.expense.findMany({
          where: {
            driverId,
            hours: { not: null }
          }
        });

        const expenseUpdates = expenses.map(expense =>
          prisma.expense.update({
            where: { id: expense.id },
            data: {
              amount: parseFloat(expense.hours) * parseFloat(hourlyRate)
            }
          })
        );

        await Promise.all(expenseUpdates);
      }
    }

    res.json({ message: 'Rates updated successfully' });
  } catch (error) {
    console.error('Bulk update error:', error);
    res.status(500).json({ error: 'Failed to update rates' });
  }
});

export default router;
