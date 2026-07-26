import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { api } from '../../../lib/api';
import { attendanceService } from '../services/attendanceService';
import type { Session, Student, AttendanceStats, TeacherStats, GlobalUser, ScheduleSlot } from '../types';

export const useAttendance = (currentUser: GlobalUser | null, date: string, dateRange?: { start: string; end: string }) => {
    const [students, setStudents] = useState<Student[]>([]);
    const [allSessions, setAllSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const mountedRef = useRef(true);

    useEffect(() => {
        mountedRef.current = true;
        return () => { mountedRef.current = false; };
    }, []);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            const [sessionsData, studentsData] = await Promise.all([
                attendanceService.getSessions(),
                attendanceService.getStudents()
            ]);
            if (mountedRef.current) {
                setAllSessions(sessionsData);
                setStudents(studentsData);
            }
        } catch (error) {
            console.error("Error fetching attendance data", error);
        } finally {
            if (mountedRef.current) setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAll();
    }, [date, fetchAll]);

    const updateStatus = async (id: string, newStatus: Session['status']) => {
        try {
            await attendanceService.updateSessionStatus(id, newStatus);
            setAllSessions(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
            fetchAll(); // Refresh to ensure consistency
            return true;
        } catch (error) {
            console.error("Error updating status", error);
            return false;
        }
    };

    const logAttendance = async (sessionData: Omit<Session, 'id'>) => {
        try {
            await attendanceService.createSession(sessionData);
            fetchAll();
            return true;
        } catch (error) {
            console.error("Error logging attendance", error);
            return false;
        }
    };

    const updateSchedule = async (student: Student, enrollmentIndex: number, newSchedule: ScheduleSlot[]) => {
        try {
            const updatedStudent = { ...student };
            updatedStudent.enrollments[enrollmentIndex]!.schedule = newSchedule;
            await attendanceService.updateStudent(updatedStudent);
            fetchAll();
            return true;
        } catch (error) {
            console.error("Error updating schedule", error);
            return false;
        }
    };

    const updateEnrollmentNotes = async (studentId: string, subject: string, notes: string) => {
        try {
            const student = students.find(s => s.id === studentId);
            if (!student) return false;
            
            const enrollmentIndex = student.enrollments.findIndex(e => e.subject === subject);
            if (enrollmentIndex === -1) return false;

            const updatedStudent = { ...student };
            const updatedEnrollments = student.enrollments.map((e) => 
                e.subject === subject ? { ...e, nextSessionNotes: notes } : e
            );
            updatedStudent.enrollments = updatedEnrollments;

            await attendanceService.updateStudent(updatedStudent);
            // Deep update state to ensure re-render
            setStudents(prev => [...prev.map(s => s.id === studentId ? { ...updatedStudent } : s)]);
            return true;
        } catch (error) {
            console.error("Error updating enrollment notes", error);
            return false;
        }
    };

    const requestReschedule = async (studentId: string, studentName: string, subject: string, data: { date: string, time: string, reason: string }) => {
        try {
            await api.post('/tasks', {
                id: Math.random().toString(36).substring(2, 11) + Date.now().toString(36),
                title: `طلب تأجيل: ${studentName}`,
                description: `الحصة: ${subject}\nالموعد المقترح: ${data.date} - ${data.time}\nالسبب: ${data.reason}`,
                status: 'pending',
                priority: 'medium',
                dueDate: data.date,
                teacherId: currentUser?.id,
                studentId: studentId
            });
            return true;
        } catch (err) {
            console.error('Reschedule error:', err);
            return false;
        }
    };

    const stats = useMemo<AttendanceStats>(() => {
        // We filter sessions by date here to match the logic in Attendance.tsx
        const todaySessions = allSessions.filter(s => {
            if (s.date === date) return true;
            if (s.status === 'scheduled') {
                const sessionDate = new Date(s.date);
                const clientDate = new Date(date);
                const diffTime = clientDate.getTime() - sessionDate.getTime();
                const diffDays = diffTime / (1000 * 3600 * 24);
                return diffDays > 0 && diffDays <= 1;
            }
            return false;
        });

        return {
            todayCompleted: todaySessions.filter(s => s.status === 'completed').length,
            todayCancelled: todaySessions.filter(s => s.status === 'cancelled').length,
            todayScheduled: todaySessions.filter(s => s.status === 'scheduled').length,
            todayTotal: todaySessions.length,
            totalCompleted: allSessions.filter(s => s.status === 'completed').length
        };
    }, [allSessions, date]);

    const periodStats = useMemo(() => {
        if (!dateRange) return null;
        const { start, end } = dateRange;
        const rangeSessions = allSessions.filter(s => {
            return s.date >= start && s.date <= end;
        });
        return {
            completed: rangeSessions.filter(s => s.status === 'completed').length,
            cancelled: rangeSessions.filter(s => s.status === 'cancelled').length,
            scheduled: rangeSessions.filter(s => s.status === 'scheduled').length,
            total: rangeSessions.length
        };
    }, [allSessions, dateRange]);

    const teacherData = useMemo(() => {
        const nameToMatch = (currentUser?.teacherName || currentUser?.name || '').trim().toLowerCase();
        const tidToMatch = currentUser?.id;

        // Flatten enrollments to handle multiple subjects per student for the same teacher
        const matchedEnrollments = students.flatMap(s =>
            (s.enrollments || [])
                .filter(en => {
                    const enTeacherName = (en.teacher || '').trim().toLowerCase();
                    // Match by ID if available, otherwise fallback to robust name matching
                    const isIdMatch = tidToMatch && en.teacherId === tidToMatch;
                    const isNameMatch = enTeacherName === nameToMatch;
                    return isIdMatch || isNameMatch;
                })
                .map(en => ({
                    student: s,
                    enrollment: en
                }))
        );

        const teacherStats: TeacherStats = {
            expected: matchedEnrollments.reduce((acc, me) => acc + (me.enrollment.sessionsTotal || 0), 0),
            used: matchedEnrollments.reduce((acc, me) => acc + (me.enrollment.sessionsUsed || 0), 0),
            remaining: 0,
            rate: 0
        };

        teacherStats.remaining = teacherStats.expected - teacherStats.used;
        teacherStats.rate = teacherStats.expected > 0 ? Math.round((teacherStats.used / teacherStats.expected) * 100) : 0;

        return { matchedEnrollments, teacherStats };
    }, [students, currentUser]);

    const uniqueTeachers = useMemo(() => {
        return Array.from(new Set(students.flatMap(s => s.enrollments?.map(e => e.teacher) || [])))
            .filter(Boolean)
            .sort();
    }, [students]);

    return {
        students,
        allSessions,
        loading,
        updateStatus,
        logAttendance,
        updateSchedule,
        updateEnrollmentNotes,
        requestReschedule,
        stats,
        periodStats,
        ...teacherData,
        uniqueTeachers,
        refresh: fetchAll
    };
};
