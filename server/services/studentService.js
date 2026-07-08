const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { prisma } = require('../utils/prisma');
const { AUDIT_ACTIONS } = require('../constants/auditActions');
const { audit } = require('./auditService');

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
  const dbUsername = (username && username.trim() !== '') ? username.trim() : null;

  const student = await prisma.$transaction(async (tx) => {
    await tx.student.create({
      data: {
        id: newId, name, grade, parentPhone, studentPhone, curriculum, notes,
        sessionPrice: sessionPrice || 0, currency: currency || 'KWD',
        username: dbUsername, password: hashed,
      },
    });

    if (enrollments && enrollments.length > 0) {
      for (const e of enrollments) {
        let finalTeacherId = e.teacherId || null;
        if (!finalTeacherId && e.teacher) {
          const teacher = await tx.teacher.findFirst({ where: { name: e.teacher } });
          if (teacher) finalTeacherId = teacher.id;
        }
        await tx.enrollment.create({
          data: {
            studentId: newId, teacher: e.teacher, teacherId: finalTeacherId,
            subject: e.subject, curr: e.curr,
            sessionsTotal: e.sessionsTotal || 0, sessionsUsed: e.sessionsUsed || 0,
            schedule: JSON.stringify(e.schedule || []), nextSessionNotes: e.nextSessionNotes || null,
          },
        });
      }
    }

    return tx.student.findUnique({ where: { id: newId }, include: studentInclude });
  });

  await audit(user.id, user.username, AUDIT_ACTIONS.STUDENT_CREATED, { name: student.name }, 'student', student.id);
  return mapStudent(student);
}

async function updateStudent(id, data, user) {
  const { name, grade, parentPhone, studentPhone, curriculum, notes, sessionPrice, enrollments, username, password, currency } = data;
  const dbUsername = (username && username.trim() !== '') ? username.trim() : null;

  const student = await prisma.$transaction(async (tx) => {
    const updateData = {
      name, grade, parentPhone, studentPhone, curriculum, notes,
      sessionPrice: sessionPrice || 0, currency: currency || 'KWD',
      username: dbUsername,
    };
    if (password && password.trim() !== '' && !password.startsWith('$2b$')) {
      updateData.password = await bcrypt.hash(password, 10);
    }
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
        let finalTeacherId = e.teacherId || null;
        if (!finalTeacherId && e.teacher) {
          const teacher = await tx.teacher.findFirst({ where: { name: { equals: e.teacher.trim(), mode: 'insensitive' } } });
          if (teacher) finalTeacherId = teacher.id;
        }

        if (e.id && existingIds.has(e.id)) {
          await tx.enrollment.update({
            where: { id: parseInt(e.id) },
            data: {
              teacher: e.teacher, teacherId: finalTeacherId,
              subject: e.subject, curr: e.curr,
              sessionsTotal: e.sessionsTotal || 0,
              schedule: JSON.stringify(e.schedule || []),
              nextSessionNotes: e.nextSessionNotes || null,
            },
          });
        } else {
          await tx.enrollment.create({
            data: {
              studentId: id, teacher: e.teacher, teacherId: finalTeacherId,
              subject: e.subject, curr: e.curr,
              sessionsTotal: e.sessionsTotal || 0, sessionsUsed: e.sessionsUsed || 0,
              schedule: JSON.stringify(e.schedule || []), nextSessionNotes: e.nextSessionNotes || null,
            },
          });
        }
      }
    }

    return tx.student.findUnique({ where: { id }, include: studentInclude });
  });

  await audit(user.id, user.username, AUDIT_ACTIONS.STUDENT_UPDATED, { id }, 'student', id);
  return mapStudent(student);
}

async function deleteStudent(id, user) {
  await prisma.$transaction(async (tx) => {
    await tx.enrollment.deleteMany({ where: { studentId: id } });
    await tx.student.update({ where: { id }, data: { deletedAt: new Date() } });
  });
  await audit(user.id, user.username, AUDIT_ACTIONS.STUDENT_DELETED, { id }, 'student', id);
}

async function deleteAllStudents(user) {
  const result = await prisma.$transaction(async (tx) => {
    await tx.enrollment.deleteMany();
    const updated = await tx.student.updateMany({ data: { deletedAt: new Date() } });
    return updated;
  });
  await audit(user.id, user.username, AUDIT_ACTIONS.STUDENT_DELETED, { bulk: true, count: result.count }, 'student', null);
}

async function freezeEnrollment(studentId, enrollmentId, data, user) {
  const { isFrozen, frozenReason } = data;
  const updated = await prisma.enrollment.update({
    where: { id: parseInt(enrollmentId), studentId },
    data: { nextSessionNotes: isFrozen ? `[مجمدة] ${frozenReason || ''}` : null },
  });
  await audit(user.id, user.username, AUDIT_ACTIONS.STUDENT_UPDATED, { studentId, freeze: true }, 'enrollment', enrollmentId);
  return updated;
}

module.exports = {
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  deleteAllStudents,
  freezeEnrollment,
};
