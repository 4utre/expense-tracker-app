import express from 'express';
import prisma from '../lib/prisma.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Transform Prisma camelCase to frontend snake_case
const transformSetting = (setting) => ({
  id: setting.id,
  setting_key: setting.settingKey,
  setting_value: setting.settingValue,
  setting_category: setting.settingCategory,
  description: setting.description,
  created_date: setting.createdDate,
  created_by: setting.createdBy
});

router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const settings = await prisma.appSetting.findMany();
    res.json(settings.map(transformSetting));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

router.get('/:key', async (req, res) => {
  try {
    const setting = await prisma.appSetting.findUnique({
      where: { settingKey: req.params.key }
    });
    if (!setting) {
      return res.status(404).json({ error: 'Setting not found' });
    }
    res.json(transformSetting(setting));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch setting' });
  }
});

router.post('/', async (req, res) => {
  try {
    // Accept both camelCase and snake_case
    const settingKey = req.body.settingKey || req.body.setting_key;
    const settingValue = req.body.settingValue || req.body.setting_value;
    const settingCategory = req.body.settingCategory || req.body.setting_category;
    const description = req.body.description;
    
    const setting = await prisma.appSetting.upsert({
      where: { settingKey },
      update: {
        settingValue,
        ...(settingCategory && { settingCategory }),
        ...(description && { description })
      },
      create: {
        settingKey,
        settingValue,
        settingCategory: settingCategory || 'general',
        description,
        createdBy: req.user.email
      }
    });
    
    res.json(transformSetting(setting));
  } catch (error) {
    console.error('Save setting error:', error);
    res.status(500).json({ error: 'Failed to save setting' });
  }
});

router.delete('/:key', async (req, res) => {
  try {
    await prisma.appSetting.delete({
      where: { settingKey: req.params.key }
    });
    res.json({ message: 'Setting deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete setting' });
  }
});

export default router;
