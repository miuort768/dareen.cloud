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
    needsCompensation?: boolean; // Flag for cancelled sessions that should be made up
    isCompensation?: boolean;    // Flag for the session that is the make-up session
}

export interface Enrollment {
    teacher: string;
    teacherId?: string;
    subject: string;
    sessionsTotal: number;
    sessionsUsed: number;
    schedule: ScheduleSlot[];
    price?: number;
    discount?: number; // Optional discount amount or percentage
    nextSessionNotes?: string;
}

export interface Student extends Omit<GlobalStudent, 'enrollments'> {
    id: string;
    name: string;
    grade: string;
    parentId?: string; // To link siblings
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
