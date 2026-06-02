/**
 * Shared database helper functions
 */

const getStudentEnrollments = async (db, studentId) => {
    // HIGH PERFORMANCE: Reading pre-calculated sessionsUsed column
    // The sessions route ensures this remains accurate via atomic updates.
    const query = `
        SELECT e.* FROM enrollments e 
        WHERE e.studentId = ?
    `;

    const enrollments = await db.all(query, [studentId]);

    return enrollments.map(e => ({
        ...e,
        schedule: JSON.parse(e.schedule || '[]')
    }));
};

/**
 * Executes a callback within a transaction.
 * @param {object} db - The database instance.
 * @param {function} callback - async function(db)
 */
const withTransaction = async (db, callback) => {
    const logger = require('./logger');
    // Important: Use BEGIN IMMEDIATE for SQLite to handle concurrent writes better in WAL mode
    await db.run('BEGIN IMMEDIATE TRANSACTION');
    try {
        const result = await callback(db);
        await db.run('COMMIT');
        return result;
    } catch (err) {
        await db.run('ROLLBACK');
        logger.error('Transaction rolled back', err);
        throw err;
    }
};

/**
 * Robust helper to increment or decrement used sessions in an enrollment.
 * Centralized here to ensure consistency across routes.
 */
const updateEnrollmentSessions = async (tx, { studentId, subject, teacherName, teacherId, delta }) => {
    const logger = require('./logger');

    // Ensure we have a teacherId if possible (lookup by name if only name is provided)
    let finalTid = teacherId;
    if (!finalTid && teacherName) {
        const row = await tx.get('SELECT id FROM teachers WHERE LOWER(TRIM(name)) = LOWER(TRIM(?))', [teacherName]);
        if (row) finalTid = row.id;
    }

    const sql = delta > 0
        ? `UPDATE enrollments SET sessionsUsed = sessionsUsed + 1`
        : `UPDATE enrollments SET sessionsUsed = MAX(0, sessionsUsed - 1)`;

    // MATCHING CRITERIA: studentId + subject AND (teacherId OR teacherName)
    const res = await tx.run(
        `${sql} WHERE LOWER(TRIM(studentId)) = LOWER(TRIM(?)) 
         AND LOWER(TRIM(subject)) = LOWER(TRIM(?)) 
         AND (
            (teacherId IS NOT NULL AND LOWER(TRIM(teacherId)) = LOWER(TRIM(?)))
            OR 
            (LOWER(TRIM(teacher)) = LOWER(TRIM(?)))
         )`,
        [studentId, subject, finalTid || 'NEVER_MATCH', teacherName]
    );

    if (res.changes === 0) {
        logger.warn(`ENROLLMENT SYNC FAILED: No record found for Std: ${studentId}, Sub: ${subject}, Tea: ${teacherName}`);
    } else {
        logger.info(`ENROLLMENT SYNC SUCCESS: Updated ${studentId} (${delta})`);
    }
    return res.changes;
};

const getStudentsWithEnrollments = async (db, studentIds = null) => {
    const logger = require('./logger');
    try {
        let studentsSql = 'SELECT * FROM students';
        const params = [];

        if (studentIds && studentIds.length > 0) {
            studentsSql += ` WHERE id IN (${studentIds.map(() => '?').join(',')})`;
            params.push(...studentIds);
        }

        const students = await db.all(studentsSql, params);

        // HIGH PERFORMANCE: Simple SELECT instead of expensive aggregate JOIN
        let enrollmentsSql = 'SELECT * FROM enrollments';
        if (studentIds) {
            enrollmentsSql += ` WHERE studentId IN (${studentIds.map(() => '?').join(',')})`;
        }

        const enrollments = await db.all(enrollmentsSql, params);

        const enrollmentMap = enrollments.reduce((acc, e) => {
            const formatted = {
                ...e,
                schedule: e.schedule ? (typeof e.schedule === 'string' ? JSON.parse(e.schedule) : e.schedule) : []
            };
            if (!acc[e.studentId]) acc[e.studentId] = [];
            acc[e.studentId].push(formatted);
            return acc;
        }, {});

        return students.map(s => ({
            ...s,
            enrollments: enrollmentMap[s.id] || []
        }));
    } catch (err) {
        logger.error('Failed to get students with enrollments (Optimized)', err);
        throw err;
    }
};

/**
 * Award points to a student and log the action.
 * Also checks for and awards badges based on total points.
 */
const awardPoints = async (tx, { studentId, amount, action }) => {
    const logger = require('./logger');
    const { v4: uuidv4 } = require('uuid');

    try {
        // 1. Log the points
        await tx.run(
            'INSERT INTO points_log (id, studentId, amount, action) VALUES (?, ?, ?, ?)',
            [uuidv4(), studentId, amount, action]
        );

        // 2. Update student total
        await tx.run(
            'UPDATE students SET totalPoints = totalPoints + ? WHERE id = ?',
            [amount, studentId]
        );

        // 3. Check for badges
        const student = await tx.get('SELECT totalPoints, badges FROM students WHERE id = ?', [studentId]);
        if (student) {
            let badges = [];
            try { badges = JSON.parse(student.badges || '[]'); } catch(e) {}
            
            const milestones = [
                { threshold: 500, name: 'شاطر ومجتهد', color: 'emerald' },
                { threshold: 1500, name: 'العبقري / العبقرية', color: 'blue' },
                { threshold: 2500, name: 'بطل المعهد', color: 'violet' },
                { threshold: 3500, name: 'جوكر المعهد', color: 'amber' }
            ];

            let badgeAdded = false;
            milestones.forEach(m => {
                if (student.totalPoints >= m.threshold && !badges.some(b => b.name === m.name)) {
                    badges.push({ name: m.name, color: m.color, date: new Date().toISOString() });
                    badgeAdded = true;
                }
            });

            if (badgeAdded) {
                await tx.run('UPDATE students SET badges = ? WHERE id = ?', [JSON.stringify(badges), studentId]);
            }
        }

        logger.info(`AWARDED POINTS: student: ${studentId}, amount: ${amount}, action: ${action}`);
    } catch (err) {
        logger.error('Failed to award points', err);
    }
};

/**
 * Award points to a teacher and log the action.
 */
const awardTeacherPoints = async (tx, { teacherId, amount, action }) => {
    const logger = require('./logger');
    try {
        await tx.run(
            'UPDATE teachers SET points = points + ? WHERE id = ?',
            [amount, teacherId]
        );
        logger.info(`AWARDED TEACHER POINTS: teacher: ${teacherId}, amount: ${amount}, action: ${action}`);
    } catch (err) {
        logger.error('Failed to award teacher points', err);
    }
};

/**
 * AI-Badge Suggester: Generates a task for the teacher to award a badge
 * based on student behavior/milestones.
 */
const generateBadgeRecommendation = async (tx, { studentId, studentName, teacherId, reason, badgeName }) => {
    const logger = require('./logger');
    const { v4: uuidv4 } = require('uuid');
    try {
        const taskId = uuidv4();
        const title = `توصية وسام: ${badgeName} لـ ${studentName}`;
        const description = `النظام يقترح منح وسام "${badgeName}" للطالب ${studentName} لسبب: ${reason}. هل توافق؟`;
        
        await tx.run(
            'INSERT INTO tasks (id, title, description, status, priority, dueDate) VALUES (?, ?, ?, ?, ?, ?)',
            [taskId, title, description, 'pending', 'medium', new Date().toISOString().split('T')[0]]
        );
        
        logger.info(`BADGE RECOMMENDATION GENERATED: student: ${studentId}, badge: ${badgeName}`);
    } catch (err) {
        logger.error('Failed to generate badge recommendation', err);
    }
};

module.exports = {
    getStudentEnrollments,
    getStudentsWithEnrollments,
    withTransaction,
    updateEnrollmentSessions,
    awardPoints,
    awardTeacherPoints,
    generateBadgeRecommendation
};
