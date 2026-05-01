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
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <Radio className="text-red-600 animate-pulse" size={20} />
                    <h3 className="font-black text-lg uppercase tracking-tight italic">الحصص المباشرة</h3>
                </div>
                {isTeacher && (
                    <button 
                        onClick={startNewSession}
                        className="bg-red-600 text-white px-4 py-2 text-xs font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-600/20"
                    >
                        بدء بث جديد
                    </button>
                )}
            </div>

            {sessions.length === 0 ? (
                <div className="bg-slate-50 dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 p-10 text-center">
                    <Monitor size={40} className="mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-500 font-bold text-sm">لا يوجد بث مباشر حالياً</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {sessions.map(session => (
                        <div key={session.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 flex flex-col justify-between group hover:border-red-600 transition-all">
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
                                    <span className="text-[10px] font-black text-red-600 uppercase">Live Now</span>
                                </div>
                                <h4 className="font-black text-slate-900 dark:text-white mb-1 line-clamp-1">{session.title}</h4>
                                <p className="text-xs text-slate-500 mb-4 flex items-center gap-2">
                                    <Users size={12} /> {session.teacherName}
                                </p>
                            </div>
                            <button 
                                onClick={() => navigate(`/classroom/${session.id}`)}
                                className="w-full bg-slate-900 dark:bg-white text-white dark:text-black py-3 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 group-hover:bg-red-600 group-hover:text-white transition-all"
                            >
                                <PlayCircle size={18} />
                                دخول البث
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
