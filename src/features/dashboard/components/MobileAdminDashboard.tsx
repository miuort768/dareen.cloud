import { useState, useEffect } from 'react';
import { 
    Users, BookOpen, CalendarCheck, CheckCircle2, GraduationCap, 
    TrendingUp, TrendingDown, DollarSign, UserPlus, FilePlus, 
    Calendar, Megaphone, Clock, ShieldCheck, Headphones, Activity, Bell,
    ArrowUpRight, AlertCircle
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
    const [activeTab, setActiveTab] = useState<'academic' | 'finance'>('academic');

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const lowBalanceCount = lowBalanceStudents.length;
    
    // Academic calculations
    const todaySessions = stats.todaySessions || 0;
    const completedSessions = stats.completedSessions || 0;
    const completionRate = todaySessions > 0 ? Math.round((completedSessions / todaySessions) * 100) : 0;
    
    // Circular Progress stroke calculations
    const radius = 30;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (completionRate / 100) * circumference;

    return (
        <div className="space-y-4 pb-20 animate-in fade-in slide-in-from-bottom-2 duration-300 select-none bg-slate-50/50 dark:bg-slate-950/20" dir="rtl">
            
            {/* ─── 1. App Navigation Header (iOS App Style) ─── */}
            <div className="flex items-center justify-between px-1 pt-2">
                <div className="flex items-center gap-3">
                    {/* Glowing Profile Avatar */}
                    <div className="relative">
                        <div className="w-10 h-10 bg-indigo-600 text-white font-black text-xs flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-md">
                            مدير
                        </div>
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full animate-pulse" />
                    </div>
                    <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">لوحة الإدارة العليا</p>
                        <h2 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">مرحباً، المدير العام 👋</h2>
                    </div>
                </div>

                {/* Status Bell Icon */}
                <div className="relative w-9 h-9 flex items-center justify-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm active:scale-95 transition-transform">
                    <Bell size={16} className="text-slate-600 dark:text-slate-300" />
                    {lowBalanceCount > 0 && (
                        <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full" />
                    )}
                </div>
            </div>

            {/* ─── 2. iOS Push Notification Style Alert ─── */}
            {lowBalanceCount > 0 && (
                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/50 p-3.5 shadow-lg relative animate-in slide-in-from-top duration-300">
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0 border border-rose-500/20">
                            <AlertCircle size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-0.5">
                                <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">إخطار عمليات حرج</span>
                                <span className="text-[8px] font-bold text-slate-400">الآن</span>
                            </div>
                            <p className="text-[11px] font-black text-slate-900 dark:text-white leading-tight">
                                انتبه: {lowBalanceCount} طلاب بدون رصيد كافٍ!
                            </p>
                            <p className="text-[9px] font-bold text-slate-500 dark:text-slate-400 mt-1">
                                يرجى مراجعة الاشتراكات وإرسال تذكيرات الدفع لتجنب إيقاف الحصص.
                            </p>
                        </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                        <Link 
                            to="/students" 
                            className="flex-1 h-7 bg-rose-600 hover:bg-rose-700 text-[8px] font-black text-white uppercase tracking-widest flex items-center justify-center active:scale-[0.98] transition-all"
                        >
                            تحصيل الاشتراكات
                        </Link>
                    </div>
                </div>
            )}

            {/* ─── 3. Segmented Control (App Tab Bar Switcher) ─── */}
            <div className="bg-slate-100 dark:bg-slate-900/50 p-1 flex border border-slate-200/40 dark:border-slate-800/30">
                <button
                    onClick={() => setActiveTab('academic')}
                    className={cn(
                        "flex-1 py-2 text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                        activeTab === 'academic' 
                            ? "bg-white dark:bg-slate-900 text-indigo-600 shadow-sm border border-slate-200/50 dark:border-slate-800" 
                            : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    )}
                >
                    <Activity size={12} />
                    📊 المؤشرات التعليمية
                </button>
                <button
                    onClick={() => setActiveTab('finance')}
                    className={cn(
                        "flex-1 py-2 text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                        activeTab === 'finance' 
                            ? "bg-white dark:bg-slate-900 text-emerald-600 shadow-sm border border-slate-200/50 dark:border-slate-800" 
                            : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    )}
                >
                    <DollarSign size={12} />
                    💰 المؤشرات المالية
                </button>
            </div>

            {/* ─── 4. Dynamic Dashboard View (App Widgets) ─── */}
            {activeTab === 'academic' ? (
                /* ──📊 ACADEMIC HUB WIDGETS ── */
                <div className="space-y-3">
                    
                    {/* Ring Progress Hub Card */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-4 shadow-sm relative overflow-hidden">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[8px] font-black px-1.5 py-0.5 uppercase tracking-widest">
                                    معدل الإنجاز اليومي
                                </span>
                                <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight mt-1.5">حصص اليوم</h3>
                                <p className="text-[10px] font-bold text-slate-500">تم تنفيذ {completedSessions} من أصل {todaySessions} حصة</p>
                            </div>

                            {/* Circular Progress Ring */}
                            <div className="relative flex items-center justify-center shrink-0">
                                <svg className="w-18 h-18 transform -rotate-90">
                                    <circle
                                        cx="36"
                                        cy="36"
                                        r={radius}
                                        className="stroke-slate-100 dark:stroke-slate-800"
                                        strokeWidth="6"
                                        fill="transparent"
                                    />
                                    <circle
                                        cx="36"
                                        cy="36"
                                        r={radius}
                                        className="stroke-amber-500 transition-all duration-500"
                                        strokeWidth="6"
                                        fill="transparent"
                                        strokeDasharray={circumference}
                                        strokeDashoffset={strokeDashoffset}
                                        strokeLinecap="square"
                                    />
                                </svg>
                                <span className="absolute text-[11px] font-black text-slate-900 dark:text-white tabular-nums">
                                    {completionRate}%
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Dual Stats Quick Grid */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-indigo-50/50 dark:bg-indigo-950/10 border border-indigo-100 dark:border-indigo-900/30 p-3.5 shadow-sm">
                            <div className="w-8 h-8 bg-indigo-600 text-white flex items-center justify-center mb-3">
                                <Users size={16} />
                            </div>
                            <p className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-tight mb-1">إجمالي الطلاب</p>
                            <span className="text-xl font-black text-indigo-700 dark:text-indigo-400 tabular-nums">{stats.studentsCount}</span>
                        </div>

                        <div className="bg-emerald-50/40 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/30 p-3.5 shadow-sm">
                            <div className="w-8 h-8 bg-emerald-600 text-white flex items-center justify-center mb-3">
                                <BookOpen size={16} />
                            </div>
                            <p className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-tight mb-1">اشتراكات نشطة</p>
                            <span className="text-xl font-black text-emerald-700 dark:text-emerald-400 tabular-nums">{stats.totalEnrollments}</span>
                        </div>

                        <div className="bg-purple-50/40 dark:bg-purple-950/10 border border-purple-100 dark:border-purple-900/30 p-3.5 shadow-sm col-span-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-purple-600 text-white flex items-center justify-center">
                                        <GraduationCap size={16} />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-tight">إجمالي الكادر التعليمي</p>
                                        <h4 className="text-base font-black text-slate-900 dark:text-white leading-none mt-1">المعلمون والمدربون</h4>
                                    </div>
                                </div>
                                <span className="text-lg font-black text-purple-700 dark:text-purple-400 tabular-nums">{stats.teachersCount} معلم</span>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                /* ──💰 FINANCIAL APP HUB WIDGETS ── */
                <div className="space-y-3">
                    
                    {/* Fintech Credit Card / Cashflow Widget */}
                    <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white p-4 shadow-xl border border-white/5">
                        {/* Decorative card micro-elements */}
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rotate-45 blur-xl pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-16 h-16 bg-indigo-500/10 blur-xl pointer-events-none" />
                        
                        <div className="relative z-10 flex items-center justify-between mb-4">
                            <span className="text-[8px] font-black uppercase tracking-widest text-indigo-300/80">المحفظة الاستثمارية للشركة</span>
                            <div className="flex gap-1">
                                <span className="w-3 h-3 bg-white/10 rounded-full" />
                                <span className="w-3 h-3 bg-white/20 rounded-full" />
                            </div>
                        </div>

                        <div className="relative z-10 space-y-1">
                            <p className="text-[9px] text-white/50 font-black uppercase tracking-widest">صافي الأرباح المحققة</p>
                            <h3 className="text-2xl font-black text-white tabular-nums tracking-tighter flex items-center gap-1.5">
                                {(stats.totalNetProfit || 0).toLocaleString()} 
                                <span className="text-xs font-black text-indigo-300">ج.م</span>
                            </h3>
                        </div>

                        <div className="h-[1px] bg-white/10 my-4" />

                        {/* Dual Columns for Cash In & Cash Out */}
                        <div className="grid grid-cols-2 gap-4 relative z-10">
                            <div className="space-y-0.5">
                                <div className="flex items-center gap-1 text-[8px] font-black text-slate-400 uppercase tracking-widest">
                                    <TrendingUp size={10} className="text-emerald-400" />
                                    <span>إجمالي الإيرادات</span>
                                </div>
                                <p className="text-xs font-black text-emerald-400 tabular-nums">{(stats.totalRevenue || 0).toLocaleString()} ج.م</p>
                            </div>

                            <div className="space-y-0.5">
                                <div className="flex items-center gap-1 text-[8px] font-black text-slate-400 uppercase tracking-widest">
                                    <TrendingDown size={10} className="text-rose-400" />
                                    <span>إجمالي المصروفات</span>
                                </div>
                                <p className="text-xs font-black text-rose-400 tabular-nums">{(stats.totalExpenses || 0).toLocaleString()} ج.م</p>
                            </div>
                        </div>
                    </div>

                    {/* Quick Financial Operations Actions */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">إدارة الفواتير والمدفوعات</h4>
                                <p className="text-[9px] font-bold text-slate-400 mt-1">مراجعة التقارير وسندات الصرف المالي</p>
                            </div>
                            <Link 
                                to="/student-invoices" 
                                className="h-8 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-[8px] font-black uppercase tracking-widest flex items-center justify-center active:scale-95 transition-all shadow-sm"
                            >
                                فتح الحسابات
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── 5. App Quick Actions Grid (Rounded app icons look) ─── */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
                <h3 className="text-[9px] font-black text-slate-400 uppercase mb-4 tracking-widest text-right">أدوات الوصول السريع</h3>
                <div className="grid grid-cols-4 gap-3">
                    <AppActionItem href="/students?action=new" icon={UserPlus} label="طالب جديد" color="bg-indigo-600" />
                    <AppActionItem href="/student-invoices?action=new" icon={FilePlus} label="إصدار فاتورة" color="bg-emerald-600" />
                    <AppActionItem href="/schedule" icon={Calendar} label="الجدول" color="bg-amber-500" />
                    <AppActionItem href="/announcements?action=new" icon={Megaphone} label="بث إعلان" color="bg-rose-600" />
                </div>
            </div>

            {/* ─── 6. Support CTA ─── */}
            <div className="bg-indigo-950 dark:bg-slate-950 text-white p-4 shadow-lg text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rotate-45 blur-xl pointer-events-none" />
                <h4 className="text-xs font-black mb-1">مركز الدعم الفني لمدير النظام</h4>
                <p className="text-[9px] text-white/50 mb-4 font-bold">تواصل مباشر وسريع لحل أي استفسارات أو مشاكل تقنية</p>
                <button
                    onClick={() => window.open('https://wa.me/message/DAREEN', '_blank')}
                    className="w-full h-10 bg-amber-500 hover:bg-amber-600 text-white text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                >
                    <Headphones size={12} />
                    <span>تواصل معنا عبر واتساب</span>
                </button>
            </div>
        </div>
    );
};

/* App Action Item Sub-component */
const AppActionItem = ({ href, icon: Icon, label, color }: { href: string; icon: any; label: string; color: string }) => (
    <Link 
        to={href}
        className="flex flex-col items-center justify-center group active:scale-[0.94] transition-all"
    >
        <div className={cn("w-12 h-12 flex items-center justify-center text-white mb-2 shadow-md transition-transform group-hover:scale-105", color)}>
            <Icon size={20} />
        </div>
        <span className="text-[9px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-tight text-center leading-tight">
            {label}
        </span>
    </Link>
);
