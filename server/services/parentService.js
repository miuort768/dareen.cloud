const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const { prisma } = require('../utils/prisma');
const cache = require('./cacheService');
const { AUDIT_ACTIONS } = require('../constants/auditActions');
const { CACHE_KEYS } = require('../constants/cacheKeys');
const { audit } = require('./auditService');
const { normalizeUsername, findIdentityByUsername, syncAccount, deactivateAccount, deactivateBulkAccounts } = require('./authAccounts');

const CK = CACHE_KEYS.parents;

const parentSelect = {
  id: true, name: true, phone: true, email: true, username: true,
};

function mapParent(parent) {
  if (!parent) return null;
  const { password, deletedAt, ...safe } = parent;
  return safe;
}

async function listParents() {
  return cache.wrap(CK.list(), 60, async () => {
    const parents = await prisma.parent.findMany({
      where: { deletedAt: null },
      select: parentSelect,
      orderBy: { name: 'asc' },
    });
    return parents;
  });
}

async function getParentById(id) {
  return cache.wrap(CK.byId(id), 60, async () => {
    const parent = await prisma.parent.findUnique({
      where: { id },
      select: parentSelect,
    });
    if (!parent) {
      throw Object.assign(new Error('Parent not found'), { statusCode: 404 });
    }
    return parent;
  });
}

async function createParent(data, user) {
  const { id, name, phone, email, username, password } = data;

  if (!name || !phone) {
    throw Object.assign(new Error('Name and phone are required'), { statusCode: 400 });
  }

  const dbUsername = await normalizeUsername(username) || (phone || '').trim() || null;
  if (dbUsername) {
    const existing = await findIdentityByUsername(dbUsername);
    if (existing) {
      throw Object.assign(new Error('اسم المستخدم موجود بالفعل، يرجى اختيار اسم آخر لولي الأمر.'), { statusCode: 400, code: 'P2002' });
    }
  }
  const dbPassword = password || '123456';
  const newId = id || uuidv4();
  const hashedPassword = await bcrypt.hash(dbPassword, 10);

  const parent = await prisma.$transaction(async (tx) => {
    return tx.parent.create({
      data: {
        id: newId, name, phone,
        email: email || '',
        username: dbUsername,
        password: hashedPassword,
      },
    });
  });

  await syncAccount({ entityType: 'parent', entityId: newId, username: dbUsername, passwordHash: hashedPassword });

  cache.del(CK.list());
  await audit(user.id, user.username, AUDIT_ACTIONS.PARENT_CREATED,
    { name: parent.name }, 'parent', parent.id);

  return mapParent(parent);
}

async function updateParent(id, data, user) {
  const { name, phone, email, username, password } = data;

  const existing = await prisma.parent.findUnique({ where: { id } });
  if (!existing) {
    throw Object.assign(new Error('Parent not found'), { statusCode: 404 });
  }

  const dbUsername = await normalizeUsername(username) || (phone || '').trim() || null;
  if (dbUsername) {
    const duplicate = await findIdentityByUsername(dbUsername);
    if (duplicate && duplicate.id !== id) {
      throw Object.assign(new Error('اسم المستخدم موجود بالفعل، يرجى اختيار اسم آخر لولي الأمر.'), { statusCode: 400, code: 'P2002' });
    }
  }
  const updateData = { name, phone, email: email || '' };
  if (dbUsername) updateData.username = dbUsername;

  if (password && password.trim() !== '' && !password.startsWith('$2b$')) {
    updateData.password = await bcrypt.hash(password, 10);
  }

  const parent = await prisma.$transaction(async (tx) => {
    return tx.parent.update({
      where: { id },
      data: updateData,
    });
  });

  await syncAccount({
    entityType: 'parent', entityId: id,
    username: dbUsername || existing.username || null,
    passwordHash: updateData.password || existing.password || null,
  });

  cache.del(CK.byId(id));
  cache.del(CK.list());
  await audit(user.id, user.username, AUDIT_ACTIONS.PARENT_UPDATED,
    { id }, 'parent', id);

  return mapParent(parent);
}

async function deleteParent(id, user) {
  const existing = await prisma.parent.findUnique({ where: { id } });
  if (!existing) {
    throw Object.assign(new Error('Parent not found'), { statusCode: 404 });
  }

  await prisma.$transaction(async (tx) => {
    await tx.parent.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  });

  await deactivateAccount('parent', id);
  cache.del(CK.byId(id));
  cache.del(CK.list());
  await audit(user.id, user.username, AUDIT_ACTIONS.PARENT_DELETED,
    { id }, 'parent', id);
}

async function deleteAllParents(user) {
  const result = await prisma.$transaction(async (tx) => {
    return tx.parent.updateMany({
      where: { deletedAt: null },
      data: { deletedAt: new Date() },
    });
  });

  cache.del(CK.list());
  if (result.count > 0) {
    await deactivateBulkAccounts('parent');
  }
  await audit(user.id, user.username, AUDIT_ACTIONS.PARENT_DELETED_ALL,
    { bulk: true, count: result.count }, 'parent', null);

  return result.count;
}

async function restoreParent(id, user) {
  const existing = await prisma.parent.findUnique({ where: { id } });
  if (!existing) {
    throw Object.assign(new Error('Parent not found'), { statusCode: 404 });
  }
  if (!existing.deletedAt) {
    throw Object.assign(new Error('Parent is not deleted'), { statusCode: 400 });
  }

  const parent = await prisma.$transaction(async (tx) => {
    return tx.parent.update({
      where: { id },
      data: { deletedAt: null },
    });
  });

  await syncAccount({ entityType: 'parent', entityId: id, username: existing.username, passwordHash: existing.password, isActive: true });

  cache.del(CK.byId(id));
  cache.del(CK.list());
  await audit(user.id, user.username, AUDIT_ACTIONS.PARENT_UPDATED,
    { id, restored: true }, 'parent', id);

  return mapParent(parent);
}

async function getMyChildren(parentPhone) {
  const children = await prisma.student.findMany({
    where: { parentPhone, deletedAt: null },
    include: { enrollments: true },
  });

  return children.map(child => {
    const { password, ...safe } = child;
    return {
      ...safe,
      enrollments: (child.enrollments || []).map(en => ({
        ...en,
        schedule: typeof en.schedule === 'string' ? JSON.parse(en.schedule) : (en.schedule || []),
      })),
    };
  });
}

async function getChildSessions(studentId, parentPhone) {
  const student = await prisma.student.findFirst({
    where: { id: studentId, parentPhone, deletedAt: null },
    select: { id: true },
  });
  if (!student) {
    throw Object.assign(new Error('Unauthorized'), { statusCode: 403 });
  }

  return prisma.session.findMany({
    where: { studentId },
    orderBy: { date: 'desc' },
  });
}

async function getChildInvoices(studentId, parentPhone) {
  const student = await prisma.student.findFirst({
    where: { id: studentId, parentPhone, deletedAt: null },
    select: { id: true },
  });
  if (!student) {
    throw Object.assign(new Error('Unauthorized'), { statusCode: 403 });
  }

  return prisma.studentInvoice.findMany({
    where: { studentId },
    orderBy: { date: 'desc' },
  });
}

module.exports = {
  listParents,
  getParentById,
  createParent,
  updateParent,
  deleteParent,
  deleteAllParents,
  restoreParent,
  getMyChildren,
  getChildSessions,
  getChildInvoices,
};
