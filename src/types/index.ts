// Shared TypeScript Types
// Used across the application for type safety

export interface Enrollment {
    teacher: string;
    teacherId?: string;
    subject: string;
    curr: string;
    sessionsTotal: number;
    sessionsUsed: number;
    schedule: ScheduleSlot[];
    price?: number;
    nextSessionNotes?: string;
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
    studentPhone?: string;
    curriculum?: string;
    notes?: string;
    sessionPrice: number;
    enrollments: Enrollment[];
    totalPoints?: number;
    badges?: string;
}

export interface Teacher {
    id: string;
    name: string;
    phone1: string;
    phone2?: string;
    subject: string;
    price: number;
    email?: string;
    username?: string;
    password?: string;
    points?: number;
}

export interface Parent {
    id: string;
    name: string;
    phone: string;
    email: string;
    username?: string;
    password?: string;
}

export interface Session {
    id: string;
    studentId: string;
    studentName: string;
    teacherName: string;
    teacherId?: string;
    subject: string;
    date: string;
    day: string;
    time: string;
    price?: number;
    teacherPrice?: number;
    topics?: string;
    homework?: string;
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

export type { User } from './auth';

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

export interface Evaluation {
    id: string;
    studentId: string;
    teacherId: string;
    teacherName: string;
    rating: string;
    points: number;
    notes?: string;
    date: string;
    created_at: string;
}

export interface LiveSession {
    id: string;
    teacherId: string;
    teacherName: string;
    title?: string;
    subject?: string;
    meetingProvider: string;
    meetingUrl?: string;
    meetingCode?: string;
    isExternalMeeting: boolean;
    status: string;
    targetStudentId?: string;
    startedAt: string;
    endedAt?: string;
    endedBy?: string;
}

export interface FixedExpense {
    id: number;
    name: string;
    amount: number;
}
