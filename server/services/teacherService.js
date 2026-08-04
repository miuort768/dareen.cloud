const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { prisma } = require('../utils/prisma');
const cache = require('./cacheService');
const { AUDIT_ACTIONS } = require('../constants/auditActions');
const { CACHE_KEYS } = require('../constants/cacheKeys');
const { audit } = require('./auditService');
const { normalizeUsername, findIdentityByUsername } = require('./authAccounts');

const teacherSelect = {
  id: true, name: true, phone1: true, phone2: true,
  subject: true, price: true, email: true, username: true,
  currency: true, points: true, createdAt: true, updatedAt: true,
};

const CK = CACHE_KEYS.teachers;

async function hashPassword(password) {
  if (!password || password.trim() === '' || password.startsWith('$2b$')) return null;
  return bcrypt.hash(password, 10);
}

function mapTeacher(teacher) {
  if (!teacher) return null;
  const { password, deletedAt, ...safe } = teacher;
  return safe;
}

async function listTeachers() {
  return cache.wrap(CK.list(), 60, async () => {
    const teachers = await prisma.teacher.findMany({
      where: { deletedAt: null },
      select: teacherSelect,
      orderBy: { name: 'asc' },
    });
    return teachers;
  });
}

async function getTeacherById(id) {
  return cache.wrap(CK.byId(id), 60, async () => {
    const teacher = await prisma.teacher.findUnique({
      where: { id },
      select: teacherSelect,
    });
    if (!teacher) {
      throw Object.assign(new Error('Teacher not found'), { statusCode: 404 });
    }
    return teacher;
  });
}

async function createTeacher(data, user) {
  const { id, name, phone1, phone2, subject, price, email, username, password, currency } = data;
  const newId = id || `t_${crypto.randomBytes(4).toString('hex')}`;

  if (!name) {
    throw Object.assign(new Error('Name is required'), { statusCode: 400 });
  }

  const dbUsername = await normalizeUsername(username);
  if (dbUsername) {
    const existing = await findIdentityByUsername(dbUsername);
    if (existing) {
      throw Object.assign(new Error('اسم المستخدم موجود بالفعل، يرجى اختيار اسم آخر.'), { statusCode: 400, code: 'P2002' });
    }
  }
  const hashed = await hashPassword(password);

  const teacher = await prisma.$transaction(async (tx) => {
    return tx.teacher.create({
      data: {
        id: newId, name, phone1, phone2, subject,
        price: price || 0, currency: currency || 'EGP',
        email, username: dbUsername, password: hashed,
      },
    });
  });

  cache.del(CK.list());
  await audit(user.id, user.username, AUDIT_ACTIONS.TEACHER_CREATED,
    { name: teacher.name }, 'teacher', teacher.id);

  return mapTeacher(teacher);
}

async function updateTeacher(id, data, user) {
  const { name, phone1, phone2, subject, price, email, username, password, currency } = data;

  const existing = await prisma.teacher.findUnique({ where: { id } });
  if (!existing) {
    throw Object.assign(new Error('Teacher not found'), { statusCode: 404 });
  }

  const dbUsername = await normalizeUsername(username);
  if (dbUsername) {
    const duplicate = await findIdentityByUsername(dbUsername);
    if (duplicate && duplicate.id !== id) {
      throw Object.assign(new Error('اسم المستخدم موجود بالفعل، يرجى اختيار اسم آخر.'), { statusCode: 400, code: 'P2002' });
    }
  }

  const updateData = { name, phone1, phone2, subject, price: price || 0, currency: currency || 'EGP', email, username: dbUsername };

  if (password && password.trim() !== '' && !password.startsWith('$2b$')) {
    updateData.password = await bcrypt.hash(password, 10);
  }

  const teacher = await prisma.$transaction(async (tx) => {
    return tx.teacher.update({
      where: { id },
      data: updateData,
    });
  });

  cache.del(CK.byId(id));
  cache.del(CK.list());
  await audit(user.id, user.username, AUDIT_ACTIONS.TEACHER_UPDATED,
    { id }, 'teacher', id);

  return mapTeacher(teacher);
}

async function deleteTeacher(id, user) {
  const existing = await prisma.teacher.findUnique({ where: { id } });
  if (!existing) {
    throw Object.assign(new Error('Teacher not found'), { statusCode: 404 });
  }

  await prisma.$transaction(async (tx) => {
    await tx.teacher.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  });

  cache.del(CK.byId(id));
  cache.del(CK.list());
  await audit(user.id, user.username, AUDIT_ACTIONS.TEACHER_DELETED,
    { id }, 'teacher', id);
}

async function deleteAllTeachers(user) {
  const result = await prisma.teacher.updateMany({
    where: { deletedAt: null },
    data: { deletedAt: new Date() },
  });

  cache.del(CK.list());
  await audit(user.id, user.username, AUDIT_ACTIONS.TEACHER_DELETED,
    { bulk: true, count: result.count }, 'teacher', null);

  return result.count;
}

async function restoreTeacher(id, user) {
  const existing = await prisma.teacher.findUnique({ where: { id } });
  if (!existing) {
    throw Object.assign(new Error('Teacher not found'), { statusCode: 404 });
  }
  if (!existing.deletedAt) {
    throw Object.assign(new Error('Teacher is not deleted'), { statusCode: 400 });
  }

  const teacher = await prisma.$transaction(async (tx) => {
    return tx.teacher.update({
      where: { id },
      data: { deletedAt: null },
    });
  });

  cache.del(CK.byId(id));
  cache.del(CK.list());
  await audit(user.id, user.username, AUDIT_ACTIONS.TEACHER_UPDATED,
    { id, restored: true }, 'teacher', id);

  return mapTeacher(teacher);
}

module.exports = {
  listTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  deleteAllTeachers,
  restoreTeacher,
};
