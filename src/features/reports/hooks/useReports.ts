import { useState, useEffect, useMemo } from 'react';
import { reportsService } from '../services/reportsService';
import { safeArray } from '../../../lib/api';
import type { ReportData, ReportType } from '../types';

export const useReports = () => {
    const [data, setData] = useState<ReportData>({
        students: [],
        sessions: [],
        invoices: []
    });
    const [loading, setLoading] = useState(true);
    const [activeReport, setActiveReport] = useState<ReportType>('overview');
    const [searchTerm, setSearchTerm] = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            const reportData = await reportsService.getReportData();
            setData(reportData);
        } catch (error) {
            console.error("Error fetching report data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const stats = useMemo(() => {
        const currentMonth = new Date().toISOString().slice(0, 7);

        // General
        const students = safeArray(data.students);
        const sessions = safeArray(data.sessions);
        const invoices = safeArray(data.invoices);

        const totalStudents = students.length;
        const totalEnrollments = students.reduce((sum, s) => sum + (s.enrollments?.length || 0), 0);

        // Attendance
        const totalSessions = sessions.length;
        const completedSessions = sessions.filter(s => s.status === 'completed').length;
        const cancelledSessions = sessions.filter(s => s.status === 'cancelled').length;
        const attendanceRate = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;

        // Financial
        const totalRevenue = sessions
            .filter(s => s.status === 'completed')
            .reduce((sum, s) => sum + (Number(s.price) || 0), 0);
        const totalExpenses = invoices
            .filter(inv => inv.status === 'مدفوعة')
            .reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0);
        const monthRevenue = sessions
            .filter(s => s.status === 'completed' && s.date?.startsWith(currentMonth))
            .reduce((sum, s) => sum + (Number(s.price) || 0), 0);
        const monthExpenses = invoices
            .filter(inv => inv.status === 'مدفوعة' && inv.date?.startsWith(currentMonth))
            .reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0);

        // Months
        const uniqueMonths = Array.from(new Set([
            ...sessions.map(s => s.date?.slice(0, 7)),
            ...invoices.map(inv => inv.date?.slice(0, 7))
        ].filter(Boolean))).sort().reverse();

        // Chart Data
        const monthlySessionsData = uniqueMonths.slice(0, 6).reverse().map(month => {
            const monthSessions = sessions.filter(s => s.date?.startsWith(month));
            return {
                month: new Date(month + '-01').toLocaleDateString('ar-EG', { month: 'short' }),
                completed: monthSessions.filter(s => s.status === 'completed').length,
                cancelled: monthSessions.filter(s => s.status === 'cancelled').length,
                total: monthSessions.length
            };
        });

        // Distributions
        const subjectDistribution = students
            .flatMap(s => s.enrollments || [])
            .reduce((acc, e) => {
                acc[e.subject] = (acc[e.subject] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);

        const subjectPieData = Object.entries(subjectDistribution).map(([subject, count]) => ({
            name: subject,
            value: count
        }));

        const gradeDistribution = students.reduce((acc, s) => {
            acc[s.grade] = (acc[s.grade] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const gradeBarData = Object.entries(gradeDistribution).map(([grade, count]) => ({
            grade,
            count
        }));

        // Teacher Performance
        const teacherPerformance = sessions.reduce((acc, s) => {
            if (!acc[s.teacherName]) {
                acc[s.teacherName] = { total: 0, completed: 0, cancelled: 0 };
            }
            acc[s.teacherName].total++;
            if (s.status === 'completed') acc[s.teacherName].completed++;
            if (s.status === 'cancelled') acc[s.teacherName].cancelled++;
            return acc;
        }, {} as Record<string, { total: number; completed: number; cancelled: number }>);

        const teacherPerformanceData = Object.entries(teacherPerformance).map(([teacher, stats]) => ({
            teacher,
            ...stats,
            rate: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0
        }));

        // Student Progress
        const studentProgressData = students.map(student => {
            const tSessions = student.enrollments?.reduce((sum, e) => sum + e.sessionsTotal, 0) || 0;
            const uSessions = student.enrollments?.reduce((sum, e) => sum + e.sessionsUsed, 0) || 0;
            const progress = tSessions > 0 ? Math.round((uSessions / tSessions) * 100) : 0;

            return {
                id: student.id,
                name: student.name,
                grade: student.grade,
                totalEnrollments: student.enrollments?.length || 0,
                totalSessions: tSessions,
                usedSessions: uSessions,
                progress
            };
        });

        return {
            totalStudents,
            totalEnrollments,
            totalSessions,
            completedSessions,
            cancelledSessions,
            attendanceRate,
            totalRevenue,
            totalExpenses,
            monthRevenue,
            monthExpenses,
            monthlySessionsData,
            subjectPieData,
            gradeBarData,
            teacherPerformanceData,
            studentProgressData
        };
    }, [data]);

    const filteredStudentProgress = useMemo(() => {
        return stats.studentProgressData.filter(s =>
            s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.grade.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [stats.studentProgressData, searchTerm]);

    return {
        state: {
            loading,
            activeReport,
            searchTerm,
            ...stats
        },
        actions: {
            setActiveReport,
            setSearchTerm,
            refresh: fetchData
        },
        filtered: {
            studentProgress: filteredStudentProgress
        }
    };
};
