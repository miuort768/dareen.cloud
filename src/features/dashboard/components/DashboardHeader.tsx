import { useState, useEffect } from 'react';
import { GraduationCap, Clock, PlayCircle, Zap, Headphones } from 'lucide-react';
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

            <div className="relative z-10 px-4 md:px-6 py-4 md:py-6 flex items-center justify-between gap-3">

                {/* ── Left: Icon + Name (no box) ── */}
                <div className="flex items-center gap-2.5 min-w-0">
                    <GraduationCap size={18} className="text-white/80 shrink-0" />
                    <div className="min-w-0">
                        <p className="text-[8px] font-black text-white/40 uppercase tracking-widest leading-none mb-0.5 hidden md:block">
                            {isTeacher ? 'معلمة دارين' : 'مدير النظام'}
                        </p>
                        <h1 className="text-sm md:text-base font-black text-white truncate leading-none">
                            {isTeacher ? `أ. ${currentUser?.name}` : 'لوحة التحكم'}
                        </h1>
                    </div>

                    {/* Date on md+ only */}
                    <div className="hidden md:flex items-center gap-1.5 text-white/50 mr-2">
                        <span className="text-[9px] font-bold">
                            {new Intl.DateTimeFormat('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())}
                        </span>
                    </div>
                </div>

                {/* ── Right: Active session + Clock (no box) + Support btn ── */}
                <div className="flex items-center gap-3 shrink-0">

                    {/* Active Session */}
                    {isTeacher && activeSessions.length > 0 && activeSessions.map(session => (
                        <div
                            key={session.id}
                            className="hidden sm:flex items-center gap-1.5 text-white animate-pulse"
                        >
                            <PlayCircle size={13} className="text-emerald-300 shrink-0" />
                            <div>
                                <p className="text-[7px] font-black opacity-60 uppercase leading-none">{session.subject}</p>
                                <p className="text-xs font-black tabular-nums font-mono leading-none">
                                    {formatElapsed(session.startedAt)}
                                </p>
                            </div>
                        </div>
                    ))}

                    {/* Clock — no box, just text */}
                    <div className="flex items-center gap-1.5 text-white">
                        <Clock size={12} className="text-white/50 shrink-0" />
                        <p className="text-xs md:text-sm font-black tabular-nums font-mono leading-none">
                            {currentTime.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', hour12: true })}
                        </p>
                    </div>

                    {/* XP indicator — teacher only, desktop */}
                    {isTeacher && (
                        <div className="hidden sm:flex items-center gap-1 text-amber-200">
                            <Zap size={11} className="fill-current shrink-0" />
                            <span className="text-[9px] font-black">XP</span>
                        </div>
                    )}

                    {/* Support Request Button */}
                    <button
                        onClick={() => window.open('https://wa.me/message/DAREEN', '_blank')}
                        className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white px-2.5 py-1.5 text-[9px] md:text-[10px] font-black uppercase tracking-wider transition-all"
                    >
                        <Headphones size={12} className="shrink-0" />
                        <span className="hidden sm:inline">طلب دعم</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
