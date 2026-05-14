import { useMemo, useState } from 'react';
import {
    BarChart3, TrendingUp, LayoutGrid, Database, Activity
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
        <div className="w-full space-y-6" dir="rtl">
            {/* Header / Tabs - Admin Sharp Style */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900 border-2 border-slate-800 p-8 rounded-none shadow-2xl">
                <div className="flex items-center gap-6 px-2">
                    <div className="w-14 h-14 bg-indigo-600 text-white rounded-none flex items-center justify-center shadow-xl border border-indigo-400/30">
                        <Database size={28} />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-white leading-tight tracking-tight uppercase">مركز تحليل البيانات</h3>
                        <p className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-[0.2em]">Enterprise Business Intelligence</p>
                    </div>
                </div>

                <div className="flex bg-slate-800 p-1 rounded-none border border-slate-700">
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-8">
                {/* Evolution Section */}
                <div className={cn(
                    "bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-none p-10 shadow-xl transition-all relative overflow-hidden", 
                    activeTab !== 'commitment' && "hidden lg:block opacity-40 grayscale"
                )}>
                    <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500" />
                    <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center gap-5">
                            <div className="w-12 h-12 bg-emerald-600 text-white rounded-none flex items-center justify-center shadow-lg">
                                <TrendingUp size={24} />
                            </div>
                            <div>
                                <h4 className="font-black text-slate-900 dark:text-white text-lg uppercase tracking-tight">التحليل التحصيلي التراكمي</h4>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Academic Progress Evolution</p>
                            </div>
                        </div>
                        <div className="bg-emerald-50 dark:bg-emerald-900/30 px-5 py-2 border border-emerald-100 dark:border-emerald-800/50">
                            <span className="text-xs font-black text-emerald-600 tabular-nums uppercase tracking-widest">{overallRate}% GLOBAL</span>
                        </div>
                    </div>

                    <div className="h-[350px] w-full" dir="ltr">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={attendanceData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#059669" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="0" vertical={false} stroke="#f1f5f9" opacity={0.1} />
                                <XAxis 
                                    dataKey="month" 
                                    tick={{ fontSize: 10, fontWeight: '900', fill: '#94a3b8' }} 
                                    axisLine={false} 
                                    tickLine={false} 
                                    dy={15} 
                                />
                                <YAxis 
                                    tick={{ fontSize: 10, fontWeight: '900', fill: '#94a3b8' }} 
                                    domain={[0, 100]} 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tickFormatter={(val) => `${val}%`}
                                />
                                <Tooltip 
                                    cursor={{ stroke: '#059669', strokeWidth: 2 }}
                                    contentStyle={{ 
                                        borderRadius: '0px', 
                                        border: '2px solid #059669', 
                                        boxShadow: '20px 20px 0px 0px rgba(0,0,0,0.1)', 
                                        fontSize: '11px', 
                                        fontWeight: '900', 
                                        backgroundColor: '#0f172a', 
                                        color: '#fff',
                                        padding: '12px 16px'
                                    }}
                                />
                                <Area 
                                    type="stepAfter" 
                                    dataKey="rate" 
                                    stroke="#059669" 
                                    fill="url(#colorRate)" 
                                    strokeWidth={4} 
                                    dot={{ r: 4, fill: '#059669', strokeWidth: 2, stroke: '#fff' }} 
                                    activeDot={{ r: 6, strokeWidth: 0 }} 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Distribution Section */}
                <div className={cn(
                    "bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-none p-10 shadow-xl transition-all relative overflow-hidden", 
                    activeTab !== 'database' && "hidden lg:block opacity-40 grayscale"
                )}>
                    <div className="absolute top-0 left-0 w-2 h-full bg-indigo-600" />
                    <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center gap-5">
                            <div className="w-12 h-12 bg-indigo-600 text-white rounded-none flex items-center justify-center shadow-lg">
                                <BarChart3 size={24} />
                            </div>
                            <div>
                                <h4 className="font-black text-slate-900 dark:text-white text-lg uppercase tracking-tight">خارطة توزيع المناهج</h4>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Subject Distribution Map</p>
                            </div>
                        </div>
                        <div className="bg-indigo-50 dark:bg-indigo-900/30 px-5 py-2 border border-indigo-100 dark:border-indigo-800/50">
                            <span className="text-xs font-black text-indigo-600 tabular-nums uppercase tracking-widest">{students.length} TOTAL USERS</span>
                        </div>
                    </div>

                    <div className="h-[330px] w-full" dir="ltr">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={subjectStats} layout="vertical" margin={{ left: 20, right: 40, top: 10, bottom: 10 }}>
                                <CartesianGrid strokeDasharray="0" stroke="#f1f5f9" horizontal={false} opacity={0.1} />
                                <XAxis type="number" hide />
                                <YAxis 
                                    type="category" 
                                    dataKey="subject" 
                                    tick={{ fontSize: 10, fontWeight: '900', fill: '#64748b' }} 
                                    width={100} 
                                    axisLine={false} 
                                    tickLine={false} 
                                />
                                <Tooltip 
                                    cursor={{ fill: 'rgba(79, 70, 229, 0.05)' }} 
                                    contentStyle={{ borderRadius: '0px', border: '2px solid #4f46e5', boxShadow: '15px 15px 0px 0px rgba(0,0,0,0.1)', fontSize: '11px', fontWeight: '900', backgroundColor: '#0f172a', color: '#fff' }} 
                                />
                                <Bar 
                                    dataKey="sessions" 
                                    fill="#4f46e5" 
                                    radius={0} 
                                    barSize={32}
                                    label={{ position: 'right', fill: '#4f46e5', fontSize: 10, fontWeight: '900', offset: 10 }}
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
            "flex-1 px-10 py-3 rounded-none font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-3",
            active ? "bg-indigo-600 text-white shadow-xl" : "text-slate-400 hover:text-white"
        )}
    >
        <Icon size={16} />
        {label}
    </button>
);
