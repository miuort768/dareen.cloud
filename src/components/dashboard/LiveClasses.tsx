import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlayCircle, Users, Monitor, Loader2, Radio, Plus, AlertCircle } from 'lucide-react';
import { api } from '../../lib/api';
import { useCurrentUser } from '../../context/AppContext';

interface LiveSession {
    id: string;
    title: string;
    teacherName: string;
    subject: string;
    status: string;
}

export const LiveClasses = () => {
    const [sessions, setSessions] = useState<LiveSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [starting, setStarting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const currentUser = useCurrentUser();
    const navigate = useNavigate();

    const fetchSessions = useCallback(async () => {
        try {
            const data = await api.get<LiveSession[]>('/live/active');
            if (Array.isArray(data)) setSessions(data);
            setError(null);
        } catch {
            setError('تعذر تحميل بيانات البث المباشر');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSessions();
        const interval = setInterval(fetchSessions, 15000);
        return () => clearInterval(interval);
    }, [fetchSessions]);

    const startNewSession = async () => {
        if (starting) return;
        setStarting(true);
        setError(null);
        try {
            const res = await api.post<{ id: string }>('/live/start', {
                title: `بث مباشر من ${currentUser?.name}`,
                subject: 'حصة تفاعلية'
            });
            if (!res?.id) throw new Error('No session ID returned');
            navigate(`/classroom/${res.id}`);
        } catch {
            setError('فشل بدء البث المباشر. تحقق من الاتصال وحاول مجدداً.');
            setStarting(false);
        }
    };

    const isTeacher = currentUser?.role === 'teacher' || currentUser?.role === 'admin';

    const color = '#2563EB';

    return (
        <div className="space-y-4" dir="rtl">
            <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-none shadow-sm border border-slate-100/50 dark:border-slate-800/50 transition-all duration-300 hover:shadow-md">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-none flex items-center justify-center shadow-sm" style={{ backgroundColor: `${color}12`, color }}>
                        <Radio size={18} strokeWidth={1.5} />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm text-[#0F172A] dark:text-white">غرفة البث المباشر</h3>
                        <p className="text-[9px] font-medium text-[#64748B] dark:text-slate-400">مركز التفاعل المباشر</p>
                    </div>
                </div>

                {isTeacher && (
                    <button
                        onClick={startNewSession}
                        disabled={starting}
                        className="text-white px-5 py-2 text-[10px] font-bold rounded-none transition-all active:scale-[0.97] flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                        style={{ backgroundColor: color }}
                    >
                        {starting ? (
                            <><Loader2 size={13} strokeWidth={1.5} className="animate-spin" /> جاري البدء...</>
                        ) : (
                            <><Plus size={13} strokeWidth={1.5} /> بدء بث جديد</>
                        )}
                    </button>
                )}
            </div>

            {error && (
                <div className="flex items-center gap-2 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/50 p-3 text-rose-700 dark:text-rose-400 text-xs font-medium rounded-none">
                    <AlertCircle size={14} strokeWidth={1.5} className="shrink-0" />
                    {error}
                </div>
            )}

            {loading ? (
                <div className="flex justify-center p-8">
                    <Loader2 className="animate-spin" size={20} strokeWidth={1.5} style={{ color }} />
                </div>
            ) : sessions.length === 0 ? (
                <div className="p-10 text-center bg-white dark:bg-slate-900 rounded-none shadow-sm border border-slate-100/50 dark:border-slate-800/50 transition-all">
                    <Monitor size={36} strokeWidth={1.5} className="mx-auto mb-3" style={{ color: `${color}40` }} />
                    <p className="font-bold text-[11px]" style={{ color }}>لا يوجد بث مباشر متاح حالياً</p>
                    {isTeacher && (
                        <p className="text-slate-400 text-[10px] mt-2 font-medium">اضغط "بدء بث جديد" لبدء حصة مباشرة</p>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {sessions.map(session => (
                        <div
                            key={session.id}
                            className="p-5 flex flex-col justify-between group bg-white dark:bg-slate-900 rounded-none shadow-sm border border-slate-100/50 dark:border-slate-800/50 transition-all hover:shadow-md hover:border-slate-200 dark:hover:border-slate-700"
                        >
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl shadow-sm text-white text-[8px] font-bold w-fit" style={{ backgroundColor: color }}>
                                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                                مباشر
                            </div>

                            <div className="mt-3">
                                <h4 className="font-bold text-sm text-[#0F172A] dark:text-white mb-1 line-clamp-1">
                                    {session.title}
                                </h4>
                                <div className="flex items-center gap-2 text-[#64748B] dark:text-slate-400 mb-4">
                                    <Users size={12} strokeWidth={1.5} style={{ color }} />
                                    <span className="text-[10px] font-medium">{session.teacherName}</span>
                                    {session.subject && (
                                        <span className="text-[10px] text-[#94A3B8]">— {session.subject}</span>
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={() => navigate(`/classroom/${session.id}`)}
                                className="w-full text-white py-3 text-[10px] font-bold rounded-none flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow-md active:scale-[0.97]"
                                style={{ backgroundColor: color }}
                            >
                                <PlayCircle size={16} strokeWidth={1.5} />
                                دخول البث الآن
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
