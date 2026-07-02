import { Activity, GraduationCap, CheckCircle2, XCircle, Calendar, TrendingUp } from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer
} from 'recharts';
import { cn } from '../../../lib/utils';

interface AttendanceReportProps {
    monthlySessionsData: { month: string; sessions: number; completed: number }[];
    teacherPerformanceData: { teacher: string; completed: number; cancelled: number }[];
    totalSessions: number;
    completedSessions: number;
    cancelledSessions: number;
    uniqueTeachers: number;
}

const SectionCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={cn('bg-card border border-border/50 rounded-2xl shadow-sm', className)}>
        {children}
    </div>
);

const SectionHeader = ({ icon: Icon, label, sub }: { icon: React.ComponentType<{ size?: number }>; label: string; sub?: string }) => (
    <div className="flex items-center gap-3 px-5 py-4 border-b border-border/50">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'color-mix(in srgb, var(--chart-3) 10%, transparent)' }}>
            <Icon size={15} style={{ color: 'var(--chart-3)' }} />
        </div>
        <div>
            <p className="text-xs font-bold text-main">{label}</p>
            {sub && <p className="text-[9px] font-bold text-dim mt-0.5">{sub}</p>}
        </div>
    </div>
);

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; color?: string }[]; label?: string }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-card border border-border shadow-xl text-main px-4 py-3 rounded-xl text-right min-w-[140px]" dir="rtl">
                <p className="text-[10px] font-medium text-muted uppercase mb-2 pb-1 border-b border-border">{label}</p>
                {payload.map((entry: { name?: string; value: number; color?: string }, i: number) => (
                    <div key={i} className="flex items-center justify-between gap-4 mb-1 last:mb-0">
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: entry.stroke || entry.fill }} />
                            <span className="text-[10px] text-muted font-normal">{entry.name}</span>
                        </div>
                        <span className="text-sm font-medium font-mono text-main">{entry.value}</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

export const AttendanceReport = ({
    monthlySessionsData,
    teacherPerformanceData
}: AttendanceReportProps) => {

    // Compute totals for summary bar
    const totalSessions = monthlySessionsData.reduce((s, m) => s + (m.total || 0), 0);
    const totalCompleted = monthlySessionsData.reduce((s, m) => s + (m.completed || 0), 0);
    const totalCancelled = monthlySessionsData.reduce((s, m) => s + (m.cancelled || 0), 0);
    const overallRate = totalSessions > 0 ? Math.round((totalCompleted / totalSessions) * 100) : 0;

    return (
        <div className="space-y-4">

            {/* Summary Stat Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                    { label: 'إجمالي الحصص', value: totalSessions, icon: Calendar, color: 'var(--chart-6)', bg: 'color-mix(in srgb, var(--chart-6) 10%, transparent)', sub: 'كل الأشهر' },
                    { label: 'حصص مكتملة', value: totalCompleted, icon: CheckCircle2, color: 'var(--chart-3)', bg: 'color-mix(in srgb, var(--chart-3) 10%, transparent)', sub: 'حضور فعلي' },
                    { label: 'حصص ملغية', value: totalCancelled, icon: XCircle, color: 'var(--chart-5)', bg: 'color-mix(in srgb, var(--chart-5) 10%, transparent)', sub: 'غياب/إلغاء' },
                    { label: 'معدل الحضور', value: `${overallRate}%`, icon: TrendingUp, color: 'var(--chart-4)', bg: 'color-mix(in srgb, var(--chart-4) 10%, transparent)', sub: 'نسبة النجاح الكلية' },
                ].map((item, i) => (
                    <div key={i} className="bg-card border border-border/50 rounded-2xl shadow-sm p-4">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: item.bg }}>
                            <item.icon size={16} style={{ color: item.color }} />
                        </div>
                        <p className="text-xl font-black font-mono" style={{ color: item.color }}>{item.value}</p>
                        <p className="text-[9px] font-bold text-dim mt-1">{item.label}</p>
                        <p className="text-[8px] font-bold text-dim mt-0.5">{item.sub}</p>
                    </div>
                ))}
            </div>

            {/* Monthly Trend – Area Chart */}
            <SectionCard>
                <SectionHeader
                    icon={Activity}
                    label="اتجاه الحضور الشهري"
                    sub="مقارنة بين الحصص المكتملة والملغية"
                />
                <div className="p-4 h-72" dir="ltr">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={monthlySessionsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="arGradCompleted" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--chart-3)" stopOpacity={0.25} />
                                    <stop offset="95%" stopColor="var(--chart-3)" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="arGradCancelled" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--chart-5)" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="var(--chart-5)" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="arGradTotal" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--chart-6)" stopOpacity={0.15} />
                                    <stop offset="95%" stopColor="var(--chart-6)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                            <XAxis dataKey="month" tick={{ fill: 'var(--text-dim)', fontSize: 9, fontWeight: 700 }} axisLine={false} tickLine={false} dy={8} />
                            <YAxis tick={{ fill: 'var(--text-dim)', fontSize: 9, fontWeight: 700 }} axisLine={false} tickLine={false} allowDecimals={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area type="monotone" dataKey="total" name="إجمالي" stroke="var(--chart-6)" strokeWidth={2} fill="url(#arGradTotal)" dot={false} activeDot={{ r: 5 }} />
                            <Area type="monotone" dataKey="completed" name="حضور" stroke="var(--chart-3)" strokeWidth={2.5} fill="url(#arGradCompleted)" dot={false} activeDot={{ r: 5 }} />
                            <Area type="monotone" dataKey="cancelled" name="غياب" stroke="var(--chart-5)" strokeWidth={2} fill="url(#arGradCancelled)" dot={false} activeDot={{ r: 5 }} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
                {/* Legend */}
                <div className="flex items-center justify-center gap-6 pb-4">
                    {[
                        { color: 'var(--chart-6)', label: 'إجمالي' },
                        { color: 'var(--chart-3)', label: 'حضور' },
                        { color: 'var(--chart-5)', label: 'غياب' },
                    ].map((l, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                            <div className="w-5 h-0.5 rounded-full" style={{ backgroundColor: l.color }} />
                            <span className="text-[10px] font-bold text-muted">{l.label}</span>
                        </div>
                    ))}
                </div>
            </SectionCard>

            {/* Teacher Performance */}
            <SectionCard>
                <SectionHeader
                    icon={GraduationCap}
                    label="أداء المعلمات"
                    sub={`${teacherPerformanceData.length} معلمة • مرتبات حسب نسبة الحضور`}
                />

                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-right">
                        <thead>
                            <tr className="text-on-primary" style={{ background: 'linear-gradient(to left, var(--chart-4), color-mix(in srgb, var(--chart-4) 70%, white))' }}>
                                <th className="px-5 py-3 text-[9px] font-bold text-on-primary opacity-70">#</th>
                                <th className="px-5 py-3 text-[9px] font-bold text-on-primary opacity-70 text-right">اسم المعلمة</th>
                                <th className="px-5 py-3 text-[9px] font-bold text-on-primary opacity-70 text-center">المتوقعة</th>
                                <th className="px-5 py-3 text-[9px] font-bold text-on-primary opacity-70 text-center">مكتملة</th>
                                <th className="px-5 py-3 text-[9px] font-bold text-on-primary opacity-70 text-center">ملغية</th>
                                <th className="px-5 py-3 text-[9px] font-bold text-on-primary opacity-70 text-center w-44">معدل الحضور</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {teacherPerformanceData
                                .sort((a, b) => b.rate - a.rate)
                                .map((teacher, index) => {
                                    const rate = teacher.rate;
                                    const barColor = rate >= 80 ? 'bg-success' : rate >= 60 ? 'bg-warning' : 'bg-error';
                                    const textColor = rate >= 80 ? 'text-success' : rate >= 60 ? 'text-warning' : 'text-error';
                                    const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : null;
                                    return (
                                        <tr key={index} className="hover:bg-hover transition-colors">
                                            <td className="px-5 py-3">
                                                <span className="text-[10px] font-medium text-dim font-mono">
                                                    {medal || String(index + 1).padStart(2, '0')}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0" style={{ backgroundColor: 'color-mix(in srgb, var(--chart-3) 10%, transparent)', color: 'var(--chart-3)' }}>
                                                        {teacher.teacher.charAt(0)}
                                                    </div>
                                                    <span className="text-xs font-bold text-main">{teacher.teacher}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3 text-center font-mono font-medium text-xs text-muted">{teacher.total}</td>
                                            <td className="px-5 py-3 text-center font-mono font-medium text-xs text-success">{teacher.completed}</td>
                                            <td className="px-5 py-3 text-center font-mono font-medium text-xs text-error">{teacher.cancelled}</td>
                                            <td className="px-5 py-3">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="flex-1 bg-surface h-2 rounded-xl overflow-hidden">
                                                        <div
                                                            className={cn("h-full rounded-xl transition-all duration-700", barColor)}
                                                            style={{ width: `${rate}%` }}
                                                        />
                                                    </div>
                                                    <span className={cn("text-[10px] font-medium w-9 text-left", textColor)}>{rate}%</span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden divide-y divide-border">
                    {teacherPerformanceData
                        .sort((a, b) => b.rate - a.rate)
                        .map((teacher, index) => {
                            const rate = teacher.rate;
                            const barColor = rate >= 80 ? 'bg-success' : rate >= 60 ? 'bg-warning' : 'bg-error';
                            const textColor = rate >= 80 ? 'text-success' : rate >= 60 ? 'text-warning' : 'text-error';
                            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : null;
                            return (
                                <div key={index} className="p-4 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black shrink-0" style={{ backgroundColor: 'color-mix(in srgb, var(--chart-3) 10%, transparent)', color: 'var(--chart-3)' }}>
                                        {medal || teacher.teacher.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <p className="text-xs font-normal text-main truncate">{teacher.teacher}</p>
                                            <span className={cn("text-[10px] font-medium ml-2 shrink-0", textColor)}>{rate}%</span>
                                        </div>
                                        <div className="flex items-center gap-3 mb-1.5">
                                            <span className="text-[9px] text-success font-normal">{teacher.completed} ✓</span>
                                            <span className="text-[9px] text-error font-normal">{teacher.cancelled} ✗</span>
                                            <span className="text-[9px] text-dim font-normal">{teacher.total} إجمالي</span>
                                        </div>
                                        <div className="h-1.5 bg-surface rounded-xl overflow-hidden">
                                            <div className={cn("h-full rounded-xl", barColor)} style={{ width: `${rate}%` }} />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                </div>
            </SectionCard>
        </div>
    );
};
