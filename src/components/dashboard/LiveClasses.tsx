import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlayCircle, Users, Monitor, Loader2, Radio } from 'lucide-react';
import { api } from '../../lib/api';
import { useApp } from '../../context/useApp';

export const LiveClasses = () => {
    const [sessions, setSessions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { currentUser } = useApp();
    const navigate = useNavigate();

    useEffect(() => {
        fetchSessions();
        const interval = setInterval(fetchSessions, 30000); // Refresh every 30s
        return () => clearInterval(interval);
    }, []);

    const fetchSessions = async () => {
        try {
            const data = await api.get<any[]>('/live/active');
            setSessions(data);
        } catch (err) {
            console.error('Failed to fetch live sessions');
        } finally {
            setLoading(false);
        }
    };

    const startNewSession = async () => {
        try {
            const res = await api.post<any>('/live/start', { 
                title: `بث مباشر من ${currentUser?.name}`,
                subject: 'حصة تفاعلية'
            });
            navigate(`/classroom/${res.id}`);
        } catch (err) {
            alert('فشل بدء البث المباشر');
        }
    };

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-red-600" /></div>;

    const isTeacher = currentUser?.role === 'teacher' || currentUser?.role === 'admin';

    return (
        <div className="space-y-4" dir="rtl">
            <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-600 text-white rounded-xl flex items-center justify-center border border-slate-950/10 shadow-sm animate-pulse">
                        <Radio size={20} />
                    </div>
                    <div>
                        <h3 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-tight">غرفة البث المباشر</h3>
                        <p className="text-[9px] font-black text-slate-400 uppercase mt-0.5">Real-time Interactive Hub</p>
                    </div>
                </div>
                {isTeacher && (
                    <button 
                        onClick={startNewSession}
                        className="bg-red-600 text-white px-5 py-2 text-[10px] font-black uppercase border border-red-500 rounded-xl hover:bg-red-700 transition-all active:scale-[0.98]"
                    >
                        بدء بث جديد
                    </button>
                )}
            </div>

            {sessions.length === 0 ? (
                <div className="bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 p-12 text-center rounded-none transition-all">
                    <Monitor size={40} className="mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-500 font-black text-[11px] uppercase tracking-widest">لا يوجد بث مباشر متاح حالياً</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {sessions.map(session => (
                        <div key={session.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 flex flex-col justify-between group hover:border-red-600/50 transition-all rounded-2xl relative shadow-sm">
                            <div className="absolute top-4 left-4">
                                <div className="flex items-center gap-1.5 bg-red-600 text-white px-2 py-0.5 border border-slate-950">
                                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                                    <span className="text-[8px] font-black uppercase">LIVE</span>
                                </div>
                            </div>
                            <div className="mt-2">
                                <h4 className="font-black text-sm text-slate-900 dark:text-white mb-1 line-clamp-1 uppercase tracking-tight">{session.title}</h4>
                                <div className="flex items-center gap-2 text-slate-500 mb-6">
                                    <Users size={12} className="text-red-600" />
                                    <span className="text-[10px] font-bold uppercase">{session.teacherName}</span>
                                </div>
                            </div>
                            <button 
                                onClick={() => navigate(`/classroom/${session.id}`)}
                                className="w-full bg-slate-900 text-white py-3 text-[10px] font-black uppercase rounded-xl flex items-center justify-center gap-2 hover:bg-red-600 transition-colors"
                            >
                                <PlayCircle size={16} />
                                دخول البث الآن
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

};
