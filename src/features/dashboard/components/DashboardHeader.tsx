import { useState, useEffect } from 'react';
import { GraduationCap, Clock, PlayCircle, Headphones, Calendar, Sparkles } from 'lucide-react';
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
        <div className="bg-white dark:bg-slate-900 border-2 border-slate-950 dark:border-slate-800 rounded-none p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] dark:shadow-none mb-6 flex flex-col md:flex-row items-center justify-between gap-6" dir="rtl">
            {/* Identity & Welcome */}
            <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="relative group">
                    <div className="w-16 h-16 bg-slate-950 dark:bg-slate-800 text-white rounded-none flex items-center justify-center font-black text-2xl shadow-xl transition-transform group-hover:scale-105 duration-300 border-2 border-slate-950">
                        <GraduationCap size={28} />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-none border-2 border-slate-950 shadow-sm" />
                </div>
                
                <div className="text-right">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="bg-indigo-600 text-white text-[9px] font-black px-2 py-0.5 rounded-none uppercase tracking-[0.2em] leading-none">
                            {isTeacher ? 'Certified Educator' : 'System Operations'}
                        </span>
                        <Sparkles className="text-amber-400" size={14} />
                    </div>
                    <h1 className="text-xl font-black text-slate-950 dark:text-white leading-none uppercase tracking-tighter">
                        {isTeacher ? `أهلاً بك، أ. ${currentUser?.name || ''}` : 'لوحة القيادة والتحكم'}
                    </h1>
                    <div className="flex items-center gap-3 mt-3">
                        <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-none">
                            <Calendar size={12} className="text-indigo-600" />
                            <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                                {new Intl.DateTimeFormat('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Widgets & Support */}
            <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 w-full md:w-auto">
                {/* Time Widget */}
                <div className="flex items-center gap-3 bg-slate-950 text-white border-2 border-slate-950 px-5 py-2.5 rounded-none shadow-[2px_2px_0px_0px_rgba(79,70,229,0.4)]">
                    <Clock size={16} className="text-indigo-400" />
                    <span className="text-xs font-black font-mono tabular-nums tracking-widest">
                        {currentTime.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', hour12: true })}
                    </span>
                </div>

                {/* Active Session */}
                {isTeacher && activeSessions.length > 0 && (
                    <div className="flex items-center gap-3 bg-emerald-500 text-white border-2 border-slate-950 px-5 py-2.5 rounded-none animate-pulse">
                        <PlayCircle size={16} className="text-white" />
                        <span className="text-xs font-black font-mono tabular-nums">
                            {formatElapsed(activeSessions[0].startedAt)}
                        </span>
                    </div>
                )}

                {/* Support Button */}
                <button
                    onClick={() => window.open('https://wa.me/message/DAREEN', '_blank')}
                    className="h-11 px-6 bg-white dark:bg-slate-800 text-slate-950 dark:text-white border-2 border-slate-950 rounded-none font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all active:scale-95"
                >
                    <Headphones size={14} className="text-indigo-600" />
                    <span>الدعم الفني</span>
                </button>
            </div>
        </div>
    );
};
