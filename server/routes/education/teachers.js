const express = require('express');
const router = express.Router();
const logger = require('../../utils/logger');
const { authMiddleware, checkRole } = require('../../middleware/auth');
const validate = require('../../middleware/validation');
const { createTeacherSchema, updateTeacherSchema } = require('../../utils/validators');
const teacherService = require('../../services/teacherService');
const { prisma } = require('../../utils/prisma');

router.get('/', authMiddleware, checkRole(['admin']), async (req, res) => {
  try {
    const teachers = await teacherService.listTeachers();
    res.json(teachers);
  } catch (err) {
    logger.error('Error fetching teachers', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ========== /me routes (MUST be before /:id) ==========

router.get('/me', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'هذه الميزة متاحة للمعلمين فقط' });
    }
    const teacher = await teacherService.getTeacherById(req.user.id);
    res.json(teacher);
  } catch (err) {
    if (err.statusCode === 404) return res.status(404).json({ error: 'Teacher not found' });
    logger.error('Error fetching own teacher profile', err, { id: req.user.id });
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Self-service profile update — teacher can change own name and phone1 only.
// (This route previously did not exist, so PUT /teachers/me returned 404 and
// the profile page showed "تعذر تحديث الاسم".)
router.put('/me', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ error: 'هذه الميزة متاحة للمعلمين فقط' });
    }
    const { name, phone1 } = req.body;
    if (name !== undefined && (!String(name).trim() || String(name).trim().length < 2)) {
      return res.status(400).json({ error: 'الاسم يجب أن يكون حرفين على الأقل' });
    }
    if (phone1 !== undefined && phone1 !== '' && !/^[0-9]{11}$/.test(String(phone1))) {
      return res.status(400).json({ error: 'رقم الهاتف يجب أن يكون 11 خانة' });
    }
    const teacher = await teacherService.updateOwnProfile(
      req.user.id,
      { name, phone1: phone1 ?? undefined },
      req.user,
    );
    res.json(teacher);
  } catch (err) {
    if (err.statusCode === 404) return res.status(404).json({ error: 'Teacher not found' });
    logger.error('Error updating own teacher profile', err, { id: req.user.id });
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/me/payment-settings', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'هذه الميزة متاحة للمعلمين فقط' });
    }
    const setting = await prisma.teacherPaymentSetting.findUnique({
      where: { teacherId: req.user.id },
    });
    res.json(setting || null);
  } catch (err) {
    logger.error('Error fetching payment settings', err, { teacherId: req.user.id });
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.put('/me/payment-settings', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'هذه الميزة متاحة للمعلمين فقط' });
    }
    const { method, walletProvider, walletPhone, instapayId, accountHolder, instapayPhone, iban, bankName } = req.body;

    if (!method || !['wallet', 'instapay', 'bank_transfer'].includes(method)) {
      return res.status(400).json({ error: 'طريقة الدفع غير صحيحة' });
    }

    if (method === 'wallet') {
      if (!walletProvider || !['vodafone', 'etisalat', 'orange'].includes(walletProvider)) {
        return res.status(400).json({ error: 'يجب اختيار محفظة إلكترونية صحيحة' });
      }
      if (!walletPhone || !/^[0-9]{11}$/.test(walletPhone)) {
        return res.status(400).json({ error: 'رقم الهاتف يجب أن يكون 11 خانة' });
      }
    }

    if (method === 'instapay') {
      if (!instapayId || !instapayId.trim()) {
        return res.status(400).json({ error: 'يجب إدخال معرف الانستا باي' });
      }
      if (!accountHolder || !accountHolder.trim()) {
        return res.status(400).json({ error: 'يجب إدخال اسم صاحب الحساب' });
      }
      if (!instapayPhone || !/^[0-9]{11}$/.test(instapayPhone)) {
        return res.status(400).json({ error: 'رقم الهاتف المربوط بالانستا باي يجب أن يكون 11 خانة' });
      }
    }

    if (method === 'bank_transfer') {
      if (!accountHolder || !accountHolder.trim()) {
        return res.status(400).json({ error: 'يجب إدخال اسم صاحب الحساب' });
      }
      if (!iban || !iban.trim()) {
        return res.status(400).json({ error: 'يجب إدخال رقم الايبان' });
      }
      if (!bankName || !bankName.trim()) {
        return res.status(400).json({ error: 'يجب إدخال اسم البنك' });
      }
    }

    const data = {
      method,
      walletProvider: method === 'wallet' ? walletProvider : null,
      walletPhone: method === 'wallet' ? walletPhone : null,
      instapayId: method === 'instapay' ? instapayId?.trim() : null,
      accountHolder: (method === 'instapay' || method === 'bank_transfer') ? accountHolder?.trim() : null,
      instapayPhone: method === 'instapay' ? instapayPhone : null,
      iban: method === 'bank_transfer' ? iban?.trim() : null,
      bankName: method === 'bank_transfer' ? bankName?.trim() : null,
    };

    const setting = await prisma.teacherPaymentSetting.upsert({
      where: { teacherId: req.user.id },
      update: data,
      create: { ...data, teacherId: req.user.id },
    });

    res.json(setting);
  } catch (err) {
    logger.error('Error saving payment settings', err, { teacherId: req.user.id });
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.delete('/me/payment-settings', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'هذه الميزة متاحة للمعلمين فقط' });
    }
    await prisma.teacherPaymentSetting.deleteMany({
      where: { teacherId: req.user.id },
    });
    res.json({ message: 'تم حذف إعدادات الدفع' });
  } catch (err) {
    logger.error('Error deleting payment settings', err, { teacherId: req.user.id });
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ========== /:id routes (MUST be after /me routes) ==========

router.get('/:id', authMiddleware, checkRole(['admin']), async (req, res) => {
  try {
    const teacher = await teacherService.getTeacherById(req.params.id);
    res.json(teacher);
  } catch (err) {
    if (err.statusCode === 404) return res.status(404).json({ error: 'Teacher not found' });
    logger.error('Error fetching teacher', err, { id: req.params.id });
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Resolve a chat participant's display name across all identity tables.
// Mirrors the sender-name resolution in routes/communication/chat.js.
async function resolveChatUserName(userId) {
  if (!userId) return null;
  const found = await prisma.user.findUnique({ where: { id: userId }, select: { name: true } })
    ?? await prisma.teacher.findUnique({ where: { id: userId }, select: { name: true } })
    ?? await prisma.parent.findUnique({ where: { id: userId }, select: { name: true } })
    ?? await prisma.student.findUnique({ where: { id: userId }, select: { name: true } })
    ?? await prisma.chatProfile.findUnique({ where: { id: userId }, select: { name: true } });
  return found ? found.name : null;
}

// ========== /:id/activity — detailed activity summary for a teacher ==========
router.get('/:id/activity', authMiddleware, checkRole(['admin']), async (req, res) => {
  try {
    const teacher = await prisma.teacher.findUnique({ where: { id: req.params.id } });
    if (!teacher) return res.status(404).json({ error: 'Teacher not found' });

    const [lastSession, account, lastMessage] = await Promise.all([
      prisma.session.findFirst({
        where: { status: 'completed', OR: [{ teacherId: req.params.id }, { teacherName: teacher.name }] },
        orderBy: { createdAt: 'desc' },
        select: { studentName: true, subject: true, date: true, time: true, createdAt: true },
      }),
      prisma.account.findFirst({
        where: {
          OR: [
            { accountType: 'TEACHER', entityId: req.params.id },
            ...(teacher.username ? [{ username: teacher.username }] : []),
            ...(teacher.email ? [{ email: teacher.email }] : []),
          ]
        },
        select: { lastLoginAt: true, updatedAt: true },
        orderBy: { lastLoginAt: { sort: 'desc', nulls: 'last' } },
      }),
      prisma.message.findFirst({
        where: { senderId: req.params.id },
        orderBy: { timestamp: 'desc' },
        include: { conversation: { include: { members: { select: { userId: true } } } } },
      }),
    ]);

    let lastChat = null;
    if (lastMessage) {
      const conv = lastMessage.conversation;
      const otherIds = (conv.members || []).map(m => m.userId).filter(uid => uid !== req.params.id);
      const withName = conv.isGroup ? conv.name || null : await resolveChatUserName(otherIds[0]);
      lastChat = {
        withName,
        conversationName: conv.name || null,
        isGroup: !!conv.isGroup,
        content: lastMessage.content.length > 60 ? `${lastMessage.content.substring(0, 60)}...` : lastMessage.content,
        timestamp: lastMessage.timestamp,
      };
    }

    res.json({
      lastSession,
      lastLoginAt: account?.lastLoginAt || account?.updatedAt || lastSession?.createdAt || lastMessage?.timestamp || null,
      lastChat,
    });
  } catch (err) {
    logger.error('Error fetching teacher activity', err, { id: req.params.id });
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/:id/payment-settings', authMiddleware, checkRole(['admin']), async (req, res) => {
  try {
    const setting = await prisma.teacherPaymentSetting.findUnique({
      where: { teacherId: req.params.id },
    });
    res.json(setting || null);
  } catch (err) {
    logger.error('Error fetching teacher payment settings', err, { teacherId: req.params.id });
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/', authMiddleware, checkRole(['admin']), validate(createTeacherSchema), async (req, res) => {
  try {
    const teacher = await teacherService.createTeacher(req.body, req.user);
    res.status(201).json(teacher);
  } catch (err) {
    if (err.statusCode === 400 || err.code === 'P2002') return res.status(400).json({ error: err.message || 'اسم المستخدم موجود بالفعل، يرجى اختيار اسم آخر.' });
    logger.error('Error adding teacher', err, { name: req.body.name });
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.put('/:id', authMiddleware, checkRole(['admin']), validate(updateTeacherSchema), async (req, res) => {
  try {
    const teacher = await teacherService.updateTeacher(req.params.id, req.body, req.user);
    res.json(teacher);
  } catch (err) {
    if (err.statusCode === 404) return res.status(404).json({ error: 'Teacher not found' });
    if (err.code === 'P2002') return res.status(400).json({ error: 'اسم المستخدم موجود بالفعل، يرجى اختيار اسم آخر.' });
    logger.error('Error updating teacher', err, { id: req.params.id });
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.delete('/:id', authMiddleware, checkRole(['admin']), async (req, res) => {
  try {
    await teacherService.deleteTeacher(req.params.id, req.user);
    res.json({ message: 'Deleted' });
  } catch (err) {
    if (err.statusCode === 404) return res.status(404).json({ error: 'Teacher not found' });
    logger.error('Error deleting teacher', err, { id: req.params.id });
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.delete('/', authMiddleware, checkRole(['admin']), async (req, res) => {
  try {
    const count = await teacherService.deleteAllTeachers(req.user);
    res.json({ message: 'All teachers deleted', count });
  } catch (err) {
    logger.error('Error deleting all teachers', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/:id/restore', authMiddleware, checkRole(['admin']), async (req, res) => {
  try {
    const teacher = await teacherService.restoreTeacher(req.params.id, req.user);
    res.json(teacher);
  } catch (err) {
    if (err.statusCode === 404) return res.status(404).json({ error: 'Teacher not found' });
    if (err.statusCode === 400) return res.status(400).json({ error: err.message });
    logger.error('Error restoring teacher', err, { id: req.params.id });
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = { teacherRouter: router };
