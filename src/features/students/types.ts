export interface Student {
    id: string;
    name: string;
    grade: string;
    parentPhone: string;
    sessionPrice: number;
    enrollments: Enrollment[];
}

export interface Enrollment {
    teacher: string;
    teacherId?: string;
    subject: string;
    curr: string;
    sessionsTotal: number;
    sessionsUsed: number;
    schedule: ScheduleSlot[];
}

export interface ScheduleSlot {
    day: string;
    hour: string;
    period: string;
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

export interface Session {
    id: string;
    studentId: string;
    studentName: string;
    teacherName: string;
    subject: string;
    date: string;
    time: string;
    status: 'completed' | 'cancelled' | 'scheduled' | 'pending';
    price: number;
}
