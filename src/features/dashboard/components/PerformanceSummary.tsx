import { Users, CheckCircle, Activity, Layout } from 'lucide-react';
import type { DashboardStats as Stats } from '../types';

interface PerformanceSummaryProps {
    stats: Stats;
    isTeacher: boolean;
}

export const PerformanceSummary = ({ stats, isTeacher }: PerformanceSummaryProps) => {
    return (
        <div className="bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] border border-white dark:border-slate-800 p-8 shadow-2xl shadow-indigo-500/5 transition-all duration-500 hover:shadow-indigo-500/10 h-full">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-500/10 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-500/20">
                        <Activity size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">ملخص الأداء</h3>
                        <p className="text-sm font-medium text-gray-400">تحليل النشاط الحالي</p>
                    </div>
                </div>
            </div>

            <div className="space-y-8">
                {/* Attendance Metric */}
                <div className="bg-slate-50/50 dark:bg-slate-800/50 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                            <Layout size={16} className="text-indigo-500" />
                            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">معدل الحضور اليومي</span>
                        </div>
                        <span className="text-lg font-black text-slate-900 dark:text-white tabular-nums">{stats.attendanceRate}%</span>
                    </div>
                    <div className="h-4 bg-white dark:bg-slate-900 rounded-full border border-slate-200 dark:border-slate-700 overflow-hidden relative p-1">
                        <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-1000 shadow-lg shadow-indigo-500/20"
                            style={{ width: `${stats.attendanceRate}%` }}
                        ></div>
                    </div>
                </div>

                {isTeacher ? (
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-6 bg-indigo-500/5 border border-indigo-500/20 rounded-[2rem] group hover:bg-indigo-500 transition-all duration-500">
                            <div className="flex items-center gap-3 mb-2">
                                <Users size={20} className="text-indigo-500 group-hover:text-white" />
                                <p className="text-xs font-bold text-indigo-500 group-hover:text-indigo-100 uppercase">الطلاب</p>
                            </div>
                            <h4 className="text-2xl font-black text-slate-900 dark:text-white group-hover:text-white">{stats.studentsCount}</h4>
                        </div>
                        <div className="p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-[2rem] group hover:bg-emerald-500 transition-all duration-500">
                            <div className="flex items-center gap-3 mb-2">
                                <CheckCircle size={20} className="text-emerald-500 group-hover:text-white" />
                                <p className="text-xs font-bold text-emerald-500 group-hover:text-emerald-100 uppercase">الحصص</p>
                            </div>
                            <h4 className="text-2xl font-black text-slate-900 dark:text-white group-hover:text-white">{stats.completedSessions}</h4>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-6">
                        <div className="p-6 bg-violet-500/5 border border-violet-500/10 rounded-[2rem] relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500 opacity-5 blur-2xl group-hover:opacity-20 transition-opacity"></div>
                            <p className="text-xs font-bold text-violet-600 dark:text-violet-400 uppercase mb-2">فواتير مدفوعة</p>
                            <h4 className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">{stats.paidInvoices}</h4>
                        </div>
                        <div className="p-6 bg-rose-500/5 border border-rose-500/10 rounded-[2rem] relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500 opacity-5 blur-2xl group-hover:opacity-20 transition-opacity"></div>
                            <p className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase mb-2">فواتير معلقة</p>
                            <h4 className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">{stats.pendingInvoices}</h4>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
