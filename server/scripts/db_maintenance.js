/**
 * Deep Database Maintenance & Consistency Utility
 * Run this to fix historical data inconsistencies.
 */

const { getDb } = require('./utils/db');
const logger = require('./utils/logger');

async function runMaintenance() {
    const db = await getDb();
    console.log('--- Starting Deep DB Maintenance ---');

    try {
        // 1. Check for Orphan Enrollments (students that don't exist)
        const orphans = await db.all('SELECT e.id, e.studentId FROM enrollments e LEFT JOIN students s ON e.studentId = s.id WHERE s.id IS NULL');
        if (orphans.length > 0) {
            console.log(`Found ${orphans.length} orphan enrollments. Cleaning up...`);
            for (const o of orphans) {
                await db.run('DELETE FROM enrollments WHERE id = ?', o.id);
            }
        }

        // 2. Sync sessionsUsed Counters
        // This is the most important part: ensure the stored count matches the actual records
        console.log('Syncing sessionsUsed counters with actual history...');
        const enrollments = await db.all('SELECT * FROM enrollments');
        for (const e of enrollments) {
            const actualCount = await db.get(`
                SELECT COUNT(*) as count 
                FROM sessions 
                WHERE studentId = ? 
                AND (subject = ? OR (subject IS NULL AND ? IS NULL))
                AND (
                    (teacherId IS NOT NULL AND ? IS NOT NULL AND teacherId = ?)
                    OR 
                    ((teacherId IS NULL OR ? IS NULL) AND teacherName = ?)
                )
                AND status = 'completed'`,
                [e.studentId, e.subject, e.subject, e.teacherId, e.teacherId, e.teacherId, e.teacher]
            );

            if (actualCount.count !== e.sessionsUsed) {
                console.log(`Fixing count for Student ${e.studentId}: ${e.sessionsUsed} -> ${actualCount.count}`);
                await db.run('UPDATE enrollments SET sessionsUsed = ? WHERE id = ?', [actualCount.count, e.id]);
            }
        }

        // 3. Fix NULL Teacher IDs
        // Map names to IDs wherever possible to strengthen foreign keys
        console.log('Mapping teacher names to IDs for stronger relational integrity...');
        const missingTeachers = await db.all('SELECT id, teacherName FROM sessions WHERE teacherId IS NULL AND teacherName IS NOT NULL');
        for (const s of missingTeachers) {
            const teacher = await db.get('SELECT id FROM teachers WHERE name = ?', s.teacherName);
            if (teacher) {
                await db.run('UPDATE sessions SET teacherId = ? WHERE id = ?', [teacher.id, s.id]);
            }
        }

        // 4. Vacuum Database (Compact and optimize)
        console.log('Compacting database file...');
        await db.run('VACUUM');

        console.log('--- Maintenance Complete Successfully ---');
    } catch (err) {
        logger.error('Maintenance failed', err);
        console.error('Maintenance error:', err);
    }
}

if (require.main === module) {
    runMaintenance().then(() => process.exit(0));
}

module.exports = { runMaintenance };
