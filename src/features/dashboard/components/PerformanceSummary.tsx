import { TrendingUp } from 'lucide-react';
import type { DashboardStats as Stats } from '../types';

interface PerformanceSummaryProps {
    stats: Stats;
    isTeacher: boolean;
}

export const PerformanceSummary = ({ stats, isTeacher }: PerformanceSummaryProps) => {
    return (
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-1 h-full bg-emerald-600"></div>
            <div className="p-4 border-b border-gray-50 dark:border-slate-800 flex items-center justify-between bg-emerald-50/10 dark:bg-emerald-900/10">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-600 text-white rounded-lg shadow-sm">
                        <TrendingUp size={16} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-xs uppercase tracking-tight">ملخص الأداء</h3>
                        <p className="text-[9px] font-medium text-gray-400 uppercase tracking-tighter">{isTeacher ? 'إحصائياتك الشخصية' : 'مؤشرات الكفاءة'}</p>
                    </div>
                </div>
            </div>
            <div className="p-4 space-y-5">
                <div className="relative">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">معدل الحضور</span>
                        <span className="text-sm font-black text-emerald-600 tabular-nums">{stats.attendanceRate}%</span>
                    </div>
                    <div className="h-2 bg-gray-50 dark:bg-slate-800 rounded-full overflow-hidden relative">
                        <div
                            className="absolute top-0 right-0 h-full bg-emerald-500 transition-all duration-1000"
                            style={{ width: `${stats.attendanceRate}%` }}
                        ></div>
                    </div>
                </div>

                {!isTeacher && (
                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-indigo-50/30 dark:bg-indigo-900/10 border border-indigo-100/50 dark:border-indigo-900/30 rounded-xl relative overflow-hidden">
                            <p className="text-[9px] font-bold text-indigo-600 uppercase mb-1">مدفوع</p>
                            <h4 className="text-xl font-black text-indigo-950 dark:text-white tabular-nums">{stats.paidInvoices}</h4>
                        </div>
                        <div className="p-3 bg-rose-50/30 dark:bg-rose-900/10 border border-rose-100/50 dark:border-rose-900/30 rounded-xl relative overflow-hidden">
                            <p className="text-[9px] font-bold text-rose-600 uppercase mb-1">معلق</p>
                            <h4 className="text-xl font-black text-rose-950 dark:text-white tabular-nums">{stats.pendingInvoices}</h4>
                        </div>
                    </div>
                )}

                {isTeacher && (
                            <div className="p-5 bg-emerald-50 border-2 border-gray-950 shadow-[4px_4px_0px_0px_black]">
                                <p className="text-[10px] font-black text-emerald-600 uppercase mb-2">الحصص المنجزة</p>
                                <h4 className="text-3xl font-black text-gray-950 font-mono">{stats.completedSessions}</h4>
                            </div>
                        </div>

                        <div className="p-6 bg-gray-950 text-white border-2 border-gray-950 shadow-[4px_4px_0px_0px_#444]">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-[10px] font-black text-primary-400 uppercase tracking-widest">التقدم الشهري</span>
                                <span className="text-xs font-black bg-white/10 px-3 py-1 border border-white/20">
                                    {stats.monthCompletedSessions} / {stats.monthTotalSessions} حـصـة
                                </span>
                            </div>
                            <div className="h-4 bg-white/10 border-2 border-white/20 overflow-hidden relative">
                                <div
                                    className="h-full bg-primary-500 transition-all duration-700"
                                    style={{ width: `${stats.monthTotalSessions > 0 ? Math.round((stats.monthCompletedSessions / stats.monthTotalSessions) * 100) : 0}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
