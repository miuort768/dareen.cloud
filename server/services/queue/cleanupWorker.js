const { createWorker } = require('./index');
const { getQueues, QUEUE_NAMES } = require('./queues');
const logger = require('../../utils/logger');

function getPrisma() {
    return require('../../utils/prisma').prisma;
}

class CleanupWorker {
    constructor() {
        this.metrics = {};
    }

    async process(job) {
        const { tasks, dryRun } = job.data || {};
        const start = Date.now();

        const config = {
            sessionMaxAgeHours: job.data?.config?.sessionMaxAgeHours ?? 24,
            tempFileMaxAgeHours: job.data?.config?.tempFileMaxAgeHours ?? 24,
            notificationRetentionDays: job.data?.config?.notificationRetentionDays ?? 30,
        };

        const taskList = Array.isArray(tasks) ? tasks : ['active_sessions', 'temp_uploads', 'push_subscriptions', 'old_notifications'];
        const isDryRun = dryRun === true;
        const results = { tasks: {}, startTime: new Date().toISOString(), dryRun: isDryRun };

        logger.info('Cleanup job ' + job.id + ' started (dryRun=' + isDryRun + '): ' + taskList.join(', '));

        if (isDryRun) {
            logger.info('DRY RUN MODE — no data will be deleted');
        }

        for (const task of taskList) {
            const taskStart = Date.now();
            results.tasks[task] = { processed: 0, deleted: 0, skipped: 0, errors: 0, durationMs: 0, dryRun: isDryRun };

            try {
                switch (task) {
                    case 'active_sessions':
                        await this.cleanupActiveSessions(results.tasks[task], config, isDryRun);
                        break;
                    case 'temp_uploads':
                        await this.cleanupTempUploads(results.tasks[task], config, isDryRun);
                        break;
                    case 'push_subscriptions':
                        await this.cleanupPushSubscriptions(results.tasks[task], isDryRun);
                        break;
                    case 'old_notifications':
                        await this.cleanupOldNotifications(results.tasks[task], config, isDryRun);
                        break;
                    default:
                        results.tasks[task].skipped = 1;
                        logger.warn('Unknown cleanup task: ' + task);
                }
            } catch (err) {
                results.tasks[task].errors++;
                logger.error('Cleanup task ' + task + ' failed: ' + (err.message || err));
            }

            results.tasks[task].durationMs = Date.now() - taskStart;
        }

        results.totalDurationMs = Date.now() - start;

        const totalDeleted = Object.values(results.tasks).reduce((s, t) => s + t.deleted, 0);
        const totalErrors = Object.values(results.tasks).reduce((s, t) => s + t.errors, 0);
        logger.info('Cleanup job ' + job.id + ' complete: deleted=' + totalDeleted + ' errors=' + totalErrors + ' duration=' + results.totalDurationMs + 'ms');

        return results;
    }

    async cleanupActiveSessions(metrics, config, dryRun) {
        const prisma = getPrisma();
        const cutoff = new Date(Date.now() - config.sessionMaxAgeHours * 60 * 60 * 1000).toISOString();

        const oldSessions = await prisma.activeSession.findMany({
            where: { startedAt: { lt: cutoff } },
            select: { id: true, studentId: true, teacherId: true, subject: true, startedAt: true },
        });

        metrics.processed = oldSessions.length;
        logger.info('  active_sessions: found ' + oldSessions.length + ' old sessions (cutoff=' + cutoff + ')');

        if (oldSessions.length > 0) {
            for (const session of oldSessions.slice(0, 5)) {
                logger.info('    -> ' + session.id + ': ' + session.subject + ' started ' + session.startedAt);
            }
            if (oldSessions.length > 5) {
                logger.info('    ... and ' + (oldSessions.length - 5) + ' more');
            }

            if (!dryRun) {
                const deleted = await prisma.activeSession.deleteMany({
                    where: { id: { in: oldSessions.map((s) => s.id) } },
                });
                metrics.deleted = deleted.count;
            } else {
                metrics.deleted = oldSessions.length;
            }
        }
    }

    async cleanupTempUploads(metrics, config, dryRun) {
        const fs = require('fs');
        const path = require('path');

        const tempDir = path.join(__dirname, '..', '..', '..', 'uploads', 'temp');

        try {
            await fs.promises.access(tempDir, fs.constants.F_OK);
        } catch {
            metrics.processed = 0;
            metrics.skipped = 1;
            logger.info('  temp_uploads: directory does not exist, skipped');
            return;
        }

        const cutoff = Date.now() - config.tempFileMaxAgeHours * 60 * 60 * 1000;
        const files = await fs.promises.readdir(tempDir);

        metrics.processed = files.length;
        let deleted = 0;

        for (const file of files) {
            try {
                const filePath = path.join(tempDir, file);
                const stat = await fs.promises.stat(filePath);
                if (stat.isFile() && stat.mtimeMs < cutoff) {
                    deleted++;
                    if (!dryRun) {
                        await fs.promises.unlink(filePath);
                    }
                }
            } catch (err) {
                metrics.errors++;
                logger.warn('  temp_uploads: error processing ' + file + ': ' + (err.message || err));
            }
        }

        metrics.deleted = deleted;
        logger.info('  temp_uploads: ' + deleted + '/' + files.length + ' files to delete (cutoff=' + new Date(cutoff).toISOString() + ')');
    }

    async cleanupPushSubscriptions(metrics, dryRun) {
        const prisma = getPrisma();
        const duplicates = await prisma.$queryRawUnsafe(`
            SELECT userId, subscription, COUNT(*) as cnt, MIN(id) as keepId
            FROM push_subscriptions
            GROUP BY userId, subscription
            HAVING COUNT(*) > 1
        `);

        metrics.processed = Array.isArray(duplicates) ? duplicates.length : 0;

        if (!Array.isArray(duplicates) || duplicates.length === 0) {
            logger.info('  push_subscriptions: no duplicates found');
            return;
        }

        let deleteCount = 0;
        for (const dup of duplicates) {
            const cnt = Number(dup.cnt);
            const keepId = Number(dup.keepId);
            const toDelete = cnt - 1;

            if (toDelete > 0) {
                if (!dryRun) {
                    await prisma.pushSubscription.deleteMany({
                        where: {
                            userId: dup.userId,
                            subscription: dup.subscription,
                            id: { not: keepId },
                        },
                    });
                }
                deleteCount += toDelete;
            }
        }

        metrics.deleted = deleteCount;
        logger.info('  push_subscriptions: ' + deleteCount + ' duplicates to delete from ' + metrics.processed + ' groups');
    }

    async cleanupOldNotifications(metrics, config, dryRun) {
        const prisma = getPrisma();
        const retentionMs = config.notificationRetentionDays * 24 * 60 * 60 * 1000;
        const cutoff = new Date(Date.now() - retentionMs).toISOString();

        const oldRead = await prisma.notification.findMany({
            where: {
                read: 1,
                time: { lt: cutoff },
            },
            select: { id: true, time: true, title: true },
        });

        metrics.processed = oldRead.length;
        logger.info('  old_notifications: found ' + oldRead.length + ' read notifications older than ' + cutoff);

        if (oldRead.length > 0) {
            for (const n of oldRead.slice(0, 5)) {
                logger.info('    -> ' + n.id + ': ' + (n.title || '?') + ' at ' + n.time);
            }
            if (oldRead.length > 5) {
                logger.info('    ... and ' + (oldRead.length - 5) + ' more');
            }

            if (!dryRun) {
                const deleted = await prisma.notification.deleteMany({
                    where: { id: { in: oldRead.map((n) => n.id) } },
                });
                metrics.deleted = deleted.count;
            } else {
                metrics.deleted = oldRead.length;
            }
        }
    }
}

function initialize() {
    const queues = getQueues();

    const cleanupWorker = createWorker(QUEUE_NAMES.CLEANUP, async (job) => {
        const worker = new CleanupWorker();
        return worker.process(job);
    }, {
        concurrency: 1,
    });

    cleanupWorker.on('completed', (job) => {
        const result = job.returnvalue;
        if (result) {
            const total = Object.values(result.tasks || {}).reduce((s, t) => s + t.deleted, 0);
            const errors = Object.values(result.tasks || {}).reduce((s, t) => s + t.errors, 0);
            if (result.dryRun) {
                logger.info('Cleanup dry-run: would delete ' + total + ' items (errors=' + errors + ')');
            } else {
                logger.info('Cleanup completed: deleted ' + total + ' items (errors=' + errors + ')');
            }
        }
    });

    cleanupWorker.on('failed', (job, err) => {
        logger.error('Cleanup job ' + (job?.id || '?') + ' failed: ' + (err?.message || err));
    });

    return cleanupWorker;
}

module.exports = { initialize, CleanupWorker };
