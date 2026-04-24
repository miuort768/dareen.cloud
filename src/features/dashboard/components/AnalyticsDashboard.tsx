import { useMemo, useState } from 'react';
import {
    BarChart3, TrendingUp, ShieldCheck, LayoutGrid
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area
} from 'recharts';
import { cn } from '../../../lib/utils';

interface AnalyticsDashboardProps {
    students: any[];
    sessions: any[];
    monthlyData: any[];
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
        <div className="w-full space-y-4" dir="rtl">
            {/* Header / Tabs */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 md:p-8 rounded-[2.5rem] shadow-sm">
                <div className="flex items-center gap-5 px-2">
                    <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-[1.25rem] flex items-center justify-center shadow-inner">
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white leading-tight">مركز تحليل البيانات</h3>
                        <p className="text-xs font-medium text-slate-400 mt-1 uppercase tracking-widest">Business Intelligence</p>
                    </div>
                </div>

                <div className="flex bg-slate-50 dark:bg-slate-800/80 p-2 rounded-[1.5rem] shadow-inner">
                    <TabButton 
                        active={activeTab === 'commitment'} 
                        onClick={() => setActiveTab('commitment')} 
                        icon={ShieldCheck} 
                        label="الالتزام" 
                    />
                    <TabButton 
                        active={activeTab === 'database'} 
                        onClick={() => setActiveTab('database')} 
                        icon={LayoutGrid} 
                        label="المواد" 
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Evolution Section */}
                <div className={cn("bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-6 md:p-10 shadow-sm", activeTab !== 'commitment' && "hidden lg:block")}>
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-2xl flex items-center justify-center">
                                <TrendingUp size={20} />
                            </div>
                            <h4 className="font-bold text-slate-800 dark:text-white text-lg">التحليل التحصيلي</h4>
                        </div>
                        <div className="bg-emerald-50 dark:bg-emerald-900/30 px-4 py-1.5 rounded-full border border-emerald-100 dark:border-emerald-800/50">
                            <span className="text-xs font-bold text-emerald-600 tabular-nums">{overallRate}% كلي</span>
                        </div>
                    </div>

                    <div className="h-[300px] w-full" dir="ltr">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={attendanceData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" opacity={0.5} />
                                <XAxis 
                                    dataKey="month" 
                                    tick={{ fontSize: 11, fontWeight: '700', fill: '#94a3b8' }} 
                                    axisLine={false} 
                                    tickLine={false} 
                                    dy={15} 
                                />
                                <YAxis 
                                    tick={{ fontSize: 11, fontWeight: '700', fill: '#94a3b8' }} 
                                    domain={[0, 100]} 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tickFormatter={(val) => `${val}%`}
                                />
                                <Tooltip 
                                    cursor={{ stroke: '#10b981', strokeWidth: 2, strokeDasharray: '5 5' }}
                                    contentStyle={{ 
                                        borderRadius: '24px', 
                                        border: 'none', 
                                        boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', 
                                        fontSize: '12px', 
                                        fontWeight: 'bold', 
                                        backgroundColor: '#fff', 
                                        color: '#1e293b',
                                        padding: '16px 20px'
                                    }}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="rate" 
                                    stroke="#10b981" 
                                    fill="url(#colorRate)" 
                                    strokeWidth={4} 
                                    dot={{ r: 6, fill: '#fff', strokeWidth: 3, stroke: '#10b981' }} 
                                    activeDot={{ r: 8, strokeWidth: 4, stroke: '#fff' }} 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Distribution Section */}
                <div className={cn("bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-6 md:p-10 shadow-sm", activeTab !== 'database' && "hidden lg:block")}>
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 text-[#5c59f2] rounded-2xl flex items-center justify-center">
                                <BarChart3 size={20} />
                            </div>
                            <h4 className="font-bold text-slate-800 dark:text-white text-lg">توزيع المواد</h4>
                        </div>
                        <div className="bg-indigo-50 dark:bg-indigo-900/30 px-4 py-1.5 rounded-full border border-indigo-100 dark:border-indigo-800/50">
                            <span className="text-xs font-bold text-[#5c59f2] tabular-nums">{students.length} طالب</span>
                        </div>
                    </div>

                    <div className="h-[280px] w-full" dir="ltr">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={subjectStats} layout="vertical" margin={{ left: 20, right: 40, top: 10, bottom: 10 }}>
                                <CartesianGrid strokeDasharray="6 6" stroke="#f1f5f9" horizontal={false} opacity={0.4} />
                                <XAxis type="number" hide />
                                <YAxis 
                                    type="category" 
                                    dataKey="subject" 
                                    tick={{ fontSize: 11, fontWeight: '700', fill: '#64748b' }} 
                                    width={100} 
                                    axisLine={false} 
                                    tickLine={false} 
                                />
                                <Tooltip 
                                    cursor={{ fill: '#f8fafc', opacity: 0.5 }} 
                                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 'bold' }} 
                                />
                                <Bar 
                                    dataKey="sessions" 
                                    fill="#5c59f2" 
                                    radius={[0, 10, 10, 0]} 
                                    barSize={28}
                                    label={{ position: 'right', fill: '#5c59f2', fontSize: 11, fontWeight: 'bold', offset: 10 }}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

const TabButton = ({ active, onClick, icon: Icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) => (
    <button 
        onClick={onClick}
        className={cn(
            "flex-1 px-6 py-2.5 rounded-[1.25rem] font-bold text-xs md:text-sm transition-all flex items-center justify-center gap-3",
            active ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-md" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
        )}
    >
        <Icon size={16} />
        {label}
    </button>
);
