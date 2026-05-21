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
    <div className={cn('bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800', className)}>
        {children}
    </div>
);

const SectionHeader = ({ icon: Icon, label, sub }: { icon: React.ComponentType<{ size?: number }>; label: string; sub?: string }) => (
    <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-200 dark:border-slate-800">
        <div className="w-8 h-8 flex items-center justify-center bg-indigo-600 rounded-none text-white">
            <Icon size={15} />
        </div>
        <div>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">{label}</p>
            {sub && <p className="text-[9px] text-slate-400 mt-0.5 font-medium">{sub}</p>}
        </div>
    </div>
);

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; color?: string }[]; label?: string }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-900 text-white px-4 py-3 rounded-none shadow-2xl border border-white/10 text-right min-w-[140px]" dir="rtl">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-2 pb-1 border-b border-white/10">{label}</p>
                {payload.map((entry: { name?: string; value: number; color?: string }, i: number) => (
                    <div key={i} className="flex items-center justify-between gap-4 mb-1 last:mb-0">
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-none" style={{ backgroundColor: entry.stroke || entry.fill }} />
                            <span className="text-[10px] text-slate-400 font-bold">{entry.name}</span>
                        </div>
                        <span className="text-sm font-black font-mono">{entry.value}</span>
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
                    { label: 'إجمالي الحصص', value: totalSessions, icon: Calendar, grad: 'from-slate-700 to-slate-900', sub: 'كل الأشهر' },
                    { label: 'حصص مكتملة', value: totalCompleted, icon: CheckCircle2, grad: 'from-emerald-600 to-emerald-800', sub: 'حضور فعلي' },
                    { label: 'حصص ملغية', value: totalCancelled, icon: XCircle, grad: 'from-rose-600 to-rose-800', sub: 'غياب/إلغاء' },
                    { label: 'معدل الحضور', value: `${overallRate}%`, icon: TrendingUp, grad: 'from-indigo-600 to-violet-800', sub: 'نسبة النجاح الكلية' },
                ].map((item, i) => (
                    <div key={i} className={cn("relative overflow-hidden rounded-none p-4 bg-gradient-to-br text-white", item.grad)}>
                        <div className="absolute -left-2 -bottom-2 opacity-10">
                            <item.icon size={60} />
                        </div>
                        <div className="w-8 h-8 bg-white/15 rounded-none flex items-center justify-center mb-3">
                            <item.icon size={16} className="text-white" />
                        </div>
                        <p className="text-xl font-black font-mono">{item.value}</p>
                        <p className="text-[9px] font-black uppercase tracking-widest text-white/70 mt-1">{item.label}</p>
                        <p className="text-[8px] text-white/50 font-bold mt-0.5">{item.sub}</p>
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
                                <linearGradient id="gradCompleted" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="gradCancelled" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="gradTotal" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#94A3B8" stopOpacity={0.15} />
                                    <stop offset="95%" stopColor="#94A3B8" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                            <XAxis dataKey="month" tick={{ fill: '#94A3B8', fontSize: 9, fontWeight: 700 }} axisLine={false} tickLine={false} dy={8} />
                            <YAxis tick={{ fill: '#94A3B8', fontSize: 9, fontWeight: 700 }} axisLine={false} tickLine={false} allowDecimals={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area type="monotone" dataKey="total" name="إجمالي" stroke="#94A3B8" strokeWidth={2} fill="url(#gradTotal)" dot={false} activeDot={{ r: 5 }} />
                            <Area type="monotone" dataKey="completed" name="حضور" stroke="#10B981" strokeWidth={2.5} fill="url(#gradCompleted)" dot={false} activeDot={{ r: 5 }} />
                            <Area type="monotone" dataKey="cancelled" name="غياب" stroke="#EF4444" strokeWidth={2} fill="url(#gradCancelled)" dot={false} activeDot={{ r: 5 }} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
                {/* Legend */}
                <div className="flex items-center justify-center gap-6 pb-4">
                    {[
                        { color: '#94A3B8', label: 'إجمالي' },
                        { color: '#10B981', label: 'حضور' },
                        { color: '#EF4444', label: 'غياب' },
                    ].map((l, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                            <div className="w-5 h-0.5 rounded-full" style={{ backgroundColor: l.color }} />
                            <span className="text-[10px] font-bold text-slate-500">{l.label}</span>
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
                            <tr className="bg-slate-900 text-white">
                                <th className="px-5 py-3 text-[9px] font-black uppercase tracking-widest text-left">#</th>
                                <th className="px-5 py-3 text-[9px] font-black uppercase tracking-widest">اسم المعلمة</th>
                                <th className="px-5 py-3 text-[9px] font-black uppercase tracking-widest text-center">المتوقعة</th>
                                <th className="px-5 py-3 text-[9px] font-black uppercase tracking-widest text-center">مكتملة</th>
                                <th className="px-5 py-3 text-[9px] font-black uppercase tracking-widest text-center">ملغية</th>
                                <th className="px-5 py-3 text-[9px] font-black uppercase tracking-widest text-center w-44">معدل الحضور</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                            {teacherPerformanceData
                                .sort((a, b) => b.rate - a.rate)
                                .map((teacher, index) => {
                                    const rate = teacher.rate;
                                    const barColor = rate >= 80 ? 'bg-emerald-500' : rate >= 60 ? 'bg-amber-500' : 'bg-rose-500';
                                    const textColor = rate >= 80 ? 'text-emerald-600' : rate >= 60 ? 'text-amber-600' : 'text-rose-500';
                                    const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : null;
                                    return (
                                        <tr key={index} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                            <td className="px-5 py-3">
                                                <span className="text-[10px] font-black text-slate-300 font-mono">
                                                    {medal || String(index + 1).padStart(2, '0')}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-8 h-8 bg-emerald-600 text-white rounded-none flex items-center justify-center text-xs font-black shrink-0">
                                                        {teacher.teacher.charAt(0)}
                                                    </div>
                                                    <span className="text-xs font-bold text-slate-800 dark:text-white">{teacher.teacher}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3 text-center font-mono font-black text-xs text-slate-500">{teacher.total}</td>
                                            <td className="px-5 py-3 text-center font-mono font-black text-xs text-emerald-600">{teacher.completed}</td>
                                            <td className="px-5 py-3 text-center font-mono font-black text-xs text-rose-500">{teacher.cancelled}</td>
                                            <td className="px-5 py-3">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="flex-1 bg-slate-100 dark:bg-slate-700 h-2 rounded-none overflow-hidden">
                                                        <div
                                                            className={cn("h-full rounded-none transition-all duration-700", barColor)}
                                                            style={{ width: `${rate}%` }}
                                                        />
                                                    </div>
                                                    <span className={cn("text-[10px] font-black w-9 text-left", textColor)}>{rate}%</span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden divide-y divide-slate-50 dark:divide-slate-800">
                    {teacherPerformanceData
                        .sort((a, b) => b.rate - a.rate)
                        .map((teacher, index) => {
                            const rate = teacher.rate;
                            const barColor = rate >= 80 ? 'bg-emerald-500' : rate >= 60 ? 'bg-amber-500' : 'bg-rose-500';
                            const textColor = rate >= 80 ? 'text-emerald-600' : rate >= 60 ? 'text-amber-600' : 'text-rose-500';
                            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : null;
                            return (
                                <div key={index} className="p-4 flex items-center gap-3">
                                    <div className="w-10 h-10 bg-emerald-600 text-white flex items-center justify-center font-black text-sm rounded-none shrink-0">
                                        {medal || teacher.teacher.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{teacher.teacher}</p>
                                            <span className={cn("text-[10px] font-black ml-2 shrink-0", textColor)}>{rate}%</span>
                                        </div>
                                        <div className="flex items-center gap-3 mb-1.5">
                                            <span className="text-[9px] text-emerald-600 font-bold">{teacher.completed} ✓</span>
                                            <span className="text-[9px] text-rose-500 font-bold">{teacher.cancelled} ✗</span>
                                            <span className="text-[9px] text-slate-400 font-bold">{teacher.total} إجمالي</span>
                                        </div>
                                        <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-none overflow-hidden">
                                            <div className={cn("h-full rounded-none", barColor)} style={{ width: `${rate}%` }} />
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
