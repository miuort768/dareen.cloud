import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import type {
    Stats, Session, Student, Enrollment,
    TeacherInvoice, StudentInvoice, LowBalanceStudent, MonthData, Task
} from '../types/dashboard';

import type { User } from '../types/auth';

export const useDashboardData = (currentUser: User | null) => {
    const [stats, setStats] = useState<Stats>({
        studentsCount: 0,
        teachersCount: 0,
        parentsCount: 0,
        totalEnrollments: 0,
        monthRevenue: 0,
        monthExpenses: 0,
        monthNetProfit: 0,
        todaySessions: 0,
        completedSessions: 0,
        cancelledSessions: 0,
        attendanceRate: 0,
        pendingInvoices: 0,
        paidInvoices: 0,
        lowBalanceCount: 0,
        expectedCollection: 0,
        totalSessions: 0,
        monthCompletedSessions: 0,
        monthTotalSessions: 0
    });

    const [todaySessions, setTodaySessions] = useState<Session[]>([]);
    const [monthlyData, setMonthlyData] = useState<MonthData[]>([]);
    const [lowBalanceStudents, setLowBalanceStudents] = useState<LowBalanceStudent[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchDashboardData = useCallback(async () => {
        try {
            setLoading(true);
            const [rawStudents, rawTeachers, rawParents, rawSessions, rawInvoices, rawStudentInvoices] = await Promise.all([
                api.get<any[]>('/students'),
                api.get<any[]>('/teachers'),
                api.get<any[]>('/parents'),
                api.get<any[]>('/sessions'),
                api.get<any[]>('/invoices'),
                api.get<any[]>('/studentInvoices'),
            ]);

            const students = Array.isArray(rawStudents) ? rawStudents : [];
            const teachers = Array.isArray(rawTeachers) ? rawTeachers : [];
            const parents = Array.isArray(rawParents) ? rawParents : [];
            const sessionsAll = Array.isArray(rawSessions) ? rawSessions : [];
            const teacherInvoices = Array.isArray(rawInvoices) ? rawInvoices : [];
            const studentInvoicesAll = Array.isArray(rawStudentInvoices) ? rawStudentInvoices : [];

            const isTeacher = currentUser?.role === 'teacher';
            const teacherName = currentUser?.teacherName || currentUser?.name;

            const sessions = isTeacher
                ? sessionsAll.filter((s: Session) => s && s.teacherName === teacherName)
                : sessionsAll;
            const teacherStudents = isTeacher
                ? students.filter((s: Student) => s && Array.isArray(s.enrollments) && s.enrollments.some((e: Enrollment) => e.teacher === teacherName))
                : students;

            const now = new Date();
            const currentMonth = now.toISOString().slice(0, 7);
            const today = now.toLocaleDateString('en-CA'); // YYYY-MM-DD in local time

            // Get current day name in Arabic
            const dayNames = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
            const currentDayName = dayNames[now.getDay()];

            // Calculate today's sessions based on weekly schedule (enrollments)
            let todayScheduledCount = 0;
            teacherStudents.forEach((s: Student) => {
                if (s.enrollments) {
                    s.enrollments.forEach((en: Enrollment) => {
                        if (isTeacher && en.teacher !== teacherName) return;
                        if (en.schedule && Array.isArray(en.schedule)) {
                            en.schedule.forEach((slot: { day: string }) => {
                                if (slot.day === currentDayName) {
                                    todayScheduledCount++;
                                }
                            });
                        }
                    });
                }
            });

            const todaySessionsList = sessions.filter((s: Session) => s.date === today);
            setTodaySessions(todaySessionsList);

            const studentsCount = teacherStudents.length;
            const teachersCount = Array.isArray(teachers) ? teachers.length : 0;
            const parentsCount = Array.isArray(parents) ? parents.length : 0;
            const totalEnrollments = teacherStudents.reduce((sum: number, s: Student) => {
                const count = isTeacher
                    ? (s.enrollments?.filter((e: Enrollment) => e.teacher === teacherName).length || 0)
                    : (s.enrollments?.length || 0);
                return sum + count;
            }, 0);

            // Use schedule-based count for today's sessions
            const todaySessionsCount = todayScheduledCount;
            const completedSessionsCount = sessions.filter((s: Session) => s.status === 'completed').length;
            const cancelledSessionsCount = sessions.filter((s: Session) => s.status === 'cancelled').length;
            const totalSessionsCount = sessions.length;
            const monthSessions = sessions.filter((s: Session) => s.date?.startsWith(currentMonth));
            const monthCompletedSessions = monthSessions.filter((s: Session) => s.status === 'completed');
            const monthCompletedSessionsCount = monthCompletedSessions.length;
            const monthTotalSessionsCount = monthSessions.length;

            // Helper to get effective session price (Current price -> Student price -> Teacher price)
            const getSessionEffectivePrice = (s: Session) => {
                const sessionPrice = Number(s.price) || 0;
                if (sessionPrice > 0) return sessionPrice;

                const student = students.find((stu: Student) => stu.id === s.studentId);
                const studentPrice = Number(student?.sessionPrice) || 0;
                if (studentPrice > 0) return studentPrice;

                const teacher = teachers.find((t: any) => t.name === s.teacherName);
                return Number(teacher?.price) || 0;
            };

            const attendanceRateValue = totalSessionsCount > 0 ? Math.round((completedSessionsCount / totalSessionsCount) * 100) : 0;

            const teacherUsedSessions = isTeacher
                ? teacherStudents.reduce((sum: number, s: Student) => {
                    const en = s.enrollments?.find((e: Enrollment) => e.teacher === teacherName);
                    return sum + (en?.sessionsUsed || 0);
                }, 0)
                : 0;

            const monthExpensesValue = teacherInvoices
                .filter((inv: TeacherInvoice) => inv.status === 'مدفوعة' && inv.date?.startsWith(currentMonth))
                .reduce((sum: number, inv: TeacherInvoice) => sum + (Number(inv.amount) || 0), 0);

            const monthRevenueValue = monthCompletedSessions
                .reduce((sum: number, s: Session) => sum + getSessionEffectivePrice(s), 0);

            const pendingInvoicesCount = studentInvoicesAll.filter((inv: StudentInvoice) => inv.status === 'pending' || inv.status === 'overdue').length;
            const paidInvoicesCount = studentInvoicesAll.filter((inv: StudentInvoice) => inv.status === 'paid').length;

            const last6Months = Array.from({ length: 6 }, (_, i) => {
                const d = new Date();
                d.setMonth(d.getMonth() - (5 - i));
                return d.toISOString().slice(0, 7);
            });

            const chartData = last6Months.map(month => {
                const monthSessions = sessions.filter((s: Session) => s.date?.startsWith(month));
                const mRevenue = monthSessions
                    .filter((s: Session) => s.status === 'completed')
                    .reduce((sum: number, s: Session) => sum + getSessionEffectivePrice(s), 0);
                const mExpenses = teacherInvoices
                    .filter((inv: TeacherInvoice) => inv.status === 'مدفوعة' && inv.date?.startsWith(month))
                    .reduce((sum: number, inv: TeacherInvoice) => sum + (Number(inv.amount) || 0), 0);

                return {
                    month: new Date(month + '-01').toLocaleDateString('ar-EG', { month: 'short' }),
                    revenue: mRevenue,
                    expenses: mExpenses,
                    profit: mRevenue - mExpenses,
                    sessions: monthSessions.length,
                    completed: monthSessions.filter((s: Session) => s.status === 'completed').length
                };
            });

            const lowBalance: LowBalanceStudent[] = [];
            let expectedCol = 0;
            teacherStudents.forEach((s: Student) => {
                if (s.enrollments) {
                    s.enrollments.forEach((en: Enrollment) => {
                        if (isTeacher && en.teacher !== teacherName) return;
                        const total = Number(en.sessionsTotal || en.total) || 0;

                        // Calculate used sessions from actual completed sessions instead of stored value
                        const actualUsed = sessionsAll.filter(
                            (session: Session) =>
                                session.studentId === s.id &&
                                session.teacherName === en.teacher &&
                                session.subject === en.subject &&
                                session.status === 'completed'
                        ).length;

                        const remaining = total - actualUsed;

                        // Only show if remaining is between 0 and 2 (low balance warning)
                        if (remaining <= 2 && remaining >= 0) {
                            lowBalance.push({
                                id: s.id,
                                studentName: s.name || 'غير معروف',
                                subject: en.subject || 'غير محدد',
                                remainingSessions: remaining,
                                teacherName: en.teacher,
                                parentPhone: (isTeacher ? '••••••••' : s.parentPhone) || 'غير متوفر'
                            });
                            expectedCol += 1000;
                        }
                    });
                }
            });

            setStats({
                studentsCount,
                teachersCount,
                parentsCount,
                totalEnrollments,
                monthRevenue: monthRevenueValue,
                monthExpenses: monthExpensesValue,
                todaySessions: todaySessionsCount,
                completedSessions: isTeacher ? teacherUsedSessions : completedSessionsCount,
                cancelledSessions: cancelledSessionsCount,
                attendanceRate: attendanceRateValue,
                pendingInvoices: pendingInvoicesCount,
                paidInvoices: paidInvoicesCount,
                lowBalanceCount: lowBalance.length,
                expectedCollection: expectedCol,
                totalSessions: totalSessionsCount,
                monthCompletedSessions: monthCompletedSessionsCount,
                monthTotalSessions: monthTotalSessionsCount,
                monthNetProfit: isTeacher ? (teacherStudents.reduce((sum: number, s: Student) => {
                    const en = s.enrollments?.find((e: Enrollment) => e.teacher === teacherName);
                    const actualUsed = sessionsAll.filter(
                        (session: Session) =>
                            session.studentId === s.id &&
                            session.teacherName === en?.teacher &&
                            session.subject === en?.subject &&
                            session.status === 'completed'
                    ).length;
                    return sum + (actualUsed * ((en as any)?.price || (s as any).sessionPrice || 0));
                }, 0)) : (monthRevenueValue - monthExpensesValue)
            });

            setLowBalanceStudents(lowBalance);
            setMonthlyData(chartData);

            // Fetch tasks from api
            try {
                const tasksData = await api.get<any[]>('/tasks');
                const pendingTasks = (Array.isArray(tasksData) ? tasksData : []).filter((t: any) => t.status === 'pending');
                setTasks(pendingTasks);
            } catch (e) {
                console.error("Error fetching tasks:", e);
            }

        } catch (error) {
            console.error("Failed to fetch dashboard data", error);
        } finally {
            setLoading(false);
        }
    }, [currentUser]);

    useEffect(() => {
        if (currentUser) {
            fetchDashboardData();
        }
    }, [currentUser, fetchDashboardData]);

    const updateSessionStatus = async (id: string, newStatus: 'scheduled' | 'completed' | 'cancelled') => {
        try {
            await api.patch(`/sessions/${id}`, { status: newStatus });
            fetchDashboardData();
        } catch (error) {
            console.error("Error updating status", error);
            throw error;
        }
    };

    return {
        stats,
        todaySessions,
        monthlyData,
        lowBalanceStudents,
        tasks,
        loading,
        fetchDashboardData,
        updateSessionStatus
    };
};
