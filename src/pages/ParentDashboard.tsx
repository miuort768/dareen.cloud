import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

import {
    Users,
    Calendar,
    AlertCircle,
    Receipt,
    Bell,
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
    User
} from 'lucide-react';
import { api } from '../lib/api';
import { useApp } from '../context/AppContext';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { ParentExcellenceRadar } from '../features/dashboard/components/ParentExcellenceRadar';
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
            <div className="space-y-6">
                <div className="h-48 bg-gray-100 dark:bg-gray-800 animate-pulse" />
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-gray-100 dark:bg-gray-800 animate-pulse" />)}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-10 pb-32" dir="rtl">

            {/* Cyber-Brutalist Dashboard Header */}
            <div className="relative bg-gray-950 p-8 lg:p-12 border-8 border-gray-950 shadow-[12px_12px_0px_0px_#ef4444] overflow-hidden mb-12">
                <div className="absolute top-0 right-0 w-full h-full opacity-[0.05] pointer-events-none" 
                     style={{ backgroundImage: 'linear-gradient(#fff 2px, transparent 2px), linear-gradient(90deg, #fff 2px, transparent 2px)', backgroundSize: '40px 40px' }} />
                
                <div className="relative z-10 flex flex-col md:flex-row items-start justify-between gap-10">
                    <div className="flex items-center gap-8">
                        <div className="relative">
                            <motion.div 
                                whileHover={{ rotate: -5, scale: 1.05 }}
                                className="w-24 h-24 bg-primary-600 text-white border-4 border-gray-950 shadow-[6px_6px_0px_0px_white] flex items-center justify-center transform -rotate-3"
                            >
                                <Users size={48} strokeWidth={3} />
                            </motion.div>
                            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 border-4 border-gray-950 animate-pulse" />
                        </div>
                        
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="px-4 py-1.5 bg-primary-600 text-white text-[10px] font-black uppercase tracking-widest italic border-b-2 border-white">بوابة المتابعة الذكية</span>
                                <div className="flex gap-1">
                                    {[1,2,3].map(i => <div key={i} className="w-2 h-2 bg-emerald-500 animate-ping" style={{ animationDelay: `${i*0.2}s` }} />)}
                                </div>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase italic leading-none mb-4">لوحة تحكم الأبطال</h1>
                            <p className="text-gray-400 text-base font-black flex items-center gap-3 uppercase tracking-wider">
                                <ShieldCheck size={20} className="text-primary-500" />
                                أهلاً بك، أ/ {currentUser?.name}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 w-full md:w-auto">
                        {children.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {children.map((child: any) => (
                                    <motion.div 
                                        key={child.id}
                                        whileHover={{ x: -5 }}
                                        className="bg-white/5 border-2 border-white/20 p-4 flex items-center justify-between gap-6 backdrop-blur-sm group hover:border-emerald-500 transition-all"
                                    >
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 italic">المستوى الحالي: {child.grade}</span>
                                            <span className="text-lg font-black text-white uppercase italic">{child.name}</span>
                                        </div>
                                        <div className="text-left">
                                            <div className="text-2xl font-black text-emerald-400 tracking-tighter flex items-center gap-2 justify-end">
                                                {child.totalPoints || 0}
                                                <Star size={20} className="fill-current" />
                                            </div>
                                            <span className="text-[9px] font-black text-emerald-500/50 uppercase tracking-widest">نقطة تميز</span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Strategic Insights Radar */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ParentExcellenceRadar 
                    achievements={children
                        .filter(c => c.totalPoints > 0)
                        .slice(0, 2)
                        .map(c => ({
                            id: c.id,
                            studentName: c.name,
                            achievement: 'إتمام المرحلة الدراسية بامتياز',
                            date: 'اليوم',
                            points: c.totalPoints > 50 ? 50 : c.totalPoints
                        }))
                    }
                />
                
                <div className="bg-white border-8 border-gray-950 p-8 shadow-[10px_10px_0px_0px_#3b82f6] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-full bg-gray-50 -skew-x-12 translate-x-12 pointer-events-none" />
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-gray-950 text-white transform -rotate-6">
                            <Activity size={24} strokeWidth={3} />
                        </div>
                        <h2 className="text-2xl font-black text-gray-950 uppercase italic tracking-tighter">تحليل الأداء الرقمي</h2>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                        <div className="p-6 bg-gray-50 border-r-8 border-primary-600">
                            <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">معدل الانضباط</span>
                            <div className="text-4xl font-black text-gray-950 italic">{stats.attendanceRate}%</div>
                            <div className="w-full h-1 bg-gray-200 mt-3 relative">
                                <div className="absolute top-0 right-0 h-full bg-primary-600 transition-all" style={{ width: `${stats.attendanceRate}%` }} />
                            </div>
                        </div>
                        <div className="p-6 bg-gray-50 border-r-8 border-emerald-500">
                            <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">الرصيد المتبقي</span>
                            <div className="text-4xl font-black text-gray-950 italic">{stats.sessionsTotal - stats.sessionsUsed}</div>
                            <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">حصة متوفرة حالياً</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hero Levels Section */}
            <div className="mb-12">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-4 bg-gray-950 text-white transform rotate-2">
                        <Trophy size={28} />
                    </div>
                    <h2 className="text-3xl font-black text-gray-950 dark:text-white uppercase tracking-tighter italic">مستويات الأبطال (Heroes Progress)</h2>
                </div>
                
                <ParentChildVisualProgress 
                    childrenProfiles={children.map(c => ({
                        id: c.id,
                        name: c.name,
                        totalPoints: c.totalPoints || 0,
                        badges: (() => {
                            if (!c.badges) return [];
                            try {
                                const parsed = JSON.parse(c.badges);
                                return Array.isArray(parsed) ? parsed.map((b: any) => b.name) : [];
                            } catch (e) {
                                return c.badges.split(',').filter((b: string) => b);
                            }
                        })(),
                        teacherName: (c.enrollments && c.enrollments[0]?.teacher) || 'المعلمة المشرفة',
                        lastEvaluation: 'امتياز',
                        adminPhone: adminPhone || ''
                    }))}
                />
            </div>

            {/* Operations Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 <StatCard
                    icon={Calendar}
                    label="العمليات الدراسية"
                    value={stats.sessionCount}
                    color="amber"
                    subValue={`${stats.upcomingSessions} مهمة قادمة`}
                    onClick={() => navigate('/parent-attendance')}
                />
                <StatCard
                    icon={Users}
                    label="إجمالي الأبناء"
                    value={stats.childCount}
                    color="emerald"
                    subValue="قطاع الأبطال"
                    onClick={() => navigate('/parent-students')}
                />
                <StatCard
                    icon={Award}
                    label="التقارير النوعية"
                    value="عرض الكل"
                    color="blue"
                    subValue="تقييمات القيادة"
                    onClick={() => navigate('/evaluations')}
                />
                <StatCard
                    icon={Receipt}
                    label="لوجستيات مالية"
                    value={stats.pendingInvoiceCount}
                    color="rose"
                    subValue={stats.totalPending > 0 ? `${stats.totalPending} ج.م معلقة` : 'الرصيد مستقر'}
                    onClick={() => navigate('/student-invoices')}
                />
            </div>

            {/* Critical Alerts Section */}
            {((displayData.students.some(s => (s.enrollments || []).some((en: any) => (Number(en.sessionsTotal) - Number(en.sessionsUsed)) <= 2))) || stats.pendingInvoiceCount > 0) && (
                <div className="bg-white border-8 border-gray-950 p-8 shadow-[10px_10px_0px_0px_#ef4444] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-full h-full opacity-5 pointer-events-none" 
                         style={{ backgroundImage: 'repeating-linear-gradient(45deg, #000 0, #000 1px, transparent 0, transparent 50%)', backgroundSize: '10px 10px' }} />
                    
                    <h4 className="font-black text-xs text-gray-400 uppercase tracking-[4px] mb-8 flex items-center justify-between">
                        تنبيهات حالة الاستعداد
                        <Bell size={20} className="text-rose-500 animate-ping" />
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
                        {displayData.students.map(student => {
                            const lowBalanceEnrollments = (student.enrollments || []).filter((en: any) => (Number(en.sessionsTotal) - Number(en.sessionsUsed)) <= 2);
                            return lowBalanceEnrollments.map((en: any, idx: number) => (
                                <div key={`${student.id}-${idx}`} className="p-6 bg-white border-4 border-gray-950 shadow-[6px_6px_0px_0px_#ef4444] flex items-start gap-6 group hover:translate-x-1 transition-all">
                                    <AlertCircle size={32} className="text-rose-600 mt-1 shrink-0" />
                                    <div>
                                        <p className="text-sm font-black text-gray-950 uppercase italic tracking-tighter mb-2">تجديد المهمة: {student.name}</p>
                                        <p className="text-[11px] text-gray-500 font-bold leading-relaxed">تبقى {Number(en.sessionsTotal) - Number(en.sessionsUsed)} حصص فقط في مادة {en.subject}. يرجى اتخاذ الإجراء اللازم.</p>
                                    </div>
                                </div>
                            ));
                        })}
                        {stats.pendingInvoiceCount > 0 && (
                            <div className="p-6 bg-white border-4 border-gray-950 shadow-[6px_6px_0px_0px_#f59e0b] flex items-start gap-6 group hover:translate-x-1 transition-all">
                                <AlertCircle size={32} className="text-amber-500 mt-1 shrink-0" />
                                <div>
                                    <p className="text-sm font-black text-gray-950 uppercase italic tracking-tighter mb-2">إجراء مالي مطلوب</p>
                                    <p className="text-[11px] text-gray-500 font-bold leading-relaxed">يوجد {stats.pendingInvoiceCount} فواتير بانتظار السداد بقيمة إجمالية {stats.totalPending.toLocaleString()} ج.م.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-10">
                    {/* Weekly Schedule Section */}
                    <div className="bg-white border-8 border-gray-950 shadow-[12px_12px_0px_0px_black] overflow-hidden">
                        <div className="p-8 border-b-8 border-gray-950 flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-gray-50">
                            <h4 className="font-black text-2xl uppercase tracking-tighter text-gray-950 flex items-center gap-4 italic">
                                <CalendarDays className="text-primary-600" size={32} />
                                {showAllDays ? 'خريطة المهام الأسبوعية' : `مهمات اليوم (${todayArabic})`}
                            </h4>
                            <button
                                onClick={() => setShowAllDays(!showAllDays)}
                                className="px-8 py-4 bg-gray-950 text-white border-4 border-gray-950 font-black text-xs uppercase italic shadow-[6px_6px_0px_0px_#ef4444] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
                            >
                                {showAllDays ? 'إظهار العمليات الحالية' : 'كشف المخطط الأسبوعي'}
                            </button>
                        </div>
                        
                        <div className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {(showAllDays ? weeklySchedule : weeklySchedule.filter(d => d.day === todayArabic)).map((dayData, idx) => (
                                    <div key={idx} className="bg-white border-4 border-gray-950 p-6 shadow-[6px_6px_0px_0px_#3b82f6]">
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="w-10 h-10 bg-gray-950 text-white flex items-center justify-center font-black italic">{dayData.day.substring(0, 1)}</div>
                                            <h5 className="font-black text-gray-950 uppercase italic tracking-tighter text-xl">{dayData.day}</h5>
                                        </div>
                                        <div className="space-y-4">
                                            {dayData.slots.map((slot, sIdx) => (
                                                <div key={sIdx} className="bg-gray-50 p-4 border-2 border-gray-950 flex items-center justify-between gap-4 group hover:bg-white transition-all">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <User size={14} className="text-primary-600" />
                                                            <span className="text-sm font-black text-gray-950">{slot.studentName}</span>
                                                        </div>
                                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{slot.subject} • {slot.teacher}</p>
                                                    </div>
                                                    <div className="px-3 py-1 bg-gray-950 text-white text-[10px] font-black italic">
                                                        {slot.time} {slot.period === 'am' ? 'ص' : 'م'}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                                {((showAllDays ? weeklySchedule : weeklySchedule.filter(d => d.day === todayArabic)).length === 0) && (
                                    <div className="col-span-full py-24 border-8 border-dashed border-gray-100 flex flex-col items-center justify-center grayscale opacity-30">
                                        <Clock size={80} className="mb-6" />
                                        <h3 className="text-3xl font-black text-gray-400 uppercase italic tracking-tighter">قنوات زمنية هادئة</h3>
                                        <p className="text-xs font-bold mt-4 uppercase tracking-[4px]">لا يوجد مهمات قيد التنفيذ حالياً</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-10">
                    <div className="bg-white border-8 border-gray-950 p-8 shadow-[12px_12px_0px_0px_#ef4444] relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-full h-full opacity-5 pointer-events-none" 
                             style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                        
                        <div className="relative z-10">
                            <h4 className="font-black text-2xl uppercase tracking-tighter text-gray-950 mb-8 italic flex items-center gap-4">
                                <Receipt className="text-primary-600" size={32} />
                                سجل المستحقات
                            </h4>
                            <div className="space-y-6">
                                {displayData.invoices.filter(i => i.status === 'unpaid').map((invoice) => (
                                    <div key={invoice.id} className="p-6 bg-gray-50 border-4 border-gray-950 shadow-[6px_6px_0px_0px_black] group hover:translate-x-1 transition-all">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <p className="text-sm font-black text-gray-950 uppercase italic tracking-tighter">كشف {invoice.month}/{invoice.year}</p>
                                                <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-widest">{invoice.studentName}</p>
                                            </div>
                                            <Target size={24} className="text-rose-600" />
                                        </div>
                                        <div className="flex items-center justify-between border-t-2 border-gray-200 pt-4">
                                            <p className="text-2xl font-black text-rose-600 tracking-tighter">{invoice.amount} ج.م</p>
                                            <span className="px-3 py-1 bg-rose-100 text-rose-600 text-[9px] font-black uppercase italic">متأخر</span>
                                        </div>
                                    </div>
                                ))}
                                {displayData.invoices.filter(i => i.status === 'unpaid').length === 0 && (
                                    <div className="py-12 text-center border-4 border-dashed border-gray-200">
                                        <CheckCircle2 size={48} className="mx-auto text-emerald-500 mb-4" />
                                        <p className="text-xs text-gray-400 font-black italic uppercase tracking-widest">السجل المالي مكتمل حالياً</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <a
                        href={`https://wa.me/${adminPhone?.replace(/\D/g, '').replace(/^0/, '20')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full block bg-gray-950 p-10 border-8 border-gray-950 shadow-[15px_15px_0px_0px_#25d366] text-white group hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                    >
                        <div className="flex flex-col items-center gap-6 text-center">
                            <div className="w-20 h-20 bg-white/10 flex items-center justify-center transform group-hover:rotate-12 transition-transform">
                                <Headset size={48} className="text-white" />
                            </div>
                            <div>
                                <h4 className="font-black text-2xl uppercase tracking-tighter mb-2 italic">خط الدعم المباشر</h4>
                                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-[4px]">تواصل مع إدارة المعهد فوراً</p>
                            </div>
                            <div className="px-6 py-2 bg-white text-gray-950 font-black text-[10px] uppercase tracking-widest">متاح الآن عبر واتساب</div>
                        </div>
                    </a>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ icon: Icon, label, value, color, subValue, onClick }: any) => {
    const colors: any = {
        blue: "bg-blue-600 shadow-[6px_6px_0px_0px_#1e3a8a]",
        amber: "bg-amber-500 shadow-[6px_6px_0px_0px_#92400e]",
        emerald: "bg-emerald-500 shadow-[6px_6px_0px_0px_#065f46]",
        rose: "bg-rose-500 shadow-[6px_6px_0px_0px_#9f1239]",
    };

    return (
        <motion.div
            whileHover={{ y: -5 }}
            onClick={onClick}
            className={cn(
                "p-8 bg-white border-8 border-gray-950 shadow-[10px_10px_0px_0px_black] transition-all",
                onClick && "cursor-pointer hover:shadow-none hover:translate-x-1 hover:translate-y-1"
            )}
        >
            <div className="flex flex-col gap-6">
                <div className={cn("w-14 h-14 flex items-center justify-center text-white transform -rotate-6 border-4 border-gray-950", colors[color])}>
                    <Icon size={32} strokeWidth={3} />
                </div>
                <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[3px] mb-2">{label}</p>
                    <h3 className="text-3xl font-black text-gray-950 tracking-tighter uppercase italic">{value}</h3>
                    {subValue && <p className="text-[10px] font-black text-primary-600 mt-2 italic uppercase tracking-widest">{subValue}</p>}
                </div>
            </div>
        </motion.div>
    );
};
