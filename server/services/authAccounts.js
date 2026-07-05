const bcrypt = require('bcrypt');
const { prisma } = require('../utils/prisma');
const { AUDIT_ACTIONS } = require('../constants/auditActions');
const { AUDIT_STATUS } = require('../constants/auditStatus');
const logger = require('../utils/logger');

function getAuthMode() {
  return (process.env.AUTH_MODE || 'legacy').toLowerCase();
}

function isAccountsMode() {
  return getAuthMode() === 'accounts';
}

function isDualMode() {
  return getAuthMode() === 'dual';
}

function isAccountsOrDual() {
  return isAccountsMode() || isDualMode();
}

const ACCOUNT_TYPE_MAP = {
  admin: 'ADMIN',
  teacher: 'TEACHER',
  parent: 'PARENT',
  student: 'STUDENT',
  chat_user: 'CHAT_USER',
};

const LEGACY_MODEL_MAP = {
  ADMIN: 'user',
  TEACHER: 'teacher',
  PARENT: 'parent',
  STUDENT: 'student',
  CHAT_USER: 'chatProfile',
};

async function authenticate(normalizedLogin, password) {
  if (isAccountsMode()) {
    const account = await prisma.account.findUnique({ where: { normalizedLogin } });
    if (!account) return null;
    if (!account.isActive || account.isLocked) return null;

    const valid = await bcrypt.compare(password, account.passwordHash);
    if (!valid) return null;

    return {
      accountId: account.id,
      id: account.entityId,
      username: account.username,
      role: account.accountType.toLowerCase(),
      tokenVersion: account.tokenVersion,
      authSource: 'accounts',
    };
  }

  if (isDualMode()) {
    const account = await prisma.account.findUnique({ where: { normalizedLogin } });
    if (account) {
      if (!account.isActive || account.isLocked) return null;
      const valid = await bcrypt.compare(password, account.passwordHash);
      if (valid) {
        return {
          accountId: account.id,
          id: account.entityId,
          username: account.username,
          role: account.accountType.toLowerCase(),
          tokenVersion: account.tokenVersion,
          authSource: 'accounts',
        };
      }
    }
  }

  return await legacyAuthenticate(normalizedLogin, password);
}

async function legacyAuthenticate(normalizedLogin, password) {
  const results = await Promise.all([
    prisma.user.findFirst({ where: { username: normalizedLogin } }).then(u => u ? { ...u, role: 'admin', _src: 'user' } : null).catch(() => null),
    prisma.teacher.findFirst({ where: { OR: [{ username: normalizedLogin }, { email: normalizedLogin }], deletedAt: null } }).then(t => t ? { ...t, role: 'teacher', _src: 'teacher' } : null).catch(() => null),
    prisma.chatProfile.findFirst({ where: { username: normalizedLogin } }).then(c => c ? { ...c, role: 'chat_user', _src: 'chatProfile' } : null).catch(() => null),
    prisma.parent.findFirst({ where: { OR: [{ username: normalizedLogin }, { phone: normalizedLogin }], deletedAt: null } }).then(p => p ? { ...p, role: 'parent', _src: 'parent' } : null).catch(() => null),
    prisma.student.findFirst({ where: { OR: [{ username: normalizedLogin }, { studentPhone: normalizedLogin }], deletedAt: null } }).then(s => s ? { ...s, role: 'student', _src: 'student' } : null).catch(() => null),
  ]);

  const userData = results.find(Boolean);
  if (!userData) return null;

  const valid = userData.password && userData.password.startsWith('$2b$') && await bcrypt.compare(password, userData.password);
  if (!valid) return null;

  const tv = userData.tokenVersion ?? userData.token_version;
  return {
    accountId: null,
    id: userData.id,
    username: userData.username,
    role: userData.role,
    tokenVersion: tv ?? 1,
    authSource: 'legacy',
    _rawData: userData,
  };
}

async function findAccountByIdentity(identity) {
  const normalized = identity.trim().toLowerCase();

  if (isAccountsOrDual()) {
    const account = await prisma.account.findUnique({ where: { normalizedLogin: normalized } });
    if (account) return account;
  }

  if (isAccountsMode()) return null;

  return await legacyFindAccountByIdentity(normalized);
}

async function legacyFindAccountByIdentity(normalized) {
  const found = await Promise.all([
    prisma.user.findFirst({ where: { username: normalized } }),
    prisma.teacher.findFirst({ where: { OR: [{ username: normalized }, { email: normalized }], deletedAt: null } }),
    prisma.parent.findFirst({ where: { OR: [{ username: normalized }, { phone: normalized }], deletedAt: null } }),
    prisma.student.findFirst({ where: { OR: [{ username: normalized }, { studentPhone: normalized }], deletedAt: null } }),
    prisma.chatProfile.findFirst({ where: { username: normalized } }),
  ]);
  return found.find(Boolean) || null;
}

async function syncPassword(userId, userType, hashedPassword) {
  const modelName = LEGACY_MODEL_MAP[userType.toUpperCase()] || (userType === 'admin' ? 'user' : null);
  if (!modelName) return;

  if (isAccountsOrDual()) {
    const account = await prisma.account.findFirst({ where: { entityId: userId, accountType: userType.toUpperCase() } });
    if (account) {
      await prisma.account.update({
        where: { id: account.id },
        data: { passwordHash: hashedPassword, lastPasswordChangeAt: new Date() },
      });
    }
  }

  if (!isAccountsMode() && modelName) {
    try {
      if (modelName === 'chatProfile') {
        await prisma.chatProfile.update({ where: { id: userId }, data: { password: hashedPassword } });
      } else {
        await prisma[modelName].update({ where: { id: userId }, data: { password: hashedPassword } });
      }
    } catch (err) {
      logger.warn(`Legacy password sync failed for ${userType}:${userId}`, err);
    }
  }
}

async function incrementTokenVersion(userId, userType) {
  const upperType = userType.toUpperCase();

  if (isAccountsOrDual()) {
    const account = await prisma.account.findFirst({ where: { entityId: userId, accountType: upperType } });
    if (account) {
      await prisma.account.update({ where: { id: account.id }, data: { tokenVersion: { increment: 1 } } });
    }
  }

  // Only the User (admin) model has tokenVersion in legacy tables
  if (!isAccountsMode() && userType === 'admin') {
    try {
      await prisma.user.update({ where: { id: userId }, data: { tokenVersion: { increment: 1 } } });
    } catch { /* legacy sync best-effort */ }
  }
}

async function checkTokenVersion(userId, role, decodedVersion) {
  if (isAccountsOrDual()) {
    const account = await prisma.account.findFirst({ where: { entityId: userId, accountType: role.toUpperCase() } });
    if (account) {
      return account.tokenVersion === decodedVersion;
    }
  }

  if (isAccountsMode()) return true;

  // Only the User (admin) model has tokenVersion in legacy tables
  if (role === 'admin') {
    const current = await prisma.user.findUnique({ where: { id: userId }, select: { tokenVersion: true } });
    if (current) return current.tokenVersion === decodedVersion;
  }

  return true;
}

async function getAccountByEntity(entityType, entityId) {
  const upperType = entityType.toUpperCase();
  return prisma.account.findFirst({ where: { accountType: upperType, entityId } });
}

module.exports = {
  authenticate,
  findAccountByIdentity,
  syncPassword,
  incrementTokenVersion,
  checkTokenVersion,
  getAccountByEntity,
  getAuthMode,
  isAccountsMode,
  isDualMode,
  isAccountsOrDual,
};
