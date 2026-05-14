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
            case 'urgent': return { icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-50/10 dark:bg-rose-900/10', border: 'border-rose-600', label: 'تنبيه عاجل' };
            case 'holiday': return { icon: Calendar, color: 'text-amber-600', bg: 'bg-amber-50/10 dark:bg-amber-900/10', border: 'border-amber-500', label: 'إجازة رسمية' };
            case 'event': return { icon: Megaphone, color: 'text-indigo-600', bg: 'bg-indigo-50/10 dark:bg-indigo-900/10', border: 'border-indigo-600', label: 'فعالية قادمة' };
            default: return { icon: Info, color: 'text-emerald-600', bg: 'bg-emerald-50/10 dark:bg-emerald-900/10', border: 'border-emerald-600', label: 'إعلان عام' };
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
        <div className="relative bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-800 rounded-none shadow-2xl overflow-hidden hover:border-indigo-600 transition-all duration-500" dir="rtl">
            <div className="flex flex-col md:flex-row items-stretch">
                {/* Type Indicator */}
                <div 
                    onClick={() => setShowAcknowledge(true)}
                    className={cn(
                        "w-full md:w-48 flex flex-row md:flex-col items-center justify-center p-8 gap-6 cursor-pointer transition-all border-b md:border-b-0 md:border-l-2 border-slate-900 dark:border-slate-800 relative group/indicator",
                        type.bg
                    )}
                >
                    <div className="absolute top-0 right-0 w-2 h-full bg-slate-900 opacity-20 group-hover/indicator:opacity-100 transition-opacity" />
                    <div className="w-16 h-16 bg-slate-900 dark:bg-black text-white rounded-none flex items-center justify-center shadow-2xl border border-white/10 group-hover/indicator:scale-110 transition-transform">
                        <type.icon size={32} className={type.color} />
                    </div>
                    <span className={cn("text-[10px] font-black uppercase tracking-[0.3em] leading-none text-center", type.color)}>
                        {type.label}
                    </span>
                </div>

                {/* Content */}
                <div 
                    onClick={() => setShowAcknowledge(true)}
                    className="flex-1 p-8 md:p-14 relative cursor-pointer group"
                >
                    <div className="absolute top-8 left-10 flex items-center gap-3 px-4 py-2 bg-slate-900 text-white rounded-none border border-slate-700 shadow-xl">
                        <Sparkles size={14} className="text-amber-400" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Bulletin {currentIndex + 1} / {announcements.length}</span>
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={current.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.4 }}
                            className="pr-2 pt-8"
                        >
                            <h4 className="text-slate-900 dark:text-white font-black text-2xl md:text-3xl mb-6 leading-tight tracking-tighter uppercase">
                                {current.title}
                            </h4>
                            <p className="text-slate-600 dark:text-slate-400 text-sm md:text-lg leading-relaxed font-bold line-clamp-2 md:line-clamp-none">
                                {current.content}
                            </p>
                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation */}
                    {announcements.length > 1 && (
                        <div className="absolute bottom-8 left-10 flex gap-1" onClick={e => e.stopPropagation()}>
                            <button onClick={() => setCurrentIndex(prev => (prev - 1 + announcements.length) % announcements.length)} className="w-12 h-12 flex items-center justify-center bg-slate-900 text-white hover:bg-indigo-600 rounded-none transition-all shadow-xl"><ChevronRight size={24} /></button>
                            <button onClick={() => setCurrentIndex(prev => (prev + 1) % announcements.length)} className="w-12 h-12 flex items-center justify-center bg-slate-900 text-white hover:bg-indigo-600 rounded-none transition-all shadow-xl"><ChevronLeft size={24} /></button>
                        </div>
                    )}
                </div>
            </div>

            {/* Progress Bar */}
            <div className="absolute bottom-0 right-0 h-1.5 bg-slate-100 dark:bg-slate-800 w-full" />
            <motion.div 
                className="absolute bottom-0 right-0 h-1.5 bg-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.5)]"
                initial={{ width: "0%" }}
                animate={{ width: `${((currentIndex + 1) / announcements.length) * 100}%` }}
                transition={{ duration: 0.5 }}
            />

            {/* Acknowledgment Modal */}
            <AnimatePresence>
                {showAcknowledge && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 backdrop-blur-xl bg-slate-950/60">
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white dark:bg-slate-900 border-4 border-slate-900 dark:border-slate-800 rounded-none p-10 md:p-16 max-w-2xl w-full shadow-[30px_30px_0px_0px_rgba(0,0,0,0.2)]"
                        >
                            <div className="flex items-center gap-8 mb-12">
                                <div className={cn("w-24 h-24 rounded-none flex items-center justify-center shadow-2xl border-2 border-slate-900", type.bg)}>
                                    <type.icon size={48} className={type.color} />
                                </div>
                                <div>
                                    <h3 className="text-3xl font-black text-slate-900 dark:text-white leading-tight uppercase tracking-tighter">مركز الإعلانات الرسمي</h3>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-2">Official Protocol Acknowledgment</p>
                                </div>
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-none p-8 md:p-12 mb-12 border-l-8 border-indigo-600 shadow-inner">
                                <p className="text-xl font-bold text-slate-800 dark:text-slate-200 leading-relaxed italic">
                                    "{current.content}"
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <button 
                                    onClick={handleDismiss}
                                    className="h-16 bg-indigo-600 text-white font-black text-xs uppercase tracking-[0.2em] rounded-none flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all active:scale-95 shadow-xl shadow-indigo-600/20"
                                >
                                    <Check size={24} />
                                    موافق، قرأت الإعلان
                                </button>
                                <button 
                                    onClick={() => setShowAcknowledge(false)}
                                    className="h-16 bg-slate-900 text-white font-black text-xs uppercase tracking-[0.2em] rounded-none flex items-center justify-center gap-3 hover:bg-black transition-all active:scale-95 shadow-xl"
                                >
                                    <X size={24} />
                                    إغلاق النافذة
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

