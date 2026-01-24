export interface Stats {
    studentsCount: number;
    teachersCount: number;
    parentsCount: number;
    totalEnrollments: number;
    monthRevenue: number;
    monthExpenses: number;
    monthNetProfit: number;
    todaySessions: number;
    completedSessions: number;
    cancelledSessions: number;
    attendanceRate: number;
    pendingInvoices: number;
    paidInvoices: number;
    lowBalanceCount: number;
    expectedCollection: number;
    totalSessions: number;
    monthCompletedSessions: number;
    monthTotalSessions: number;
}

export interface LowBalanceStudent {
    id: string;
    studentName: string;
    subject: string;
    remainingSessions: number;
    teacherName: string;
    parentPhone: string;
}

export interface Session {
    id: string;
    studentId: string;
    studentName: string;
    teacherName: string;
    subject: string;
    date: string;
    time: string;
    status: 'scheduled' | 'completed' | 'cancelled';
    price: number;
    teacherId?: string;
}

export interface Enrollment {
    teacher: string;
    teacherId?: string;
    sessionsTotal?: number;
    sessionsUsed?: number;
    subject?: string;
    teacherName?: string;
    parentPhone?: string;
    studentName?: string;
    total?: number;
    used?: number;
    price?: number;
    schedule?: { day: string; hour: string; period: string }[];
}

export interface Student {
    id: string;
    name?: string;
    parentPhone?: string;
    sessionPrice?: number;
    enrollments?: Enrollment[];
}

export interface TeacherInvoice {
    status: string;
    date?: string;
    amount?: number;
}

export interface StudentInvoice {
    id: string;
    studentName: string;
    amount: number;
    status: string;
}

export interface MonthData {
    month: string;
    revenue: number;
    expenses: number;
    profit: number;
    sessions: number;
    completed: number;
}

export interface Task {
    id: string;
    title: string;
    status: 'pending' | 'completed';
    priority: 'high' | 'medium' | 'low';
    dueDate: string;
}
