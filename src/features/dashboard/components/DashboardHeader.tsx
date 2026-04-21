import { useState, useEffect } from 'react';
import { GraduationCap, Clock, PlayCircle, Zap, Headphones, Calendar, Sparkles } from 'lucide-react';
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
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#5c59f2] to-purple-500 rounded-[2.5rem] blur opacity-15 group-hover:opacity-25 transition duration-1000"></div>
            
            <div className="relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] shadow-sm">
                
                {/* Decorative Background Circles */}
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-50 dark:bg-indigo-900/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-purple-50 dark:bg-purple-900/10 rounded-full blur-3xl"></div>

                <div className="relative z-10 px-6 py-6 md:py-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    
                    {/* --- RIGHT SECTION: Profile & Welcome --- */}
                    <div className="flex items-center gap-5 w-full md:w-auto">
                        <div className="relative shrink-0">
                            <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-tr from-[#5c59f2] to-indigo-400 rounded-3xl flex items-center justify-center text-white shadow-xl rotate-3">
                                <GraduationCap size={32} className="md:size-40" />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-4 border-white dark:border-slate-900"></div>
                        </div>

                        <div className="text-right">
                             <div className="flex items-center gap-2 mb-1">
                                <span className="bg-indigo-50 dark:bg-indigo-900/30 text-[#5c59f2] text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">
                                    {isTeacher ? 'معلمة معتمدة' : 'مدير النظام'}
                                </span>
                                <Sparkles className="text-amber-400" size={14} />
                             </div>
                             <h1 className="text-xl md:text-3xl font-black text-slate-800 dark:text-white leading-tight">
                                {isTeacher ? `أهلاً بك، أ. ${currentUser?.name || ''}` : 'لوحة التحكم الذكية'}
                             </h1>
                             <div className="flex items-center gap-3 mt-1 text-slate-400 font-bold text-xs md:text-sm">
                                <div className="flex items-center gap-1.5">
                                    <Calendar size={14} />
                                    {new Intl.DateTimeFormat('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())}
                                </div>
                             </div>
                        </div>
                    </div>

                    {/* --- LEFT SECTION: Status & Info --- */}
                    <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 md:gap-4 w-full md:w-auto">
                        
                        {/* Time Widget */}
                        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 px-4 py-2.5 rounded-2xl">
                            <div className="w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-700 rounded-xl shadow-sm">
                                <Clock size={16} className="text-[#5c59f2]" />
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">الوقت الآن</p>
                                <p className="text-sm font-black text-slate-700 dark:text-white tabular-nums font-mono leading-none">
                                    {currentTime.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', hour12: true })}
                                </p>
                            </div>
                        </div>

                        {/* Active Session Indicator */}
                        {isTeacher && activeSessions.length > 0 && (
                            <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50 px-4 py-2.5 rounded-2xl animate-pulse">
                                <div className="w-8 h-8 flex items-center justify-center bg-white dark:bg-emerald-500 rounded-xl shadow-sm text-emerald-500 md:text-white">
                                    <PlayCircle size={16} />
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-bold text-emerald-600 uppercase leading-none mb-1">جلسة نشطة</p>
                                    <p className="text-sm font-black text-emerald-700 dark:text-emerald-300 tabular-nums font-mono leading-none">
                                        {formatElapsed(activeSessions[0].startedAt)}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* XP Points - Mobile Hidden or Adjusted */}
                        {isTeacher && (
                             <div className="hidden sm:flex items-center gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/50 px-4 py-2.5 rounded-2xl">
                                <div className="w-8 h-8 flex items-center justify-center bg-white dark:bg-amber-400 rounded-xl shadow-sm text-amber-500 md:text-white">
                                    <Zap size={16} />
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-bold text-amber-600 uppercase leading-none mb-1">التميز</p>
                                    <span className="text-sm font-black text-amber-700 dark:text-amber-300">نشطة</span>
                                </div>
                            </div>
                        )}

                        {/* Help / Support Button */}
                        <button
                            onClick={() => window.open('https://wa.me/message/DAREEN', '_blank')}
                            className="bg-[#5c59f2] text-white px-5 py-3 rounded-2xl font-bold flex items-center gap-3 shadow-lg shadow-indigo-200 dark:shadow-none hover:-translate-y-0.5 transition-all group/btn"
                        >
                            <div className="w-8 h-8 flex items-center justify-center bg-white/20 rounded-xl group-hover/btn:scale-110 transition-transform">
                                <Headphones size={16} />
                            </div>
                            <div className="text-right hidden sm:block">
                                <p className="text-xs font-black leading-none mb-1">طلب دعم</p>
                                <p className="text-[9px] font-bold text-indigo-100 leading-none">متاح الآن</p>
                            </div>
                            <span className="sm:hidden font-black text-sm">دعم</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
