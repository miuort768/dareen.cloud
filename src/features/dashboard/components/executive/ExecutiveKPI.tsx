import { memo } from 'react';
import type { ExecutiveStats } from '../../services/executiveService';
import { DollarSign, Wallet, BarChart3, BookOpen, Users, RefreshCw, UserX, CheckCircle, Star, Clock, GraduationCap, AlertTriangle, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

const ICON_MAP: Record<string, typeof DollarSign> = {
    revenue: DollarSign,
    cash: Wallet,
    profit: BarChart3,
    sessions: BookOpen,
    occupancy: Users,
    renewal: RefreshCw,
    absences: UserX,
    attendance: CheckCircle,
    rating: Star,
    late: Clock,
    students: GraduationCap,
    invoices: AlertTriangle,
};

const METRICS = (s: ExecutiveStats) => [
    { label: 'إيرادات اليوم', value: `${s.todayRevenue.toLocaleString()} ر.س`, icon: 'revenue', trend: 'up' as const, percent: Math.min(100, Math.round((s.todayRevenue / 50000) * 100)) },
    { label: 'الدفع النقدي', value: `${s.cashToday.toLocaleString()} ر.س`, icon: 'cash', trend: 'up' as const, percent: Math.min(100, Math.round((s.cashToday / 30000) * 100)) },
    { label: 'الأرباح', value: `${s.todayProfit.toLocaleString()} ر.س`, icon: 'profit', trend: 'up' as const, percent: Math.min(100, Math.round((s.todayProfit / 20000) * 100)) },
    { label: 'الجلسات النشطة', value: `${s.activeSessions}`, icon: 'sessions', trend: 'up' as const, percent: Math.min(100, Math.round((s.activeSessions / 50) * 100)) },
    { label: 'نسبة الإشغال', value: `${s.occupancyRate}%`, icon: 'occupancy', trend: s.occupancyRate > 75 ? 'up' as const : 'down' as const, percent: s.occupancyRate },
    { label: 'نسبة التجديد', value: `${s.renewalRate}%`, icon: 'renewal', trend: 'up' as const, percent: s.renewalRate },
    { label: 'غياب اليوم', value: `${s.todayAbsences}`, icon: 'absences', trend: 'down' as const, percent: Math.min(100, Math.round((s.todayAbsences / 20) * 100)) },
    { label: 'نسبة الحضور', value: `${s.attendanceRate}%`, icon: 'attendance', trend: s.attendanceRate > 90 ? 'up' as const : 'down' as const, percent: s.attendanceRate },
    { label: 'التقييم', value: `${s.avgRating.toFixed(1)}`, icon: 'rating', trend: 'up' as const, percent: Math.round((s.avgRating / 5) * 100) },
    { label: 'تأخير', value: `${s.lateStarts}`, icon: 'late', trend: 'down' as const, percent: Math.min(100, Math.round((s.lateStarts / 10) * 100)) },
    { label: 'طلاب جدد', value: `${s.newStudentsThisWeek}`, icon: 'students', trend: 'up' as const, percent: Math.min(100, Math.round((s.newStudentsThisWeek / 15) * 100)) },
    { label: 'فواتير متأخرة', value: `${s.overdueInvoicesCount}`, icon: 'invoices', trend: 'down' as const, percent: Math.min(100, Math.round((s.overdueInvoicesCount / 30) * 100)) },
];

interface MetricCardProps {
    label: string;
    value: string;
    icon: string;
    trend: 'up' | 'down';
    percent: number;
}

const MetricCard = memo(function MetricCard({ label, value, icon, trend, percent }: MetricCardProps) {
    const Icon = ICON_MAP[icon] || Activity;
    const isUp = trend === 'up';

    return (
        <div className="p-4 rounded-2xl bg-card border border-border font-dash">
            <div className="flex items-center gap-3">
                <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ring-1 ring-border",
                    isUp ? "bg-success-soft" : "bg-error-soft"
                )}>
                    <Icon size={18} className={isUp ? 'text-success' : 'text-error'} />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-muted leading-none truncate">{label}</p>
                    <p className="text-sm font-bold text-main tabular-nums mt-1">{value}</p>
                </div>
            </div>
            <div className="mt-3 h-1.5 rounded-full bg-hover overflow-hidden">
                <div
                    className={cn("h-full rounded-full transition-all duration-700", isUp ? "bg-success" : "bg-error")}
                    style={{ width: `${Math.min(100, percent)}%` }}
                />
            </div>
        </div>
    );
});

export const ExecutiveKPI = memo(function ExecutiveKPI({ stats }: { stats: ExecutiveStats }) {
    if (!stats) return null;
    const metrics = METRICS(stats);

    return (
        <div className="rounded-2xl bg-card border border-border p-5 font-dash" dir="rtl">
            <div className="flex items-center gap-2 mb-4">
                <BarChart3 size={16} className="text-primary" />
                <h3 className="text-xs font-bold text-main">المؤشرات الرئيسية</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {metrics.map((m) => (
                    <MetricCard key={m.label} {...m} />
                ))}
            </div>
        </div>
    );
});
