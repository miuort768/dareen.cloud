import type { Student } from '../../types';

export type ParentUser = { id: string; name?: string | null; username?: string | null } | null;

export interface PointLogEntry {
    id: string;
    studentName: string;
    amount: number;
    action: string;
    timestamp?: string;
    date?: string;
    status?: string;
    points?: number;
}

export type ActiveTimerSession = Student;

export interface ParentViewProps {
    currentUser: ParentUser;
    adminPhone: string | undefined;
    children: Student[];
    sessions: Student[];
    allPointLogs: PointLogEntry[];
    activeTimers: ActiveTimerSession[];
    stats: { childCount: number; upcomingSessions: number; attendanceRate: number; academicProgress: number };
    todayTasks: { studentName: string; subject: string; teacher: string; time: string; period: string }[];
    points: number;
    rank: { name: string };
    logout: () => void;
    formatTime: (startedAt: string | null | undefined) => string;
}
