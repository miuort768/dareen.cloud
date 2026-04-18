import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Users,
    CalendarDays,
    Star,
    Award,
    Trophy,
    User,
    LogOut,
    MessageSquare,
    ChevronLeft,
    Activity,
    BookOpen
} from 'lucide-react';
import { api } from '../lib/api';
import { useApp } from '../context/AppContext';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

export const ParentDashboard = () => {
    const { currentUser, adminPhone, logout } = useApp();
    const navigate = useNavigate();
    const [children, setChildren] = useState<any[]>([]);
    const [sessions, setSessions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const todayArabic = format(new Date(), 'eeee', { locale: ar });

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                setIsLoading(true);
                const students = await api.get<any[]>('/parents/my-children');
                setChildren(students);
                
                const sessionsPromises = students.map(s => api.get<any[]>(`/parents/child-sessions/${s.id}`));
                const allSessionsResults = await Promise.all(sessionsPromises);
                setSessions(allSessionsResults.flat());

            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAllData();
    }, []);

    const stats = useMemo(() => {
        const completed = sessions.filter(s => s.status === 'completed').length;
        const totalRecorded = sessions.filter(s => s.status === 'completed' || s.status === 'cancelled').length;
        const attendanceRate = totalRecorded > 0 ? Math.round((completed / totalRecorded) * 100) : 0;

        let sessionsUsed = 0;
        let sessionsTotal = 0;
        children.forEach(c => {
            (c.enrollments || []).forEach((en: any) => {
                sessionsUsed += Number(en.sessionsUsed || 0);
                sessionsTotal += Number(en.sessionsTotal || 0);
            });
        });

        const academicProgress = sessionsTotal > 0 ? Math.round((sessionsUsed / sessionsTotal) * 100) : 0;
        const upcomingSessions = sessions.filter(s => s.status !== 'completed' && s.status !== 'cancelled').length;

        return {
            childCount: children.length,
            upcomingSessions,
            attendanceRate,
            academicProgress,
            totalPoints: children.reduce((sum, c) => sum + (c.totalPoints || 0), 0)
        };
    }, [sessions, children]);

    const todayTasks = useMemo(() => {
        const tasks: any[] = [];
        children.forEach(child => {
            (child.enrollments || []).forEach((en: any) => {
                (en.schedule || []).forEach((slot: any) => {
                    if (slot.day === todayArabic) {
                        tasks.push({
                            studentName: child.name,
                            subject: en.subject,
                            teacher: en.teacher,
                            time: slot.hour,
                            period: slot.period
                        });
                    }
                });
            });
        });
        return tasks.sort((a, b) => a.time.localeCompare(b.time));
    }, [children, todayArabic]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#f8faff] flex flex-col items-center justify-center p-4">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-slate-500 font-bold tracking-tight text-sm">جاري تحميل البوابة...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8faff] pb-20 px-4 lg:px-8 pt-6 space-y-6 animate-in fade-in duration-700" dir="rtl">
            
            {/* ═══════════════ HEADER ═══════════════ */}
            <div className="flex justify-between items-start mb-2">
                <div className="max-w-[80%]">
                    <h1 className="text-xl md:text-3xl font-black text-slate-900 leading-tight">
                        مرحباً بك شريك النجاح، <span className="text-indigo-600 block md:inline font-black">أ/ {currentUser?.name}</span>
                    </h1>
                    <p className="text-slate-500 text-[11px] md:text-sm font-medium mt-1">نحن فخورون بمتابعتك لرحلة أبنائك التعليمية</p>
                </div>
                <button 
                    onClick={logout}
                    className="p-3 bg-white text-rose-500 rounded-2xl shadow-sm border border-slate-100 hover:bg-rose-50 transition-all shrink-0"
                >
                    <LogOut size={20} />
                </button>
            </div>

            {/* ═══════════════ SUMMARY BANNER ═══════════════ */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden bg-gradient-to-br from-[#a78bfa] to-[#8b5cf6] p-6 rounded-2xl shadow-lg shadow-purple-500/10 text-white"
            >
                <div className="absolute top-0 right-0 w-12 h-12 pointer-events-none overflow-hidden z-20">
                    <div className="absolute top-[-25px] right-[-25px] w-12 h-12 bg-cyan-400 rotate-45 shadow-[0_0_15px_#22d3ee]" />
                </div>
                <Trophy className="absolute bottom-2 left-2 text-white/5" size={60} />
                
                <div className="relative z-10 flex flex-col items-center text-center">
                    <span className="text-[9px] md:text-[10px] uppercase font-black tracking-widest opacity-80 mb-2">ملخص الأداء العام</span>
                    <div className="bg-white/10 backdrop-blur-md px-6 md:px-10 py-3 rounded-2xl border border-white/20 mb-3 w-full md:w-auto">
                        <h2 className="text-[10px] md:text-sm font-black opacity-90">إجمالي النقاط التراكميّة</h2>
                        <p className="text-2xl md:text-4xl font-black mt-1">
                            {stats.totalPoints} <span className="text-xs md:text-sm opacity-60">نقطة</span>
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* ═══════════════ QUICK STATS ═══════════════ */}
            <div className="grid grid-cols-3 gap-2 md:gap-4">
                <QuickStatCard icon={Users} label="الأبناء" value={stats.childCount} color="indigo" />
                <QuickStatCard icon={CalendarDays} label="الحصص" value={stats.upcomingSessions} color="blue" />
                <QuickStatCard icon={Award} label="المعلمات" value={children.length > 0 ? "نشط" : "0"} color="rose" />
            </div>

            {/* ═══════════════ NAVIGATION GRID ═══════════════ */}
            <div className="grid grid-cols-2 gap-3">
                <NavButton label="ملفات الأبناء" icon={Users} onClick={() => navigate('/parent-students')} />
                <NavButton label="جدول المتابعة" icon={CalendarDays} onClick={() => navigate('/parent-attendance')} />
            </div>

            {/* ═══════════════ ELITE HEROES ═══════════════ */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2 px-1">
                    <Star className="text-amber-500" size={20} fill="currentColor" />
                    <h3 className="text-lg font-black text-slate-900">مراكز الأبطال النخبويين</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {children.map((child) => {
                        const points = child.totalPoints || 0;
                        const status = points >= 500 ? { name: 'المجتهد الذكي', goal: 1000 } : { name: 'الباحث المستكشف', goal: 500 };
                        const progress = Math.min(Math.round((points / status.goal) * 100), 100);

                        return (
                            <div key={child.id} onClick={() => navigate('/parent-students')} className="bg-white p-4 rounded-3xl shadow-sm border border-slate-50 flex items-center gap-4 cursor-pointer hover:shadow-md transition-all">
                                <div className="relative">
                                    <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center overflow-hidden">
                                        <User className="text-indigo-200" size={32} />
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 bg-rose-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-lg border border-white">
                                        {points}
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-black text-slate-900 leading-tight truncate">{child.name}</h4>
                                    <div className="flex justify-between items-center mt-2 mb-1">
                                        <span className="text-[10px] font-bold text-slate-400 capitalize">{status.name}</span>
                                        <span className="text-[10px] font-black text-indigo-600">{progress}%</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progress}%` }}
                                            className="h-full bg-indigo-600"
                                        />
                                    </div>
                                </div>
                                <ChevronLeft className="text-slate-300" size={16} />
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ═══════════════ SUCCESS ADVISOR (NEW) ═══════════════ */}
            <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-50 space-y-8">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <h3 className="text-2xl font-black text-slate-900 italic">مستشار الإنجاز</h3>
                        <Activity className="text-indigo-600" size={24} />
                    </div>
                </div>

                <div className="space-y-8">
                    <ProgressRow label="معدل الحضور" value={stats.attendanceRate} />
                    <ProgressRow label="التقدم الأكاديمي" value={stats.academicProgress} />
                    <ProgressRow 
                        label='نحو لقب "طالب مجتهد"' 
                        value={Math.min(stats.academicProgress, 100)} 
                        subLabel={`${stats.attendanceRate}% / 100%`} 
                    />
                </div>
            </div>

            {/* ═══════════════ DAILY TASKS (NEW) ═══════════════ */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-2xl font-black text-slate-900 italic">مهام اليوم ({todayArabic})</h3>
                    <button className="text-xs font-black text-indigo-600 uppercase tracking-widest hover:underline">عرض الكل</button>
                </div>

                <div className="space-y-4">
                    {todayTasks.map((task, idx) => (
                        <div key={idx} className="bg-white p-5 rounded-[2.5rem] shadow-sm border border-slate-50 flex items-center justify-between group hover:shadow-md transition-all">
                             <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-indigo-50 text-indigo-500 rounded-3xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                    <BookOpen size={22} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-black text-slate-900">{task.subject}</h4>
                                    <p className="text-[10px] font-bold text-slate-400 mt-0.5">الطالب: {task.studentName}</p>
                                    <p className="text-[10px] font-bold text-indigo-400">المعلمة: {task.teacher}</p>
                                </div>
                            </div>
                            <div className="text-left font-black text-slate-900">
                                <span className="block text-md">{task.time} م</span>
                                <span className="inline-block px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[8px] rounded-lg mt-1 tracking-widest uppercase">قادم</span>
                            </div>
                        </div>
                    ))}
                    {todayTasks.length === 0 && (
                        <div className="py-12 flex flex-col items-center justify-center bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100 italic">
                            <CalendarDays className="text-slate-200 mb-2" size={40} />
                            <p className="text-slate-400 font-bold text-sm tracking-tight text-center">لا توجد مهام اليوم</p>
                        </div>
                    )}
                </div>
            </div>

            {/* ═══════════════ SUPPORT FOOTER ═══════════════ */}
            <div className="bg-[#5c4fb1] p-6 rounded-3xl shadow-lg text-white flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                <div className="absolute right-0 bottom-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -translate-x-1/2 translate-y-1/2" />
                <div className="text-center md:text-right relative z-10 w-full md:w-auto">
                    <h4 className="text-lg font-black mb-1">هل تحتاج لمساعدة؟</h4>
                    <p className="text-xs font-bold opacity-80 leading-tight">فريق الدعم متاح دائماً لخدمة ولي الأمر والرد على استفساراته</p>
                </div>
                <a 
                    href={`https://wa.me/${adminPhone?.replace(/\D/g, '').replace(/^0/, '20')}`}
                    target="_blank" rel="noopener noreferrer"
                    className="bg-white text-[#5c4fb1] px-6 py-3 rounded-[20px] font-black text-sm flex items-center gap-3 transition-transform active:scale-95 shadow-xl w-full md:w-auto justify-center"
                >
                    <div className="w-8 h-8 bg-[#5c4fb1] text-white rounded-[10px] flex items-center justify-center">
                        <MessageSquare size={16} fill="currentColor" />
                    </div>
                    تواصل معنا
                </a>
            </div>

        </div>
    );
};

const QuickStatCard = ({ icon: Icon, label, value, color }: any) => {
    const colors: any = {
        indigo: "bg-indigo-50 text-indigo-500 shadow-indigo-100",
        blue: "bg-blue-50 text-blue-500 shadow-blue-100",
        rose: "bg-rose-50 text-rose-500 shadow-rose-100"
    };
    return (
        <div className="bg-white py-3 px-2 rounded-2xl shadow-sm border border-slate-50 flex flex-col items-center justify-center text-center">
            <div className={cn("w-9 h-9 rounded-full flex items-center justify-center mb-1.5", colors[color])}>
                <Icon size={16} />
            </div>
            <span className="text-lg font-black text-slate-900 leading-none">{value}</span>
            <span className="text-[10px] font-bold text-slate-400 mt-1">{label}</span>
        </div>
    );
};

const NavButton = ({ label, icon: Icon, onClick }: any) => (
    <button 
        onClick={onClick}
        className="bg-[#f2f0ff] p-4 rounded-3xl border border-indigo-100/50 flex flex-col items-center justify-center gap-2 transition-all active:scale-95 hover:bg-white hover:shadow-md group"
    >
        <div className="w-11 h-11 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm group-hover:scale-110 transition-transform">
            <Icon size={20} strokeWidth={1.5} />
        </div>
        <span className="text-xs font-black text-slate-700 tracking-tight">{label}</span>
    </button>
);

const ProgressRow = ({ label, value, subLabel }: { label: string; value: number; subLabel?: string }) => (
    <div className="space-y-3">
        <div className="flex justify-between items-center px-1">
            <span className="text-2xl font-black text-slate-900 italic tracking-tighter">{label}</span>
            <span className="text-xs font-black text-slate-500">{subLabel || `${value}%`}</span>
        </div>
        <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
            <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${value}%` }}
                className="h-full bg-indigo-600 rounded-full"
            />
        </div>
    </div>
);
