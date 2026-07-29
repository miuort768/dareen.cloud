/**
 * Seed demo data for Dareen platform.
 * Creates teachers, parents, students, enrollments, sessions, points, announcements.
 *
 * Usage: node server/prisma/seed-demo.js
 * Docker: docker exec -it darin-app-app-1 node prisma/seed-demo.js
 *
 * All passwords: 123456
 * To delete later: DELETE FROM teachers WHERE id LIKE 'demo_%';
 *                  (and similarly for students, parents, etc.)
 */
const path = require('path');
const bcrypt = require('bcrypt');

// ── Prisma adapter ──
let prisma;
if (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgresql')) {
  const { Pool } = require('pg');
  const { PrismaPg } = require('@prisma/adapter-pg');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  prisma = new PrismaClient({ adapter });
} else {
  const { PrismaLibSql } = require('@prisma/adapter-libsql');
  const defaultUrl = 'file:' + path.resolve(__dirname, '..', 'dev.db').replace(/\\/g, '/');
  const adapter = new PrismaLibSql({ url: process.env.DATABASE_URL || defaultUrl });
  prisma = new PrismaClient({ adapter });
}

const PREFIX = 'demo_';
const PASSWORD = '123456';

const today = () => new Date().toISOString().split('T')[0];
const daysAgo = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().split('T')[0]; };
const daysFromNow = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().split('T')[0]; };

const ARABIC_DAYS = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const dayName = (d) => ARABIC_DAYS[new Date(d).getDay()];

async function main() {
  console.log('🌱 Seeding demo data...\n');
  const hash = await bcrypt.hash(PASSWORD, 10);

  // ── 1. Teachers ──
  const teachersData = [
    { id: `${PREFIX}teacher_1`, name: 'أحمد عبدالله', subject: 'الرياضيات', phone1: '96550000001', price: 15, currency: 'KWD' },
    { id: `${PREFIX}teacher_2`, name: 'فاطمة محمد', subject: 'اللغة العربية', phone1: '96550000002', price: 12, currency: 'KWD' },
    { id: `${PREFIX}teacher_3`, name: 'سارة خالد', subject: 'العلوم', phone1: '96550000003', price: 14, currency: 'KWD' },
  ];

  const teachers = [];
  for (const t of teachersData) {
    const existing = await prisma.teacher.findUnique({ where: { id: t.id } });
    if (!existing) {
      const teacher = await prisma.teacher.create({
        data: { ...t, username: t.id, password: hash, points: Math.floor(Math.random() * 500) + 100 },
      });
      teachers.push(teacher);
      console.log(`  ✅ معلم: ${teacher.name} (${teacher.subject}) — username: ${teacher.id} / ${PASSWORD}`);
    } else {
      teachers.push(existing);
      console.log(`  ⏩ موجود: ${existing.name}`);
    }
  }

  // ── 2. Parents ──
  const parentsData = [
    { id: `${PREFIX}parent_1`, name: 'مريم علي', phone: '96551111111' },
    { id: `${PREFIX}parent_2`, name: 'خالد أحمد', phone: '96552222222' },
  ];

  const parents = [];
  for (const p of parentsData) {
    const existing = await prisma.parent.findUnique({ where: { id: p.id } });
    if (!existing) {
      const parent = await prisma.parent.create({
        data: { ...p, username: p.id, password: hash },
      });
      parents.push(parent);
      console.log(`  ✅ ولي أمر: ${parent.name} — username: ${parent.id} / ${PASSWORD}`);
    } else {
      parents.push(existing);
      console.log(`  ⏩ موجود: ${existing.name}`);
    }
  }

  // ── 3. Students ──
  const studentsData = [
    { id: `${PREFIX}student_1`, name: 'نورة خالد', parentId: parents[0].id, grade: 'الصف الخامس', curriculum: 'الكويت' },
    { id: `${PREFIX}student_2`, name: 'سعد خالد', parentId: parents[0].id, grade: 'الصف الثالث', curriculum: 'الكويت' },
    { id: `${PREFIX}student_3`, name: 'لينا أحمد', parentId: parents[1].id, grade: 'الصف السادس', curriculum: 'الكويت' },
    { id: `${PREFIX}student_4`, name: 'يوسف أحمد', parentId: parents[1].id, grade: 'الصف الرابع', curriculum: 'الكويت' },
  ];

  const students = [];
  for (const s of studentsData) {
    const existing = await prisma.student.findUnique({ where: { id: s.id } });
    if (!existing) {
      const student = await prisma.student.create({
        data: { ...s, username: s.id, password: hash, totalPoints: Math.floor(Math.random() * 800) + 200 },
      });
      students.push(student);
      console.log(`  ✅ طالب: ${student.name} (${student.grade}) — username: ${student.id} / ${PASSWORD}`);
    } else {
      students.push(existing);
      console.log(`  ⏩ موجود: ${existing.name}`);
    }
  }

  // ── 4. Enrollments ──
  // student_1 → teacher_1 (Math) + teacher_2 (Arabic)
  // student_2 → teacher_1 (Math)
  // student_3 → teacher_1 (Math) + teacher_3 (Science)
  // student_4 → teacher_2 (Arabic) + teacher_3 (Science)
  const enrollmentsData = [
    { id: `${PREFIX}enroll_1`, studentId: students[0].id, teacherId: teachers[0].id, subject: 'الرياضيات', sessionsTotal: 24, sessionsUsed: 10, schedule: JSON.stringify([{ day: 'الأحد', hour: '16:00' }, { day: 'الثلاثاء', hour: '16:00' }]) },
    { id: `${PREFIX}enroll_2`, studentId: students[0].id, teacherId: teachers[1].id, subject: 'اللغة العربية', sessionsTotal: 24, sessionsUsed: 12, schedule: JSON.stringify([{ day: 'الإثنين', hour: '15:00' }, { day: 'الأربعاء', hour: '15:00' }]) },
    { id: `${PREFIX}enroll_3`, studentId: students[1].id, teacherId: teachers[0].id, subject: 'الرياضيات', sessionsTotal: 16, sessionsUsed: 8, schedule: JSON.stringify([{ day: 'السبت', hour: '10:00' }]) },
    { id: `${PREFIX}enroll_4`, studentId: students[2].id, teacherId: teachers[0].id, subject: 'الرياضيات', sessionsTotal: 24, sessionsUsed: 15, schedule: JSON.stringify([{ day: 'الأحد', hour: '17:00' }, { day: 'الخميس', hour: '16:00' }]) },
    { id: `${PREFIX}enroll_5`, studentId: students[2].id, teacherId: teachers[2].id, subject: 'العلوم', sessionsTotal: 20, sessionsUsed: 14, schedule: JSON.stringify([{ day: 'الثلاثاء', hour: '17:00' }]) },
    { id: `${PREFIX}enroll_6`, studentId: students[3].id, teacherId: teachers[1].id, subject: 'اللغة العربية', sessionsTotal: 16, sessionsUsed: 6, schedule: JSON.stringify([{ day: 'الأربعاء', hour: '16:00' }]) },
    { id: `${PREFIX}enroll_7`, studentId: students[3].id, teacherId: teachers[2].id, subject: 'العلوم', sessionsTotal: 20, sessionsUsed: 9, schedule: JSON.stringify([{ day: 'الخميس', hour: '15:00' }]) },
  ];

  for (const e of enrollmentsData) {
    const existing = await prisma.enrollment.findUnique({ where: { id: Number(e.id.replace('demo_enroll_', '')) } }).catch(() => null);
    if (!existing) {
      await prisma.enrollment.create({
        data: {
          studentId: e.studentId,
          teacherId: e.teacherId,
          subject: e.subject,
          sessionsTotal: e.sessionsTotal,
          sessionsUsed: e.sessionsUsed,
          schedule: e.schedule,
        },
      });
      console.log(`  ✅ تسجيل: ${e.subject} للطالب ${e.studentId}`);
    }
  }

  // ── 5. Sessions (past 30 days completed + future 7 days scheduled) ──
  console.log('\n  📅 إنشاء الحصص...');
  let sessionCount = 0;
  for (let i = 1; i <= 30; i++) {
    const d = new Date();
    d.setDate(d.getDate() - (30 - i));
    if (d.getDay() === 5) continue; // skip Friday

    for (const e of enrollmentsData) {
      const schedule = JSON.parse(e.schedule);
      const day = dayName(d);
      const slot = schedule.find((s) => s.day === day);
      if (!slot) continue;

      const status = d < new Date() ? 'completed' : 'scheduled';
      // occasionally make one cancelled
      const finalStatus = status === 'completed' && Math.random() < 0.15 ? 'cancelled' : status;

      const sessionId = `${PREFIX}sess_${e.id}_${i}`;
      const existing = await prisma.session.findUnique({ where: { id: sessionId } }).catch(() => null);
      if (!existing) {
        const teacher = teachers.find((t) => t.id === e.teacherId);
        const student = students.find((s) => s.id === e.studentId);
        await prisma.session.create({
          data: {
            id: sessionId,
            studentId: e.studentId,
            teacherId: e.teacherId,
            studentName: student?.name || '',
            teacherName: teacher?.name || '',
            subject: e.subject,
            date: d.toISOString().split('T')[0],
            day: dayName(d),
            time: slot.hour,
            price: 0,
            status: finalStatus,
          },
        });
        sessionCount++;
      }
    }
  }
  console.log(`  ✅ ${sessionCount} حصة منشأة`);

  // ── 6. Points Logs ──
  console.log('\n  ⭐ إنشاء سجل النقاط...');
  for (const s of students) {
    for (let i = 0; i < 5; i++) {
      const amount = [5, 10, 15, 20, 25][Math.floor(Math.random() * 5)];
      const actions = ['حل واجب الرياضيات', 'مشاركة في الحصة', 'تقديم ممتاز', 'حضور مبكر', 'تطوع في النشاط'];
      const action = actions[Math.floor(Math.random() * actions.length)];
      const d = daysAgo(i * 5 + 1);
      const logId = `${PREFIX}points_${s.id}_${i}`;
      const existing = await prisma.pointsLog.findUnique({ where: { id: logId } }).catch(() => null);
      if (!existing) {
        await prisma.pointsLog.create({
          data: { id: logId, studentId: s.id, amount, action, timestamp: new Date(d) },
        });
      }
    }
  }
  console.log('  ✅ سجل النقاط');

  // ── 7. Announcements ──
  console.log('\n  📢 إنشاء الإعلانات...');
  const announcementsData = [
    { id: `${PREFIX}ann_1`, title: 'بدء التسجيل في الفصل الدراسي الثاني', content: 'يعلن مركز دارين السابعة عن بدء التسجيل في الفصل الدراسي الثاني 2026. خصم 15% للتسجيل المبكر.', type: 'general', date: daysAgo(2) },
    { id: `${PREFIX}ann_2`, title: 'إجازة يوم التأسيس', content: 'سنكون في إجازة يوم الخميس الموافق 22 فبراير بمناسبة يوم التأسيس. تعود الحصص يوم الأحد.', type: 'holiday', date: daysAgo(7) },
    { id: `${PREFIX}ann_3`, title: 'عاجل: تغيير مواعيد الحصص المسائية', content: 'نظراً للطلب المتزايد، تم تغيير مواعيد الحصص المسائية لتكون من الساعة 4:00 عوضاً عن 5:00 مساءً.', type: 'urgent', date: daysAgo(1) },
    { id: `${PREFIX}ann_4`, title: 'ورشة عمل مجانية: مهارات الدراسة الفعّالة', content: 'ندعوكم لحضور ورشة عمل مجانية عن مهارات الدراسة الفعّالة يوم السبت القادم الساعة 7:00 مساءً. التسجيل عبر الواتساب.', type: 'event', date: daysFromNow(3) },
    { id: `${PREFIX}ann_5`, title: 'نتائج اختبارات الشهر', content: 'تم رفع نتائج اختبارات الشهر على منصة الطالب. يمكنكم الاطلاع على النتائج من خلال حساباتكم.', type: 'general', date: daysAgo(5) },
  ];

  for (const a of announcementsData) {
    const existing = await prisma.announcement.findUnique({ where: { id: a.id } }).catch(() => null);
    if (!existing) {
      await prisma.announcement.create({
        data: { ...a, isActive: 1 },
      });
      console.log(`  ✅ إعلان: ${a.title}`);
    }
  }

  // ── 8. Teacher availability ──
  console.log('\n  🕐 إنشاء أوقات المعلمين...');
  for (const t of teachers) {
    const days = t.id === `${PREFIX}teacher_1` ? [0, 2, 4] : t.id === `${PREFIX}teacher_2` ? [1, 3] : [2, 4];
    for (const dayIdx of days) {
      const availId = `${PREFIX}avail_${t.id}_${dayIdx}`;
      const existing = await prisma.teacherAvailability.findUnique({ where: { id: availId } }).catch(() => null);
      if (!existing) {
        await prisma.teacherAvailability.create({
          data: { id: availId, teacherId: t.id, teacherName: t.name, dayOfWeek: dayIdx, startTime: '15:00', endTime: '20:00', isAvailable: 1 },
        });
      }
    }
  }
  console.log('  ✅ أوقات المعلمين');

  // ── 9. Admin check ──
  const admin = await prisma.user.findFirst({ where: { role: 'admin' } });
  if (admin) {
    console.log(`\n  👤 مدير النظام: ${admin.username} / (كلمة المرور الحالية)`);
  } else {
    await prisma.user.create({
      data: { id: `${PREFIX}admin`, name: 'مدير النظام', username: 'admin', password: hash, role: 'admin', permissions: JSON.stringify(['*']) },
    });
    console.log(`\n  ✅ مدير النظام: admin / ${PASSWORD}`);
  }

  console.log('\n═══════════════════════════════════');
  console.log('  ✅ تمت إضافة البيانات التجريبية');
  console.log('  📝 كلمة المرور: 123456');
  console.log('  🗑️ للحذف: احذف السجلات التي تبدأ بـ "demo_"');
  console.log('═══════════════════════════════════\n');
}

main()
  .catch((e) => { console.error('❌', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
