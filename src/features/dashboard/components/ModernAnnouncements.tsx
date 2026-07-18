import { useState, useEffect } from 'react';
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

export const ModernAnnouncements = () => {
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
            case 'urgent': return { icon: AlertTriangle, color: 'text-error', bg: 'bg-error-soft', label: 'تنبيه عاجل' };
            case 'holiday': return { icon: Calendar, color: 'text-warning', bg: 'bg-warning-soft', label: 'إجازة رسمية' };
            case 'event': return { icon: Megaphone, color: 'text-primary', bg: 'bg-primary-soft', label: 'فعالية قادمة' };
            default: return { icon: Info, color: 'text-success', bg: 'bg-success-soft', label: 'إعلان عام' };
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
        <div className="relative bg-card border border-border overflow-hidden transition-all duration-300 h-full rounded-card" dir="rtl">
            <div className="flex flex-col md:flex-row items-stretch">
                {/* Type Indicator */}
                <div 
                    onClick={() => setShowAcknowledge(true)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setShowAcknowledge(true); } }}
                    aria-expanded={showAcknowledge}
                    className={cn(
                        "w-full md:w-32 flex flex-row md:flex-col items-center justify-center p-5 gap-3 cursor-pointer transition-all border-b md:border-b-0 md:border-e border-border",
                        type.bg
                    )}
                >
                    <div className="w-10 h-10 bg-card border border-border flex items-center justify-center shadow-soft rounded-card">
                        <type.icon size={20} className={type.color} />
                    </div>
                    <span className={cn("text-micro font-medium uppercase tracking-tight leading-none text-center", type.color)}>
                        {type.label}
                    </span>
                </div>

                {/* Content */}
                <div 
                    onClick={() => setShowAcknowledge(true)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setShowAcknowledge(true); } }}
                    aria-expanded={showAcknowledge}
                    className="flex-1 p-6 md:p-8 relative cursor-pointer group"
                >
                    <div className="absolute top-4 end-6 flex items-center gap-1.5 px-2 py-0.5 bg-background text-on-primary dark:bg-white dark:text-main rounded-lg">
                        <Sparkles size={10} className="text-warning" />
                        <span className="text-micro font-medium uppercase tracking-tight">إعلان {currentIndex + 1} / {announcements.length}</span>
                    </div>

                    <div key={current.id} className="animate-fadeIn ps-1 mt-4">
                        <h4 className="text-main font-medium text-lg md:text-xl mb-3 leading-tight uppercase tracking-tight">
                            {current.title}
                        </h4>
                        <p className="text-muted text-xs md:text-sm leading-relaxed font-normal line-clamp-2">
                            {current.content}
                        </p>
                    </div>

                    {/* Navigation */}
                    {announcements.length > 1 && (
                        <div className="absolute bottom-4 end-6 flex gap-2" onClick={e => e.stopPropagation()}>
                            <button onClick={() => setCurrentIndex(prev => (prev - 1 + announcements.length) % announcements.length)} className="w-8 h-8 flex items-center justify-center bg-card text-main border border-border hover:bg-surface transition-all rounded-card" aria-label="السابق"><ChevronRight size={16} /></button>
                            <button onClick={() => setCurrentIndex(prev => (prev + 1) % announcements.length)} className="w-8 h-8 flex items-center justify-center bg-card text-main border border-border hover:bg-surface transition-all rounded-card" aria-label="التالي"><ChevronLeft size={16} /></button>
                        </div>
                    )}
                </div>
            </div>

            {/* Progress Bar */}
            <div className="absolute bottom-0 start-0 h-1 bg-surface w-full" />
            <div 
                className="absolute bottom-0 start-0 h-1 bg-info transition-all duration-500"
                style={{ width: `${((currentIndex + 1) / announcements.length) * 100}%` }}
            />

            {/* Acknowledgment Modal */}
            {showAcknowledge && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-background/40" role="dialog" aria-modal="true" onKeyDown={(e) => { if (e.key === 'Escape') setShowAcknowledge(false); }}>
                    <div className="bg-card border border-border p-6 md:p-10 max-w-lg w-full rounded-card animate-fadeIn">
                            <div className="flex items-center gap-5 mb-8">
                                <div className={cn("w-16 h-16 border border-white/10 flex items-center justify-center shadow-soft rounded-card", type.bg)}>
                                    <type.icon size={28} className={type.color} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-medium text-main leading-tight uppercase tracking-tight">تأكيد القراءة</h3>
                                    <p className="text-micro font-medium text-muted uppercase mt-0.5">إشعار الامتثال الهام</p>
                                </div>
                            </div>

                            <div className="bg-background p-5 md:p-8 mb-8 border-s-4 border-info rounded-card">
                                <p className="text-base font-normal text-main leading-relaxed italic">
                                    "{current.content}"
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <button 
                                    onClick={handleDismiss}
                                    className="h-12 bg-info text-on-primary font-medium text-micro uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-primary-hover transition-all shadow-soft active:scale-[0.98] rounded-card"
                                >
                                    <Check size={16} />
                                    موافق، تم الاطلاع
                                </button>
                                <button 
                                    onClick={() => setShowAcknowledge(false)}
                                    className="h-12 bg-card text-main font-medium text-micro uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-surface border border-border transition-all shadow-soft active:scale-[0.98] rounded-card"
                                >
                                    <X size={16} />
                                    إغلاق
                                </button>
                            </div>
                    </div>
                </div>
            )}
        </div>
    );


};
