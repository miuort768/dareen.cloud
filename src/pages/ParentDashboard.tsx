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
        <div className="space-y-8 pb-24" dir="rtl">

            {/* Optimized Cyber-Brutalist Dashboard Header */}
            <div className="relative bg-gray-950 p-6 lg:p-10 border-[6px] border-gray-950 shadow-[8px_8px_0px_0px_#ef4444] overflow-hidden mb-8">
                <div className="absolute top-0 right-0 w-full h-full opacity-[0.03] pointer-events-none" 
                     style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '30px 20px' }} />
                
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                        <div className="relative">
                            <motion.div 
                                whileHover={{ rotate: -5, scale: 1.05 }}
                                className="w-20 h-20 bg-primary-600 text-white border-[4px] border-gray-950 shadow-[4px_4px_0px_0px_white] flex items-center justify-center transform -rotate-2"
                            >
                                <Users size={40} strokeWidth={2.5} />
                            </motion.div>
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 border-2 border-gray-950 animate-pulse" />
                        </div>
                        
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="px-2.5 py-0.5 bg-primary-600 text-white text-[10px] font-black uppercase tracking-widest italic border-b border-white">مركز المتابعة</span>
                                <div className="flex gap-1">
                                    {[1,2,3].map(i => <div key={i} className="w-1.5 h-1.5 bg-emerald-500 animate-ping" style={{ animationDelay: `${i*0.2}s` }} />)}
                                </div>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter uppercase italic leading-none mb-3">بوابة المتابعة الذكية</h1>
                            <p className="text-gray-400 text-sm font-black flex items-center gap-2 uppercase tracking-wider">
                                <ShieldCheck size={18} className="text-primary-500" />
                                أهلاً بك، أ/ {currentUser?.name}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-8 bg-white/5 border-2 border-white/10 p-6 backdrop-blur-sm shadow-[6px_6px_0px_0px_rgba(255,255,255,0.1)]">
                        <div className="text-right">
                             <span className="block text-[10px] font-black text-gray-500 uppercase tracking-[4px] mb-1 italic">إجمالي الأبناء</span>
                             <div className="text-5xl font-black text-white tracking-tighter italic leading-none">{children.length}</div>
                        </div>
                        <div className="w-12 h-12 bg-primary-600 text-white flex items-center justify-center border-2 border-white">
                             <Users size={24} strokeWidth={3} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Unified Strategic Intelligence Unit */}
            <div className="bg-white border-[6px] border-gray-950 shadow-[10px_10px_0px_0px_black] overflow-hidden mb-8">
                <div className="grid grid-cols-1 lg:grid-cols-12">
                    {/* Excellence Radar Side */}
                    <div className="lg:col-span-8 p-6 lg:border-l-[6px] border-gray-950 bg-gray-950 text-white relative">
                        <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none" 
                             style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
                        
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-2 bg-white text-gray-950 transform -rotate-3">
                                    <Trophy size={18} className="animate-pulse" />
                                </div>
                                <h3 className="font-black text-lg uppercase italic tracking-tighter">رادار التميز الأسبوعي (Excellence Radar)</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {children.filter(c => c.totalPoints > 0).slice(0, 2).map((child) => (
                                    <div key={child.id} className="flex items-center justify-between group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-white/10 border-2 border-white/20 flex items-center justify-center rotate-3 group-hover:rotate-0 transition-transform">
                                                <Star size={24} className="text-yellow-400 fill-current" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-black uppercase tracking-tighter text-white/90">{child.name}</h4>
                                                <p className="text-[10px] font-bold text-yellow-400 uppercase leading-none mt-1">إتمام المرحلة الدراسية بتميز</p>
                                            </div>
                                        </div>
                                        <div className="text-left">
                                            <span className="text-3xl font-black italic tracking-tighter text-emerald-400">+50</span>
                                            <p className="text-[8px] font-black uppercase opacity-60 tracking-widest leading-none">نقطة ذكاء</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
                                <div className="text-[9px] font-black text-white/40 uppercase tracking-widest">تم التحديث: اليوم</div>
                                <button className="text-[10px] font-black text-yellow-400 hover:text-white uppercase italic flex items-center gap-1 transition-colors">
                                    عرض كافة الإنجازات <ChevronLeft size={14} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Digital Indicators Side */}
                    <div className="lg:col-span-4 p-8 bg-gray-50 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-2 bg-gray-950 text-white">
                                    <Activity size={20} strokeWidth={3} />
                                </div>
                                <h3 className="text-lg font-black text-gray-950 uppercase italic tracking-tighter">مؤشرات الأداء الرقمي</h3>
                            </div>

                            <div className="space-y-8">
                                <div>
                                    <div className="flex justify-between items-end mb-2">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">معدل الانضباط</span>
                                        <span className="text-2xl font-black text-gray-950 italic">{stats.attendanceRate}%</span>
                                    </div>
                                    <div className="w-full h-2 bg-gray-200 border-2 border-gray-950 relative">
                                        <div 
                                            className="absolute top-0 right-0 h-full bg-primary-600 transition-all duration-1000" 
                                            style={{ width: `${stats.attendanceRate}%` }} 
                                        />
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between items-end mb-2">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">كفاءة الرصيد</span>
                                        <span className="text-2xl font-black text-gray-950 italic">{stats.sessionsTotal > 0 ? Math.round((stats.sessionsUsed / stats.sessionsTotal) * 100) : 0}%</span>
                                    </div>
                                    <div className="w-full h-2 bg-gray-200 border-2 border-gray-950 relative">
                                        <div 
                                            className="absolute top-0 right-0 h-full bg-emerald-500 transition-all duration-1000" 
                                            style={{ width: `${stats.sessionsTotal > 0 ? (stats.sessionsUsed / stats.sessionsTotal) * 100 : 0}%` }} 
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 p-4 bg-gray-950 text-white border-2 border-gray-950 text-center">
                            <span className="text-[9px] font-black uppercase tracking-[3px] animate-pulse">الحالة: نشط ومستقر</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Compact Hero Levels Section */}
            <div className="mb-10">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-gray-950 text-white transform rotate-2">
                        <Trophy size={20} />
                    </div>
                    <h2 className="text-xl font-black text-gray-950 dark:text-white uppercase tracking-tighter italic leading-none">مستويات الأبطال (Heroes Progress)</h2>
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Compact Weekly Schedule - Focused on Task/Day */}
                <div className="bg-white border-[6px] border-gray-950 shadow-[8px_8px_0px_0px_black] overflow-hidden">
                    <div className="p-6 border-b-[6px] border-gray-950 flex items-center justify-between bg-gray-50">
                        <h4 className="font-black text-lg uppercase tracking-tighter text-gray-950 flex items-center gap-3 italic leading-none">
                            <CalendarDays className="text-primary-600" size={24} />
                            {showAllDays ? 'خريطة المهام' : `مهمات (${todayArabic})`}
                        </h4>
                        <button
                            onClick={() => setShowAllDays(!showAllDays)}
                            className="px-4 py-1.5 bg-gray-950 text-white border-[3px] border-gray-950 font-black text-[9px] uppercase italic transition-all hover:bg-primary-600"
                        >
                            {showAllDays ? 'اليوم' : 'الكل'}
                        </button>
                    </div>
                    
                    <div className="p-6 max-h-[400px] overflow-y-auto custom-scrollbar">
                        <div className="space-y-4">
                            {(showAllDays ? weeklySchedule : weeklySchedule.filter(d => d.day === todayArabic)).map((dayData, idx) => (
                                <div key={idx} className="bg-white border-2 border-gray-950 p-4 shadow-[4px_4px_0px_0px_#3b82f6]">
                                    <div className="flex items-center gap-2 mb-4 font-black text-gray-950 italic border-b-2 border-gray-100 pb-2">
                                        <div className="w-8 h-8 bg-gray-950 text-white flex items-center justify-center text-xs transform -rotate-3">{dayData.day.substring(0, 1)}</div>
                                        <h5 className="text-sm">{dayData.day}</h5>
                                    </div>
                                    <div className="space-y-3">
                                        {dayData.slots.map((slot, sIdx) => (
                                            <div key={sIdx} className="bg-gray-50 p-3 border border-gray-950 flex items-center justify-between gap-4 group hover:bg-white transition-all">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-white border border-gray-950 flex items-center justify-center">
                                                        <User size={14} className="text-primary-600" />
                                                    </div>
                                                    <div>
                                                        <span className="text-xs font-black text-gray-950 block">{slot.studentName}</span>
                                                        <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{slot.subject}</span>
                                                    </div>
                                                </div>
                                                <div className="px-2 py-1 bg-gray-950 text-white text-[9px] font-black italic">
                                                    {slot.time} {slot.period === 'am' ? 'ص' : 'م'}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                            {(showAllDays ? weeklySchedule : weeklySchedule.filter(d => d.day === todayArabic)).length === 0 && (
                                <div className="py-20 text-center opacity-20 flex flex-col items-center">
                                    <Clock size={48} className="mb-4" />
                                    <p className="text-xs font-black italic">لا توجد مهام حالية</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Compact Pending Invoices - Shared Size */}
                <div className="bg-white border-[6px] border-gray-950 shadow-[8px_8px_0px_0px_#ef4444] overflow-hidden">
                    <div className="p-6 border-b-[6px] border-gray-950 flex items-center bg-gray-50">
                        <h4 className="font-black text-lg uppercase tracking-tighter text-gray-950 flex items-center gap-3 italic leading-none">
                            <Receipt className="text-rose-600" size={24} />
                            سجل المستحقات
                        </h4>
                    </div>
                    <div className="p-6 max-h-[400px] overflow-y-auto custom-scrollbar">
                        <div className="space-y-4">
                            {displayData.invoices.filter(i => i.status === 'unpaid').map((invoice) => (
                                <div key={invoice.id} className="p-4 bg-gray-50 border-2 border-gray-950 shadow-[4px_4px_0px_0px_black] group hover:translate-x-1 transition-all">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <p className="text-xs font-black text-gray-950 uppercase italic tracking-tighter">كشف {invoice.month}/{invoice.year}</p>
                                            <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-widest">{invoice.studentName}</p>
                                        </div>
                                        <Target size={20} className="text-rose-600" />
                                    </div>
                                    <div className="flex items-center justify-between border-t border-gray-200 pt-3">
                                        <div className="text-left font-black tracking-tighter">
                                            <span className="text-sm text-gray-400 ml-1">ج.م</span>
                                            <span className="text-2xl text-rose-600">{invoice.amount}</span>
                                        </div>
                                        <span className="px-2 py-1 bg-rose-100 text-rose-600 text-[9px] font-black uppercase italic border border-rose-200">بانتظار السداد</span>
                                    </div>
                                </div>
                            ))}
                            {displayData.invoices.filter(i => i.status === 'unpaid').length === 0 && (
                                <div className="py-20 text-center opacity-20 flex flex-col items-center">
                                    <CheckCircle2 size={48} className="mb-4 text-emerald-500" />
                                    <p className="text-xs font-black italic">الحساب المالي مكتمل</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Secondary CTA / Support */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <a
                    href={`https://wa.me/${adminPhone?.replace(/\D/g, '').replace(/^0/, '20')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex bg-gray-950 p-6 border-4 border-gray-950 shadow-[8px_8px_0px_0px_#25d366] text-white group hover:translate-x-1 transition-all"
                >
                    <div className="flex items-center gap-6">
                        <div className="w-12 h-12 bg-white/10 flex items-center justify-center">
                            <Headset size={24} className="text-white" />
                        </div>
                        <div>
                            <h4 className="font-black text-sm uppercase tracking-tighter italic">الدعم المباشر</h4>
                            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-[3px]">تواصل مع الإدارة عبر واتساب</p>
                        </div>
                    </div>
                </a>
                
                <div className="bg-white border-4 border-gray-950 p-6 shadow-[8px_8px_0px_0px_#3b82f6] flex items-center gap-6">
                    <div className="w-12 h-12 bg-gray-50 flex items-center justify-center border-2 border-gray-950 transform rotate-3">
                        <Star size={24} className="text-primary-600" />
                    </div>
                    <div>
                        <h4 className="font-black text-sm uppercase tracking-tighter italic">نظام التميز</h4>
                        <p className="text-[9px] text-gray-500 font-bold uppercase tracking-[3px]">يتم تحديث النقاط كل 24 ساعة</p>
                    </div>
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
