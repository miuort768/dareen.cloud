import { useMemo, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
    BarChart3, TrendingUp, LayoutGrid, Database, Activity, 
    CheckCircle2, XCircle, Users
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area, Cell
} from 'recharts';
import { cn } from '../../../lib/utils';

interface AnalyticsDashboardProps {
    students: Record<string, unknown>[];
    sessions: Record<string, unknown>[];
    monthlyData: Record<string, unknown>[];
}

const SUBJECT_COLORS = ['#2563EB', '#8B5CF6', '#22C55E', '#F97316', '#E11D48', '#38BDF8'];

export const AnalyticsDashboard = ({ students, sessions, monthlyData }: AnalyticsDashboardProps) => {
    const [activeTab, setActiveTab] = useState<'commitment' | 'database'>('commitment');
    
    const subjectStats = useMemo(() => {
        const map: Record<string, { count: number; completed: number; cancelled: number }> = {};
        sessions.forEach(s => {
            const sub = s.subject || 'أخرى';
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
            rate: m.sessions > 0 ? Math.round((m.completed / m.sessions) * 100) : 0
        }));
    }, [monthlyData]);

    const totalCompleted = sessions.filter(s => s.status === 'completed').length;
    const totalCancelled = sessions.filter(s => s.status === 'cancelled').length;
    const overallRate = sessions.length > 0 ? Math.round(((totalCompleted) / (totalCompleted + totalCancelled || 1)) * 100) : 0;
    const avgAttendance = attendanceData.length > 0 ? Math.round(attendanceData.reduce((s, m) => s + m.rate, 0) / attendanceData.length) : 0;

    const color = '#10B981';

    return (
        <div className="w-full space-y-6" dir="rtl">
            {/* Header / Tabs */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100/50 dark:border-slate-800/50 transition-all duration-300">
                <div className="flex items-center gap-4 px-1">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm" style={{ backgroundColor: `${color}12`, color }}>
                        <Database size={24} />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-[#0F172A] dark:text-white leading-tight">مركز تحليل البيانات</h3>
                        <p className="text-[9px] font-medium text-[#64748B] mt-0.5">وحدة ذكاء الأعمال</p>
                    </div>
                </div>

                <div className="flex p-1 rounded-xl" style={{ backgroundColor: `${color}15` }}>
                    <TabButton active={activeTab === 'commitment'} onClick={() => setActiveTab('commitment')} icon={Activity} label="معدل الالتزام" color={color} activeTab={activeTab} tabId="commitment" />
                    <TabButton active={activeTab === 'database'} onClick={() => setActiveTab('database')} icon={LayoutGrid} label="تحليل المواد" color={color} activeTab={activeTab} tabId="database" />
                </div>
            </div>

            <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{ backgroundColor: `${color}15` }}>
                    <CheckCircle2 size={12} strokeWidth={2} style={{ color }} />
                    <span className="text-[10px] font-bold tabular-nums" style={{ color }}>{totalCompleted}</span>
                    <span className="text-[8px] font-medium text-[#64748B]">مكتملة</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{ backgroundColor: '#F43F5E15' }}>
                    <XCircle size={12} strokeWidth={2} style={{ color: '#F43F5E' }} />
                    <span className="text-[10px] font-bold tabular-nums" style={{ color: '#F43F5E' }}>{totalCancelled}</span>
                    <span className="text-[8px] font-medium text-[#64748B]">ملغاة</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{ backgroundColor: '#8B5CF615' }}>
                    <Users size={12} strokeWidth={2} style={{ color: '#8B5CF6' }} />
                    <span className="text-[10px] font-bold tabular-nums" style={{ color: '#8B5CF6' }}>{avgAttendance}%</span>
                    <span className="text-[8px] font-medium text-[#64748B]">متوسط</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
                {/* التحليل التحصيلي */}
                <div className={cn("p-6 md:p-8 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100/50 dark:border-slate-800/50 transition-all relative overflow-hidden", activeTab !== 'commitment' && "hidden lg:block")}>
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm" style={{ backgroundColor: `${color}12`, color }}>
                                <TrendingUp size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-[#0F172A] dark:text-white text-xs">التحليل التحصيلي</h4>
                                <p className="text-[8px] font-medium text-[#64748B] mt-0.5">التقدم الأكاديمي</p>
                            </div>
                        </div>
                        <div className="px-4 py-1.5 rounded-lg shadow-sm text-white text-[11px] font-black tabular-nums" style={{ backgroundColor: color }}>
                            {overallRate}%
                        </div>
                    </div>

                    <div className="h-[300px] w-full" dir="ltr">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={attendanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.3}/>
                                        <stop offset="40%" stopColor="#10b981" stopOpacity={0.12}/>
                                        <stop offset="100%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorRateHover" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.4}/>
                                        <stop offset="100%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                    <filter id="glow">
                                        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                                        <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
                                    </filter>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.3} />
                                <XAxis dataKey="month" tick={{ fontSize: 10, fontWeight: '700', fill: '#94A3B8' }} axisLine={false} tickLine={false} dy={10} />
                                <YAxis tick={{ fontSize: 10, fontWeight: '700', fill: '#94A3B8' }} domain={[0, 100]} axisLine={false} tickLine={false} tickFormatter={(val) => `${val}%`} />
                                <Tooltip cursor={{ stroke: '#10b981', strokeWidth: 2 }}
                                    content={({ active, payload, label }) => {
                                        if (!active || !payload?.length) return null;
                                        return (
                                            <div className="bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 px-4 py-3 min-w-[140px] rounded-xl" dir="rtl">
                                                <p className="text-[11px] font-bold text-[#0F172A] dark:text-white mb-1">{label}</p>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
                                                    <span className="text-[10px] font-medium text-[#64748B]">معدل الالتزام</span>
                                                    <span className="text-[13px] font-black text-[#0F172A] dark:text-white tabular-nums">{payload[0].value}%</span>
                                                </div>
                                            </div>
                                        );
                                    }}
                                />
                                <Area type="monotone" dataKey="rate" stroke="#10b981" strokeWidth={3} fill="url(#colorRate)" filter="url(#glow)"
                                    dot={{ r: 4, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
                                    activeDot={{ r: 6, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
                                    animationDuration={1000} animationEasing="ease-out"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* خارطة توزيع المناهج */}
                <div className={cn("p-6 md:p-8 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100/50 dark:border-slate-800/50 transition-all relative overflow-hidden", activeTab !== 'database' && "hidden lg:block")}>
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm" style={{ backgroundColor: `${color}12`, color }}>
                                <BarChart3 size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-[#0F172A] dark:text-white text-xs">خارطة توزيع المناهج</h4>
                                <p className="text-[8px] font-medium text-[#64748B] mt-0.5">تحليلات المناهج</p>
                            </div>
                        </div>
                        <div className="px-3 py-1.5 rounded-lg shadow-sm text-white text-[10px] font-bold" style={{ backgroundColor: color }}>
                            {students.length} مستخدم
                        </div>
                    </div>

                    <div className="h-[280px] w-full" dir="ltr">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={subjectStats} layout="vertical" margin={{ left: 10, right: 40, top: 0, bottom: 0 }}>
                                <defs>
                                    <filter id="barShadow">
                                        <feDropShadow dx="2" dy="2" stdDeviation="3" floodOpacity="0.12" />
                                    </filter>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} opacity={0.3} />
                                <XAxis type="number" hide />
                                <YAxis type="category" dataKey="subject" tick={{ fontSize: 10, fontWeight: '700', fill: '#94A3B8' }} width={85} axisLine={false} tickLine={false} />
                                <Tooltip cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                                    content={({ active, payload, label }) => {
                                        if (!active || !payload?.length) return null;
                                        return (
                                            <div className="bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 px-4 py-3 min-w-[150px] rounded-xl" dir="rtl">
                                                <p className="text-[11px] font-bold text-[#0F172A] dark:text-white mb-1">{label}</p>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-medium text-[#64748B]">الحصص</span>
                                                    <span className="text-[14px] font-black text-[#0F172A] dark:text-white tabular-nums">{payload[0].value}</span>
                                                </div>
                                            </div>
                                        );
                                    }}
                                />
                                <Bar dataKey="sessions" radius={[0, 6, 6, 0]} barSize={24} filter="url(#barShadow)" animationDuration={800} animationEasing="ease-out">
                                    {subjectStats.map((_, i) => (
                                        <Cell key={i} fill={SUBJECT_COLORS[i % SUBJECT_COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

const TabButton = ({ active, onClick, icon: Icon, label, color }: { active: boolean, onClick: () => void, icon: LucideIcon, label: string, color: string }) => (
    <button 
        onClick={onClick}
        className={cn(
            "flex-1 px-6 py-2 font-bold text-[9px] transition-all flex items-center justify-center gap-2 rounded-lg",
            !active && "text-slate-500 hover:text-slate-900 dark:hover:text-white"
        )}
        style={active ? { backgroundColor: color, color: '#fff' } : {}}
    >
        <Icon size={14} />
        {label}
    </button>
);
