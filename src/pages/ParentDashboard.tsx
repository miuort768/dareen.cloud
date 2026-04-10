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
            <div className="space-y-4">
                <div className="h-32 bg-gray-100 dark:bg-gray-800 animate-pulse" />
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-gray-100 dark:bg-gray-800 animate-pulse" />)}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-24" dir="rtl">

            {/* Compact Cyber-Brutalist Dashboard Header */}
            <div className="relative bg-gray-950 p-6 lg:p-8 border-[6px] border-gray-950 shadow-[8px_8px_0px_0px_#ef4444] overflow-hidden mb-6">
                <div className="absolute top-0 right-0 w-full h-full opacity-[0.03] pointer-events-none" 
                     style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <div className="relative">
                            <motion.div 
                                whileHover={{ rotate: -5, scale: 1.05 }}
                                className="w-16 h-16 bg-primary-600 text-white border-[3px] border-gray-950 shadow-[4px_4px_0px_0px_white] flex items-center justify-center transform -rotate-2"
                            >
                                <Users size={32} strokeWidth={2.5} />
                            </motion.div>
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-gray-950 animate-pulse" />
                        </div>
                        
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="px-2 py-0.5 bg-primary-600 text-white text-[9px] font-black uppercase tracking-widest italic border-b border-white">مركز المتابعة</span>
                                <div className="flex gap-0.5">
                                    {[1,2,3].map(i => <div key={i} className="w-1.5 h-1.5 bg-emerald-500 animate-ping" style={{ animationDelay: `${i*0.2}s` }} />)}
                                </div>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tighter uppercase italic leading-none mb-2">بوابة المتابعة الذكية</h1>
                            <p className="text-gray-400 text-xs font-bold flex items-center gap-2 uppercase tracking-wider">
                                <ShieldCheck size={14} className="text-primary-500" />
                                أهلاً بك، أ/ {currentUser?.name}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 w-full md:w-auto">
                        {children.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {children.map((child: any) => (
                                    <motion.div 
                                        key={child.id}
                                        whileHover={{ x: -3 }}
                                        className="bg-white/5 border border-white/10 p-2.5 flex items-center justify-between gap-4 backdrop-blur-sm group hover:border-emerald-500 transition-all min-w-[180px]"
                                    >
                                        <div className="flex flex-col">
                                            <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-0.5 italic">{child.grade}</span>
                                            <span className="text-sm font-black text-white uppercase italic">{child.name}</span>
                                        </div>
                                        <div className="text-left">
                                            <div className="text-lg font-black text-emerald-400 tracking-tighter flex items-center gap-1.5 justify-end">
                                                {child.totalPoints || 0}
                                                <Star size={14} className="fill-current" />
                                            </div>
                                            <span className="text-[8px] font-black text-emerald-500/50 uppercase tracking-widest">نقطة تميز</span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Compact Insights Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ParentExcellenceRadar 
                    achievements={children
                        .filter(c => c.totalPoints > 0)
                        .slice(0, 2)
                        .map(c => ({
                            id: c.id,
                            studentName: c.name,
                            achievement: 'إتمام المرحلة الدراسية بتميز',
                            date: 'اليوم',
                            points: c.totalPoints > 50 ? 50 : c.totalPoints
                        }))
                    }
                />
                
                <div className="bg-white border-[6px] border-gray-950 p-6 shadow-[6px_6px_0px_0px_#3b82f6] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-full bg-gray-50 -skew-x-12 translate-x-8 pointer-events-none" />
                    <div className="flex items-center gap-3 mb-6 relative z-10">
                        <div className="p-2 bg-gray-950 text-white transform -rotate-3">
                            <Activity size={18} strokeWidth={2.5} />
                        </div>
                        <h2 className="text-lg font-black text-gray-950 uppercase italic tracking-tighter leading-none">مؤشرات الأداء الرقمي</h2>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 relative z-10">
                        <div className="p-4 bg-gray-50 border-r-[6px] border-primary-600">
                            <span className="block text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1.5">معدل الانضباط</span>
                            <div className="text-2xl font-black text-gray-950 italic leading-none">{stats.attendanceRate}%</div>
                            <div className="w-full h-0.5 bg-gray-200 mt-2 relative">
                                <div className="absolute top-0 right-0 h-full bg-primary-600 transition-all" style={{ width: `${stats.attendanceRate}%` }} />
                            </div>
                        </div>
                        <div className="p-4 bg-gray-50 border-r-[6px] border-emerald-500">
                            <span className="block text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1.5">الرصيد المتبقي</span>
                            <div className="text-2xl font-black text-gray-950 italic leading-none">{stats.sessionsTotal - stats.sessionsUsed}</div>
                            <span className="text-[8px] font-bold text-emerald-600 uppercase tracking-widest">حصة متوفرة</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Compact Hero Levels Section */}
            <div>
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-gray-950 text-white transform rotate-2">
                        <Trophy size={20} />
                    </div>
                    <h2 className="text-xl font-black text-gray-950 dark:text-white uppercase tracking-tighter italic leading-none">مستويات الأبطال (Progress)</h2>
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

            {/* Compact Operations Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                 <StatCard
                    icon={Calendar}
                    label="العمليات"
                    value={stats.sessionCount}
                    color="amber"
                    subValue={`${stats.upcomingSessions} مهمة`}
                    onClick={() => navigate('/parent-attendance')}
                />
                <StatCard
                    icon={Users}
                    label="الأبناء"
                    value={stats.childCount}
                    color="emerald"
                    subValue="قطاع النجاح"
                    onClick={() => navigate('/parent-students')}
                />
                <StatCard
                    icon={Award}
                    label="التقارير"
                    value="عرض الكل"
                    color="blue"
                    subValue="تقييمات دورية"
                    onClick={() => navigate('/evaluations')}
                />
                <StatCard
                    icon={Receipt}
                    label="المالية"
                    value={stats.pendingInvoiceCount}
                    color="rose"
                    subValue={stats.totalPending > 0 ? `${stats.totalPending} ج.م` : 'مستقر'}
                    onClick={() => navigate('/student-invoices')}
                />
            </div>

            {/* Compact Critical Alerts */}
            {((displayData.students.some(s => (s.enrollments || []).some((en: any) => (Number(en.sessionsTotal) - Number(en.sessionsUsed)) <= 2))) || stats.pendingInvoiceCount > 0) && (
                <div className="bg-white border-[6px] border-gray-950 p-6 shadow-[6px_6px_0px_0px_#ef4444] relative overflow-hidden">
                    <h4 className="font-black text-[9px] text-gray-400 uppercase tracking-[3px] mb-6 flex items-center justify-between">
                        تنبيهات حالة الاستعداد
                        <Bell size={16} className="text-rose-500 animate-ping" />
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
                        {displayData.students.map(student => {
                            const lowBalanceEnrollments = (student.enrollments || []).filter((en: any) => (Number(en.sessionsTotal) - Number(en.sessionsUsed)) <= 2);
                            return lowBalanceEnrollments.map((en: any, idx: number) => (
                                <div key={`${student.id}-${idx}`} className="p-4 bg-white border-[3px] border-gray-950 shadow-[4px_4px_0px_0px_#ef4444] flex items-start gap-4 group hover:translate-x-1 transition-all">
                                    <AlertCircle size={24} className="text-rose-600 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-xs font-black text-gray-950 uppercase italic tracking-tighter mb-1">تنبيه: {student.name}</p>
                                        <p className="text-[9px] text-gray-500 font-bold leading-tight line-clamp-2">تبقى {Number(en.sessionsTotal) - Number(en.sessionsUsed)} حصص في {en.subject}.</p>
                                    </div>
                                </div>
                            ));
                        })}
                        {stats.pendingInvoiceCount > 0 && (
                            <div className="p-4 bg-white border-[3px] border-gray-950 shadow-[4px_4px_0px_0px_#f59e0b] flex items-start gap-4 group hover:translate-x-1 transition-all">
                                <AlertCircle size={24} className="text-amber-500 mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-xs font-black text-gray-950 uppercase italic tracking-tighter mb-1">إجراء مالي</p>
                                    <p className="text-[9px] text-gray-500 font-bold leading-tight">يوجد {stats.pendingInvoiceCount} فواتير معلقة ({stats.totalPending.toLocaleString()} ج.م).</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Compact Weekly Schedule */}
                    <div className="bg-white border-[6px] border-gray-950 shadow-[8px_8px_0px_0px_black] overflow-hidden">
                        <div className="p-6 border-b-[6px] border-gray-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50">
                            <h4 className="font-black text-lg uppercase tracking-tighter text-gray-950 flex items-center gap-3 italic leading-none">
                                <CalendarDays className="text-primary-600" size={24} />
                                {showAllDays ? 'خريطة المهام' : `مهمات (${todayArabic})`}
                            </h4>
                            <button
                                onClick={() => setShowAllDays(!showAllDays)}
                                className="px-4 py-2 bg-gray-950 text-white border-[3px] border-gray-950 font-black text-[9px] uppercase italic shadow-[3px_3px_0px_0px_#ef4444] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
                            >
                                {showAllDays ? 'العمليات الحالية' : 'المخطط الكامل'}
                            </button>
                        </div>
                        
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {(showAllDays ? weeklySchedule : weeklySchedule.filter(d => d.day === todayArabic)).map((dayData, idx) => (
                                    <div key={idx} className="bg-white border-2 border-gray-950 p-4 shadow-[4px_4px_0px_0px_#3b82f6]">
                                        <div className="flex items-center gap-2 mb-4 font-black text-gray-950 italic">
                                            <div className="w-7 h-7 bg-gray-950 text-white flex items-center justify-center text-xs">{dayData.day.substring(0, 1)}</div>
                                            <h5 className="text-sm">{dayData.day}</h5>
                                        </div>
                                        <div className="space-y-2">
                                            {dayData.slots.map((slot, sIdx) => (
                                                <div key={sIdx} className="bg-gray-50 p-2.5 border border-gray-950 flex items-center justify-between gap-2 group hover:bg-white transition-all text-right">
                                                    <div className="truncate">
                                                        <div className="flex items-center gap-1.5 mb-0.5">
                                                            <User size={12} className="text-primary-600" />
                                                            <span className="text-[11px] font-black text-gray-950 truncate max-w-[80px]">{slot.studentName}</span>
                                                        </div>
                                                        <p className="text-[8px] text-gray-500 font-bold uppercase tracking-wider truncate">{slot.subject}</p>
                                                    </div>
                                                    <div className="px-1.5 py-0.5 bg-gray-950 text-white text-[9px] font-black italic whitespace-nowrap">
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
                </div>

                <div className="space-y-6">
                    {/* Compact Pending Invoices */}
                    <div className="bg-white border-[6px] border-gray-950 p-6 shadow-[8px_8px_0px_0px_#ef4444] relative overflow-hidden">
                        <h4 className="font-black text-lg uppercase tracking-tighter text-gray-950 mb-6 italic flex items-center gap-3 leading-none">
                            <Receipt className="text-primary-600" size={24} />
                            المستحقات
                        </h4>
                        <div className="space-y-4">
                            {displayData.invoices.filter(i => i.status === 'unpaid').map((invoice) => (
                                <div key={invoice.id} className="p-4 bg-gray-50 border-2 border-gray-950 shadow-[4px_4px_0px_0px_black] group hover:translate-x-0.5 transition-all">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <p className="text-[11px] font-black text-gray-950 uppercase italic tracking-tighter">كشف {invoice.month}/{invoice.year}</p>
                                            <p className="text-[9px] text-gray-400 font-bold mt-0.5 uppercase tracking-widest">{invoice.studentName}</p>
                                        </div>
                                        <Target size={16} className="text-rose-600" />
                                    </div>
                                    <div className="flex items-center justify-between border-t border-gray-200 pt-2">
                                        <p className="text-lg font-black text-rose-600 tracking-tighter">{invoice.amount} ج.م</p>
                                        <span className="px-2 py-0.5 bg-rose-100 text-rose-600 text-[8px] font-black uppercase italic">متأخر</span>
                                    </div>
                                </div>
                            ))}
                            {displayData.invoices.filter(i => i.status === 'unpaid').length === 0 && (
                                <div className="py-8 text-center border-2 border-dashed border-gray-200 opacity-50">
                                    <CheckCircle2 size={32} className="mx-auto text-emerald-500 mb-2" />
                                    <p className="text-[9px] text-gray-400 font-black italic uppercase tracking-widest">السجل مكتمل</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <a
                        href={`https://wa.me/${adminPhone?.replace(/\D/g, '').replace(/^0/, '20')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full block bg-gray-950 p-6 border-[6px] border-gray-950 shadow-[10px_10px_0px_0px_#25d366] text-white group hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
                    >
                        <div className="flex flex-col items-center gap-4 text-center">
                            <div className="w-12 h-12 bg-white/10 flex items-center justify-center transform group-hover:rotate-12 transition-transform">
                                <Headset size={24} className="text-white" />
                            </div>
                            <div>
                                <h4 className="font-black text-lg uppercase tracking-tighter mb-1 italic leading-none">الدعم المباشر</h4>
                                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-[3px]">تواصل مع الإدارة</p>
                            </div>
                            <div className="px-4 py-1.5 bg-white text-gray-950 font-black text-[8px] uppercase tracking-widest italic">واتساب متاح</div>
                        </div>
                    </a>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ icon: Icon, label, value, color, subValue, onClick }: any) => {
    const colors: any = {
        blue: "bg-blue-600 shadow-[4px_4px_0px_0px_#1e3a8a]",
        amber: "bg-amber-500 shadow-[4px_4px_0px_0px_#92400e]",
        emerald: "bg-emerald-500 shadow-[4px_4px_0px_0px_#065f46]",
        rose: "bg-rose-500 shadow-[4px_4px_0px_0px_#9f1239]",
    };

    return (
        <motion.div
            whileHover={{ y: -3 }}
            onClick={onClick}
            className={cn(
                "p-5 bg-white border-[6px] border-gray-950 shadow-[6px_6px_0px_0px_black] transition-all",
                onClick && "cursor-pointer hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5"
            )}
        >
            <div className="flex flex-col gap-4">
                <div className={cn("w-10 h-10 flex items-center justify-center text-white transform -rotate-3 border-[3px] border-gray-950", colors[color])}>
                    <Icon size={20} strokeWidth={2.5} />
                </div>
                <div>
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-[2px] mb-1 leading-none">{label}</p>
                    <h3 className="text-xl font-black text-gray-950 tracking-tighter uppercase italic leading-none">{value}</h3>
                    {subValue && <p className="text-[8px] font-black text-primary-600 mt-2 italic uppercase tracking-widest leading-none">{subValue}</p>}
                </div>
            </div>
        </motion.div>
    );
};
