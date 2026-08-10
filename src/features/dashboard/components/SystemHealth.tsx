import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, XCircle, RefreshCw, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DashboardStats } from '../types';

interface SystemHealthProps {
    stats: DashboardStats;
}

export const SystemHealth = ({ stats }: SystemHealthProps) => {
    const [lastChecked, setLastChecked] = useState(new Date());
    useEffect(() => {
        const timer = setInterval(() => setLastChecked(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const issues: { label: string; severity: 'error' | 'warning' }[] = [];
    if (stats.lowBalanceCount > 5) issues.push({ label: `${stats.lowBalanceCount} طالب رصيد منخفض`, severity: 'error' });
    else if (stats.lowBalanceCount > 0) issues.push({ label: `${stats.lowBalanceCount} طالب رصيد منخفض`, severity: 'warning' });
    if (stats.pendingInvoices > 10) issues.push({ label: `${stats.pendingInvoices} فاتورة معلقة`, severity: 'error' });
    else if (stats.pendingInvoices > 0) issues.push({ label: `${stats.pendingInvoices} فاتورة معلقة`, severity: 'warning' });
    if (stats.attendanceRate < 50) issues.push({ label: `نسبة حضور ${stats.attendanceRate}%`, severity: 'error' });
    else if (stats.attendanceRate < 75) issues.push({ label: `نسبة حضور ${stats.attendanceRate}%`, severity: 'warning' });

    const hasErrors = issues.some(i => i.severity === 'error');
    const hasWarnings = issues.some(i => i.severity === 'warning');
    const allGood = issues.length === 0;

    const timeAgo = () => {
        const seconds = Math.floor((Date.now() - lastChecked.getTime()) / 1000);
        if (seconds < 60) return 'قبل لحظات';
        if (seconds < 120) return 'قبل دقيقة';
        return `قبل ${Math.floor(seconds / 60)} دقائق`;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-card dark:bg-card border border-border dark:border-primary/20 shadow-elevation-1 p-5"
            dir="rtl"
        >
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "w-9 h-9 rounded-xl flex items-center justify-center",
                        allGood ? "bg-success-soft" : hasErrors ? "bg-error-soft" : "bg-warning-soft dark:bg-primary/10"
                    )}>
                        {allGood ? (
                            <CheckCircle2 size={16} className="text-success" />
                        ) : hasErrors ? (
                            <XCircle size={16} className="text-error" />
                        ) : (
                            <AlertTriangle size={16} className="text-warning dark:text-primary" />
                        )}
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-main dark:text-main">حالة النظام</h3>
                        <p className={cn(
                            "text-[10px] font-medium",
                            allGood ? "text-success" : hasErrors ? "text-error" : "text-warning"
                        )}>
                            {allGood ? 'كل الأنظمة تعمل' : `${issues.length} مشكلة`}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-muted dark:text-dim">
                    <RefreshCw size={10} />
                    <span>{timeAgo()}</span>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {allGood ? (
                    <motion.div
                        key="all-good"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center py-4"
                    >
                        <div className="w-16 h-16 rounded-full bg-success-soft flex items-center justify-center mb-3">
                            <CheckCircle2 size={32} className="text-success" />
                        </div>
                        <p className="text-sm font-bold text-main dark:text-main">كل الأنظمة تعمل</p>
                        <p className="text-[11px] text-muted dark:text-muted mt-1">لا توجد مشاكل في النظام</p>
                        <div className="flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-lg bg-surface dark:bg-hover text-muted dark:text-muted text-[10px] font-medium">
                            <Activity size={10} className="text-success" />
                            آخر فحص: {timeAgo()}
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="issues"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-2"
                    >
                        {issues.map((issue, i) => (
                            <div
                                key={i}
                                className={cn(
                                    "flex items-center gap-3 p-3 rounded-xl border border-border dark:border-primary/20",
                                    issue.severity === 'error' ? "bg-error-soft dark:bg-error/5" : "bg-warning-soft dark:bg-primary/5"
                                )}
                            >
                                <div className={cn(
                                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                                    issue.severity === 'error' ? "bg-error-soft text-error" : "bg-warning-soft text-warning"
                                )}>
                                    {issue.severity === 'error' ? <XCircle size={14} /> : <AlertTriangle size={14} />}
                                </div>
                                <p className="text-xs font-bold text-main dark:text-main">{issue.label}</p>
                                <span className={cn(
                                    "me-auto text-[10px] font-bold px-2 py-0.5 rounded-md",
                                    issue.severity === 'error' ? "bg-error-soft text-error" : "bg-warning-soft text-warning"
                                )}>
                                    {issue.severity === 'error' ? 'حرج' : 'تحذير'}
                                </span>
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};
