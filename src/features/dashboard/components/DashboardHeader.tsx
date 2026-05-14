import { useState, useEffect } from 'react';
import { Clock, PlayCircle, Headphones, Calendar, Sparkles } from 'lucide-react';
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
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8" dir="rtl">
            {/* Identity & Welcome */}
            <div className="text-right">
                <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white leading-tight flex items-center gap-2">
                    مرحباً، {isTeacher ? `أ. ${currentUser?.name || ''}` : currentUser?.name?.split(' ')[0] || 'مدير النظام'}
                    <span className="text-amber-400 animate-bounce">👋</span>
                </h1>
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mt-1">
                    نظرة عامة على أداء الأكاديمية اليوم
                </p>
            </div>

            {/* Widgets & Support */}
            <div className="flex items-center gap-3 bg-white dark:bg-slate-900 px-4 py-2 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-4 pl-4 border-l border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-black text-slate-700 dark:text-slate-200">
                        {new Intl.DateTimeFormat('ar-EG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())}
                    </p>
                </div>
                
                <div className="flex items-center gap-2">
                    <button className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all">
                        <Calendar size={18} />
                    </button>
                    <div className="relative">
                        <button className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all">
                            <Headphones size={18} />
                        </button>
                        <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-900"></span>
                    </div>
                    <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-white dark:border-slate-800 shadow-md">
                        <img 
                            src={currentUser?.role === 'admin' ? '/admin-avatar.png' : 'https://i.pravatar.cc/150?u=teacher'} 
                            alt="Profile" 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${currentUser?.name}&background=6366f1&color=fff`;
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
