import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

import {
    Users,
    Calendar,
    Receipt,
    CheckCircle2,
    CalendarDays,
    Clock,
    Headset,
    Activity,
    Star,
    Award,
    Trophy,
    ShieldCheck,
    Target,
    User,
    ChevronLeft
} from 'lucide-react';
import { api } from '../lib/api';
import { useApp } from '../context/AppContext';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { ParentChildVisualProgress } from '../features/dashboard/components/ParentChildVisualProgress';

export const ParentDashboard = () => {
    const { currentUser, adminPhone } = useApp();
    const navigate = useNavigate();
    const [children, setChildren] = useState<any[]>([]);
    const [sessions, setSessions] = useState<any[]>([]);
    const [invoices, setInvoices] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAllDays, setShowAllDays] = useState(false);

    const todayArabic = format(new Date(), 'eeee', { locale: ar });

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                setIsLoading(true);
                const students = await api.get<any[]>('/parents/my-children');
                setChildren(students);

                const sessionsPromises = students.map(s => api.get<any[]>(`/parents/child-sessions/${s.id}`));
                const invoicesPromises = students.map(s => api.get<any[]>(`/parents/child-invoices/${s.id}`));

                const allSessionsResults = await Promise.all(sessionsPromises);
                const allInvoicesResults = await Promise.all(invoicesPromises);

                setSessions(allSessionsResults.flat());
                setInvoices(allInvoicesResults.flat());

            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAllData();
    }, []);

    const displayData = useMemo(() => {
        return { sessions, invoices, students: children };
    }, [sessions, invoices, children]);

    const stats = useMemo(() => {
        const pendingInvoices = displayData.invoices.filter(i => i.status === 'unpaid');
        const totalPaid = displayData.invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0);

        let sessionsUsed = 0;
        let sessionsTotal = 0;

        displayData.students.forEach(s => {
            (s.enrollments || []).forEach((en: any) => {
                sessionsUsed += Number(en.sessionsUsed || 0);
                sessionsTotal += Number(en.sessionsTotal || 0);
            });
        });

        const totalAttendance = displayData.sessions.filter(s => s.status === 'completed').length;
        const totalAbsence = displayData.sessions.filter(s => s.status === 'cancelled').length;

        const totalRecorded = totalAttendance + totalAbsence;
        const attendanceRate = totalRecorded > 0
            ? Math.round((totalAttendance / totalRecorded) * 100)
            : 0;

        return {
            childCount: displayData.students.length,
            sessionCount: displayData.sessions.length,
            pendingInvoiceCount: pendingInvoices.length,
            totalPaid,
            totalPending: pendingInvoices.reduce((sum, i) => sum + i.amount, 0),
            upcomingSessions: displayData.sessions.filter(s => s.status !== 'completed' && s.status !== 'cancelled').length,
            sessionsUsed,
            sessionsTotal,
            totalAttendance,
            totalAbsence,
            attendanceRate
        };
    }, [displayData]);

    const weeklySchedule = useMemo(() => {
        const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
        const scheduleMap: Record<string, any[]> = {};

        displayData.students.forEach(student => {
            (student.enrollments || []).forEach((en: any) => {
                (en.schedule || []).forEach((slot: any) => {
                    if (!scheduleMap[slot.day]) scheduleMap[slot.day] = [];
                    scheduleMap[slot.day].push({
                        studentName: student.name,
                        subject: en.subject,
                        time: slot.hour,
                        period: slot.period,
                        teacher: en.teacher
                    });
                });
            });
        });

        return days.map(day => ({
            day,
            slots: (scheduleMap[day] || []).sort((a, b) => a.time.localeCompare(b.time))
        })).filter(d => d.slots.length > 0);
    }, [displayData]);

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="h-32 bg-gray-100 dark:bg-gray-800 animate-pulse" />
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-gray-100 dark:bg-gray-800 animate-pulse" />)}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-32" dir="rtl">

            {/* ═══════════════ PREMIUM PARENT HEADER ═══════════════ */}
            <div className="relative overflow-hidden rounded-none bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-5 lg:p-8 shadow-2xl shadow-indigo-500/10 border-l border-t border-white/10">
                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none" 
                    style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary-500/10 rounded-full blur-[80px]" />
                
                <div className="relative z-10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <motion.div 
                            className="shrink-0 w-16 h-16 bg-gradient-to-br from-primary-500 to-indigo-600 p-0.5 rounded-none shadow-lg shadow-primary-500/20"
                        >
                            <div className="w-full h-full bg-slate-900/40 backdrop-blur-md rounded-none flex items-center justify-center border border-white/20">
                                <Users size={32} className="text-white" strokeWidth={1.5} />
                            </div>
                        </motion.div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-1.5">
                                <span className="px-2 py-0.5 bg-white/10 backdrop-blur-md text-white text-[9px] font-bold uppercase tracking-wider rounded-none border border-white/10 italic">مركز المتابعة الذكي</span>
                                <div className="flex gap-1">
                                    {[1,2,3].map(i => <div key={i} className="w-1 h-1 bg-emerald-500 rounded-none animate-pulse" style={{ animationDelay: `${i*0.2}s` }} />)}
                                </div>
                            </div>
                            <h1 className="text-xl md:text-3xl font-black text-white leading-tight">بوابة المتابعة الذكية</h1>
                            <p className="text-slate-400 text-xs md:text-sm font-medium flex items-center gap-2 mt-0.5">
                                <ShieldCheck size={16} className="text-primary-400" /> أهلاً بك، أ/ {currentUser?.name}
                            </p>
                        </div>
                    </div>

                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center justify-between md:justify-start gap-4 bg-white/5 backdrop-blur-xl border border-white/10 p-5 rounded-none w-full md:w-auto md:min-w-[200px] shadow-sm"
                    >
                        <div className="flex-1 text-right">
                            <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1 italic">إجمالي الأبناء</span>
                            <div className="text-3xl md:text-4xl font-black text-white leading-none">{children.length}</div>
                        </div>
                        <div className="w-12 h-12 bg-white/10 flex items-center justify-center border border-white/20">
                             <Users size={24} className="text-white" />
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* ═══════════════ STRATEGIC INTELLIGENCE GRID ═══════════════ */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Excellence Radar */}
                <div className="lg:col-span-8 bg-slate-900 border border-slate-800 p-6 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-full h-full opacity-[0.03] pointer-events-none" 
                         style={{ backgroundImage: 'radial-gradient(circle at 10px 10px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
                    
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2 bg-primary-600/20 text-primary-400 border border-primary-500/20">
                                <Trophy size={20} className="animate-pulse" />
                            </div>
                            <h3 className="font-black text-lg text-white uppercase italic tracking-tight">رادار التميز الأسبوعي</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {children.filter(c => c.totalPoints > 0).slice(0, 2).map((child) => (
                                <motion.div 
                                    key={child.id} 
                                    whileHover={{ x: -5 }}
                                    className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-none group/card transition-all hover:bg-white/10"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-amber-500/20 to-yellow-500/10 border border-amber-500/30 flex items-center justify-center">
                                            <Star size={24} className="text-yellow-400 fill-current opacity-80" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-black text-slate-200">{child.name}</h4>
                                            <p className="text-[10px] font-bold text-amber-500 uppercase mt-1">إنجاز دراسي متميز</p>
                                        </div>
                                    </div>
                                    <div className="text-left">
                                        <span className="text-2xl font-black italic text-emerald-400">+50</span>
                                        <p className="text-[8px] font-black uppercase text-slate-500 tracking-widest leading-none">نقطة</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-between">
                            <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">تحديث البيانات: فوري</div>
                            <button className="group text-[10px] font-black text-primary-400 hover:text-white uppercase italic flex items-center gap-1 transition-all">
                                عرض كافة الإنجازات <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Metrics */}
                <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between shadow-xl">
                    <div>
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2 bg-slate-900 dark:bg-white/10 dark:text-white rounded-none">
                                <Activity size={20} strokeWidth={2.5} />
                            </div>
                            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase italic tracking-tight">مؤشرات الأداء</h3>
                        </div>

                        <div className="space-y-6">
                            <div className="group">
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">معدل الانضباط</span>
                                    <span className="text-xl font-black text-slate-900 dark:text-emerald-400 italic">{stats.attendanceRate}%</span>
                                </div>
                                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 overflow-hidden rounded-none">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${stats.attendanceRate}%` }}
                                        className="h-full bg-emerald-500"
                                    />
                                </div>
                            </div>

                            <div className="group">
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">كفاءة الرصيد</span>
                                    <span className="text-xl font-black text-slate-900 dark:text-primary-400 italic">{stats.sessionsTotal > 0 ? Math.round((stats.sessionsUsed / stats.sessionsTotal) * 100) : 0}%</span>
                                </div>
                                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 overflow-hidden rounded-none">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${stats.sessionsTotal > 0 ? (stats.sessionsUsed / stats.sessionsTotal) * 100 : 0}%` }}
                                        className="h-full bg-primary-600"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 p-3 bg-slate-50 dark:bg-slate-800/50 border-r-4 border-emerald-500 text-center">
                        <span className="text-[10px] font-black dark:text-slate-300 uppercase tracking-[2px]">الحالة: استقرار عملياتي</span>
                    </div>
                </div>
            </div>

            {/* ═══════════════ HERO PROGRESS SECTION ═══════════════ */}
            <div>
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-primary-600 text-white rounded-none">
                        <Trophy size={18} />
                    </div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic">مستويات أبطال الدارين</h2>
                </div>
                <ParentChildVisualProgress 
                    childrenProfiles={children.map(c => ({
                        id: c.id, name: c.name, totalPoints: c.totalPoints || 0,
                        badges: (() => {
                            if (!c.badges) return [];
                            try {
                                const parsed = JSON.parse(c.badges);
                                return Array.isArray(parsed) ? parsed.map((b: any) => b.name) : [];
                            } catch (e) { return c.badges.split(',').filter((b: string) => b); }
                        })(),
                        teacherName: (c.enrollments && c.enrollments[0]?.teacher) || 'المعلمة المشرفة',
                        lastEvaluation: 'امتياز', adminPhone: adminPhone || ''
                    }))}
                />
            </div>

            {/* ═══════════════ STAT CARDS ═══════════════ */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 <StatCard icon={Calendar} label="العمليات" value={stats.sessionCount} color="amber" subValue={`${stats.upcomingSessions} مهمة`} onClick={() => navigate('/parent-attendance')} />
                 <StatCard icon={Users} label="الأبناء" value={stats.childCount} color="emerald" subValue="قطاع النجاح" onClick={() => navigate('/parent-students')} />
                 <StatCard icon={Award} label="التقارير" value="سجل كامل" color="blue" subValue="متابعة دورية" onClick={() => navigate('/evaluations')} />
                 <StatCard icon={Receipt} label="المالية" value={stats.pendingInvoiceCount} color="rose" subValue={stats.totalPending > 0 ? `${stats.totalPending} ج.م` : 'مكتمل'} onClick={() => navigate('/student-invoices')} />
            </div>

            {/* ═══════════════ LOWER OPERATIONS GRID ═══════════════ */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Schedule Container */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
                    <div className="p-6 border-b dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
                        <h4 className="font-black text-lg uppercase tracking-tight text-slate-900 dark:text-white flex items-center gap-3 italic leading-none">
                            <CalendarDays className="text-primary-600" size={24} />
                            {showAllDays ? 'خريطة المهام' : `مهمات (${todayArabic})`}
                        </h4>
                        <button
                            onClick={() => setShowAllDays(!showAllDays)}
                            className="px-4 py-1.5 bg-slate-900 dark:bg-primary-600 text-white font-black text-[10px] uppercase italic transition-all hover:opacity-90"
                        >
                            {showAllDays ? 'اليوم الحالي' : 'عرض الكل'}
                        </button>
                    </div>
                    
                    <div className="p-6 max-h-[400px] overflow-y-auto no-scrollbar">
                        <div className="space-y-4">
                            {(showAllDays ? weeklySchedule : weeklySchedule.filter(d => d.day === todayArabic)).map((dayData, idx) => (
                                <div key={idx} className="bg-white dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 p-4 shadow-sm relative">
                                    <div className="flex items-center gap-2 mb-4 font-black text-slate-900 dark:text-white italic border-b dark:border-slate-700 pb-2">
                                        <h5 className="text-sm">{dayData.day}</h5>
                                    </div>
                                    <div className="space-y-3">
                                        {dayData.slots.map((slot, sIdx) => (
                                            <div key={sIdx} className="bg-slate-50 dark:bg-slate-900/50 p-3 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4 group transition-all">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                                                        <User size={14} className="text-primary-600" />
                                                    </div>
                                                    <div>
                                                        <span className="text-xs font-black text-slate-900 dark:text-slate-200 block">{slot.studentName}</span>
                                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{slot.subject}</span>
                                                    </div>
                                                </div>
                                                <div className="px-2 py-1 bg-slate-900 dark:bg-slate-700 text-white text-[10px] font-black italic">
                                                    {slot.time} {slot.period === 'am' ? 'ص' : 'م'}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Invoices Container */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
                    <div className="p-6 border-b dark:border-slate-800 flex items-center bg-slate-50/50 dark:bg-slate-800/50">
                        <h4 className="font-black text-lg uppercase tracking-tight text-slate-900 dark:text-white flex items-center gap-3 italic leading-none">
                            <Receipt className="text-rose-600" size={24} />
                            سجل المستحقات المالية
                        </h4>
                    </div>
                    <div className="p-6 max-h-[400px] overflow-y-auto no-scrollbar">
                        <div className="space-y-4">
                            {displayData.invoices.filter(i => i.status === 'unpaid').map((invoice) => (
                                <div key={invoice.id} className="p-5 bg-white dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 shadow-sm group hover:translate-x-1 transition-all">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <p className="text-xs font-black text-slate-900 dark:text-white uppercase italic">كشف {invoice.month}/{invoice.year}</p>
                                            <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">{invoice.studentName}</p>
                                        </div>
                                        <div className="w-10 h-10 bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
                                            <Target size={20} className="text-rose-600" />
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between border-t dark:border-slate-700 pt-4 font-black">
                                        <div className="text-left font-black tracking-tight">
                                            <span className="text-sm text-slate-400 ml-1 italic">ج.م</span>
                                            <span className="text-2xl text-rose-600">{invoice.amount}</span>
                                        </div>
                                        <button className="px-3 py-1.5 bg-rose-600 text-white text-[10px] font-black uppercase italic shadow-lg shadow-rose-500/20">سداد الآن</button>
                                    </div>
                                </div>
                            ))}
                            {displayData.invoices.filter(i => i.status === 'unpaid').length === 0 && (
                                <div className="py-20 text-center opacity-30 flex flex-col items-center">
                                    <CheckCircle2 size={48} className="mb-4 text-emerald-500" />
                                    <p className="text-xs font-black italic">الحساب المالي مكتمل حالياً</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Support Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <motion.a
                    whileHover={{ scale: 1.02 }}
                    href={`https://wa.me/${adminPhone?.replace(/\D/g, '').replace(/^0/, '20')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex bg-slate-900 p-6 border border-slate-800 shadow-2xl text-white group"
                >
                    <div className="flex items-center gap-6">
                        <div className="w-12 h-12 bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                            <Headset size={24} className="text-emerald-400" />
                        </div>
                        <div>
                            <h4 className="font-black text-sm uppercase italic">قناة الدعم الفني</h4>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">مساعدة فورية عبر واتساب</p>
                        </div>
                    </div>
                </motion.a>
                
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xl flex items-center gap-6">
                    <div className="w-12 h-12 bg-primary-600/10 flex items-center justify-center border border-primary-600/20">
                        <Star size={24} className="text-primary-600" />
                    </div>
                    <div>
                        <h4 className="font-black text-sm text-slate-900 dark:text-white uppercase italic">نظام جودة التعليم</h4>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">خوارزميات ذكية لتتبع النمو</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ icon: Icon, label, value, color, subValue, onClick }: any) => {
    const colors: any = {
        blue: "from-blue-500/10 via-white to-white dark:from-blue-500/5 dark:via-slate-900 dark:to-slate-900 shadow-blue-500/5 border-blue-500/20",
        amber: "from-amber-500/10 via-white to-white dark:from-amber-500/5 dark:via-slate-900 dark:to-slate-900 shadow-amber-500/5 border-amber-500/20",
        emerald: "from-emerald-500/10 via-white to-white dark:from-emerald-500/5 dark:via-slate-900 dark:to-slate-900 shadow-emerald-500/5 border-emerald-500/20",
        rose: "from-rose-500/10 via-white to-white dark:from-rose-500/5 dark:via-slate-900 dark:to-slate-900 shadow-rose-500/5 border-rose-500/20",
    };
    const iconStyles: any = {
        blue: "bg-blue-500/20 text-blue-600 dark:text-blue-400",
        amber: "bg-amber-500/20 text-amber-600 dark:text-amber-400",
        emerald: "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400",
        rose: "bg-rose-500/20 text-rose-600 dark:text-rose-400",
    };

    return (
        <motion.div
            whileHover={{ y: -5 }}
            onClick={onClick}
            className={cn(
                "p-4 md:p-6 rounded-none border bg-gradient-to-br shadow-xl transition-all",
                colors[color],
                onClick && "cursor-pointer"
            )}
        >
            <div className="flex flex-col gap-4">
                <div className={cn("w-10 h-10 md:w-12 md:h-12 flex items-center justify-center border border-white/10 shadow-sm", iconStyles[color])}>
                    <Icon size={24} strokeWidth={2} />
                </div>
                <div>
                    <p className="text-[8px] md:text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1 leading-none italic">{label}</p>
                    <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase leading-none">{value}</h3>
                    {subValue && <p className="text-[8px] md:text-[10px] font-black text-primary-600 dark:text-primary-400 mt-2 italic uppercase tracking-widest leading-none">{subValue}</p>}
                </div>
            </div>
        </motion.div>
    );
};
