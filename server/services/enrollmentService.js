const { prisma } = require('../utils/prisma');
const cache = require('./cacheService');
const { AUDIT_ACTIONS } = require('../constants/auditActions');
const { CACHE_KEYS } = require('../constants/cacheKeys');
const { audit } = require('./auditService');

const CK = CACHE_KEYS.enrollments;

const enrollmentInclude = {
  student: { select: { id: true, name: true, grade: true } },
  teacher: { select: { id: true, name: true, subject: true } },
};

function parseEnrollment(en) {
  if (!en) return null;
  return {
    ...en,
    schedule: typeof en.schedule === 'string' ? JSON.parse(en.schedule) : (en.schedule || []),
  };
}

function getCacheKeysByStudent(studentId) {
  return [CK.byStudent(studentId)];
}

function getCacheKeysByTeacher(teacherId) {
  return [CK.byTeacher(teacherId)];
}

async function invalidateEnrollmentCaches(id, studentId, teacherId) {
  const keys = [CK.list(), CK.byId(id)];
  if (studentId) keys.push(...getCacheKeysByStudent(studentId));
  if (teacherId) keys.push(...getCacheKeysByTeacher(teacherId));
  await Promise.all(keys.map(k => cache.del(k)));
}

async function getEnrollments(query) {
  const page = parseInt(query.page);
  const rawLimit = parseInt(query.limit);
  const limit = isNaN(rawLimit) ? rawLimit : Math.min(rawLimit, 200);

  const where = { deletedAt: null };
  if (query.studentId) where.studentId = query.studentId;
  if (query.teacherId) where.teacherId = query.teacherId;
  if (query.subject) where.subject = { contains: query.subject, mode: 'insensitive' };

  if (!isNaN(page) && !isNaN(limit)) {
    const [enrollments, total] = await Promise.all([
      prisma.enrollment.findMany({
        where,
        include: enrollmentInclude,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.enrollment.count({ where }),
    ]);
    return {
      data: enrollments.map(parseEnrollment),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  const enrollments = await prisma.enrollment.findMany({
    where,
    include: enrollmentInclude,
    orderBy: { createdAt: 'desc' },
  });
  return enrollments.map(parseEnrollment);
}

async function getEnrollmentById(id) {
  return cache.wrap(CK.byId(id), 60, async () => {
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: parseInt(id) },
      include: enrollmentInclude,
    });
    if (!enrollment || enrollment.deletedAt) {
      throw Object.assign(new Error('Enrollment not found'), { statusCode: 404 });
    }
    return parseEnrollment(enrollment);
  });
}

async function getStudentEnrollments(studentId) {
  return cache.wrap(CK.byStudent(studentId), 60, async () => {
    const enrollments = await prisma.enrollment.findMany({
      where: { studentId, deletedAt: null },
      include: enrollmentInclude,
      orderBy: { createdAt: 'desc' },
    });
    return enrollments.map(parseEnrollment);
  });
}

async function getTeacherEnrollments(teacherId) {
  return cache.wrap(CK.byTeacher(teacherId), 60, async () => {
    const enrollments = await prisma.enrollment.findMany({
      where: { teacherId, deletedAt: null },
      include: enrollmentInclude,
      orderBy: { createdAt: 'desc' },
    });
    return enrollments.map(parseEnrollment);
  });
}

async function createEnrollment(data, user) {
  const { studentId, teacherId, teacher, subject, curr, sessionsTotal, schedule, sessions, nextSessionNotes } = data;

  if (!studentId || !subject) {
    throw Object.assign(new Error('studentId and subject are required'), { statusCode: 400 });
  }

  const student = await prisma.student.findUnique({ where: { id: studentId } });
  if (!student || student.deletedAt) {
    throw Object.assign(new Error('Student not found'), { statusCode: 404 });
  }

  if (teacherId) {
    const teacherRecord = await prisma.teacher.findUnique({ where: { id: teacherId } });
    if (!teacherRecord || teacherRecord.deletedAt) {
      throw Object.assign(new Error('Teacher not found'), { statusCode: 404 });
    }
  }

  const duplicate = await prisma.enrollment.findFirst({
    where: { studentId, subject, teacherId: teacherId || null, deletedAt: null },
  });
  if (duplicate) {
    throw Object.assign(new Error('الطالب مسجل بالفعل في هذه المادة مع هذا المعلم'), { statusCode: 400 });
  }

  const enrollment = await prisma.$transaction(async (tx) => {
    const created = await tx.enrollment.create({
      data: {
        studentId, teacherId: teacherId || null,
        teacherFallback: teacher || null,
        subject, curr: curr || student.currency || null,
        sessionsTotal: sessionsTotal || 0,
        schedule: schedule && schedule.length > 0 ? JSON.stringify(schedule) : null,
        nextSessionNotes: nextSessionNotes || null,
      },
      include: enrollmentInclude,
    });

    if (sessions && sessions.length > 0) {
      const price = teacherId
        ? (await tx.teacher.findUnique({ where: { id: teacherId }, select: { price: true } }))?.price || 0
        : 0;
      for (const s of sessions) {
        await tx.session.create({
          data: {
            studentId,
            studentName: student.name,
            teacherId: teacherId || null,
            teacherName: teacher || null,
            subject: subject || null,
            date: s.date,
            day: s.day || null,
            time: s.time || null,
            status: 'pending',
            price,
          },
        });
      }
    }

    return created;
  });

  await invalidateEnrollmentCaches(enrollment.id, studentId, teacherId);
  await audit(user.id, user.username, AUDIT_ACTIONS.ENROLLMENT_CREATED,
    { studentId, teacherId, subject }, 'enrollment', String(enrollment.id));

  return parseEnrollment(enrollment);
}

async function updateEnrollment(id, data, user) {
  const enrollment = await prisma.enrollment.findUnique({ where: { id: parseInt(id) } });
  if (!enrollment || enrollment.deletedAt) {
    throw Object.assign(new Error('Enrollment not found'), { statusCode: 404 });
  }

  const { teacherId, teacher, subject, curr, sessionsTotal, schedule, nextSessionNotes } = data;

  if (teacherId && teacherId !== enrollment.teacherId) {
    const teacherRecord = await prisma.teacher.findUnique({ where: { id: teacherId } });
    if (!teacherRecord || teacherRecord.deletedAt) {
      throw Object.assign(new Error('Teacher not found'), { statusCode: 404 });
    }
  }

  const updateData = {};
  if (teacherId !== undefined) updateData.teacherId = teacherId || null;
  if (teacher !== undefined) updateData.teacherFallback = teacher || null;
  if (subject !== undefined) updateData.subject = subject;
  if (curr !== undefined) updateData.curr = curr;
  if (sessionsTotal !== undefined) updateData.sessionsTotal = sessionsTotal;
  if (schedule !== undefined) updateData.schedule = JSON.stringify(schedule);
  if (nextSessionNotes !== undefined) updateData.nextSessionNotes = nextSessionNotes;

  const updated = await prisma.$transaction(async (tx) => {
    return tx.enrollment.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: enrollmentInclude,
    });
  });

  await invalidateEnrollmentCaches(updated.id, enrollment.studentId, enrollment.teacherId);
  if (teacherId && teacherId !== enrollment.teacherId) {
    await invalidateEnrollmentCaches(updated.id, updated.studentId, teacherId);
  }
  await audit(user.id, user.username, AUDIT_ACTIONS.ENROLLMENT_UPDATED,
    { id, studentId: enrollment.studentId, subject }, 'enrollment', id);

  return parseEnrollment(updated);
}

async function suspendEnrollment(id, data, user) {
  const enrollment = await prisma.enrollment.findUnique({ where: { id: parseInt(id) } });
  if (!enrollment || enrollment.deletedAt) {
    throw Object.assign(new Error('Enrollment not found'), { statusCode: 404 });
  }
  if (enrollment.isFrozen) {
    throw Object.assign(new Error('Enrollment is already suspended'), { statusCode: 400 });
  }

  const { reason } = data;
  const updated = await prisma.$transaction(async (tx) => {
    return tx.enrollment.update({
      where: { id: parseInt(id) },
      data: { isFrozen: 1, frozenReason: reason || null },
      include: enrollmentInclude,
    });
  });

  await invalidateEnrollmentCaches(updated.id, enrollment.studentId, enrollment.teacherId);
  await audit(user.id, user.username, AUDIT_ACTIONS.ENROLLMENT_SUSPENDED,
    { id, studentId: enrollment.studentId, reason }, 'enrollment', id);

  return parseEnrollment(updated);
}

async function restoreEnrollment(id, user) {
  const enrollment = await prisma.enrollment.findUnique({ where: { id: parseInt(id) } });
  if (!enrollment || enrollment.deletedAt) {
    throw Object.assign(new Error('Enrollment not found'), { statusCode: 404 });
  }

  let updated;
  if (enrollment.isFrozen) {
    updated = await prisma.$transaction(async (tx) => {
      return tx.enrollment.update({
        where: { id: parseInt(id) },
        data: { isFrozen: 0, frozenReason: null },
        include: enrollmentInclude,
      });
    });
    await invalidateEnrollmentCaches(updated.id, enrollment.studentId, enrollment.teacherId);
    await audit(user.id, user.username, AUDIT_ACTIONS.ENROLLMENT_RESTORED,
      { id, studentId: enrollment.studentId }, 'enrollment', id);
  } else {
    updated = await prisma.$transaction(async (tx) => {
      return tx.enrollment.update({
        where: { id: parseInt(id) },
        data: { deletedAt: null },
        include: enrollmentInclude,
      });
    });
    await invalidateEnrollmentCaches(updated.id, enrollment.studentId, enrollment.teacherId);
    await audit(user.id, user.username, AUDIT_ACTIONS.ENROLLMENT_RESTORED,
      { id, studentId: enrollment.studentId, restored: true }, 'enrollment', id);
  }

  return parseEnrollment(updated);
}

async function deleteEnrollment(id, user) {
  const enrollment = await prisma.enrollment.findUnique({ where: { id: parseInt(id) } });
  if (!enrollment || enrollment.deletedAt) {
    throw Object.assign(new Error('Enrollment not found'), { statusCode: 404 });
  }

  await prisma.$transaction(async (tx) => {
    await tx.enrollment.update({
      where: { id: parseInt(id) },
      data: { deletedAt: new Date() },
    });
  });

  await invalidateEnrollmentCaches(id, enrollment.studentId, enrollment.teacherId);
  await audit(user.id, user.username, AUDIT_ACTIONS.ENROLLMENT_DELETED,
    { id, studentId: enrollment.studentId }, 'enrollment', id);
}

module.exports = {
  getEnrollments,
  getEnrollmentById,
  getStudentEnrollments,
  getTeacherEnrollments,
  createEnrollment,
  updateEnrollment,
  suspendEnrollment,
  restoreEnrollment,
  deleteEnrollment,
};
