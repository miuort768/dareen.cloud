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
        <div className="space-y-6" dir="rtl">
            {/* Top Strip */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'إجمالي الحصص', value: sessions.length, icon: BarChart2, color: 'blue' },
                    { label: 'معدل الالتزام الكلي', value: `${overallRate}%`, icon: UserCheck, color: 'emerald' },
                    { label: 'إجمالي الطلاب', value: students.length, icon: Users, color: 'primary' }
                ].map((item, i) => (
                    <div key={i} className="bg-white dark:bg-gray-900 border shadow-sm p-4 flex items-center gap-3">
                        <div className={cn("p-2", 
                            item.color === 'blue' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
                            item.color === 'emerald' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' :
                            'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400'
                        )}>
                            <item.icon size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.label}</p>
                            <p className="text-xl font-black text-gray-900 dark:text-white">{item.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Attendance Rate by Month */}
                <div className="bg-white dark:bg-gray-900 border shadow-sm p-5">
                    <h4 className="font-black text-xs uppercase tracking-widest text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                        <TrendingUp size={16} className="text-emerald-500" />
                        نسبة الالتزام الشهرية
                    </h4>
                    <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={attendanceData}>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                            <XAxis dataKey="month" tick={{ fontSize: 10, fontFamily: 'inherit' }} />
                            <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} unit="%" />
                            <Tooltip 
                                formatter={(val: any) => [`${val}%`, 'نسبة الالتزام']}
                                contentStyle={{ fontFamily: 'inherit', fontSize: 12, borderRadius: 0 }}
                            />
                            <Area type="monotone" dataKey="rate" stroke="#10b981" fill="#10b981" fillOpacity={0.15} strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Sessions by Subject */}
                <div className="bg-white dark:bg-gray-900 border shadow-sm p-5">
                    <h4 className="font-black text-xs uppercase tracking-widest text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                        <BarChart2 size={16} className="text-primary-500" />
                        الحصص حسب المادة
                    </h4>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={subjectStats} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" opacity={0.1} horizontal={false} />
                            <XAxis type="number" tick={{ fontSize: 10 }} />
                            <YAxis type="category" dataKey="subject" tick={{ fontSize: 10, fontFamily: 'inherit' }} width={80} />
                            <Tooltip 
                                formatter={(val: any, name: any) => [val, name === 'sessions' ? 'الحصص' : 'الغياب']}
                                contentStyle={{ fontFamily: 'inherit', fontSize: 12, borderRadius: 0 }}
                            />
                            <Bar dataKey="sessions" fill="#6366f1" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Top Students by points (gamification) */}
            {students.some((s: any) => (s.totalPoints || 0) > 0) && (
                <div className="bg-white dark:bg-gray-900 border shadow-sm p-5">
                    <h4 className="font-black text-xs uppercase tracking-widest text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                        <Award size={16} className="text-yellow-500" />
                        لوحة الشرف — أبرز الطلاب نقاطاً
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {[...students]
                            .filter((s: any) => (s.totalPoints || 0) > 0)
                            .sort((a: any, b: any) => (b.totalPoints || 0) - (a.totalPoints || 0))
                            .slice(0, 5)
                            .map((s: any, i: number) => (
                                <div key={s.id} className={cn(
                                    "p-3 text-center border-2",
                                    i === 0 ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/10' :
                                    i === 1 ? 'border-gray-300 bg-gray-50 dark:bg-gray-800/30' :
                                    i === 2 ? 'border-amber-700 bg-amber-50/50 dark:bg-amber-900/10' :
                                    'border-gray-100 dark:border-gray-800'
                                )}>
                                    <div className="text-2xl mb-1">
                                        {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
                                    </div>
                                    <p className="font-black text-xs text-gray-900 dark:text-white truncate">{s.name}</p>
                                    <p className="text-yellow-600 font-black text-sm mt-1">⭐ {s.totalPoints}</p>
                                </div>
                            ))
                        }
                    </div>
                </div>
            )}
        </div>
    );
};
