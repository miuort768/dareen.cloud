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
                <div onClick={() => setShowAcknowledge(true)} className={cn("w-full md:w-32 flex flex-row md:flex-col items-center justify-center p-4 gap-2 transition-all duration-700 relative cursor-pointer hover:opacity-80 active:scale-95", type.bg)}>
                    <div className={cn("p-2 rounded-none bg-white dark:bg-slate-900 border-2 border-slate-900 text-slate-900", type.color)}>
                        <type.icon size={20} />
                    </div>
                    <span className={cn("text-[9px] font-black uppercase tracking-widest", type.color)}>
                        {type.label}
                    </span>
                    <div className="absolute top-1 right-1 opacity-20 group-hover:opacity-100 italic font-black text-[8px] tracking-tighter">ACKNOWLEDGE</div>
                </div>

                {/* Content Area (Smaller Fonts) */}
                <div onClick={() => setShowAcknowledge(true)} className="flex-1 p-6 md:p-8 flex flex-col justify-center relative cursor-pointer hover:bg-slate-50 transition-colors">
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
                        <div className="absolute bottom-4 left-6 flex gap-2" onClick={(e) => e.stopPropagation()}>
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

            {/* Acknowledgment Dialog (Sharp Technical Modal) */}
            {showAcknowledge && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md bg-slate-900/60 transition-all animate-in fade-in">
                    <div className="bg-white dark:bg-slate-950 border-2 border-slate-900 dark:border-white p-8 max-w-md w-full shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] relative animate-in slide-in-from-bottom-5">
                        <div className="flex items-center gap-4 mb-6">
                            <type.icon className={cn("shrink-0", type.color)} size={32} />
                            <div>
                                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tighter">قمت برؤية التنبيه</h3>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Acknowledgment of information</p>
                            </div>
                        </div>

                        <p className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-8 leading-relaxed italic border-r-2 border-indigo-500 pr-4">
                            "{current.content}"
                        </p>

                        <div className="grid grid-cols-2 gap-4">
                            <button 
                                onClick={handleDismiss}
                                className="flex items-center justify-center gap-2 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 dark:hover:bg-emerald-500 transition-all"
                            >
                                <Check size={14} />
                                موافق (إخفاء)
                            </button>
                            <button 
                                onClick={() => setShowAcknowledge(false)}
                                className="flex items-center justify-center gap-2 py-4 border-2 border-slate-900 dark:border-white font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                            >
                                <X size={14} />
                                ترك (إبقاء)
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
