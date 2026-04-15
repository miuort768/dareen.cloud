import React, { useState, useEffect } from 'react';
import { Megaphone, ChevronLeft, ChevronRight, AlertTriangle, Calendar, Info, Sparkles } from 'lucide-react';
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
            case 'urgent': return { icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200', label: 'تنبيه عاجل', gradient: 'bg-rose-600' };
            case 'holiday': return { icon: Calendar, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', label: 'إجازة رسمية', gradient: 'bg-amber-500' };
            case 'event': return { icon: Megaphone, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200', label: 'فعالية قادمة', gradient: 'bg-indigo-600' };
            default: return { icon: Info, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', label: 'إعلان عام', gradient: 'bg-emerald-600' };
        }
    };

    const type = getTypeDetails(current.type);

    return (
        <div className="relative group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-none overflow-hidden transition-all duration-500">
            {/* Animated Progress Bar (Sharp) */}
            <div className="absolute bottom-0 right-0 h-1 bg-indigo-500 transition-all duration-[8000ms] ease-linear z-20" 
                 style={{ width: `${((currentIndex + 1) / announcements.length) * 100}%` }} />
            
            <div className="flex flex-col md:flex-row items-stretch min-h-[100px]">
                {/* Type Badge - Technical Box (Sharp & Small) */}
                <div className={cn("w-full md:w-32 flex flex-row md:flex-col items-center justify-center p-4 gap-2 transition-all duration-700 relative", type.bg)}>
                    <div className={cn("p-2 rounded-none bg-white dark:bg-slate-900 border-2 border-slate-900 text-slate-900", type.color)}>
                        <type.icon size={20} />
                    </div>
                    <span className={cn("text-[9px] font-black uppercase tracking-widest", type.color)}>
                        {type.label}
                    </span>
                </div>

                {/* Content Area (Smaller Fonts) */}
                <div className="flex-1 p-6 md:p-8 flex flex-col justify-center relative">
                    <div className="absolute top-4 left-6 flex items-center gap-2 px-2 py-0.5 bg-slate-50 dark:bg-slate-800 rounded-none border border-slate-100 dark:border-slate-700">
                        <Sparkles size={10} className="text-amber-500" />
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{currentIndex + 1} / {announcements.length}</span>
                    </div>

                    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                        <h4 className="text-slate-900 dark:text-white font-black text-lg mb-1 tracking-tighter uppercase italic">
                            {current.title}
                        </h4>
                        <p className="text-slate-500 dark:text-gray-400 text-[11px] font-bold leading-relaxed max-w-4xl">
                            {current.content}
                        </p>
                    </div>

                    {/* Navigation Control (Sharp) */}
                    {announcements.length > 1 && (
                        <div className="absolute bottom-4 left-6 flex gap-2">
                            <button 
                                onClick={() => setCurrentIndex(prev => (prev - 1 + announcements.length) % announcements.length)}
                                className="w-7 h-7 flex items-center justify-center rounded-none bg-slate-900 text-white hover:bg-indigo-600 transition-all border border-slate-950"
                            >
                                <ChevronRight size={14} />
                            </button>
                            <button 
                                onClick={() => setCurrentIndex(prev => (prev + 1) % announcements.length)}
                                className="w-7 h-7 flex items-center justify-center rounded-none bg-slate-900 text-white hover:bg-indigo-600 transition-all border border-slate-950"
                            >
                                <ChevronLeft size={14} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
