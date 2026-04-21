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
        <div className="relative group" dir="rtl">
            {/* Background Glow */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#5c59f2] to-purple-500 rounded-none blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
            
            <div className="relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-none shadow-sm">
                
                {/* Decorative Background Circles */}
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-50 dark:bg-indigo-900/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-purple-50 dark:bg-purple-900/10 rounded-full blur-3xl"></div>

                <div className="relative z-10 px-4 py-3 md:px-5 md:py-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    
                    {/* --- RIGHT SECTION: Profile & Welcome --- */}
                    <div className="flex items-center gap-3 md:gap-4 w-full md:w-auto">
                        <div className="relative shrink-0">
                            <div className="w-10 h-10 md:w-16 md:h-16 bg-gradient-to-tr from-[#5c59f2] to-indigo-400 rounded-xl md:rounded-2xl flex items-center justify-center text-white shadow-lg rotate-2 group-hover:rotate-0 transition-transform">
                                <GraduationCap size={20} className="md:size-32" />
                            </div>
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 md:w-4 md:h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900"></div>
                        </div>

                        <div className="text-right">
                             <div className="flex items-center gap-1 mb-0.5">
                                <span className="bg-indigo-50 dark:bg-indigo-900/30 text-[#5c59f2] text-[8px] md:text-[9px] font-black px-1.5 py-0.5 rounded-lg uppercase tracking-tighter">
                                    {isTeacher ? 'معلمة معتمدة' : 'مدير النظام'}
                                </span>
                                <Sparkles className="text-amber-400 md:size-3" size={10} />
                             </div>
                             <h1 className="text-sm md:text-xl font-black text-slate-800 dark:text-white leading-none">
                                {isTeacher ? `أهلاً بك، أ. ${currentUser?.name || ''}` : 'لوحة التحكم'}
                             </h1>
                             <div className="flex items-center gap-2 mt-1 text-slate-400 font-bold text-[9px] md:text-xs">
                                <div className="flex items-center gap-1">
                                    <Calendar size={10} className="md:size-3" />
                                    {new Intl.DateTimeFormat('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())}
                                </div>
                             </div>
                        </div>
                    </div>

                    {/* --- LEFT SECTION: Status & Info --- */}
                    <div className="flex flex-wrap items-center justify-center md:justify-end gap-2 md:gap-3 w-full md:w-auto">
                        
                        {/* Time Widget */}
                        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 px-2.5 py-1.5 md:px-3 md:py-2 rounded-lg md:rounded-xl">
                            <div className="w-6 h-6 md:w-7 md:h-7 flex items-center justify-center bg-white dark:bg-slate-700 rounded-md md:rounded-lg shadow-sm">
                                <Clock size={12} className="md:size-[14px] text-[#5c59f2]" />
                            </div>
                            <div className="text-right">
                                <p className="text-[9px] md:text-[10px] font-black text-slate-700 dark:text-white tabular-nums font-mono leading-none">
                                    {currentTime.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', hour12: true })}
                                </p>
                            </div>
                        </div>

                        {/* Active Session Indicator */}
                        {isTeacher && activeSessions.length > 0 && (
                            <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50 px-2.5 py-1.5 md:px-3 md:py-2 rounded-lg md:rounded-xl animate-pulse">
                                <PlayCircle size={12} className="md:size-[14px] text-emerald-500" />
                                <div className="text-right">
                                    <p className="text-[9px] md:text-[10px] font-black text-emerald-700 dark:text-emerald-300 tabular-nums font-mono leading-none">
                                        {formatElapsed(activeSessions[0].startedAt)}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Help / Support Button */}
                        <button
                            onClick={() => window.open('https://wa.me/message/DAREEN', '_blank')}
                            className="bg-[#5c59f2] text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl font-bold flex items-center gap-2 shadow-md shadow-indigo-100 dark:shadow-none hover:-translate-y-0.5 transition-all text-[10px] md:text-xs"
                        >
                            <Headphones size={12} className="md:size-[14px]" />
                            <span>دعم</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
