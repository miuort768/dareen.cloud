// Shared TypeScript Types
// Used across the application for type safety

export interface Enrollment {
    teacher: string;
    subject: string;
    curr: string;
    sessionsTotal: number;
    sessionsUsed: number;
    schedule: ScheduleSlot[];
    price?: number;
}

export interface ScheduleSlot {
    day: string;
    hour: string;
    period: string;
}

export interface Student {
    id: string;
    name: string;
    grade: string;
    parentPhone: string;
    studentPhone: string;
    curriculum: string;
    notes: string;
    sessionPrice: number;
    enrollments: Enrollment[];
}

export interface Teacher {
    id: string;
    name: string;
    phone1: string;
    phone2: string;
    subject: string;
    price: number;
    email: string;
    username: string;
}

export interface Parent {
    id: string;
    name: string;
    phone: string;
    email: string;
}

export interface Session {
    id: string;
    studentId: string;
    studentName: string;
    teacherName: string;
    subject: string;
    date: string;
    day: string;
    time: string;
    price?: number;
    teacherPrice?: number;
    status: 'scheduled' | 'completed' | 'cancelled';
}

export type Invoice = TeacherInvoice;

export interface TeacherInvoice {
    id: string;
    teacher: string;
    specialization: string;
    amount: number;
    paymentMethod: string;
    status: string;
    personalExpenses: number;
    date: string;
}

export interface StudentInvoice {
    id: string;
    studentId: string;
    studentName: string;
    amount: number;
    description: string;
    date: string;
    dueDate: string;
    status: string;
    paymentMethod: string;
    notes: string;
}

export interface User {
    id: string;
    name: string;
    username: string;
    password?: string; // Only for admins stored in localStorage
    role: 'admin' | 'teacher';
    teacherName?: string;
    permissions: string[];
    avatar?: string;
}

export interface AuthResponse {
    token: string;
    user: User;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface Transaction {
    id: string;
    type: 'income' | 'expense';
    category: string;
    amount: number;
    date: string;
    description: string;
    status: string;
}

export interface FixedExpense {
    id: number;
    name: string;
    amount: number;
}
