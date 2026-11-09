const express = require('express');
const router = express.Router();
const logger = require('../../utils/logger');
const { authMiddleware, checkRole } = require('../../middleware/auth');
const { prisma } = require('../../utils/prisma');

/**
 * Middleware: Verify that user is authenticated and is a teacher or admin.
 * If user is a teacher, req.teacherId will be their teacher id.
 */
function requireTeacherOrAdmin(req, res, next) {
  if (!req.user || (req.user.role !== 'teacher' && req.user.role !== 'admin')) {
    return res.status(403).json({ error: 'الوصول مقتصر على حسابات المعلمات فقط' });
  }
  next();
}

/**
 * GET /whiteboards
 * List all whiteboards belonging to the authenticated teacher.
 */
router.get('/', authMiddleware, requireTeacherOrAdmin, async (req, res) => {
  try {
    const teacherId = req.user.id;
    const whiteboards = await prisma.teacherWhiteboard.findMany({
      where: { teacherId },
      select: {
        id: true,
        teacherId: true,
        title: true,
        thumbnail: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: 'desc' },
    });
    res.json(whiteboards);
  } catch (err) {
    logger.error('Error listing whiteboards', err, { teacherId: req.user?.id });
    res.status(500).json({ error: 'تعذر جلب قائمة السبورات' });
  }
});

/**
 * GET /whiteboards/:id
 * Retrieve full whiteboard data including pages_data for editing.
 */
router.get('/:id', authMiddleware, requireTeacherOrAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const teacherId = req.user.id;

    const whiteboard = await prisma.teacherWhiteboard.findUnique({
      where: { id },
    });

    if (!whiteboard) {
      return res.status(404).json({ error: 'السبورة غير موجودة' });
    }

    // Role check: Only the owner teacher (or admin in inspection mode) can access
    if (req.user.role !== 'admin' && whiteboard.teacherId !== teacherId) {
      return res.status(403).json({ error: 'غير مصرح لك بالوصول إلى هذه السبورة' });
    }

    res.json(whiteboard);
  } catch (err) {
    logger.error('Error fetching whiteboard details', err, { id: req.params.id });
    res.status(500).json({ error: 'تعذر استرجاع بيانات السبورة' });
  }
});

/**
 * POST /whiteboards
 * Create a new whiteboard.
 */
router.post('/', authMiddleware, requireTeacherOrAdmin, async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { title, pagesData, thumbnail } = req.body;

    // Validate size limit (max 10MB payload)
    const rawPagesData = typeof pagesData === 'string' ? pagesData : JSON.stringify(pagesData || []);
    if (rawPagesData.length > 10 * 1024 * 1024) {
      return res.status(400).json({ error: 'حجم بيانات السبورة يتجاوز الحد المسموح به (10 ميجابايت)' });
    }

    const cleanTitle = (title && String(title).trim()) ? String(title).trim().substring(0, 100) : 'سبورة جديدة';

    const newBoard = await prisma.teacherWhiteboard.create({
      data: {
        teacherId,
        title: cleanTitle,
        pagesData: rawPagesData,
        thumbnail: thumbnail ? String(thumbnail).substring(0, 500000) : null,
      },
    });

    res.status(201).json(newBoard);
  } catch (err) {
    logger.error('Error creating whiteboard', err, { teacherId: req.user?.id });
    res.status(500).json({ error: 'تعذر إنشاء السبورة' });
  }
});

/**
 * PUT /whiteboards/:id
 * Update an existing whiteboard (autosave & manual save).
 */
router.put('/:id', authMiddleware, requireTeacherOrAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const teacherId = req.user.id;
    const { title, pagesData, thumbnail } = req.body;

    const existing = await prisma.teacherWhiteboard.findUnique({
      where: { id },
      select: { id: true, teacherId: true },
    });

    if (!existing) {
      return res.status(404).json({ error: 'السبورة غير موجودة' });
    }

    if (req.user.role !== 'admin' && existing.teacherId !== teacherId) {
      return res.status(403).json({ error: 'غير مصرح لك بتعديل هذه السبورة' });
    }

    const updateData = {};
    if (title !== undefined) {
      updateData.title = String(title).trim().substring(0, 100) || 'سبورة بدون عنوان';
    }
    if (pagesData !== undefined) {
      const rawPagesData = typeof pagesData === 'string' ? pagesData : JSON.stringify(pagesData);
      if (rawPagesData.length > 10 * 1024 * 1024) {
        return res.status(400).json({ error: 'حجم بيانات السبورة يتجاوز الحد المسموح به' });
      }
      updateData.pagesData = rawPagesData;
    }
    if (thumbnail !== undefined) {
      updateData.thumbnail = thumbnail ? String(thumbnail).substring(0, 500000) : null;
    }

    const updated = await prisma.teacherWhiteboard.update({
      where: { id },
      data: updateData,
    });

    res.json(updated);
  } catch (err) {
    logger.error('Error updating whiteboard', err, { id: req.params.id });
    res.status(500).json({ error: 'تعذر حفظ بيانات السبورة' });
  }
});

/**
 * POST /whiteboards/:id/duplicate
 * Duplicate an existing whiteboard.
 */
router.post('/:id/duplicate', authMiddleware, requireTeacherOrAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const teacherId = req.user.id;

    const source = await prisma.teacherWhiteboard.findUnique({
      where: { id },
    });

    if (!source) {
      return res.status(404).json({ error: 'السبورة غير موجودة' });
    }

    if (req.user.role !== 'admin' && source.teacherId !== teacherId) {
      return res.status(403).json({ error: 'غير مصرح لك بنسخ هذه السبورة' });
    }

    const duplicate = await prisma.teacherWhiteboard.create({
      data: {
        teacherId,
        title: `${source.title} (نسخة)`,
        pagesData: source.pagesData,
        thumbnail: source.thumbnail,
      },
    });

    res.status(201).json(duplicate);
  } catch (err) {
    logger.error('Error duplicating whiteboard', err, { id: req.params.id });
    res.status(500).json({ error: 'تعذر تكرار السبورة' });
  }
});

/**
 * DELETE /whiteboards/:id
 * Delete a whiteboard.
 */
router.delete('/:id', authMiddleware, requireTeacherOrAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const teacherId = req.user.id;

    const existing = await prisma.teacherWhiteboard.findUnique({
      where: { id },
      select: { id: true, teacherId: true },
    });

    if (!existing) {
      return res.status(404).json({ error: 'السبورة غير موجودة' });
    }

    if (req.user.role !== 'admin' && existing.teacherId !== teacherId) {
      return res.status(403).json({ error: 'غير مصرح لك بحذف هذه السبورة' });
    }

    await prisma.teacherWhiteboard.delete({
      where: { id },
    });

    res.json({ success: true, message: 'تم حذف السبورة بنجاح' });
  } catch (err) {
    logger.error('Error deleting whiteboard', err, { id: req.params.id });
    res.status(500).json({ error: 'تعذر حذف السبورة' });
  }
});

module.exports = { whiteboardRouter: router };
