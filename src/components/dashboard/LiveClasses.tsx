import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlayCircle, Users, Monitor, Loader2, Radio, Plus, AlertCircle, Clock, ChevronLeft, Sparkles } from 'lucide-react';
import { api } from '../../lib/api';
import { useCurrentUser } from '../../context/AppContext';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

interface LiveSession {
    id: string;
    title: string;
    teacherName: string;
    subject: string;
    status: string;
    attendeeCount?: number;
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
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] p-5 md:p-6" dir="rtl">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#1D4ED8] text-white flex items-center justify-center">
                        <Radio size={16} strokeWidth={1.5} />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">الحصص المباشرة</h3>
                        <p className="text-[9px] font-medium text-slate-400">جلسات تفاعلية الآن</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {sessions.length > 0 && (
                        <span className="flex items-center gap-1.5 text-[9px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 rounded-xl">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                            {sessions.length} مباشر
                        </span>
                    )}
                    {isTeacher && (
                        <button
                            onClick={startNewSession}
                            disabled={starting}
                            className="bg-[#1D4ED8] hover:bg-[#1E40AF] text-white px-4 py-2 text-[10px] font-bold rounded-xl transition-all active:scale-[0.97] flex items-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
                        >
                            {starting ? (
                                <><Loader2 size={12} className="animate-spin" /> جاري...</>
                            ) : (
                                <><Plus size={12} /> بث جديد</>
                            )}
                        </button>
                    )}
                </div>
            </div>

            {error && (
                <div className="flex items-center gap-2 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/50 p-3 text-rose-700 dark:text-rose-400 text-xs font-medium rounded-2xl mb-4">
                    <AlertCircle size={14} className="shrink-0" />
                    {error}
                </div>
            )}

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="animate-spin text-[#1D4ED8]" size={20} />
                </div>
            ) : sessions.length === 0 ? (
                <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 py-12 text-center rounded-2xl">
                    <Monitor size={32} className="mx-auto text-slate-300 mb-3" strokeWidth={1.5} />
                    <p className="text-slate-500 font-semibold text-xs">لا يوجد بث مباشر حالياً</p>
                    {isTeacher && (
                        <p className="text-slate-400 text-[10px] mt-1 font-medium">اضغط "بث جديد" لبدء حصة</p>
                    )}
                </div>
            ) : (
                <div className="space-y-1 pr-2">
                    {sessions.map((session, i) => (
                        <motion.div
                            key={session.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.08, duration: 0.3 }}
                            className="relative flex gap-4 items-start group"
                        >
                            {i !== sessions.length - 1 && (
                                <div className="absolute top-10 right-[15px] w-[2px] h-8 bg-slate-100 dark:bg-slate-800 group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors" />
                            )}
                            <div className="z-10 w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 flex items-center justify-center shrink-0">
                                <span className="w-2.5 h-2.5 bg-[#1D4ED8] rounded-full animate-pulse" />
                            </div>
                            <div className="flex-1 min-w-0 pb-4 border-b border-slate-100 dark:border-slate-800 group-last:border-0">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                                                {session.title}
                                            </h4>
                                            <span className="bg-[#1D4ED8]/10 text-[#1D4ED8] text-[8px] font-bold px-1.5 py-0.5 rounded-lg shrink-0">
                                                مباشر
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 mt-1.5">
                                            <div className="flex items-center gap-1 text-[10px] font-medium text-slate-400">
                                                <Users size={11} className="text-slate-300" strokeWidth={1.5} />
                                                {session.teacherName}
                                            </div>
                                            {session.subject && (
                                                <span className="text-[10px] text-slate-300">·</span>
                                            )}
                                            {session.subject && (
                                                <span className="text-[10px] font-medium text-slate-400">{session.subject}</span>
                                            )}
                                        </div>
                                        <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full mt-3 max-w-[200px]">
                                            <motion.div
                                                initial={{ width: '0%' }}
                                                animate={{ width: `${30 + Math.random() * 60}%` }}
                                                transition={{ duration: 1, ease: 'easeOut' }}
                                                className="h-full bg-[#1D4ED8] rounded-full"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => navigate(`/classroom/${session.id}`)}
                                        className="h-9 px-4 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-[10px] font-bold rounded-xl flex items-center gap-1.5 transition-all active:scale-[0.97] shrink-0 shadow-sm"
                                    >
                                        <PlayCircle size={13} strokeWidth={1.5} />
                                        دخول
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};
