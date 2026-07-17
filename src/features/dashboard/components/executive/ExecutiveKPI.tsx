import { memo } from 'react';
import type { ExecutiveStats } from '../../services/executiveService';
import { TrendingUp, TrendingDown, DollarSign, Wallet, BarChart3, BookOpen, Users, RefreshCw, UserX, CheckCircle, Star, Clock, GraduationCap, AlertTriangle } from 'lucide-react';
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
    const Icon = ICON_MAP[icon] || DollarSign;
    const isUp = trend === 'up';

    return (
        <div className="group relative overflow-hidden rounded-2xl bg-background/50 dark:bg-card/30 border border-border/50 dark:border-border/30 p-3 transition-all duration-300 hover:shadow-lg hover:shadow-black/5 hover:-translate-y-0.5 hover:border-border/80">
            <div className="flex items-center justify-between mb-2">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm transition-colors duration-300 ${isUp ? 'bg-success/15' : 'bg-error/15'}`} />
                <Icon size={16} className={`absolute top-3 right-3 ${isUp ? 'text-success' : 'text-error'}`} />
                <div className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-micro font-medium ${
                    isUp ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
                }`}>
                    {isUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                </div>
            </div>
            <p className="text-lg font-bold text-main dark:text-on-primary tabular-nums mb-0.5">{value}</p>
            <p className="text-micro text-muted dark:text-muted/70 truncate">{label}</p>
            <div className="mt-2 h-1 rounded-full bg-border/30 dark:bg-border/20 overflow-hidden">
                <ProgressBar value={Math.min(100, percent)} variant={isUp ? 'success' : 'error'} size="sm" trackClassName="bg-border/30 dark:bg-border/20" />
            </div>
        </div>
    );
});

export const ExecutiveKPI = memo(function ExecutiveKPI({ stats }: { stats: ExecutiveStats }) {
    if (!stats) return null;
    const metrics = METRICS(stats);

    return (
        <div className="relative overflow-hidden rounded-3xl bg-white/80 dark:bg-card/80 backdrop-blur-xl border border-border/50 dark:border-border/50 shadow-lg shadow-black/5">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-soft/10 via-transparent to-success/5 dark:from-primary-soft/5 dark:to-success/5 pointer-events-none" />
            <div className="relative p-5">
                <h3 className="text-sm font-semibold text-muted dark:text-muted/80 mb-4">المؤشرات الرئيسية</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                    {metrics.map((m) => (
                        <MetricCard key={m.label} {...m} />
                    ))}
                </div>
            </div>
        </div>
    );
});
