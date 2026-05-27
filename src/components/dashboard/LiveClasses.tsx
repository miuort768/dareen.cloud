import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlayCircle, Users, Monitor, Loader2, Radio, Plus, AlertCircle } from 'lucide-react';
import { api } from '../../lib/api';
import { useCurrentUser } from '../../context/AppContext';
import { cn } from '../../lib/utils';

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
        } catch {
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

    return (
        <div className="space-y-4 h-full" dir="rtl">
            <div className="flex items-center justify-between bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] text-white flex items-center justify-center shadow-sm">
                        <Radio size={18} strokeWidth={1.5} />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm text-[#0F172A] dark:text-white">غرفة البث المباشر</h3>
                        <p className="text-[9px] font-medium text-[#64748B]">مركز التفاعل المباشر</p>
                    </div>
                </div>

                {isTeacher && (
                    <button
                        onClick={startNewSession}
                        disabled={starting}
                        className="bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] text-white px-5 py-2 text-[10px] font-bold rounded-2xl hover:from-[#1D4ED8] hover:to-[#1E40AF] transition-all active:scale-[0.97] flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
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
                <div className="flex items-center gap-2 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/50 p-3 text-rose-700 dark:text-rose-400 text-xs font-medium rounded-2xl">
                    <AlertCircle size={14} strokeWidth={1.5} className="shrink-0" />
                    {error}
                </div>
            )}

            {loading ? (
                <div className="flex justify-center p-8">
                    <Loader2 className="animate-spin text-[#2563EB]" size={20} strokeWidth={1.5} />
                </div>
            ) : sessions.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-700 p-10 text-center rounded-2xl shadow-sm">
                    <Monitor size={36} strokeWidth={1.5} className="mx-auto text-slate-300 mb-3" />
                    <p className="text-slate-500 font-bold text-[11px]">لا يوجد بث مباشر متاح حالياً</p>
                    {isTeacher && (
                        <p className="text-slate-400 text-[10px] mt-2 font-medium">اضغط "بدء بث جديد" لبدء حصة مباشرة</p>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {sessions.map(session => (
                        <div key={session.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 flex flex-col justify-between group hover:border-[#2563EB]/30 transition-all rounded-2xl shadow-sm relative">
                            <div className="absolute top-4 right-4">
                                <div className="flex items-center gap-1.5 bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] text-white px-2.5 py-1 rounded-xl shadow-sm">
                                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                                    <span className="text-[8px] font-bold">مباشر</span>
                                </div>
                            </div>

                            <div className="mt-2">
                                <h4 className="font-bold text-sm text-[#0F172A] dark:text-white mb-1 line-clamp-1">
                                    {session.title}
                                </h4>
                                <div className="flex items-center gap-2 text-[#64748B] mb-6">
                                    <Users size={12} strokeWidth={1.5} className="text-[#2563EB]" />
                                    <span className="text-[10px] font-medium">{session.teacherName}</span>
                                    {session.subject && (
                                        <span className="text-[10px] text-[#94A3B8]">— {session.subject}</span>
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={() => navigate(`/classroom/${session.id}`)}
                                className={cn(
                                    "w-full bg-gradient-to-r from-[#2563EB] to-[#1D4ED8]",
                                    "text-white py-3 text-[10px] font-bold rounded-2xl flex items-center justify-center gap-2",
                                    "hover:from-[#1D4ED8] hover:to-[#1E40AF] transition-all shadow-sm",
                                    "active:scale-[0.97]"
                                )}
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
