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

        // 2. Dates
        const now = new Date();
        const currentMonth = now.toISOString().slice(0, 7);
        const today = now.toLocaleDateString('en-CA');
        const dayNames = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
        const currentDayName = dayNames[now.getDay()];

        const isSameMonth = (dateStr: string) => {
            if (!dateStr) return false;
            try {
                const d = new Date(dateStr);
                return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
            } catch (e) {
                return dateStr.startsWith(currentMonth);
            }
        };

        // 3. Sessions & Performance
        const completedSessions = filteredSessions.filter(s =>
            ['completed', 'مكتملة', 'تم الإنجاز'].includes(s.status?.toLowerCase())
        );
        const monthComplete = completedSessions.filter(s => isSameMonth(s.date));

        // Today's Scheduled via Schedule logic
        let todayScheduledCount = 0;
        filteredStudents.forEach(s => {
            s.enrollments?.forEach(en => {
                if (isTeacher && en.teacher !== teacherName) return;
                en.schedule?.forEach(slot => {
                    if (slot.day === currentDayName) todayScheduledCount++;
                });
            });
        });

        // 4. Financials
        const getSessionRev = (s: Session) => {
            if (Number(s.price) > 0) return Number(s.price);
            const stu = students.find(st => st.id === s.studentId);
            return Number(stu?.sessionPrice) || 0;
        };

        const getRevenue = (list: Session[]) => list.reduce((sum, s) => sum + getSessionRev(s), 0);
        const getManualInc = (list: Transaction[]) => list.filter(t => t.type === 'income').reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
        const getLaborCost = (list: Session[]) => list.reduce((sum, s) => sum + (Number(s.teacherPrice) || 0), 0);
        const getPaidInv = (list: TeacherInvoice[]) => list.filter(inv =>
            ['paid', 'مدفوعة', 'تم الدفع'].includes(inv.status?.toLowerCase())
        ).reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0);
        const getManualExp = (list: Transaction[]) => list.filter(t => t.type === 'expense').reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
        const fixedTotal = fixedExpenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

        const totalRevenueValue = getRevenue(completedSessions) + getManualInc(transactions);
        const monthRevenueValue = getRevenue(monthComplete) + getManualInc(transactions.filter(t => isSameMonth(t.date)));

        const totalExpensesValue = isTeacher
            ? (getPaidInv(teacherInvoices) + getManualExp(transactions))
            : (getLaborCost(completedSessions) + getPaidInv(teacherInvoices) + getManualExp(transactions) + fixedTotal);

        const monthExpensesValue = isTeacher
            ? (getPaidInv(teacherInvoices.filter(inv => isSameMonth(inv.date))) + getManualExp(transactions.filter(t => isSameMonth(t.date))))
            : (getLaborCost(monthComplete) + getPaidInv(teacherInvoices.filter(inv => isSameMonth(inv.date))) + getManualExp(transactions.filter(t => isSameMonth(t.date))) + fixedTotal);

        const totalNetProfitValue = totalRevenueValue - totalExpensesValue;
        const monthNetProfitValue = monthRevenueValue - monthExpensesValue;

        // 5. Chart Data
        const last6Months = Array.from({ length: 6 }, (_, i) => {
            const d = new Date();
            d.setMonth(d.getMonth() - (5 - i));
            return d.toISOString().slice(0, 7);
        });

        const chartData: DashboardMonthData[] = last6Months.map(month => {
            const [y, m] = month.split('-').map(Number);
            const isTargetMonth = (dateStr: string) => {
                if (!dateStr) return false;
                const d = new Date(dateStr);
                return d.getFullYear() === y && (d.getMonth() + 1) === m;
            };

            const mSess = filteredSessions.filter(s => isTargetMonth(s.date));
            const mComp = mSess.filter(s =>
                ['completed', 'مكتملة', 'تم الإنجاز'].includes(s.status?.toLowerCase())
            );

            const rev = getRevenue(mComp) + getManualInc(transactions.filter(t => isTargetMonth(t.date)));
            const expSess = getLaborCost(mComp);
            const expInv = getPaidInv(teacherInvoices.filter(inv => isTargetMonth(inv.date)));
            const expMan = getManualExp(transactions.filter(t => isTargetMonth(t.date)));
            const expFixed = (y === now.getFullYear() && m === (now.getMonth() + 1)) ? fixedTotal : 0;

            const exp = isTeacher ? (expInv + expMan) : (expSess + expInv + expMan + expFixed);

            return {
                month: new Date(y, m - 1).toLocaleDateString('ar-EG', { month: 'short' }),
                revenue: rev,
                expenses: exp,
                profit: rev - exp,
                sessions: mSess.length,
                completed: mComp.length
            };
        });

        // 6. Low Balance
        const lowBalance: LowBalanceStudent[] = [];
        filteredStudents.forEach(s => {
            s.enrollments?.forEach(en => {
                if (isTeacher && en.teacher !== teacherName) return;
                const total = Number(en.sessionsTotal) || 0;
                const actualUsed = sessions.filter(ss =>
                    ss.studentId === s.id &&
                    ss.teacherName === en.teacher &&
                    ss.subject === en.subject &&
                    ['completed', 'مكتملة', 'تم الإنجاز'].includes(ss.status?.toLowerCase())
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

        // 7. Stats Object
        const stats: DashboardStats = {
            studentsCount: filteredStudents.length,
            teachersCount: teachers.length,
            parentsCount: parents.length,
            totalEnrollments: filteredStudents.reduce((sum, s) => sum + (isTeacher ? (s.enrollments?.filter(e => e.teacher === teacherName).length || 0) : (s.enrollments?.length || 0)), 0),
            totalRevenue: totalRevenueValue,
            totalExpenses: totalExpensesValue,
            totalNetProfit: totalNetProfitValue,
            monthRevenue: monthRevenueValue,
            monthExpenses: monthExpensesValue,
            monthNetProfit: monthNetProfitValue,
            todaySessions: todayScheduledCount,
            completedSessions: completedSessions.length,
            cancelledSessions: filteredSessions.filter(s =>
                ['cancelled', 'ملغاة', 'تم الإلغاء'].includes(s.status?.toLowerCase())
            ).length,
            attendanceRate: filteredSessions.length > 0 ? Math.round((completedSessions.length / filteredSessions.length) * 100) : 0,
            pendingInvoices: studentInvoices.filter(inv =>
                ['pending', 'overdue', 'معلقة', 'غير مدفوعة', 'متأخرة'].includes(inv.status?.toLowerCase())
            ).length,
            paidInvoices: studentInvoices.filter(inv =>
                ['paid', 'مدفوعة', 'تم الدفع'].includes(inv.status?.toLowerCase())
            ).length,
            lowBalanceCount: lowBalance.length,
            expectedCollection: lowBalance.length * 1000,
            totalSessions: filteredSessions.length,
            monthCompletedSessions: monthComplete.length,
            monthTotalSessions: filteredSessions.filter(s => isSameMonth(s.date) && (s.status === 'scheduled' || s.status === 'completed')).length,
        };

        return {
            stats,
            todaySessions: filteredSessions.filter(s => s.date === today),
            monthlyData: chartData,
            lowBalanceStudents: lowBalance,
            tasks: (tasksQuery.data as DashboardTask[] || []).filter(t =>
                ['pending', 'قيد الانتظار', 'جديدة', 'new'].includes(t.status?.toLowerCase())
            )
        };
    }, [isLoading, currentUser, studentsQuery.data, teachersQuery.data, parentsQuery.data, sessionsQuery.data, teacherInvoicesQuery.data, studentInvoicesQuery.data, tasksQuery.data, transactionsQuery.data, fixedExpensesQuery.data]);

    return {
        stats: processedData?.stats || {
            studentsCount: 0, teachersCount: 0, parentsCount: 0, totalEnrollments: 0,
            totalRevenue: 0, totalExpenses: 0, totalNetProfit: 0,
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
        rawStudents: (studentsQuery.data as any[]) || [],
        rawSessions: (sessionsQuery.data as any[]) || [],
        rawStudentInvoices: (studentInvoicesQuery.data as any[]) || [],
        fetchDashboardData: () => queryClient.invalidateQueries(), // Or specific keys
        updateSessionStatus: (id: string, status: 'scheduled' | 'completed' | 'cancelled') => updateSessionStatusMutation.mutateAsync({ id, status })
    };
};
