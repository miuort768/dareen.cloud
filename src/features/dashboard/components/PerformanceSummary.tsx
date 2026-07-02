import { Users, CheckCircle, Activity, Layout } from 'lucide-react';
import type { DashboardStats as Stats } from '../types';

interface PerformanceSummaryProps {
    stats: Stats;
    isTeacher: boolean;
}

export const PerformanceSummary = ({ stats, isTeacher }: PerformanceSummaryProps) => {
    return (
        <div className="bg-white/70 dark:bg-primary-active/50 backdrop-blur-xl rounded-[2.5rem] border border-white dark:border-border p-8 shadow-2xl shadow-primary/5 transition-all duration-500 hover:shadow-primary/10 h-full">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-success/10 text-success rounded-2xl flex items-center justify-center border border-success/20">
                        <Activity size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-normal text-main dark:text-on-primary">ملخص الأداء</h3>
                        <p className="text-sm font-medium text-muted">تحليل النشاط الحالي</p>
                    </div>
                </div>
            </div>

            <div className="space-y-8">
                {/* Attendance Metric */}
                <div className="bg-background/50 dark:bg-primary-active/50 rounded-[2rem] p-6 border border-border dark:border-border">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                            <Layout size={16} className="text-primary" />
                            <span className="text-xs font-normal text-muted dark:text-muted uppercase tracking-wider">معدل الحضور اليومي</span>
                        </div>
                        <span className="text-lg font-medium text-main dark:text-on-primary tabular-nums">{stats.attendanceRate}%</span>
                    </div>
                    <div className="h-4 bg-white dark:bg-primary-active rounded-full border border-border dark:border-border overflow-hidden relative p-1">
                        <div
                            className="h-full bg-gradient-to-r from-[var(--bg-primary)] to--[var(--bg-success)] rounded-full transition-all duration-1000 shadow-lg shadow-primary/20"
                            style={{ width: `${stats.attendanceRate}%` }}
                        ></div>
                    </div>
                </div>

                {isTeacher ? (
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-6 bg-primary/5 border border-primary/20 rounded-[2rem] group hover:bg-primary-soft0 transition-all duration-500">
                            <div className="flex items-center gap-3 mb-2">
                                <Users size={20} className="text-primary group-hover:text-on-primary" />
                                <p className="text-xs font-normal text-primary group-hover:text-primary uppercase">الطلاب</p>
                            </div>
                            <h4 className="text-2xl font-medium text-main dark:text-on-primary group-hover:text-on-primary">{stats.studentsCount}</h4>
                        </div>
                        <div className="p-6 bg-success/5 border border-success/20 rounded-[2rem] group hover:bg-success transition-all duration-500">
                            <div className="flex items-center gap-3 mb-2">
                                <CheckCircle size={20} className="text-success group-hover:text-on-primary" />
                                <p className="text-xs font-normal text-success group-hover:text-success uppercase">الحصص</p>
                            </div>
                            <h4 className="text-2xl font-medium text-main dark:text-on-primary group-hover:text-on-primary">{stats.completedSessions}</h4>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-6">
                        <div className="p-6 bg-primary/5 border border-primary/10 rounded-[2rem] relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-primary opacity-5 blur-2xl group-hover:opacity-20 transition-opacity"></div>
                            <p className="text-xs font-normal text-primary dark:text-primary uppercase mb-2">فواتير مدفوعة</p>
                            <h4 className="text-2xl font-medium text-main dark:text-on-primary tabular-nums">{stats.paidInvoices}</h4>
                        </div>
                        <div className="p-6 bg-error/5 border border-error/10 rounded-[2rem] relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-error opacity-5 blur-2xl group-hover:opacity-20 transition-opacity"></div>
                            <p className="text-xs font-normal text-error dark:text-error uppercase mb-2">فواتير معلقة</p>
                            <h4 className="text-2xl font-medium text-main dark:text-on-primary tabular-nums">{stats.pendingInvoices}</h4>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
