import { useMemo, useState } from 'react';
import {
    BarChart3, TrendingUp, Users, Award, ShieldCheck, CheckCircle2, LayoutGrid
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

    const topStudents = useMemo(() => {
        return [...students]
            .filter((s: any) => (s.totalPoints || 0) > 0)
            .sort((a: any, b: any) => (b.totalPoints || 0) - (a.totalPoints || 0))
            .slice(0, 5);
    }, [students]);

    return (
        <div className="space-y-6" dir="rtl">
            {/* --- MOBILE TABS NAVIGATION --- */}
            <div className="lg:hidden bg-white dark:bg-slate-900 p-2 rounded-2xl flex gap-2 border border-slate-100 dark:border-slate-800 shadow-sm">
                <button 
                    onClick={() => setActiveTab('commitment')}
                    className={cn(
                        "flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2",
                        activeTab === 'commitment' ? "bg-emerald-50 text-emerald-600 shadow-sm" : "text-slate-400"
                    )}
                >
                    <ShieldCheck size={16} />
                    معدل الالتزام
                </button>
                <button 
                    onClick={() => setActiveTab('database')}
                    className={cn(
                        "flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2",
                        activeTab === 'database' ? "bg-indigo-50 text-indigo-600 shadow-sm" : "text-slate-400"
                    )}
                >
                    <LayoutGrid size={16} />
                    قاعدة البيانات
                </button>
            </div>

            {/* --- CONTENT SECTION --- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* 1. COMMITMENT SECTION */}
                <div className={cn(
                    "flex flex-col gap-6",
                    activeTab !== 'commitment' && "hidden lg:flex"
                )}>
                    {/* Header Card */}
                    <div className="bg-emerald-600 p-6 rounded-[2rem] shadow-lg shadow-emerald-100 dark:shadow-none relative overflow-hidden text-white">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
                        <div className="flex items-center gap-5 relative z-10">
                            <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30">
                                <ShieldCheck size={28} />
                            </div>
                            <div>
                                <p className="text-emerald-100 text-xs font-bold uppercase tracking-wider mb-1">إجمالي معدل الالتزام</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-black">{overallRate}%</span>
                                    <span className="text-emerald-100/60 text-xs">نمو مستقر</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Chart Card */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] p-6 lg:p-8 shadow-sm flex flex-col h-[350px]">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <TrendingUp size={20} className="text-emerald-600" />
                                <h4 className="text-lg font-bold text-slate-800 dark:text-white">تطور الالتزام</h4>
                            </div>
                            <div className="bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-full border border-emerald-100 dark:border-emerald-800">
                                <span className="text-[10px] font-bold text-emerald-600">نشط الآن</span>
                            </div>
                        </div>
                        <div className="flex-1 w-full" dir="ltr">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={attendanceData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="month" tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} domain={[0, 100]} axisLine={false} tickLine={false} />
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '1rem', border: '1px solid #f1f5f9', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Area type="monotone" dataKey="rate" stroke="#10b981" fill="url(#colorRate)" strokeWidth={3} dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* 2. DATABASE SECTION */}
                <div className={cn(
                    "flex flex-col gap-6",
                    activeTab !== 'database' && "hidden lg:flex"
                )}>
                     {/* Header Card */}
                     <div className="bg-[#5c59f2] p-6 rounded-[2rem] shadow-lg shadow-indigo-100 dark:shadow-none relative overflow-hidden text-white">
                        <div className="absolute -left-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
                        <div className="flex items-center gap-5 relative z-10">
                            <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30">
                                <Users size={28} />
                            </div>
                            <div>
                                <p className="text-indigo-100 text-xs font-bold uppercase tracking-wider mb-1">قاعدة بيانات الطلاب</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-black">{students.length}</span>
                                    <span className="text-indigo-100/60 text-xs uppercase font-medium">طالب مسجل</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Distribution Chart Card */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] p-6 lg:p-8 shadow-sm flex flex-col h-[350px]">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <BarChart3 size={20} className="text-indigo-600" />
                                <h4 className="text-lg font-bold text-slate-800 dark:text-white">توزيع المواد</h4>
                            </div>
                            <CheckCircle2 size={20} className="text-slate-300" />
                        </div>
                        <div className="flex-1 w-full" dir="ltr">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={subjectStats} layout="vertical" margin={{ left: 10, right: 30 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                                    <XAxis type="number" hide />
                                    <YAxis type="category" dataKey="subject" tick={{ fontSize: 10, fontWeight: 800, fill: '#64748b' }} width={80} axisLine={false} tickLine={false} />
                                    <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '1rem', border: '1px solid #f1f5f9' }} />
                                    <Bar dataKey="sessions" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={16} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};
