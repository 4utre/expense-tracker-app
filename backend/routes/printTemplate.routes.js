import express from 'express';
import prisma from '../lib/prisma.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Transform Prisma camelCase to frontend snake_case
const transformTemplate = (template) => ({
  id: template.id,
  template_name: template.templateName,
  template_type: template.templateType,
  html_content: template.htmlContent,
  css_content: template.cssContent,
  is_default: template.isDefault,
  description: template.description,
  created_date: template.createdDate,
  created_by: template.createdBy
});

router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const templates = await prisma.printTemplate.findMany({
      orderBy: { createdDate: 'desc' }
    });
    res.json(templates.map(transformTemplate));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const template = await prisma.printTemplate.findUnique({
      where: { id: req.params.id }
    });
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    res.json(transformTemplate(template));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch template' });
  }
});

router.post('/', async (req, res) => {
  try {
    // Accept both camelCase and snake_case
    const templateName = req.body.templateName || req.body.template_name;
    const templateType = req.body.templateType || req.body.template_type;
    const htmlContent = req.body.htmlContent || req.body.html_content;
    const cssContent = req.body.cssContent || req.body.css_content;
    const isDefault = req.body.isDefault !== undefined ? req.body.isDefault : req.body.is_default;
    const description = req.body.description;
    
    // If setting as default, unset other defaults of same type
    if (isDefault) {
      await prisma.printTemplate.updateMany({
        where: { templateType, isDefault: true },
        data: { isDefault: false }
      });
    }
    
    const template = await prisma.printTemplate.create({
      data: {
        templateName,
        templateType,
        htmlContent,
        cssContent,
        isDefault: isDefault || false,
        description,
        createdBy: req.user.email
      }
    });
    
    res.status(201).json(transformTemplate(template));
  } catch (error) {
    console.error('Create template error:', error);
    res.status(500).json({ error: 'Failed to create template' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const data = {};
    // Accept both camelCase and snake_case
    const templateName = req.body.templateName || req.body.template_name;
    const templateType = req.body.templateType || req.body.template_type;
    const htmlContent = req.body.htmlContent || req.body.html_content;
    const cssContent = req.body.cssContent || req.body.css_content;
    const isDefault = req.body.isDefault !== undefined ? req.body.isDefault : req.body.is_default;
    const description = req.body.description;
    
    if (templateName) data.templateName = templateName;
    if (templateType) data.templateType = templateType;
    if (htmlContent) data.htmlContent = htmlContent;
    if (cssContent) data.cssContent = cssContent;
    if (description !== undefined) data.description = description;
    if (isDefault !== undefined) data.isDefault = Boolean(isDefault);
    
    const template = await prisma.printTemplate.update({
      where: { id: req.params.id },
      data
    });
    
    res.json(transformTemplate(template));
  } catch (error) {
    console.error('Update template error:', error);
    res.status(500).json({ error: 'Failed to update template' });
  }
});

router.post('/:id/set-default', async (req, res) => {
  try {
    const template = await prisma.printTemplate.findUnique({
      where: { id: req.params.id }
    });
    
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    // Unset other defaults of same type
    await prisma.printTemplate.updateMany({
      where: { templateType: template.templateType, isDefault: true },
      data: { isDefault: false }
    });
    
    // Set this as default
    const updatedTemplate = await prisma.printTemplate.update({
      where: { id: req.params.id },
      data: { isDefault: true }
    });
    
    res.json(transformTemplate(updatedTemplate));
  } catch (error) {
    console.error('Set default error:', error);
    res.status(500).json({ error: 'Failed to set default template' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await prisma.printTemplate.delete({
      where: { id: req.params.id }
    });
    res.json({ message: 'Template deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete template' });
  }
});

export default router;
