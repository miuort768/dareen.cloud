import { useMemo } from 'react';
import {
    BarChart2, TrendingUp, Users, Award
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area
} from 'recharts';

interface AnalyticsDashboardProps {
    students: any[];
    sessions: any[];
    monthlyData: any[];
}

export const AnalyticsDashboard = ({ students, sessions, monthlyData }: AnalyticsDashboardProps) => {
    
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
            {/* Top Overview Horizontal Rectangles (Sharp & Small) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-emerald-600 p-5 rounded-none shadow-sm relative overflow-hidden group border border-slate-900">
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="w-10 h-10 bg-white/20 rounded-none flex items-center justify-center border border-white/30 text-white">
                            <ShieldCheck size={20} />
                        </div>
                        <div>
                            <p className="text-emerald-100/80 text-[10px] font-bold uppercase tracking-widest leading-none mb-1">معدل الالتزام</p>
                            <p className="text-2xl font-black text-white tabular-nums leading-none">{overallRate}%</p>
                        </div>
                    </div>
                </div>

                <div className="bg-indigo-600 p-5 rounded-none shadow-sm relative overflow-hidden group border border-slate-900">
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="w-10 h-10 bg-white/20 rounded-none flex items-center justify-center border border-white/30 text-white">
                            <Users size={20} />
                        </div>
                        <div>
                            <p className="text-indigo-100/80 text-[10px] font-bold uppercase tracking-widest leading-none mb-1">قاعدة الطلاب</p>
                            <p className="text-2xl font-black text-white tabular-nums leading-none">{students.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-900/50 p-6 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm h-[320px] flex flex-col">
                    <div className="flex items-center gap-3 mb-6">
                        <TrendingUp size={16} className="text-emerald-600" />
                        <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">تطور الالتزام</h4>
                    </div>
                    <div className="flex-1 w-full" dir="ltr">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={attendanceData}>
                                <defs>
                                    <linearGradient id="colorRateSmall" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="month" tick={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8' }} domain={[0, 100]} axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={{ fontSize: '10px', borderRadius: '0', border: '1px solid #e2e8f0' }} />
                                <Area type="monotone" dataKey="rate" stroke="#10b981" fill="url(#colorRateSmall)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900/50 p-6 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm h-[320px] flex flex-col">
                    <div className="flex items-center gap-3 mb-6">
                        <BarChart2 size={16} className="text-indigo-600" />
                        <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">توزيع المسارات</h4>
                    </div>
                    <div className="flex-1 w-full" dir="ltr">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={subjectStats} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                                <XAxis type="number" hide />
                                <YAxis type="category" dataKey="subject" tick={{ fontSize: 9, fontWeight: 800, fill: '#64748b' }} width={60} axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={{ fontSize: '10px', borderRadius: '0' }} />
                                <Bar dataKey="sessions" fill="#6366f1" radius={0} barSize={12} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Honor Roll: Redesigned (Sharp & Small) */}
            {students.some((s: any) => (s.totalPoints || 0) > 0) && (
                <div className="bg-slate-900 p-6 rounded-none border border-slate-800 shadow-sm relative overflow-hidden">
                    <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                        <div className="shrink-0 text-center md:text-right border-l-0 md:border-l border-slate-700 pr-0 md:pr-2 pl-0 md:pl-8">
                            <div className="w-12 h-12 bg-yellow-400 rounded-none flex items-center justify-center mx-auto md:mx-0 mb-3">
                                <Award size={24} className="text-slate-950" />
                            </div>
                            <h4 className="text-lg font-black text-white italic tracking-tighter mb-1 uppercase">لوحة الشرف</h4>
                            <p className="text-slate-500 font-bold text-[9px] uppercase tracking-widest">أبرز المتميزين</p>
                        </div>

                        <div className="flex-1 grid grid-cols-3 md:grid-cols-5 gap-3">
                            {[...students]
                                .filter((s: any) => (s.totalPoints || 0) > 0)
                                .sort((a: any, b: any) => (b.totalPoints || 0) - (a.totalPoints || 0))
                                .slice(0, 5)
                                .map((s: any, i: number) => (
                                    <div key={s.id} className="p-3 bg-white/5 border border-white/10 rounded-none text-center hover:bg-white/10 transition-all">
                                        <p className="text-[10px] font-bold text-slate-500 mb-1">#{i + 1}</p>
                                        <p className="font-bold text-[10px] text-white mb-2 truncate">{s.name.split(' ')[0]}</p>
                                        <div className="px-2 py-0.5 bg-yellow-500/10 rounded-none inline-flex items-center gap-1">
                                            <span className="text-[11px] font-black text-yellow-500 tabular-nums">{s.totalPoints}</span>
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
