import express from 'express';
import nodemailer from 'nodemailer';
import prisma from '../lib/prisma.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();
router.use(authenticateToken);

// Export database as JSON or SQL
router.get('/export', async (req, res) => {
  try {
    const { format = 'json', month } = req.query;
    
    // Build filter for month if provided
    const dateFilter = month ? {
      expenseDate: {
        gte: new Date(`${month}-01`),
        lte: new Date(new Date(month).getFullYear(), new Date(month).getMonth() + 1, 0)
      }
    } : {};

    // Fetch all data
    const [drivers, expenses, employees, expenseTypes, appSettings, printTemplates] = await Promise.all([
      prisma.driver.findMany(),
      prisma.expense.findMany({ where: dateFilter }),
      prisma.employee.findMany(),
      prisma.expenseType.findMany(),
      prisma.appSetting.findMany(),
      prisma.printTemplate.findMany()
    ]);

    const data = {
      drivers,
      expenses,
      employees,
      expenseTypes,
      appSettings,
      printTemplates,
      exportedAt: new Date().toISOString(),
      month: month || 'all'
    };

    if (format === 'sql') {
      // Generate SQL
      let sql = `-- Expense Tracking System Database Backup\n`;
      sql += `-- Generated: ${new Date().toLocaleString()}\n`;
      sql += `-- Month: ${month || 'All'}\n\n`;

      // Generate SQL for each table
      const generateInsert = (table, rows) => {
        if (!rows.length) return '';
        let statements = `-- ${table} Table\n`;
        for (const row of rows) {
          const columns = Object.keys(row);
          const values = Object.values(row).map(v => {
            if (v === null) return 'NULL';
            if (typeof v === 'string') return `'${v.replace(/'/g, "''")}'`;
            if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE';
            if (v instanceof Date) return `'${v.toISOString()}'`;
            if (Array.isArray(v)) return `'{${v.join(',')}}'`;
            return v;
          });
          statements += `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${values.join(', ')});\n`;
        }
        return statements + '\n';
      };

      sql += generateInsert('drivers', drivers);
      sql += generateInsert('expenses', expenses);
      sql += generateInsert('employees', employees);
      sql += generateInsert('expense_types', expenseTypes);
      sql += generateInsert('app_settings', appSettings);
      sql += generateInsert('print_templates', printTemplates);

      res.setHeader('Content-Type', 'application/sql');
      res.setHeader('Content-Disposition', `attachment; filename=backup_${Date.now()}.sql`);
      res.send(sql);
    } else {
      // Return JSON
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=backup_${Date.now()}.json`);
      res.json(data);
    }
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Export failed' });
  }
});

// Send backup via email
router.post('/email', async (req, res) => {
  try {
    const { email, format = 'json', month } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email address required' });
    }

    // Get backup data
    const dateFilter = month ? {
      expenseDate: {
        gte: new Date(`${month}-01`),
        lte: new Date(new Date(month).getFullYear(), new Date(month).getMonth() + 1, 0)
      }
    } : {};

    const [drivers, expenses, employees, expenseTypes, appSettings, printTemplates] = await Promise.all([
      prisma.driver.findMany(),
      prisma.expense.findMany({ where: dateFilter }),
      prisma.employee.findMany(),
      prisma.expenseType.findMany(),
      prisma.appSetting.findMany(),
      prisma.printTemplate.findMany()
    ]);

    const data = {
      drivers,
      expenses,
      employees,
      expenseTypes,
      appSettings,
      printTemplates,
      exportedAt: new Date().toISOString(),
      month: month || 'all'
    };

    // Create transporter
    const transporter = nodemailer.createTransporter({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    // Prepare attachment
    const content = format === 'json' ? JSON.stringify(data, null, 2) : generateSQL(data);
    const filename = `backup_${Date.now()}.${format === 'json' ? 'json' : 'sql'}`;

    // Send email
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: `Database Backup - ${new Date().toLocaleDateString()}`,
      text: `Your database backup is attached.\n\nTotal Records:\n- Drivers: ${drivers.length}\n- Expenses: ${expenses.length}\n- Employees: ${employees.length}\n- Expense Types: ${expenseTypes.length}`,
      attachments: [
        {
          filename,
          content
        }
      ]
    });

    res.json({ message: 'Backup sent to email successfully' });
  } catch (error) {
    console.error('Email backup error:', error);
    res.status(500).json({ error: 'Failed to send backup email' });
  }
});

function generateSQL(data) {
  let sql = `-- Expense Tracking System Database Backup\n`;
  sql += `-- Generated: ${new Date().toLocaleString()}\n\n`;

  const generateInsert = (table, rows) => {
    if (!rows.length) return '';
    let statements = `-- ${table} Table\n`;
    for (const row of rows) {
      const columns = Object.keys(row);
      const values = Object.values(row).map(v => {
        if (v === null) return 'NULL';
        if (typeof v === 'string') return `'${v.replace(/'/g, "''")}'`;
        if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE';
        if (v instanceof Date) return `'${v.toISOString()}'`;
        if (Array.isArray(v)) return `'{${v.join(',')}}'`;
        return v;
      });
      statements += `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${values.join(', ')});\n`;
    }
    return statements + '\n';
  };

  sql += generateInsert('drivers', data.drivers);
  sql += generateInsert('expenses', data.expenses);
  sql += generateInsert('employees', data.employees);
  sql += generateInsert('expense_types', data.expenseTypes);
  sql += generateInsert('app_settings', data.appSettings);
  sql += generateInsert('print_templates', data.printTemplates);

  return sql;
}

export default router;
