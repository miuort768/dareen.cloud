export interface Enrollment {
    id?: string;
    subject?: string;
    teacher?: string;
    teacherName?: string;
    sessionsUsed?: number;
    sessionsTotal?: number;
    schedule?: { day: string; hour: string; period: string }[];
    nextSessionNotes?: string;
    progress?: number;
    image?: string;
    level?: string;
    curr?: string;
    price?: number;
    isFrozen?: boolean;
}

export interface StudentDashboardData {
    id?: string;
    name?: string;
    grade?: string;
    curriculum?: string;
    totalPoints?: number;
    enrollments?: Enrollment[];
    [key: string]: unknown;
}

export interface Session {
    id?: string;
    status: string;
    subject?: string;
    teacherName?: string;
    date?: string;
    day?: string;
    time?: string;
}

export interface PointLog {
    id?: string;
    amount: number;
    action: string;
    date?: string;
    status?: string;
    timestamp?: string;
}

export interface Announcement {
    id: string;
    title: string;
    content: string;
    date: string;
    priority?: 'normal' | 'urgent';
    target?: string;
}

export interface Invoice {
    id: string;
    amount: number;
    status: 'paid' | 'unpaid' | 'overdue';
    dueDate?: string;
    description?: string;
}

export interface DashboardStats {
    sessionsUsed: number;
    sessionsTotal: number;
    totalAttendance: number;
    totalAbsence: number;
    attendanceRate: number;
    curriculumProgress: number;
}

export interface NextSession {
    subject: string;
    teacher: string;
    time: string;
    hour: string;
    day: string;
    enrollment?: Enrollment;
}

export interface TodayTask {
    id: string;
    subject: string;
    teacher: string;
    time: string;
    type: 'homework' | 'review' | 'quiz' | 'session';
    completed: boolean;
}

export interface StudentViewProps {
    studentData: StudentDashboardData;
    sessions: Session[];
    pointLogs: PointLog[];
    announcements: Announcement[];
    stats: DashboardStats;
    nextSession: NextSession | null;
    todayTasks: TodayTask[];
    points: number;
    rank: { name: string; icon: string; color: string; badgeColor: string };
    nextRank: { next: { name: string; minPoints: string } | null; pointsNeeded: number };
    enrollments: Enrollment[];
    currentTime: Date;
}
