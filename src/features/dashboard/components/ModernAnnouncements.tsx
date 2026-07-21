import { useState, useEffect } from 'react';
import { Megaphone, ChevronLeft, ChevronRight, AlertTriangle, Calendar, Info, Sparkles, X, Check } from 'lucide-react';
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

const GlassCard = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={cn(
        "rounded-3xl",
        "bg-card/70 backdrop-blur-xl",
        "border border-white/20 dark:border-white/10",
        "shadow-[0_8px_32px_-4px_rgba(0,0,0,0.04)]",
        "font-dash overflow-hidden",
        className
    )}>
        {children}
    </div>
);

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
            case 'urgent': return { icon: AlertTriangle, color: 'text-error', bg: 'bg-error/5', ring: 'ring-error/20', label: 'تنبيه عاجل', gradient: 'from-error to-rose-500' };
            case 'holiday': return { icon: Calendar, color: 'text-warning', bg: 'bg-warning/5', ring: 'ring-warning/20', label: 'إجازة رسمية', gradient: 'from-warning to-amber-500' };
            case 'event': return { icon: Megaphone, color: 'text-primary', bg: 'bg-primary/5', ring: 'ring-primary/20', label: 'فعالية قادمة', gradient: 'from-primary to-purple-500' };
            default: return { icon: Info, color: 'text-success', bg: 'bg-success/5', ring: 'ring-success/20', label: 'إعلان عام', gradient: 'from-success to-emerald-500' };
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
        <GlassCard dir="rtl">
            <div className="flex flex-col md:flex-row items-stretch">
                {/* Type Indicator */}
                <div
                    onClick={() => setShowAcknowledge(true)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setShowAcknowledge(true); } }}
                    aria-expanded={showAcknowledge}
                    className={cn(
                        "w-full md:w-28 flex flex-row md:flex-col items-center justify-center p-5 gap-2.5 cursor-pointer transition-all border-b md:border-b-0 md:border-e border-white/20 dark:border-white/10",
                        type.bg
                    )}
                >
                    <div className={cn("w-11 h-11 rounded-2xl flex items-center justify-center bg-gradient-to-br shadow-lg", type.gradient)}>
                        <type.icon size={18} className="text-white" />
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
                    className="flex-1 p-6 relative cursor-pointer group"
                >
                    <div className="absolute top-3 end-4 flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/50 dark:bg-white/5 backdrop-blur-sm border border-white/20">
                        <Sparkles size={9} className="text-warning" />
                        <span className="text-[10px] font-semibold text-muted">إعلان {currentIndex + 1} / {announcements.length}</span>
                    </div>

                    <div key={current.id} className="mt-3">
                        <div className="flex items-center gap-2 mb-3">
                            <Badge variant="outline" className={cn("text-[9px] h-5 px-2 rounded-lg border", type.bg, type.ring, type.color)}>
                                {current.date}
                            </Badge>
                        </div>
                        <h4 className="text-main font-bold text-base mb-2 leading-tight">
                            {current.title}
                        </h4>
                        <p className="text-muted text-sm leading-relaxed line-clamp-2">
                            {current.content}
                        </p>
                    </div>

                    {/* Navigation */}
                    {announcements.length > 1 && (
                        <div className="absolute bottom-3 end-4 flex gap-2" onClick={e => e.stopPropagation()}>
                            <Button variant="outline" size="icon" onClick={() => setCurrentIndex(prev => (prev - 1 + announcements.length) % announcements.length)} aria-label="السابق" className="h-8 w-8 rounded-xl border-white/20 bg-white/40 dark:bg-white/5 backdrop-blur-sm">
                                <ChevronRight size={13} />
                            </Button>
                            <Button variant="outline" size="icon" onClick={() => setCurrentIndex(prev => (prev + 1) % announcements.length)} aria-label="التالي" className="h-8 w-8 rounded-xl border-white/20 bg-white/40 dark:bg-white/5 backdrop-blur-sm">
                                <ChevronLeft size={13} />
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Progress Bar */}
            <div className="relative h-1 bg-white/20 dark:bg-white/10 w-full">
                <div
                    className="absolute top-0 start-0 h-full bg-gradient-to-r from-primary to-purple-500 transition-all duration-500 rounded-full"
                    style={{ width: `${((currentIndex + 1) / announcements.length) * 100}%` }}
                />
            </div>

            {/* Acknowledgment Modal */}
            {showAcknowledge && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/60 backdrop-blur-sm" role="dialog" aria-modal="true" onKeyDown={(e) => { if (e.key === 'Escape') setShowAcknowledge(false); }}>
                    <div className="bg-card/95 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-2xl p-6 max-w-lg w-full rounded-3xl">
                        <div className="flex items-center gap-4 mb-6">
                            <div className={cn("w-14 h-14 rounded-2xl bg-gradient-to-br shadow-lg flex items-center justify-center", type.gradient)}>
                                <type.icon size={26} className="text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-main leading-tight">تأكيد القراءة</h3>
                                <p className="text-xs font-medium text-muted mt-0.5">إشعار الامتثال</p>
                            </div>
                        </div>

                        <div className="bg-white/40 dark:bg-white/5 backdrop-blur-sm p-5 mb-6 border-s-4 border-primary rounded-2xl">
                            <p className="text-sm text-main leading-relaxed">
                                "{current.content}"
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <Button onClick={handleDismiss} className="h-11 gap-1.5 text-xs rounded-2xl font-bold bg-gradient-to-r from-primary to-purple-500 hover:from-primary-hover hover:to-purple-600 shadow-lg shadow-primary/20 border-0">
                                <Check size={14} />
                                موافق، تم الاطلاع
                            </Button>
                            <Button onClick={() => setShowAcknowledge(false)} variant="outline" className="h-11 gap-1.5 text-xs rounded-2xl font-bold border-white/20 bg-white/40 dark:bg-white/5">
                                <X size={14} />
                                إغلاق
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </GlassCard>
    );
};
