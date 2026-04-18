import React, { useState, useEffect } from 'react';
import { Megaphone, ChevronLeft, ChevronRight, AlertTriangle, Calendar, Info, Sparkles, X, Check } from 'lucide-react';
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
    const [dismissedIds, setDismissedIds] = useState<string[]>(() => {
        const saved = localStorage.getItem('dismissed_announcements');
        return saved ? JSON.parse(saved) : [];
    });
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [showAcknowledge, setShowAcknowledge] = useState(false);

    useEffect(() => {
        const fetchAnnouncements = async () => {
            try {
                const data = await api.get<Announcement[]>('/announcements');
                const active = data?.filter(a => a.isActive && !dismissedIds.includes(a.id)) || [];
                setAnnouncements(active);
            } catch (error) {
                console.error('Error fetching announcements:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchAnnouncements();
    }, [dismissedIds]);

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

    const handleDismiss = () => {
        const updated = [...dismissedIds, current.id];
        setDismissedIds(updated);
        localStorage.setItem('dismissed_announcements', JSON.stringify(updated));
        setShowAcknowledge(false);
        setCurrentIndex(0);
    };

    return (
        <div className="relative group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-none overflow-hidden transition-all duration-500">
            {/* Animated Progress Bar (Sharp) */}
            <div className="absolute bottom-0 right-0 h-1 bg-indigo-500 transition-all duration-[8000ms] ease-linear z-20" 
                 style={{ width: `${((currentIndex + 1) / announcements.length) * 100}%` }} />
            
            <div className="flex flex-col md:flex-row items-stretch min-h-[100px]">
                {/* Type Badge - Technical Box (Sharp & Small) */}
                <div onClick={() => setShowAcknowledge(true)} className={cn("w-full md:w-32 flex flex-row md:flex-col items-center justify-center p-3 md:p-4 gap-2 transition-all duration-700 relative cursor-pointer hover:opacity-80 active:scale-95", type.bg)}>
                    <div className={cn("p-1.5 md:p-2 rounded-none bg-white dark:bg-slate-900 border-2 border-slate-900 text-slate-900", type.color)}>
                        <type.icon size={16} className="md:size-[20px]" />
                    </div>
                    <span className={cn("text-[8px] md:text-[9px] font-black uppercase tracking-widest leading-none", type.color)}>
                        {type.label}
                    </span>
                    <div className="hidden md:block absolute top-1 right-1 opacity-20 group-hover:opacity-100 italic font-black text-[8px] tracking-tighter">ACKNOWLEDGE</div>
                </div>

                {/* Content Area (Smaller Fonts) */}
                <div onClick={() => setShowAcknowledge(true)} className="flex-1 p-4 md:p-8 flex flex-col justify-center relative cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <div className="absolute top-2 left-4 md:top-4 md:left-6 flex items-center gap-2 px-1.5 py-0.5 bg-slate-50 dark:bg-slate-800 rounded-none border border-slate-100 dark:border-slate-700">
                        <Sparkles size={8} className="text-amber-500" />
                        <span className="text-[7px] md:text-[8px] font-bold text-slate-400 uppercase tracking-widest">{currentIndex + 1} / {announcements.length}</span>
                    </div>

                    <div className="animate-in fade-in slide-in-from-right-4 duration-500 pr-1 py-4 md:py-0">
                        <h4 className="text-slate-900 dark:text-white font-black text-sm md:text-lg mb-1 tracking-tighter uppercase italic leading-tight">
                            {current.title}
                        </h4>
                        <p className="text-slate-500 dark:text-gray-400 text-[10px] md:text-[11px] font-bold leading-relaxed max-w-4xl line-clamp-3 md:line-clamp-none">
                            {current.content}
                        </p>
                    </div>

                    {/* Navigation Control (Sharp) */}
                    {announcements.length > 1 && (
                        <div className="absolute bottom-2 left-4 md:bottom-4 md:left-6 flex gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <button 
                                onClick={() => setCurrentIndex(prev => (prev - 1 + announcements.length) % announcements.length)}
                                className="w-6 h-6 md:w-7 md:h-7 flex items-center justify-center rounded-none bg-slate-900 text-white hover:bg-indigo-600 transition-all border border-slate-950"
                            >
                                <ChevronRight size={12} className="md:size-[14px]" />
                            </button>
                            <button 
                                onClick={() => setCurrentIndex(prev => (prev + 1) % announcements.length)}
                                className="w-6 h-6 md:w-7 md:h-7 flex items-center justify-center rounded-none bg-slate-900 text-white hover:bg-indigo-600 transition-all border border-slate-950"
                            >
                                <ChevronLeft size={12} className="md:size-[14px]" />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Acknowledgment Dialog (Sharp Technical Modal) */}
            {showAcknowledge && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md bg-slate-900/60 transition-all animate-in fade-in">
                    <div className="bg-white dark:bg-slate-950 border-2 border-slate-900 dark:border-white p-5 md:p-8 max-w-md w-full shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] relative animate-in slide-in-from-bottom-5">
                        <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
                            <type.icon size={24} className={cn("shrink-0 md:size-[32px]", type.color)} />
                            <div>
                                <h3 className="text-[12px] md:text-sm font-black text-slate-900 dark:text-white uppercase tracking-tighter">قمت برؤية التنبيه</h3>
                                <p className="text-[8px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Acknowledgment of information</p>
                            </div>
                        </div>

                        <p className="text-[11px] md:text-xs font-bold text-slate-600 dark:text-slate-400 mb-6 md:mb-8 leading-relaxed italic border-r-2 border-indigo-500 pr-3 md:pr-4">
                            "{current.content}"
                        </p>

                        <div className="grid grid-cols-2 gap-3 md:gap-4">
                            <button 
                                onClick={handleDismiss}
                                className="flex items-center justify-center gap-2 py-3 md:py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-[9px] md:text-[10px] uppercase tracking-widest hover:bg-emerald-600 dark:hover:bg-emerald-500 transition-all"
                            >
                                <Check size={14} />
                                موافق
                            </button>
                            <button 
                                onClick={() => setShowAcknowledge(false)}
                                className="flex items-center justify-center gap-2 py-3 md:py-4 border-2 border-slate-900 dark:border-white font-black text-[9px] md:text-[10px] uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                            >
                                <X size={14} />
                                ترك
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
