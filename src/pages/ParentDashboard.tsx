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
    Activity as ActivityIcon,
    LayoutDashboard
} from 'lucide-react';
import { api } from '../lib/api';
import { useApp } from '../context/AppContext';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { PageLoader } from '../components/ui/PageLoader';

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

        const teachersSet = new Set();
        children.forEach(c => {
            (c.enrollments || []).forEach((en: any) => {
                if (en.teacher) teachersSet.add(en.teacher);
            });
        });

        return {
            childCount: children.length,
            upcomingSessions,
            attendanceRate,
            academicProgress,
            teacherCount: teachersSet.size,
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
        return <PageLoader />;
    }

    return (
        <div className="min-h-full bg-slate-50 dark:bg-[#020617] px-4 md:px-8 pt-6 pb-32 space-y-10 animate-in fade-in duration-700 font-sans" dir="rtl">
            
            {/* ═══════════════ HEADER ═══════════════ */}
            <div className="relative group overflow-hidden bg-white dark:bg-slate-900 border-4 border-slate-900 dark:border-white p-6 md:p-10 shadow-[8px_8px_0px_0px_rgba(79,70,229,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)]">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 -skew-x-12 transform translate-x-32 -translate-y-32"></div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="bg-indigo-600 text-white text-[10px] font-black px-2 py-0.5 uppercase tracking-[3px] italic">بوابة أولياء الأمور</span>
                            <Star size={14} className="text-amber-400 fill-current" />
                        </div>
                        <h1 className="text-2xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic leading-none">
                            مرحباً، <span className="text-indigo-600 dark:text-indigo-400">أ/ {(currentUser?.name || currentUser?.username || 'ولي الأمر').split(' ')[0]}</span>
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-xs font-black uppercase tracking-[2px] italic mt-4 flex items-center gap-2">
                            <div className="w-10 h-1 bg-indigo-600"></div>
                            رحلة تميز أبنائك تبدأ من هنا
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-left hidden md:block">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">تاريخ اليوم</p>
                            <p className="text-sm font-black text-slate-900 dark:text-white italic">{format(new Date(), 'eeee, d MMMM', { locale: ar })}</p>
                        </div>
                        <button 
                            onClick={logout}
                            className="w-14 h-14 bg-rose-600 text-white flex items-center justify-center border-4 border-slate-900 dark:border-white shadow-[4px_4px_0px_0px_black] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all group"
                        >
                            <LogOut size={24} className="group-hover:rotate-12 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-10">
                    {/* ═══════════════ SUMMARY BANNER ═══════════════ */}
                    <div className="relative bg-slate-900 dark:bg-black p-10 border-r-8 border-indigo-600 shadow-[20px_20px_60px_rgba(0,0,0,0.3)] overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(79,70,229,0.15),transparent)]"></div>
                        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-[3000ms]"></div>
                        
                        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                            <div className="space-y-4">
                                <h3 className="text-xs font-black text-indigo-400 uppercase tracking-[5px] italic flex items-center gap-2">
                                    <Trophy size={16} /> إجمالي رصيد التميز العائلي
                                </h3>
                                <div className="flex items-baseline gap-4">
                                    <span className="text-7xl font-black text-white font-mono tracking-tighter italic drop-shadow-[0_0_20px_rgba(79,70,229,0.5)]">{stats.totalPoints}</span>
                                    <div className="flex flex-col">
                                        <span className="text-xl font-black text-indigo-400 uppercase italic leading-none">نقطة</span>
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">رصيد تراكمي</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col items-end md:border-r-2 md:border-white/10 md:pr-10">
                                <div className="w-16 h-16 bg-white/5 border-2 border-white/10 flex items-center justify-center mb-4 group-hover:border-indigo-500 transition-colors">
                                    <Trophy className="text-indigo-400 group-hover:scale-110 transition-transform duration-500" size={32} />
                                </div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] text-left italic max-w-[150px] leading-relaxed">
                                    أبناؤكم يحققون إنجازات استثنائية في الأكاديمية
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* ═══════════════ QUICK STATS ═══════════════ */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <QuickStatCard icon={Users} label="الأبناء المسجلين" value={stats.childCount} color="indigo" sub="طلاب نشطين" />
                        <QuickStatCard icon={CalendarDays} label="الحصص القادمة" value={stats.upcomingSessions} color="emerald" sub="هذا الشهر" />
                        <QuickStatCard icon={Award} label="الكادر التعليمي" value={stats.teacherCount} color="rose" sub="معلمون معتمدون" />
                    </div>

                    {/* ═══════════════ ELITE HEROES ═══════════════ */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between border-b-2 border-slate-200 dark:border-slate-800 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-indigo-600 flex items-center justify-center text-white italic font-black shadow-lg shadow-indigo-600/20">H</div>
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic">لوحة أبطال الأكاديمية</h2>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {children.map((child) => {
                                const points = child.totalPoints || 0;
                                const status = points >= 500 ? { name: 'المجتهد الذكي', goal: 1000, color: 'indigo' } : { name: 'الباحث المستكشف', goal: 500, color: 'emerald' };
                                const progress = Math.min(Math.round((points / status.goal) * 100), 100);

                                return (
                                    <div key={child.id} onClick={() => navigate('/parent-students')} className="bg-white dark:bg-slate-900 border-4 border-slate-900 dark:border-slate-800 p-8 flex items-center gap-8 cursor-pointer hover:border-indigo-500 transition-all shadow-[8px_8px_0_0_rgba(0,0,0,0.05)] group relative overflow-hidden active:translate-x-1 active:translate-y-1 active:shadow-none">
                                        <div className="absolute top-0 right-0 w-2 h-full bg-slate-900 dark:bg-slate-800 group-hover:bg-indigo-600 transition-colors"></div>
                                        <div className="relative">
                                            <div className="w-20 h-20 bg-slate-900 dark:bg-black border-4 border-indigo-600/20 flex items-center justify-center text-white shadow-2xl italic font-black text-3xl group-hover:scale-105 transition-transform duration-500">
                                                {child.name.charAt(0)}
                                            </div>
                                            <div className="absolute -bottom-2 -right-2 bg-indigo-600 text-white text-[11px] font-black px-3 py-1.5 italic shadow-xl border-2 border-white dark:border-slate-900">
                                                {points} Pts
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="w-4 h-[2px] bg-indigo-600"></span>
                                                <h4 className="text-sm md:text-base font-black text-slate-900 dark:text-white leading-none uppercase tracking-tight italic truncate">{child.name}</h4>
                                            </div>
                                            <div className="flex justify-between items-center mb-3">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{status.name}</span>
                                                <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 font-mono italic">{progress}%</span>
                                            </div>
                                            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-none overflow-hidden p-[2px] border border-slate-200 dark:border-slate-700">
                                                <motion.div 
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${progress}%` }}
                                                    className="h-full bg-indigo-600 dark:bg-indigo-500 shadow-[0_0_10px_rgba(79,70,229,0.5)]"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="space-y-10">
                    {/* ═══════════════ NAVIGATION GRID ═══════════════ */}
                    <div className="grid grid-cols-1 gap-4">
                        <NavButton label="إدارة ملفات الأبناء" icon={Users} onClick={() => navigate('/parent-students')} />
                        <NavButton label="منتدى دارين التفاعلي" icon={LayoutDashboard} onClick={() => navigate('/forum')} />
                    </div>

                    {/* ═══════════════ SUCCESS ADVISOR ═══════════════ */}
                    <div className="bg-slate-900 dark:bg-black p-8 border-l-[12px] border-indigo-600 shadow-[20px_20px_40px_rgba(0,0,0,0.4)] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 -skew-x-12 transform translate-x-16 -translate-y-16"></div>
                        <h3 className="text-xs font-black text-indigo-400 uppercase tracking-[4px] mb-10 flex items-center gap-3 italic leading-none border-b border-white/10 pb-4">
                            <ActivityIcon size={16} className="text-indigo-500" /> 
                            <span>مستشار الإنجاز الذكي</span>
                        </h3>
                        
                        <div className="space-y-10 relative z-10">
                            <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 italic">معدل الحضور والانضباط</p>
                                        <p className="text-3xl font-black text-white italic font-mono leading-none">{stats.attendanceRate}%</p>
                                    </div>
                                    <div className={cn(
                                        "px-3 py-1 text-[9px] font-black uppercase italic tracking-widest border-2",
                                        stats.attendanceRate > 90 
                                            ? "border-emerald-500/50 text-emerald-400 bg-emerald-500/5" 
                                            : "border-indigo-500/50 text-indigo-400 bg-indigo-500/5"
                                    )}>
                                        مستوى ممتاز
                                    </div>
                                </div>
                                <div className="w-full h-2 bg-white/5 border border-white/10 p-[2px]">
                                    <motion.div initial={{ width: 0 }} animate={{ width: `${stats.attendanceRate}%` }} className="h-full bg-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.8)]" />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 italic">التقدم الأكاديمي الشامل</p>
                                        <p className="text-3xl font-black text-white italic font-mono leading-none">{stats.academicProgress}%</p>
                                    </div>
                                    <div className="px-3 py-1 border-2 border-white/20 text-white text-[9px] font-black uppercase italic tracking-widest bg-white/5">
                                        قيد المتابعة
                                    </div>
                                </div>
                                <div className="w-full h-2 bg-white/5 border border-white/10 p-[2px]">
                                    <motion.div initial={{ width: 0 }} animate={{ width: `${stats.academicProgress}%` }} className="h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.8)]" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ═══════════════ DAILY TASKS ═══════════════ */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between border-b-4 border-slate-900 dark:border-slate-800 pb-4">
                            <div className="flex items-center gap-2">
                                <CalendarDays size={18} className="text-indigo-600" />
                                <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-widest italic">جدول مهام اليوم</h2>
                            </div>
                            <span className="text-[10px] font-black bg-indigo-600 text-white px-2 py-1 italic shadow-lg uppercase">({todayArabic})</span>
                        </div>

                        <div className="space-y-4">
                            {todayTasks.length > 0 ? todayTasks.map((task, idx) => (
                                <div key={idx} className="bg-white dark:bg-slate-900 p-5 border-4 border-slate-900 dark:border-slate-800 flex items-center justify-between group hover:border-indigo-600 transition-all cursor-default shadow-[4px_4px_0px_0px_rgba(0,0,0,0.02)]">
                                     <div className="flex items-center gap-5">
                                        <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-900 dark:text-white font-black group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all italic text-xl">
                                            {idx + 1}
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight italic">{task.subject}</h4>
                                            <div className="flex items-center gap-2 mt-1">
                                                <User size={10} className="text-indigo-600" />
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">الطالب: {task.studentName}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-left">
                                        <span className="block text-sm font-black text-indigo-600 dark:text-indigo-400 font-mono italic shadow-sm leading-none">{task.time} م</span>
                                        <span className="text-[8px] font-black text-slate-400 uppercase mt-1 block">توقيت القاهرة</span>
                                    </div>
                                </div>
                            )) : (
                                <div className="py-16 border-4 border-dashed border-slate-200 dark:border-slate-800 text-center bg-slate-50/50 dark:bg-slate-900/20">
                                    <CalendarDays size={40} className="mx-auto text-slate-200 dark:text-slate-800 mb-4" />
                                    <p className="text-slate-400 dark:text-slate-600 font-black text-[10px] uppercase tracking-[4px] italic">لا توجد حصص مجدولة لهذا اليوم</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ═══════════════ SUPPORT FOOTER ═══════════════ */}
                    <div className="bg-indigo-600 p-10 border-4 border-slate-900 dark:border-white shadow-[12px_12px_0px_0px_black] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-full h-full bg-[linear-gradient(45deg,rgba(0,0,0,0.1)_25%,transparent_25%,transparent_50%,rgba(0,0,0,0.1)_50%,rgba(0,0,0,0.1)_75%,transparent_75%,transparent)] bg-[length:20px_20px] opacity-10"></div>
                        <div className="relative z-10 flex flex-col gap-8">
                            <div>
                                <h4 className="text-2xl md:text-3xl font-black text-white italic uppercase tracking-tight leading-none mb-3">هل تحتاج لمساعدة تقنية؟</h4>
                                <p className="text-[11px] font-black text-indigo-100 uppercase tracking-widest italic opacity-80 leading-relaxed border-r-2 border-white/30 pr-4">
                                    فريق الدعم الفني متاح على مدار الساعة لخدمتكم والإجابة على كافة استفساراتكم المتعلقة بالمنصة.
                                </p>
                            </div>
                            <a 
                                href={`https://wa.me/${adminPhone?.replace(/\D/g, '').replace(/^0/, '20')}`}
                                target="_blank" rel="noopener noreferrer"
                                className="w-full bg-slate-900 text-white py-4 font-black text-xs uppercase tracking-[5px] italic flex items-center justify-center gap-4 hover:bg-white hover:text-slate-900 transition-all shadow-2xl active:scale-95 border-2 border-transparent hover:border-slate-900"
                            >
                                <MessageSquare size={18} fill="currentColor" />
                                <span>تواصل عبر الواتساب</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const QuickStatCard = ({ icon: Icon, label, value, color, sub }: any) => {
    const colors: any = {
        indigo: "border-indigo-600 text-indigo-600 bg-indigo-50/10",
        emerald: "border-emerald-500 text-emerald-500 bg-emerald-50/10",
        rose: "border-rose-500 text-rose-500 bg-rose-50/10"
    };
    return (
        <div className="bg-white dark:bg-slate-900 p-8 border-4 border-slate-900 dark:border-slate-800 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.05)] group hover:border-indigo-600 transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none">
            <div className="flex justify-between items-start mb-6">
                <div className={cn("w-12 h-12 border-2 flex items-center justify-center shadow-lg", colors[color])}>
                    <Icon size={20} strokeWidth={2.5} />
                </div>
                <div className="text-left">
                    <span className="text-4xl font-black text-slate-900 dark:text-white font-mono italic leading-none block drop-shadow-sm">{value}</span>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic mt-1 block">{sub}</span>
                </div>
            </div>
            <div className="pt-4 border-t-2 border-slate-50 dark:border-slate-800">
                <span className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-[2px] italic">{label}</span>
            </div>
        </div>
    );
};

const NavButton = ({ label, icon: Icon, onClick }: any) => (
    <button 
        onClick={onClick}
        className="w-full bg-white dark:bg-slate-900 p-8 border-4 border-slate-900 dark:border-white flex items-center justify-between group hover:bg-slate-900 dark:hover:bg-white transition-all active:scale-[0.98] shadow-[12px_12px_0px_0px_rgba(0,0,0,0.05)] hover:shadow-none"
    >
        <div className="flex flex-col items-start text-right">
            <span className="text-xs font-black text-slate-400 uppercase tracking-[3px] italic mb-1">الذهاب إلى</span>
            <span className="text-base font-black text-slate-900 dark:text-white group-hover:text-white dark:group-hover:text-black uppercase tracking-[1px] italic">{label}</span>
        </div>
        <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 border-2 border-slate-900 dark:border-white flex items-center justify-center text-slate-900 dark:text-white group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-xl">
            <Icon size={24} strokeWidth={2.5} />
        </div>
    </button>
);
