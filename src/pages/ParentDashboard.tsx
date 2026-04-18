import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Users,
    Receipt,
    CalendarDays,
    Headset,
    Activity,
    Star,
    Award,
    Trophy,
    User,
    LogOut,
    MessageSquare,
    ChevronLeft
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
    const [invoices, setInvoices] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                setIsLoading(true);
                const [students, allInvoices] = await Promise.all([
                    api.get<any[]>('/parents/my-children'),
                    api.get<any[]>('/parents/invoices') // Assuming generic or we flat map later
                ]);
                
                setChildren(students);
                // Simplified for the UI build - normally we'd fetch per student as before
                const sessionsPromises = students.map(s => api.get<any[]>(`/parents/child-sessions/${s.id}`));
                const allSessionsResults = await Promise.all(sessionsPromises);
                setSessions(allSessionsResults.flat());
                setInvoices(allInvoices || []);

            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAllData();
    }, []);

    const stats = useMemo(() => {
        const pendingInvoices = invoices.filter(i => i.status === 'unpaid');
        const upcomingSessions = sessions.filter(s => s.status !== 'completed' && s.status !== 'cancelled').length;

        return {
            childCount: children.length,
            upcomingSessions,
            totalPending: pendingInvoices.reduce((sum, i) => sum + i.amount, 0),
        };
    }, [sessions, invoices, children]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#f8faff] flex flex-col items-center justify-center p-4">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-slate-500 font-bold">جاري تحميل البوابة يا بطل...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8faff] pb-20 px-2 lg:px-8 pt-6 space-y-6 animate-in fade-in duration-700" dir="rtl">
            
            {/* ═══════════════ HEADER (Same as Student) ═══════════════ */}
            <div className="flex justify-between items-start mb-2 pr-2">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-slate-900 mb-1">
                        مرحباً، أ/ {currentUser?.name?.split(' ')[0]}
                    </h1>
                    <p className="text-slate-500 text-sm font-medium">نظرة شاملة على رحلة أبنائك التعليمية</p>
                </div>
                <button 
                    onClick={logout}
                    className="p-3 bg-white text-rose-500 rounded-2xl shadow-sm border border-slate-100 hover:bg-rose-50 transition-all"
                >
                    <LogOut size={20} />
                </button>
            </div>

            {/* ═══════════════ SUMMARY BANNER (Like Student Next Class) ═══════════════ */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden bg-gradient-to-br from-[#a78bfa] to-[#8b5cf6] p-6 rounded-3xl shadow-lg shadow-purple-500/20 text-white"
            >
                <div className="absolute top-0 right-0 w-12 h-12 pointer-events-none overflow-hidden z-20">
                    <div className="absolute top-[-25px] right-[-25px] w-12 h-12 bg-cyan-400 rotate-45 shadow-[0_0_15px_#22d3ee]" />
                </div>
                <Trophy className="absolute bottom-2 left-2 text-white/10" size={80} />
                
                <div className="relative z-10 flex flex-col items-center text-center">
                    <span className="text-[10px] uppercase font-black tracking-widest opacity-80 mb-2">ملخص الأداء العالي</span>
                    <div className="bg-white/10 backdrop-blur-md px-6 py-2 rounded-2xl border border-white/20 mb-3">
                        <h2 className="text-xl md:text-2xl font-black">إجمالي النقاط التراكميّة</h2>
                        <p className="text-3xl font-black mt-1">
                            {children.reduce((sum, c) => sum + (c.totalPoints || 0), 0)} <span className="text-sm opacity-60">نقطة</span>
                        </p>
                    </div>
                    <p className="text-xs font-bold opacity-90">أبناؤك يحققون تقدماً مذهلاً هذا الشهر!</p>
                </div>
            </motion.div>

            {/* ═══════════════ QUICK STATS (3 Columns like Student) ═══════════════ */}
            <div className="grid grid-cols-3 gap-2 md:gap-4">
                <QuickStatCard icon={Users} label="الأبناء" value={stats.childCount} color="indigo" />
                <QuickStatCard icon={CalendarDays} label="الحصص" value={stats.upcomingSessions} color="blue" />
                <QuickStatCard icon={Receipt} label="المالية" value={stats.totalPending > 0 ? "مستحق" : "تم"} color="rose" />
            </div>

            {/* ═══════════════ NAVIGATION GRID ═══════════════ */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <NavButton label="ملفات الأبناء" icon={Users} onClick={() => navigate('/parent-students')} />
                <NavButton label="جدول المتابعة" icon={CalendarDays} onClick={() => navigate('/parent-attendance')} />
                <NavButton label="السجل المالي" icon={Receipt} onClick={() => navigate('/student-invoices')} />
                <NavButton label="التقارير" icon={Award} onClick={() => navigate('/evaluations')} />
            </div>

            {/* ═══════════════ ELITE HEROES (Student Goal Style) ═══════════════ */}
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
                            <div key={child.id} className="bg-white p-5 rounded-[2.5rem] shadow-sm border border-slate-50 flex items-center gap-4">
                                <div className="relative">
                                    <div className="w-16 h-16 rounded-[1.5rem] bg-indigo-50 border border-indigo-100 flex items-center justify-center overflow-hidden">
                                        <User className="text-indigo-200" size={32} />
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 bg-rose-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-lg border border-white">
                                        {points}
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-sm font-black text-slate-900 leading-tight">{child.name}</h4>
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

            {/* ═══════════════ SUPPORT FOOTER (Same as Student) ═══════════════ */}
            <div className="bg-[#5c4fb1] p-6 rounded-3xl shadow-lg text-white flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                <div className="absolute right-0 bottom-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -translate-x-1/2 translate-y-1/2" />
                <div className="text-center md:text-right relative z-10 w-full md:w-auto">
                    <h4 className="text-lg font-black mb-1">هل تحتاج لمساعدة؟</h4>
                    <p className="text-xs font-bold opacity-80">فريق الدعم متاح دائماً لخدمة ولي الأمر</p>
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
        <div className="bg-white py-3 px-2 rounded-[22px] shadow-sm border border-slate-50 flex flex-col items-center justify-center text-center">
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
        <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm group-hover:scale-110 transition-transform">
            <Icon size={20} strokeWidth={1.5} />
        </div>
        <span className="text-xs font-black text-slate-700 tracking-tight">{label}</span>
    </button>
);
