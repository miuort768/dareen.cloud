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

const ARABIC_DAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const dayName = (d) => ARABIC_DAYS[new Date(d).getDay()];

function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

const TEACHER_NAMES = [
  { name: 'فاطمة محمد', subject: 'الرياضيات' },
  { name: 'نورة سعد', subject: 'اللغة العربية' },
  { name: 'سارة خالد', subject: 'العلوم' },
  { name: 'هدى إبراهيم', subject: 'اللغة الإنجليزية' },
  { name: 'منى حسن', subject: 'التربية الإسلامية' },
  { name: 'رنا جمال', subject: 'الرياضيات' },
  { name: 'ليلى عبدالله', subject: 'اللغة العربية' },
  { name: 'مريم علي', subject: 'الفيزياء' },
  { name: 'أحمد عبدالله', subject: 'الكيمياء' },
  { name: 'خالد يوسف', subject: 'الأحياء' },
  { name: 'محمد علي', subject: 'التاريخ' },
  { name: 'عبدالرحمن عمر', subject: 'الجغرافيا' },
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

const TRIAL_STUDENT_NAMES = [
  'راشد العنزي', 'مشاري المطيري', 'عبدالله العجمي', 'فواز الشمري', 'تركي الدوسري',
  'حمد العتيبي', 'بدر الزهراني', 'ناصر الغامدي', 'ماجد القحطاني', 'سعود السلمي',
  'يوسف الحربي', 'عمر الثبيتي', 'فيصل الشهري', 'بسام القرني', 'طلال المالكي',
  'عزام الحارثي', 'همام الشهراني', 'مازن البيشي', 'عاصم الأحمري', 'غسان العمري',
  'كنانة اليامي', 'لؤي السبيعي', 'إياد الزهراني', 'مهند القحطاني', 'وضاح الشمراني',
  'نوف السبيعي', 'تالا العتيبي', 'جود الرشيدي', 'لورا المطيري', 'سارة الدوسري',
];

const LEAD_STUDENT_NAMES = [
  'مشعل الحربي', 'نواف السلمي', 'عبدالرحمن المالكي', 'صقر الشمري', 'صالح القرني',
  'هزاع القحطاني', 'متعب العتيبي', 'نايف الدوسري', 'سلطان العنزي', 'فيصل المطيري',
  'غالية الرشيد', 'ديمة السبيعي', 'ميرة اليامي', 'لمى الشهراني', 'تالا الحربي',
  'بشائر المالكي', 'أثير البيشي', 'رفيدة الأحمري', 'رهف القرني', 'عتاب الغامدي',
  'خالد الزهراني', 'سامي الشمري', 'عبدالعزيز العجمي', 'معاذ المطيري', 'إبراهيم السلمي',
  'صهيب الدوسري', 'زياد العنزي', 'حازم الحارثي', 'قسام الثبيتي', 'أكرم الشهري',
];

const CONTACT_NAMES = [
  'أم خالد', 'أبو عبدالله', 'أم سعد', 'أبو تركي', 'أم نورة',
  'أبو يوسف', 'أم محمد', 'أبو عمر', 'أم لينا', 'أو سيف',
  'أم راشد', 'أبو فيصل', 'أم جاسم', 'أبو حمد', 'أم روان',
  'أبو ماجد', 'أم فهد', 'أبو باسل', 'أم علي', 'أبو هاني',
];

const JOB_NAMES = [
  { name: 'نورة الشمري', qualification: 'بكالوريوس رياضيات', position: 'معلمة رياضيات', subject: 'الرياضيات' },
  { name: 'مها العتيبي', qualification: 'بكالوريوس لغة عربية', position: 'معلمة لغة عربية', subject: 'اللغة العربية' },
  { name: 'سارة القحطاني', qualification: 'بكالوريوس فيزياء', position: 'معلمة فيزياء', subject: 'الفيزياء' },
  { name: 'حصة الدوسري', qualification: 'بكالوريوس كيمياء', position: 'معلمة كيمياء', subject: 'الكيمياء' },
  { name: 'جواهر السبيعي', qualification: 'بكالوريوس أحياء', position: 'معلمة أحياء', subject: 'الأحياء' },
  { name: 'منيرة المالكي', qualification: 'بكالوريوس لغة إنجليزية', position: 'معلمة إنجليزية', subject: 'اللغة الإنجليزية' },
  { name: 'بدور العنزي', qualification: 'بكالوريوس علوم', position: 'معلمة علوم', subject: 'العلوم' },
  { name: 'نوف المطيري', qualification: 'بكالوريوس تربية إسلامية', position: 'معلمة تربية إسلامية', subject: 'التربية الإسلامية' },
  { name: 'شعاع الحربي', qualification: 'بكالوريوس تاريخ', position: 'معلمة تاريخ', subject: 'التاريخ' },
  { name: 'عذوب اليامي', qualification: 'ماجستير جغرافيا', position: 'معلمة جغرافيا', subject: 'الجغرافيا' },
  { name: 'لطيفة الشهراني', qualification: 'بكالوريوس رياضيات', position: 'معلمة رياضيات', subject: 'الرياضيات' },
  { name: 'أمل الغامدي', qualification: 'بكالوريوس لغة عربية', position: 'معلمة لغة عربية', subject: 'اللغة العربية' },
  { name: 'دانة البيشي', qualification: 'بكالوريوس لغة إنجليزية', position: 'معلمة إنجليزية', subject: 'اللغة الإنجليزية' },
  { name: 'هند الأحمري', qualification: 'بكالوريوس علوم', position: 'معلمة علوم', subject: 'العلوم' },
  { name: 'ريم الزهراني', qualification: 'بكالوريوس تربية إسلامية', position: 'معلمة تربية إسلامية', subject: 'التربية الإسلامية' },
];

const TRIAL_NOTES = [
  'اتصال هاتفي جيد، الطالب بحاجة لدعم في الأساسيات',
  'الحصة التجريبية ممتازة، الطالب مستواه متوسط',
  'تم شرح المنهج للطالب وولي الأمر كان حاضراً',
  'الطالب متحمس للبدء، يفضل معلمة',
  'الحصة التجريبية عبر زووم، اتصال مستقر',
  'الطالب يعاني من صعوبات في الفهم السريع',
  'طلب ولي الأمر معادلة المستوى قبل البدء',
  'تم تحديد مواعيد مناسبة للطالب',
  'الحصة التجريبية مقبولة، يحتاج متابعة مستمرة',
  'تم الاتفاق على البدء الأسبوع القادم',
];

const LEAD_NOTES = [
  'اتصل وطلب معلومات عن المنهج الكويتي',
  'مهتم بالتسجيل بعد العودة من السفر',
  'طلب مقارنة أسعار بين المعلمين',
  'بحث عن معلم متخصص في المنهج السعودي',
  'يرغب في حصتين تجريبيتين قبل الاشتراك',
  'تم إرسال المنهج الدراسي عبر الواتساب',
  'طلب التواصل مع معلمين متخصصين',
  'متابعة بعد أسبوع، لا يزال يفكر',
  'تم تحويله لحصة تجريبية',
  'العميل جاد، يبحث عن معلمة قريبة من المنطقة',
];

const JOB_POSITIONS = ['معلمة رياضيات', 'معلمة لغة عربية', 'معلمة علوم', 'معلمة إنجليزية', 'معلمة فيزياء', 'معلمة كيمياء', 'معلمة أحياء', 'معلمة تربية إسلامية', 'معلمة تاريخ', 'معلمة جغرافيا'];
const QUALIFICATIONS = ['بكالوريوس', 'ماجستير', 'دكتوراه', 'دبلوم عالي', 'شهادة جامعية'];

const DAY_HOURS = {
  'الأحد': ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'],
  'الاثنين': ['14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'],
  'الثلاثاء': ['14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'],
  'الأربعاء': ['14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'],
  'الخميس': ['14:00', '15:00', '16:00', '17:00', '18:00', '19:00'],
  'السبت': ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '16:00', '17:00', '18:00', '19:00'],
};

// Convert 24h "HH:mm" to the canonical 12h slot format used across the app: { hour: '9', period: 'am'|'pm' }
const toSlotHour = (hhmm) => {
  const h = parseInt(String(hhmm).split(':')[0], 10);
  const period = h >= 12 ? 'pm' : 'am';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return { hour: String(hour12), period };
};

async function main() {
  console.log('🌱 Seeding LARGE demo dataset...\n');
  const hash = await bcrypt.hash(PASSWORD, 10);
  const hashTime = Date.now();

  // ── Clean all previous demo_ records ──
  console.log('── 0. تنظيف البيانات القديمة ──');
  // String-id models
  const strModels = ['trialSession', 'lead', 'contactMessage', 'jobApplication', 'session', 'pointsLog', 'teacherAvailability', 'announcement', 'student', 'parent', 'teacher'];
  let cleaned = 0;
  for (const m of strModels) {
    const model = prisma[m];
    if (!model) continue;
    const r = await model.deleteMany({ where: { id: { startsWith: 'demo_' } } });
    cleaned += r.count;
  }
  // Int-id models (Enrollment has autoincrement id, filter by studentId)
  const e = await prisma.enrollment.deleteMany({ where: { studentId: { startsWith: 'demo_' } } });
  cleaned += e.count;
  console.log(`  🗑️ تم حذف ${cleaned} سجل قديم\n`);

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
      const allDays = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'السبت'];
      const selectedDays = allDays.sort(() => Math.random() - 0.5).slice(0, numDays);

      const finalSchedule = selectedDays.flatMap((day) => {
        const hours = DAY_HOURS[day] || ['16:00'];
        const h1 = pick(hours);
        const h2 = isCore && Math.random() < 0.3 ? pick(hours.filter((h) => h !== h1)) : null;
        const s1 = toSlotHour(h1);
        const s2 = h2 ? toSlotHour(h2) : null;
        return s2 ? [{ day, hour: s1.hour, period: s1.period }, { day, hour: s2.hour, period: s2.period }] : [{ day, hour: s1.hour, period: s1.period }];
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
            time: `${slot.hour}:00 ${slot.period === 'am' ? 'صباحاً' : 'مساءً'}`,
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
  // 9. TRIAL SESSIONS — 40 حصة تجريبية
  // ════════════════════════════════════
  console.log('\n── 9. الحصص التجريبية ──');
  let trialCount = 0;
  for (let i = 0; i < 40; i++) {
    const tid = `${PREFIX}trial_${i + 1}`;
    const existing = await prisma.trialSession.findUnique({ where: { id: tid } }).catch(() => null);
    if (existing) continue;

    const teacher = pick(teachers);
    const d = new Date();
    d.setDate(d.getDate() - randomInt(0, 60));
    const status = d < new Date(Date.now() - 86400000 * 3)
      ? pick(['completed', 'cancelled'])
      : pick(['pending', 'confirmed']);

    await prisma.trialSession.create({
      data: {
        id: tid,
        studentName: pick(TRIAL_STUDENT_NAMES),
        parentPhone: `965${String(50000000 + randomInt(0, 9999999)).padStart(8, '0')}`,
        subject: pick(SUBJECTS),
        teacherId: teacher.id,
        teacherName: teacher.name,
        date: d.toISOString().split('T')[0],
        time: pick(DAY_HOURS[dayName(d)] || ['16:00']),
        status,
        notes: pick(TRIAL_NOTES),
      },
    });
    trialCount++;
  }
  console.log(`  ✅ ${trialCount} حصة تجريبية`);

  // ════════════════════════════════════
  // 10. LEADS — 60 عميل مهتم
  // ════════════════════════════════════
  console.log('\n── 10. العملاء المهتمين ──');
  let leadCount = 0;
  for (let i = 0; i < 60; i++) {
    const lid = `${PREFIX}lead_${i + 1}`;
    const existing = await prisma.lead.findUnique({ where: { id: lid } }).catch(() => null);
    if (existing) continue;

    const d = new Date();
    d.setDate(d.getDate() - randomInt(0, 90));
    const status = randomInt(1, 10) <= 2 ? pick(['new', 'new', 'new']) : pick(['contacted', 'interested', 'trial', 'converted', 'lost']);
    const priority = randomInt(1, 10) <= 2 ? 'high' : (randomInt(1, 10) <= 5 ? 'medium' : 'low');

    await prisma.lead.create({
      data: {
        id: lid,
        studentName: pick(LEAD_STUDENT_NAMES),
        phone: `965${String(60000000 + randomInt(0, 9999999)).padStart(8, '0')}`,
        subject: pick(SUBJECTS),
        curriculum: pick(CURRICULUMS),
        status,
        priority,
        notes: pick(LEAD_NOTES),
        createdAt: d,
      },
    });
    leadCount++;
  }
  console.log(`  ✅ ${leadCount} عميل مهتم`);

  // ════════════════════════════════════
  // 11. CONTACT MESSAGES — 20 رسالة
  // ════════════════════════════════════
  console.log('\n── 11. رسائل التواصل ──');
  let contactCount = 0;
  const contactSubjects = ['استفسار عن التسجيل', 'طلب معلومات المنهج', 'استفسار عن الأسعار', 'طلب حصة تجريبية', 'مقترح', 'شكوى'];
  const contactMessages = [
    'السلام عليكم، أرغب في تسجيل ابني في حصص الرياضيات للمنهج الكويتي',
    'كم تكلفة الحصص للصف الخامس منهج كويت؟',
    'هل يوجد معلمات متخصصات في المنهج السعودي للصف الرابع؟',
    'أريد حصة تجريبية في اللغة الإنجليزية لابنتي',
    'هل توفرون حصص أونلاين للمنهج القطري؟',
    'اريد معلومات عن الحصص والمدرسين المتاحين',
    'هل هناك خصم للتسجيل المبكر؟',
    'ابني يحتاج متابعة في مادة العلوم، هل يوجد معلمة متخصصة؟',
    'كم عدد الحصص في الأسبوع للغة العربية؟',
    'ما هي مواعيد الحصص المسائية المتاحة؟',
  ];
  for (let i = 0; i < 20; i++) {
    const cid = `${PREFIX}contact_${i + 1}`;
    const existing = await prisma.contactMessage.findUnique({ where: { id: cid } }).catch(() => null);
    if (existing) continue;

    const d = new Date();
    d.setDate(d.getDate() - randomInt(0, 90));
    await prisma.contactMessage.create({
      data: {
        id: cid,
        name: pick(CONTACT_NAMES),
        phone: `965${String(70000000 + randomInt(0, 9999999)).padStart(8, '0')}`,
        subject: pick(contactSubjects),
        curriculum: pick(CURRICULUMS),
        message: pick(contactMessages),
        createdAt: d,
      },
    });
    contactCount++;
  }
  console.log(`  ✅ ${contactCount} رسالة`);

  // ════════════════════════════════════
  // 12. JOB APPLICATIONS — 15 طلب توظيف
  // ════════════════════════════════════
  console.log('\n── 12. طلبات التوظيف ──');
  let jobCount = 0;
  const curriculumsList = ['الكويت', 'السعودية', 'قطر', 'الإمارات', 'عمان', 'البحرين'];
  for (const j of JOB_NAMES) {
    const jid = `${PREFIX}job_${j.name.replace(/\s/g, '')}`;
    const existing = await prisma.jobApplication.findUnique({ where: { id: jid } }).catch(() => null);
    if (existing) continue;

    const d = new Date();
    d.setDate(d.getDate() - randomInt(0, 60));
    await prisma.jobApplication.create({
      data: {
        id: jid,
        name: j.name,
        phone: `965${String(90000000 + randomInt(0, 9999999)).padStart(8, '0')}`,
        whatsapp: `965${String(90000000 + randomInt(0, 9999999)).padStart(8, '0')}`,
        position: j.position,
        qualification: j.qualification,
        subject: j.subject,
        grade: pick(GRADES),
        graduationYear: String(randomInt(2015, 2025)),
        onlineYears: String(randomInt(1, 10)),
        curriculums: pick([curriculumsList.slice(0, randomInt(1, 4)).join('، ')]),
        contacted: Math.random() < 0.3 ? 1 : 0,
        createdAt: d,
      },
    });
    jobCount++;
  }
  console.log(`  ✅ ${jobCount} طلب توظيف`);

  // ════════════════════════════════════
  // 13. ADMIN CHECK
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
  console.log(`  👩‍🏫 ${teachers.length} معلم/ة (8 معلمات)`);
  console.log(`  👪 ${parents.length} ولي أمر`);
  console.log(`  🧑 ${students.length} طالب`);
  console.log(`  📋 ${enrollCount} تسجيل`);
  console.log(`  📅 ${sessionCount} حصة`);
  console.log(`  ⭐ ${pointsCount} سجل نقطة`);
  console.log(`  📢 ${annCount} إعلان`);
  console.log(`  🔬 ${trialCount} حصة تجريبية`);
  console.log(`  🤝 ${leadCount} عميل مهتم`);
  console.log(`  ✉️ ${contactCount} رسالة تواصل`);
  console.log(`  💼 ${jobCount} طلب توظيف`);
  console.log('═══════════════════════════════════════\n');
}

main()
  .catch((e) => { console.error('❌', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
