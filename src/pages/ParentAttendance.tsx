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
import { PageLoader } from '../components/ui/PageLoader';

export const ParentAttendance = () => {
    const [children, setChildren] = useState<Record<string, unknown>[]>([]);
    const [sessions, setSessions] = useState<Record<string, unknown>[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedChildId, setSelectedChildId] = useState<string | 'all'>('all');

    useEffect(() => {
        const fetchAttendanceData = async () => {
            try {
                setIsLoading(true);
                const students = await api.get<Record<string, unknown>[]>('/parents/my-children');
                setChildren(students);

                const sessionsPromises = students.map(s => api.get<Record<string, unknown>[]>(`/parents/child-sessions/${s.id}`));
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
        return <PageLoader />;
    }

    return (
        <div className="space-y-6 pb-20 animate-in fade-in duration-500" dir="rtl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-medium text-main dark:text-on-primary tracking-tight">”Ã· «·Õ÷Ê— Ê«·€Ì«»</h1>
                    <p className="text-sm text-muted font-normal dark:text-muted">„ «»⁄… œﬁÌﬁ… ·Õ÷Ê— Ê«‰’—«› «·√»‰«¡ ›Ì «·Õ’’</p>
                </div>

                <div className="flex items-center gap-2">
                    <Filter size={16} className="text-muted" />
                    <select
                        value={selectedChildId}
                        onChange={(e) => setSelectedChildId(e.target.value)}
                        className="bg-white dark:bg-card border border-border dark:border-border px-4 py-2 font-normal text-xs focus:outline-none focus:border-primary transition-all"
                    >
                        <option value="all">ﬂ· «·√»‰«¡</option>
                        {children.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Stats Sidebar */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-card p-6 text-on-primary border-r-4 border-r-emerald-500">
                        <Activity className="text-success mb-2" size={24} />
                        <h4 className="text-[10px] font-medium text-muted uppercase tracking-widest">≈Ã„«·Ì «·Õ÷Ê—</h4>
                        <div className="text-3xl font-medium mt-1">
                            {filteredSessions.filter(s => s.status === 'completed').length}
                        </div>
                    </div>
                    <div className="bg-card p-6 text-on-primary border-r-4 border-r-rose-500">
                        <AlertCircle className="text-error mb-2" size={24} />
                        <h4 className="text-[10px] font-medium text-muted uppercase tracking-widest">≈Ã„«·Ì «·€Ì«»</h4>
                        <div className="text-3xl font-medium mt-1">
                            {filteredSessions.filter(s => s.status === 'cancelled').length}
                        </div>
                    </div>
                </div>

                {/* Attendance Table */}
                <div className="lg:col-span-3">
                    <div className="bg-white dark:bg-card border border-border dark:border-border shadow-sm overflow-hidden">
                        <div className="p-4 bg-background dark:bg-card/50 border-b border-border dark:border-border flex items-center justify-between">
                            <h4 className="font-medium text-[10px] text-muted uppercase tracking-widest">«· «—ÌŒ Ê«·”Ã· «·“„‰Ì</h4>
                            <Calendar size={16} className="text-dim" />
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-right">
                                <thead>
                                    <tr className="bg-background dark:bg-card/50 text-[10px] font-medium text-muted uppercase tracking-widest border-b border-border dark:border-border">
                                        <th className="px-6 py-4">«·«»‰ / «·„«œ…</th>
                                        <th className="px-6 py-4 text-center">«· ÊﬁÌ </th>
                                        <th className="px-6 py-4 text-center">«·Õ«·…</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border dark:divide-border">
                                    {filteredSessions.map((session) => (
                                        <tr key={session.id} className="hover:bg-surface dark:hover:bg-card/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="font-normal text-main dark:text-on-primary text-sm">{session.studentName}</div>
                                                <div className="text-[10px] text-muted font-medium uppercase tracking-tighter">{session.subject}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col items-center">
                                                    <div className="text-xs font-normal text-main dark:text-dim">
                                                        {format(new Date(session.date), 'eeee, d MMMM yyyy', { locale: ar })}
                                                    </div>
                                                    <div className="flex items-center gap-1 mt-1">
                                                        <Clock size={10} className="text-muted" />
                                                        <span className="text-[10px] text-muted font-normal">{session.time}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-center">
                                                    {session.status === 'completed' ? (
                                                        <div className="flex items-center gap-2 px-3 py-1 bg-success-light text-success border border-success dark:bg-success/20 dark:text-success dark:border-success">
                                                            <CheckCircle2 size={12} />
                                                            <span className="text-[10px] font-medium uppercase tracking-widest">Õ÷—</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2 px-3 py-1 bg-error-light text-error border border-error dark:bg-error/20 dark:text-error dark:border-error">
                                                            <XCircle size={12} />
                                                            <span className="text-[10px] font-medium uppercase tracking-widest">€«∆» / „ı·€Ï</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredSessions.length === 0 && (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-12 text-center text-muted font-normal uppercase text-[10px] tracking-widest italic">·«  ÊÃœ ”Ã·«  Õ÷Ê— „ «Õ… Õ«·Ì«</td>
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
