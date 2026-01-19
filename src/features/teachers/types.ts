export interface Teacher {
    id: string;
    name: string;
    phone1: string;
    phone2?: string;
    email?: string;
    subject: string;
    price: number;
    username?: string;
    password?: string;
}

export interface Enrollment {
    teacher: string;
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

export interface Session {
    id: string;
    studentId: string;
    studentName: string;
    teacherName: string;
    subject: string;
    date: string;
    time: string;
    status: 'completed' | 'cancelled' | 'scheduled';
    price?: number;
    teacherPrice?: number;
}
