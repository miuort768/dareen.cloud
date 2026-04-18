import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

import {
    Users,
    Calendar,
    Receipt,
    CalendarDays,
    Headset,
    Activity,
    Star,
    Award,
    Trophy,
    User,
    LogOut
} from 'lucide-react';
import { api } from '../lib/api';
import { useApp } from '../context/AppContext';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
// ParentDashboard

export const ParentDashboard = () => {
    const { currentUser, adminPhone, logout } = useApp();
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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-8">
                <div className="h-48 bg-gray-100 animate-pulse" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-gray-100 animate-pulse" />)}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="h-64 bg-gray-100 animate-pulse" />
                    <div className="h-64 bg-gray-100 animate-pulse" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/50 pb-20 pt-4 md:pt-10" dir="rtl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-in fade-in duration-700">
                
                {/* ═══════════════ NEW MINIMALIST HEADER ═══════════════ */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 md:p-8 border border-slate-100 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-1 h-full bg-primary-600"></div>
                    <div className="relative z-10">
                        <p className="text-gray-400 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-1">مرحباً بك مجدداً،</p>
                        <h1 className="text-2xl md:text-3xl font-black text-gray-900 flex items-center gap-3">
                            أ/ {currentUser?.name}
                            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
                        </h1>
                        <div className="flex items-center gap-4 mt-3">
                            <div className="flex items-center gap-2 px-3 py-1 bg-primary-50 text-primary-700 rounded-none text-[10px] font-black border border-primary-100">
                                <Users size={12} />
                                إجمالي الأبناء: {children.length}
                            </div>
                            <div className="text-[10px] text-gray-400 font-bold flex items-center gap-1">
                                <Calendar size={12} /> {format(new Date(), 'eeee, d MMMM', { locale: ar })}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                         <button 
                            onClick={() => window.open(`https://wa.me/${adminPhone?.replace(/\D/g, '').replace(/^0/, '20')}`, '_blank')}
                            className="p-3 bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-600 hover:text-white transition-all group"
                            title="الدعم الفني"
                        >
                            <Headset size={20} className="group-hover:rotate-12 transition-transform" />
                        </button>
                        <button 
                            onClick={logout}
                            className="p-3 bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-600 hover:text-white transition-all group"
                            title="تسجيل الخروج"
                        >
                            <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>

                {/* ═══════════════ CORE STATS AUTO GRID ═══════════════ */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                     <StatCardV2 icon={Users} label="الأبناء" value="قطاع النجاح" color="indigo" onClick={() => navigate('/parent-students')} />
                     <StatCardV2 icon={CalendarDays} label="العمليات" value={`${stats.upcomingSessions} مهمة`} color="primary" onClick={() => navigate('/parent-attendance')} />
                     <StatCardV2 icon={Award} label="التقارير" value="سجل كامل" color="blue" onClick={() => navigate('/evaluations')} />
                     <StatCardV2 icon={Receipt} label="المالية" value={stats.totalPending > 0 ? "يوجد مستحقات" : "مكتمل"} color="rose" onClick={() => navigate('/student-invoices')} />
                </div>

                {/* ═══════════════ PERFORMANCE & INTELLIGENCE ═══════════════ */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
                    
                    {/* Metrics Panel - Left Side on Desktop */}
                    <div className="lg:col-span-8 space-y-8">
                        {/* Performance Indicators Card */}
                        <div className="bg-white border border-slate-100 p-6 md:p-8 shadow-sm group">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-slate-900 text-white">
                                        <Activity size={20} />
                                    </div>
                                    <h3 className="text-lg font-black text-gray-900 italic uppercase">مؤشرات الأداء العامة</h3>
                                </div>
                                <div className="hidden md:flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-r-2 border-primary-600 pr-3">
                                    بيانات حية محدثة دقيقة
                                </div>
                            </div>

                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-end">
                                        <span className="text-xs font-black text-gray-500 uppercase">معدل الانضباط التراكمي</span>
                                        <span className="text-2xl font-black text-emerald-600 italic tracking-tighter">{stats.attendanceRate}%</span>
                                    </div>
                                    <div className="h-1.5 bg-gray-100 overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${stats.attendanceRate}%` }}
                                            className="h-full bg-emerald-500 relative"
                                        >
                                            <div className="absolute top-0 right-0 w-20 h-full bg-white/20 blur-md"></div>
                                        </motion.div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-end">
                                        <span className="text-xs font-black text-gray-500 uppercase">كفاءة استخدام الرصيد</span>
                                        <span className="text-2xl font-black text-primary-600 italic tracking-tighter">{stats.sessionsTotal > 0 ? Math.round((stats.sessionsUsed / stats.sessionsTotal) * 100) : 0}%</span>
                                    </div>
                                    <div className="h-1.5 bg-gray-100 overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${stats.sessionsTotal > 0 ? (stats.sessionsUsed / stats.sessionsTotal) * 100 : 0}%` }}
                                            className="h-full bg-primary-600"
                                        />
                                    </div>
                                </div>

                                {/* Operational Status Badge */}
                                <div className="mt-8 p-5 bg-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4 border-r-4 border-emerald-500 group-hover:bg-emerald-50/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                        <span className="text-xs font-black text-gray-900 uppercase">الحالة التشغيلية للملف التعليمي</span>
                                    </div>
                                    <span className="text-[10px] md:text-xs font-black text-emerald-700 bg-white px-4 py-1.5 shadow-sm border border-emerald-100 uppercase tracking-widest italic">استقرار عملياتي كامل</span>
                                </div>
                            </div>
                        </div>

                        {/* Schedule Section */}
                        <div className="bg-white border border-slate-100 overflow-hidden shadow-sm">
                            <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                                <div className="flex items-center gap-3">
                                    <CalendarDays className="text-primary-600" size={22} />
                                    <h4 className="font-black text-lg text-gray-900 italic uppercase">
                                        {showAllDays ? 'خريطة المهام الكاملة' : `مهام اليوم (${todayArabic})`}
                                    </h4>
                                </div>
                                <button
                                    onClick={() => setShowAllDays(!showAllDays)}
                                    className="text-[10px] font-black uppercase text-primary-600 hover:text-primary-700 underline underline-offset-4 tracking-widest transition-all"
                                >
                                    {showAllDays ? 'عرض اليوم فقط' : 'عرض الجدول الكامل'}
                                </button>
                            </div>
                            
                            <div className="p-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto max-h-[400px] no-scrollbar">
                                    {(showAllDays ? weeklySchedule : weeklySchedule.filter(d => d.day === todayArabic)).map((dayData, idx) => (
                                        <div key={idx} className="space-y-4">
                                            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                                                <div className="w-1.5 h-1.5 bg-primary-600"></div>
                                                <h5 className="text-xs font-black text-gray-900 uppercase italic tracking-tighter">{dayData.day}</h5>
                                            </div>
                                            <div className="space-y-3">
                                                {dayData.slots.map((slot, sIdx) => (
                                                    <div key={sIdx} className="bg-gray-50 p-4 border border-gray-100 flex items-center justify-between gap-4 group/item hover:bg-white hover:border-primary-500 transition-all">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 bg-white border border-gray-200 flex items-center justify-center text-primary-600 shadow-sm group-hover/item:rotate-12 transition-transform">
                                                                <User size={14} />
                                                            </div>
                                                            <div>
                                                                <span className="text-xs font-black text-gray-950 block leading-tight">{slot.studentName}</span>
                                                                <span className="text-[9px] text-gray-400 font-bold uppercase mt-1 block">{slot.subject}</span>
                                                            </div>
                                                        </div>
                                                        <div className="px-3 py-1 bg-gray-900 text-white text-[9px] font-black italic tracking-widest">
                                                            {slot.time} {slot.period === 'am' ? 'ص' : 'م'}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                    {(showAllDays ? weeklySchedule : weeklySchedule.filter(d => d.day === todayArabic)).length === 0 && (
                                        <div className="col-span-full py-12 text-center bg-gray-50 border-2 border-dashed border-gray-200">
                                            <Calendar size={32} className="mx-auto text-gray-200 mb-3" />
                                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">لا توجد مهام مجدولة لهذا اليوم</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Financial & Support - Right Side on Desktop */}
                    <div className="lg:col-span-4 space-y-8">
                        {/* Excellence Radar Mini */}
                        <div className="bg-gradient-to-br from-gray-900 to-indigo-950 p-8 shadow-2xl relative overflow-hidden group">
                           <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                           <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-6">
                                    <Trophy size={20} className="text-amber-500" />
                                    <h3 className="text-sm font-black text-white uppercase italic tracking-tighter">رادار التميز</h3>
                                </div>
                                <div className="space-y-4">
                                    {children.filter(c => c.totalPoints > 0).slice(0, 3).map((child) => (
                                        <div key={child.id} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs">⭐</div>
                                                <span className="text-xs font-bold text-gray-300">{child.name}</span>
                                            </div>
                                            <span className="text-lg font-black text-emerald-400 italic">+{child.totalPoints}</span>
                                        </div>
                                    ))}
                                    {children.filter(c => c.totalPoints > 0).length === 0 && (
                                        <p className="text-[10px] text-gray-500 italic">في انتظار تسجيل الإنجازات الأولية</p>
                                    )}
                                </div>
                           </div>
                        </div>

                        {/* Financial Ledger Card (Inspired by user image) */}
                        <div className="bg-indigo-600 p-8 shadow-xl relative overflow-hidden group min-h-[220px] flex flex-col justify-between">
                            <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>
                            <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
                            
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="p-3 bg-white/10 backdrop-blur-md">
                                        <Receipt size={24} className="text-white" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[10px] text-indigo-100 font-bold uppercase tracking-widest leading-none">حالة الحساب المالي</p>
                                        <h4 className="text-2xl font-black text-white italic mt-1">{stats.totalPending > 0 ? 'مستحق سداد' : 'مكتمل حالياً'}</h4>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-white/10">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-[9px] text-indigo-200 font-black uppercase tracking-widest mb-1 italic">لا توجد مستحقات معلقة</p>
                                            <p className="text-indigo-50 text-xs font-medium">نظام المالية يعمل بكفاءة</p>
                                        </div>
                                        <button 
                                            onClick={() => navigate('/student-invoices')}
                                            className="px-6 py-2 bg-white text-indigo-600 font-black text-[10px] uppercase tracking-widest hover:bg-indigo-50 transition-all shadow-lg"
                                        >
                                            التفاصيل
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Support Card */}
                        <div className="bg-white border border-slate-100 p-6 shadow-sm flex items-center gap-6 group hover:bg-slate-900 hover:text-white transition-all duration-500 cursor-pointer">
                            <div className="w-12 h-12 bg-primary-600/10 flex items-center justify-center text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-all">
                                <Headset size={24} strokeWidth={1.5} />
                            </div>
                            <div>
                                <h4 className="font-black text-sm uppercase italic tracking-tighter">قناة الدعم الإستراتيجي</h4>
                                <p className="text-[10px] text-gray-500 font-bold uppercase mt-1 tracking-widest group-hover:text-gray-400">مساعدة فورية وتقارير مفسرة</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ═══════════════ ELITE HEROES CENTERS (UPDATED DESIGN) ═══════════════ */}
                <div className="pt-12 border-t border-slate-200">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">مراكز الأبطال النخبويين</h2>
                                <div className="w-8 h-8 rounded-full border-2 border-primary-600 flex items-center justify-center text-primary-600">
                                    <Star size={16} className="fill-current" />
                                </div>
                            </div>
                            <p className="text-gray-400 text-xs md:text-sm font-bold">تتبع تقدمك، احصل على أوسمتك وارتق في مراتب النخبة.</p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                        {children.map((child) => {
                             const points = child.totalPoints || 0;
                             const getStatus = (p: number) => {
                                 if (p >= 1000) return { name: 'البروفيسور النخبوي', rank: 'مخضرم', nextGoal: 2500, icon: '👑' };
                                 if (p >= 500) return { name: 'المجتهد الذكي', rank: 'متقدم', nextGoal: 1000, icon: '🚀' };
                                 return { name: 'الباحث المستكشف', rank: 'مبتدئ', nextGoal: 100, icon: '🧭' };
                             };
                             const status = getStatus(points);
                             const progress = Math.min(Math.round((points / status.nextGoal) * 100), 100);

                             return (
                                 <motion.div 
                                    key={child.id}
                                    whileHover={{ y: -5 }}
                                    className="bg-white border border-slate-100 p-8 shadow-sm relative group overflow-hidden"
                                 >
                                    <div className="flex justify-between items-start mb-8">
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-primary-600 uppercase tracking-widest mb-1 italic">الحالة العملياتية</p>
                                            <h4 className="text-xl font-black text-gray-900 mb-1">{status.name}</h4>
                                            <h5 className="text-2xl font-black text-gray-900">{child.name}</h5>
                                        </div>
                                        
                                        {/* Circular Avatar with Point Badge */}
                                        <div className="relative">
                                            <div className="w-20 h-20 rounded-full border-[3px] border-primary-100 p-1 bg-white overflow-hidden shadow-inner">
                                                <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-3xl">
                                                    <User className="text-white/20" size={40} />
                                                </div>
                                            </div>
                                            <div className="absolute -bottom-1 -right-2 bg-rose-600 text-white text-[9px] font-black px-2 py-1 rounded-full shadow-lg border-2 border-white">
                                                PT {points}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Progress Section */}
                                    <div className="space-y-4 mb-8">
                                        <div className="flex justify-between items-end">
                                            <div className="text-right">
                                                <p className="text-[10px] font-black text-gray-900 uppercase italic">مستوى كفاءة التعلم</p>
                                                <p className="text-[9px] font-bold text-gray-400 mt-0.5">بانتظار {status.nextGoal - points} نقطة للترقية</p>
                                            </div>
                                            <span className="text-2xl font-black text-primary-700 italic">{progress}%</span>
                                        </div>
                                        <div className="h-2.5 bg-slate-100 overflow-hidden relative">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${progress}%` }}
                                                className="h-full bg-gradient-to-l from-primary-400 to-primary-700 relative"
                                            >
                                                <div className="absolute inset-0 bg-white/20 blur-sm animate-pulse"></div>
                                            </motion.div>
                                        </div>
                                    </div>

                                    {/* Footer Info */}
                                    <div className="flex justify-between items-center pt-6 border-t border-slate-50">
                                        <div className="text-right">
                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">الهدف</p>
                                            <p className="text-sm font-black text-gray-900">{status.nextGoal} نقطة</p>
                                        </div>
                                        <div className="text-left">
                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1 text-left">الرتبة الدنيا</p>
                                            <p className="text-sm font-black text-gray-900">{status.rank}</p>
                                        </div>
                                    </div>
                                 </motion.div>
                             );
                        })}
                    </div>
                </div>

            </div>
        </div>
    );
};

const StatCardV2 = ({ icon: Icon, label, value, color, onClick }: any) => {
    const colorClasses: any = {
        primary: "bg-primary-50 text-primary-700 border-primary-100 hover:bg-primary-600 hover:text-white",
        indigo: "bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-600 hover:text-white",
        blue: "bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-600 hover:text-white",
        rose: "bg-rose-50 text-rose-700 border-rose-100 hover:bg-rose-600 hover:text-white",
    };

    return (
        <motion.div
            whileHover={{ y: -5 }}
            onClick={onClick}
            className={cn(
                "bg-white border border-slate-100 p-6 md:p-8 shadow-sm flex flex-col gap-4 group transition-all duration-500 cursor-pointer overflow-hidden relative"
            )}
        >
            <div className={cn("w-12 h-12 flex items-center justify-center transition-all duration-500 shadow-sm", colorClasses[color])}>
                <Icon size={24} strokeWidth={1.5} />
            </div>
            <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 leading-none">{label}</p>
                <h3 className="text-lg md:text-xl font-black text-gray-900 italic tracking-tighter leading-none group-hover:translate-x-1 transition-transform">{value}</h3>
            </div>
            <div className="absolute -bottom-2 -left-2 w-12 h-12 bg-gray-50/50 group-hover:bg-primary-600/10 transition-colors rotate-45"></div>
        </motion.div>
    );
};
