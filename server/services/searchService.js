const { prisma } = require('../utils/prisma');
const logger = require('../utils/logger');

const SEARCH_FIELDS = {
    students: ['name', 'studentPhone', 'parentPhone', 'username', 'grade'],
    teachers: ['name', 'phone1', 'phone2', 'email', 'username', 'subject'],
    parents: ['name', 'phone', 'email', 'username'],
    sessions: ['studentName', 'teacherName', 'subject'],
    teacherInvoices: ['teacherName'],
    studentInvoices: ['studentName'],
};

function buildContainsFilter(fields, q) {
    return fields.map(f => ({ [f]: { contains: q } }));
}

async function searchStudents(q, limit, user) {
    const where = {
        deletedAt: null,
        OR: buildContainsFilter(SEARCH_FIELDS.students, q),
    };
    if (user.role === 'teacher') {
        where.enrollments = { some: { teacherId: user.teacherId } };
    }
    const [data, total] = await Promise.all([
        prisma.student.findMany({
            where,
            select: {
                id: true, name: true, grade: true, parentPhone: true,
                studentPhone: true, curriculum: true, totalPoints: true,
                enrollments: { select: { id: true, subject: true, teacherId: true } }
            },
            take: limit, orderBy: { name: 'asc' },
        }),
        prisma.student.count({ where }),
    ]);
    return { data: data.map(s => ({ ...s, type: 'student' })), total };
}

async function searchTeachers(q, limit) {
    const where = { deletedAt: null, OR: buildContainsFilter(SEARCH_FIELDS.teachers, q) };
    const [data, total] = await Promise.all([
        prisma.teacher.findMany({
            where, select: { id: true, name: true, subject: true, phone1: true, phone2: true, email: true },
            take: limit, orderBy: { name: 'asc' },
        }),
        prisma.teacher.count({ where }),
    ]);
    return { data: data.map(t => ({ ...t, type: 'teacher' })), total };
}

async function searchParents(q, limit) {
    const where = { deletedAt: null, OR: buildContainsFilter(SEARCH_FIELDS.parents, q) };
    const [data, total] = await Promise.all([
        prisma.parent.findMany({
            where, select: { id: true, name: true, phone: true, email: true },
            take: limit, orderBy: { name: 'asc' },
        }),
        prisma.parent.count({ where }),
    ]);
    return { data: data.map(p => ({ ...p, type: 'parent' })), total };
}

async function searchSessions(q, limit, user) {
    const where = { OR: buildContainsFilter(SEARCH_FIELDS.sessions, q) };
    if (user.role === 'teacher') where.teacherId = user.teacherId;
    const [data, total] = await Promise.all([
        prisma.session.findMany({
            where,
            select: { id: true, studentName: true, teacherName: true, subject: true, date: true, time: true, status: true },
            take: limit, orderBy: { date: 'desc' },
        }),
        prisma.session.count({ where }),
    ]);
    return { data: data.map(s => ({ ...s, type: 'session' })), total };
}

async function searchTeacherInvoices(q, limit) {
    const where = { OR: buildContainsFilter(SEARCH_FIELDS.teacherInvoices, q) };
    const [data, total] = await Promise.all([
        prisma.teacherInvoice.findMany({
            where, select: { id: true, teacherName: true, amount: true, status: true, date: true },
            take: limit, orderBy: { date: 'desc' },
        }),
        prisma.teacherInvoice.count({ where }),
    ]);
    return { data: data.map(i => ({ ...i, type: 'teacherInvoice' })), total };
}

async function searchStudentInvoices(q, limit) {
    const where = { OR: buildContainsFilter(SEARCH_FIELDS.studentInvoices, q) };
    const [data, total] = await Promise.all([
        prisma.studentInvoice.findMany({
            where, select: { id: true, studentName: true, amount: true, status: true, date: true },
            take: limit, orderBy: { date: 'desc' },
        }),
        prisma.studentInvoice.count({ where }),
    ]);
    return { data: data.map(i => ({ ...i, type: 'studentInvoice' })), total };
}

const SEARCH_HANDLERS = {
    students: searchStudents,
    teachers: searchTeachers,
    parents: searchParents,
    sessions: searchSessions,
    teacherInvoices: searchTeacherInvoices,
    studentInvoices: searchStudentInvoices,
};

async function unifiedSearch({ q, types, limit = 10, user }) {
    if (!q || q.trim().length === 0) {
        return { query: '', results: {}, total: 0 };
    }
    const trimmed = q.trim();
    const requestedTypes = types && types.length > 0
        ? types.filter(t => SEARCH_HANDLERS[t])
        : Object.keys(SEARCH_HANDLERS);

    const tasks = requestedTypes.map(type => {
        const handler = SEARCH_HANDLERS[type];
        const needsUser = type === 'students' || type === 'sessions';
        return handler(trimmed, limit, needsUser ? user : undefined)
            .then(result => ({ type, result }))
            .catch(err => {
                logger.error(`Search error for ${type}:`, err);
                return { type, result: { data: [], total: 0 } };
            });
    });

    const settled = await Promise.all(tasks);
    const results = {};
    let grandTotal = 0;
    for (const { type, result } of settled) {
        results[type] = result.data;
        grandTotal += result.total;
    }
    return { query: trimmed, results, total: grandTotal };
}

module.exports = { unifiedSearch };
