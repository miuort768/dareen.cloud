import { useMemo } from 'react';
import {
    BarChart2, TrendingUp, Users, UserCheck, Award
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
        <div className="space-y-8" dir="rtl">
            {/* Top Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[
                    { label: 'إجمالي الحصص', value: sessions.length, icon: BarChart2, color: 'blue' },
                    { label: 'معدل الالتزام الكلي', value: `${overallRate}%`, icon: UserCheck, color: 'emerald' },
                    { label: 'إجمالي الطلاب', value: students.length, icon: Users, color: 'primary' }
                ].map((item, i) => (
                    <div key={i} className="bg-white dark:bg-gray-950 border-4 border-gray-900 dark:border-gray-800 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.1)] p-6 flex items-center gap-5 rounded-none">
                        <div className={cn("p-3 border-2 border-current rounded-none", 
                            item.color === 'blue' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30' :
                            item.color === 'emerald' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30' :
                            'bg-primary-100 text-primary-600 dark:bg-primary-900/30'
                        )}>
                            <item.icon size={24} />
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-1">{item.label}</p>
                            <p className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter tabular-nums">{item.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Attendance Rate by Month */}
                <div className="bg-white dark:bg-gray-950 border-4 border-gray-900 dark:border-gray-800 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] p-6 rounded-none">
                    <h4 className="font-black text-sm uppercase tracking-[0.2em] text-gray-900 dark:text-white flex items-center gap-2 mb-6 border-b-2 border-gray-100 dark:border-gray-800 pb-4">
                        <TrendingUp size={20} className="text-emerald-500" />
                        نسبة الالتزام الشهرية
                    </h4>
                    <ResponsiveContainer width="100%" height={260}>
                        <AreaChart data={attendanceData}>
                            <CartesianGrid strokeDasharray="0" stroke="#eee" opacity={0.4} />
                            <XAxis dataKey="month" tick={{ fontSize: 10, fontWeight: 900 }} axisLine={{ strokeWidth: 2 }} />
                            <YAxis tick={{ fontSize: 10, fontWeight: 900 }} domain={[0, 100]} unit="%" axisLine={{ strokeWidth: 2 }} />
                            <Tooltip 
                                labelStyle={{ fontWeight: 900 }}
                                cursor={{ stroke: '#000', strokeWidth: 2 }}
                                contentStyle={{ backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: 0, padding: '10px' }}
                                itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 900 }}
                            />
                            <Area type="step" dataKey="rate" stroke="#10b981" fill="#10b981" fillOpacity={0.1} strokeWidth={4} isAnimationActive={false} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Sessions by Subject */}
                <div className="bg-white dark:bg-gray-950 border-4 border-gray-900 dark:border-gray-800 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] p-6 rounded-none">
                    <h4 className="font-black text-sm uppercase tracking-[0.2em] text-gray-900 dark:text-white flex items-center gap-2 mb-6 border-b-2 border-gray-100 dark:border-gray-800 pb-4">
                        <BarChart2 size={20} className="text-primary-500" />
                        الحصص حسب المادة
                    </h4>
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={subjectStats} layout="vertical">
                            <CartesianGrid strokeDasharray="0" stroke="#eee" opacity={0.4} horizontal={false} />
                            <XAxis type="number" tick={{ fontSize: 10, fontWeight: 900 }} axisLine={{ strokeWidth: 2 }} />
                            <YAxis type="category" dataKey="subject" tick={{ fontSize: 10, fontWeight: 900 }} width={100} axisLine={{ strokeWidth: 2 }} />
                            <Tooltip 
                                cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                                contentStyle={{ backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: 0 }}
                                itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 900 }}
                            />
                            <Bar dataKey="sessions" fill="var(--color-primary-hex, #6366f1)" radius={0} isAnimationActive={false} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Top Students by points (gamification) */}
            {students.some((s: any) => (s.totalPoints || 0) > 0) && (
                <div className="bg-white dark:bg-gray-950 border-4 border-gray-900 dark:border-gray-800 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] p-6 rounded-none">
                    <h4 className="font-black text-sm uppercase tracking-[0.2em] text-gray-900 dark:text-white flex items-center gap-2 mb-6 border-b-2 border-gray-100 dark:border-gray-800 pb-4">
                        <Award size={20} className="text-yellow-500 fill-yellow-500" />
                        لوحة الشرف — أبرز الطلاب نقاطاً
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {[...students]
                            .filter((s: any) => (s.totalPoints || 0) > 0)
                            .sort((a: any, b: any) => (b.totalPoints || 0) - (a.totalPoints || 0))
                            .slice(0, 5)
                            .map((s: any, i: number) => (
                                <div key={s.id} className={cn(
                                    "p-5 text-center border-4 rounded-none",
                                    i === 0 ? 'border-yellow-400 bg-yellow-400/10' :
                                    i === 1 ? 'border-gray-400 bg-gray-400/10' :
                                    i === 2 ? 'border-amber-700 bg-amber-700/10' :
                                    'border-gray-900 dark:border-gray-800'
                                )}>
                                    <div className="text-3xl mb-2">
                                        {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
                                    </div>
                                    <p className="font-black text-xs text-gray-900 dark:text-white truncate uppercase tracking-tight">{s.name}</p>
                                    <div className="mt-2 py-1 px-2 border-2 border-current inline-block bg-white dark:bg-black">
                                        <p className="text-yellow-600 font-black text-sm tabular-nums">⭐ {s.totalPoints}</p>
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
