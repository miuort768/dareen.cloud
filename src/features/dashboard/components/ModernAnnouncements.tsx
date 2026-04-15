import React, { useState, useEffect } from 'react';
import { Megaphone, ChevronLeft, ChevronRight, Bell, AlertTriangle, Calendar, Info, Sparkles } from 'lucide-react';
import { api } from '../../../lib/api';
import { cn } from '../../../lib/utils';

interface Announcement {
    id: string;
    title: string;
    content: string;
    type: 'general' | 'urgent' | 'holiday' | 'event';
    date: string;
    isActive: boolean;
}

export const ModernAnnouncements: React.FC = () => {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnnouncements = async () => {
            try {
                const data = await api.get<Announcement[]>('/announcements');
                setAnnouncements(data?.filter(a => a.isActive) || []);
            } catch (error) {
                console.error('Error fetching announcements:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchAnnouncements();
    }, []);

    useEffect(() => {
        if (announcements.length <= 1) return;
        const timer = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % announcements.length);
        }, 8000);
        return () => clearInterval(timer);
    }, [announcements.length]);

    if (loading || announcements.length === 0) return null;

    const current = announcements[currentIndex];

    const getTypeDetails = (type: string) => {
        switch (type) {
            case 'urgent': return { icon: AlertTriangle, color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/20', label: 'تنبيه عاجل', gradient: 'from-rose-500 to-pink-600' };
            case 'holiday': return { icon: Calendar, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20', label: 'إجازة رسمية', gradient: 'from-amber-500 to-orange-600' };
            case 'event': return { icon: Megaphone, color: 'text-indigo-500', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', label: 'فعالية قادمة', gradient: 'from-indigo-600 to-blue-600' };
            default: return { icon: Info, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', label: 'إعلان عام', gradient: 'from-emerald-600 to-teal-600' };
        }
    };

    const type = getTypeDetails(current.type);

    return (
        <div className="relative group bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] border border-white dark:border-slate-800 shadow-2xl shadow-indigo-500/5 overflow-hidden transition-all duration-500 hover:shadow-indigo-500/10">
            {/* Animated Progress Bar */}
            <div className="absolute bottom-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-30 transition-all duration-[8000ms] ease-linear z-20" 
                 style={{ width: `${((currentIndex + 1) / announcements.length) * 100}%` }} />
            
            <div className="flex flex-col md:flex-row items-stretch min-h-[140px]">
                {/* Type Badge - Modern Gradient Box */}
                <div className={cn("w-full md:w-40 flex flex-row md:flex-col items-center justify-center p-6 gap-3 transition-all duration-700 relative overflow-hidden", type.bg)}>
                    <div className={cn("absolute inset-0 opacity-10 bg-gradient-to-br", type.gradient)}></div>
                    <div className={cn("relative p-3 rounded-2xl bg-white dark:bg-slate-900 shadow-xl", type.color)}>
                        <type.icon size={28} />
                    </div>
                    <span className={cn("relative text-[10px] font-black uppercase tracking-widest", type.color)}>
                        {type.label}
                    </span>
                </div>

                {/* Content Area */}
                <div className="flex-1 p-8 md:p-10 flex flex-col justify-center relative">
                    <div className="absolute top-6 left-8 flex items-center gap-2 px-3 py-1 bg-slate-50 dark:bg-slate-800 rounded-full border border-slate-100 dark:border-slate-700">
                        <Sparkles size={12} className="text-amber-500" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{currentIndex + 1} من {announcements.length}</span>
                    </div>

                    <div className="animate-in fade-in slide-in-from-right-8 duration-700">
                        <h4 className="text-slate-900 dark:text-white font-black text-xl md:text-2xl mb-2 tracking-tight">
                            {current.title}
                        </h4>
                        <p className="text-slate-500 dark:text-gray-400 text-sm md:text-base font-medium leading-relaxed max-w-4xl">
                            {current.content}
                        </p>
                    </div>

                    {/* Navigation Icons Control */}
                    {announcements.length > 1 && (
                        <div className="absolute bottom-6 left-8 flex gap-3">
                            <button 
                                onClick={() => setCurrentIndex(prev => (prev - 1 + announcements.length) % announcements.length)}
                                className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all border border-slate-100 dark:border-slate-700"
                            >
                                <ChevronRight size={18} />
                            </button>
                            <button 
                                onClick={() => setCurrentIndex(prev => (prev + 1) % announcements.length)}
                                className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all border border-slate-100 dark:border-slate-700"
                            >
                                <ChevronLeft size={18} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
