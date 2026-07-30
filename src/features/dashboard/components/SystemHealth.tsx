import { Activity, Users, BookCheck, CreditCard, Wifi } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DashboardStats } from '../types';

interface SystemHealthProps {
    stats: DashboardStats;
}

export const SystemHealth = ({ stats }: SystemHealthProps) => {
    const attendanceStatus = stats.attendanceRate >= 80 ? 'good' : stats.attendanceRate >= 50 ? 'warning' : 'error';
    const invoiceStatus = stats.pendingInvoices === 0 ? 'good' : stats.pendingInvoices <= 5 ? 'warning' : 'error';
    const balanceStatus = stats.lowBalanceCount === 0 ? 'good' : stats.lowBalanceCount <= 3 ? 'warning' : 'error';

    const pills = [
        { icon: Activity, label: 'النظام يعمل', value: null, status: 'good' as const },
        { icon: Users, label: 'اشتراكات', value: `${stats.studentsCount}`, status: null },
        { icon: CreditCard, label: 'فواتير', value: `${stats.paidInvoices} مدفوعة`, status: invoiceStatus },
        { icon: BookCheck, label: 'حضور', value: `${stats.attendanceRate}%`, status: attendanceStatus },
    ];

    const statusDot = (s: string | null) => {
        if (s === 'good') return 'bg-success';
        if (s === 'warning') return 'bg-warning';
        if (s === 'error') return 'bg-error';
        return 'bg-primary';
    };

    const statusBg = (s: string | null) => {
        if (s === 'good') return 'bg-success-soft border-success/20';
        if (s === 'warning') return 'bg-warning-soft border-warning/20';
        if (s === 'error') return 'bg-error-soft border-error/20';
        return 'bg-surface border-border';
    };

    const statusText = (s: string | null) => {
        if (s === 'good') return 'text-success';
        if (s === 'warning') return 'text-warning';
        if (s === 'error') return 'text-error';
        return 'text-main';
    };

    return (
        <div className="rounded-2xl bg-card border border-border p-5" dir="rtl">
            <div className="flex items-center gap-2 mb-4">
                <div className="w-5 h-5 rounded-lg bg-success-soft flex items-center justify-center">
                    <Activity size={11} className="text-success" />
                </div>
                <h3 className="text-xs font-bold text-main">حالة النظام</h3>
            </div>
            <div className="flex flex-wrap gap-2">
                {pills.map((p) => {
                    const Icon = p.icon;
                    return (
                        <span key={p.label} className={cn("inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border", statusBg(p.status))}>
                            {p.status ? <span className={cn("w-2 h-2 rounded-full", statusDot(p.status))} /> : <Icon size={12} className="text-primary" />}
                            <span className={cn("text-[10px] font-bold", statusText(p.status))}>
                                {p.label}{p.value ? `: ${p.value}` : ''}
                            </span>
                        </span>
                    );
                })}
            </div>
            <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-border/50">
                <Wifi size={10} className="text-success" />
                <span className="text-[9px] font-bold text-success">اتصال مستقر</span>
                <span className="text-[9px] text-muted mx-1">·</span>
                <span className="text-[9px] font-bold text-muted">
                    {(stats.attendanceRate + stats.paidInvoices + stats.studentsCount) || '—'}
                </span>
            </div>
        </div>
    );
};
