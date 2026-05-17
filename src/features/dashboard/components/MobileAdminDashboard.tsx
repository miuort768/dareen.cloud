import { useState, useEffect } from 'react';
import { 
    Users, BookOpen, CalendarCheck, CheckCircle2, GraduationCap, 
    TrendingUp, TrendingDown, DollarSign, UserPlus, FilePlus, 
    Calendar, Megaphone, Clock, ShieldCheck, Headphones, Activity, Bell
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../../../lib/utils';

interface MobileAdminDashboardProps {
    stats: any;
    lowBalanceStudents: any[];
}

export const MobileAdminDashboard = ({
    stats,
    lowBalanceStudents,
}: MobileAdminDashboardProps) => {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Get live quick highlights
    const lowBalanceCount = lowBalanceStudents.length;
    const todaySessionsCount = stats.todaySessions || 0;

    return (
        <div className="space-y-4 pb-12 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* 1. Header Command Card */}
            <div className="relative overflow-hidden bg-slate-950 text-white p-4 border border-slate-800 rounded-none shadow-2xl">
                {/* Decorative Neon Glows */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rotate-45 blur-2xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-500/10 blur-2xl pointer-events-none" />

                <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 flex items-center justify-center bg-indigo-600/20 border border-indigo-500/30 rounded-none">
                            <ShieldCheck size={20} className="text-indigo-400" />
                        </div>
                        <div>
                            <div className="flex items-center gap-1.5 mb-0.5">
                                <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[8px] font-black px-1.5 py-0.5 rounded-none uppercase tracking-widest leading-none">
                                    مدير النظام
                                </span>
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                            </div>
                            <h2 className="text-sm font-black tracking-tight text-white">مركز القيادة والتحكم</h2>
                        </div>
                    </div>

                    {/* Compact Live Clock */}
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 border border-white/10 rounded-none text-white/90">
                        <Clock size={12} className="text-amber-400" />
                        <span className="text-[10px] font-black tabular-nums">
                            {currentTime.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', hour12: true })}
                        </span>
                    </div>
                </div>

                {/* Horizontal Divider */}
                <div className="h-[1px] bg-slate-800 my-3" />

                {/* Real-time System Health/Summary Banner */}
                <div className="flex items-center justify-between text-[9px] font-bold text-slate-400">
                    <div className="flex items-center gap-1.5">
                        <Activity size={10} className="text-emerald-400" />
                        <span>النظام متصل ويعمل بكفاءة</span>
                    </div>
                    <span>{new Intl.DateTimeFormat('ar-EG', { day: 'numeric', month: 'long', weekday: 'short' }).format(new Date())}</span>
                </div>
            </div>

            {/* 2. Urgent Operations (Low Balance Alert) */}
            {lowBalanceCount > 0 && (
                <div className="bg-rose-500/10 border border-rose-500/20 p-3 rounded-none flex items-center justify-between gap-3 animate-pulse">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 bg-rose-600 text-white rounded-none flex items-center justify-center shrink-0">
                            <Bell size={14} className="animate-bounce" />
                        </div>
                        <div className="min-w-0">
                            <h4 className="text-[11px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-tight">إشعار حرج بالرصيد</h4>
                            <p className="text-[9px] font-bold text-slate-500 dark:text-slate-400 truncate mt-0.5">
                                يوجد {lowBalanceCount} طلاب شارف رصيدهم على الانتهاء!
                            </p>
                        </div>
                    </div>
                    <Link 
                        to="/students" 
                        className="px-3 h-7 bg-rose-600 hover:bg-rose-700 text-[8px] font-black text-white uppercase tracking-widest rounded-none flex items-center transition-all active:scale-[0.98]"
                    >
                        تحصيل الآن
                    </Link>
                </div>
            )}

            {/* 3. Quick Actions Circular Menu */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-none shadow-sm">
                <h3 className="text-[9px] font-black text-slate-400 uppercase mb-3 tracking-widest text-right">إجراءات إدارية سريعة</h3>
                <div className="grid grid-cols-4 gap-2">
                    <QuickActionItem href="/students?action=new" icon={UserPlus} label="طالب جديد" color="bg-indigo-600" />
                    <QuickActionItem href="/student-invoices?action=new" icon={FilePlus} label="فاتورة" color="bg-emerald-600" />
                    <QuickActionItem href="/schedule" icon={Calendar} label="الجدول" color="bg-amber-500" />
                    <QuickActionItem href="/announcements?action=new" icon={Megaphone} label="إعلان عام" color="bg-rose-600" />
                </div>
            </div>

            {/* 4. Color-Coded Stats Cards - Compact Vertical Stack */}
            <div className="space-y-2">
                <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-right px-1">المؤشرات المالية والأكاديمية</h3>
                
                <div className="grid grid-cols-1 gap-2">
                    <MobileStatCard 
                        title="إجمالي الطلاب" 
                        value={stats.studentsCount} 
                        icon={Users} 
                        color="text-indigo-600" 
                        bg="bg-indigo-50" 
                        cardBg="bg-indigo-50/60 dark:bg-indigo-950/20"
                        cardBorder="border-indigo-100 dark:border-indigo-900/40"
                    />
                    <MobileStatCard 
                        title="الاشتراكات النشطة" 
                        value={stats.totalEnrollments} 
                        icon={BookOpen} 
                        color="text-emerald-600" 
                        bg="bg-emerald-50" 
                        cardBg="bg-emerald-50/50 dark:bg-emerald-950/15"
                        cardBorder="border-emerald-100 dark:border-emerald-900/35"
                    />
                    <MobileStatCard 
                        title="حصص اليوم" 
                        value={todaySessionsCount} 
                        icon={CalendarCheck} 
                        color="text-amber-500" 
                        bg="bg-amber-50" 
                        cardBg="bg-amber-50/40 dark:bg-amber-950/10"
                        cardBorder="border-amber-100 dark:border-amber-900/30"
                    />
                    <MobileStatCard 
                        title="الحصص المنفذة" 
                        value={stats.completedSessions} 
                        icon={CheckCircle2} 
                        color="text-rose-600" 
                        bg="bg-rose-50" 
                        cardBg="bg-rose-50/40 dark:bg-rose-950/10"
                        cardBorder="border-rose-100 dark:border-rose-900/30"
                    />
                    <MobileStatCard 
                        title="إجمالي المعلمين" 
                        value={stats.teachersCount} 
                        icon={GraduationCap} 
                        color="text-purple-600" 
                        bg="bg-purple-50" 
                        cardBg="bg-purple-50/40 dark:bg-purple-950/10"
                        cardBorder="border-purple-100 dark:border-purple-900/30"
                    />
                    <MobileStatCard 
                        title="إجمالي الإيرادات" 
                        value={`${(stats.totalRevenue || 0).toLocaleString()} ج.م`} 
                        icon={TrendingUp} 
                        color="text-emerald-600" 
                        bg="bg-emerald-50" 
                        cardBg="bg-cyan-50/50 dark:bg-cyan-950/15"
                        cardBorder="border-cyan-100 dark:border-cyan-900/35"
                    />
                    <MobileStatCard 
                        title="إجمالي المصروفات" 
                        value={`${(stats.totalExpenses || 0).toLocaleString()} ج.م`} 
                        icon={TrendingDown} 
                        color="text-rose-600" 
                        bg="bg-rose-50" 
                        cardBg="bg-pink-50/40 dark:bg-pink-950/10"
                        cardBorder="border-pink-100 dark:border-pink-900/30"
                    />
                    <MobileStatCard 
                        title="صافي الربح" 
                        value={`${(stats.totalNetProfit || 0).toLocaleString()} ج.م`} 
                        icon={DollarSign} 
                        color="text-indigo-600" 
                        bg="bg-indigo-50" 
                        cardBg="bg-sky-50/60 dark:bg-sky-950/20"
                        cardBorder="border-sky-100 dark:border-sky-900/40"
                    />
                </div>
            </div>

            {/* 5. Support CTA */}
            <div className="bg-indigo-900 dark:bg-slate-950 text-white p-4 border border-white/10 rounded-none shadow-lg text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rotate-45 blur-xl pointer-events-none" />
                <h4 className="text-xs font-black mb-1">تحتاج إلى مساعدة فنية؟</h4>
                <p className="text-[9px] text-white/60 mb-3 font-bold">الدعم الفني المباشر لمدير النظام جاهز دائماً</p>
                <button
                    onClick={() => window.open('https://wa.me/message/DAREEN', '_blank')}
                    className="w-full h-9 bg-amber-500 hover:bg-amber-600 text-white text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 border border-amber-400/50 rounded-none active:scale-[0.98]"
                >
                    <Headphones size={12} />
                    <span>تواصل مع الدعم الفني</span>
                </button>
            </div>
        </div>
    );
};

/* Quick Action Sub-component */
const QuickActionItem = ({ href, icon: Icon, label, color }: { href: string; icon: any; label: string; color: string }) => (
    <Link 
        to={href}
        className="flex flex-col items-center justify-center p-3 border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all rounded-none group active:scale-[0.96]"
    >
        <div className={cn("w-10 h-10 rounded-none flex items-center justify-center text-white mb-2 shadow-sm transition-transform group-hover:scale-105", color)}>
            <Icon size={18} />
        </div>
        <span className="text-[9px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-tight text-center leading-none">
            {label}
        </span>
    </Link>
);

/* Stat Card Sub-component */
const MobileStatCard = ({ title, value, icon: Icon, color, bg, cardBg, cardBorder }: { title: string; value: string | number; icon: any; color: string; bg: string; cardBg: string; cardBorder: string }) => (
    <div className={cn("p-3 flex items-center gap-3 rounded-none border shadow-sm transition-all", cardBg, cardBorder)}>
        <div className={cn("stats-icon-box flex items-center justify-center shrink-0 border border-slate-900/10", bg)}>
            <Icon className={color} />
        </div>
        <div className="flex flex-col min-w-0">
            <h4 className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase leading-none mb-1.5 truncate tracking-tight">{title}</h4>
            <span className="text-base font-black text-slate-900 dark:text-white tabular-nums tracking-tighter leading-none">
                {value ?? 0}
            </span>
        </div>
    </div>
);
