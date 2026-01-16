
export interface DashboardStats {
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

export interface DashboardMonthData {
    month: string;
    revenue: number;
    expenses: number;
    profit: number;
    sessions: number;
    completed: number;
}

export interface DashboardTask {
    id: string;
    title: string;
    status: 'pending' | 'completed';
    priority: 'high' | 'medium' | 'low';
    dueDate: string;
}

export interface DashboardData {
    stats: DashboardStats;
    monthlyData: DashboardMonthData[];
    lowBalanceStudents: LowBalanceStudent[];
    tasks: DashboardTask[];
}
