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

        // HIGH PERFORMANCE: Simple SELECT instead of expensive aggregate JOIN
        let enrollmentsSql = 'SELECT * FROM enrollments';
        if (studentIds) {
            enrollmentsSql += ` WHERE studentId IN (${studentIds.map(() => '?').join(',')})`;
        }

        const enrollments = await db.all(enrollmentsSql, params);

        const enrollmentMap = enrollments.reduce((acc, e) => {
            const formatted = {
                ...e,
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
        logger.error('Failed to get students with enrollments (Optimized)', err);
        throw err;
    }
};

module.exports = {
    getStudentEnrollments,
    getStudentsWithEnrollments,
    withTransaction
};

