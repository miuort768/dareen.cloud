import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
const bcrypt = require('bcrypt');
const { prisma } = require('../../../utils/prisma');
const { migrateAccounts } = require('../../../scripts/migrateAccounts');
const { verifyAccounts } = require('../../../scripts/verifyAccounts');

const SUFFIX = `t${Date.now()}`;
const TEST_PASSWORD = 'TestPass123!';
let hashedPassword;

const testUsers = {
  admin: { username: `admin_${SUFFIX}`, password: TEST_PASSWORD, name: 'Test Admin', role: 'admin' },
  teacher: { username: `teacher_${SUFFIX}`, password: TEST_PASSWORD, name: 'Test Teacher', subject: 'Math', email: `teacher_${SUFFIX}@test.com` },
  parent: { username: `parent_${SUFFIX}`, password: TEST_PASSWORD, name: 'Test Parent', phone: `+9665${SUFFIX.slice(-8)}` },
  student: { username: `student_${SUFFIX}`, password: TEST_PASSWORD, name: 'Test Student', studentPhone: `+9665${SUFFIX.slice(-8)}x` },
  chatUser: { username: `chat_${SUFFIX}`, password: TEST_PASSWORD, name: 'Test Chat' },
};

let createdIds = {};

// Save and restore AUTH_MODE
const origAuthMode = process.env.AUTH_MODE;

function setAuthMode(mode) {
  process.env.AUTH_MODE = mode;
}

function restoreAuthMode() {
  if (origAuthMode) process.env.AUTH_MODE = origAuthMode;
  else delete process.env.AUTH_MODE;
}

beforeAll(async () => {
  hashedPassword = await bcrypt.hash(TEST_PASSWORD, 4);

  const admin = await prisma.user.create({
    data: { name: testUsers.admin.name, username: testUsers.admin.username, password: hashedPassword, role: 'admin' },
  });
  createdIds.admin = admin.id;

  const teacher = await prisma.teacher.create({
    data: { name: testUsers.teacher.name, username: testUsers.teacher.username, email: testUsers.teacher.email, subject: testUsers.teacher.subject, password: hashedPassword },
  });
  createdIds.teacher = teacher.id;

  const parent = await prisma.parent.create({
    data: { name: testUsers.parent.name, username: testUsers.parent.username, phone: testUsers.parent.phone, password: hashedPassword },
  });
  createdIds.parent = parent.id;

  const student = await prisma.student.create({
    data: { name: testUsers.student.name, username: testUsers.student.username, studentPhone: testUsers.student.studentPhone, password: hashedPassword },
  });
  createdIds.student = student.id;

  const chatProfile = await prisma.chatProfile.create({
    data: { name: testUsers.chatUser.name, username: testUsers.chatUser.username, password: hashedPassword },
  });
  createdIds.chatUser = chatProfile.id;
}, 15000);

afterAll(async () => {
  // Cleanup: remove test users from both legacy and accounts
  const cleanup = [
    prisma.user.deleteMany({ where: { username: { startsWith: `admin_${SUFFIX.slice(0, 8)}` } } }),
    prisma.teacher.deleteMany({ where: { username: { startsWith: `teacher_${SUFFIX.slice(0, 8)}` } } }),
    prisma.parent.deleteMany({ where: { username: { startsWith: `parent_${SUFFIX.slice(0, 8)}` } } }),
    prisma.student.deleteMany({ where: { username: { startsWith: `student_${SUFFIX.slice(0, 8)}` } } }),
    prisma.chatProfile.deleteMany({ where: { username: { startsWith: `chat_${SUFFIX.slice(0, 8)}` } } }),
    prisma.account.deleteMany({ where: { normalizedLogin: { startsWith: `admin_${SUFFIX.slice(0, 8)}` } } }),
    prisma.account.deleteMany({ where: { normalizedLogin: { startsWith: `teacher_${SUFFIX.slice(0, 8)}` } } }),
    prisma.account.deleteMany({ where: { normalizedLogin: { startsWith: `parent_${SUFFIX.slice(0, 8)}` } } }),
    prisma.account.deleteMany({ where: { normalizedLogin: { startsWith: `student_${SUFFIX.slice(0, 8)}` } } }),
    prisma.account.deleteMany({ where: { normalizedLogin: { startsWith: `chat_${SUFFIX.slice(0, 8)}` } } }),
  ];
  await Promise.all(cleanup);
  restoreAuthMode();
}, 15000);

async function loginAs(username, password) {
  const { authenticate } = require('../../../services/authAccounts');
  return authenticate(username.trim().toLowerCase(), password);
}

describe('Account Migration Integration', () => {
  it('migrates all 5 legacy tables to accounts', async () => {
    const report = await migrateAccounts();
    expect(report.created).toBeGreaterThanOrEqual(5);
    expect(report.failed).toBe(0);
  }, 20000);

  it('verification passes after migration', async () => {
    const result = await verifyAccounts();
    expect(result.passed).toBe(true);
  }, 20000);
});

describe('Login in all AUTH_MODEs', () => {
  const userCases = [
    { type: 'admin', username: testUsers.admin.username, expectedRole: 'admin' },
    { type: 'teacher', username: testUsers.teacher.username, expectedRole: 'teacher' },
    { type: 'parent', username: testUsers.parent.username, expectedRole: 'parent' },
    { type: 'student', username: testUsers.student.username, expectedRole: 'student' },
    { type: 'chat_user', username: testUsers.chatUser.username, expectedRole: 'chat_user' },
  ];

  describe('AUTH_MODE=legacy', () => {
    beforeAll(() => setAuthMode('legacy'));
    afterAll(restoreAuthMode);

    for (const uc of userCases) {
      it(`logs in as ${uc.type}`, async () => {
        const result = await loginAs(uc.username, TEST_PASSWORD);
        expect(result).not.toBeNull();
        expect(result.authSource).toBe('legacy');
        expect(result.role).toBe(uc.expectedRole);
      });
    }
  });

  describe('AUTH_MODE=dual', () => {
    beforeAll(() => setAuthMode('dual'));
    afterAll(restoreAuthMode);

    for (const uc of userCases) {
      it(`logs in as ${uc.type} from accounts`, async () => {
        const result = await loginAs(uc.username, TEST_PASSWORD);
        expect(result).not.toBeNull();
        expect(result.role).toBe(uc.expectedRole);
      });
    }
  });

  describe('AUTH_MODE=accounts', () => {
    beforeAll(() => setAuthMode('accounts'));
    afterAll(restoreAuthMode);

    for (const uc of userCases) {
      it(`logs in as ${uc.type} from accounts only`, async () => {
        const result = await loginAs(uc.username, TEST_PASSWORD);
        expect(result).not.toBeNull();
        expect(result.authSource).toBe('accounts');
        expect(result.role).toBe(uc.expectedRole);
      });
    }
  });

  describe('rejects invalid password across all modes', () => {
    for (const mode of ['legacy', 'dual', 'accounts']) {
      it(`rejects wrong password in ${mode} mode`, async () => {
        setAuthMode(mode);
        const result = await loginAs(testUsers.admin.username, 'WrongPass123!');
        expect(result).toBeNull();
      });
    }
    afterAll(restoreAuthMode);
  });

  describe('rejects unknown user across all modes', () => {
    for (const mode of ['legacy', 'dual', 'accounts']) {
      it(`rejects unknown user in ${mode} mode`, async () => {
        setAuthMode(mode);
        const result = await loginAs(`nonexistent_${SUFFIX}`, TEST_PASSWORD);
        expect(result).toBeNull();
      });
    }
    afterAll(restoreAuthMode);
  });
});

describe('Dual Write — password sync', () => {
  const NEW_PASSWORD = 'NewPass456!';
  let newHash;

  beforeAll(async () => {
    newHash = await bcrypt.hash(NEW_PASSWORD, 4);
    setAuthMode('dual');
  });

  afterAll(restoreAuthMode);

  it('syncs password to both accounts and legacy in dual mode', async () => {
    const { syncPassword } = require('../../../services/authAccounts');
    const userId = createdIds.admin;
    await syncPassword(userId, 'admin', newHash);

    // Verify accounts has the new password
    const account = await prisma.account.findFirst({ where: { entityId: userId, accountType: 'ADMIN' } });
    expect(account).not.toBeNull();
    const accountValid = await bcrypt.compare(NEW_PASSWORD, account.passwordHash);
    expect(accountValid).toBe(true);

    // Verify legacy also has the new password
    const legacyUser = await prisma.user.findUnique({ where: { id: userId } });
    expect(legacyUser).not.toBeNull();
    const legacyValid = await bcrypt.compare(NEW_PASSWORD, legacyUser.password);
    expect(legacyValid).toBe(true);
  });

  it('can login with new password via accounts source', async () => {
    const result = await loginAs(testUsers.admin.username, NEW_PASSWORD);
    expect(result).not.toBeNull();
    expect(result.authSource).toBe('accounts');
  });
});

describe('Dual Write — tokenVersion sync', () => {
  beforeAll(() => setAuthMode('dual'));
  afterAll(restoreAuthMode);

  it('increments tokenVersion in accounts for teacher', async () => {
    const { incrementTokenVersion } = require('../../../services/authAccounts');
    const userId = createdIds.teacher;

    const accountBefore = await prisma.account.findFirst({ where: { entityId: userId, accountType: 'TEACHER' } });
    const tvBefore = accountBefore?.tokenVersion ?? 0;

    await incrementTokenVersion(userId, 'teacher');

    const accountAfter = await prisma.account.findFirst({ where: { entityId: userId, accountType: 'TEACHER' } });
    expect(accountAfter.tokenVersion).toBe(tvBefore + 1);
  });

  it('increments tokenVersion in accounts and legacy for admin', async () => {
    const { incrementTokenVersion } = require('../../../services/authAccounts');
    const userId = createdIds.admin;

    const accountBefore = await prisma.account.findFirst({ where: { entityId: userId, accountType: 'ADMIN' } });
    const legacyBefore = await prisma.user.findUnique({ where: { id: userId } });
    const tvBefore = { account: accountBefore?.tokenVersion ?? 0, legacy: legacyBefore?.tokenVersion ?? 0 };

    await incrementTokenVersion(userId, 'admin');

    const accountAfter = await prisma.account.findFirst({ where: { entityId: userId, accountType: 'ADMIN' } });
    const legacyAfter = await prisma.user.findUnique({ where: { id: userId } });

    expect(accountAfter.tokenVersion).toBe(tvBefore.account + 1);
    expect(legacyAfter.tokenVersion).toBe(tvBefore.legacy + 1);
  });
});

describe('CheckTokenVersion across modes', () => {
  const getUserId = () => createdIds.admin;
  const getRole = () => 'admin';

  it('returns true for correct version in legacy mode', async () => {
    const { checkTokenVersion } = require('../../../services/authAccounts');
    const userId = getUserId();
    setAuthMode('legacy');
    const account = await prisma.account.findFirst({ where: { entityId: userId, accountType: 'ADMIN' } });
    const result = await checkTokenVersion(userId, 'admin', account.tokenVersion);
    expect(result).toBe(true);
    restoreAuthMode();
  });

  it('returns true for correct version in dual mode', async () => {
    const { checkTokenVersion } = require('../../../services/authAccounts');
    const userId = getUserId();
    setAuthMode('dual');
    const account = await prisma.account.findFirst({ where: { entityId: userId, accountType: 'ADMIN' } });
    const result = await checkTokenVersion(userId, 'admin', account.tokenVersion);
    expect(result).toBe(true);
    restoreAuthMode();
  });

  it('returns true for correct version in accounts mode', async () => {
    const { checkTokenVersion } = require('../../../services/authAccounts');
    const userId = getUserId();
    setAuthMode('accounts');
    const account = await prisma.account.findFirst({ where: { entityId: userId, accountType: 'ADMIN' } });
    const result = await checkTokenVersion(userId, 'admin', account.tokenVersion);
    expect(result).toBe(true);
    restoreAuthMode();
  });

  it('returns false for mismatched version', async () => {
    const { checkTokenVersion } = require('../../../services/authAccounts');
    const userId = getUserId();
    setAuthMode('dual');
    const result = await checkTokenVersion(userId, 'admin', 999999);
    expect(result).toBe(false);
    restoreAuthMode();
  });
});
