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
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none p-6 shadow-sm mb-6 flex flex-col md:flex-row items-center justify-between gap-6" dir="rtl">
            {/* Identity & Welcome */}
            <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-none flex items-center justify-center font-bold text-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <img src="/logo.png" alt="Logo" className="w-12 h-12 object-contain" />
                </div>
                
                <div className="text-right">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="bg-indigo-50 dark:bg-indigo-900/30 text-[#5c59f2] text-[9px] font-black px-2 py-0.5 rounded-none uppercase tracking-widest leading-none">
                            {isTeacher ? 'معلمة معتمدة' : 'إدارة الأكاديمية'}
                        </span>
                        <Sparkles className="text-amber-400" size={14} />
                    </div>
                    <h1 className="text-xl font-bold text-slate-800 dark:text-white leading-none">
                        {isTeacher ? `أهلاً بك، أ. ${currentUser?.name || ''}` : 'لوحة القيادة والتحكم'}
                    </h1>
                    <p className="text-xs font-bold text-slate-400 mt-2 flex items-center gap-2 italic">
                        <Calendar size={12} className="text-[#5c59f2]" />
                        {new Intl.DateTimeFormat('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())}
                    </p>
                </div>
            </div>

            {/* Widgets & Support */}
            <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 w-full md:w-auto">
                {/* Time Widget */}
                <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 px-4 py-2 rounded-none">
                    <Clock size={16} className="text-[#5c59f2]" />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200 tabular-nums">
                        {currentTime.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', hour12: true })}
                    </span>
                </div>

                {/* Active Session */}
                {isTeacher && activeSessions.length > 0 && (
                    <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50 px-4 py-2 rounded-none">
                        <PlayCircle size={16} className="text-emerald-500" />
                        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 tabular-nums">
                            {formatElapsed(activeSessions[0].startedAt)}
                        </span>
                    </div>
                )}

                {/* Support Button */}
                <button
                    onClick={() => window.open('https://wa.me/message/DAREEN', '_blank')}
                    className="h-10 px-5 bg-slate-900 dark:bg-slate-800 text-white rounded-none font-bold text-xs flex items-center gap-2 shadow-sm hover:bg-black transition-all"
                >
                    <Headphones size={14} />
                    <span>الدعم الفني</span>
                </button>
            </div>
        </div>
    );
};
