import { useState, useEffect, useMemo } from 'react';
import { 
    Users, BookOpen, Calendar, Megaphone, Clock, ShieldCheck, 
    Headphones, Activity, Bell, FilePlus, UserPlus, TrendingUp, 
    TrendingDown, Award, Star
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '../../../lib/utils';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface MobileAdminDashboardProps {
    stats: any;
    lowBalanceStudents: any[];
}

export const MobileAdminDashboard = ({
    stats,
    lowBalanceStudents,
}: MobileAdminDashboardProps) => {
    const navigate = useNavigate();
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const lowBalanceCount = lowBalanceStudents.length;
    
    // Academic calculations
    const todaySessions = stats.todaySessions || 0;
    const completedSessions = stats.completedSessions || 0;
    const completionRate = todaySessions > 0 ? Math.round((completedSessions / todaySessions) * 100) : 0;

    return (
        <div className="space-y-4 pb-24 animate-in fade-in duration-700 text-right" dir="rtl">
            
            {/* ═══════════════ 1. APP-STYLE GRADIENT HEADER ═══════════════ */}
            <div className="flex justify-between items-center bg-gradient-to-r from-indigo-600 to-indigo-700 dark:from-indigo-905 dark:to-indigo-950 p-4 rounded-3xl shadow-lg border-b-4 border-indigo-800 transition-all">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white border border-white/20 shadow-sm">
                        <ShieldCheck size={24} />
                    </div>
                    <div>
                        <h1 className="text-sm font-black text-white leading-tight">
                            مرحباً... المدير العام 👋
                        </h1>
                        <p className="text-[9px] font-bold text-white/80 mt-0.5">
                            لوحة الإدارة العليا • {format(new Date(), 'eeee, d MMMM', { locale: ar })}
                        </p>
                    </div>
                </div>

                {/* Clock Badge */}
                <div className="px-3 py-1.5 bg-white/10 border border-white/10 rounded-xl text-white font-black text-[10px] tabular-nums">
                    {currentTime.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', hour12: true })}
                </div>
            </div>

            {/* ═══════════════ 2. URGENT NOTIFICATION (iOS Lockscreen Style) ═══════════════ */}
            {lowBalanceCount > 0 && (
                <div className="bg-rose-500/10 border-2 border-dashed border-rose-200 dark:border-rose-900/30 p-4 rounded-2xl flex items-center justify-between gap-4 animate-pulse">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 bg-rose-500 text-white rounded-full flex items-center justify-center shrink-0">
                            <Bell size={18} className="animate-bounce" />
                        </div>
                        <div className="min-w-0">
                            <h3 className="font-black text-xs text-rose-600 dark:text-rose-400">إشعار مالي عاجل!</h3>
                            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                                يوجد {lowBalanceCount} طلاب انتهى أو قارب رصيدهم على الانتهاء.
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={() => navigate('/students')}
                        className="px-4 py-2 bg-rose-600 text-white font-black text-[9px] uppercase tracking-widest rounded-xl hover:bg-rose-700 active:scale-95 transition-all shadow-md shrink-0"
                    >
                        تحصيل
                    </button>
                </div>
            )}

            {/* ═══════════════ 3. QUICK STATS CARDS ═══════════════ */}
            <div className="grid grid-cols-3 gap-2">
                <QuickStatCard icon={Users} label="الطلاب" value={stats.studentsCount} color="indigo" />
                <QuickStatCard icon={BookOpen} label="الاشتراكات" value={stats.totalEnrollments} color="blue" />
                <QuickStatCard icon={Star} label="صافي الربح" value={`${(stats.totalNetProfit || 0).toLocaleString()} ج.م`} color="rose" />
            </div>

            {/* ═══════════════ 4. NAVIGATION GRID (Parent Style buttons) ═══════════════ */}
            <div className="grid grid-cols-2 gap-2">
                <NavButton label="طالب جديد" icon={UserPlus} onClick={() => navigate('/students?action=new')} />
                <NavButton label="إصدار فاتورة" icon={FilePlus} onClick={() => navigate('/student-invoices?action=new')} />
                <NavButton label="الجدول الدراسي" icon={Calendar} onClick={() => navigate('/schedule')} />
                <NavButton label="بث إعلان عام" icon={Megaphone} onClick={() => navigate('/announcements?action=new')} />
            </div>

            {/* ═══════════════ 5. TODAY'S CLASS PROGRESS (Parent Style Progress Bar) ═══════════════ */}
            <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-3xl p-5 text-white shadow-xl relative overflow-hidden">
                <div className="absolute right-0 bottom-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -translate-x-1/2 translate-y-1/2" />
                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <span className="bg-white/20 text-white border border-white/20 text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-widest">
                                النشاط الأكاديمي اليومي
                            </span>
                            <h3 className="text-sm font-black mt-2">معدل تنفيذ الحصص</h3>
                        </div>
                        <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center shrink-0 border border-white/10">
                            <Award size={20} />
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <div className="flex justify-between items-center text-[10px] font-black opacity-90">
                            <span>تم تنفيذ {completedSessions} من {todaySessions} حصة</span>
                            <span>{completionRate}%</span>
                        </div>
                        <div className="w-full h-2.5 bg-white/15 rounded-full overflow-hidden">
                            <div 
                                style={{ width: `${Math.min(completionRate, 100)}%` }}
                                className="h-full bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-all duration-700"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══════════════ 6. SYSTEM FINANCIAL METRICS (List Style) ═══════════════ */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 space-y-3">
                <div className="flex items-center gap-2 mb-1 px-1">
                    <TrendingUp className="text-emerald-500" size={16} />
                    <h3 className="text-xs font-black text-slate-900 dark:text-white">السيولة النقدية والمصاريف</h3>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <div className="bg-emerald-50/50 dark:bg-emerald-950/10 p-3 rounded-2xl border border-emerald-100/30 dark:border-emerald-900/20">
                        <div className="flex items-center gap-2 mb-1">
                            <TrendingUp size={14} className="text-emerald-600" />
                            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">إجمالي الإيرادات</span>
                        </div>
                        <p className="text-xs font-black text-emerald-600 tabular-nums">{(stats.totalRevenue || 0).toLocaleString()} ج.م</p>
                    </div>

                    <div className="bg-rose-50/40 dark:bg-rose-950/10 p-3 rounded-2xl border border-rose-100/30 dark:border-rose-900/20">
                        <div className="flex items-center gap-2 mb-1">
                            <TrendingDown size={14} className="text-rose-600" />
                            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">إجمالي المصروفات</span>
                        </div>
                        <p className="text-xs font-black text-rose-600 tabular-nums">{(stats.totalExpenses || 0).toLocaleString()} ج.م</p>
                    </div>
                </div>
            </div>

            {/* ═══════════════ 7. WHATSAPP SUPPORT FOOTER ═══════════════ */}
            <div className="bg-[#5c4fb1] dark:bg-[#4a3f9e] p-5 rounded-3xl shadow-lg text-white flex flex-col items-center justify-between gap-6 relative overflow-hidden">
                <div className="absolute right-0 bottom-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -translate-x-1/2 translate-y-1/2" />
                <div className="text-center relative z-10 w-full">
                    <h4 className="text-xs font-black mb-1">هل تواجه أي مشاكل؟</h4>
                    <p className="text-[9px] font-bold opacity-80 leading-tight">فريق الدعم الفني لمدير النظام متاح لخدمتك فوراً</p>
                </div>
                <button 
                    onClick={() => window.open('https://wa.me/message/DAREEN', '_blank')}
                    className="bg-white text-[#5c4fb1] px-5 py-2.5 rounded-2xl font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-2.5 transition-transform active:scale-95 shadow-xl w-full"
                >
                    <Headphones size={12} />
                    تواصل مع الدعم الفني
                </button>
            </div>

        </div>
    );
};

/* Quick Stat Card Sub-component (Parent Style) */
const QuickStatCard = ({ icon: Icon, label, value, color }: any) => {
    const colors: any = {
        indigo: "bg-indigo-50 dark:bg-indigo-900/10 text-indigo-500",
        blue: "bg-blue-50 dark:bg-blue-900/10 text-blue-500",
        rose: "bg-rose-50 dark:bg-rose-900/10 text-rose-500"
    };
    return (
        <div className="bg-white dark:bg-slate-900 py-3 px-2 rounded-2xl shadow-sm border border-slate-50 dark:border-slate-800/80 flex flex-col items-center justify-center text-center">
            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center mb-1.5", colors[color])}>
                <Icon size={14} />
            </div>
            <span className="text-xs font-black text-slate-900 dark:text-white leading-none truncate w-full">{value}</span>
            <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 mt-1">{label}</span>
        </div>
    );
};

/* Navigation Button Sub-component (Parent Style) */
const NavButton = ({ label, icon: Icon, onClick }: any) => (
    <button 
        onClick={onClick}
        className="bg-[#f2f0ff] dark:bg-indigo-950/20 p-3.5 rounded-2xl border border-indigo-100/30 dark:border-indigo-900/20 flex flex-col items-center justify-center gap-2 transition-all active:scale-95 hover:bg-white dark:hover:bg-slate-900 hover:shadow-md group"
    >
        <div className="w-9 h-9 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm group-hover:scale-110 transition-transform">
            <Icon size={16} strokeWidth={1.5} />
        </div>
        <span className="text-[9px] font-black text-slate-700 dark:text-slate-400 tracking-tight leading-none">{label}</span>
    </button>
);
