const { prisma } = require('../utils/prisma');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const arabicReshaper = require('arabic-reshaper');
const bidiFactory = require('bidi-js');
const path = require('path');
const fs = require('fs');
const fsp = fs.promises;
const logger = require('../utils/logger');

const bidi = bidiFactory();

// Shapes Arabic letters and reorders the run into visual order so PDFKit can
// render it correctly. PDFKit renders LTR only, so after shaping we reverse
// the string to get the correct visual order for Arabic text.
function reshape(text) {
    const input = String(text ?? '');
    if (!isArabic(input)) return input;
    const shaped = arabicReshaper.convertArabic(input);
    try {
        const { levels } = bidi.getEmbeddingLevels(shaped);
        const maxLevel = Math.max(...levels);
        const chars = Array.from(shaped);
        for (let level = maxLevel; level > 0; level--) {
            let i = 0;
            while (i < chars.length) {
                if (levels[i] >= level) {
                    let end = i;
                    while (end < chars.length && levels[end] >= level) end++;
                    let left = i, right = end - 1;
                    while (left < right) {
                        const tmp = chars[left];
                        chars[left] = chars[right];
                        chars[right] = tmp;
                        left++;
                        right--;
                    }
                    i = end;
                } else {
                    i++;
                }
            }
        }
        return chars.join('');
    } catch (err) {
        logger.warn('Arabic reshape/reorder failed, falling back to shaped text:', err.message);
        return shaped;
    }
}

function isArabic(text) {
    return /[\u0600-\u06FF]/.test(text);
}

let arabicFontPath = null;
const FONT_URL = 'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/amiri/Amiri-Regular.ttf';
const FONT_FALLBACK_NAME = 'NotoNaskhArabic.ttf';
const FONT_DIR = path.join(__dirname, '..', 'fonts');

async function ensureArabicFont() {
    if (arabicFontPath) return arabicFontPath;
    const fontPath = path.join(FONT_DIR, FONT_FALLBACK_NAME);
    try {
        await fsp.access(fontPath);
        arabicFontPath = fontPath;
        return fontPath;
    } catch { /* font not found, download */ }

    try {
        await fsp.mkdir(FONT_DIR, { recursive: true });
        const response = await fetch(FONT_URL);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const buffer = Buffer.from(await response.arrayBuffer());
        await fsp.writeFile(fontPath, buffer);
        arabicFontPath = fontPath;
        logger.info('Arabic font downloaded successfully');
        return fontPath;
    } catch (err) {
        logger.warn('Could not download Arabic font:', err.message);
        return null;
    }
}

function buildDateFilter(from, to) {
    const filter = {};
    if (from) filter.gte = from;
    if (to) filter.lte = to;
    return Object.keys(filter).length > 0 ? filter : undefined;
}

// ── Data Fetchers ──────────────────────────────────────────

async function fetchStudents({ q, from, to }) {
    const where = { deletedAt: null };
    if (q) where.OR = [{ name: { contains: q } }, { studentPhone: { contains: q } }];
    return prisma.student.findMany({
        where,
        select: { id: true, name: true, studentPhone: true, parentPhone: true,
                  grade: true, curriculum: true, totalPoints: true,
                  createdAt: true },
        orderBy: { name: 'asc' },
    });
}

async function fetchTeachers({ q, from, to }) {
    const where = { deletedAt: null };
    if (q) where.OR = [{ name: { contains: q } }, { subject: { contains: q } }];
    return prisma.teacher.findMany({
        where,
        select: { id: true, name: true, phone1: true, phone2: true, email: true,
                  subject: true, price: true, points: true, createdAt: true },
        orderBy: { name: 'asc' },
    });
}

async function fetchParents({ q, from, to }) {
    const where = { deletedAt: null };
    if (q) where.OR = [{ name: { contains: q } }, { phone: { contains: q } }];
    return prisma.parent.findMany({
        where,
        select: { id: true, name: true, phone: true, phone2: true, createdAt: true },
        orderBy: { name: 'asc' },
    });
}

async function fetchSessions({ q, from, to, teacherId, status }) {
    const where = {};
    if (q) where.OR = [{ studentName: { contains: q } }, { teacherName: { contains: q } }];
    if (from || to) where.date = buildDateFilter(from, to);
    if (teacherId) where.teacherId = teacherId;
    if (status) where.status = status;
    return prisma.session.findMany({
        where,
        select: { id: true, studentName: true, teacherName: true, subject: true,
                  date: true, time: true, status: true, price: true, teacherPrice: true },
        orderBy: { date: 'desc' },
    });
}

async function fetchInvoices({ q, from, to, type, status }) {
    if (type === 'teacher') {
        const where = {};
        if (q) where.teacherName = { contains: q };
        if (from || to) where.date = buildDateFilter(from, to);
        if (status) where.status = status;
        return prisma.teacherInvoice.findMany({
            where,
            select: { id: true, teacherName: true, specialization: true,
                      amount: true, status: true, date: true, paymentMethod: true },
            orderBy: { date: 'desc' },
        });
    }
    const where = {};
    if (q) where.studentName = { contains: q };
    if (from || to) where.date = buildDateFilter(from, to);
    if (status) where.status = status;
    return prisma.studentInvoice.findMany({
        where,
        select: { id: true, studentName: true, amount: true, status: true,
                  date: true, dueDate: true, paymentMethod: true },
        orderBy: { date: 'desc' },
    });
}

async function fetchFinance({ from, to }) {
    const dateFilter = from || to ? buildDateFilter(from, to) : undefined;
    const [transactions, teacherInvoices, studentInvoices, sessions] = await Promise.all([
        prisma.manualTransaction.findMany({
            where: dateFilter ? { date: dateFilter } : {},
            select: { id: true, type: true, category: true, amount: true, date: true, description: true },
            orderBy: { date: 'desc' },
        }),
        prisma.teacherInvoice.findMany({
            where: Object.assign({}, dateFilter ? { date: dateFilter } : {}),
            select: { id: true, teacherName: true, amount: true, status: true, date: true },
            orderBy: { date: 'desc' },
        }),
        prisma.studentInvoice.findMany({
            where: Object.assign({}, dateFilter ? { date: dateFilter } : {}),
            select: { id: true, studentName: true, amount: true, status: true, date: true },
            orderBy: { date: 'desc' },
        }),
        prisma.session.findMany({
            where: Object.assign({}, dateFilter ? { date: dateFilter } : {}),
            select: { id: true, studentName: true, teacherName: true, date: true, price: true, teacherPrice: true, status: true },
            orderBy: { date: 'desc' },
        }),
    ]);
    return { transactions, teacherInvoices, studentInvoices, sessions };
}

async function fetchAttendance({ from, to, teacherId }) {
    const where = { status: 'completed' };
    if (from || to) where.date = buildDateFilter(from, to);
    if (teacherId) where.teacherId = teacherId;
    return prisma.session.findMany({
        where,
        select: { id: true, studentName: true, teacherName: true, subject: true,
                  date: true, time: true, status: true },
        orderBy: { date: 'desc' },
    });
}



async function fetchJobs({ q, from, to }) {
    const where = {};
    if (q) where.OR = [{ name: { contains: q } }, { phone: { contains: q } }, { whatsapp: { contains: q } }];
    if (from || to) where.createdAt = buildDateFilter(from, to);
    return prisma.jobApplication.findMany({
        where,
        select: { id: true, name: true, phone: true, whatsapp: true, position: true,
                  qualification: true, grade: true, graduationYear: true, onlineYears: true,
                  curriculums: true, subject: true, contacted: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
    });
}
// ── Column Definitions ─────────────────────────────────────

const COLUMNS = {
    students: [
        { header: 'الاسم', key: 'name', width: 25 },
        { header: 'رقم الطالب', key: 'studentPhone', width: 18 },
        { header: 'رقم ولي الأمر', key: 'parentPhone', width: 18 },
        { header: 'الصف', key: 'grade', width: 12 },
        { header: 'المنهج', key: 'curriculum', width: 15 },
        { header: 'النقاط', key: 'totalPoints', width: 10 },
    ],
    teachers: [
        { header: 'الاسم', key: 'name', width: 25 },
        { header: 'رقم 1', key: 'phone1', width: 18 },
        { header: 'رقم 2', key: 'phone2', width: 18 },
        { header: 'البريد', key: 'email', width: 25 },
        { header: 'المادة', key: 'subject', width: 15 },
        { header: 'السعر', key: 'price', width: 10 },
        { header: 'النقاط', key: 'points', width: 10 },
    ],
    parents: [
        { header: 'الاسم', key: 'name', width: 25 },
        { header: 'رقم الهاتف', key: 'phone', width: 18 },
        { header: 'هاتف إضافي', key: 'phone2', width: 18 },
    ],
    sessions: [
        { header: 'الطالب', key: 'studentName', width: 20 },
        { header: 'المعلم', key: 'teacherName', width: 20 },
        { header: 'المادة', key: 'subject', width: 15 },
        { header: 'التاريخ', key: 'date', width: 15 },
        { header: 'الوقت', key: 'time', width: 10 },
        { header: 'الحالة', key: 'status', width: 12 },
        { header: 'السعر', key: 'price', width: 10 },
    ],
    teacherInvoices: [
        { header: 'اسم المعلم', key: 'teacherName', width: 20 },
        { header: 'التخصص', key: 'specialization', width: 15 },
        { header: 'المبلغ', key: 'amount', width: 12 },
        { header: 'الحالة', key: 'status', width: 12 },
        { header: 'التاريخ', key: 'date', width: 15 },
        { header: 'طريقة الدفع', key: 'paymentMethod', width: 15 },
    ],
    studentInvoices: [
        { header: 'اسم الطالب', key: 'studentName', width: 20 },
        { header: 'المبلغ', key: 'amount', width: 12 },
        { header: 'الحالة', key: 'status', width: 12 },
        { header: 'التاريخ', key: 'date', width: 15 },
        { header: 'تاريخ الاستحقاق', key: 'dueDate', width: 15 },
        { header: 'طريقة الدفع', key: 'paymentMethod', width: 15 },
    ],
    attendance: [
        { header: 'الطالب', key: 'studentName', width: 20 },
        { header: 'المعلم', key: 'teacherName', width: 20 },
        { header: 'المادة', key: 'subject', width: 15 },
        { header: 'التاريخ', key: 'date', width: 15 },
        { header: 'الوقت', key: 'time', width: 10 },
    ],
    jobs: [
        { header: 'الاسم', key: 'name', width: 25 },
        { header: 'الهاتف', key: 'phone', width: 18 },
        { header: 'الوظيفة', key: 'position', width: 20 },
        { header: 'المؤهل', key: 'qualification', width: 15 },
        { header: 'المادة', key: 'subject', width: 15 },
        { header: 'المناهج', key: 'curriculums', width: 20 },
        { header: 'خبرة أون لاين', key: 'onlineYears', width: 12 },
        { header: 'تم التواصل', key: 'contacted', width: 10 },
    ],
};

const LABELS = {
    students: 'الطلاب', teachers: 'المعلمين', parents: 'أولياء الأمور',
    sessions: 'الحصص', teacherInvoices: 'فواتير المعلمين',
    studentInvoices: 'فواتير الطلاب', attendance: 'الحضور',
    finance: 'المالية',
    jobs: 'طلبات التوظيف',
};

const FETCHERS = {
    students: fetchStudents,
    teachers: fetchTeachers,
    parents: fetchParents,
    sessions: fetchSessions,
    teacherInvoices: (f) => fetchInvoices({ ...f, type: 'teacher' }),
    studentInvoices: (f) => fetchInvoices({ ...f, type: 'student' }),
    attendance: fetchAttendance,
    jobs: (f) => fetchJobs(f),
    finance: fetchFinance,
};

// ── Excel Generator ────────────────────────────────────────

async function generateExcel(entity, filters) {
    const fetcher = FETCHERS[entity];
    const data = await fetcher(filters);
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Dareen App';
    const sheet = workbook.addWorksheet(LABELS[entity] || entity);
    sheet.views = [{ rightToLeft: true }];

    if (entity === 'finance' && data && data.transactions) {
        sheet.columns = [
            { header: 'النوع', key: 'type', width: 15 },
            { header: 'التصنيف', key: 'category', width: 15 },
            { header: 'المبلغ', key: 'amount', width: 12 },
            { header: 'التاريخ', key: 'date', width: 15 },
            { header: 'الوصف', key: 'description', width: 30 },
        ];
        data.transactions.forEach(t => sheet.addRow(t));
        sheet.addRow({});
        sheet.addRow({ type: '— فواتير المعلمين —' });
        data.teacherInvoices.forEach(i => sheet.addRow({
            type: i.teacherName, category: 'فاتورة معلم', amount: i.amount, date: i.date, description: i.status
        }));
        sheet.addRow({});
        sheet.addRow({ type: '— فواتير الطلاب —' });
        data.studentInvoices.forEach(i => sheet.addRow({
            type: i.studentName, category: 'فاتورة طالب', amount: i.amount, date: i.date, description: i.status
        }));
    } else {
        sheet.columns = COLUMNS[entity]
            ? COLUMNS[entity].map(c => ({ header: c.header, key: c.key, width: c.width }))
            : [];
    }

    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
    headerRow.alignment = { horizontal: 'center', vertical: 'middle' };

    sheet.eachRow((row, rowNum) => {
        if (rowNum > 1) {
            row.alignment = { horizontal: 'right', vertical: 'middle' };
        }
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
}

// ── PDF Generator ──────────────────────────────────────────

function drawTable(doc, cols, rows, arabicFont) {
    const pageWidth = doc.page.width - 60;
    const colWidths = cols.map(c => Math.max(c.width * 6, pageWidth / cols.length));
    const totalWidth = colWidths.reduce((a, b) => a + b, 0);
    const adjustedWidths = colWidths.map(w => Math.floor(w * pageWidth / totalWidth));
    const startX = doc.page.width - 30;
    let y = doc.y;

    doc.fontSize(9);
    if (arabicFont) {
        try {
            doc.font(arabicFont);
        } catch (err) {
            logger.warn('Failed to load Arabic font for PDF table:', err.message);
        }
    }

    const drawHeader = () => {
        cols.forEach((col, i) => {
            const x = startX - adjustedWidths.slice(0, i + 1).reduce((a, b) => a + b, 0);
            doc.rect(x, y, adjustedWidths[i], 18).fill('#4472C4');
            doc.fill('#FFFFFF').text(reshape(col.header), x + 2, y + 3, {
                width: adjustedWidths[i] - 4, align: 'right',
            });
        });
        y += 18;
    };

    drawHeader();

    rows.forEach((row, ri) => {
        const isEven = ri % 2 === 0;
        cols.forEach((col, ci) => {
            const x = startX - adjustedWidths.slice(0, ci + 1).reduce((a, b) => a + b, 0);
            doc.rect(x, y, adjustedWidths[ci], 16);
            if (isEven) doc.fill('#F2F2F2'); else doc.fill('#FFFFFF');
            doc.fill('#000000').text(
                reshape(String(row[col.key] ?? '')),
                x + 2, y + 2,
                { width: adjustedWidths[ci] - 4, align: 'right' }
            );
        });
        y += 16;
        if (y > doc.page.height - 50) {
            doc.addPage();
            y = doc.y;
            drawHeader();
        }
    });

    doc.y = y + 20;
}

async function generatePDF(entity, filters) {
    await ensureArabicFont();
    const data = await FETCHERS[entity](filters);

    const doc = new PDFDocument({
        size: 'A4',
        margin: 30,
        info: { Title: LABELS[entity] || entity, Creator: 'Dareen App' },
    });
    const buffers = [];
    doc.on('data', (chunk) => buffers.push(chunk));

    return new Promise((resolve, reject) => {
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', reject);

        const title = `${LABELS[entity] || entity} - ${new Date().toLocaleDateString('ar-SA')}`;
        if (arabicFontPath) doc.font(arabicFontPath);
        doc.fontSize(18).text(reshape(title), { align: 'right' });
        doc.moveDown();

        if (entity === 'finance' && data && data.transactions) {
            const financeCols = [
                { header: 'النوع', key: 'description', width: 20 },
                { header: 'المبلغ', key: 'amount', width: 12 },
                { header: 'التاريخ', key: 'date', width: 15 },
            ];

            doc.fontSize(12).text(reshape('المعاملات'), { align: 'right' });
            doc.moveDown(0.5);
            drawTable(doc, financeCols, data.transactions.map(t => ({
                description: t.description || t.type, amount: t.amount, date: t.date
            })), arabicFontPath);

            doc.fontSize(12).text(reshape('فواتير المعلمين'), { align: 'right' });
            doc.moveDown(0.5);
            drawTable(doc, financeCols, data.teacherInvoices.map(i => ({
                description: i.teacherName, amount: i.amount, date: i.date
            })), arabicFontPath);

            doc.fontSize(12).text(reshape('فواتير الطلاب'), { align: 'right' });
            doc.moveDown(0.5);
            drawTable(doc, financeCols, data.studentInvoices.map(i => ({
                description: i.studentName, amount: i.amount, date: i.date
            })), arabicFontPath);
        } else {
            const rows = Array.isArray(data) ? data : [];
            const cols = COLUMNS[entity] || [];

            if (cols.length > 0 && rows.length > 0) {
                drawTable(doc, cols, rows, arabicFontPath);
            } else {
                doc.fontSize(12).text(reshape('لا توجد بيانات'), { align: 'center' });
            }
        }

        doc.end();
    });
}

// ── Public API ────────────────────────────────────────────

async function exportData(entity, format, filters = {}) {
    const validEntities = Object.keys(FETCHERS).concat('finance');
    if (!validEntities.includes(entity)) {
        throw new Error(`Unknown entity: ${entity}. Valid: ${validEntities.join(', ')}`);
    }

    if (format === 'xlsx') {
        const buffer = await generateExcel(entity, filters);
        return {
            buffer,
            contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            filename: `${entity}_${new Date().toISOString().split('T')[0]}.xlsx`,
        };
    }

    if (format === 'pdf') {
        const buffer = await generatePDF(entity, filters);
        return {
            buffer,
            contentType: 'application/pdf',
            filename: `${entity}_${new Date().toISOString().split('T')[0]}.pdf`,
        };
    }

    throw new Error(`Unsupported format: ${format}. Use 'xlsx' or 'pdf'.`);
}

module.exports = { exportData };
