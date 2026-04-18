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
    ExternalLink
} from 'lucide-react';
import { api } from '../lib/api';
import { useApp } from '../context/AppContext';

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
            <div className="min-h-screen bg-[#fcfdff] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                    <p className="font-black text-indigo-900 animate-pulse">جاري تحميل البوابة...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fcfdff] pb-20 pt-8" dir="rtl">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                
                {/* ═══════════════ NEW SUPREME HEADER ═══════════════ */}
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 py-4">
                    <div className="space-y-2">
                         <div className="flex items-center gap-2 text-indigo-600 bg-indigo-50/50 px-3 py-1 w-fit rounded-full">
                            <Star size={14} className="fill-current" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] italic">المسار الماسي</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter leading-none italic">
                            بوابة المتابعة <span className="text-indigo-600">.</span>
                        </h1>
                        <p className="text-slate-400 font-bold text-sm tracking-wide">أهلاً بك، أ/ {currentUser?.name} في لوحتك الحصرية</p>
                    </div>

                    <div className="flex items-center gap-3">
                         <button 
                            onClick={() => window.open(`https://wa.me/${adminPhone?.replace(/\D/g, '').replace(/^0/, '20')}`, '_blank')}
                            className="h-14 w-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center hover:scale-105 transition-all shadow-xl shadow-indigo-200 group"
                        >
                            <Headset size={24} className="group-hover:rotate-12 transition-transform" />
                        </button>
                        <button 
                            onClick={logout}
                            className="h-14 px-8 bg-white text-rose-600 border border-slate-100 rounded-2xl flex items-center justify-center gap-3 hover:bg-rose-50 transition-all font-black text-sm"
                        >
                            <LogOut size={20} />
                            خروج
                        </button>
                    </div>
                </header>

                {/* ═══════════════ MAIN SECTIONS GRID ═══════════════ */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <PortalNavCard 
                        title="الأكاديميين الأبطال" 
                        subtitle={`لديك ${stats.childCount} أبناء مسجلين`}
                        icon={Users}
                        color="indigo"
                        onClick={() => navigate('/parent-students')}
                        badge={`${stats.childCount} بطل`}
                    />
                    <PortalNavCard 
                        title="خريطة العمليات" 
                        subtitle={`جدول مهام الحصص القادمة`}
                        icon={CalendarDays}
                        color="indigo"
                        onClick={() => navigate('/parent-attendance')}
                        badge={stats.upcomingSessions > 0 ? `${stats.upcomingSessions} مهمة` : "مكتمل"}
                    />
                     <PortalNavCard 
                        title="السجل المالي" 
                        subtitle="المستحقات والفواتير والاشتراكات"
                        icon={Receipt}
                        color="indigo"
                        onClick={() => navigate('/student-invoices')}
                        badge={stats.totalPending > 0 ? "مستحق" : "مسدد"}
                    />
                    <PortalNavCard 
                        title="مركز التقارير" 
                        subtitle="تحليلات الأداء الأكاديمي الشاملة"
                        icon={Award}
                        color="indigo"
                        onClick={() => navigate('/evaluations')}
                    />
                    <PortalNavCard 
                        title="دليل المشتركين" 
                        subtitle="اكتشف الدورات والمسارات المتاحة"
                        icon={Star}
                        color="indigo"
                        onClick={() => navigate('/courses')}
                    />
                    <PortalNavCard 
                        title="قناة الدعم" 
                        subtitle="تواصل مباشر مع الإدارة التعليمية"
                        icon={Activity}
                        color="indigo"
                        onClick={() => window.open(`https://wa.me/${adminPhone?.replace(/\D/g, '').replace(/^0/, '20')}`, '_blank')}
                    />
                </section>

                {/* ═══════════════ ELITE HEROES CENTERS (PURE DESIGN) ═══════════════ */}
                <section className="space-y-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h2 className="text-3xl font-black text-slate-900 tracking-tight italic">مراكز الأبطال النخبويين</h2>
                                <div className="w-10 h-10 rounded-full border-2 border-indigo-600 flex items-center justify-center text-indigo-600 shadow-lg shadow-indigo-100">
                                    <Trophy size={20} className="fill-current" />
                                </div>
                            </div>
                            <p className="text-slate-400 text-sm font-bold opacity-80">تتبع تقدمك، احصل على أوسمتك وارتق في مراتب النخبة الماسية.</p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {children.map((child) => {
                             const points = child.totalPoints || 0;
                             const getStatus = (p: number) => {
                                 if (p >= 1000) return { name: 'البروفيسور النخبوي', rank: 'مخضرم', nextGoal: 2500 };
                                 if (p >= 500) return { name: 'المجتهد الذكي', rank: 'متقدم', nextGoal: 1000 };
                                 return { name: 'الباحث المستكشف', rank: 'مبتدئ', nextGoal: 100 };
                             };
                             const status = getStatus(points);
                             const progress = Math.min(Math.round((points / status.nextGoal) * 100), 100);

                             return (
                                 <motion.div 
                                    key={child.id}
                                    whileHover={{ y: -6, scale: 1.01 }}
                                    className="bg-white border-b-4 border-indigo-600 p-10 shadow-[0_20px_50px_rgba(79,70,229,0.08)] relative group rounded-2xl"
                                 >
                                    <div className="flex justify-between items-start mb-10">
                                        <div className="text-right">
                                            <p className="text-[11px] font-black text-indigo-600 uppercase tracking-widest mb-2 italic">الحالة العملياتية</p>
                                            <h4 className="text-xl font-black text-slate-400 mb-1 opacity-70 italic uppercase">{status.name}</h4>
                                            <h5 className="text-3xl font-black text-slate-900">{child.name}</h5>
                                        </div>
                                        
                                        <div className="relative">
                                            <div className="w-24 h-24 rounded-3xl border-4 border-indigo-50 p-2 bg-white overflow-hidden shadow-2xl rotate-3 group-hover:rotate-0 transition-transform">
                                                <div className="w-full h-full rounded-2xl bg-indigo-900 flex items-center justify-center text-4xl">
                                                    <User className="text-white/20" size={48} />
                                                </div>
                                            </div>
                                            <div className="absolute -bottom-2 -left-3 bg-rose-600 text-white text-[10px] font-black px-3 py-1.5 rounded-xl shadow-xl border-2 border-white italic">
                                                PT {points}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-5 mb-10">
                                        <div className="flex justify-between items-end">
                                            <div className="text-right">
                                                <p className="text-xs font-black text-slate-900 uppercase italic opacity-90">مستوى كفاءة التعلم</p>
                                                <p className="text-[10px] font-bold text-slate-400 mt-1">بانتظار {status.nextGoal - points} نقطة للترقية</p>
                                            </div>
                                            <span className="text-3xl font-black text-indigo-700 italic">{progress}%</span>
                                        </div>
                                        <div className="h-3 bg-indigo-50 rounded-full overflow-hidden relative">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${progress}%` }}
                                                className="h-full bg-indigo-600 relative rounded-full"
                                            >
                                                <div className="absolute inset-0 bg-white/20 blur-sm animate-pulse"></div>
                                            </motion.div>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center pt-8 border-t border-slate-50 mt-4">
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">الهدف القادم</p>
                                            <p className="text-lg font-black text-slate-900 italic">{status.nextGoal} نقطة</p>
                                        </div>
                                        <div className="text-left">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 text-left">الرتبة الدنيا</p>
                                            <p className="text-lg font-black text-slate-900 italic">{status.rank}</p>
                                        </div>
                                    </div>
                                 </motion.div>
                             );
                        })}
                    </div>
                </section>
            </div>
        </div>
    );
};

const PortalNavCard = ({ title, subtitle, icon: Icon, onClick, badge }: any) => {
    return (
        <motion.div
            whileHover={{ y: -10, scale: 1.02 }}
            onClick={onClick}
            className="group bg-white p-8 border border-slate-50 transition-all duration-500 cursor-pointer relative overflow-hidden flex flex-col justify-between min-h-[180px] rounded-3xl shadow-sm hover:shadow-2xl hover:shadow-indigo-100"
        >
            <div className="absolute top-0 left-0 w-2 h-full bg-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div className="flex justify-between items-start">
                <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:bg-indigo-600 group-hover:text-white group-hover:rotate-6">
                    <Icon size={28} strokeWidth={1.5} />
                </div>
                {badge && (
                    <div className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest italic group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        {badge}
                    </div>
                )}
            </div>

            <div className="mt-8">
                <h3 className="text-xl font-black text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors italic">{title}</h3>
                <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-tighter opacity-80">{subtitle}</p>
            </div>

            <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                <ExternalLink size={16} className="text-indigo-600" />
            </div>
        </motion.div>
    );
};
