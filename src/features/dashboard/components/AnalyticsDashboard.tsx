import { useMemo } from 'react';
import {
    BarChart2, TrendingUp, Users, UserCheck, Award, Zap, Star
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
                subject: subject.length > 10 ? subject.substring(0, 10) + '...' : subject,
                fullSubject: subject,
                sessions: data.count,
                attendance: data.count > 0 ? Math.round((data.completed / data.count) * 100) : 0,
                absence: data.count > 0 ? Math.round((data.cancelled / data.count) * 100) : 0
            }))
            .sort((a, b) => b.sessions - a.sessions)
            .slice(0, 7);
    }, [sessions]);

    // monthly attendance rate
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
        <div className="space-y-10" dir="rtl">
            {/* High-Level Overview Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                {[
                    { label: 'إجمالي الحصص المجدولة', value: sessions.length, icon: Zap, color: 'indigo', gradient: 'from-indigo-600 to-blue-600' },
                    { label: 'معدل الالتزام الكلي', value: `${overallRate}%`, icon: UserCheck, color: 'emerald', gradient: 'from-emerald-600 to-teal-600' },
                    { label: 'قاعدة طلاب دارين', value: students.length, icon: Users, color: 'violet', gradient: 'from-violet-600 to-purple-600' }
                ].map((item, i) => (
                    <div key={i} className="bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white dark:border-slate-800 shadow-xl shadow-indigo-500/5 flex items-center gap-6 overflow-hidden relative group">
                        <div className={cn("absolute -top-12 -right-12 w-24 h-24 bg-gradient-to-br opacity-10 blur-2xl group-hover:scale-150 transition-transform duration-700", item.gradient)}></div>
                        <div className={cn("w-14 h-14 flex items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg", item.gradient)}>
                            <item.icon size={28} />
                        </div>
                        <div className="text-right">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
                            <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter tabular-nums">{item.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Attendance Rate by Month */}
                <div className="bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white dark:border-slate-800 shadow-xl shadow-indigo-500/5 transition-all duration-500 hover:shadow-indigo-500/10">
                    <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-emerald-500/10 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-500/20">
                                <TrendingUp size={24} />
                            </div>
                            <div>
                                <h4 className="text-lg font-black text-slate-900 dark:text-white italic">تطور الالتزام</h4>
                                <p className="text-xs font-medium text-slate-400">تتبع نسبة الحضور الشهرية</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="h-64 w-full" dir="ltr">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={attendanceData}>
                                <defs>
                                    <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#E5E7EB" opacity={0.5} />
                                <XAxis dataKey="month" tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} axisLine={false} tickLine={false} dy={10} />
                                <YAxis tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} domain={[0, 100]} unit="%" axisLine={false} tickLine={false} />
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                                        backdropFilter: 'blur(8px)',
                                        border: '1px solid #f1f5f9',
                                        borderRadius: '1.5rem',
                                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                                    }}
                                />
                                <Area type="monotone" dataKey="rate" stroke="#10b981" fill="url(#colorRate)" strokeWidth={4} activeDot={{ r: 6, stroke: '#fff', strokeWidth: 3, fill: '#10b981' }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Sessions by Subject */}
                <div className="bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white dark:border-slate-800 shadow-xl shadow-indigo-500/5 transition-all duration-500 hover:shadow-indigo-500/10">
                    <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-indigo-500/10 text-indigo-600 rounded-2xl flex items-center justify-center border border-indigo-500/20">
                                <BarChart2 size={24} />
                            </div>
                            <div>
                                <h4 className="text-lg font-black text-slate-900 dark:text-white italic">توزيع المسارات</h4>
                                <p className="text-xs font-medium text-slate-400">الحصص حسب المادة العلمية</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="h-64 w-full" dir="ltr">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={subjectStats} layout="vertical">
                                <CartesianGrid strokeDasharray="4 4" stroke="#E5E7EB" opacity={0.5} horizontal={false} />
                                <XAxis type="number" hide />
                                <YAxis type="category" dataKey="subject" tick={{ fontSize: 10, fontWeight: 800, fill: '#64748b' }} width={80} axisLine={false} tickLine={false} />
                                <Tooltip 
                                    cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }}
                                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                />
                                <Bar dataKey="sessions" fill="#6366f1" radius={[0, 10, 10, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Top Students Gamification Section */}
            {students.some((s: any) => (s.totalPoints || 0) > 0) && (
                <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 opacity-10 blur-3xl rounded-full -mr-32 -mt-32"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500 opacity-10 blur-3xl rounded-full -ml-32 -mb-32"></div>
                    
                    <div className="flex items-center justify-between mb-10 relative z-10">
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20">
                                <Award size={32} className="text-yellow-400 shadow-xl" />
                            </div>
                            <div>
                                <h4 className="text-2xl font-black text-white italic">لوحة الشرف</h4>
                                <p className="text-sm font-medium text-indigo-300">أبرز الطلاب تألقاً بالنقاط</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative z-10">
                        {[...students]
                            .filter((s: any) => (s.totalPoints || 0) > 0)
                            .sort((a: any, b: any) => (b.totalPoints || 0) - (a.totalPoints || 0))
                            .slice(0, 5)
                            .map((s: any, i: number) => (
                                <div key={s.id} className={cn(
                                    "relative p-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-[2rem] text-center transition-all duration-500 hover:bg-white/10 hover:-translate-y-2",
                                    i === 0 && "border-yellow-400/30 scale-105"
                                )}>
                                    <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg border border-white/20">
                                        <span className="text-xs font-black text-white">{i + 1}</span>
                                    </div>
                                    
                                    <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform">
                                        {i === 0 ? '👑' : i === 1 ? '🌟' : i === 2 ? '✨' : '🎓'}
                                    </div>
                                    
                                    <p className="font-bold text-sm text-white mb-3 truncate">{s.name}</p>
                                    
                                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 rounded-full border border-white/5">
                                        <Star size={12} className={cn("fill-yellow-400 text-yellow-400", i === 0 && "animate-pulse")} />
                                        <span className="text-sm font-black text-white tabular-nums">{s.totalPoints}</span>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                </div>
            )}
        </div>
    );
};
