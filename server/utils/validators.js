const { z } = require('zod');

// Shared basic schemas
const idSchema = z.string().or(z.number());
const phoneSchema = z.string().min(10, "Phone number too short").optional().or(z.literal(''));

/**
 * Pure numeric coercion tolerant of Eastern-Arabic digit strings, returning
 * NaN for garbage instead of false 0. Use in non-zod routes before Prisma.
 */
function parseTolerantNumber(val) {
  const s = String(val ?? '')
    .replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[\u06F0-\u06F9]/g, (d) => String(d.charCodeAt(0) - 0x06F0))
    .trim();
  const n = Number(s);
  return Number.isFinite(n) ? n : NaN;
}

/**
 * Local YYYY-MM-DD (or YYYY-MM with month=true). Display/driven strings in the
 * DB are local calendar dates, but toISOString() shifts them a day back on
 * UTC+2/+3 between 00:00–02:00 local (monthly stats, rate lookups, reminders).
 */
function localYmd(d = new Date(), month = false) {
  const base = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  return month ? base : `${base}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Tolerant numeric coercion: accepts real numbers, ASCII numeric strings AND
 * Eastern-Arabic digit strings ("١٦٠" / "۱۶۰"). Number() alone fails on those
 * (NaN), which either 500s the request or silently stores 0.
 */
function numericField({ int = false, min = null, max = null, nullable = false, optional = false, def = undefined } = {}) {
  const parse = (val) => {
    const s = String(val)
      .replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 0x0660))
      .replace(/[\u06F0-\u06F9]/g, (d) => String(d.charCodeAt(0) - 0x06F0))
      .trim();
    let n = Number(s);
    if (!Number.isFinite(n)) return NaN; // garbage input → validation error
    if (int) n = Math.round(n);
    if (min !== null && n < min) return NaN; // out of range → validation error
    if (max !== null && n > max) return NaN;
    return n;
  };
  let schema = z.union([z.number(), z.string()], { errorMap: () => ({ message: 'must be a number' }) })
    .transform((v, ctx) => {
      const n = parse(v);
      if (Number.isNaN(n)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'قيمة رقمية غير صالحة' });
        return z.NEVER;
      }
      return n;
    });
  if (nullable) schema = schema.nullable();
  if (optional || def !== undefined) schema = schema.optional();
  if (def !== undefined) schema = schema.default(def);
  return schema;
}

// --- Student Schemas ---
const createStudentSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(2, "Name is required (min 2 chars)").trim(),
    grade: z.string().nullable().optional().or(z.literal('')),
    groupName: z.string().nullable().optional().or(z.literal('')),
    parentPhone: z.string().nullable().optional().or(z.literal('')),
    studentPhone: z.string().nullable().optional().or(z.literal('')),
    curriculum: z.string().nullable().optional().or(z.literal('')),
    notes: z.string().nullable().optional().or(z.literal('')),
    sessionPrice: numericField({ nullable: true, optional: true }),
    balance: numericField({ nullable: true, optional: true, def: 0 }),
    username: z.string().nullable().optional().or(z.literal('')),
    password: z.string().nullable().optional().or(z.literal('')),
    currency: z.string().optional(),
    enrollments: z.array(z.any()).nullable().optional()
});

const updateStudentSchema = createStudentSchema.partial();

// --- Teacher Schemas ---
const createTeacherSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(2, "Name is required").trim(),
    phone1: z.string().optional().or(z.literal('')),
    phone2: z.string().optional().or(z.literal('')),
    subject: z.string().optional().or(z.literal('')),
    price: numericField({ def: 0 }),
    email: z.string().optional().or(z.literal('')),
    currency: z.string().optional(),
    username: z.string().optional().or(z.literal('')),
    password: z.string().optional().or(z.literal('')),
    points: numericField({ optional: true })
});

const updateTeacherSchema = createTeacherSchema.partial();

// --- Parent Schemas ---
const createParentSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(2, "Name is required").trim(),
    phone: z.string().min(1, "Phone is required").trim(),
    email: z.string().email().optional().or(z.literal('')),
    username: z.string().optional().or(z.literal('')),
    password: z.string().optional().or(z.literal('')),
    studentCount: z.number().optional()
});

const updateParentSchema = createParentSchema.partial();

// --- Session Schemas ---
const createSessionSchema = z.object({
    id: z.string().optional(),
    studentId: idSchema,
    studentName: z.string().min(1, "Student Name is required"),
    teacherId: idSchema.optional(),
    teacherName: z.string().min(1, "Teacher Name is required"),
    subject: z.string().optional(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
    day: z.string().optional(),
    time: z.string().optional(),
    price: numericField({ def: 0 }),
    currency: z.string().optional(),
    teacherCurrency: z.string().optional(),
    status: z.enum(['scheduled', 'completed', 'cancelled', 'pending']).default('scheduled')
});

const updateSessionSchema = createSessionSchema.partial();

// --- Evaluation Schemas ---
const createEvaluationSchema = z.object({
    id: z.string().optional(),
    studentId: z.string().min(1, "Student ID is required"),
    teacherId: z.string().optional(),
    teacherName: z.string().optional(),
    sessionId: z.string().optional(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD").optional().or(z.literal('')),
    rating: z.enum(['ممتاز', 'جيد جدًا', 'جيد', 'مقبول', 'ضعيف', 'يحتاج تحسين']).default('ممتاز'),
    notes: z.string().optional().or(z.literal('')),
    points: numericField({ int: true, min: 0, max: 50, def: 0 })
});

const updateEvaluationSchema = createEvaluationSchema.partial();

// --- Trial Session Schemas ---
const createTrialSessionSchema = z.object({
    id: z.string().optional(),
    studentName: z.string().min(1, "Student name is required").trim(),
    parentPhone: z.string().min(1, "Parent phone is required").trim(),
    subject: z.string().optional().or(z.literal('')),
    teacherId: z.string().optional(),
    teacherName: z.string().optional().or(z.literal('')),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
    time: z.string().optional().or(z.literal('')),
    notes: z.string().optional().or(z.literal(''))
});

const updateTrialSessionSchema = createTrialSessionSchema.partial();

// --- Teacher Availability Schemas ---
const createAvailabilitySchema = z.object({
    teacherId: z.string().min(1, "Teacher ID is required"),
    teacherName: z.string().min(1, "Teacher name is required"),
    slots: z.array(z.object({
        dayOfWeek: z.number().int().min(0).max(6),
        startTime: z.string().regex(/^\d{2}:\d{2}$/, "Time must be HH:MM"),
        endTime: z.string().regex(/^\d{2}:\d{2}$/, "Time must be HH:MM"),
        isAvailable: z.number().int().min(0).max(1).optional().default(1)
    })).min(1, "At least one slot is required")
});

// --- Task Schemas ---
const createTaskSchema = z.object({
    id: z.string().optional(),
    title: z.string().min(1, "Title is required").trim(),
    description: z.string().optional().or(z.literal('')),
    status: z.enum(['pending', 'in-progress', 'completed']).default('pending'),
    priority: z.enum(['low', 'medium', 'high']).default('medium'),
    dueDate: z.string().optional().or(z.literal('')),
    userId: z.string().optional()
});

const updateTaskSchema = createTaskSchema.partial();

// --- Invoice Schemas ---
const createStudentInvoiceSchema = z.object({
    id: z.string().optional(),
    studentId: idSchema,
    studentName: z.string().min(1, "Student Name is required"),
    amount: numericField(),
    currency: z.string().optional(),
    description: z.string().optional(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
    dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD").optional(),
    status: z.enum(['pending', 'paid', 'overdue', 'partially_paid', 'unpaid', 'absent']).default('pending'),
    paymentMethod: z.string().optional(),
    notes: z.string().optional(),
    items: z.array(z.any()).optional()
});

const createTeacherInvoiceSchema = z.object({
    id: z.string().optional(),
    teacherId: idSchema.optional(),
    teacher: z.string().min(1, "Teacher Name is required"),
    specialization: z.string().optional().or(z.literal('')),
    amount: numericField(),
    currency: z.string().optional(),
    status: z.enum(['pending', 'paid', 'reviewed', 'unpaid']).default('pending'),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
    paymentMethod: z.string().optional().or(z.literal('')),
    personalExpenses: numericField({ optional: true })
});

// --- Enrollment Schemas ---
const createEnrollmentSchema = z.object({
    studentId: z.string().min(1, "Student ID is required"),
    teacherId: z.string().nullable().optional(),
    teacher: z.string().optional().or(z.literal('')),
    subject: z.string().min(1, "Subject is required"),
    curr: z.string().optional().or(z.literal('')),
    curriculum: z.string().optional().or(z.literal('')),
    sessionsTotal: numericField({ int: true, min: 0, def: 0 }),
    teacherPrice: numericField({ int: true, min: 0, nullable: true, optional: true }),
    schedule: z.array(z.object({
        day: z.string(),
        hour: z.string(),
        period: z.string().optional()
    })).optional().default([]),
    sessions: z.array(z.object({
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        day: z.string().optional(),
        time: z.string().optional()
    })).optional().default([]),
    nextSessionNotes: z.string().nullable().optional()
});

const updateEnrollmentSchema = createEnrollmentSchema.partial();

const updateEnrollmentScheduleSchema = z.object({
    schedule: z.array(z.object({
        day: z.string(),
        hour: z.string(),
        period: z.string().optional()
    })).optional().default([])
});

const updateEnrollmentNotesSchema = z.object({
    notes: z.string().max(1000).nullable().optional()
});

const createLeadSchema = z.object({
    id: z.string().optional(),
    studentName: z.string().min(1, "Student name is required").trim(),
    phone: z.string().min(1, "Phone is required").trim(),
    subject: z.string().optional().or(z.literal('')),
    curriculum: z.string().optional().or(z.literal('')),
    status: z.enum(['new', 'contacted', 'interested', 'trial', 'converted', 'lost']).default('new'),
    priority: z.enum(['low', 'medium', 'high']).default('medium'),
    notes: z.string().optional().or(z.literal(''))
});

const updateLeadSchema = createLeadSchema.partial();

module.exports = {
    parseTolerantNumber,
    localYmd,
    createStudentSchema,
    updateStudentSchema,
    createTeacherSchema,
    updateTeacherSchema,
    createParentSchema,
    updateParentSchema,
    createSessionSchema,
    updateSessionSchema,
    createEvaluationSchema,
    updateEvaluationSchema,
    createTrialSessionSchema,
    updateTrialSessionSchema,
    createAvailabilitySchema,
    createTaskSchema,
    updateTaskSchema,
    createStudentInvoiceSchema,
    updateStudentInvoiceSchema: createStudentInvoiceSchema.partial(),
    createTeacherInvoiceSchema,
    updateTeacherInvoiceSchema: createTeacherInvoiceSchema.partial(),
    createEnrollmentSchema,
    updateEnrollmentSchema,
    updateEnrollmentScheduleSchema,
    updateEnrollmentNotesSchema,

    createLeadSchema,
    updateLeadSchema
};
