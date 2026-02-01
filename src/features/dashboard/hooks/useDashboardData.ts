import { useMemo } from 'react';
import { useQueries, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import type { User } from '../../../types/auth';
import type { Student, Teacher, Parent, Session, TeacherInvoice, StudentInvoice, Transaction, FixedExpense } from '../../../types';
import type { DashboardStats, DashboardMonthData, LowBalanceStudent, DashboardTask } from '../types';

export const useDashboardData = (currentUser: User | null) => {
    const queryClient = useQueryClient();

    const results = useQueries({
        queries: [
            { queryKey: ['students'], queryFn: () => api.get<Student[]>('/students'), staleTime: 5 * 60 * 1000 },
            { queryKey: ['teachers'], queryFn: () => api.get<Teacher[]>('/teachers'), staleTime: 5 * 60 * 1000 },
            { queryKey: ['parents'], queryFn: () => api.get<Parent[]>('/parents'), staleTime: 5 * 60 * 1000 },
            { queryKey: ['sessions'], queryFn: () => api.get<Session[]>('/sessions'), staleTime: 1 * 60 * 1000 },
            { queryKey: ['teacherInvoices'], queryFn: () => api.get<TeacherInvoice[]>('/invoices/teacher'), staleTime: 5 * 60 * 1000 },
            { queryKey: ['studentInvoices'], queryFn: () => api.get<StudentInvoice[]>('/invoices/student'), staleTime: 5 * 60 * 1000 },
            { queryKey: ['tasks'], queryFn: () => api.get<DashboardTask[]>('/tasks'), staleTime: 1 * 60 * 1000 },
            { queryKey: ['transactions'], queryFn: () => api.get<Transaction[]>('/finance/transactions'), staleTime: 5 * 60 * 1000 },
            { queryKey: ['fixedExpenses'], queryFn: () => api.get<FixedExpense[]>('/finance/fixed-expenses'), staleTime: 5 * 60 * 1000 },
        ]
    });

    const [
        studentsQuery,
        teachersQuery,
        parentsQuery,
        sessionsQuery,
        teacherInvoicesQuery,
        studentInvoicesQuery,
        tasksQuery,
        transactionsQuery,
        fixedExpensesQuery
    ] = results;

    const isLoading = results.some(r => r.isLoading);

    const updateSessionStatusMutation = useMutation({
        mutationFn: async ({ id, status }: { id: string; status: 'scheduled' | 'completed' | 'cancelled' }) => {
            return api.patch(`/sessions/${id}`, { status });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sessions'] });
        }
    });

    // Process Data
    const processedData = useMemo(() => {
        if (isLoading || !currentUser) return null;

        const students = (studentsQuery.data as Student[]) || [];
        const teachers = (teachersQuery.data as Teacher[]) || [];
        const parents = (parentsQuery.data as Parent[]) || [];
        const sessions = (sessionsQuery.data as Session[]) || [];
        const teacherInvoices = (teacherInvoicesQuery.data as TeacherInvoice[]) || [];
        const studentInvoices = (studentInvoicesQuery.data as StudentInvoice[]) || [];
        const transactions = (transactionsQuery.data as Transaction[]) || [];
        const fixedExpenses = (fixedExpensesQuery.data as FixedExpense[]) || [];

        const isTeacher = currentUser.role === 'teacher';
        const teacherName = currentUser.teacherName || currentUser.name;

        // 1. Filter based on role
        const normalizedCurrentUserTeacherName = teacherName.trim().toLowerCase();

        const filteredSessions = isTeacher
            ? sessions.filter(s =>
                (s.teacherName?.trim().toLowerCase() === normalizedCurrentUserTeacherName) ||
                (s.teacherId && s.teacherId === currentUser.id)
            )
            : sessions;

        const filteredStudents = isTeacher
            ? students.filter(s => s.enrollments?.some(e =>
                (e.teacher?.trim().toLowerCase() === normalizedCurrentUserTeacherName) ||
                (e.teacherId && e.teacherId === currentUser.id)
            ))
            : students;

        // 2. Today's Data
        const now = new Date();
        const currentMonth = now.toISOString().slice(0, 7); // YYYY-MM
        const today = now.toLocaleDateString('en-CA'); // YYYY-MM-DD
        const dayNames = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
        const currentDayName = dayNames[now.getDay()];

        // 3. Today's Sessions (Scheduled) via Schedule logic
        let todayScheduledCount = 0;
        filteredStudents.forEach(s => {
            s.enrollments?.forEach(en => {
                if (isTeacher && en.teacher !== teacherName) return;
                en.schedule?.forEach(slot => {
                    if (slot.day === currentDayName) todayScheduledCount++;
                });
            });
        });

        const todaySessionsList = filteredSessions.filter(s => s.date === today);

        // 4. Financials (Revenue from students only)
        const getSessionRevenue = (s: Session) => {
            // Priority: 1. Price stored in the session record
            if (Number(s.price) > 0) return Number(s.price);

            // Priority: 2. Default price in student's profile
            const stu = students.find(st => st.id === s.studentId);
            if (Number(stu?.sessionPrice) > 0) return Number(stu?.sessionPrice);

            // If neither, return 0 (never fallback to teacher cost)
            return 0;
        };

        const isSameMonth = (dateStr: string) => {
            if (!dateStr) return false;
            try {
                const d = new Date(dateStr);
                return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
            } catch (e) {
                return dateStr.startsWith(currentMonth);
            }
        };

        const monthSessions = filteredSessions.filter(s => isSameMonth(s.date));
        const monthCompletedSessions = monthSessions.filter(s => s.status === 'completed');

        const monthAutomatedIncome = monthCompletedSessions.reduce((sum, s) => sum + getSessionRevenue(s), 0);
        const monthManualIncome = transactions
            .filter(t => t.type === 'income' && isSameMonth(t.date))
            .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

        const monthRevenueValue = monthAutomatedIncome + monthManualIncome;

        // Expenses Calculation:
        const sessionsExpensesValue = monthCompletedSessions.reduce((sum, s) => sum + (Number(s.teacherPrice) || 0), 0);

        const manualExpensesValue = teacherInvoices
            .filter(inv => inv.status === 'مدفوعة' && isSameMonth(inv.date))
            .reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0);

        const extraManualExpenses = transactions
            .filter(t => t.type === 'expense' && isSameMonth(t.date))
            .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

        const totalFixedExpenses = fixedExpenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

        const monthExpensesValue = isTeacher
            ? manualExpensesValue
            : (sessionsExpensesValue + manualExpensesValue + extraManualExpenses + totalFixedExpenses);

        const attendanceRateValue = filteredSessions.length > 0
            ? Math.round((filteredSessions.filter(s => s.status === 'completed').length / filteredSessions.length) * 100)
            : 0;

        // 5. Chart Data (Last 6 Months)
        const last6Months = Array.from({ length: 6 }, (_, i) => {
            const d = new Date();
            d.setMonth(d.getMonth() - (5 - i));
            return d.toISOString().slice(0, 7);
        });

        const chartData: DashboardMonthData[] = last6Months.map(month => {
            const [y, m] = month.split('-').map(Number);
            const isMonth = (dateStr: string) => {
                if (!dateStr) return false;
                const d = new Date(dateStr);
                return d.getFullYear() === y && (d.getMonth() + 1) === m;
            };

            const mSessions = filteredSessions.filter(s => isMonth(s.date));
            const revAutomated = mSessions.filter(s => s.status === 'completed').reduce((sum, s) => sum + getSessionRevenue(s), 0);
            const revManual = transactions.filter(t => t.type === 'income' && isMonth(t.date)).reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
            const rev = revAutomated + revManual;

            const sessExp = mSessions.filter(s => s.status === 'completed').reduce((sum, s) => sum + (Number(s.teacherPrice) || 0), 0);
            const manualExp = teacherInvoices.filter(inv => (inv.status === 'مدفوعة' || inv.status === 'paid') && isMonth(inv.date)).reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0);
            const extraExp = transactions.filter(t => t.type === 'expense' && isMonth(t.date)).reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

            const exp = isTeacher ? (manualExp + extraExp) : (sessExp + manualExp + extraExp + (isMonth(now.toISOString()) ? totalFixedExpenses : 0));
            return {
                month: new Date(y, m - 1).toLocaleDateString('ar-EG', { month: 'short' }),
                revenue: rev,
                expenses: exp,
                profit: rev - exp,
                sessions: mSessions.length,
                completed: mSessions.filter(s => s.status === 'completed').length
            };
        });

        // 6. Low Balance
        const lowBalance: LowBalanceStudent[] = [];
        filteredStudents.forEach(s => {
            s.enrollments?.forEach(en => {
                if (isTeacher && en.teacher !== teacherName) return;
                const total = Number(en.sessionsTotal) || 0;
                // Count ANY session for this student/teacher/subject that is completed
                const actualUsed = sessions.filter(ss =>
                    ss.studentId === s.id &&
                    ss.teacherName === en.teacher &&
                    ss.subject === en.subject &&
                    ss.status === 'completed'
                ).length;

                const remaining = total - actualUsed;
                if (remaining <= 2 && remaining >= 0) {
                    lowBalance.push({
                        id: s.id,
                        studentName: s.name || '',
                        subject: en.subject || '',
                        remainingSessions: remaining,
                        teacherName: en.teacher,
                        parentPhone: (isTeacher ? '••••••••' : s.parentPhone) || ''
                    });
                }
            });
        });

        // 7. Tasks
        let loadedTasks: DashboardTask[] = [];
        if (tasksQuery.data) {
            const allTasks = tasksQuery.data as DashboardTask[];
            loadedTasks = allTasks.filter(t => t.status === 'pending');
        }

        const stats: DashboardStats = {
            studentsCount: filteredStudents.length,
            teachersCount: teachers.length,
            parentsCount: parents.length,
            totalEnrollments: filteredStudents.reduce((sum, s) => sum + (isTeacher ? (s.enrollments?.filter(e => e.teacher === teacherName).length || 0) : (s.enrollments?.length || 0)), 0),
            monthRevenue: monthRevenueValue,
            monthExpenses: monthExpensesValue,
            monthNetProfit: isTeacher ? (monthManualIncome - (manualExpensesValue + extraManualExpenses)) : (monthRevenueValue - monthExpensesValue),
            todaySessions: todayScheduledCount,
            completedSessions: filteredSessions.filter(s => s.status === 'completed').length,
            cancelledSessions: filteredSessions.filter(s => s.status === 'cancelled').length,
            attendanceRate: attendanceRateValue,
            pendingInvoices: studentInvoices.filter(inv => inv.status === 'pending' || inv.status === 'overdue').length,
            paidInvoices: studentInvoices.filter(inv => inv.status === 'paid').length,
            lowBalanceCount: lowBalance.length,
            expectedCollection: lowBalance.length * 1000, // Estimate
            totalSessions: filteredSessions.length,
            monthCompletedSessions: monthCompletedSessions.length,
            monthTotalSessions: monthSessions.length,
        };

        return {
            stats,
            todaySessions: todaySessionsList,
            monthlyData: chartData,
            lowBalanceStudents: lowBalance,
            tasks: loadedTasks
        };
    }, [isLoading, currentUser, studentsQuery.data, teachersQuery.data, parentsQuery.data, sessionsQuery.data, teacherInvoicesQuery.data, studentInvoicesQuery.data, tasksQuery.data, transactionsQuery.data, fixedExpensesQuery.data]);

    return {
        stats: processedData?.stats || {
            studentsCount: 0, teachersCount: 0, parentsCount: 0, totalEnrollments: 0,
            monthRevenue: 0, monthExpenses: 0, monthNetProfit: 0, todaySessions: 0,
            completedSessions: 0, cancelledSessions: 0, attendanceRate: 0,
            pendingInvoices: 0, paidInvoices: 0, lowBalanceCount: 0, expectedCollection: 0,
            totalSessions: 0, monthCompletedSessions: 0, monthTotalSessions: 0
        },
        todaySessions: processedData?.todaySessions || [],
        monthlyData: processedData?.monthlyData || [],
        lowBalanceStudents: processedData?.lowBalanceStudents || [],
        tasks: processedData?.tasks || [],
        loading: isLoading,
        fetchDashboardData: () => queryClient.invalidateQueries(), // Or specific keys
        updateSessionStatus: (id: string, status: 'scheduled' | 'completed' | 'cancelled') => updateSessionStatusMutation.mutateAsync({ id, status })
    };
};
