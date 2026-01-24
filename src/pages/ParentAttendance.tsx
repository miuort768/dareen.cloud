import { useState, useEffect, useMemo } from 'react';
import {
    Calendar,
    Filter,
    Clock,
    CheckCircle2,
    XCircle,
    Activity,
    AlertCircle
} from 'lucide-react';
import { api } from '../lib/api';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

export const ParentAttendance = () => {
    const [children, setChildren] = useState<any[]>([]);
    const [sessions, setSessions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedChildId, setSelectedChildId] = useState<string | 'all'>('all');

    useEffect(() => {
        const fetchAttendanceData = async () => {
            try {
                setIsLoading(true);
                const students = await api.get<any[]>('/parents/my-children');
                setChildren(students);

                const sessionsPromises = students.map(s => api.get<any[]>(`/parents/child-sessions/${s.id}`));
                const allSessionsResults = await Promise.all(sessionsPromises);

                // Filter only completed or cancelled sessions for attendance history
                setSessions(allSessionsResults.flat().filter(s => s.status !== 'scheduled'));

            } catch (error) {
                console.error('Error fetching attendance:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAttendanceData();
    }, []);

    const filteredSessions = useMemo(() => {
        if (selectedChildId === 'all') return sessions;
        return sessions.filter(s => s.studentId === selectedChildId);
    }, [selectedChildId, sessions]);

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="h-12 w-48 bg-gray-100 dark:bg-gray-800 animate-pulse"></div>
                <div className="h-96 bg-gray-100 dark:bg-gray-800 animate-pulse"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-20 animate-in fade-in duration-500" dir="rtl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">سجل الحضور والغياب</h1>
                    <p className="text-sm text-gray-500 font-bold dark:text-gray-400">متابعة دقيقة لحضور وانصراف الأبناء في الحصص</p>
                </div>

                <div className="flex items-center gap-2">
                    <Filter size={16} className="text-gray-400" />
                    <select
                        value={selectedChildId}
                        onChange={(e) => setSelectedChildId(e.target.value)}
                        className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 px-4 py-2 font-bold text-xs focus:outline-none focus:border-primary-500 transition-all"
                    >
                        <option value="all">كل الأبناء</option>
                        {children.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Stats Sidebar */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-gray-900 p-6 text-white border-r-4 border-r-emerald-500">
                        <Activity className="text-emerald-500 mb-2" size={24} />
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">إجمالي الحضور</h4>
                        <div className="text-3xl font-black mt-1">
                            {filteredSessions.filter(s => s.status === 'completed').length}
                        </div>
                    </div>
                    <div className="bg-gray-900 p-6 text-white border-r-4 border-r-rose-500">
                        <AlertCircle className="text-rose-500 mb-2" size={24} />
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">إجمالي الغياب</h4>
                        <div className="text-3xl font-black mt-1">
                            {filteredSessions.filter(s => s.status === 'cancelled').length}
                        </div>
                    </div>
                </div>

                {/* Attendance Table */}
                <div className="lg:col-span-3">
                    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                            <h4 className="font-black text-[10px] text-gray-400 uppercase tracking-widest">التاريخ والسجل الزمني</h4>
                            <Calendar size={16} className="text-gray-300" />
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-right">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-800/50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-700">
                                        <th className="px-6 py-4">الابن / المادة</th>
                                        <th className="px-6 py-4 text-center">التوقيت</th>
                                        <th className="px-6 py-4 text-center">الحالة</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                                    {filteredSessions.map((session) => (
                                        <tr key={session.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-gray-900 dark:text-white text-sm">{session.studentName}</div>
                                                <div className="text-[10px] text-gray-400 font-black uppercase tracking-tighter">{session.subject}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col items-center">
                                                    <div className="text-xs font-bold text-gray-700 dark:text-gray-300">
                                                        {format(new Date(session.date), 'eeee, d MMMM yyyy', { locale: ar })}
                                                    </div>
                                                    <div className="flex items-center gap-1 mt-1">
                                                        <Clock size={10} className="text-gray-400" />
                                                        <span className="text-[10px] text-gray-400 font-bold">{session.time}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-center">
                                                    {session.status === 'completed' ? (
                                                        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800">
                                                            <CheckCircle2 size={12} />
                                                            <span className="text-[10px] font-black uppercase tracking-widest">حضر</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2 px-3 py-1 bg-rose-50 text-rose-700 border border-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800">
                                                            <XCircle size={12} />
                                                            <span className="text-[10px] font-black uppercase tracking-widest">غائب / مُلغى</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredSessions.length === 0 && (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-12 text-center text-gray-400 font-bold uppercase text-[10px] tracking-widest italic">لا توجد سجلات حضور متاحة حالياً</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
