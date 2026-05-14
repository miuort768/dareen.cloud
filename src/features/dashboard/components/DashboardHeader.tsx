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
            "rounded-none p-8 mb-8 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden transition-all duration-700",
            isTeacher 
                ? "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm" 
                : "bg-slate-900 dark:bg-slate-950 border-b-4 border-indigo-600 shadow-2xl"
        )} dir="rtl">
            
            {!isTeacher && (
                <>
                    <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none" 
                         style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
                    <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
                </>
            )}

            {/* Identity & Welcome */}
            <div className="flex items-center gap-6 w-full md:w-auto relative z-10">
                <div className={cn(
                    "w-20 h-20 flex items-center justify-center font-bold text-2xl shadow-xl transition-transform duration-500 hover:rotate-12",
                    isTeacher 
                        ? "bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-none" 
                        : "bg-indigo-600 border-2 border-indigo-400 rounded-none"
                )}>
                    <img src="/logo.png" alt="Logo" className={cn("w-14 h-14 object-contain", !isTeacher && "brightness-0 invert")} />
                </div>
                
                <div className="text-right">
                    <div className="flex items-center gap-3 mb-2">
                        <div className={cn(
                            "text-[10px] font-black px-3 py-1 uppercase tracking-[0.2em] leading-none flex items-center gap-2",
                            isTeacher 
                                ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-none" 
                                : "bg-indigo-600 text-white rounded-none"
                        )}>
                            {!isTeacher && <ShieldCheck size={12} />}
                            {isTeacher ? 'Certified Educator' : 'System Administrator'}
                        </div>
                        <Sparkles className="text-amber-400 animate-pulse" size={16} />
                    </div>
                    <h1 className={cn(
                        "text-2xl md:text-3xl font-black leading-tight tracking-tight",
                        isTeacher ? "text-slate-900 dark:text-white" : "text-white"
                    )}>
                        {isTeacher ? `أهلاً بك، أ. ${currentUser?.name || ''}` : 'لوحة القيادة والتحكم'}
                    </h1>
                    <p className={cn(
                        "text-xs font-black mt-3 flex items-center gap-2 uppercase tracking-widest",
                        isTeacher ? "text-slate-400" : "text-slate-400"
                    )}>
                        <Calendar size={14} className="text-indigo-500" />
                        {new Intl.DateTimeFormat('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())}
                    </p>
                </div>
            </div>

            {/* Widgets & Support */}
            <div className="flex flex-wrap items-center justify-center md:justify-end gap-4 w-full md:w-auto relative z-10">
                {/* Time Widget */}
                <div className={cn(
                    "flex items-center gap-3 px-6 py-3 border rounded-none transition-all",
                    isTeacher 
                        ? "bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700" 
                        : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                )}>
                    <Clock size={18} className="text-indigo-500" />
                    <span className="text-sm font-black tabular-nums tracking-widest">
                        {currentTime.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', hour12: true })}
                    </span>
                </div>

                {/* Active Session */}
                {isTeacher && activeSessions.length > 0 && (
                    <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50 px-6 py-3 rounded-none">
                        <PlayCircle size={18} className="text-emerald-500" />
                        <span className="text-sm font-black text-emerald-700 dark:text-emerald-300 tabular-nums tracking-widest">
                            {formatElapsed(activeSessions[0].startedAt)}
                        </span>
                    </div>
                )}

                {/* Support Button */}
                <button
                    onClick={() => window.open('https://wa.me/message/DAREEN', '_blank')}
                    className={cn(
                        "h-12 px-8 font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-3 transition-all active:scale-95 shadow-xl",
                        isTeacher 
                            ? "bg-slate-900 dark:bg-slate-800 text-white hover:bg-black" 
                            : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-600/20"
                    )}
                >
                    <Headphones size={16} />
                    <span>الدعم الفني</span>
                </button>
            </div>
        </div>
    );
};

