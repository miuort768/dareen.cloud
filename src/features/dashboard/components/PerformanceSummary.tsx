import { TrendingUp, Users, CheckCircle, Target } from 'lucide-react';
import type { DashboardStats as Stats } from '../types';

interface PerformanceSummaryProps {
    stats: Stats;
    isTeacher: boolean;
}

export const PerformanceSummary = ({ stats, isTeacher }: PerformanceSummaryProps) => {
    return (
        <div className="bg-white dark:bg-slate-900 border-2 border-gray-950 dark:border-slate-800 shadow-[2px_2px_0px_0px_black] rounded-none relative overflow-hidden group h-full">
            <div className="absolute top-0 right-0 w-1 h-full bg-emerald-600"></div>
            <div className="p-4 border-b-2 border-gray-950 dark:border-slate-800 flex items-center justify-between bg-emerald-600">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white text-gray-950 rounded-none border-2 border-gray-950">
                        <TrendingUp size={16} />
                    </div>
                    <div>
                        <h3 className="font-black text-white text-xs uppercase tracking-tighter italic">ملخص الأداء</h3>
                        <p className="text-[9px] font-black text-white/70 uppercase tracking-tighter">PERFORMANCE CENTER</p>
                    </div>
                </div>
            </div>

            <div className="p-4 space-y-6">
                {/* Attendance Metric */}
                <div className="relative">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter italic">معدل الحضور</span>
                        <span className="text-sm font-black text-gray-950 dark:text-white tabular-nums">{stats.attendanceRate}%</span>
                    </div>
                    <div className="h-3 bg-gray-50 dark:bg-slate-800 border-2 border-gray-950 rounded-none overflow-hidden relative">
                        <div
                            className="absolute top-0 right-0 h-full bg-emerald-500 transition-all duration-1000"
                            style={{ width: `${stats.attendanceRate}%` }}
                        ></div>
                    </div>
                </div>

                {isTeacher ? (
                    /* Teacher Specific Metrics */
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 bg-primary-50 dark:bg-primary-900/10 border-2 border-gray-950 rounded-none shadow-[2px_2px_0px_0px_black]">
                                <div className="flex items-center gap-2 mb-1">
                                    <Users size={12} className="text-primary-600" />
                                    <p className="text-[9px] font-black text-primary-600 uppercase">الطلاب</p>
                                </div>
                                <h4 className="text-lg font-black text-gray-950 dark:text-white">{stats.studentsCount}</h4>
                            </div>
                            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/10 border-2 border-gray-950 rounded-none shadow-[2px_2px_0px_0px_black]">
                                <div className="flex items-center gap-2 mb-1">
                                    <CheckCircle size={12} className="text-emerald-600" />
                                    <p className="text-[9px] font-black text-emerald-600 uppercase">تم الإنجاز</p>
                                </div>
                                <h4 className="text-lg font-black text-gray-950 dark:text-white">{stats.completedSessions}</h4>
                            </div>
                        </div>

                        <div className="bg-gray-950 p-4 border-2 border-gray-950 rounded-none text-white shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)]">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-[9px] font-black text-primary-400 uppercase tracking-widest italic flex items-center gap-1">
                                    <Target size={12} /> التقدم الشهري
                                </span>
                                <span className="text-[10px] font-black bg-white/10 px-2 py-0.5 border border-white/20">
                                    {stats.monthCompletedSessions} / {stats.monthTotalSessions}
                                </span>
                            </div>
                            <div className="h-2.5 bg-white/10 border border-white/20 rounded-none overflow-hidden">
                                <div
                                    className="h-full bg-primary-500 transition-all duration-700"
                                    style={{ width: `${stats.monthTotalSessions > 0 ? Math.round((stats.monthCompletedSessions / stats.monthTotalSessions) * 100) : 0}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Admin Specific Metrics */
                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-indigo-50 dark:bg-indigo-900/10 border-2 border-gray-950 rounded-none relative overflow-hidden shadow-[2px_2px_0px_0px_black]">
                            <p className="text-[9px] font-black text-indigo-600 uppercase mb-1">مدفوع</p>
                            <h4 className="text-xl font-black text-gray-950 dark:text-white tabular-nums">{stats.paidInvoices}</h4>
                        </div>
                        <div className="p-3 bg-rose-50 dark:bg-rose-900/10 border-2 border-gray-950 rounded-none relative overflow-hidden shadow-[2px_2px_0px_0px_black]">
                            <p className="text-[9px] font-black text-rose-600 uppercase mb-1">معلق</p>
                            <h4 className="text-xl font-black text-gray-950 dark:text-white tabular-nums">{stats.pendingInvoices}</h4>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
