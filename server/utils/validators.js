const { z } = require('zod');

// Shared basic schemas
const idSchema = z.string().or(z.number());
const phoneSchema = z.string().min(10, "Phone number too short").optional().or(z.literal(''));

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
    sessionPrice: z.number().or(z.string().transform(val => Number(val))).nullable().optional(),
    balance: z.number().or(z.string().transform(val => Number(val))).nullable().optional().default(0),
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
    price: z.number().or(z.string().transform(val => Number(val))).optional().default(0),
    percentage: z.number().or(z.string().transform(val => Number(val))).optional(),
    color: z.string().optional(),
    currency: z.string().optional(),
    username: z.string().optional().or(z.literal('')),
    password: z.string().optional().or(z.literal(''))
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
    price: z.number().or(z.string().transform(val => Number(val))).default(0),
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
    points: z.number().int().min(0).default(0)
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
    amount: z.number().or(z.string().transform(val => Number(val))),
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
    amount: z.number().or(z.string().transform(val => Number(val))),
    currency: z.string().optional(),
    status: z.enum(['pending', 'paid', 'reviewed', 'unpaid']).default('pending'),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
    paymentMethod: z.string().optional().or(z.literal('')),
    personalExpenses: z.number().or(z.string().transform(val => Number(val))).optional()
});

// --- Lead Schemas ---
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
    createLeadSchema,
    updateLeadSchema
};
