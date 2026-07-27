import { Activity, Users, BookCheck, CreditCard, Wifi } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DashboardStats } from '../types';

interface SystemHealthProps {
    stats: DashboardStats;
}

interface HealthItem {
    label: string;
    value: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    status: 'good' | 'warning' | 'error';
}

export const SystemHealth = ({ stats }: SystemHealthProps) => {
    const attendanceStatus = stats.attendanceRate >= 80 ? 'good' : stats.attendanceRate >= 50 ? 'warning' : 'error';
    const invoiceStatus = stats.pendingInvoices === 0 ? 'good' : stats.pendingInvoices <= 5 ? 'warning' : 'error';
    const balanceStatus = stats.lowBalanceCount === 0 ? 'good' : stats.lowBalanceCount <= 3 ? 'warning' : 'error';

    const items: HealthItem[] = [
        {
            label: 'الحضور',
            value: `${stats.attendanceRate}%`,
            icon: BookCheck,
            status: attendanceStatus,
        },
        {
            label: 'الفواتير',
            value: `${stats.paidInvoices} مدفوعة`,
            icon: CreditCard,
            status: invoiceStatus,
        },
        {
            label: 'الاشتراكات',
            value: `${stats.lowBalanceCount} تنبيه`,
            icon: Users,
            status: balanceStatus,
        },
    ];

    const statusColors: Record<string, { bg: string; text: string; dot: string }> = {
        good: { bg: 'bg-success-soft', text: 'text-success', dot: 'bg-success' },
        warning: { bg: 'bg-warning-soft', text: 'text-warning', dot: 'bg-warning' },
        error: { bg: 'bg-error-soft', text: 'text-error', dot: 'bg-error' },
    };

    const overallStatus = items.some(i => i.status === 'error') ? 'error' :
                          items.some(i => i.status === 'warning') ? 'warning' : 'good';

    const overallLabel = overallStatus === 'good' ? 'ممتاز' :
                         overallStatus === 'warning' ? 'يحتاج متابعة' : 'يجب المعالجة';

    return (
        <div className="rounded-2xl bg-card border border-border p-5 font-dash" dir="rtl">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-success-soft flex items-center justify-center">
                        <Activity size={16} className="text-success" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-main">حالة النظام</h3>
                        <p className="text-[10px] text-muted">مؤشرات الأداء</p>
                    </div>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className={cn("w-2 h-2 rounded-full", statusColors[overallStatus].dot)} />
                    <span className={cn("text-[10px] font-bold", statusColors[overallStatus].text)}>
                        {overallLabel}
                    </span>
                </div>
            </div>

            <div className="space-y-2">
                {items.map((item) => {
                    const Icon = item.icon;
                    const c = statusColors[item.status];

                    return (
                        <div key={item.label} className="flex items-center justify-between p-3 rounded-xl bg-surface">
                            <div className="flex items-center gap-2.5">
                                <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center", c.bg)}>
                                    <Icon size={13} className={c.text} />
                                </div>
                                <span className="text-[11px] font-bold text-main">{item.label}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className={cn("text-[10px] font-bold tabular-nums", c.text)}>{item.value}</span>
                                <span className={cn("w-1.5 h-1.5 rounded-full", c.dot)} />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Connection Status */}
            <div className="flex items-center justify-center gap-1.5 pt-3 mt-3 border-t border-border/50">
                <Wifi size={10} className="text-success" />
                <span className="text-[9px] font-bold text-success">متصل بالخادم</span>
            </div>
        </div>
    );
};
