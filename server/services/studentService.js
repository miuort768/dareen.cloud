const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { prisma } = require('../utils/prisma');
const { AUDIT_ACTIONS } = require('../constants/auditActions');
const { CACHE_KEYS } = require('../constants/cacheKeys');
const { audit } = require('./auditService');
const cache = require('./cacheService');
const { normalizeUsername, findIdentityByUsername, syncAccount, deactivateAccount, deactivateBulkAccounts } = require('./authAccounts');

const studentInclude = {
  enrollments: true,
  parent: { select: { id: true, name: true, phone: true } },
};

function mapEnrollment(e) {
  return {
    ...e,
    schedule: typeof e.schedule === 'string' ? JSON.parse(e.schedule) : (e.schedule || []),
  };
}

function mapStudent(s, isTeacher = false) {
  const { password, ...safe } = s;
  const enrollments = (s.enrollments || []).map(mapEnrollment);
  if (isTeacher) {
    const { sessionPrice, ...rest } = safe;
    return { ...rest, sessionPrice: 0, enrollments: enrollments.map(e => { const { price, ...er } = e; return er; }) };
  }
  return { ...safe, enrollments };
}

async function hashPassword(password) {
  if (!password || password.trim() === '' || password.startsWith('$2b$')) return null;
  return bcrypt.hash(password, 10);
}

async function getStudents(query, user) {
  const page = parseInt(query.page);
  const rawLimit = parseInt(query.limit);
  const limit = isNaN(rawLimit) ? rawLimit : Math.min(rawLimit, 200);
  const q = query.q ? query.q.trim().toLowerCase() : '';
  const isTeacher = user && user.role === 'teacher';

  let teacherStudentIds = null;
  if (isTeacher) {
    const enrollments = await prisma.enrollment.findMany({
      where: { teacherId: user.id },
      select: { studentId: true },
    });
    teacherStudentIds = enrollments.map(e => e.studentId);
    if (teacherStudentIds.length === 0) {
      return !isNaN(page) && !isNaN(limit)
        ? { data: [], total: 0, page, limit, totalPages: 0 }
        : [];
    }
  }

  const where = { deletedAt: null };
  if (isTeacher && teacherStudentIds) {
    where.id = { in: teacherStudentIds };
  }
  if (q) {
    where.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { parentPhone: { contains: q } },
      { studentPhone: { contains: q } },
    ];
  }

  if (!isNaN(page) && !isNaN(limit)) {
    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where,
        include: studentInclude,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      prisma.student.count({ where }),
    ]);
    return {
      data: students.map(s => mapStudent(s, isTeacher)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  const students = await prisma.student.findMany({
    where,
    include: studentInclude,
    orderBy: { name: 'asc' },
  });
  return students.map(s => mapStudent(s, isTeacher));
}

async function createStudent(data, user) {
  const { id, name, grade, parentPhone, studentPhone, curriculum, notes, sessionPrice, enrollments, username, password, currency } = data;
  const newId = id || `std_${crypto.randomBytes(4).toString('hex')}`;

  const hashed = await hashPassword(password);
  const dbUsername = await normalizeUsername(username);
  if (dbUsername) {
    const existing = await findIdentityByUsername(dbUsername);
    if (existing) {
      const conflict = new Error('اسم المستخدم موجود بالفعل، يرجى اختيار اسم آخر للطالب.');
      conflict.code = 'P2002';
      throw conflict;
    }
  }

  const student = await prisma.$transaction(async (tx) => {
    await tx.student.create({
      data: {
        id: newId, name, grade, parentPhone, studentPhone, curriculum, notes,
        sessionPrice: sessionPrice || 0, currency: currency || 'EGP',
        username: dbUsername, password: hashed,
      },
    });

    if (enrollments && enrollments.length > 0) {
      for (const e of enrollments) {
        const teacherRef = typeof e.teacher === 'string' ? e.teacher : e.teacher?.name || null;
        let finalTeacherId = e.teacherId || (e.teacher && typeof e.teacher === 'object' && e.teacher.id ? e.teacher.id : null) || null;
        if (!finalTeacherId && teacherRef) {
          const teacher = await tx.teacher.findFirst({ where: { name: { equals: teacherRef.trim(), mode: 'insensitive' } } });
          if (teacher) finalTeacherId = teacher.id;
        }
        await tx.enrollment.create({
          data: {
            studentId: newId, teacherFallback: teacherRef, teacherId: finalTeacherId,
            subject: e.subject, curr: e.curr, curriculum: e.curriculum || null,
            sessionsTotal: e.sessionsTotal || 0, sessionsUsed: e.sessionsUsed || 0,
            schedule: JSON.stringify(e.schedule || []), nextSessionNotes: e.nextSessionNotes || null,
          },
        });
      }
    }

    return tx.student.findUnique({ where: { id: newId }, include: studentInclude });
  });

  await syncAccount({ entityType: 'student', entityId: newId, username: dbUsername, passwordHash: hashed });

  await audit(user.id, user.username, AUDIT_ACTIONS.STUDENT_CREATED, { name: student.name }, 'student', student.id);
  return mapStudent(student);
}

async function updateStudent(id, data, user) {
  const { name, grade, parentPhone, studentPhone, curriculum, notes, sessionPrice, enrollments, username, password, currency } = data;
  const dbUsername = await normalizeUsername(username);
  if (dbUsername) {
    const duplicate = await findIdentityByUsername(dbUsername);
    if (duplicate && duplicate.id !== id) {
      const conflict = new Error('اسم المستخدم موجود بالفعل، يرجى اختيار اسم آخر للطالب.');
      conflict.code = 'P2002';
      throw conflict;
    }
  }

  const newPasswordHash = await hashPassword(password);

  const student = await prisma.$transaction(async (tx) => {
    const updateData = {
      name, grade, parentPhone, studentPhone, curriculum, notes,
      sessionPrice: sessionPrice || 0, currency: currency || 'EGP',
    };
    if (dbUsername) updateData.username = dbUsername;
    if (newPasswordHash) updateData.password = newPasswordHash;
    await tx.student.update({ where: { id }, data: updateData });

    if (enrollments !== undefined && Array.isArray(enrollments)) {
      const existingEnrollments = await tx.enrollment.findMany({
        where: { studentId: id },
        select: { id: true, sessionsUsed: true, nextSessionNotes: true },
      });
      const existingIds = new Set(existingEnrollments.map(e => e.id));
      const incomingIds = new Set(enrollments.map(e => e.id).filter(Boolean));

      const idsToDelete = [...existingIds].filter(eId => !incomingIds.has(eId));
      if (idsToDelete.length > 0) {
        await tx.enrollment.updateMany({
          where: { id: { in: idsToDelete.map(Number) } },
          data: { deletedAt: new Date() },
        });
      }

      for (const e of enrollments) {
        const teacherRef = typeof e.teacher === 'string' ? e.teacher : e.teacher?.name || null;
        let finalTeacherId = e.teacherId || (e.teacher && typeof e.teacher === 'object' && e.teacher.id ? e.teacher.id : null) || null;
        if (!finalTeacherId && teacherRef) {
          const teacher = await tx.teacher.findFirst({ where: { name: { equals: teacherRef.trim(), mode: 'insensitive' } } });
          if (teacher) finalTeacherId = teacher.id;
        }

        if (e.id && existingIds.has(e.id)) {
          await tx.enrollment.update({
            where: { id: parseInt(e.id) },
            data: {
              teacherFallback: teacherRef, teacherId: finalTeacherId,
              subject: e.subject, curr: e.curr, curriculum: e.curriculum || null,
              sessionsTotal: e.sessionsTotal || 0,
              schedule: JSON.stringify(e.schedule || []),
              nextSessionNotes: e.nextSessionNotes || null,
            },
          });
        } else {
          await tx.enrollment.create({
            data: {
              studentId: id, teacherFallback: teacherRef, teacherId: finalTeacherId,
              subject: e.subject, curr: e.curr, curriculum: e.curriculum || null,
              sessionsTotal: e.sessionsTotal || 0, sessionsUsed: e.sessionsUsed || 0,
              schedule: JSON.stringify(e.schedule || []), nextSessionNotes: e.nextSessionNotes || null,
            },
          });
        }
      }
    }

    return tx.student.findUnique({ where: { id }, include: studentInclude });
  });

  await syncAccount({
    entityType: 'student', entityId: id,
    username: dbUsername || student?.username || null,
    passwordHash: newPasswordHash || student?.password || null,
  });

  await audit(user.id, user.username, AUDIT_ACTIONS.STUDENT_UPDATED, { id }, 'student', id);
  return mapStudent(student);
}

async function deleteStudent(id, user) {
  await prisma.$transaction(async (tx) => {
    await tx.enrollment.updateMany({ where: { studentId: id }, data: { deletedAt: new Date() } });
    await tx.student.update({ where: { id }, data: { deletedAt: new Date() } });
  });
  await deactivateAccount('student', id);
  await audit(user.id, user.username, AUDIT_ACTIONS.STUDENT_DELETED, { id }, 'student', id);
}

async function deleteAllStudents(user) {
  const result = await prisma.$transaction(async (tx) => {
    await tx.enrollment.deleteMany();
    const updated = await tx.student.updateMany({ data: { deletedAt: new Date() } });
    return updated;
  });
  if (result.count > 0) {
    await deactivateBulkAccounts('student');
  }
  await audit(user.id, user.username, AUDIT_ACTIONS.STUDENT_DELETED, { bulk: true, count: result.count }, 'student', null);
}

async function freezeEnrollment(studentId, enrollmentId, data, user) {
  const { isFrozen, frozenReason } = data;
  const updated = await prisma.enrollment.update({
    where: { id: parseInt(enrollmentId), studentId },
    data: { isFrozen: isFrozen ? 1 : 0, frozenReason: frozenReason || null },
  });
  await audit(user.id, user.username, AUDIT_ACTIONS.STUDENT_UPDATED, { studentId, freeze: true }, 'enrollment', enrollmentId);
  return updated;
}

async function assertEnrollmentAccess(studentId, enrollmentId, user) {
  const where = { id: parseInt(enrollmentId), studentId };
  if (user && user.role === 'teacher') {
    const teacherName = user.teacherName || user.name;
    const or = [{ teacherId: user.id }];
    if (teacherName) or.push({ teacherFallback: { equals: teacherName, mode: 'insensitive' } });
    where.OR = or;
  }
  const enrollment = await prisma.enrollment.findFirst({
    where,
    select: { id: true, teacherId: true, teacherFallback: true },
  });
  if (!enrollment) {
    const err = new Error('الاشتراك غير موجود أو غير تابع لك');
    err.statusCode = user && user.role === 'teacher' ? 403 : 404;
    throw err;
  }
  return enrollment;
}

async function invalidateEnrollmentCaches(enrollmentId, studentId, teacherId) {
  const keys = [CACHE_KEYS.enrollments.byId(enrollmentId), CACHE_KEYS.enrollments.list()];
  if (studentId) keys.push(CACHE_KEYS.enrollments.byStudent(studentId));
  if (teacherId) keys.push(CACHE_KEYS.enrollments.byTeacher(teacherId));
  await Promise.all(keys.map(k => cache.del(k)));
}

async function updateEnrollmentSchedule(studentId, enrollmentId, schedule, user) {
  const enrollment = await assertEnrollmentAccess(studentId, enrollmentId, user);
  const updated = await prisma.enrollment.update({
    where: { id: parseInt(enrollmentId), studentId },
    data: { schedule: schedule && schedule.length > 0 ? JSON.stringify(schedule) : null },
  });
  await audit(user.id, user.username, AUDIT_ACTIONS.STUDENT_UPDATED, { studentId, schedule: true }, 'enrollment', enrollmentId);
  await invalidateEnrollmentCaches(enrollmentId, studentId, enrollment.teacherId);
  return mapEnrollment(updated);
}

async function updateEnrollmentNotes(studentId, enrollmentId, notes, user) {
  const enrollment = await assertEnrollmentAccess(studentId, enrollmentId, user);
  const updated = await prisma.enrollment.update({
    where: { id: parseInt(enrollmentId), studentId },
    data: { nextSessionNotes: notes || null },
  });
  await audit(user.id, user.username, AUDIT_ACTIONS.STUDENT_UPDATED, { studentId, notes: true }, 'enrollment', enrollmentId);
  await invalidateEnrollmentCaches(enrollmentId, studentId, enrollment.teacherId);
  return mapEnrollment(updated);
}

module.exports = {
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  deleteAllStudents,
  freezeEnrollment,
  updateEnrollmentSchedule,
  updateEnrollmentNotes,
};
