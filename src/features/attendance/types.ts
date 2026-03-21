import type { Student as GlobalStudent } from '../../types/dashboard';
export type { User as GlobalUser } from '../../types/auth';

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
    teacherId?: string;
    subject: string;
    time: string;
    status: 'scheduled' | 'completed' | 'cancelled';
    day: string;
    date: string;
    price?: number;
    teacherPrice?: number;
    topics?: string;
    homework?: string;
}

export interface Enrollment {
    teacher: string;
    teacherId?: string;
    subject: string;
    sessionsTotal: number;
    sessionsUsed: number;
    schedule: ScheduleSlot[];
    price?: number;
}

export interface Student extends Omit<GlobalStudent, 'enrollments'> {
    id: string;
    name: string;
    grade: string;
    curriculum?: string;
    enrollments: Enrollment[];
}

export interface AttendanceStats {
    todayCompleted: number;
    todayCancelled: number;
    todayScheduled: number;
    todayTotal: number;
    totalCompleted: number;
}

export interface TeacherStats {
    expected: number;
    used: number;
    remaining: number;
    rate: number;
}
