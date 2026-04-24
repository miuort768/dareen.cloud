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
        <div className="relative bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] shadow-sm overflow-hidden mb-8 hover:shadow-md transition-all duration-500" dir="rtl">
            <div className="flex flex-col md:flex-row items-stretch">
                {/* Type Indicator */}
                <div 
                    onClick={() => setShowAcknowledge(true)}
                    className={cn(
                        "w-full md:w-40 flex flex-row md:flex-col items-center justify-center p-6 gap-4 cursor-pointer transition-all border-b md:border-b-0 md:border-l border-slate-50 dark:border-slate-800",
                        type.bg
                    )}
                >
                    <div className="w-14 h-14 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-700">
                        <type.icon size={28} className={type.color} />
                    </div>
                    <span className={cn("text-[11px] font-bold uppercase tracking-widest leading-none text-center", type.color)}>
                        {type.label}
                    </span>
                </div>

                {/* Content */}
                <div 
                    onClick={() => setShowAcknowledge(true)}
                    className="flex-1 p-8 md:p-12 relative cursor-pointer group"
                >
                    <div className="absolute top-6 left-8 flex items-center gap-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-full border border-indigo-100 dark:border-indigo-800/50">
                        <Sparkles size={12} className="text-amber-500" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">إعلان {currentIndex + 1} / {announcements.length}</span>
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={current.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.4 }}
                            className="pr-2"
                        >
                            <h4 className="text-slate-800 dark:text-white font-bold text-xl md:text-2xl mb-4 leading-tight">
                                {current.title}
                            </h4>
                            <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base leading-relaxed font-medium line-clamp-2 md:line-clamp-none">
                                {current.content}
                            </p>
                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation */}
                    {announcements.length > 1 && (
                        <div className="absolute bottom-6 left-8 flex gap-2" onClick={e => e.stopPropagation()}>
                            <button onClick={() => setCurrentIndex(prev => (prev - 1 + announcements.length) % announcements.length)} className="w-10 h-10 flex items-center justify-center bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-indigo-600 hover:text-white rounded-xl transition-all shadow-sm"><ChevronRight size={20} /></button>
                            <button onClick={() => setCurrentIndex(prev => (prev + 1) % announcements.length)} className="w-10 h-10 flex items-center justify-center bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-indigo-600 hover:text-white rounded-xl transition-all shadow-sm"><ChevronLeft size={20} /></button>
                        </div>
                    )}
                </div>
            </div>

            {/* Progress Bar */}
            <div className="absolute bottom-0 right-0 h-1 bg-slate-100 dark:bg-slate-800 w-full" />
            <motion.div 
                className="absolute bottom-0 right-0 h-1 bg-indigo-500"
                initial={{ width: "0%" }}
                animate={{ width: `${((currentIndex + 1) / announcements.length) * 100}%` }}
                transition={{ duration: 0.5 }}
            />

            {/* Acknowledgment Modal */}
            <AnimatePresence>
                {showAcknowledge && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 backdrop-blur-md bg-slate-950/40">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 md:p-12 max-w-lg w-full shadow-2xl"
                        >
                            <div className="flex items-center gap-6 mb-8">
                                <div className={cn("w-20 h-20 rounded-3xl flex items-center justify-center shadow-inner", type.bg)}>
                                    <type.icon size={36} className={type.color} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-slate-800 dark:text-white leading-tight">تأكيد القراءة</h3>
                                    <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mt-1">Important Notice</p>
                                </div>
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-6 md:p-8 mb-10 border-r-4 border-indigo-500">
                                <p className="text-lg font-medium text-slate-700 dark:text-slate-300 leading-relaxed italic">
                                    "{current.content}"
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button 
                                    onClick={handleDismiss}
                                    className="h-14 bg-indigo-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-200 dark:shadow-none"
                                >
                                    <Check size={20} />
                                    موافق، قرأت
                                </button>
                                <button 
                                    onClick={() => setShowAcknowledge(false)}
                                    className="h-14 bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95"
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
