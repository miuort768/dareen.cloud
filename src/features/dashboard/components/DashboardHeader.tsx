import { useState, useEffect } from 'react';
import { Clock, PlayCircle, Headphones, Calendar, Sparkles, ShieldCheck } from 'lucide-react';
import type { User } from '../../../types/auth';
import { cn } from '../../../lib/utils';

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
        const fetchInterval = setInterval(fetchActive, 5000);
        return () => clearInterval(fetchInterval);
    }, [isTeacher]);

    const formatElapsed = (startedAt: string) => {
        const diff = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000);
        const m = Math.floor(diff / 60);
        const s = diff % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className={cn(
            "rounded-none p-6 md:p-8 mb-6 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden transition-all duration-500",
            isTeacher 
                ? "bg-white dark:bg-slate-900 border-2 border-slate-950 dark:border-slate-800 shadow-[6px_6px_0px_0px_rgba(79,70,229,1)]" 
                : "bg-white dark:bg-slate-900 border-2 border-slate-950 dark:border-slate-800 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
        )} dir="rtl">
            
            {!isTeacher && (
                <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none" 
                     style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)', backgroundSize: '24px 24px' }} />
            )}

            {/* Identity & Welcome */}
            <div className="flex items-center gap-5 w-full md:w-auto relative z-10">
                <div className={cn(
                    "w-16 h-16 flex items-center justify-center font-black text-2xl shadow-md transition-transform duration-500 hover:rotate-6 border-2",
                    isTeacher 
                        ? "bg-white dark:bg-slate-800 border-indigo-600 rounded-none" 
                        : "bg-slate-950 dark:bg-white border-slate-950 rounded-none"
                )}>
                    <img src="/logo.png" alt="Logo" className={cn("w-10 h-10 object-contain", !isTeacher && "dark:brightness-0")} />
                </div>
                
                <div className="text-right">
                    <div className="flex items-center gap-2 mb-1.5">
                        <div className={cn(
                            "text-[9px] font-black px-2 py-0.5 uppercase tracking-tight leading-none flex items-center gap-1.5 border",
                            isTeacher 
                                ? "bg-indigo-600 text-white border-indigo-600 rounded-none" 
                                : "bg-slate-950 text-white dark:bg-white dark:text-slate-950 border-slate-950 rounded-none"
                        )}>
                            {!isTeacher && <ShieldCheck size={10} />}
                            {isTeacher ? 'Certified Educator' : 'System Admin'}
                        </div>
                        <Sparkles className="text-amber-500 animate-pulse" size={14} />
                    </div>
                    <h1 className="text-xl md:text-2xl font-black leading-tight tracking-tight text-slate-900 dark:text-white">
                        {isTeacher ? `أهلاً بك، أ. ${currentUser?.name || ''}` : 'مركز القيادة والتحكم'}
                    </h1>
                    <p className="text-[10px] font-black mt-2 flex items-center gap-2 uppercase tracking-tight text-slate-400">
                        <Calendar size={12} className="text-indigo-600" />
                        {new Intl.DateTimeFormat('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())}
                    </p>
                </div>
            </div>

            {/* Widgets & Support */}
            <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 w-full md:w-auto relative z-10">
                {/* Time Widget */}
                <div className="flex items-center gap-2.5 px-5 py-2.5 border-2 border-slate-950 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 transition-all hover:bg-white dark:hover:bg-slate-800 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                    <Clock size={16} className="text-indigo-600" />
                    <span className="text-xs font-black tabular-nums text-slate-900 dark:text-white uppercase">
                        {currentTime.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', hour12: true })}
                    </span>
                </div>

                {/* Active Session */}
                {isTeacher && activeSessions.length > 0 && (
                    <div className="flex items-center gap-2.5 bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-600 px-5 py-2.5 rounded-none shadow-[3px_3px_0px_0px_rgba(16,185,129,1)]">
                        <PlayCircle size={16} className="text-emerald-600" />
                        <span className="text-xs font-black text-emerald-700 dark:text-emerald-300 tabular-nums uppercase">
                            {formatElapsed(activeSessions[0].startedAt)}
                        </span>
                    </div>
                )}

                {/* Support Button */}
                <button
                    onClick={() => window.open('https://wa.me/message/DAREEN', '_blank')}
                    className="h-10 px-6 font-black text-[9px] uppercase tracking-widest flex items-center gap-2 transition-all active:scale-[0.98] bg-indigo-600 text-white hover:bg-indigo-700 border-2 border-slate-950 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                >
                    <Headphones size={14} />
                    <span>الدعم الفني</span>
                </button>
            </div>
        </div>
    );

};

