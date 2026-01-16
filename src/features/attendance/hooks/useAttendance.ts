import { useState, useEffect, useMemo } from 'react';
import { attendanceService } from '../services/attendanceService';
import type { Session, Student, AttendanceStats, TeacherStats, GlobalUser } from '../types';

export const useAttendance = (currentUser: GlobalUser | null, date: string) => {
    const [students, setStudents] = useState<Student[]>([]);
    const [allSessions, setAllSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [sessionsData, studentsData] = await Promise.all([
                attendanceService.getSessions(),
                attendanceService.getStudents()
            ]);
            setAllSessions(sessionsData);
            setStudents(studentsData);
        } catch (error) {
            console.error("Error fetching attendance data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAll();
    }, [date]);

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

    const updateSchedule = async (student: Student, enrollmentIndex: number, newSchedule: any[]) => {
        try {
            const updatedStudent = { ...student };
            updatedStudent.enrollments[enrollmentIndex].schedule = newSchedule;
            await attendanceService.updateStudent(updatedStudent);
            fetchAll();
            return true;
        } catch (error) {
            console.error("Error updating schedule", error);
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

    const teacherData = useMemo(() => {
        const nameToMatch = currentUser?.teacherName || currentUser?.name;
        const teacherStudents = students.filter(s => s.enrollments?.some(e => e.teacher === nameToMatch));

        const teacherStats: TeacherStats = {
            expected: teacherStudents.reduce((acc, s) => {
                const en = s.enrollments.find(e => e.teacher === nameToMatch);
                return acc + (en?.sessionsTotal || 0);
            }, 0),
            used: teacherStudents.reduce((acc, s) => {
                const en = s.enrollments.find(e => e.teacher === nameToMatch);
                return acc + (en?.sessionsUsed || 0);
            }, 0),
            remaining: 0,
            rate: 0
        };

        teacherStats.remaining = teacherStats.expected - teacherStats.used;
        teacherStats.rate = teacherStats.expected > 0 ? Math.round((teacherStats.used / teacherStats.expected) * 100) : 0;

        return { teacherStudents, teacherStats };
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
        stats,
        ...teacherData,
        uniqueTeachers
    };
};
