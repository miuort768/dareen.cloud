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

// Login identity resolution must mirror the legacy lookup exactly
// (search order: admin → teacher → chatProfile → parent → student) so a
// collision resolves identically in every AUTH_MODE.
async function resolveLegacyIdentity(normalizedLogin) {
  const results = await Promise.all([
    prisma.user.findFirst({ where: { username: normalizedLogin } }).then(u => u ? { ...u, role: 'admin', _src: 'user' } : null).catch(() => null),
    prisma.teacher.findFirst({ where: { OR: [{ username: normalizedLogin }, { email: normalizedLogin }], deletedAt: null } }).then(t => t ? { ...t, role: 'teacher', _src: 'teacher' } : null).catch(() => null),
    prisma.chatProfile.findFirst({ where: { username: normalizedLogin } }).then(c => c ? { ...c, role: 'chat_user', _src: 'chatProfile' } : null).catch(() => null),
    prisma.parent.findFirst({ where: { OR: [{ username: normalizedLogin }, { phone: normalizedLogin }], deletedAt: null } }).then(p => p ? { ...p, role: 'parent', _src: 'parent' } : null).catch(() => null),
    prisma.student.findFirst({ where: { OR: [{ username: normalizedLogin }, { studentPhone: normalizedLogin }], deletedAt: null } }).then(s => s ? { ...s, role: 'student', _src: 'student' } : null).catch(() => null),
  ]);
  return results.find(Boolean) || null;
}

// In accounts/dual mode a login identity can be a username, an email, a phone
// or a studentPhone (all accepted in legacy). Accounts are keyed by
// normalizedLogin (username), so when the direct match fails we resolve the
// identity to its entity and fall back to that entity's account row.
async function findAccountForLogin(normalizedLogin) {
  const direct = await prisma.account.findUnique({ where: { normalizedLogin } }).catch(() => null);
  if (direct) return direct;

  const identity = await resolveLegacyIdentity(normalizedLogin);
  if (!identity) return null;

  return prisma.account.findFirst({
    where: { accountType: identity.role.toUpperCase(), entityId: identity.id },
  }).catch(() => null);
}

async function touchLastLogin(accountId) {
  try {
    await prisma.account.update({ where: { id: accountId }, data: { lastLoginAt: new Date() } });
  } catch { /* best-effort */ }
}

// Timing side-channel equalizer: without this, "account not found" returns
// ~instantly while "account exists" waits for bcrypt (~250ms) — letting an
// attacker enumerate valid usernames by measuring latency. A one-off dummy
// compare runs on every not-found path so both responses cost the same.
let dummyHash = null;
async function equalizeTiming(password) {
  try {
    if (!dummyHash) {
      dummyHash = await bcrypt.hash(`timing-equalizer-${Date.now()}`, 12);
    }
    await bcrypt.compare(password, dummyHash);
  } catch { /* best-effort */ }
}

// Best-effort "last seen" update by entity identity (used for throttled
// activity tracking so lastLoginAt reflects actual platform usage, not just
// logins). No-op when no account row exists (e.g. legacy-only deployments).
async function touchLastSeen(entityType, entityId) {
  try {
    const accountType = ACCOUNT_TYPE_MAP[entityType];
    if (!accountType || !entityId) return;
    await prisma.account.updateMany({
      where: { accountType, entityId },
      data: { lastLoginAt: new Date() },
    });
  } catch { /* best-effort */ }
}

async function authenticate(normalizedLogin, password) {
  if (isAccountsMode()) {
    const account = await findAccountForLogin(normalizedLogin);
    if (!account) {
      await equalizeTiming(password);
      return null;
    }
    if (!account.isActive || account.isLocked) {
      await equalizeTiming(password);
      return null;
    }

    const valid = await bcrypt.compare(password, account.passwordHash);
    if (!valid) return null;

    touchLastLogin(account.id);

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
    const account = await findAccountForLogin(normalizedLogin);
    if (account) {
      if (!account.isActive || account.isLocked) {
        await equalizeTiming(password);
        return null;
      }
      const valid = await bcrypt.compare(password, account.passwordHash);
      if (valid) {
        touchLastLogin(account.id);
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

  const legacyResult = await legacyAuthenticate(normalizedLogin, password);
  // Dual/accounts mode with no match anywhere: equalize before giving up so
  // the legacy-path miss is indistinguishable from an accounts-path miss.
  if (!legacyResult && (isAccountsMode() || isDualMode())) {
    await equalizeTiming(password);
  }
  return legacyResult;
}

async function legacyAuthenticate(normalizedLogin, password) {
  const userData = await resolveLegacyIdentity(normalizedLogin);
  if (!userData) {
    await equalizeTiming(password);
    return null;
  }

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

// Usernames are stored lowercase (login lowercases input). Collision check must
// be case-insensitive so a new account can't lock out an existing one (login
// search order: user → teacher → chatProfile → parent → student).
async function normalizeUsername(username) {
  const value = typeof username === 'string' ? username.trim() : '';
  return value ? value.toLowerCase() : null;
}

async function findIdentityByUsername(username) {
  const normalized = await normalizeUsername(username);
  if (!normalized) return null;

  // NOTE: no deletedAt filter here — this checks DB unique constraints, which
  // still apply to soft-deleted rows (username is @unique per table). Login
  // resolution uses resolveLegacyIdentity which filters deleted rows.
  const hits = await Promise.all([
    prisma.user.findFirst({ where: { username: { equals: normalized, mode: 'insensitive' } }, select: { id: true, username: true } }),
    prisma.teacher.findFirst({ where: { username: { equals: normalized, mode: 'insensitive' } }, select: { id: true, username: true } }),
    prisma.chatProfile.findFirst({ where: { username: { equals: normalized, mode: 'insensitive' } }, select: { id: true, username: true } }),
    prisma.parent.findFirst({ where: { username: { equals: normalized, mode: 'insensitive' } }, select: { id: true, username: true } }),
    prisma.student.findFirst({ where: { username: { equals: normalized, mode: 'insensitive' } }, select: { id: true, username: true } }),
    // The unified accounts table is the authoritative global-unique source when present
    prisma.account.findUnique({ where: { normalizedLogin: normalized } }).then(a => a ? { id: a.entityId, username: a.username } : null).catch(() => null),
  ]);

  return hits.find(Boolean) || null;
}

// Keep the unified accounts table in sync with runtime create/update/delete.
// No-op in legacy mode (login reads legacy tables only); guards against the
// accounts table being absent in some deployments.
async function syncAccount({ entityType, entityId, username, passwordHash, isActive = true }) {
  if (!isAccountsOrDual() || !entityId) return null;
  const accountType = ACCOUNT_TYPE_MAP[entityType];
  if (!accountType) return null;

  const normalizedLogin = await normalizeUsername(username);
  if (!normalizedLogin) return null;

  try {
    const existing = await prisma.account.findFirst({ where: { accountType, entityId } });
    if (existing) {
      return prisma.account.update({
        where: { id: existing.id },
        data: {
          username: normalizedLogin,
          normalizedLogin,
          ...(passwordHash ? { passwordHash } : {}),
          isActive,
        },
      });
    }
    if (!passwordHash) return null;
    return prisma.account.create({
      data: {
        username: normalizedLogin,
        normalizedLogin,
        passwordHash,
        accountType,
        entityId,
        tokenVersion: 0,
        isActive,
        isLocked: false,
      },
    });
  } catch (err) {
    logger.warn('Account sync skipped', err);
    return null;
  }
}

async function deactivateAccount(entityType, entityId) {
  if (!isAccountsOrDual() || !entityId) return;
  const accountType = ACCOUNT_TYPE_MAP[entityType];
  if (!accountType) return;
  try {
    await prisma.account.updateMany({
      where: { accountType, entityId },
      data: { isActive: false },
    });
  } catch (err) {
    logger.warn('Account deactivate skipped', err);
  }
}

async function deactivateBulkAccounts(entityType) {
  if (!isAccountsOrDual()) return;
  const accountType = ACCOUNT_TYPE_MAP[entityType];
  if (!accountType) return;
  try {
    await prisma.account.updateMany({
      where: { accountType },
      data: { isActive: false },
    });
  } catch (err) {
    logger.warn('Account bulk deactivate skipped', err);
  }
}

// Verify a raw password against the current account (accounts/dual mode)
// or the legacy entity password (legacy mode).
async function verifyAccountPassword(userId, role, password) {
  if (!password || typeof password !== 'string') return false;
  try {
    const account = await prisma.account.findFirst({
      where: { accountType: role.toUpperCase(), entityId: userId },
    }).catch(() => null);
    if (account && account.passwordHash) {
      return await bcrypt.compare(password, account.passwordHash);
    }

    const userData = await prisma.user.findUnique({ where: { id: userId } }).catch(() => null);
    if (userData && userData.password && userData.password.startsWith('$2b$')) {
      return await bcrypt.compare(password, userData.password);
    }

    return false;
  } catch (error) {
    return false;
  }
}

module.exports = {
  authenticate,
  verifyAccountPassword,
  findAccountByIdentity,
  syncPassword,
  incrementTokenVersion,
  checkTokenVersion,
  getAccountByEntity,
  touchLastSeen,
  getAuthMode,
  isAccountsMode,
  isDualMode,
  isAccountsOrDual,
  normalizeUsername,
  findIdentityByUsername,
  syncAccount,
  deactivateAccount,
  deactivateBulkAccounts,
};
