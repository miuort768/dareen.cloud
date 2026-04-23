const { z } = require('zod');

// Shared basic schemas
const idSchema = z.string().or(z.number()); // IDs can be string or auto-inc number (though mostly UUID strings in this app)
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
    enrollments: z.array(z.any()).nullable().optional()
});

const updateStudentSchema = createStudentSchema.partial().extend({
    // Add specific fields for update if any
});

// --- Teacher Schemas ---
const createTeacherSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(2, "Name is required").trim(),
    phone: z.string().optional().or(z.literal('')),
    subject: z.string().optional().or(z.literal('')),
    price: z.number().or(z.string().transform(val => Number(val))).optional().default(0),
    percentage: z.number().or(z.string().transform(val => Number(val))).optional(),
    color: z.string().optional(),
    username: z.string().optional().or(z.literal('')),
    password: z.string().optional().or(z.literal(''))
});

// --- Parent Schemas ---
const createParentSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(2, "Name is required").trim(),
    phone: z.string().min(1, "Phone is required").trim(), // Parents MUST have a phone as ID often relies on it or it's unique
    email: z.string().email().optional().or(z.literal('')),
    username: z.string().optional().or(z.literal('')),
    password: z.string().optional().or(z.literal('')),
    studentCount: z.number().optional()
});

// --- Session Schemas ---
const createSessionSchema = z.object({
    id: z.string().optional(), // Often generated on client or server
    studentId: idSchema,
    studentName: z.string().min(1, "Student Name is required"),
    teacherId: idSchema.optional(),
    teacherName: z.string().min(1, "Teacher Name is required"),
    subject: z.string().optional(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
    day: z.string().optional(),
    time: z.string().optional(),
    price: z.number().or(z.string().transform(val => Number(val))).default(0),
    status: z.enum(['scheduled', 'completed', 'cancelled', 'pending']).default('scheduled')
});

const updateSessionSchema = createSessionSchema.partial();

// --- Invoice Schemas ---
// Student Invoice
const createStudentInvoiceSchema = z.object({
    id: z.string().optional(),
    studentId: idSchema,
    studentName: z.string().min(1, "Student Name is required"),
    amount: z.number().or(z.string().transform(val => Number(val))),
    description: z.string().optional(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
    dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD").optional(),
    status: z.enum(['pending', 'paid', 'overdue', 'partially_paid', 'unpaid', 'absent']).default('pending'),
    paymentMethod: z.string().optional(),
    notes: z.string().optional(),
    items: z.array(z.any()).optional()
});

// Teacher Invoice
const createTeacherInvoiceSchema = z.object({
    id: z.string().optional(),
    teacherId: idSchema.optional(),
    teacher: z.string().min(1, "Teacher Name is required"),
    specialization: z.string().optional().or(z.literal('')),
    amount: z.number().or(z.string().transform(val => Number(val))),
    status: z.enum(['pending', 'paid', 'reviewed', 'مدفوعة', 'قيد المعالجة', 'متأخرة', 'غير مدفوعة', 'unpaid']).default('pending'),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
    paymentMethod: z.string().optional().or(z.literal('')),
    personalExpenses: z.number().or(z.string().transform(val => Number(val))).optional()
});

module.exports = {
    createStudentSchema,
    updateStudentSchema,
    createTeacherSchema,
    createParentSchema,
    createSessionSchema,
    updateSessionSchema,
    createStudentInvoiceSchema,
    updateStudentInvoiceSchema: createStudentInvoiceSchema.partial(),
    createTeacherInvoiceSchema,
    updateTeacherInvoiceSchema: createTeacherInvoiceSchema.partial()
};
