import { TrendingUp } from 'lucide-react';
import type { DashboardStats as Stats } from '../types';

interface PerformanceSummaryProps {
    stats: Stats;
    isTeacher: boolean;
}

export const PerformanceSummary = ({ stats, isTeacher }: PerformanceSummaryProps) => {
    return (
        <div className="bg-white border-4 border-gray-950 dark:bg-gray-900 dark:border-gray-800 shadow-[10px_10px_0px_0px_black] dark:shadow-[10px_10px_0px_0px_rgba(255,255,255,0.05)] relative overflow-hidden group rounded-none">
            <div className="absolute top-0 right-0 w-2 h-full bg-emerald-600 border-l-2 border-gray-950"></div>
            <div className="p-6 border-b-4 border-gray-950 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/20">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-600 text-white border-2 border-gray-950 shadow-[2px_2px_0px_0px_#444]">
                        <TrendingUp size={20} />
                    </div>
                    <div>
                        <h3 className="font-black text-gray-950 dark:text-white text-sm lg:text-base uppercase tracking-tight">ملخص الأداء العام</h3>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{isTeacher ? 'إحصائياتك الشخصية' : 'مؤشرات الكفاءة'}</p>
                    </div>
                </div>
            </div>
            <div className="p-6 space-y-8">
                <div className="relative">
                    <div className="flex justify-between items-end mb-3">
                        <span className="text-xs font-black text-gray-500 uppercase tracking-widest">معدل الحضور العام</span>
                        <div className="bg-emerald-50 px-3 py-1 border-2 border-emerald-600">
                            <span className="text-xl font-black text-emerald-600 font-mono">{stats.attendanceRate}%</span>
                        </div>
                    </div>
                    <div className="h-4 bg-gray-100 dark:bg-gray-800 border-2 border-gray-950 overflow-hidden relative">
                        <div
                            className="absolute top-0 left-0 h-full bg-emerald-500 transition-all duration-1000"
                            style={{ width: `${stats.attendanceRate}%` }}
                        >
                        </div>
                    </div>
                </div>

                {!isTeacher && (
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-5 bg-primary-50 dark:bg-primary-900/10 border-2 border-gray-950 dark:border-primary-500/20 relative overflow-hidden shadow-[4px_4px_0px_0px_black]">
                            <p className="text-[10px] font-black text-primary-600 uppercase mb-2">فواتير مدفوعة</p>
                            <h4 className="text-3xl font-black text-primary-950 dark:text-white font-mono">{stats.paidInvoices}</h4>
                        </div>
                        <div className="p-5 bg-rose-50 dark:bg-rose-900/10 border-2 border-gray-950 dark:border-rose-500/20 relative overflow-hidden shadow-[4px_4px_0px_0px_black]">
                            <p className="text-[10px] font-black text-rose-600 uppercase mb-2">فواتير معلقة</p>
                            <h4 className="text-3xl font-black text-rose-950 dark:text-white font-mono">{stats.pendingInvoices}</h4>
                        </div>
                    </div>
                )}

                {isTeacher && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-5 bg-primary-50 border-2 border-gray-950 shadow-[4px_4px_0px_0px_black]">
                                <p className="text-[10px] font-black text-primary-600 uppercase mb-2">طلابي</p>
                                <h4 className="text-3xl font-black text-gray-950 font-mono">{stats.studentsCount}</h4>
                            </div>
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
