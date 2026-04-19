import { useState, useEffect } from 'react';
import { GraduationCap, Clock, CalendarCheck, PlayCircle, Zap } from 'lucide-react';
import type { User } from '../../../types/auth';

interface ActiveSession {
    id: string;
    studentId: string;
    teacherName: string;
    subject: string;
    startedAt: string;
}

interface DashboardHeaderProps {
    isTeacher: boolean;
    currentUser: User | null;
}

export const DashboardHeader = ({ isTeacher, currentUser }: DashboardHeaderProps) => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (!isTeacher) return;
        const fetchActive = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch('/api/active-sessions/my', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setActiveSessions(data);
                }
            } catch { /* silent */ }
        };
        fetchActive();
        const interval = setInterval(fetchActive, 5000);
        return () => clearInterval(interval);
    }, [isTeacher]);

    const formatElapsed = (startedAt: string) => {
        const diff = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000);
        const m = Math.floor(diff / 60);
        const s = diff % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div
            className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 shadow-lg shadow-indigo-500/20"
            dir="rtl"
        >
            {/* dot pattern */}
            <div
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1.5px, transparent 0)', backgroundSize: '28px 28px' }}
            />

            <div className="relative z-10 px-4 md:px-6 py-5 md:py-7 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Left: Name + date */}
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-white/15 border border-white/20 flex items-center justify-center shrink-0">
                        <GraduationCap size={20} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-base md:text-xl font-black text-white tracking-tight leading-none">
                            {isTeacher ? `أهلاً، أ. ${currentUser?.name}` : 'لوحة التحكم'}
                        </h1>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                            <div className="flex items-center gap-1.5 bg-white/15 border border-white/20 px-2 py-0.5">
                                <CalendarCheck size={10} className="text-white/70" />
                                <span className="text-[9px] font-black text-white/80 whitespace-nowrap">
                                    {new Intl.DateTimeFormat('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())}
                                </span>
                            </div>
                            <span className="text-[8px] font-bold text-white/40 hidden sm:inline">معهد دارين للتعليم والتدريب</span>
                        </div>
                    </div>
                </div>

                {/* Right: Clock + Active session */}
                <div className="flex items-center gap-2 shrink-0 flex-wrap">

                    {/* Active Session Live Timer */}
                    {isTeacher && activeSessions.length > 0 && activeSessions.map(session => (
                        <div
                            key={session.id}
                            className="flex items-center gap-2 px-3 py-2 bg-emerald-500/20 border border-emerald-400/40 text-white animate-pulse"
                        >
                            <PlayCircle size={14} className="text-emerald-300 shrink-0" />
                            <div>
                                <p className="text-[8px] font-black opacity-70 uppercase leading-none mb-0.5">{session.subject} — جارٍ الآن</p>
                                <p className="text-sm font-black tabular-nums font-mono leading-none">
                                    {formatElapsed(session.startedAt)}
                                </p>
                            </div>
                        </div>
                    ))}

                    {/* Clock Widget */}
                    <div className="flex items-center gap-2 px-3 py-2 bg-white/15 border border-white/20">
                        <Clock size={13} className="text-white/70" />
                        <div>
                            <p className="text-[7px] font-black text-white/40 uppercase leading-none mb-0.5">توقيت دارين</p>
                            <p className="text-sm font-black text-white tabular-nums font-mono leading-none">
                                {currentTime.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', hour12: true })}
                            </p>
                        </div>
                    </div>

                    {/* XP badge for teacher */}
                    {isTeacher && (
                        <div className="flex items-center gap-1.5 px-3 py-2 bg-amber-400/20 border border-amber-400/30">
                            <Zap size={12} className="text-amber-300 fill-current" />
                            <span className="text-[10px] font-black text-amber-200">نظام XP نشط</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
