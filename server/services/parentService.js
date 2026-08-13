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

const ARABIC_DIGITS = {
  '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
  '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9',
};

// Known regional country codes folded to the national trunk-zero format.
const KNOWN_COUNTRY_CODES = ['966', '965', '971', '974', '968', '973', '20'];

function toDigits(phone) {
  return String(phone || '')
    .replace(/[٠-٩]/g, d => ARABIC_DIGITS[d])
    .replace(/\D/g, '');
}

// Canonical comparison key only — never stored. Folds "+9665..." / "05..." /
// "00 966 5..." into the national "05..." form when safe to do so.
function canonicalPhone(phone) {
  let digits = toDigits(phone);
  if (!digits) return '';
  digits = digits.replace(/^00/, '').replace(/^\+/, '');
  for (const cc of KNOWN_COUNTRY_CODES) {
    if (digits.startsWith(cc)) {
      const rest = digits.slice(cc.length);
      if (rest.length >= 8 && rest.length <= 10) {
        return `0${rest}`;
      }
    }
  }
  return digits;
}

function mapParent(parent) {
  if (!parent) return null;
  const { password, deletedAt, ...safe } = parent;
  return safe;
}

// Usernames must be globally unique across all identities. When the natural
// base (e.g. a phone) is already taken by a student/teacher/account, derive a
// collision-safe alternative instead of failing.
async function generateUniqueUsername(base) {
  const candidates = [];
  const trimmed = String(base || '').trim().toLowerCase();
  if (trimmed) candidates.push(trimmed, `parent_${trimmed}`);
  if (!trimmed) candidates.push('parent');
  let index = 2;
  while (candidates.length < 20) {
    const last = candidates[candidates.length - 1];
    candidates.push(`${last}_${index}`);
    index++;
  }
  for (const candidate of candidates) {
    const existing = await findIdentityByUsername(candidate);
    if (!existing) return candidate;
  }
  return `parent_${Date.now().toString(36)}`;
}

async function findActiveParentByCanonicalPhone(phone, excludeId) {
  const canonical = canonicalPhone(phone);
  if (!canonical) return null;
  const parents = await prisma.parent.findMany({
    where: { deletedAt: null },
    select: { id: true, phone: true },
  });
  return parents.find(p => p.id !== excludeId && canonicalPhone(p.phone) === canonical) || null;
}

// Link students to a parent whenever their parentPhone matches (normalized).
async function linkStudentsToParent(parentId, phone) {
  const canonical = canonicalPhone(phone);
  if (!canonical) return;
  const students = await prisma.student.findMany({
    where: { deletedAt: null, parentPhone: { not: null } },
    select: { id: true, parentPhone: true, parentId: true },
  });
  const ids = students
    .filter(s => canonicalPhone(s.parentPhone) === canonical && s.parentId !== parentId)
    .map(s => s.id);
  if (ids.length === 0) return;
  await prisma.student.updateMany({
    where: { id: { in: ids } },
    data: { parentId },
  });
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

  const existingByPhone = await findActiveParentByCanonicalPhone(phone);
  if (existingByPhone) {
    throw Object.assign(new Error('يوجد ولي أمر مسجل بنفس رقم الهاتف بالفعل.'), { statusCode: 400 });
  }

  let dbUsername = await normalizeUsername(username);
  if (!dbUsername) {
    dbUsername = await generateUniqueUsername(phone);
  } else {
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

  await linkStudentsToParent(newId, phone);

  return mapParent(parent);
}

async function updateParent(id, data, user) {
  const { name, phone, email, username, password } = data;

  const existing = await prisma.parent.findUnique({ where: { id } });
  if (!existing) {
    throw Object.assign(new Error('Parent not found'), { statusCode: 404 });
  }

  if (phone) {
    const existingByPhone = await findActiveParentByCanonicalPhone(phone, id);
    if (existingByPhone) {
      throw Object.assign(new Error('يوجد ولي أمر مسجل بنفس رقم الهاتف بالفعل.'), { statusCode: 400 });
    }
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
  const canonical = canonicalPhone(parentPhone);
  const students = await prisma.student.findMany({
    where: { deletedAt: null },
    include: { enrollments: true },
  });

  return students
    .filter(s => canonical && canonicalPhone(s.parentPhone) === canonical)
    .map(child => {
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
    where: { id: studentId, deletedAt: null },
    select: { id: true, parentPhone: true },
  });
  if (!student || canonicalPhone(student.parentPhone) !== canonicalPhone(parentPhone)) {
    throw Object.assign(new Error('Unauthorized'), { statusCode: 403 });
  }

  return prisma.session.findMany({
    where: { studentId },
    orderBy: { date: 'desc' },
  });
}

async function getChildInvoices(studentId, parentPhone) {
  const student = await prisma.student.findFirst({
    where: { id: studentId, deletedAt: null },
    select: { id: true, parentPhone: true },
  });
  if (!student || canonicalPhone(student.parentPhone) !== canonicalPhone(parentPhone)) {
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
  canonicalPhone,
};
