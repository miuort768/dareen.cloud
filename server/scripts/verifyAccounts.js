const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { prisma } = require('../utils/prisma');
const logger = require('../utils/logger');

const VALIDATION_CHECKS = [];

function check(label, fn) {
  VALIDATION_CHECKS.push({ label, fn });
}

check('Admin count', async () => {
  const legacy = await prisma.user.count();
  const accounts = await prisma.account.count({ where: { accountType: 'ADMIN' } });
  return { legacy, accounts, match: legacy === accounts };
});

check('Teacher count', async () => {
  const legacy = await prisma.teacher.count({ where: { deletedAt: null, NOT: [{ username: null }, { password: null }] } });
  const accounts = await prisma.account.count({ where: { accountType: 'TEACHER' } });
  return { legacy, accounts, match: legacy === accounts };
});

check('Parent count', async () => {
  const legacy = await prisma.parent.count({ where: { deletedAt: null, NOT: [{ username: null }, { password: null }] } });
  const accounts = await prisma.account.count({ where: { accountType: 'PARENT' } });
  return { legacy, accounts, match: legacy === accounts };
});

check('Student count', async () => {
  const legacy = await prisma.student.count({ where: { deletedAt: null, NOT: [{ username: null }, { password: null }] } });
  const accounts = await prisma.account.count({ where: { accountType: 'STUDENT' } });
  return { legacy, accounts, match: legacy === accounts };
});

check('Chat profile count', async () => {
  const legacy = await prisma.chatProfile.count();
  const accounts = await prisma.account.count({ where: { accountType: 'CHAT_USER' } });
  return { legacy, accounts, match: legacy === accounts };
});

check('Accounts without passwordHash', async () => {
  const count = await prisma.account.count({ where: { passwordHash: '' } });
  return { count, match: count === 0 };
});

check('Accounts without entityId', async () => {
  const count = await prisma.account.count({ where: { entityId: '' } });
  return { count, match: count === 0 };
});

check('Duplicate normalizedLogin', async () => {
  const dupes = await prisma.$queryRawUnsafe(`
    SELECT "normalizedLogin", COUNT(*) as cnt FROM accounts GROUP BY "normalizedLogin" HAVING COUNT(*) > 1
  `);
  const count = Array.isArray(dupes) ? dupes.length : 0;
  return { count, match: count === 0 };
});

check('Orphan accounts (no matching legacy record)', async () => {
  const all = await prisma.account.findMany({ select: { accountType: true, entityId: true } });
  let orphanCount = 0;
  for (const acc of all) {
    let exists;
    const modelMap = { ADMIN: 'user', TEACHER: 'teacher', PARENT: 'parent', STUDENT: 'student', CHAT_USER: 'chatProfile' };
    const model = modelMap[acc.accountType];
    if (!model) continue;
    if (model === 'chatProfile') {
      exists = await prisma.chatProfile.findUnique({ where: { id: acc.entityId }, select: { id: true } });
    } else {
      exists = await prisma[model].findUnique({ where: { id: acc.entityId }, select: { id: true } });
    }
    if (!exists) orphanCount++;
  }
  return { count: orphanCount, match: orphanCount === 0 };
});

async function verifyAccounts() {
  logger.info('=== Account Verification Started ===');

  const results = [];
  let allPassed = true;

  for (const checkDef of VALIDATION_CHECKS) {
    try {
      const result = await checkDef.fn();
      const passed = result.match;
      results.push({ label: checkDef.label, passed, result });
      if (!passed) allPassed = false;
      logger.info(`  ${passed ? '✓' : '✗'} ${checkDef.label}: ${JSON.stringify(result)}`);
    } catch (err) {
      results.push({ label: checkDef.label, passed: false, error: err.message });
      allPassed = false;
      logger.error(`  ✗ ${checkDef.label}: ERROR - ${err.message}`);
    }
  }

  logger.info('=== Verification Summary ===');
  logger.info(allPassed ? '✓ ALL CHECKS PASSED' : `✗ ${results.filter(r => !r.passed).length} CHECK(S) FAILED`);

  return { passed: allPassed, results };
}

if (require.main === module) {
  verifyAccounts()
    .then((r) => process.exit(r.passed ? 0 : 1))
    .catch((err) => { logger.error('Verification failed', err); process.exit(1); });
}

module.exports = { verifyAccounts };
