import type { ScheduleSlot } from '../../types';

export interface Student {
    id: string;
    name: string;
    grade: string;
    parentPhone: string;
    studentPhone?: string;
    curriculum?: string;
    notes?: string;
    sessionPrice: number;
    currency?: string;
    enrollments: Enrollment[];
    totalPoints?: number;
    badges?: string;
    username?: string;
    password?: string;
}

export interface Enrollment {
    id?: string;
    teacher: string;
    teacherId?: string;
    subject: string;
    curr: string;
    sessionsTotal: number;
    sessionsUsed: number;
    schedule: ScheduleSlot[];
    price?: number;
    isFrozen?: boolean;
    frozenReason?: string;
    nextSessionNotes?: string;
}

export interface StudentInvoice {
    id: string;
    studentId: string;
    studentName: string;
    subject: string;
    amount: number;
    date: string;
    status: 'pending' | 'paid' | 'cancelled';
}


