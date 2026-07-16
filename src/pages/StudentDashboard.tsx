import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BookOpen, MessageSquare, Star, Clock,
    Bell, ChevronLeft, Play, Video, GraduationCap,
    Headphones, Home, Library, User, MoreHorizontal, CheckCircle, TrendingUp,
    Sun, Moon, Megaphone
} from 'lucide-react';
import { api } from '../lib/api';
import { useCurrentUser, useAdminPhone } from '../context/AppContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { getRankByPoints, STUDENT_RANKS } from '../shared/utils/ranks';
import { useDarkMode } from '../shared/hooks/useDarkMode';
import { cn } from '../lib/utils';
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
    { id: 'courses', label: 'دوراتي', icon: BookOpen, variant: 'success' },
    { id: 'certificates', label: 'الشهادات', icon: GraduationCap, variant: 'info' },
    { id: 'challenges', label: 'التحديات', icon: Trophy, variant: 'primary' },
    { id: 'live', label: 'بث مباشر', icon: Video, variant: 'warning' },
    { id: 'consult', label: 'الاستشارات', icon: Headphones, variant: 'success' },
    { id: 'announcements', label: 'الإعلانات', icon: Megaphone, variant: 'warning' },
];

const variantBg: Record<string, string> = {
    success: 'bg-success-soft',
    info: 'bg-info-soft',
    primary: 'bg-primary-soft',
    warning: 'bg-warning-soft',
};
const variantText: Record<string, string> = {
    success: 'text-success',
    info: 'text-info',
    primary: 'text-primary',
    warning: 'text-warning',
};

// ─── Hero Slides ──────────────────────────────────────────
const heroSlides = [
    {
        id: 0,
        title: 'منصة دارين',
        subtitle: 'للتعليم والتدريب عن بعد',
        desc: 'منصة متكاملة تجمع بين أفضل المعلمين وأحدث تقنيات التعليم الإلكتروني لضمان تفوق أبنائكم دائماً.',
        emoji: '🎓',
        gradient: 'bg-primary-soft',
        textColor: 'text-primary',
    },
    {
        id: 1,
        title: 'تعلّم بلا حدود',
        subtitle: 'من أي مكان في العالم',
        desc: 'حصص تفاعلية مباشرة مع أفضل المعلمين، متابعة دورية، وتقارير مفصلة لأولياء الأمور.',
        emoji: '🌍',
        gradient: 'bg-info-soft',
        textColor: 'text-info-dark',
    },
    {
        id: 2,
        title: 'تحدّ نفسك',
        subtitle: 'واكسب النقاط والشارات',
        desc: 'نظام مكافآت متميز يشجع الطلاب على التفوق والمثابرة مع شارات وألقاب حصرية.',
        emoji: '🏆',
        gradient: 'bg-warning-soft',
        textColor: 'text-warning-dark',
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
    const [activeNav, setActiveNav] = useState('home');
    const [theme, setTheme] = useDarkMode();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [scrollY, setScrollY] = useState(0);
    const heroTimer = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1005);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

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

    const currentEnrollment = enrollments[0];
    const headerScrolled = scrollY > 10;

    if (isLoading) return <PageLoader />;

    return (
        <div className="min-h-screen bg-surface font-sans overflow-x-hidden" dir="rtl">

            {/* ══════════════════ HEADER (glassmorphism, matches Admin Dashboard style) ══════════════════ */}
            <div className={cn(
                "sticky top-0 z-[100] transition-all duration-500",
                headerScrolled
                    ? "bg-card shadow-sm border-b border-border"
                    : "bg-card border-b border-transparent"
            )}>
                <div className="px-4 pt-3 pb-2">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-card bg-primary flex items-center justify-center text-on-primary shadow-sm">
                                <GraduationCap size={18} strokeWidth={1.5} />
                            </div>
                            <div>
                                <h1 className="text-sm font-bold text-main leading-tight">الرئيسية</h1>
                                <p className="text-micro font-medium text-muted">طالب</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {/* Dark mode toggle */}
                            <button
                                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                aria-label={theme === 'dark' ? 'الوضع النهاري' : 'الوضع الليلي'}
                                className="w-8 h-8 flex items-center justify-center text-muted hover:bg-hover rounded-card transition-colors"
                            >
                                {theme === 'dark' ? <Sun size={16} strokeWidth={1.5} /> : <Moon size={16} strokeWidth={1.5} />}
                            </button>
                            {/* Bell */}
                            <button
                                onClick={() => navigate('/parent-announcements')}
                                aria-label="الإعلانات"
                                className="relative w-8 h-8 flex items-center justify-center text-muted hover:bg-hover rounded-card transition-colors"
                            >
                                <Bell size={16} strokeWidth={1.5} />
                                <span className="absolute top-1 start-1 w-2 h-2 bg-error rounded-full border-2 border-card" />
                            </button>
                            {/* Live clock */}
                            <div className="px-2.5 py-1.5 rounded-card bg-hover text-primary font-medium text-micro tabular-nums">
                                <Clock size={12} strokeWidth={1.5} className="inline me-1" />
                                {currentTime.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', hour12: true })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ══════════════════ HERO CAROUSEL ══════════════════ */}
            <div className="px-4 pt-4 pb-3">
                <div className="relative rounded-3xl overflow-hidden min-h-[200px]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={heroIndex}
                            initial={{ opacity: 0, x: 60 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -60 }}
                            transition={{ duration: 0.4, ease: 'easeInOut' }}
                            className={`${heroSlides[heroIndex].gradient} p-5 rounded-card flex items-center justify-between gap-4 min-h-[200px]`}
                        >
                            {/* Text Content */}
                            <div className="flex-1 space-y-2">
                                <h2 className={`text-2xl font-black leading-tight ${heroSlides[heroIndex].textColor}`}>
                                    {heroSlides[heroIndex].title}{' '}
                                    <span className="inline-block border-s-4 border-current ps-0.5 animate-pulse">|</span>
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
                                        className="flex items-center gap-1.5 bg-primary text-on-primary text-xs font-bold px-4 py-2 rounded-card shadow-sm active:scale-95 transition-transform"
                                    >
                                        <Play size={12} fill="currentColor" />
                                        ابدأ الآن
                                    </button>
                                    <button
                                        onClick={() => navigate('/schedule')}
                                        className="flex items-center gap-1.5 bg-card text-primary text-xs font-bold px-4 py-2 rounded-card border border-border active:scale-95 transition-transform"
                                    >
                                        استكشف الدورات
                                        <ChevronLeft size={12} />
                                    </button>
                                </div>
                            </div>

                            {/* Hero Illustration */}
                            <div className="shrink-0 relative z-10">
                                    <div className="w-[110px] h-[120px] relative">
                                    <div className="w-full h-full rounded-card overflow-hidden bg-card flex items-center justify-center text-6xl shadow-soft">
                                        {heroSlides[heroIndex].emoji}
                                    </div>
                                    {/* Floating badge */}
                                    <div className="absolute -bottom-2 -start-2 bg-card rounded-card px-2 py-1 shadow-soft flex items-center gap-1">
                                        <span className="text-micro font-bold text-main">🇰🇼</span>
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
                                aria-label={`الشريحة ${i + 1} من ${heroSlides.length}`}
                                aria-current={i === heroIndex ? 'true' : undefined}
                                                className={`rounded-full transition-all duration-300 ${i === heroIndex ? 'w-5 h-2 bg-primary' : 'w-2 h-2 bg-border'}`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* ══════════════════ QUICK ACCESS ══════════════════ */}
            <div className="px-4 py-3">
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                    {quickAccessItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <motion.button
                                key={item.id}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => {
                                    if (item.id === 'courses') navigate('/schedule');
                                    else if (item.id === 'live') navigate('/chat');
                                    else if (item.id === 'announcements') navigate('/parent-announcements');
                                    else if (item.id === 'consult') {
                                        const phone = adminPhone?.replace(/\D/g, '').replace(/^0/, '965');
                                        window.open(`https://wa.me/${phone}`, '_blank');
                                    }
                                }}
                                className="flex flex-col items-center gap-1.5"
                            >
                                <div
                                    className={`w-12 h-12 rounded-card flex items-center justify-center shadow-sm ${variantBg[item.variant]}`}
                                >
                                    <Icon size={22} className={variantText[item.variant]} />
                                </div>
                                <span className="text-micro font-semibold text-muted text-center leading-tight">
                                    {item.label}
                                </span>
                            </motion.button>
                        );
                    })}
                </div>
            </div>



            {/* ══════════════════ CONTINUE LEARNING ══════════════════ */}
            <div className="px-4 py-3">
                <div className="flex items-center justify-between mb-3">
                    <button onClick={() => navigate('/schedule')} className="text-primary text-sm font-bold">عرض الكل</button>
                    <h2 className="text-lg font-black text-main">تابع تعلمك</h2>
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
                                    className="bg-card rounded-card p-4 shadow-sm border border-border flex items-center gap-3"
                                >
                                    {/* Course Icon */}
                                    <div className="w-14 h-14 rounded-card bg-primary flex items-center justify-center shrink-0 shadow-sm">
                                        <BookOpen size={22} className="text-on-primary" />
                                    </div>
                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-micro font-bold text-primary bg-primary-soft px-2 py-0.5 rounded-card">
                                                متابعة
                                            </span>
                                            <h3 className="text-sm font-black text-main truncate max-w-[140px]">
                                                {en.subject || 'دورة تعليمية'}
                                            </h3>
                                        </div>
                                        <p className="text-micro text-dim text-start mb-2">
                                            {en.level || `${used} من ${total} حصة`}
                                        </p>
                                        {/* Progress Bar */}
                                        <div className="relative">
                                            <div className="h-2 bg-hover rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${progress}%` }}
                                                    transition={{ duration: 0.8, delay: 0.3 + idx * 0.1 }}
                                                    className="h-full bg-primary rounded-full"
                                                />
                                            </div>
                                            <div className="flex justify-between mt-1">
                                                <span className="text-micro font-bold text-primary">{progress}%</span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                ) : (
                    /* Demo Card */
                    <div className="bg-card rounded-card p-4 shadow-sm border border-border flex items-center gap-3">
                        <div className="w-14 h-14 rounded-card bg-primary flex items-center justify-center shrink-0 shadow-sm">
                            <span className="text-2xl">💻</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-micro font-bold text-primary bg-primary-soft px-2 py-0.5 rounded-card">
                                    متابعة
                                </span>
                                <h3 className="text-sm font-black text-main">أساسيات البرمجة</h3>
                            </div>
                            <p className="text-micro text-dim text-start mb-2">المستوى المبتدئ</p>
                            <div className="relative">
                                <div className="h-2 bg-hover rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: '60%' }}
                                        transition={{ duration: 0.8, delay: 0.3 }}
                                        className="h-full bg-primary rounded-full"
                                    />
                                </div>
                                <span className="text-micro font-bold text-primary mt-1 block text-end">60%</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ══════════════════ STATS STRIP ══════════════════ */}
            <div className="px-4 py-3">
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { icon: Star, label: 'النقاط', value: points, variant: 'warning' },
                        { icon: CheckCircle, label: 'الحضور', value: `${stats.attendanceRate}%`, variant: 'success' },
                        { icon: TrendingUp, label: 'اللقب', value: rank.name, variant: 'primary' },
                    ].map((item, idx) => {
                        const Icon = item.icon;
                        const bgClass = variantBg[item.variant];
                        const textClass = variantText[item.variant];
                        return (
                            <div
                                key={idx}
                                className="bg-card rounded-card p-3 shadow-sm border border-border flex flex-col items-center text-center gap-1"
                            >
                                <div
                                    className={`w-9 h-9 rounded-card flex items-center justify-center ${bgClass}`}
                                >
                                    <Icon size={18} className={textClass} />
                                </div>
                                <span className="text-sm font-black text-main">{item.value}</span>
                                <span className="text-micro text-dim font-medium">{item.label}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ══════════════════ ACTIVITY & POINTS ══════════════════ */}
            {pointLogs.length > 0 && (
                <div className="px-4 py-3">
                    <h2 className="text-lg font-black text-main mb-3 text-start">آخر النشاطات</h2>
                    <div className="space-y-2">
                        {pointLogs.slice(0, 3).map((log, i) => (
                            <div
                                key={i}
                                className="bg-card rounded-card px-4 py-3 shadow-sm border border-border flex items-center justify-between"
                            >
                                <span className="text-xs font-bold text-success bg-success-soft px-2 py-1 rounded-card">
                                    +{log.amount} نقطة
                                </span>
                                <span className="text-xs text-muted font-medium">{log.action}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ══════════════════ SUPPORT BANNER ══════════════════ */}
            <div className="px-4 py-3 pb-6">
                <div className="bg-primary rounded-card p-5 shadow-soft">
                    <h3 className="text-on-primary font-black text-lg mb-1 text-start">تحتاج مساعدة؟</h3>
                    <p className="text-on-primary opacity-80 text-xs mb-4 text-start">فريقنا جاهز لمساعدتك في أي وقت</p>
                    <a
                        href={`https://wa.me/${(adminPhone?.replace(/\D/g, '') || '').replace(/^0/, '965') || '96500000000'}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 bg-card text-primary py-3 rounded-card font-black text-sm shadow-soft active:scale-95 transition-transform"
                    >
                        <MessageSquare size={16} />
                        تواصل الآن
                    </a>
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
        <nav className="fixed bottom-0 end-0 start-0 z-50 bg-card border-t border-border pb-[env(safe-area-inset-bottom)] shadow-soft">
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
                                <div className="w-14 h-14 bg-primary rounded-card flex items-center justify-center shadow-soft">
                                    <Icon size={26} className="text-on-primary" />
                                </div>
                            ) : (
                                <>
                                    <Icon
                                        size={22}
                                        className={`transition-all duration-200 ${isActive
                                            ? 'text-primary'
                                            : 'text-dim'
                                            }`}
                                        strokeWidth={isActive ? 2.5 : 1.5}
                                    />
                                    <span
                                        className={`text-micro font-semibold transition-all duration-200 ${isActive ? 'text-primary' : 'text-dim'}`}
                                    >
                                        {item.label}
                                    </span>
                                    {isActive && (
                                        <div className="absolute top-0 end-1/2 -translate-x-1/2 w-5 h-0.5 bg-primary rounded-card" />
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
