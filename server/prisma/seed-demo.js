/**
 * Seed demo data for Dareen platform — Large Dataset.
 * Creates teachers, parents, students, enrollments, sessions, points, announcements.
 *
 * Usage: node server/prisma/seed-demo.js
 * Docker: docker compose exec app node server/prisma/seed-demo.js
 *
 * ALL PASSWORDS: 123456
 * To delete later: DELETE FROM teachers WHERE id LIKE 'demo_%';
 *                  (and similarly for students, parents, etc.)
 */
const path = require('path');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');

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

const ARABIC_DAYS = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const dayName = (d) => ARABIC_DAYS[new Date(d).getDay()];

function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

const TEACHER_NAMES = [
  { name: 'أحمد عبدالله', subject: 'الرياضيات' },
  { name: 'فاطمة محمد', subject: 'اللغة العربية' },
  { name: 'سارة خالد', subject: 'العلوم' },
  { name: 'محمد علي', subject: 'اللغة الإنجليزية' },
  { name: 'نورة سعد', subject: 'التربية الإسلامية' },
  { name: 'عبدالرحمن عمر', subject: 'الرياضيات' },
  { name: 'هدى إبراهيم', subject: 'اللغة العربية' },
  { name: 'خالد يوسف', subject: 'الفيزياء' },
  { name: 'منى حسن', subject: 'الكيمياء' },
  { name: 'سامي لطفي', subject: 'الأحياء' },
  { name: 'رنا جمال', subject: 'التاريخ' },
  { name: 'باسم شكري', subject: 'الجغرافيا' },
];

const PARENT_NAMES = [
  { name: 'مريم علي', phone: '96551111101' },
  { name: 'خالد أحمد', phone: '96551111102' },
  { name: 'فهد عبدالعزيز', phone: '96551111103' },
  { name: 'نوال حسن', phone: '96551111104' },
  { name: 'سعد راشد', phone: '96551111105' },
  { name: 'ديمة صالح', phone: '96551111106' },
  { name: 'ياسر فؤاد', phone: '96551111107' },
  { name: 'هند بدر', phone: '96551111108' },
  { name: 'ماجد ناصر', phone: '96551111109' },
  { name: 'ليلى عبدالمجيد', phone: '96551111110' },
];

const STUDENT_NAMES = [
  { name: 'نورة خالد', grade: 'الصف الخامس', curriculum: 'الكويت' },
  { name: 'سعد خالد', grade: 'الصف الثالث', curriculum: 'الكويت' },
  { name: 'لينا أحمد', grade: 'الصف السادس', curriculum: 'الكويت' },
  { name: 'يوسف أحمد', grade: 'الصف الرابع', curriculum: 'الكويت' },
  { name: 'عبدالله الفهد', grade: 'الصف الثاني', curriculum: 'السعودية' },
  { name: 'سارة الفهد', grade: 'الصف الرابع', curriculum: 'السعودية' },
  { name: 'راشد سعد', grade: 'الصف الأول', curriculum: 'قطر' },
  { name: 'مريم سعد', grade: 'الصف الخامس', curriculum: 'قطر' },
  { name: 'عمر ياسر', grade: 'الصف السادس', curriculum: 'الإمارات' },
  { name: 'حصة ياسر', grade: 'الصف الثالث', curriculum: 'الإمارات' },
  { name: 'علي ماجد', grade: 'الصف الرابع', curriculum: 'الكويت' },
  { name: 'زينب ماجد', grade: 'الصف الثاني', curriculum: 'الكويت' },
  { name: 'تركي هاني', grade: 'الصف الخامس', curriculum: 'السعودية' },
  { name: 'لمى فؤاد', grade: 'الصف الأول', curriculum: 'عمان' },
  { name: 'نوف فؤاد', grade: 'الصف الثالث', curriculum: 'عمان' },
  { name: 'صالح عبداللطيف', grade: 'الصف الرابع', curriculum: 'البحرين' },
  { name: 'جود عبداللطيف', grade: 'الصف الخامس', curriculum: 'البحرين' },
  { name: 'فواز ناصر', grade: 'الصف الثالث', curriculum: 'السعودية' },
  { name: 'رنا سامي', grade: 'الصف السادس', curriculum: 'الكويت' },
  { name: 'باسل خالد', grade: 'الصف الثاني', curriculum: 'الكويت' },
  { name: 'تالا مازن', grade: 'الصف الأول', curriculum: 'الإمارات' },
  { name: 'مهند مازن', grade: 'الصف الرابع', curriculum: 'الإمارات' },
  { name: 'لورا سامح', grade: 'الصف الخامس', curriculum: 'الكويت' },
  { name: 'أيهم سامح', grade: 'الصف الثالث', curriculum: 'الكويت' },
  { name: 'ربى أحمد', grade: 'الصف السادس', curriculum: 'السعودية' },
  { name: 'غسان أحمد', grade: 'الصف الرابع', curriculum: 'السعودية' },
  { name: 'تيم راشد', grade: 'الصف الثاني', curriculum: 'قطر' },
  { name: 'دانية راشد', grade: 'الصف الخامس', curriculum: 'قطر' },
  { name: 'جاسم يوسف', grade: 'الصف الثالث', curriculum: 'الإمارات' },
  { name: 'شوق يوسف', grade: 'الصف الأول', curriculum: 'الإمارات' },
];

const SUBJECTS = ['الرياضيات', 'اللغة العربية', 'العلوم', 'اللغة الإنجليزية', 'التربية الإسلامية', 'الفيزياء', 'الكيمياء', 'الأحياء', 'التاريخ', 'الجغرافيا'];
const GRADES = ['الصف الأول', 'الصف الثاني', 'الصف الثالث', 'الصف الرابع', 'الصف الخامس', 'الصف السادس'];
const CURRICULUMS = ['الكويت', 'السعودية', 'قطر', 'الإمارات', 'عمان', 'البحرين'];

const POINT_ACTIONS = [
  'حل واجب الرياضيات', 'مشاركة في الحصة', 'تقديم ممتاز', 'حضور مبكر',
  'تطوع في النشاط', 'إجابة صحيحة', 'حل اختبار', 'بحث ممتاز',
  'مساعدة زميل', 'التزام بالمواعيد', 'حل تمارين إضافية', 'قراءة ممتازة',
  'نشاط صفي متميز', 'مشروع علمي', 'مشاركة في النقاش',
];

const ANNOUNCEMENT_TYPES = ['general', 'urgent', 'holiday', 'event'];
const ANNOUNCEMENT_TITLES = [
  { t: 'بدء التسجيل في الفصل الدراسي الثاني', c: 'يعلن مركز دارين السابعة عن بدء التسجيل في الفصل الدراسي الثاني 2026. خصم 15% للتسجيل المبكر حتى نهاية الشهر.' },
  { t: 'إجازة يوم التأسيس', c: 'سنكون في إجازة يومي الخميس والجمعة بمناسبة يوم التأسيس. تعود الحصص يوم السبت كالمعتاد.' },
  { t: 'عاجل: تغيير مواعيد الحصص المسائية', c: 'نظراً للطلب المتزايد، تم تغيير مواعيد الحصص المسائية لتكون من الساعة 4:00 عوضاً عن 5:00 مساءً ابتداءً من الأسبوع القادم.' },
  { t: 'ورشة عمل: مهارات الدراسة الفعّالة', c: 'ورشة عمل مجانية عن مهارات الدراسة الفعّالة يوم السبت الساعة 7:00 مساءً عبر منصة زووم. سجل الآن!' },
  { t: 'نتائج اختبارات الشهر', c: 'تم رفع نتائج اختبارات الشهر على المنصة. يمكن الاطلاع على النتائج والتقارير من خلال حسابات الطلاب.' },
  { t: 'تخفيضات التسجيل المبكر', c: 'خصم 20% على التسجيل المبكر للفصل القادم. العرض ساري حتى 15 من الشهر القادم.' },
  { t: 'إعلان: فعالية اليوم العالمي للغة العربية', c: 'يسرنا دعوتكم لحضور فعالية اليوم العالمي للغة العربية يوم 18 ديسمبر. تتضمن مسابقات وجوائز قيمة.' },
  { t: 'إجازة نهاية الأسبوع', c: 'تنويهاً: ستكون إجازة نهاية الأسبوع يومي الخميس والجمعة. نتمنى للجميع قضاء وقت ممتع.' },
  { t: 'تحديث المنصة', c: 'تم تحديث المنصة بإضافة ميزة التقارير الأسبوعية. يمكنكم الآن متابعة تقدم أبنائكم بشكل أفضل.' },
  { t: 'عاجل: صيانة المنصة', c: 'سيتم إجراء صيانة للمنصة يوم الجمعة من الساعة 2:00 إلى 6:00 صباحاً. قد تتأثر الخدمة خلال هذه الفترة.' },
];

const DAY_HOURS = {
  'الأحد': ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'],
  'الإثنين': ['14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'],
  'الثلاثاء': ['14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'],
  'الأربعاء': ['14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'],
  'الخميس': ['14:00', '15:00', '16:00', '17:00', '18:00', '19:00'],
  'السبت': ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '16:00', '17:00', '18:00', '19:00'],
};

async function main() {
  console.log('🌱 Seeding LARGE demo dataset...\n');
  const hash = await bcrypt.hash(PASSWORD, 10);
  const hashTime = Date.now();

  // ════════════════════════════════════
  // 1. TEACHERS — 12 teachers
  // ════════════════════════════════════
  console.log('── 1. المعلمين ──');
  const teachers = [];
  for (let i = 0; i < TEACHER_NAMES.length; i++) {
    const t = TEACHER_NAMES[i];
    const id = `${PREFIX}teacher_${i + 1}`;
    const existing = await prisma.teacher.findUnique({ where: { id } }).catch(() => null);
    if (!existing) {
      const teacher = await prisma.teacher.create({
        data: {
          id,
          name: t.name,
          subject: t.subject,
          phone1: `9655${String(10000000 + i).padStart(7, '0')}`,
          price: randomInt(10, 25),
          currency: 'KWD',
          username: id,
          password: hash,
          points: randomInt(100, 1500),
        },
      });
      teachers.push(teacher);
    } else {
      teachers.push(existing);
    }
  }
  console.log(`  ✅ ${teachers.length} معلم`);

  // ════════════════════════════════════
  // 2. PARENTS — 10 parents
  // ════════════════════════════════════
  console.log('\n── 2. أولياء الأمور ──');
  const parents = [];
  for (let i = 0; i < PARENT_NAMES.length; i++) {
    const p = PARENT_NAMES[i];
    const id = `${PREFIX}parent_${i + 1}`;
    const existing = await prisma.parent.findUnique({ where: { id } }).catch(() => null);
    if (!existing) {
      const parent = await prisma.parent.create({ data: { id, name: p.name, phone: p.phone, username: id, password: hash } });
      parents.push(parent);
    } else {
      parents.push(existing);
    }
  }
  console.log(`  ✅ ${parents.length} ولي أمر`);

  // ════════════════════════════════════
  // 3. STUDENTS — 30 students
  // ════════════════════════════════════
  console.log('\n── 3. الطلاب ──');
  const students = [];
  // Distribute 30 students across 10 parents (3 per parent)
  for (let i = 0; i < STUDENT_NAMES.length; i++) {
    const s = STUDENT_NAMES[i];
    const parentIdx = Math.floor(i / 3) % parents.length;
    const id = `${PREFIX}student_${i + 1}`;
    const existing = await prisma.student.findUnique({ where: { id } }).catch(() => null);
    if (!existing) {
      const student = await prisma.student.create({
        data: {
          id,
          name: s.name,
          grade: s.grade,
          curriculum: s.curriculum,
          parentId: parents[parentIdx].id,
          parentPhone: parents[parentIdx].phone,
          username: id,
          password: hash,
          totalPoints: randomInt(100, 2000),
        },
      });
      students.push(student);
    } else {
      students.push(existing);
    }
  }
  console.log(`  ✅ ${students.length} طالب`);

  // ════════════════════════════════════
  // 4. ENROLLMENTS — ~200 enrollments
  //    Each student gets 5-10 subjects (dense schedule like real school)
  // ════════════════════════════════════
  console.log('\n── 4. التسجيلات ──');
  let enrollCount = 0;
  const enrollments = [];

  for (const student of students) {
    // Each student takes 5–10 subjects
    const numSubjects = randomInt(5, 10);
    const shuffled = [...SUBJECTS].sort(() => Math.random() - 0.5).slice(0, numSubjects);

    for (const subject of shuffled) {
      const teacher = teachers.find((t) => t.subject === subject);
      if (!teacher) continue;

      // Core subjects have more sessions per month
      const isCore = ['الرياضيات', 'اللغة العربية', 'اللغة الإنجليزية'].includes(subject);
      const sessionsPerWeek = isCore ? randomInt(2, 4) : randomInt(1, 2);
      const totalSessions = sessionsPerWeek * randomInt(8, 16);
      const startPct = Math.random();
      // Some students are new (few sessions used), some are deep in
      const usedSessions = startPct < 0.2
        ? randomInt(1, Math.max(2, Math.floor(totalSessions * 0.2)))
        : randomInt(Math.floor(totalSessions * 0.3), Math.floor(totalSessions * 0.85));

      // Generate 2–5 different weekdays with 1–2 slots each
      const numDays = isCore ? randomInt(3, 5) : randomInt(1, 3);
      const allDays = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'السبت'];
      const selectedDays = allDays.sort(() => Math.random() - 0.5).slice(0, numDays);

      const finalSchedule = selectedDays.flatMap((day) => {
        const hours = DAY_HOURS[day] || ['16:00'];
        const h1 = pick(hours);
        const h2 = isCore && Math.random() < 0.3 ? pick(hours.filter((h) => h !== h1)) : null;
        return h2 ? [{ day, hour: h1 }, { day, hour: h2 }] : [{ day, hour: h1 }];
      });

      await prisma.enrollment.create({
        data: {
          studentId: student.id,
          teacherId: teacher.id,
          teacherFallback: teacher.name,
          subject,
          sessionsTotal: totalSessions,
          sessionsUsed: usedSessions,
          schedule: JSON.stringify(finalSchedule),
        },
      });
      enrollments.push({ studentId: student.id, teacherId: teacher.id, teacherName: teacher.name, studentName: student.name, subject, schedule: finalSchedule });
      enrollCount++;
    }
  }
  console.log(`  ✅ ${enrollCount} تسجيل`);

  // ════════════════════════════════════
  // 5. SESSIONS — 150 days (past 120 + future 30)
  //    Each enrollment generates sessions per its schedule days
  // ════════════════════════════════════
  console.log('\n── 5. الحصص ──');
  let sessionCount = 0;

  for (let dayOffset = 120; dayOffset >= -30; dayOffset--) {
    const d = new Date();
    d.setDate(d.getDate() - dayOffset);
    const dayNameStr = dayName(d);
    if (dayNameStr === 'الجمعة') continue;

    for (const enr of enrollments) {
      const slots = typeof enr.schedule === 'string' ? JSON.parse(enr.schedule) : enr.schedule;
      if (!Array.isArray(slots)) continue;

      // Find all slots for this day (support double-slot days)
      const daySlots = slots.filter((s) => s.day === dayNameStr);
      if (daySlots.length === 0) continue;

      for (const slot of daySlots) {
        const status = d < new Date()
          ? (Math.random() < 0.08 ? 'cancelled' : 'completed')
          : 'scheduled';

        const sid = `${PREFIX}sess_${enr.studentId}_${enr.subject.replace(/\s/g, '')}_${dayOffset}_${slot.hour.replace(':', '')}`;

        await prisma.session.create({
          data: {
            id: sid,
            studentId: enr.studentId,
            teacherId: enr.teacherId,
            studentName: enr.studentName,
            teacherName: enr.teacherName,
            subject: enr.subject,
            date: d.toISOString().split('T')[0],
            day: dayNameStr,
            time: slot.hour,
            price: randomInt(0, 25),
            status,
          },
        }).catch(() => {});

        sessionCount++;
      }
    }
  }
  console.log(`  ✅ ${sessionCount} حصة`);

  // ════════════════════════════════════
  // 6. POINTS LOGS — 30 per student = 900
  // ════════════════════════════════════
  console.log('\n── 6. سجل النقاط ──');
  let pointsCount = 0;
  for (const student of students) {
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(d.getDate() - randomInt(1, 90));
      const pid = `${PREFIX}pts_${student.id}_${i}`;
      const amount = randomInt(1, 12) <= 2 ? pick([50, 75, 100]) : pick([3, 5, 10, 15, 20, 25, 30]);
      await prisma.pointsLog.create({
        data: {
          id: pid,
          studentId: student.id,
          amount,
          action: pick(POINT_ACTIONS),
          timestamp: d,
        },
      }).catch(() => {});
      pointsCount++;
    }
  }
  console.log(`  ✅ ${pointsCount} سجل نقطة`);

  // ════════════════════════════════════
  // 7. ANNOUNCEMENTS — 20
  // ════════════════════════════════════
  console.log('\n── 7. الإعلانات ──');
  let annCount = 0;
  for (let i = 0; i < 20; i++) {
    const tpl = pick(ANNOUNCEMENT_TITLES);
    const aid = `${PREFIX}ann_${i + 1}`;
    const d = new Date();
    d.setDate(d.getDate() - randomInt(0, 90));
    const type = i < 3 ? 'urgent' : pick(ANNOUNCEMENT_TYPES);
    await prisma.announcement.create({
      data: {
        id: aid,
        title: tpl.t,
        content: tpl.c,
        type,
        date: d.toISOString().split('T')[0],
        isActive: 1,
      },
    }).catch(() => {});
    annCount++;
  }
  console.log(`  ✅ ${annCount} إعلان`);

  // ════════════════════════════════════
  // 8. TEACHER AVAILABILITY — each teacher 4-6 days
  // ════════════════════════════════════
  console.log('\n── 8. أوقات المعلمين ──');
  let availCount = 0;
  for (const teacher of teachers) {
    const numDays = pick([4, 5, 6]);
    const all = [0, 1, 2, 3, 4, 6]; // skip Friday (5)
    const days = all.sort(() => Math.random() - 0.5).slice(0, numDays);
    for (const dayIdx of days) {
      const avid = `${PREFIX}avail_${teacher.id}_${dayIdx}`;
      const startH = dayIdx === 6 ? 8 : 14; // Saturday starts at 8am
      const endH = dayIdx === 6 ? 20 : 21;
      await prisma.teacherAvailability.create({
        data: {
          id: avid,
          teacherId: teacher.id,
          teacherName: teacher.name,
          dayOfWeek: dayIdx,
          startTime: `${startH}:00`,
          endTime: `${endH}:00`,
          isAvailable: 1,
        },
      }).catch(() => {});
      availCount++;
    }
  }
  console.log(`  ✅ ${availCount} وقت`);

  // ════════════════════════════════════
  // 9. ADMIN CHECK
  // ════════════════════════════════════
  const admin = await prisma.user.findFirst({ where: { role: 'admin' } });
  if (admin) {
    console.log(`\n  👤 مدير النظام: ${admin.username} / (كلمة المرور الحالية)`);
  } else {
    await prisma.user.create({
      data: { id: `${PREFIX}admin`, name: 'مدير النظام', username: 'admin', password: hash, role: 'admin', permissions: JSON.stringify(['*']) },
    });
    console.log(`\n  ✅ مدير النظام: admin / ${PASSWORD}`);
  }

  // ════════════════════════════════════
  // SUMMARY
  // ════════════════════════════════════
  const elapsed = ((Date.now() - hashTime) / 1000).toFixed(1);
  console.log('\n═══════════════════════════════════════');
  console.log(`  ✅ تمت إضافة البيانات التجريبية (${elapsed} ث)`);
  console.log('  📌 كلمة المرور: 123456');
  console.log("  🗑️ للحذف: DELETE FROM tablename WHERE id LIKE 'demo_%'");
  console.log('───────────────────────────────────────');
  console.log(`  👥 ${teachers.length} معلم`);
  console.log(`  👪 ${parents.length} ولي أمر`);
  console.log(`  🧑 ${students.length} طالب`);
  console.log(`  📋 ${enrollCount} تسجيل`);
  console.log(`  📅 ${sessionCount} حصة`);
  console.log(`  ⭐ ${pointsCount} سجل نقطة`);
  console.log(`  📢 ${annCount} إعلان`);
  console.log('═══════════════════════════════════════\n');
}

main()
  .catch((e) => { console.error('❌', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
