import { useMemo, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
    BarChart3, TrendingUp, LayoutGrid, Database, Activity
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area
} from 'recharts';
import { cn } from '../../../lib/utils';

interface AnalyticsDashboardProps {
    students: Record<string, unknown>[];
    sessions: Record<string, unknown>[];
    monthlyData: Record<string, unknown>[];
}

export const AnalyticsDashboard = ({ students, sessions, monthlyData }: AnalyticsDashboardProps) => {
    const [activeTab, setActiveTab] = useState<'commitment' | 'database'>('commitment');
    
    // Subject popularity analytics
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

    return (
        <div className="w-full space-y-6" dir="rtl">
            {/* Header / Tabs - Soft Modern style */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
                <div className="flex items-center gap-4 px-1">
                    <div className="w-12 h-12 bg-slate-950 dark:bg-white text-white dark:text-slate-950 rounded-xl flex items-center justify-center border border-white/10 shadow-sm">
                        <Database size={24} />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-slate-900 dark:text-white leading-tight uppercase tracking-tight">مركز تحليل البيانات</h3>
                        <p className="text-[9px] font-black text-slate-400 mt-0.5 uppercase tracking-tight">وحدة ذكاء الأعمال</p>
                    </div>
                </div>

                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                    <TabButton 
                        active={activeTab === 'commitment'} 
                        onClick={() => setActiveTab('commitment')} 
                        icon={Activity} 
                        label="معدل الالتزام" 
                    />
                    <TabButton 
                        active={activeTab === 'database'} 
                        onClick={() => setActiveTab('database')} 
                        icon={LayoutGrid} 
                        label="تحليل المواد" 
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
                {/* Evolution Section */}
                <div className={cn(
                    "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 shadow-sm transition-all relative overflow-hidden", 
                    activeTab !== 'commitment' && "hidden lg:block opacity-40 grayscale"
                )}>
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center border border-white/10 shadow-sm">
                                <TrendingUp size={20} />
                            </div>
                            <div>
                                <h4 className="font-black text-slate-900 dark:text-white text-xs uppercase tracking-tight">التحليل التحصيلي</h4>
                                <p className="text-[8px] font-black text-slate-400 uppercase mt-0.5">التقدم الأكاديمي</p>
                            </div>
                        </div>
                        <div className="bg-emerald-600 text-white px-3 py-1 rounded-none border border-emerald-500/50 shadow-sm">
                            <span className="text-[10px] font-black tabular-nums uppercase">{overallRate}% إجمالي</span>
                        </div>
                    </div>

                    <div className="h-[300px] w-full" dir="ltr">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={attendanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ccc" opacity={0.2} />
                                <XAxis 
                                    dataKey="month" 
                                    tick={{ fontSize: 9, fontWeight: '900', fill: '#64748b' }} 
                                    axisLine={false} 
                                    tickLine={false} 
                                    dy={10} 
                                />
                                <YAxis 
                                    tick={{ fontSize: 9, fontWeight: '900', fill: '#64748b' }} 
                                    domain={[0, 100]} 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tickFormatter={(val) => `${val}%`}
                                />
                                <Tooltip 
                                    cursor={{ stroke: '#10b981', strokeWidth: 2 }}
                                    contentStyle={{ 
                                        borderRadius: '12px', 
                                        border: '1px solid #e2e8f0', 
                                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', 
                                        fontSize: '10px', 
                                        fontWeight: '900', 
                                        backgroundColor: '#fff', 
                                        color: '#000',
                                        padding: '8px 12px'
                                    }}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="rate" 
                                    stroke="#10b981" 
                                    fill="url(#colorRate)" 
                                    strokeWidth={3} 
                                    dot={{ r: 3, fill: '#10b981', strokeWidth: 1.5, stroke: '#fff' }} 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Distribution Section */}
                <div className={cn(
                    "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 shadow-sm transition-all relative overflow-hidden", 
                    activeTab !== 'database' && "hidden lg:block opacity-40 grayscale"
                )}>
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center border border-white/10 shadow-sm">
                                <BarChart3 size={20} />
                            </div>
                            <div>
                                <h4 className="font-black text-slate-900 dark:text-white text-xs uppercase tracking-tight">خارطة توزيع المناهج</h4>
                                <p className="text-[8px] font-black text-slate-400 uppercase mt-0.5">تحليلات المناهج</p>
                            </div>
                        </div>
                        <div className="bg-indigo-600 text-white px-3 py-1 rounded-none border border-indigo-500/50 shadow-sm">
                            <span className="text-[10px] font-black tabular-nums uppercase">{students.length} مستخدم</span>
                        </div>
                    </div>

                    <div className="h-[280px] w-full" dir="ltr">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={subjectStats} layout="vertical" margin={{ left: 10, right: 30, top: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ccc" horizontal={false} opacity={0.2} />
                                <XAxis type="number" hide />
                                <YAxis 
                                    type="category" 
                                    dataKey="subject" 
                                    tick={{ fontSize: 9, fontWeight: '900', fill: '#64748b' }} 
                                    width={80} 
                                    axisLine={false} 
                                    tickLine={false} 
                                />
                                <Tooltip 
                                    cursor={{ fill: 'rgba(79, 70, 229, 0.03)' }} 
                                    contentStyle={{ 
                                        borderRadius: '12px', 
                                        border: '1px solid #e2e8f0', 
                                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', 
                                        fontSize: '10px', 
                                        fontWeight: '900', 
                                        backgroundColor: '#fff', 
                                        color: '#000',
                                        padding: '8px 12px'
                                    }} 
                                />
                                <Bar 
                                    dataKey="sessions" 
                                    fill="#4f46e5" 
                                    radius={[0, 4, 4, 0]} 
                                    barSize={24}
                                    label={{ position: 'right', fill: '#4f46e5', fontSize: 9, fontWeight: '900', offset: 8 }}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

const TabButton = ({ active, onClick, icon: Icon, label }: { active: boolean, onClick: () => void, icon: LucideIcon, label: string }) => (
    <button 
        onClick={onClick}
        className={cn(
            "flex-1 px-6 py-2 rounded-lg font-black text-[9px] uppercase tracking-widest transition-all flex items-center justify-center gap-2",
            active ? "bg-white dark:bg-slate-900 text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
        )}
    >
        <Icon size={14} />
        {label}
    </button>
);
