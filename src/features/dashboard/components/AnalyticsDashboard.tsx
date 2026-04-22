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
        <div className="space-y-6" dir="rtl">
            {/* Header / Tabs */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-[32px] shadow-sm">
                <div className="flex items-center gap-4 px-2">
                    <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 rounded-2xl flex items-center justify-center">
                        <TrendingUp size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white leading-tight">التحليل التفصيلي</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">ذكاء الأعمال والبيانات</p>
                    </div>
                </div>

                <div className="flex bg-slate-50 dark:bg-slate-800/50 p-1.5 rounded-2xl">
                    <TabButton 
                        active={activeTab === 'commitment'} 
                        onClick={() => setActiveTab('commitment')} 
                        icon={ShieldCheck} 
                        label="معدل الالتزام" 
                    />
                    <TabButton 
                        active={activeTab === 'database'} 
                        onClick={() => setActiveTab('database')} 
                        icon={LayoutGrid} 
                        label="توزيع المواد" 
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Evolution Section */}
                <div className={cn("bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[32px] p-6 shadow-sm", activeTab !== 'commitment' && "hidden lg:block")}>
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 rounded-xl flex items-center justify-center">
                                <TrendingUp size={18} />
                            </div>
                            <h4 className="font-bold text-slate-800 dark:text-white">تطور معدل الحضور</h4>
                        </div>
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-xl">
                            <span className="text-[10px] font-bold text-emerald-600">{overallRate}% كلي</span>
                        </div>
                    </div>

                    <div className="h-[250px] w-full" dir="ltr">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={attendanceData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="month" tick={{ fontSize: 9, fontWeight: 'bold', fill: '#94a3b8' }} axisLine={false} tickLine={false} dy={10} />
                                <YAxis tick={{ fontSize: 9, fontWeight: 'bold', fill: '#94a3b8' }} domain={[0, 100]} axisLine={false} tickLine={false} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '11px', fontWeight: 'bold' }}
                                />
                                <Area type="monotone" dataKey="rate" stroke="#10b981" fill="url(#colorRate)" strokeWidth={3} dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Distribution Section */}
                <div className={cn("bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[32px] p-6 shadow-sm", activeTab !== 'database' && "hidden lg:block")}>
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-indigo-50 dark:bg-indigo-900/20 text-[#5c59f2] rounded-xl flex items-center justify-center">
                                <BarChart3 size={18} />
                            </div>
                            <h4 className="font-bold text-slate-800 dark:text-white">توزيع الحصص حسب المادة</h4>
                        </div>
                        <div className="bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1 rounded-xl">
                            <span className="text-[10px] font-bold text-[#5c59f2]">{students.length} طالب</span>
                        </div>
                    </div>

                    <div className="h-[250px] w-full" dir="ltr">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={subjectStats} layout="vertical" margin={{ left: 10, right: 30 }}>
                                <CartesianGrid strokeDasharray="6 6" stroke="#f1f5f9" horizontal={false} />
                                <XAxis type="number" hide />
                                <YAxis type="category" dataKey="subject" tick={{ fontSize: 9, fontWeight: 'bold', fill: '#94a3b8' }} width={80} axisLine={false} tickLine={false} />
                                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: '1px solid #f1f5f9', fontSize: '11px', fontWeight: 'bold' }} />
                                <Bar dataKey="sessions" fill="#5c59f2" radius={[0, 4, 4, 0]} barSize={14} />
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
            "flex-1 px-4 py-2 rounded-xl font-bold text-[10px] transition-all flex items-center justify-center gap-2",
            active ? "bg-white dark:bg-slate-700 text-indigo-500 shadow-sm" : "text-slate-400 hover:text-slate-600"
        )}
    >
        <Icon size={14} />
        {label}
    </button>
);
