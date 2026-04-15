import { useMemo } from 'react';
import {
    BarChart2, TrendingUp, Users, Award, Zap, Star, ShieldCheck
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
        <div className="space-y-10 p-4" dir="rtl">
            {/* Top Overview Horizontal Rectangles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
                    <div className="flex items-center gap-6 relative z-10">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 text-white">
                            <ShieldCheck size={32} />
                        </div>
                        <div>
                            <p className="text-emerald-100/80 text-xs font-bold uppercase tracking-widest mb-1">معدل الالتزام الكلي</p>
                            <p className="text-4xl font-black text-white tabular-nums">{overallRate}%</p>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
                    <div className="flex items-center gap-6 relative z-10">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 text-white">
                            <Users size={32} />
                        </div>
                        <div>
                            <p className="text-indigo-100/80 text-xs font-bold uppercase tracking-widest mb-1">قاعدة طلاب دارين</p>
                            <p className="text-4xl font-black text-white tabular-nums">{students.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Attendance Rate by Month */}
                <div className="bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white dark:border-slate-800 shadow-xl shadow-indigo-500/5 transition-all duration-500 hover:shadow-indigo-500/10 h-[450px] flex flex-col">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="w-12 h-12 bg-emerald-500/10 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-500/20">
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <h4 className="text-lg font-black text-slate-900 dark:text-white italic">تطور الالتزام</h4>
                            <p className="text-xs font-medium text-slate-400">تتبع نسبة الحضور الشهرية</p>
                        </div>
                    </div>
                    
                    <div className="flex-1 w-full mt-auto mb-4" dir="ltr">
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
                <div className="bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white dark:border-slate-800 shadow-xl shadow-indigo-500/5 transition-all duration-500 hover:shadow-indigo-500/10 h-[450px] flex flex-col">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="w-12 h-12 bg-indigo-500/10 text-indigo-600 rounded-2xl flex items-center justify-center border border-indigo-500/20">
                            <BarChart2 size={24} />
                        </div>
                        <div>
                            <h4 className="text-lg font-black text-slate-900 dark:text-white italic">توزيع المسارات</h4>
                            <p className="text-xs font-medium text-slate-400">الحصص حسب المادة العلمية</p>
                        </div>
                    </div>
                    
                    <div className="flex-1 w-full mt-auto mb-4" dir="ltr">
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

            {/* Honor Roll: Redesigned as a Premium Horizontal Rectangle */}
            {students.some((s: any) => (s.totalPoints || 0) > 0) && (
                <div className="bg-slate-900 dark:bg-slate-950 p-10 rounded-[3.5rem] shadow-2xl relative overflow-hidden border border-slate-800">
                    <div className="absolute top-0 right-0 w-full h-full opacity-30 pointer-events-none">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/20 blur-[100px] -mr-48 -mt-48"></div>
                        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-600/20 blur-[100px] -ml-48 -mb-48"></div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
                        <div className="shrink-0 text-center md:text-right border-l-0 md:border-l border-slate-800 pr-0 md:pr-4 pl-0 md:pl-12">
                            <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-yellow-500/20 mx-auto md:mx-0 mb-6 group-hover:rotate-12 transition-transform duration-500">
                                <Award size={44} className="text-slate-900" />
                            </div>
                            <h4 className="text-3xl font-black text-white italic tracking-tighter mb-2">لوحة الشرف</h4>
                            <p className="text-slate-400 font-medium text-sm">أبرز صُنّاع التميز هذا الشهر</p>
                        </div>

                        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                            {[...students]
                                .filter((s: any) => (s.totalPoints || 0) > 0)
                                .sort((a: any, b: any) => (b.totalPoints || 0) - (a.totalPoints || 0))
                                .slice(0, 5)
                                .map((s: any, i: number) => (
                                    <div key={s.id} className="relative p-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-[2.5rem] text-center hover:bg-white/10 transition-all group">
                                         <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center z-10">
                                            <span className="text-[10px] font-black text-white">{i + 1}</span>
                                        </div>
                                        <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                            {i === 0 ? <Star className="text-yellow-400 fill-yellow-400" size={24} /> : 
                                             i === 1 ? <Star className="text-slate-300 fill-slate-300" size={20} /> :
                                             <Zap className="text-indigo-400 fill-indigo-400" size={18} />
                                            }
                                        </div>
                                        <p className="font-bold text-sm text-white mb-2 truncate">{s.name}</p>
                                        <div className="px-3 py-1 bg-white/10 rounded-full inline-flex items-center gap-1">
                                            <span className="text-xs font-black text-yellow-500 tabular-nums">{s.totalPoints}</span>
                                            <p className="text-[8px] font-bold text-slate-400">نقطة</p>
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
