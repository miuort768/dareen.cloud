import { useState, useEffect } from 'react';
import { GraduationCap, Clock, CalendarCheck, PlayCircle } from 'lucide-react';
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

    // Poll active sessions every 5 seconds (for teacher only)
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
        <div className="flex flex-col md:flex-row md:items-center justify-center gap-10 xl:gap-40 relative z-10 w-full max-w-6xl mx-auto">
            {/* User Greeting Section */}
            <div className="flex items-center gap-5">
                <div className="relative group">
                    <div className="w-14 h-14 bg-slate-900 dark:bg-slate-800 rounded-none flex items-center justify-center border-2 border-indigo-500 shadow-none transform transition-transform duration-500 group-hover:rotate-6">
                        <GraduationCap size={28} className="text-white" />
                    </div>
                </div>
                
                <div>
                    <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">
                        {isTeacher ? `أهلاً بك، أ. ${currentUser?.name}` : 'لوحة التحكم الاستراتيجية'}
                    </h1>
                    <div className="flex items-center gap-3 mt-1.5">
                        <div className="flex items-center gap-2 px-3 py-1 bg-white/50 dark:bg-slate-900/50 rounded-none border border-slate-200 dark:border-slate-800 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">
                            <CalendarCheck size={12} className="text-indigo-600" />
                            {new Intl.DateTimeFormat('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())}
                        </div>
                        <div className="w-1 h-1 bg-slate-300 dark:bg-slate-700"></div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">معهد دارين للتعليم والتدريب</span>
                    </div>
                </div>
            </div>

            {/* Top Dashboard Actions */}
            <div className="hidden lg:items-center lg:gap-4 lg:flex flex-wrap">

                {/* 🟢 Active Session Live Timer - only for teacher */}
                {isTeacher && activeSessions.length > 0 && activeSessions.map(session => (
                    <div key={session.id} className="flex items-center px-4 py-2 bg-emerald-700 text-white rounded-none border-2 border-emerald-900 gap-3 animate-pulse-slow shadow-lg shadow-emerald-500/30">
                        <PlayCircle size={16} className="text-emerald-200 shrink-0" />
                        <div className="text-right">
                            <p className="text-[8px] font-black opacity-70 uppercase tracking-widest leading-none mb-0.5">{session.subject} — جارٍ الآن</p>
                            <p className="text-base font-black tracking-tighter leading-none tabular-nums font-mono">
                                {formatElapsed(session.startedAt)}
                            </p>
                        </div>
                    </div>
                ))}

                {/* 🕒 Sharp Clock Widget */}
                <div className="flex items-center px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-none border-2 border-slate-950 gap-4 group">
                    <div className="text-right">
                        <p className="text-[9px] font-black opacity-40 uppercase tracking-widest leading-none mb-1 text-left">توقيت دارين</p>
                        <p className="text-base font-black tracking-tighter leading-none tabular-nums font-mono italic">
                           {currentTime.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', hour12: true })}
                        </p>
                    </div>
                    <div className="w-px h-6 bg-white/20 dark:bg-slate-900/20"></div>
                    <div className="w-8 h-8 bg-white/10 dark:bg-slate-900/5 rounded-none flex items-center justify-center">
                        <Clock size={16} />
                    </div>
                </div>
            </div>
        </div>
    );
};
