import { useState, useEffect } from 'react';
import { Megaphone, ChevronLeft, ChevronRight, AlertTriangle, Calendar, Info, X, Check } from 'lucide-react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
        <div className="rounded-2xl bg-card dark:bg-[#0d0d0f] border border-border dark:border-[#D4AF37]/20 overflow-hidden font-dash" dir="rtl">
            <div className="flex flex-col md:flex-row items-stretch">
                {/* Type Indicator */}
                <div
                    onClick={() => setShowAcknowledge(true)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setShowAcknowledge(true); } }}
                    aria-expanded={showAcknowledge}
                    className={cn(
                        "w-full md:w-24 flex flex-row md:flex-col items-center justify-center p-4 gap-2.5 cursor-pointer transition-colors border-b md:border-b-0 md:border-s border-border",
                        type.bg
                    )}
                >
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", type.bg)}>
                        <type.icon size={18} className={type.color} />
                    </div>
                    <span className={cn("text-[11px] font-bold leading-tight text-center", type.color)}>
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
                    className="flex-1 p-5 relative cursor-pointer group"
                >
                    <div className="absolute top-3 end-4 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface dark:bg-[#1a1a1e] text-[10px] font-semibold text-muted dark:text-zinc-400">
                        <span>{currentIndex + 1} / {announcements.length}</span>
                    </div>

                    <div key={current.id} className="mt-2">
                        <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className={cn("text-[9px] h-5 px-2 rounded-lg border", type.bg, type.color)}>
                                {current.date}
                            </Badge>
                        </div>
                        <h4 className="text-main dark:text-white font-bold text-[13px] mb-1 leading-tight">
                            {current.title}
                        </h4>
                        <p className="text-muted dark:text-zinc-400 text-[11px] leading-relaxed line-clamp-2">
                            {current.content}
                        </p>
                    </div>

                    {announcements.length > 1 && (
                        <div className="absolute bottom-3 end-4 flex gap-1.5" onClick={e => e.stopPropagation()}>
                            <Button variant="outline" size="icon" onClick={() => setCurrentIndex(prev => (prev - 1 + announcements.length) % announcements.length)} aria-label="السابق" className="h-8 w-8 rounded-lg">
                                <ChevronRight size={13} />
                            </Button>
                            <Button variant="outline" size="icon" onClick={() => setCurrentIndex(prev => (prev + 1) % announcements.length)} aria-label="التالي" className="h-8 w-8 rounded-lg">
                                <ChevronLeft size={13} />
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Progress Bar */}
            <div className="relative h-1 bg-surface dark:bg-[#1a1a1e] w-full">
                <div
                    className="absolute top-0 start-0 h-full bg-primary transition-all duration-500 rounded-full"
                    style={{ width: `${((currentIndex + 1) / announcements.length) * 100}%` }}
                />
            </div>

            {/* Acknowledgment Modal */}
            {showAcknowledge && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/60 dark:bg-black/70 backdrop-blur-sm" role="dialog" aria-modal="true" onKeyDown={(e) => { if (e.key === 'Escape') setShowAcknowledge(false); }}>
                    <div className="bg-card dark:bg-[#0d0d0f] border border-border dark:border-[#D4AF37]/20 shadow-xl p-5 max-w-lg w-full rounded-2xl">
                        <div className="flex items-center gap-3 mb-5">
                            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", type.bg)}>
                                <type.icon size={22} className={type.color} />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-main dark:text-white leading-tight">تأكيد القراءة</h3>
                                <p className="text-[11px] font-medium text-muted dark:text-zinc-400 mt-0.5">إشعار الامتثال</p>
                            </div>
                        </div>

                        <div className="bg-surface dark:bg-[#1a1a1e] p-4 mb-5 border-s-4 border-primary dark:border-[#D4AF37] rounded-xl">
                            <p className="text-sm text-main dark:text-white leading-relaxed">
                                "{current.content}"
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <Button onClick={handleDismiss} className="h-10 gap-1.5 text-xs rounded-xl font-bold">
                                <Check size={14} />
                                موافق، تم الاطلاع
                            </Button>
                            <Button onClick={() => setShowAcknowledge(false)} variant="outline" className="h-10 gap-1.5 text-xs rounded-xl font-bold">
                                <X size={14} />
                                إغلاق
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
