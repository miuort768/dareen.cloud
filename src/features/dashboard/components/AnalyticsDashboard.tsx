import React, { useMemo, useState } from 'react';
import {
    LayoutGrid, Database, Activity,
    CheckCircle2, XCircle, Users
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area, Cell
} from 'recharts';
import type { TooltipProps } from 'recharts';
import { cn } from '../../../lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface AnalyticsDashboardProps {
    students: Record<string, unknown>[];
    sessions: Record<string, unknown>[];
    monthlyData: Record<string, unknown>[];
}

const AreaTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-card border border-border/50 shadow-xl px-4 py-3 min-w-[140px] rounded-xl" dir="rtl">
            <p className="text-xs font-bold text-main mb-1">{label}</p>
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-chart-2" />
                <span className="text-[10px] font-medium text-muted">معدل الالتزام</span>
                <span className="text-sm font-bold text-main tabular-nums">{payload[0].value}%</span>
            </div>
        </div>
    );
};

const BarTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-card border border-border/50 shadow-xl px-4 py-3 min-w-[150px] rounded-xl" dir="rtl">
            <p className="text-xs font-bold text-main mb-1">{label}</p>
            <div className="flex items-center gap-2">
                <span className="text-[10px] font-medium text-muted">الحصص</span>
                <span className="text-sm font-bold text-main tabular-nums">{payload[0].value}</span>
            </div>
        </div>
    );
};

export const AnalyticsDashboard = React.memo(({ students, sessions, monthlyData }: AnalyticsDashboardProps) => {
    const [activeTab, setActiveTab] = useState<'commitment' | 'database'>('commitment');

    const subjectStats = useMemo(() => {
        const map: Record<string, { count: number; completed: number; cancelled: number }> = {};
        sessions.forEach(s => {
            const sub = (s.subject as string) || 'أخرى';
            if (!map[sub]) map[sub] = { count: 0, completed: 0, cancelled: 0 };
            map[sub].count++;
            if (s.status === 'completed') map[sub].completed++;
            if (s.status === 'cancelled') map[sub].cancelled++;
        });
        return Object.entries(map)
            .map(([subject, data]) => ({
                subject: subject.length > 8 ? subject.substring(0, 8) + '..' : subject,
                fullSubject: subject,
                sessions: data.count,
                attendance: data.count > 0 ? Math.round((data.completed / data.count) * 100) : 0
            }))
            .sort((a, b) => b.sessions - a.sessions)
            .slice(0, 6);
    }, [sessions]);

    const attendanceData = useMemo(() => {
        return monthlyData.map((m: Record<string, unknown>) => ({
            ...m,
            rate: (m.sessions as number) > 0 ? Math.round(((m.completed as number) / (m.sessions as number)) * 100) : 0
        }));
    }, [monthlyData]);

    const totalCompleted = sessions.filter(s => s.status === 'completed').length;
    const totalCancelled = sessions.filter(s => s.status === 'cancelled').length;
    const overallRate = sessions.length > 0 ? Math.round(((totalCompleted) / (totalCompleted + totalCancelled || 1)) * 100) : 0;
    const avgAttendance = attendanceData.length > 0 ? Math.round(attendanceData.reduce((s: number, m: Record<string, unknown>) => s + (m.rate as number), 0) / attendanceData.length) : 0;

    return (
        <div className="w-full space-y-4" dir="rtl">
            {/* Header */}
            <Card className="border-border/50 shadow-sm">
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-chart-2/10 text-chart-2 ring-1 ring-chart-2/20">
                                <Database size={18} />
                            </div>
                            <div>
                                <CardTitle className="text-sm font-bold text-main">مركز تحليل البيانات</CardTitle>
                                <CardDescription className="text-[11px] text-muted">وحدة ذكاء الأعمال</CardDescription>
                            </div>
                        </div>

                        <div className="flex p-0.5 rounded-lg bg-card border border-border/50 gap-0.5 w-fit">
                            <button
                                onClick={() => setActiveTab('commitment')}
                                className={cn(
                                    "px-4 py-1.5 text-[11px] font-semibold transition-all flex items-center gap-1.5 rounded-md",
                                    activeTab === 'commitment' ? "bg-chart-2 text-inverse shadow-sm" : "text-muted hover:text-main"
                                )}
                            >
                                <Activity size={12} />
                                معدل الالتزام
                            </button>
                            <button
                                onClick={() => setActiveTab('database')}
                                className={cn(
                                    "px-4 py-1.5 text-[11px] font-semibold transition-all flex items-center gap-1.5 rounded-md",
                                    activeTab === 'database' ? "bg-chart-2 text-inverse shadow-sm" : "text-muted hover:text-main"
                                )}
                            >
                                <LayoutGrid size={12} />
                                تحليل المواد
                            </button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Stats Pills */}
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-chart-2/10">
                    <CheckCircle2 size={12} className="text-chart-2" />
                    <span className="text-[10px] font-bold tabular-nums text-chart-2">{totalCompleted}</span>
                    <span className="text-[10px] font-medium text-muted">مكتملة</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-chart-3/10">
                    <XCircle size={12} className="text-chart-3" />
                    <span className="text-[10px] font-bold tabular-nums text-chart-3">{totalCancelled}</span>
                    <span className="text-[10px] font-medium text-muted">ملغاة</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-chart-4/10">
                    <Users size={12} className="text-chart-4" />
                    <span className="text-[10px] font-bold tabular-nums text-chart-4">{avgAttendance}%</span>
                    <span className="text-[10px] font-medium text-muted">متوسط</span>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className={cn("transition-all", activeTab !== 'commitment' && "hidden lg:block")}>
                    <Card className="border-border/50 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between pb-0 pt-4 px-5">
                            <div>
                                <CardTitle className="text-xs font-bold text-main">التحليل التحصيلي</CardTitle>
                                <CardDescription className="text-[10px] text-muted">التقدم الأكاديمي</CardDescription>
                            </div>
                            <div className="px-3 py-1 rounded-lg bg-chart-2 text-inverse text-[10px] font-bold tabular-nums">
                                {overallRate}%
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {attendanceData.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 text-center">
                                    <Activity size={28} className="text-muted/30 mb-2" />
                                    <p className="text-xs font-medium text-muted">لا توجد بيانات</p>
                                </div>
                            ) : (
                                <div className="h-[280px] px-2 pb-2 pt-4">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={attendanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="analyticsRate2" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.25} />
                                                    <stop offset="40%" stopColor="var(--chart-2)" stopOpacity={0.08} />
                                                    <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.3} />
                                            <XAxis dataKey="month" tick={{ fontSize: 10, fontWeight: '600', fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} dy={8} />
                                            <YAxis tick={{ fontSize: 10, fontWeight: '600', fill: 'var(--text-muted)' }} domain={[0, 100]} axisLine={false} tickLine={false} tickFormatter={(val) => `${val}%`} />
                                            <Tooltip content={<AreaTooltip />} />
                                            <Area
                                                type="monotone" dataKey="rate" stroke="var(--chart-2)" strokeWidth={2.5} fill="url(#analyticsRate2)"
                                                dot={{ r: 3, fill: 'var(--chart-2)', stroke: 'var(--bg-card)', strokeWidth: 2 }}
                                                activeDot={{ r: 5, fill: 'var(--chart-2)', stroke: 'var(--bg-card)', strokeWidth: 2 }}
                                                animationDuration={1000} animationEasing="ease-out"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className={cn("transition-all", activeTab !== 'database' && "hidden lg:block")}>
                    <Card className="border-border/50 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between pb-0 pt-4 px-5">
                            <div>
                                <CardTitle className="text-xs font-bold text-main">خارطة توزيع المناهج</CardTitle>
                                <CardDescription className="text-[10px] text-muted">تحليلات المناهج</CardDescription>
                            </div>
                            <div className="px-3 py-1 rounded-lg bg-chart-2 text-inverse text-[10px] font-bold">
                                {students.length} مستخدم
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {subjectStats.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 text-center">
                                    <LayoutGrid size={28} className="text-muted/30 mb-2" />
                                    <p className="text-xs font-medium text-muted">لا توجد بيانات</p>
                                </div>
                            ) : (
                                <div className="h-[280px] px-2 pb-2 pt-4">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={subjectStats} layout="vertical" margin={{ left: 10, right: 40, top: 0, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} opacity={0.3} />
                                            <XAxis type="number" hide />
                                            <YAxis type="category" dataKey="subject" tick={{ fontSize: 10, fontWeight: '600', fill: 'var(--text-muted)' }} width={85} axisLine={false} tickLine={false} />
                                            <Tooltip content={<BarTooltip />} />
                                            <Bar dataKey="sessions" radius={[0, 4, 4, 0]} barSize={20} animationDuration={800} animationEasing="ease-out">
                                                {subjectStats.map((_, i) => (
                                                    <Cell key={`cell-${i}`} fill={`var(--chart-${(i % 6) + 1})`} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
});
AnalyticsDashboard.displayName = 'AnalyticsDashboard';
