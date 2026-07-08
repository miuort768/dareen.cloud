import { useMemo } from 'react';
import { useQueries, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import type { User } from '../../../types/auth';
import type { Student, Teacher, Parent, Session, TeacherInvoice, StudentInvoice, Transaction, FixedExpense, Enrollment, ScheduleSlot } from '../../../types';
import type { DashboardStats, DashboardMonthData, LowBalanceStudent, DashboardTask } from '../types';

const getSafeArray = (val: unknown): unknown[] => {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    if (val.data && Array.isArray(val.data)) return val.data;
    if (typeof val === 'object') {
        return (Object.values(val).find(Array.isArray) as unknown[]) || [];
    }
    return [];
};

export const useDashboardData = (currentUser: User | null) => {
    const queryClient = useQueryClient();

    const enabled = !!currentUser;

    const results = useQueries({
        queries: [
            { queryKey: ['students'], queryFn: () => api.get<Student[]>('/students'), staleTime: 5 * 60 * 1000, enabled },
            { queryKey: ['teachers'], queryFn: () => api.get<Teacher[]>('/teachers'), staleTime: 5 * 60 * 1000, enabled },
            { queryKey: ['parents'], queryFn: () => api.get<Parent[]>('/parents'), staleTime: 5 * 60 * 1000, enabled },
            { queryKey: ['sessions'], queryFn: () => api.get<Session[]>('/sessions'), staleTime: 1 * 60 * 1000, enabled },
            { queryKey: ['teacherInvoices'], queryFn: () => api.get<TeacherInvoice[]>('/invoices/teacher'), staleTime: 5 * 60 * 1000, enabled },
            { queryKey: ['studentInvoices'], queryFn: () => api.get<StudentInvoice[]>('/invoices/student'), staleTime: 5 * 60 * 1000, enabled },
            { queryKey: ['tasks'], queryFn: () => api.get<DashboardTask[]>('/tasks'), staleTime: 1 * 60 * 1000, enabled },
            { queryKey: ['transactions'], queryFn: () => api.get<Transaction[]>('/finance/transactions'), staleTime: 5 * 60 * 1000, enabled },
            { queryKey: ['fixedExpenses'], queryFn: () => api.get<FixedExpense[]>('/finance/fixed-expenses'), staleTime: 5 * 60 * 1000, enabled },
            { queryKey: ['evaluations'], queryFn: () => api.get<Record<string, unknown>[]>('/evaluations'), staleTime: 1 * 60 * 1000, enabled },
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
        fixedExpensesQuery,
        evaluationsQuery
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

        const getSafeArray = (data: unknown) => Array.isArray(data) ? data : ((data as { data?: unknown[] })?.data || []);

        const students = getSafeArray(studentsQuery.data);
        const teachers = getSafeArray(teachersQuery.data);
        const parents = getSafeArray(parentsQuery.data);
        const sessions = getSafeArray(sessionsQuery.data);
        const teacherInvoices = getSafeArray(teacherInvoicesQuery.data);
        const studentInvoices = getSafeArray(studentInvoicesQuery.data);
        const transactions = getSafeArray(transactionsQuery.data);
        const fixedExpenses = getSafeArray(fixedExpensesQuery.data);
        const evaluations = getSafeArray(evaluationsQuery.data);

        const isTeacher = currentUser.role === 'teacher';
        const teacherName = currentUser.teacherName || currentUser.name;

        // 1. Filter based on role
        const normalizedCurrentUserTeacherName = (teacherName || '').trim().toLowerCase();

        const filteredSessions = isTeacher
            ? sessions.filter((s: Session) =>
                (s.teacherName?.trim().toLowerCase() === normalizedCurrentUserTeacherName) ||
                (s.teacherId && s.teacherId === currentUser.id)
            )
            : sessions;

        const filteredStudents = isTeacher
            ? students.filter((s: Student) => s.enrollments?.some((e: { teacherId: string }) =>
                (e.teacher?.trim().toLowerCase() === normalizedCurrentUserTeacherName) ||
                (e.teacherId && e.teacherId === currentUser.id)
            ))
            : students;

        // 2. Dates
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const currentMonth = now.toISOString().slice(0, 7);
        const dayNames = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
        const currentDayName = dayNames[now.getDay()];

        const isSameMonth = (dateStr: string) => {
            if (!dateStr) return false;
            try {
                const d = new Date(dateStr);
                return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
            } catch {
                return dateStr.startsWith(currentMonth);
            }
        };

        // 3. Sessions & Performance
        const completedSessions = filteredSessions.filter((s: Session) =>
            ['completed', 'مكتملة', 'تم الإنجاز'].includes(s.status?.toLowerCase())
        );
        const monthComplete = completedSessions.filter((s: Session) => isSameMonth(s.date));

        // Today's Scheduled via Schedule logic
        let todayScheduledCount = 0;
        filteredStudents.forEach((s: Student) => {
            s.enrollments?.forEach((en: Enrollment) => {
                if (isTeacher && en.teacher !== teacherName && en.teacherId !== currentUser.id) return;
                en.schedule?.forEach((slot: ScheduleSlot) => {
                    if (slot.day === currentDayName) todayScheduledCount++;
                });
            });
        });

        // 4. Financials
        const getSessionRev = (s: Session) => {
            if (s.price !== null && s.price !== undefined) return Number(s.price);
            const stu = students.find((st: Student) => st.id === s.studentId);
            return Number(stu?.sessionPrice) || 0;
        };

        const getRevenue = (list: Session[]) => list.reduce((sum: number, s: Session) => sum + getSessionRev(s), 0);
        const getManualInc = (list: Transaction[]) => list.filter((t: Transaction) => t.type === 'income').reduce((sum: number, t: Transaction) => sum + (Number(t.amount) || 0), 0);
        
        const getPaidInv = (list: TeacherInvoice[]) => list.filter((inv: TeacherInvoice) =>
            ['paid', 'مدفوعة', 'تم الدفع'].includes(inv.status?.toLowerCase())
        ).reduce((sum: number, inv: TeacherInvoice) => sum + (Number(inv.amount) || 0), 0);
        
        const getManualExp = (list: Transaction[]) => list.filter((t: Transaction) => t.type === 'expense').reduce((sum: number, t: Transaction) => sum + (Number(t.amount) || 0), 0);
        const fixedTotal = fixedExpenses.reduce((sum: number, item: FixedExpense) => sum + (Number(item.amount) || 0), 0);

        const totalRevenueValue = getRevenue(completedSessions) + getManualInc(transactions);
        const monthRevenueValue = getRevenue(monthComplete) + getManualInc(transactions.filter((t: Transaction) => isSameMonth(t.date)));

        const totalExpensesValue = isTeacher
            ? (getPaidInv(teacherInvoices) + getManualExp(transactions))
            : (getPaidInv(teacherInvoices) + getManualExp(transactions) + fixedTotal);

        const monthExpensesValue = isTeacher
            ? (getPaidInv(teacherInvoices.filter((inv: TeacherInvoice) => isSameMonth(inv.date))) + getManualExp(transactions.filter((t: Transaction) => isSameMonth(t.date))))
            : (getPaidInv(teacherInvoices.filter((inv: TeacherInvoice) => isSameMonth(inv.date))) + getManualExp(transactions.filter((t: Transaction) => isSameMonth(t.date))) + fixedTotal);

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

            const mSess = filteredSessions.filter((s: Session) => isTargetMonth(s.date));
            const mComp = mSess.filter((s: Session) =>
                ['completed', 'مكتملة', 'تم الإنجاز'].includes(s.status?.toLowerCase())
            );

            const rev = getRevenue(mComp) + getManualInc(transactions.filter((t: Transaction) => isTargetMonth(t.date)));
            const expInv = getPaidInv(teacherInvoices.filter((inv: TeacherInvoice) => isTargetMonth(inv.date)));
            const expMan = getManualExp(transactions.filter((t: Transaction) => isTargetMonth(t.date)));
            const expFixed = (y === now.getFullYear() && m === (now.getMonth() + 1)) ? fixedTotal : 0;

            const exp = isTeacher ? (expInv + expMan) : (expInv + expMan + expFixed);

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
        let anticipatedCollection = 0;

        filteredStudents.forEach((s: Student) => {
            s.enrollments?.forEach((en: Enrollment) => {
                if (isTeacher && en.teacher !== teacherName && en.teacherId !== currentUser.id) return;
                const total = Number(en.sessionsTotal) || 0;
                const actualUsed = sessions.filter((ss: Session) =>
                    ss.studentId === s.id &&
                    (ss.teacherId === en.teacherId || ss.teacherName === en.teacher) &&
                    ss.subject === en.subject &&
                    ['completed', 'مكتملة', 'تم الإنجاز'].includes(ss.status?.toLowerCase())
                ).length;

                const remaining = total - actualUsed;
                if (remaining <= 2 && remaining >= 0) {
                    const price = Number(s.sessionPrice) || 0;
                    lowBalance.push({
                        id: s.id,
                        studentName: s.name || '',
                        subject: en.subject || '',
                        remainingSessions: remaining,
                        teacherName: en.teacher,
                        parentPhone: (isTeacher ? '••••••••' : s.parentPhone) || ''
                    });
                    anticipatedCollection += (price * 8);
                }
            });
        });

        // 6b. Focus List
        const focusStudentsList: { id: string; name: string; reason: string; type: 'attendance' | 'performance' | 'engagement' }[] = [];
        filteredStudents.forEach((s: Student) => {
            const stuSessions = filteredSessions.filter((ss: Session) => ss.studentId === s.id);
            const stuCompleted = stuSessions.filter((ss: Session) => ss.status === 'completed');
            const attendanceRate = stuSessions.length >= 3 ? (stuCompleted.length / stuSessions.length) : 1;

            const stuEvals = isTeacher
                ? evaluations.filter((e: { studentId: string; teacherId: string }) => e.studentId === s.id && e.teacherId === currentUser.id)
                : evaluations.filter((e: { studentId: string }) => e.studentId === s.id);
            const lastEval = [...stuEvals].sort((a,b) => (b.date || '').localeCompare(a.date || ''))[0];
            const needsEval = stuCompleted.length > 0 && (!lastEval || (now.getTime() - new Date(lastEval.date).getTime()) > 7 * 24 * 60 * 60 * 1000);

            if (attendanceRate < 0.7) {
                focusStudentsList.push({ id: s.id, name: s.name, reason: `نسبة الحضور منخفضة (${Math.round(attendanceRate * 100)}%)`, type: 'attendance' });
            } else if (lastEval && (lastEval.rating === 'ضعيف' || lastEval.rating === 'مقبول')) {
                focusStudentsList.push({ id: s.id, name: s.name, reason: `آخر تقييم: ${lastEval.rating}`, type: 'performance' });
            } else if (needsEval) {
                focusStudentsList.push({ id: s.id, name: s.name, reason: 'لم يتم التقييم منذ أسبوع', type: 'engagement' });
            }
        });

        // 7. Stats Object
        const stats: DashboardStats = {
            studentsCount: filteredStudents.length,
            teachersCount: teachers.length,
            parentsCount: parents.length,
            totalEnrollments: filteredStudents.reduce((sum: number, s: Student) => sum + (isTeacher ? (s.enrollments?.filter((en: Enrollment) => en.teacher === teacherName || (en.teacherId && en.teacherId === currentUser.id)).length || 0) : (s.enrollments?.length || 0)), 0),
            totalRevenue: totalRevenueValue,
            totalExpenses: totalExpensesValue,
            totalNetProfit: totalNetProfitValue,
            monthRevenue: monthRevenueValue,
            monthExpenses: monthExpensesValue,
            monthNetProfit: monthNetProfitValue,
            todaySessions: todayScheduledCount,
            completedSessions: completedSessions.length,
            cancelledSessions: filteredSessions.filter((s: Session) =>
                ['cancelled', 'ملغاة', 'تم الإلغاء'].includes(s.status?.toLowerCase())
            ).length,
            attendanceRate: filteredSessions.length > 0 ? Math.round((completedSessions.length / filteredSessions.length) * 100) : 0,
            pendingInvoices: studentInvoices.filter((inv: StudentInvoice) =>
                ['pending', 'overdue', 'معلقة', 'غير مدفوعة', 'متأخرة'].includes(inv.status?.toLowerCase())
            ).length,
            paidInvoices: studentInvoices.filter((inv: StudentInvoice) =>
                ['paid', 'مدفوعة', 'تم الدفع'].includes(inv.status?.toLowerCase())
            ).length,
            lowBalanceCount: lowBalance.length,
            expectedCollection: anticipatedCollection,
            totalSessions: filteredSessions.length,
            monthCompletedSessions: monthComplete.length,
            monthTotalSessions: filteredSessions.filter((s: Session) => isSameMonth(s.date) && (s.status === 'scheduled' || s.status === 'completed')).length,

            teacherPoints: isTeacher ? teachers.find((t: Teacher) => t.id === currentUser.id)?.points || 0 : undefined,
            weekTotalSessions: isTeacher ? filteredSessions.filter((s: Session) => {
                const sDate = new Date(s.date);
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return sDate >= weekAgo && s.status === 'completed';
            }).length : undefined,
            newBadgesRecommended: isTeacher ? (getSafeArray(tasksQuery.data) as { teacherId: string; type: string; status?: string }[]).filter((t) => 
                t.teacherId === currentUser.id && 
                t.type === 'badge_suggestion' && 
                ['pending', 'قيد الانتظار', 'جديدة', 'new'].includes(t.status?.toLowerCase())
            ).length : undefined,
            bestStudentName: isTeacher && filteredStudents.length > 0 ? 
                [...filteredStudents].sort((a: Student, b: Student) => (Number(b.totalPoints) || 0) - (Number(a.totalPoints) || 0))[0]?.name : undefined,
            todayTimeline: isTeacher ? filteredSessions
                .filter((s: Session) => s.date === today)
                .map((s: Session) => ({
                    id: s.id,
                    studentName: s.studentName,
                    time: s.time,
                    subject: s.subject,
                    status: s.status
                })) : undefined,
            teacherSessionPrice: isTeacher ? teachers.find((t: Teacher) => t.id === currentUser.id)?.price || 0 : undefined,
            evaluationsCompleted: isTeacher ? filteredSessions.filter((s: Session) => 
                s.status === 'completed' && 
                s.topics && 
                s.topics !== ''
            ).length : undefined
        };

        return {
            stats,
            todaySessions: filteredSessions.filter((s: Session) => s.date === today),
            monthlyData: chartData,
            lowBalanceStudents: lowBalance,
            tasks: (getSafeArray(tasksQuery.data) as { status?: string }[]).filter((t) =>
                ['pending', 'قيد الانتظار', 'جديدة', 'new', 'in-progress', 'جاري التنفيذ', 'جاري'].includes(t.status?.toLowerCase())
            ),
            topStudents: isTeacher ? filteredStudents.sort((a: Student, b: Student) => (Number(b.totalPoints) || 0) - (Number(a.totalPoints) || 0)).slice(0, 5) : [],
            focusStudents: focusStudentsList
        };
    }, [isLoading, currentUser, studentsQuery.data, teachersQuery.data, parentsQuery.data, sessionsQuery.data, teacherInvoicesQuery.data, studentInvoicesQuery.data, tasksQuery.data, transactionsQuery.data, fixedExpensesQuery.data, evaluationsQuery.data]);



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
        topStudents: processedData?.topStudents || [],
        focusStudents: processedData?.focusStudents || [],
        loading: isLoading,
        rawStudents: getSafeArray(studentsQuery.data),
        rawSessions: getSafeArray(sessionsQuery.data),
        rawStudentInvoices: getSafeArray(studentInvoicesQuery.data),
        fetchDashboardData: () => queryClient.invalidateQueries(), // Or specific keys
        updateSessionStatus: (id: string, status: 'scheduled' | 'completed' | 'cancelled') => updateSessionStatusMutation.mutateAsync({ id, status })
    };
};
