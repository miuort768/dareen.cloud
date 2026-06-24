import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BookOpen, MessageSquare, Star, Award, Clock, Trophy, Sparkles,
    Search, Bell, ChevronLeft, Play, Users, Video, Target, GraduationCap,
    Headphones, Home, Library, User, MoreHorizontal, CheckCircle, TrendingUp,
    Sun, Moon
} from 'lucide-react';
import { api } from '../lib/api';
import { useCurrentUser, useAdminPhone } from '../context/AppContext';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useNavigate, useLocation } from 'react-router-dom';
import { getRankByPoints, STUDENT_RANKS } from '../shared/utils/ranks';
import { useDarkMode } from '../shared/hooks/useDarkMode';
import { PageLoader } from '../components/ui/PageLoader';

// ─── Types ───────────────────────────────────────────────
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

interface Session {
    status: string;
}

interface PointLog {
    amount: number;
    action: string;
}

// ─── Quick Access Data ────────────────────────────────────
const quickAccessItems = [
    { id: 'courses', label: 'دوراتي', icon: BookOpen, color: '#22C55E', bg: '#F0FDF4' },
    { id: 'certificates', label: 'الشهادات', icon: GraduationCap, color: '#3B82F6', bg: '#EFF6FF' },
    { id: 'challenges', label: 'التحديات', icon: Trophy, color: '#A855F7', bg: '#FAF5FF' },
    { id: 'live', label: 'بث مباشر', icon: Video, color: '#F97316', bg: '#FFF7ED' },
    { id: 'consult', label: 'الاستشارات', icon: Headphones, color: '#10B981', bg: '#ECFDF5' },
];

// ─── Course Filter Tabs ───────────────────────────────────
const courseTabs = [
    { id: 'all', label: 'الكل' },
    { id: 'primary', label: 'المرحلة الابتدائية' },
    { id: 'middle', label: 'المرحلة المتوسطة' },
    { id: 'high', label: 'المرحلة الثانوية' },
    { id: 'skills', label: 'مهارات عامة' },
];

// ─── Static Demo Courses ──────────────────────────────────
const demoCourses = [
    {
        id: 1,
        title: 'العلوم المتكاملة',
        level: 'المرحلة المتوسطة',
        students: '1.6K',
        rating: 4.6,
        badge: 'الأكثر مبيعاً',
        badgeColor: '#22C55E',
        emoji: '🧪',
        gradient: 'from-emerald-400 to-teal-600',
        tab: 'middle',
    },
    {
        id: 2,
        title: 'اللغة الإنجليزية',
        level: 'المرحلة المتوسطة',
        students: '1.8K',
        rating: 4.7,
        badge: 'جديد',
        badgeColor: '#A855F7',
        emoji: '🇬🇧',
        gradient: 'from-blue-400 to-indigo-600',
        tab: 'middle',
    },
    {
        id: 3,
        title: 'الرياضيات المتقدمة',
        level: 'المرحلة الثانوية',
        students: '2.5K',
        rating: 4.8,
        badge: 'الأكثر مبيعاً',
        badgeColor: '#22C55E',
        emoji: '📐',
        gradient: 'from-amber-400 to-orange-600',
        tab: 'high',
    },
];

// ─── Hero Slides ──────────────────────────────────────────
const heroSlides = [
    {
        id: 0,
        title: 'منصة دارين',
        subtitle: 'للتعليم والتدريب عن بعد',
        desc: 'منصة متكاملة تجمع بين أفضل المعلمين وأحدث تقنيات التعليم الإلكتروني لضمان تفوق أبنائكم دائماً.',
        emoji: '🎓',
        gradient: 'from-[#EEE9FF] via-[#E8E0FF] to-[#DDD5FF]',
        textColor: 'text-[#3D1F8F]',
    },
    {
        id: 1,
        title: 'تعلّم بلا حدود',
        subtitle: 'من أي مكان في العالم',
        desc: 'حصص تفاعلية مباشرة مع أفضل المعلمين، متابعة دورية، وتقارير مفصلة لأولياء الأمور.',
        emoji: '🌍',
        gradient: 'from-[#E0F2FE] via-[#BAE6FD] to-[#7DD3FC]',
        textColor: 'text-[#0C4A6E]',
    },
    {
        id: 2,
        title: 'تحدّ نفسك',
        subtitle: 'واكسب النقاط والشارات',
        desc: 'نظام مكافآت متميز يشجع الطلاب على التفوق والمثابرة مع شارات وألقاب حصرية.',
        emoji: '🏆',
        gradient: 'from-[#FEF3C7] via-[#FDE68A] to-[#FCD34D]',
        textColor: 'text-[#78350F]',
    },
];

// ─── Main Component ───────────────────────────────────────
export const StudentDashboard = () => {
    const currentUser = useCurrentUser();
    const adminPhone = useAdminPhone();
    const navigate = useNavigate();
    const location = useLocation();

    const [studentData, setStudentData] = useState<Record<string, unknown> | null>(null);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [pointLogs, setPointLogs] = useState<PointLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [heroIndex, setHeroIndex] = useState(0);
    const [activeTab, setActiveTab] = useState('all');
    const [activeNav, setActiveNav] = useState('home');
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [theme, setTheme] = useDarkMode();
    const heroTimer = useRef<ReturnType<typeof setInterval> | null>(null);

    // Auto-advance hero
    useEffect(() => {
        heroTimer.current = setInterval(() => {
            setHeroIndex(i => (i + 1) % heroSlides.length);
        }, 4000);
        return () => { if (heroTimer.current) clearInterval(heroTimer.current); };
    }, []);

    // Fetch data
    useEffect(() => {
        const fetchStudentData = async () => {
            try {
                setIsLoading(true);
                const [meRes, sessionsRes, logsRes] = await Promise.all([
                    api.get<Record<string, unknown>>('/student-portal/me'),
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

    const points = (studentData?.totalPoints as number) || 0;
    const rank = getRankByPoints(points, STUDENT_RANKS);
    const enrollments = (studentData?.enrollments as Enrollment[]) || [];
    const firstName = (studentData?.name as string)?.split(' ')[0] || currentUser?.name?.split(' ')[0] || 'الطالب';

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
            sessionsUsed, sessionsTotal,
            totalAttendance, totalAbsence,
            attendanceRate: totalRecorded > 0 ? Math.round((totalAttendance / totalRecorded) * 100) : 0,
        };
    }, [sessions, enrollments]);

    const filteredCourses = activeTab === 'all'
        ? demoCourses
        : demoCourses.filter(c => c.tab === activeTab);

    const currentEnrollment = enrollments[0];

    if (isLoading) return <PageLoader />;

    return (
        <div className="min-h-screen bg-[#F8F7FF] font-sans overflow-x-hidden" dir="rtl">

            {/* ══════════════════ HEADER (glassmorphism, matches Layout Header style) ══════════════════ */}
            <div className="sticky top-0 z-50 backdrop-blur-md header-nav shadow-sm shadow-black/10">
                <div className="flex items-center justify-between px-3 md:px-5 py-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-800 flex items-center justify-center shadow-lg shadow-indigo-600/20 shrink-0">
                            <GraduationCap size={16} className="text-white" />
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-sm md:text-lg font-bold text-white leading-tight truncate">الرئيسية</h1>
                            <p className="text-[9px] md:text-[10px] font-normal text-white/70 truncate">طالب</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 md:gap-2">
                        {/* Search */}
                        <div className="relative hidden sm:block">
                            <Search size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/50" />
                            <input
                                type="text"
                                placeholder="ابحث..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-24 lg:w-36 bg-white/10 backdrop-blur-sm rounded-full py-1.5 pr-8 pl-3 text-xs text-right text-white placeholder-white/40 outline-none focus:ring-2 focus:ring-white/20 transition-all border border-white/10"
                            />
                        </div>
                        {/* Search icon (mobile) */}
                        <button
                            onClick={() => setShowSearch(!showSearch)}
                            className="sm:hidden w-8 h-8 flex items-center justify-center text-white/70 hover:bg-white/10 rounded-xl transition-colors"
                        >
                            <Search size={16} />
                        </button>
                        {/* Dark mode toggle */}
                        <button
                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                            className="w-8 h-8 flex items-center justify-center text-white/70 hover:bg-white/10 rounded-xl transition-colors shrink-0"
                        >
                            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                        </button>
                        {/* Bell */}
                        <button
                            className="relative w-8 h-8 flex items-center justify-center text-white/70 hover:bg-white/10 rounded-xl transition-colors shrink-0"
                            onClick={() => navigate('/announcements')}
                        >
                            <Bell size={16} />
                            <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
                        </button>
                    </div>
                </div>
                {/* Mobile search bar (expanded) */}
                {showSearch && (
                    <div className="sm:hidden px-3 pb-2">
                        <div className="relative">
                            <Search size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/50" />
                            <input
                                type="text"
                                placeholder="ابحث..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full bg-white/10 backdrop-blur-sm rounded-full py-2 pr-8 pl-3 text-xs text-right text-white placeholder-white/40 outline-none focus:ring-2 focus:ring-white/20 transition-all border border-white/10"
                                autoFocus
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* ══════════════════ HERO CAROUSEL ══════════════════ */}
            <div className="px-4 pt-4 pb-3">
                <div className="relative rounded-3xl overflow-hidden" style={{ minHeight: 200 }}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={heroIndex}
                            initial={{ opacity: 0, x: 60 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -60 }}
                            transition={{ duration: 0.4, ease: 'easeInOut' }}
                            className={`bg-gradient-to-br ${heroSlides[heroIndex].gradient} p-5 rounded-3xl flex items-center justify-between gap-4 relative overflow-hidden min-h-[200px]`}
                        >
                            {/* Decorative circles */}
                            <div className="absolute top-[-30px] left-[-30px] w-32 h-32 bg-white/20 rounded-full blur-2xl" />
                            <div className="absolute bottom-[-20px] right-[30%] w-24 h-24 bg-white/15 rounded-full blur-xl" />

                            {/* Text Content */}
                            <div className="flex-1 z-10 space-y-2">
                                <h2 className={`text-2xl font-black leading-tight ${heroSlides[heroIndex].textColor}`}>
                                    {heroSlides[heroIndex].title}{' '}
                                    <span className="inline-block border-r-4 border-current pr-0.5 animate-pulse">|</span>
                                </h2>
                                <p className={`text-sm font-bold ${heroSlides[heroIndex].textColor} opacity-80`}>
                                    {heroSlides[heroIndex].subtitle}
                                </p>
                                <p className={`text-xs leading-relaxed ${heroSlides[heroIndex].textColor} opacity-70 max-w-[180px]`}>
                                    {heroSlides[heroIndex].desc}
                                </p>
                                <div className="flex gap-2 pt-2 flex-wrap">
                                    <button
                                        onClick={() => navigate('/chat')}
                                        className="flex items-center gap-1.5 bg-[#3D1F8F] text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg active:scale-95 transition-transform"
                                    >
                                        <Play size={12} fill="white" />
                                        ابدأ الآن
                                    </button>
                                    <button
                                        onClick={() => navigate('/schedule')}
                                        className="flex items-center gap-1.5 bg-white/80 text-[#3D1F8F] text-xs font-bold px-4 py-2 rounded-full border border-[#3D1F8F]/20 active:scale-95 transition-transform"
                                    >
                                        استكشف الدورات
                                        <ChevronLeft size={12} />
                                    </button>
                                </div>
                            </div>

                            {/* Hero Illustration */}
                            <div className="shrink-0 relative z-10">
                                <div className="w-[110px] h-[120px] relative">
                                    <div className="w-full h-full rounded-2xl overflow-hidden bg-white/30 backdrop-blur-sm flex items-center justify-center text-6xl shadow-xl">
                                        {heroSlides[heroIndex].emoji}
                                    </div>
                                    {/* Floating badge */}
                                    <div className="absolute -bottom-2 -right-2 bg-white rounded-full px-2 py-1 shadow-lg flex items-center gap-1">
                                        <span className="text-[9px] font-bold text-gray-700">🇰🇼</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Dots */}
                    <div className="flex justify-center gap-1.5 mt-3">
                        {heroSlides.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setHeroIndex(i)}
                                className={`rounded-full transition-all duration-300 ${i === heroIndex ? 'w-5 h-2 bg-[#7C3AED]' : 'w-2 h-2 bg-gray-300'}`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* ══════════════════ QUICK ACCESS ══════════════════ */}
            <div className="px-4 py-3">
                <div className="grid grid-cols-5 gap-2">
                    {quickAccessItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <motion.button
                                key={item.id}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => {
                                    if (item.id === 'courses') navigate('/schedule');
                                    else if (item.id === 'live') navigate('/chat');
                                    else if (item.id === 'consult') {
                                        const phone = adminPhone?.replace(/\D/g, '').replace(/^0/, '965');
                                        window.open(`https://wa.me/${phone}`, '_blank');
                                    }
                                }}
                                className="flex flex-col items-center gap-1.5"
                            >
                                <div
                                    className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm"
                                    style={{ backgroundColor: item.bg }}
                                >
                                    <Icon size={22} style={{ color: item.color }} />
                                </div>
                                <span className="text-[10px] font-semibold text-gray-600 text-center leading-tight">
                                    {item.label}
                                </span>
                            </motion.button>
                        );
                    })}
                </div>
            </div>

            {/* ══════════════════ LATEST COURSES ══════════════════ */}
            <div className="px-4 py-3">
                {/* Section Header */}
                <div className="flex items-center justify-between mb-3">
                    <button
                        className="flex items-center gap-1 text-[#7C3AED] text-sm font-bold"
                        onClick={() => navigate('/schedule')}
                    >
                        <ChevronLeft size={16} />
                        عرض الكل
                    </button>
                    <h2 className="text-lg font-black text-gray-800">أحدث الدورات</h2>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar" style={{ scrollbarWidth: 'none' }}>
                    {courseTabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${activeTab === tab.id
                                ? 'bg-[#7C3AED] text-white shadow-md shadow-purple-200'
                                : 'bg-white text-gray-600 border border-gray-200'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Course Cards - Horizontal Scroll */}
                <div className="flex gap-3 overflow-x-auto pt-3 pb-2 no-scrollbar" style={{ scrollbarWidth: 'none' }}>
                    {/* Real enrollments first */}
                    {enrollments.slice(0, 2).map((en, idx) => (
                        <motion.div
                            key={`enroll-${idx}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="shrink-0 w-[155px] bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100"
                        >
                            {/* Course Image */}
                            <div className="h-[90px] bg-gradient-to-br from-purple-400 to-indigo-600 flex items-center justify-center relative">
                                <span className="text-4xl">📚</span>
                                <div className="absolute top-2 right-2 bg-green-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full">
                                    مسجّل
                                </div>
                            </div>
                            {/* Course Info */}
                            <div className="p-3 space-y-1">
                                <h3 className="text-xs font-black text-gray-800 line-clamp-1">{en.subject || 'دورة تعليمية'}</h3>
                                <p className="text-[10px] text-gray-400">{en.level || 'عام'}</p>
                                <div className="flex items-center justify-between pt-1">
                                    <div className="flex items-center gap-0.5">
                                        <Star size={10} className="text-amber-400" fill="#FBB12E" />
                                        <span className="text-[10px] font-bold text-gray-600">4.8</span>
                                    </div>
                                    <div className="flex items-center gap-0.5">
                                        <Users size={10} className="text-gray-400" />
                                        <span className="text-[10px] text-gray-400">1.2K</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    {/* Demo courses */}
                    {filteredCourses.map((course, idx) => (
                        <motion.div
                            key={course.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="shrink-0 w-[155px] bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100"
                        >
                            {/* Course Image */}
                            <div className={`h-[90px] bg-gradient-to-br ${course.gradient} flex items-center justify-center relative`}>
                                <span className="text-4xl">{course.emoji}</span>
                                {course.badge && (
                                    <div
                                        className="absolute top-2 right-2 text-white text-[9px] font-black px-2 py-0.5 rounded-full"
                                        style={{ backgroundColor: course.badgeColor }}
                                    >
                                        {course.badge}
                                    </div>
                                )}
                            </div>
                            {/* Course Info */}
                            <div className="p-3 space-y-1">
                                <h3 className="text-xs font-black text-gray-800 line-clamp-1">{course.title}</h3>
                                <p className="text-[10px] text-gray-400">{course.level}</p>
                                <div className="flex items-center justify-between pt-1">
                                    <div className="flex items-center gap-0.5">
                                        <Star size={10} className="text-amber-400" fill="#FBB12E" />
                                        <span className="text-[10px] font-bold text-gray-600">{course.rating}</span>
                                    </div>
                                    <div className="flex items-center gap-0.5">
                                        <Users size={10} className="text-gray-400" />
                                        <span className="text-[10px] text-gray-400">{course.students}</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* ══════════════════ CONTINUE LEARNING ══════════════════ */}
            <div className="px-4 py-3">
                <div className="flex items-center justify-between mb-3">
                    <button onClick={() => navigate('/schedule')} className="text-[#7C3AED] text-sm font-bold">عرض الكل</button>
                    <h2 className="text-lg font-black text-gray-800">تابع تعلمك</h2>
                </div>

                {enrollments.length > 0 ? (
                    <div className="space-y-3">
                        {enrollments.slice(0, 3).map((en, idx) => {
                            const used = Number(en.sessionsUsed || 0);
                            const total = Number(en.sessionsTotal || 1);
                            const progress = Math.min(Math.round((used / total) * 100), 100);
                            return (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3"
                                >
                                    {/* Course Icon */}
                                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-400 to-indigo-600 flex items-center justify-center shrink-0 shadow-md">
                                        <BookOpen size={22} className="text-white" />
                                    </div>
                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-[10px] font-bold text-[#7C3AED] bg-purple-50 px-2 py-0.5 rounded-full">
                                                متابعة
                                            </span>
                                            <h3 className="text-sm font-black text-gray-800 truncate max-w-[140px]">
                                                {en.subject || 'دورة تعليمية'}
                                            </h3>
                                        </div>
                                        <p className="text-[10px] text-gray-400 text-right mb-2">
                                            {en.level || `${used} من ${total} حصة`}
                                        </p>
                                        {/* Progress Bar */}
                                        <div className="relative">
                                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${progress}%` }}
                                                    transition={{ duration: 0.8, delay: 0.3 + idx * 0.1 }}
                                                    className="h-full bg-gradient-to-r from-[#7C3AED] to-[#A78BFA] rounded-full"
                                                />
                                            </div>
                                            <div className="flex justify-between mt-1">
                                                <span className="text-[10px] font-bold text-[#7C3AED]">{progress}%</span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                ) : (
                    /* Demo Card */
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-400 to-blue-600 flex items-center justify-center shrink-0 shadow-md">
                            <span className="text-2xl">💻</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-[10px] font-bold text-[#7C3AED] bg-purple-50 px-2 py-0.5 rounded-full">
                                    متابعة
                                </span>
                                <h3 className="text-sm font-black text-gray-800">أساسيات البرمجة</h3>
                            </div>
                            <p className="text-[10px] text-gray-400 text-right mb-2">المستوى المبتدئ</p>
                            <div className="relative">
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: '60%' }}
                                        transition={{ duration: 0.8, delay: 0.3 }}
                                        className="h-full bg-gradient-to-r from-[#7C3AED] to-[#A78BFA] rounded-full"
                                    />
                                </div>
                                <span className="text-[10px] font-bold text-[#7C3AED] mt-1 block text-left">60%</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ══════════════════ STATS STRIP ══════════════════ */}
            <div className="px-4 py-3">
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { icon: Star, label: 'النقاط', value: points, color: '#F59E0B', bg: '#FFFBEB' },
                        { icon: CheckCircle, label: 'الحضور', value: `${stats.attendanceRate}%`, color: '#10B981', bg: '#ECFDF5' },
                        { icon: TrendingUp, label: 'اللقب', value: rank.name, color: '#7C3AED', bg: '#FAF5FF' },
                    ].map((item, idx) => {
                        const Icon = item.icon;
                        return (
                            <div
                                key={idx}
                                className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 flex flex-col items-center text-center gap-1"
                            >
                                <div
                                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                                    style={{ backgroundColor: item.bg }}
                                >
                                    <Icon size={18} style={{ color: item.color }} />
                                </div>
                                <span className="text-sm font-black text-gray-800">{item.value}</span>
                                <span className="text-[10px] text-gray-400 font-medium">{item.label}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ══════════════════ ACTIVITY & POINTS ══════════════════ */}
            {pointLogs.length > 0 && (
                <div className="px-4 py-3">
                    <h2 className="text-lg font-black text-gray-800 mb-3 text-right">آخر النشاطات</h2>
                    <div className="space-y-2">
                        {pointLogs.slice(0, 3).map((log, i) => (
                            <div
                                key={i}
                                className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-100 flex items-center justify-between"
                            >
                                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                                    +{log.amount} نقطة
                                </span>
                                <span className="text-xs text-gray-600 font-medium">{log.action}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ══════════════════ SUPPORT BANNER ══════════════════ */}
            <div className="px-4 py-3 pb-6">
                <div className="bg-gradient-to-br from-[#5B21B6] to-[#7C3AED] rounded-3xl p-5 relative overflow-hidden shadow-xl shadow-purple-200">
                    <div className="absolute top-[-20px] left-[-20px] w-28 h-28 bg-white/10 rounded-full blur-2xl" />
                    <div className="absolute bottom-[-15px] right-[20%] w-20 h-20 bg-white/10 rounded-full blur-xl" />
                    <div className="relative z-10">
                        <h3 className="text-white font-black text-lg mb-1 text-right">تحتاج مساعدة؟</h3>
                        <p className="text-purple-200 text-xs mb-4 text-right">فريقنا جاهز لمساعدتك في أي وقت</p>
                        <a
                            href={`https://wa.me/${(adminPhone?.replace(/\D/g, '') || '').replace(/^0/, '965') || '96500000000'}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 bg-white text-[#5B21B6] py-3 rounded-2xl font-black text-sm shadow-lg active:scale-95 transition-transform"
                        >
                            <MessageSquare size={16} />
                            تواصل الآن
                        </a>
                    </div>
                </div>
            </div>

            {/* Spacer for bottom nav */}
            <div className="h-20 md:hidden" />

            {/* ══════════════════ BOTTOM NAVIGATION ══════════════════ */}
            <div className="block md:hidden">
                <MobileBottomNav activeNav={activeNav} setActiveNav={setActiveNav} />
            </div>
        </div>
    );
};

// ─── Mobile Bottom Navigation ─────────────────────────────
const MobileBottomNav = ({
    activeNav,
    setActiveNav,
}: {
    activeNav: string;
    setActiveNav: (v: string) => void;
}) => {
    const navigate = useNavigate();
    const location = useLocation();

    const navItems = [
        { id: 'more', label: 'المزيد', icon: MoreHorizontal, path: '/forum' },
        { id: 'profile', label: 'الملف الشخصي', icon: User, path: '/student-dashboard' },
        { id: 'home', label: 'الرئيسية', icon: Home, path: '/student-dashboard', isCenter: true },
        { id: 'library', label: 'مكتبة الدورات', icon: Library, path: '/schedule' },
        { id: 'main', label: 'الرئيسية', icon: Home, path: '/' },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 pb-[env(safe-area-inset-bottom)] shadow-2xl shadow-gray-300/40">
            <div className="flex items-center justify-around h-[68px] px-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path || (item.id === 'home' && location.pathname.includes('student-dashboard'));
                    const isCenter = item.isCenter;

                    return (
                        <button
                            key={item.id}
                            onClick={() => {
                                setActiveNav(item.id);
                                navigate(item.path);
                            }}
                            className={`flex flex-col items-center justify-center gap-1 transition-all duration-200 touch-manipulation relative ${isCenter ? 'w-14 h-14 -mt-6' : 'w-full h-full'}`}
                        >
                            {isCenter ? (
                                <div className="w-14 h-14 bg-gradient-to-br from-[#5B21B6] to-[#7C3AED] rounded-full flex items-center justify-center shadow-xl shadow-purple-300/50">
                                    <Icon size={26} className="text-white" />
                                </div>
                            ) : (
                                <>
                                    <Icon
                                        size={22}
                                        className={`transition-all duration-200 ${isActive
                                            ? 'text-[#7C3AED]'
                                            : 'text-gray-400'
                                            }`}
                                        strokeWidth={isActive ? 2.5 : 1.5}
                                    />
                                    <span
                                        className={`text-[9px] font-semibold transition-all duration-200 ${isActive ? 'text-[#7C3AED]' : 'text-gray-400'}`}
                                    >
                                        {item.label}
                                    </span>
                                    {isActive && (
                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-[#7C3AED] rounded-full" />
                                    )}
                                </>
                            )}
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};

export default StudentDashboard;
