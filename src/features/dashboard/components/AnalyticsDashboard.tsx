import { useMemo } from 'react';
import {
    BarChart2, TrendingUp, Users, Award, ShieldCheck
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
                            <p className="text-emerald-100/80 text-[10px] font-bold uppercase tracking-widest leading-none mb-1 text-right">معدل الالتزام</p>
                            <p className="text-2xl font-black text-white tabular-nums leading-none text-right">{overallRate}%</p>
                        </div>
                    </div>
                </div>

                <div className="bg-indigo-600 p-5 rounded-none shadow-sm relative overflow-hidden group border border-slate-900">
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="w-10 h-10 bg-white/20 rounded-none flex items-center justify-center border border-white/30 text-white">
                            <Users size={20} />
                        </div>
                        <div>
                            <p className="text-indigo-100/80 text-[10px] font-bold uppercase tracking-widest leading-none mb-1 text-right">قاعدة الطلاب</p>
                            <p className="text-2xl font-black text-white tabular-nums leading-none text-right">{students.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-900/50 p-6 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm h-[320px] flex flex-col">
                    <div className="flex items-center gap-3 mb-6 border-b border-slate-50 pb-3">
                        <TrendingUp size={16} className="text-emerald-600" />
                        <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight italic">تطور الالتزام</h4>
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
                    <div className="flex items-center gap-3 mb-6 border-b border-slate-50 pb-3">
                        <BarChart2 size={16} className="text-indigo-600" />
                        <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight italic">توزيع المسارات</h4>
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

            {/* 🏅 Premium Hall of Fame (Redesigned لوحة الشرف) */}
            {students.some((s: any) => (s.totalPoints || 0) > 0) && (
                <div className="bg-white border-2 border-slate-900 p-6 rounded-none shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] relative overflow-hidden">
                    <div className="flex flex-col md:flex-row items-center gap-10">
                        {/* Title Badge */}
                        <div className="shrink-0 flex flex-col items-center md:items-start">
                            <div className="flex items-center gap-2 mb-2">
                                <Award size={24} className="text-yellow-500" />
                                <h4 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic leading-none">لوحة الشرف</h4>
                            </div>
                            <p className="text-[9px] font-black text-slate-400 tracking-[0.3em] uppercase underline underline-offset-4 decoration-yellow-500/50">أفضل الأداء لهذا الشهر</p>
                        </div>

                        {/* Top Students High-Contrast List */}
                        <div className="flex-1 grid grid-cols-2 lg:grid-cols-5 gap-4 w-full">
                            {[...students]
                                .filter((s: any) => (s.totalPoints || 0) > 0)
                                .sort((a: any, b: any) => (b.totalPoints || 0) - (a.totalPoints || 0))
                                .slice(0, 5)
                                .map((s: any, i: number) => (
                                    <div key={s.id} className="relative p-3 border border-slate-100 hover:border-slate-900 transition-all group overflow-hidden">
                                        {/* Rank Number Background */}
                                        <span className="absolute -top-2 -left-2 text-4xl font-black text-slate-50 opacity-10 group-hover:opacity-20 transition-opacity">0{i + 1}</span>
                                        
                                        <div className="relative z-10 pt-2 text-center md:text-right">
                                            <p className="text-[11px] font-black text-slate-900 truncate mb-2">{s.name}</p>
                                            <div className="flex items-center justify-between">
                                                <div className="h-0.5 flex-1 bg-slate-100 group-hover:bg-yellow-500 transition-colors mr-2"></div>
                                                <div className="flex flex-col items-end">
                                                    <span className="text-[10px] font-black text-slate-950 tabular-nums">{s.totalPoints}</span>
                                                    <span className="text-[8px] font-bold text-slate-400 uppercase leading-none">نقطة تميز</span>
                                                </div>
                                            </div>
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
