import { useState, useEffect } from 'react';
import { Megaphone, ChevronLeft, ChevronRight, AlertTriangle, Calendar, Info, Sparkles, X, Check } from 'lucide-react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
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
            case 'urgent': return { icon: AlertTriangle, color: 'text-error', bg: 'bg-error/5', ring: 'ring-error/20', label: 'تنبيه عاجل' };
            case 'holiday': return { icon: Calendar, color: 'text-warning', bg: 'bg-warning/5', ring: 'ring-warning/20', label: 'إجازة رسمية' };
            case 'event': return { icon: Megaphone, color: 'text-primary', bg: 'bg-primary/5', ring: 'ring-primary/20', label: 'فعالية قادمة' };
            default: return { icon: Info, color: 'text-success', bg: 'bg-success/5', ring: 'ring-success/20', label: 'إعلان عام' };
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
        <Card className="border-border/50 shadow-sm overflow-hidden h-full" dir="rtl">
            <div className="flex flex-col md:flex-row items-stretch h-full">
                {/* Type Indicator */}
                <div
                    onClick={() => setShowAcknowledge(true)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setShowAcknowledge(true); } }}
                    aria-expanded={showAcknowledge}
                    className={cn(
                        "w-full md:w-28 flex flex-row md:flex-col items-center justify-center p-4 gap-2 cursor-pointer transition-all border-b md:border-b-0 md:border-e border-border/50",
                        type.bg
                    )}
                >
                    <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center ring-1 bg-card", type.ring)}>
                        <type.icon size={18} className={type.color} />
                    </div>
                    <span className={cn("text-[10px] font-semibold leading-tight text-center", type.color)}>
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
                    <div className="absolute top-3 end-4 flex items-center gap-1 px-2 py-0.5 rounded-md bg-card border border-border/50">
                        <Sparkles size={9} className="text-warning" />
                        <span className="text-[9px] font-medium text-muted">إعلان {currentIndex + 1} / {announcements.length}</span>
                    </div>

                    <div key={current.id} className="mt-2">
                        <h4 className="text-main font-semibold text-sm mb-2 leading-tight">
                            {current.title}
                        </h4>
                        <p className="text-muted text-[11px] leading-relaxed line-clamp-2">
                            {current.content}
                        </p>
                    </div>

                    {/* Navigation */}
                    {announcements.length > 1 && (
                        <div className="absolute bottom-3 end-4 flex gap-2" onClick={e => e.stopPropagation()}>
                            <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setCurrentIndex(prev => (prev - 1 + announcements.length) % announcements.length)} aria-label="السابق">
                                <ChevronRight size={13} />
                            </Button>
                            <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setCurrentIndex(prev => (prev + 1) % announcements.length)} aria-label="التالي">
                                <ChevronLeft size={13} />
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Progress Bar */}
            <div className="relative h-0.5 bg-border/30 w-full">
                <div
                    className="absolute top-0 start-0 h-full bg-primary transition-all duration-500"
                    style={{ width: `${((currentIndex + 1) / announcements.length) * 100}%` }}
                />
            </div>

            {/* Acknowledgment Modal */}
            {showAcknowledge && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/60 backdrop-blur-sm" role="dialog" aria-modal="true" onKeyDown={(e) => { if (e.key === 'Escape') setShowAcknowledge(false); }}>
                    <div className="bg-card border border-border/50 shadow-2xl p-6 max-w-lg w-full rounded-2xl">
                        <div className="flex items-center gap-4 mb-6">
                            <div className={cn("w-14 h-14 rounded-xl flex items-center justify-center ring-1", type.bg, type.ring)}>
                                <type.icon size={26} className={type.color} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-main leading-tight">تأكيد القراءة</h3>
                                <p className="text-[11px] font-medium text-muted mt-0.5">إشعار الامتثال</p>
                            </div>
                        </div>

                        <div className="bg-background p-5 mb-6 border-s-4 border-primary rounded-xl">
                            <p className="text-sm text-main leading-relaxed">
                                "{current.content}"
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <Button onClick={handleDismiss} className="h-10 gap-1.5 text-xs">
                                <Check size={14} />
                                موافق، تم الاطلاع
                            </Button>
                            <Button onClick={() => setShowAcknowledge(false)} variant="outline" className="h-10 gap-1.5 text-xs">
                                <X size={14} />
                                إغلاق
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </Card>
    );
};
