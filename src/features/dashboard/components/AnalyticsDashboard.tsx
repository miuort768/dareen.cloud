import { useMemo, useState } from 'react';
import {
    BarChart3, TrendingUp, LayoutGrid, Database, Activity, 
    CheckCircle2, XCircle, Users
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area, Cell
} from 'recharts';
import { cn } from '../../../lib/utils';
import { ChartContainer, ChartTooltip } from '../../../shared/components/ui';

interface AnalyticsDashboardProps {
    students: Record<string, unknown>[];
    sessions: Record<string, unknown>[];
    monthlyData: Record<string, unknown>[];
}

export const AnalyticsDashboard = ({ students, sessions, monthlyData }: AnalyticsDashboardProps) => {
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
        return monthlyData.map(m => ({
            ...m,
            rate: (m.sessions as number) > 0 ? Math.round(((m.completed as number) / (m.sessions as number)) * 100) : 0
        }));
    }, [monthlyData]);

    const totalCompleted = sessions.filter(s => s.status === 'completed').length;
    const totalCancelled = sessions.filter(s => s.status === 'cancelled').length;
    const overallRate = sessions.length > 0 ? Math.round(((totalCompleted) / (totalCompleted + totalCancelled || 1)) * 100) : 0;
    const avgAttendance = attendanceData.length > 0 ? Math.round(attendanceData.reduce((s, m) => s + m.rate, 0) / attendanceData.length) : 0;

    return (
        <div className="w-full space-y-6" dir="rtl">
            <ChartContainer className="!p-0">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-chart-2/10 flex items-center justify-center">
                            <Database size={24} className="text-chart-2" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-main">مركز تحليل البيانات</h3>
                            <p className="text-micro font-medium text-muted mt-0.5">وحدة ذكاء الأعمال</p>
                        </div>
                    </div>

                    <div className="flex p-1 rounded-xl bg-chart-2/10">
                        <TabButton active={activeTab === 'commitment'} onClick={() => setActiveTab('commitment')} icon={Activity} label="معدل الالتزام" color="var(--chart-2)" />
                        <TabButton active={activeTab === 'database'} onClick={() => setActiveTab('database')} icon={LayoutGrid} label="تحليل المواد" color="var(--chart-2)" />
                    </div>
                </div>
            </ChartContainer>

            <div className="flex items-center gap-3 mb-6">
                <StatPill icon={CheckCircle2} value={totalCompleted} label="مكتملة" color="var(--chart-2)" />
                <StatPill icon={XCircle} value={totalCancelled} label="ملغاة" color="var(--chart-3)" />
                <StatPill icon={Users} value={`${avgAttendance}%`} label="متوسط" color="var(--chart-4)" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
                <div className={cn("transition-all", activeTab !== 'commitment' && "hidden lg:block")}>
                    <ChartContainer
                        title="التحليل التحصيلي"
                        subtitle="التقدم الأكاديمي"
                        height={300}
                        headerExtra={
                            <div className="px-4 py-1.5 rounded-lg bg-chart-2 text-on-success text-xs font-black tabular-nums">
                                {overallRate}%
                            </div>
                        }
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={attendanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="analyticsRate" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.3}/>
                                        <stop offset="40%" stopColor="var(--chart-2)" stopOpacity={0.12}/>
                                        <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0}/>
                                    </linearGradient>
                                    <filter id="analyticsGlow">
                                        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                                        <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
                                    </filter>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.3} />
                                <XAxis dataKey="month" tick={{ fontSize: 10, fontWeight: '700', fill: 'var(--text-dim)' }} axisLine={false} tickLine={false} dy={10} />
                                <YAxis tick={{ fontSize: 10, fontWeight: '700', fill: 'var(--text-dim)' }} domain={[0, 100]} axisLine={false} tickLine={false} tickFormatter={(val) => `${val}%`} />
                                <Tooltip cursor={{ stroke: 'var(--chart-2)', strokeWidth: 2 }}
                                    content={({ active, payload, label }) => {
                                        if (!active || !payload?.length) return null;
                                        return (
                                            <div className="bg-card border border-border shadow-xl px-4 py-3 min-w-[140px] rounded-xl" dir="rtl">
                                                <p className="text-xs font-bold text-main mb-1">{label}</p>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2.5 h-2.5 rounded-full bg-chart-2" />
                                                    <span className="text-micro font-bold text-muted">معدل الالتزام</span>
                                                    <span className="text-sm font-black text-main tabular-nums">{payload[0].value}%</span>
                                                </div>
                                            </div>
                                        );
                                    }}
                                />
                                <Area type="monotone" dataKey="rate" stroke="var(--chart-2)" strokeWidth={3} fill="url(#analyticsRate)" filter="url(#analyticsGlow)"
                                    dot={{ r: 4, fill: 'var(--chart-2)', stroke: 'var(--bg-card)', strokeWidth: 2 }}
                                    activeDot={{ r: 6, fill: 'var(--chart-2)', stroke: 'var(--bg-card)', strokeWidth: 2 }}
                                    animationDuration={1000} animationEasing="ease-out"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </div>

                <div className={cn("transition-all", activeTab !== 'database' && "hidden lg:block")}>
                    <ChartContainer
                        title="خارطة توزيع المناهج"
                        subtitle="تحليلات المناهج"
                        height={280}
                        headerExtra={
                            <div className="px-3 py-1.5 rounded-lg bg-chart-2 text-on-success text-micro font-bold">
                                {students.length} مستخدم
                            </div>
                        }
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={subjectStats} layout="vertical" margin={{ left: 10, right: 40, top: 0, bottom: 0 }}>
                                <defs>
                                    <filter id="analyticsBarShadow">
                                        <feDropShadow dx="2" dy="2" stdDeviation="3" floodOpacity="0.12" />
                                    </filter>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} opacity={0.3} />
                                <XAxis type="number" hide />
                                <YAxis type="category" dataKey="subject" tick={{ fontSize: 10, fontWeight: '700', fill: 'var(--text-dim)' }} width={85} axisLine={false} tickLine={false} />
                                <Tooltip cursor={{ fill: 'var(--bg-hover)' }}
                                    content={({ active, payload, label }) => {
                                        if (!active || !payload?.length) return null;
                                        return (
                                            <div className="bg-card border border-border shadow-xl px-4 py-3 min-w-[150px] rounded-xl" dir="rtl">
                                                <p className="text-xs font-bold text-main mb-1">{label}</p>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-micro font-bold text-muted">الحصص</span>
                                                    <span className="text-sm font-black text-main tabular-nums">{payload[0].value}</span>
                                                </div>
                                            </div>
                                        );
                                    }}
                                />
                                <Bar dataKey="sessions" radius={[0, 6, 6, 0]} barSize={24} filter="url(#analyticsBarShadow)" animationDuration={800} animationEasing="ease-out">
                                    {subjectStats.map((_, i) => (
                                        <Cell key={i} fill={`var(--chart-${(i % 6) + 1})`} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </div>
            </div>
        </div>
    );
};

const TabButton = ({ active, onClick, icon: Icon, label, color }: { active: boolean; onClick: () => void; icon: React.ComponentType<{ size?: number }>; label: string; color: string }) => (
    <button 
        onClick={onClick}
        className={cn(
            "flex-1 px-6 py-2 font-bold text-micro transition-all flex items-center justify-center gap-2 rounded-lg",
            !active && "text-muted hover:text-main"
        )}
        style={active ? { backgroundColor: color, color: '#fff' } : {}}
    >
        <Icon size={14} />
        {label}
    </button>
);

const StatPill = ({ icon: Icon, value, label, color }: { icon: React.ComponentType<{ size?: number }>; value: string | number; label: string; color: string }) => (
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{ backgroundColor: `${color}15` }}>
        <Icon size={12} strokeWidth={2} style={{ color }} />
        <span className="text-micro font-bold tabular-nums" style={{ color }}>{value}</span>
        <span className="text-micro font-bold text-muted">{label}</span>
    </div>
);
