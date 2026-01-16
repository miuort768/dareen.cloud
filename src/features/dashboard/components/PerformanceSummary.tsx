import { TrendingUp, ArrowUpRight, Activity, Users, BookOpen, Wallet, AlertTriangle } from 'lucide-react';
import type { DashboardStats as Stats } from '../types';

interface PerformanceSummaryProps {
    stats: Stats;
    isTeacher: boolean;
}

export const PerformanceSummary = ({ stats, isTeacher }: PerformanceSummaryProps) => {
    return (
        <div className="bg-white border border-gray-100 dark:bg-gray-900 dark:border-gray-800 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-1.5 h-full bg-emerald-500"></div>
            <div className="p-6 border-b border-gray-50 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/20">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600">
                        <TrendingUp size={18} className="animate-pulse" />
                    </div>
                    <div>
                        <h3 className="font-black text-gray-900 dark:text-white text-xs uppercase tracking-tight">ملخص الأداء العام</h3>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{isTeacher ? 'إحصائياتك الشخصية' : 'مؤشرات الكفاءة'}</p>
                    </div>
                </div>
            </div>
            <div className="p-6 space-y-6">
                <div className="relative">
                    <div className="flex justify-between items-end mb-3">
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-tighter">معدل الحضور العام</span>
                        <span className="text-2xl font-black text-emerald-600 tracking-tighter">{stats.attendanceRate}%</span>
                    </div>
                    <div className="h-3 bg-gray-100 dark:bg-gray-800 overflow-hidden relative">
                        <div
                            className="absolute top-0 left-0 h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)] transition-all duration-1000"
                            style={{ width: `${stats.attendanceRate}%` }}
                        >
                            <div className="absolute top-0 right-0 w-8 h-full bg-white/30 skew-x-12 animate-[shimmer_2s_infinite]"></div>
                        </div>
                    </div>
                </div>

                {!isTeacher && (
                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 bg-primary-50/50 dark:bg-primary-900/10 border border-primary-100 dark:border-primary-900/20 relative overflow-hidden">
                            <p className="text-[10px] font-black text-primary-600/60 uppercase mb-1">فواتير مدفوعة</p>
                            <h4 className="text-xl font-black text-primary-700 dark:text-primary-400">{stats.paidInvoices}</h4>
                            <div className="absolute -bottom-2 -right-2 opacity-5">
                                <ArrowUpRight size={40} className="text-primary-900" />
                            </div>
                        </div>
                        <div className="p-4 bg-rose-50/50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/20 relative overflow-hidden">
                            <p className="text-[10px] font-black text-rose-600/60 uppercase mb-1">فواتير معلقة</p>
                            <h4 className="text-xl font-black text-rose-700 dark:text-rose-400">{stats.pendingInvoices}</h4>
                            <div className="absolute -bottom-2 -right-2 opacity-5">
                                <Activity size={40} className="text-rose-900" />
                            </div>
                        </div>
                    </div>
                )}

                {isTeacher && (
                    <div className="space-y-4">
                        {/* Teacher Stats Grid */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-4 bg-primary-50/50 dark:bg-primary-900/10 border border-primary-100 dark:border-primary-900/20 relative overflow-hidden">
                                <div className="flex items-center gap-2 mb-2">
                                    <Users size={14} className="text-primary-600" />
                                    <p className="text-[10px] font-black text-primary-600/80 uppercase">طلابي</p>
                                </div>
                                <h4 className="text-2xl font-black text-primary-700 dark:text-primary-400">{stats.studentsCount}</h4>
                                <p className="text-[9px] text-primary-500 mt-1">طالب/ة مسجل</p>
                            </div>
                            <div className="p-4 bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20 relative overflow-hidden">
                                <div className="flex items-center gap-2 mb-2">
                                    <BookOpen size={14} className="text-emerald-600" />
                                    <p className="text-[10px] font-black text-emerald-600/80 uppercase">الحصص المنجزة</p>
                                </div>
                                <h4 className="text-2xl font-black text-emerald-700 dark:text-emerald-400">{stats.completedSessions}</h4>
                                <p className="text-[9px] text-emerald-500 mt-1">حصة منجزة</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-4 bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 relative overflow-hidden">
                                <div className="flex items-center gap-2 mb-2">
                                    <Wallet size={14} className="text-amber-600" />
                                    <p className="text-[10px] font-black text-amber-600/80 uppercase">أرباح الشهر</p>
                                </div>
                                <h4 className="text-2xl font-black text-amber-700 dark:text-amber-400">{stats.monthNetProfit.toLocaleString()}</h4>
                                <p className="text-[9px] text-amber-500 mt-1">جنيه مصري</p>
                            </div>
                            <div className="p-4 bg-rose-50/50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/20 relative overflow-hidden">
                                <div className="flex items-center gap-2 mb-2">
                                    <AlertTriangle size={14} className="text-rose-600" />
                                    <p className="text-[10px] font-black text-rose-600/80 uppercase">رصيد منخفض</p>
                                </div>
                                <h4 className="text-2xl font-black text-rose-700 dark:text-rose-400">{stats.lowBalanceCount}</h4>
                                <p className="text-[9px] text-rose-500 mt-1">طالب يحتاج تجديد</p>
                            </div>
                        </div>

                        {/* Monthly Progress */}
                        <div className="p-4 bg-gradient-to-r from-primary-50/50 to-emerald-50/50 dark:from-primary-900/10 dark:to-emerald-900/10 border border-primary-100 dark:border-primary-900/20">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-[10px] font-black text-primary-600 uppercase">التقدم الشهري</span>
                                <span className="text-sm font-black text-primary-700 bg-white dark:bg-gray-800 px-2 py-0.5 rounded-sm">
                                    {stats.monthCompletedSessions} / {stats.monthTotalSessions} حصة
                                </span>
                            </div>
                            <div className="h-2 bg-gray-100 dark:bg-gray-800 overflow-hidden rounded-full">
                                <div
                                    className="h-full bg-gradient-to-r from-primary-500 to-emerald-500 transition-all duration-700"
                                    style={{ width: `${stats.monthTotalSessions > 0 ? Math.round((stats.monthCompletedSessions / stats.monthTotalSessions) * 100) : 0}%` }}
                                ></div>
                            </div>
                            <p className="text-[9px] text-gray-400 mt-2 text-center">
                                {stats.monthTotalSessions > 0 ? Math.round((stats.monthCompletedSessions / stats.monthTotalSessions) * 100) : 0}% من الحصص المجدولة هذا الشهر
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
