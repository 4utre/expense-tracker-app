import express from 'express';
import prisma from '../lib/prisma.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Transform Prisma camelCase to frontend snake_case
const transformEmployee = (employee) => {
  let assignedMonths = [];
  try {
    if (Array.isArray(employee.assignedMonths)) {
      assignedMonths = employee.assignedMonths;
    } else if (employee.assignedMonths) {
      // Try to parse as JSON, if it fails, treat as empty array
      const parsed = JSON.parse(employee.assignedMonths);
      assignedMonths = Array.isArray(parsed) ? parsed : [];
    }
  } catch (e) {
    // If JSON parsing fails, return empty array
    assignedMonths = [];
  }
  
  return {
    id: employee.id,
    employee_name: employee.employeeName,
    employee_number: employee.employeeNumber,
    salary: employee.salary ? Number(employee.salary) : 0,
    currency: employee.currency,
    payment_date: employee.paymentDate ? new Date(employee.paymentDate).toISOString().split('T')[0] : null,
    is_paid: employee.isPaid,
    assigned_months: assignedMonths,
    created_date: employee.createdDate,
    created_by: employee.createdBy
  };
};

router.use(authenticateToken);

// Get all employees
router.get('/', async (req, res) => {
  try {
    const employees = await prisma.employee.findMany({
      orderBy: { createdDate: 'desc' }
    });
    res.json(employees.map(transformEmployee));
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
});

// Get single employee
router.get('/:id', async (req, res) => {
  try {
    const employee = await prisma.employee.findUnique({
      where: { id: req.params.id }
    });
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    res.json(transformEmployee(employee));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch employee' });
  }
});

// Create employee
router.post('/', async (req, res) => {
  try {
    // Accept both camelCase and snake_case
    const employeeName = req.body.employeeName || req.body.employee_name;
    const employeeNumber = req.body.employeeNumber || req.body.employee_number;
    const salary = req.body.salary;
    const currency = req.body.currency;
    const paymentDate = req.body.paymentDate || req.body.payment_date;
    const isPaid = req.body.isPaid || req.body.is_paid;
    const assignedMonths = req.body.assignedMonths || req.body.assigned_months;
    
    const employee = await prisma.employee.create({
      data: {
        employeeName,
        employeeNumber,
        salary: parseFloat(salary),
        currency: currency || 'IQD',
        paymentDate: new Date(paymentDate),
        isPaid: isPaid || false,
        assignedMonths: JSON.stringify(assignedMonths || []),
        createdBy: req.user.email
      }
    });
    
    res.status(201).json(transformEmployee(employee));
  } catch (error) {
    console.error('Create employee error:', error);
    res.status(500).json({ error: 'Failed to create employee' });
  }
});

// Update employee
router.put('/:id', async (req, res) => {
  try {
    const data = {};
    // Accept both camelCase and snake_case
    const employeeName = req.body.employeeName || req.body.employee_name;
    const employeeNumber = req.body.employeeNumber || req.body.employee_number;
    const salary = req.body.salary;
    const currency = req.body.currency;
    const paymentDate = req.body.paymentDate || req.body.payment_date;
    const isPaid = req.body.isPaid !== undefined ? req.body.isPaid : req.body.is_paid;
    const assignedMonths = req.body.assignedMonths || req.body.assigned_months;
    
    if (employeeName) data.employeeName = employeeName;
    if (employeeNumber) data.employeeNumber = employeeNumber;
    if (salary !== undefined) data.salary = parseFloat(salary);
    if (currency) data.currency = currency;
    if (paymentDate) data.paymentDate = new Date(paymentDate);
    if (isPaid !== undefined) data.isPaid = Boolean(isPaid);
    if (assignedMonths !== undefined) data.assignedMonths = JSON.stringify(assignedMonths);
    
    const employee = await prisma.employee.update({
      where: { id: req.params.id },
      data
    });
    
    res.json(transformEmployee(employee));
  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json({ error: 'Failed to update employee' });
  }
});

// Delete employee
router.delete('/:id', async (req, res) => {
  try {
    await prisma.employee.delete({
      where: { id: req.params.id }
    });
    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({ error: 'Failed to delete employee' });
  }
});

export default router;
