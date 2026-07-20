import { memo } from 'react';
import type { ExecutiveStats } from '../../services/executiveService';
import { DollarSign, Wallet, BarChart3, BookOpen, Users, RefreshCw, UserX, CheckCircle, Star, Clock, GraduationCap, AlertTriangle, Activity } from 'lucide-react';
import { ProgressBar } from '../../../../shared/components/ui';

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
    { label: 'إيرادات اليوم', value: `${s.todayRevenue.toLocaleString()} ر.س`, icon: 'revenue', trend: 'up', percent: Math.min(100, Math.round((s.todayRevenue / 50000) * 100)) },
    { label: 'الدفع النقدي', value: `${s.cashToday.toLocaleString()} ر.س`, icon: 'cash', trend: 'up', percent: Math.min(100, Math.round((s.cashToday / 30000) * 100)) },
    { label: 'الأرباح', value: `${s.todayProfit.toLocaleString()} ر.س`, icon: 'profit', trend: 'up', percent: Math.min(100, Math.round((s.todayProfit / 20000) * 100)) },
    { label: 'الجلسات النشطة', value: `${s.activeSessions}`, icon: 'sessions', trend: 'up', percent: Math.min(100, Math.round((s.activeSessions / 50) * 100)) },
    { label: 'نسبة الإشغال', value: `${s.occupancyRate}%`, icon: 'occupancy', trend: s.occupancyRate > 75 ? 'up' : 'down', percent: s.occupancyRate },
    { label: 'نسبة التجديد', value: `${s.renewalRate}%`, icon: 'renewal', trend: 'up', percent: s.renewalRate },
    { label: 'غياب اليوم', value: `${s.todayAbsences}`, icon: 'absences', trend: 'down', percent: Math.min(100, Math.round((s.todayAbsences / 20) * 100)) },
    { label: 'نسبة الحضور', value: `${s.attendanceRate}%`, icon: 'attendance', trend: s.attendanceRate > 90 ? 'up' : 'down', percent: s.attendanceRate },
    { label: 'التقييم', value: `${s.avgRating.toFixed(1)}`, icon: 'rating', trend: 'up', percent: Math.round((s.avgRating / 5) * 100) },
    { label: 'تأخير', value: `${s.lateStarts}`, icon: 'late', trend: 'down', percent: Math.min(100, Math.round((s.lateStarts / 10) * 100)) },
    { label: 'طلاب جدد', value: `${s.newStudentsThisWeek}`, icon: 'students', trend: 'up', percent: Math.min(100, Math.round((s.newStudentsThisWeek / 15) * 100)) },
    { label: 'فواتير متأخرة', value: `${s.overdueInvoicesCount}`, icon: 'invoices', trend: 'down', percent: Math.min(100, Math.round((s.overdueInvoicesCount / 30) * 100)) },
];

interface MetricCardProps {
    label: string;
    value: string;
    icon: string;
    trend: string;
    percent: number;
}

const MetricCard = memo(function MetricCard({ label, value, icon, trend, percent }: MetricCardProps) {
    const Icon = ICON_MAP[icon] || Activity;
    const isUp = trend === 'up';

    return (
        <div className="bg-card border border-border/50 shadow-soft rounded-card p-4 flex items-center gap-3">
            <div className={`w-11 h-11 rounded-card flex items-center justify-center shrink-0 ${isUp ? 'bg-success-soft' : 'bg-error-soft'}`}>
                <Icon size={20} className={isUp ? 'text-success' : 'text-error'} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs text-muted leading-none truncate">{label}</p>
                <p className="text-card-title font-bold font-heading tabular-nums text-main mt-1">{value}</p>
                <div className="mt-2 h-1 rounded-full bg-border/30 overflow-hidden">
                    <ProgressBar value={Math.min(100, percent)} variant={isUp ? 'success' : 'error'} size="sm" trackClassName="bg-border/30" />
                </div>
            </div>
        </div>
    );
});

export const ExecutiveKPI = memo(function ExecutiveKPI({ stats }: { stats: ExecutiveStats }) {
    if (!stats) return null;
    const metrics = METRICS(stats);

    return (
        <div className="bg-card border border-border/50 shadow-soft rounded-card p-5">
            <h3 className="text-xs text-muted mb-4">المؤشرات الرئيسية</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {metrics.map((m) => (
                    <MetricCard key={m.label} {...m} />
                ))}
            </div>
        </div>
    );
});
