/**
 * Shared database helper functions
 */

const getStudentEnrollments = async (db, studentId) => {
    // Get enrollments with dynamically calculated sessionsUsed from sessions table
    const query = `
        SELECT 
            e.*,
            COUNT(s.id) as dynamicSessionsUsed
        FROM enrollments e 
        LEFT JOIN sessions s ON 
            s.studentId = e.studentId 
            AND (s.subject = e.subject OR (s.subject IS NULL AND e.subject IS NULL))
            AND (s.teacherName = e.teacher OR s.teacherId = e.teacherId)
            AND s.status = 'completed'
        WHERE e.studentId = ?
        GROUP BY e.id
    `;

    const enrollments = await db.all(query, [studentId]);

    return enrollments.map(e => ({
        ...e,
        // Override the stored sessionsUsed with the actual count from sessions table
        sessionsUsed: e.dynamicSessionsUsed !== null ? e.dynamicSessionsUsed : e.sessionsUsed,
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
    await db.run('BEGIN TRANSACTION');
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

        // Fetch ALL enrollments with their computed session counts in ONE go using a JOIN
        const enrollments = await db.all(`
            SELECT 
                e.*,
                COUNT(s.id) as dynamicSessionsUsed
            FROM enrollments e
            LEFT JOIN sessions s ON 
                s.studentId = e.studentId 
                AND (s.subject = e.subject OR (s.subject IS NULL AND e.subject IS NULL))
                AND (s.teacherName = e.teacher OR s.teacherId = e.teacherId)
                AND s.status = 'completed'
            ${studentIds ? `WHERE e.studentId IN (${studentIds.map(() => '?').join(',')})` : ''}
            GROUP BY e.id
        `, params);

        const enrollmentMap = enrollments.reduce((acc, e) => {
            const formatted = {
                ...e,
                sessionsUsed: e.dynamicSessionsUsed !== null ? e.dynamicSessionsUsed : e.sessionsUsed,
                schedule: JSON.parse(e.schedule || '[]')
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
        logger.error('Failed to get students with enrollments', err);
        throw err;
    }
};

module.exports = {
    getStudentEnrollments,
    getStudentsWithEnrollments,
    withTransaction
};

