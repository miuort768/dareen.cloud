import React, { useState, useEffect } from 'react';
import { Megaphone, ChevronLeft, ChevronRight, AlertTriangle, Calendar, Info, Sparkles, X, Check } from 'lucide-react';
import { api } from '../../../lib/api';
import { cn } from '../../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

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
            case 'urgent': return { icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-900/20', label: 'تنبيه عاجل' };
            case 'holiday': return { icon: Calendar, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20', label: 'إجازة رسمية' };
            case 'event': return { icon: Megaphone, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20', label: 'فعالية قادمة' };
            default: return { icon: Info, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20', label: 'إعلان عام' };
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
        <div className="relative bg-white dark:bg-slate-900 border-2 border-slate-950 dark:border-slate-800 rounded-none shadow-sm overflow-hidden mb-6" dir="rtl">
            <div className="flex flex-col md:flex-row items-stretch">
                {/* Type Indicator */}
                <div 
                    onClick={() => setShowAcknowledge(true)}
                    className={cn(
                        "w-full md:w-36 flex flex-row md:flex-col items-center justify-center p-5 gap-3 cursor-pointer transition-all border-b-2 md:border-b-0 md:border-l-2 border-slate-950",
                        type.bg
                    )}
                >
                    <div className="w-12 h-12 bg-white dark:bg-slate-950 rounded-none border-2 border-slate-950 flex items-center justify-center shadow-md">
                        <type.icon size={24} className={type.color} />
                    </div>
                    <span className={cn("text-[10px] font-black uppercase tracking-[0.2em] leading-none text-center", type.color)}>
                        {type.label}
                    </span>
                </div>

                {/* Content */}
                <div 
                    onClick={() => setShowAcknowledge(true)}
                    className="flex-1 p-6 md:p-10 relative cursor-pointer group"
                >
                    <div className="absolute top-4 left-6 flex items-center gap-2 px-3 py-1 bg-slate-950 text-white rounded-none">
                        <Sparkles size={10} className="text-amber-400" />
                        <span className="text-[9px] font-black uppercase tracking-[0.2em]">إعلان {currentIndex + 1} / {announcements.length}</span>
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={current.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.5 }}
                            className="pr-2"
                        >
                            <h4 className="text-slate-950 dark:text-white font-black text-xl mb-3 leading-tight uppercase tracking-tighter">
                                {current.title}
                            </h4>
                            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-bold italic line-clamp-2 md:line-clamp-none">
                                {current.content}
                            </p>
                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation */}
                    {announcements.length > 1 && (
                        <div className="absolute bottom-4 left-6 flex gap-1" onClick={e => e.stopPropagation()}>
                            <button onClick={() => setCurrentIndex(prev => (prev - 1 + announcements.length) % announcements.length)} className="w-10 h-10 flex items-center justify-center bg-slate-950 text-white hover:bg-indigo-600 rounded-none transition-all"><ChevronRight size={18} /></button>
                            <button onClick={() => setCurrentIndex(prev => (prev + 1) % announcements.length)} className="w-10 h-10 flex items-center justify-center bg-slate-950 text-white hover:bg-indigo-600 rounded-none transition-all"><ChevronLeft size={18} /></button>
                        </div>
                    )}
                </div>
            </div>

            {/* Progress Bar */}
            <div className="absolute bottom-0 right-0 h-1.5 bg-slate-950 opacity-10 w-full" />
            <motion.div 
                className="absolute bottom-0 right-0 h-1.5 bg-indigo-600"
                initial={{ width: "0%" }}
                animate={{ width: `${((currentIndex + 1) / announcements.length) * 100}%` }}
                transition={{ duration: 0.5 }}
            />

            {/* Acknowledgment Modal */}
            <AnimatePresence>
                {showAcknowledge && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md bg-slate-950/60">
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white dark:bg-slate-900 border-4 border-slate-950 dark:border-slate-800 rounded-none p-10 max-w-lg w-full shadow-[20px_20px_0px_0px_rgba(0,0,0,0.2)]"
                        >
                            <div className="flex items-center gap-6 mb-8">
                                <div className={cn("w-16 h-16 rounded-none border-4 border-slate-950 flex items-center justify-center", type.bg)}>
                                    <type.icon size={32} className={type.color} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-950 dark:text-white leading-tight uppercase tracking-tighter">تأكيد القراءة</h3>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">IMPORTANT NOTICE</p>
                                </div>
                            </div>

                            <p className="text-base font-bold text-slate-700 dark:text-slate-300 mb-10 leading-relaxed italic border-r-8 border-indigo-600 pr-6 py-2">
                                "{current.content}"
                            </p>

                            <div className="grid grid-cols-2 gap-4">
                                <button 
                                    onClick={handleDismiss}
                                    className="h-14 bg-indigo-600 text-white font-black rounded-none flex items-center justify-center gap-2 hover:bg-slate-950 transition-all active:scale-95 shadow-xl"
                                >
                                    <Check size={20} />
                                    موافق، قرأت
                                </button>
                                <button 
                                    onClick={() => setShowAcknowledge(false)}
                                    className="h-14 bg-slate-100 dark:bg-slate-800 text-slate-500 font-black rounded-none flex items-center justify-center gap-2 hover:bg-slate-200 transition-all active:scale-95"
                                >
                                    <X size={20} />
                                    إغلاق
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
