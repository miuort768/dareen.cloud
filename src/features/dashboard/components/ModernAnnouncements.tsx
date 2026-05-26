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
        <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden transition-all duration-300 h-full" dir="rtl">
            <div className="flex flex-col md:flex-row items-stretch">
                {/* Type Indicator */}
                <div 
                    onClick={() => setShowAcknowledge(true)}
                    className={cn(
                        "w-full md:w-32 flex flex-row md:flex-col items-center justify-center p-5 gap-3 cursor-pointer transition-all border-b md:border-b-0 md:border-l border-slate-100 dark:border-white/5",
                        type.bg
                    )}
                >
                    <div className="w-10 h-10 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-sm">
                        <type.icon size={20} className={type.color} />
                    </div>
                    <span className={cn("text-[9px] font-medium uppercase tracking-tight leading-none text-center", type.color)}>
                        {type.label}
                    </span>
                </div>

                {/* Content */}
                <div 
                    onClick={() => setShowAcknowledge(true)}
                    className="flex-1 p-6 md:p-8 relative cursor-pointer group"
                >
                    <div className="absolute top-4 left-6 flex items-center gap-1.5 px-2 py-0.5 bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                        <Sparkles size={10} className="text-amber-400" />
                        <span className="text-[8px] font-medium uppercase tracking-tight">إعلان {currentIndex + 1} / {announcements.length}</span>
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={current.id}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.3 }}
                            className="pr-1 mt-4"
                        >
                            <h4 className="text-slate-900 dark:text-white font-medium text-lg md:text-xl mb-3 leading-tight uppercase tracking-tight">
                                {current.title}
                            </h4>
                            <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm leading-relaxed font-normal line-clamp-2">
                                {current.content}
                            </p>
                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation */}
                    {announcements.length > 1 && (
                        <div className="absolute bottom-4 left-6 flex gap-2" onClick={e => e.stopPropagation()}>
                            <button onClick={() => setCurrentIndex(prev => (prev - 1 + announcements.length) % announcements.length)} className="w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"><ChevronRight size={16} /></button>
                            <button onClick={() => setCurrentIndex(prev => (prev + 1) % announcements.length)} className="w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"><ChevronLeft size={16} /></button>
                        </div>
                    )}
                </div>
            </div>

            {/* Progress Bar */}
            <div className="absolute bottom-0 right-0 h-1 bg-slate-100 dark:bg-slate-800 w-full" />
            <motion.div 
                className="absolute bottom-0 right-0 h-1 bg-indigo-600"
                initial={{ width: "0%" }}
                animate={{ width: `${((currentIndex + 1) / announcements.length) * 100}%` }}
                transition={{ duration: 0.5 }}
            />

            {/* Acknowledgment Modal */}
            <AnimatePresence>
                {showAcknowledge && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-slate-950/40">
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 md:p-10 max-w-lg w-full"
                        >
                            <div className="flex items-center gap-5 mb-8">
                                <div className={cn("w-16 h-16 border border-white/10 flex items-center justify-center shadow-sm", type.bg)}>
                                    <type.icon size={28} className={type.color} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-medium text-slate-900 dark:text-white leading-tight uppercase tracking-tight">تأكيد القراءة</h3>
                                    <p className="text-[9px] font-medium text-slate-400 uppercase mt-0.5">إشعار الامتثال الهام</p>
                                </div>
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-800/50 p-5 md:p-8 mb-8 border-r-4 border-indigo-600">
                                <p className="text-base font-normal text-slate-700 dark:text-slate-300 leading-relaxed italic">
                                    "{current.content}"
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <button 
                                    onClick={handleDismiss}
                                    className="h-12 bg-indigo-600 text-white font-medium text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-sm active:scale-[0.98]"
                                >
                                    <Check size={16} />
                                    موافق، تم الاطلاع
                                </button>
                                <button 
                                    onClick={() => setShowAcknowledge(false)}
                                    className="h-12 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-50 border border-slate-200 dark:border-slate-700 transition-all shadow-sm active:scale-[0.98]"
                                >
                                    <X size={16} />
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
