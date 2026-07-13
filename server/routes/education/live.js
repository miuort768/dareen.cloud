const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../../middleware/auth');
const ResponseHandler = require('../../utils/responseHandler');
const logger = require('../../utils/logger');
const { prisma } = require('../../utils/prisma');
const crypto = require('crypto');

const genId = () => crypto.randomBytes(16).toString('hex');

const MEETING_PROVIDERS = ['google_meet', 'zoom', 'custom'];

function validateMeetingUrl(provider, url) {
  if (!url || typeof url !== 'string') {
    return 'رابط الاجتماع مطلوب';
  }
  url = url.trim();
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:') {
      return 'الرابط يجب أن يبدأ بـ https';
    }
    if (provider === 'google_meet' && !url.startsWith('https://meet.google.com/')) {
      return 'رابط Google Meet يجب أن يبدأ بـ https://meet.google.com/';
    }
    if (provider === 'zoom' && !url.includes('.zoom.us/')) {
      return 'رابط Zoom يجب أن يحتوي على .zoom.us/';
    }
  } catch {
    return 'الرابط غير صالح. يجب أن يكون رابطاً صحيحاً';
  }
  return null;
}

router.get('/active', authMiddleware, async (req, res) => {
  try {
    const { id, role, permissions } = req.user;
    let where = { status: 'active' };

    if (permissions?.includes('*')) {
    } else if (role === 'teacher') {
      where.teacherId = id;
    } else if (role === 'student') {
      const enrollments = await prisma.enrollment.findMany({
        where: { studentId: id },
        select: { teacherId: true }
      });
      const teacherIds = enrollments.map(e => e.teacherId).filter(Boolean);
      where.OR = [
        { targetStudentId: id },
        { targetStudentId: null, teacherId: { in: teacherIds } }
      ];
    } else if (role === 'parent') {
      const children = await prisma.student.findMany({
        where: { parentId: id },
        select: { id: true }
      });
      const childIds = children.map(c => c.id);
      const enrollments = await prisma.enrollment.findMany({
        where: { studentId: { in: childIds } },
        select: { teacherId: true }
      });
      const teacherIds = enrollments.map(e => e.teacherId).filter(Boolean);
      where.OR = [
        { targetStudentId: { in: childIds } },
        { targetStudentId: null, teacherId: { in: teacherIds } }
      ];
    } else {
      return res.json([]);
    }

    const sessions = await prisma.liveSession.findMany({
      where,
      orderBy: { startedAt: 'desc' }
    });
    res.json(sessions);
  } catch (err) {
    ResponseHandler.serverError(res, err, 'Fetch active live sessions');
  }
});

router.post('/start', authMiddleware, async (req, res) => {
  if (!['teacher', 'admin'].includes(req.user.role) && !req.user.permissions?.includes('*')) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    const { title, subject, meetingProvider, meetingUrl, targetStudentId } = req.body;
    const provider = meetingProvider || 'google_meet';

    if (!MEETING_PROVIDERS.includes(provider)) {
      return res.status(400).json({ error: 'نوع الاجتماع غير مدعوم. الأنواع المتاحة: google_meet, zoom, custom' });
    }

    const urlError = validateMeetingUrl(provider, meetingUrl);
    if (urlError) {
      return res.status(400).json({ error: urlError });
    }

    const existing = await prisma.liveSession.findFirst({
      where: { teacherId: req.user.id, status: 'active' }
    });
    if (existing) {
      return res.status(409).json({ error: 'لديك حصة مباشرة جارية بالفعل' });
    }

    const id = genId();
    const teacherId = req.user.id;
    const teacherName = req.user.teacherName || req.user.name || req.user.username || 'معلمة';

    let meetingCode = null;
    if (provider === 'google_meet') {
      const match = meetingUrl.match(/meet\.google\.com\/([a-z\-]+)/);
      if (match) meetingCode = match[1];
    } else if (provider === 'zoom') {
      const match = meetingUrl.match(/\/j\/(\d+)/);
      if (match) meetingCode = match[1];
    }

    await prisma.liveSession.create({
      data: {
        id, teacherId, teacherName,
        title: title || 'حصة مباشرة',
        subject: subject || '',
        meetingProvider: provider,
        meetingUrl: meetingUrl.trim(),
        meetingCode,
        isExternalMeeting: true,
        targetStudentId: targetStudentId || '',
      }
    });

    const io = req.app.get('socketio');
    if (io) {
      io.to(`user_${teacherId}`).emit('live_session_started', { id, teacherName, meetingUrl });

      const io2 = req.app.get('socketio');
      if (targetStudentId) {
        const studentNotifId = genId();
        const msg = `بدأت المعلمة ${teacherName} حصة ${subject || ''} الآن. انضمي عبر الرابط: ${meetingUrl}`;
        try {
          await prisma.notification.create({
            data: {
              id: studentNotifId,
              senderId: teacherId,
              receiverId: targetStudentId,
              senderName: teacherName,
              title: 'حصة مباشرة بدأت!',
              message: msg,
              type: 'live',
              time: new Date().toISOString(),
              link: meetingUrl,
            }
          });
          io2.to(`user_${targetStudentId}`).emit('notification', {
            id: studentNotifId, title: 'حصة مباشرة بدأت!', message: msg, type: 'live', link: meetingUrl
          });
          io2.to(`user_${targetStudentId}`).emit('session_invite', {
            teacherName, subject, sessionId: id, meetingUrl, meetingProvider: provider
          });

          const student = await prisma.student.findUnique({
            where: { id: targetStudentId },
            select: { parentId: true }
          });
          if (student?.parentId) {
            const parentNotifId = genId();
            const parentMsg = `بدأت الحصة المباشرة لابنكم/ابنتكم في مادة ${subject || ''} مع المعلمة ${teacherName}.`;
            await prisma.notification.create({
              data: {
                id: parentNotifId,
                senderId: teacherId,
                receiverId: student.parentId,
                senderName: teacherName,
                title: 'تنبيه حصة مباشرة لابنكم',
                message: parentMsg,
                type: 'live',
                time: new Date().toISOString(),
                link: meetingUrl,
              }
            });
            io2.to(`user_${student.parentId}`).emit('notification', {
              id: parentNotifId, title: 'تنبيه حصة مباشرة لابنكم', message: parentMsg, type: 'live', link: meetingUrl
            });
          }
        } catch (notifErr) {
          logger.error('Failed to create notifications:', notifErr);
        }
      }
    }

    logger.info(`Live session started: ${id} by ${teacherName} (${provider})`);
    res.status(201).json({ id, teacherId, teacherName, meetingUrl: meetingUrl.trim() });
  } catch (err) {
    ResponseHandler.serverError(res, err, 'Start live session');
  }
});

router.post('/end/:id', authMiddleware, async (req, res) => {
  try {
    const isAdmin = req.user?.role === 'admin' || req.user?.permissions?.includes('*');
    const where = isAdmin
      ? { id: req.params.id, status: 'active' }
      : { id: req.params.id, teacherId: req.user.id, status: 'active' };

    const result = await prisma.liveSession.updateMany({
      where,
      data: { status: 'ended', endedAt: new Date(), endedBy: isAdmin ? 'admin' : 'teacher' }
    });

    if (result.count === 0) {
      return res.status(404).json({ error: 'Session not found or already ended' });
    }

    const session = await prisma.liveSession.findUnique({
      where: { id: req.params.id },
      select: { targetStudentId: true }
    });

    const io = req.app.get('socketio');
    if (io && session?.targetStudentId) {
      io.to(`user_${session.targetStudentId}`).emit('session_ended', { sessionId: req.params.id });
    }

    logger.info(`Live session ended: ${req.params.id} by ${req.user?.name || 'unknown'}`);
    res.json({ success: true });
  } catch (err) {
    ResponseHandler.serverError(res, err, 'End live session');
  }
});

module.exports = router;
