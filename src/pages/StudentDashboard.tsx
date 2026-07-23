import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../lib/api';
import { useCurrentUser } from '../context/AppContext';
import { getRankByPoints, STUDENT_RANKS } from '../shared/utils/ranks';
import { useDarkMode } from '../shared/hooks/useDarkMode';
import { PageLoader } from '../components/ui/PageLoader';
import {
    HeroCarousel, ContinueLearning, MobileBottomNav,
    StudentDashboardHeader, QuickAccessGrid, StatsStrip,
    ActivityFeed, SupportBanner
} from './student-dashboard';

interface Enrollment {
    subject?: string;
    teacher?: string;
    sessionsUsed?: number;
    sessionsTotal?: number;
    schedule?: { day: string; hour: string; period: string }[];
    nextSessionNotes?: string;
    teacherName?: string;
    progress?: number;
    image?: string;
    level?: string;
}

interface StudentDashboardData {
    id?: string;
    name?: string;
    grade?: string;
    totalPoints?: number;
    enrollments?: Enrollment[];
    [key: string]: unknown;
}

interface Session { status: string; }

interface PointLog { amount: number; action: string; }

export const StudentDashboard = () => {
    const currentUser = useCurrentUser();
    const navigate = useNavigate();

    const [studentData, setStudentData] = useState<StudentDashboardData | null>(null);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [pointLogs, setPointLogs] = useState<PointLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);


    const [theme, setTheme] = useDarkMode();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [scrollY, setScrollY] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1005);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const fetchStudentData = async () => {
            try {
                setIsLoading(true);
                const [meRes, sessionsRes, logsRes] = await Promise.all([
                    api.get<StudentDashboardData>('/student-portal/me'),
                    api.get<Session[]>('/student-portal/me/sessions'),
                    api.get<PointLog[]>('/student-portal/me/points-log'),
                ]);
                setStudentData(meRes);
                setSessions(sessionsRes);
                setPointLogs(logsRes);
            } catch (error) {
                console.error('Error fetching student dashboard:', error);
            } finally {
                setIsLoading(false);
            }
        };
        if (currentUser?.role === 'student') fetchStudentData();
    }, [currentUser]);

    const points = studentData?.totalPoints || 0;
    const rank = getRankByPoints(points, STUDENT_RANKS);
    const enrollments = useMemo(() => studentData?.enrollments || [], [studentData?.enrollments]);

    const stats = useMemo(() => {
        const totalAttendance = sessions.filter(s => s.status === 'completed').length;
        const totalAbsence = sessions.filter(s => s.status === 'cancelled').length;
        const totalRecorded = totalAttendance + totalAbsence;
        let sessionsUsed = 0, sessionsTotal = 0;
        enrollments.forEach((en) => {
            sessionsUsed += Number(en.sessionsUsed || 0);
            sessionsTotal += Number(en.sessionsTotal || 0);
        });
        return {
            sessionsUsed, sessionsTotal, totalAttendance, totalAbsence,
            attendanceRate: totalRecorded > 0 ? Math.round((totalAttendance / totalRecorded) * 100) : 0,
        };
    }, [sessions, enrollments]);

    const headerScrolled = scrollY > 10;

    if (isLoading) return <PageLoader />;

    return (
        <div className="min-h-screen bg-white dark:bg-background font-sans overflow-x-hidden" dir="rtl">
            <StudentDashboardHeader headerScrolled={headerScrolled} theme={theme} setTheme={setTheme}
                currentTime={currentTime} onBellClick={() => navigate('/parent-announcements')} />

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="px-4 pt-4 pb-3">
                <HeroCarousel />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }} className="px-4 py-3">
                <QuickAccessGrid />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <ContinueLearning enrollments={enrollments} />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }} className="px-4 py-3">
                <StatsStrip points={points} attendanceRate={stats.attendanceRate} rankName={rank.name} />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
                <ActivityFeed pointLogs={pointLogs} />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}>
                <SupportBanner />
            </motion.div>

            <div className="h-20 md:hidden" />
            <div className="block md:hidden">
                <MobileBottomNav />
            </div>
        </div>
    );
};

export default StudentDashboard;
