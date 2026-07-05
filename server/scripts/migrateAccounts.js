const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { prisma } = require('../utils/prisma');
const { AUDIT_ACTIONS } = require('../constants/auditActions');
const { AUDIT_STATUS } = require('../constants/auditStatus');
const logger = require('../utils/logger');

const SOURCE_TABLES = [
  {
    name: 'users',
    model: 'user',
    accountType: 'ADMIN',
    loginField: 'username',
    legacyPwdField: 'password',
    skipDeleted: false,
    mapping: (row) => ({
      username: row.username,
      passwordHash: row.password,
      entityId: row.id,
      tokenVersion: row.tokenVersion ?? 1,
    }),
  },
  {
    name: 'teachers',
    model: 'teacher',
    accountType: 'TEACHER',
    loginField: 'username',
    legacyPwdField: 'password',
    skipDeleted: true,
    mapping: (row) => ({
      username: row.username,
      passwordHash: row.password,
      entityId: row.id,
    }),
  },
  {
    name: 'parents',
    model: 'parent',
    accountType: 'PARENT',
    loginField: 'username',
    legacyPwdField: 'password',
    skipDeleted: true,
    mapping: (row) => ({
      username: row.username,
      passwordHash: row.password,
      entityId: row.id,
    }),
  },
  {
    name: 'students',
    model: 'student',
    accountType: 'STUDENT',
    loginField: 'username',
    legacyPwdField: 'password',
    skipDeleted: true,
    mapping: (row) => ({
      username: row.username,
      passwordHash: row.password,
      entityId: row.id,
    }),
  },
  {
    name: 'chat_profiles',
    model: 'chatProfile',
    accountType: 'CHAT_USER',
    loginField: 'username',
    legacyPwdField: 'password',
    skipDeleted: false,
    mapping: (row) => ({
      username: row.username,
      passwordHash: row.password,
      entityId: row.id,
    }),
  },
];

async function migrateAccounts() {
  const report = {
    startedAt: new Date().toISOString(),
    finishedAt: null,
    sources: {},
    processed: 0,
    created: 0,
    duplicates: 0,
    skippedNoPassword: 0,
    failed: 0,
    errors: [],
    durationMs: 0,
  };

  logger.info('=== Account Migration Started ===');

  for (const source of SOURCE_TABLES) {
    logger.info(`Migrating ${source.name}...`);
    const sourceReport = { processed: 0, created: 0, duplicates: 0, skippedNoPassword: 0, failed: 0 };

    try {
      const where = {};
      if (source.skipDeleted) where.deletedAt = null;

      let records;
      if (source.model === 'chatProfile') {
        records = await prisma.chatProfile.findMany({ where });
      } else {
        records = await prisma[source.model].findMany({ where });
      }

      sourceReport.processed = records.length;

      for (const record of records) {
        const mapResult = source.mapping(record);
        const username = mapResult.username;

        if (!username) {
          sourceReport.skippedNoPassword++;
          continue;
        }

        const passwordHash = mapResult.passwordHash || mapResult.legacyPwdHash;
        if (!passwordHash) {
          sourceReport.skippedNoPassword++;
          continue;
        }

        const normalizedLogin = username.trim().toLowerCase();

        try {
          const existing = await prisma.account.findUnique({ where: { normalizedLogin } });
          if (existing) {
            sourceReport.duplicates++;
            continue;
          }

          await prisma.account.create({
            data: {
              username,
              normalizedLogin,
              passwordHash,
              accountType: source.accountType,
              entityId: mapResult.entityId,
              tokenVersion: mapResult.tokenVersion ?? 0,
              isActive: true,
              isLocked: false,
            },
          });

          sourceReport.created++;
        } catch (err) {
          sourceReport.failed++;
          report.errors.push({ source: source.name, entityId: mapResult.entityId, username, error: err.message });
        }
      }
    } catch (err) {
      sourceReport.failed = (sourceReport.processed || 1);
      report.errors.push({ source: source.name, error: `Query failed: ${err.message}` });
    }

    report.sources[source.name] = sourceReport;
    report.processed += sourceReport.processed;
    report.created += sourceReport.created;
    report.duplicates += sourceReport.duplicates;
    report.skippedNoPassword += sourceReport.skippedNoPassword;
    report.failed += sourceReport.failed;

    logger.info(`  ${source.name}: ${sourceReport.processed} processed, ${sourceReport.created} created, ${sourceReport.duplicates} duplicates, ${sourceReport.skippedNoPassword} no-pwd, ${sourceReport.failed} failed`);
  }

  report.finishedAt = new Date().toISOString();
  report.durationMs = new Date(report.finishedAt).getTime() - new Date(report.startedAt).getTime();

  const reportPath = path.join(__dirname, `migration-report-${Date.now()}.json`);
  require('fs').writeFileSync(reportPath, JSON.stringify(report, null, 2));
  logger.info(`Migration report saved to ${reportPath}`);

  logger.info('=== Account Migration Finished ===');
  logger.info(`Processed: ${report.processed} | Created: ${report.created} | Duplicates: ${report.duplicates} | Skipped (no pwd): ${report.skippedNoPassword} | Failed: ${report.failed} | Duration: ${report.durationMs}ms`);

  if (report.failed > 0) {
    logger.warn(`${report.failed} records failed. See report for details.`);
  }

  return report;
}

if (require.main === module) {
  migrateAccounts()
    .then((r) => { process.exit(r.failed > 0 ? 1 : 0); })
    .catch((err) => { logger.error('Migration failed', err); process.exit(1); });
}

module.exports = { migrateAccounts };
