import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bell,
    AlertTriangle,
    Calendar,
    Search,
    Clock,
    ShieldCheck,
    Grid,
    Zap,
    Umbrella,
    MessageCircle
} from 'lucide-react';
import { api, safeArray } from '../lib/api';
import { useAdminPhone, useAcademyName } from '../context/AppContext';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Skeleton } from '../shared/components/ui';

const TYPE_CONFIG: Record<string, { icon: React.ComponentType<{ size?: number }>; label: string; color: string; bg: string; border: string }> = {
    urgent: { icon: AlertTriangle, label: 'عاجل', color: 'var(--text-error)', bg: 'var(--bg-error-soft)', border: 'var(--border-error)' },
    holiday: { icon: Umbrella, label: 'إجازة', color: 'var(--text-warning)', bg: 'var(--bg-warning-soft)', border: 'var(--border-warning)' },
    event: { icon: Grid, label: 'حدث', color: 'var(--text-primary)', bg: 'var(--bg-primary-soft)', border: 'var(--border-primary)' },
    general: { icon: Bell, label: 'عام', color: 'var(--text-muted)', bg: 'var(--bg-card)', border: 'var(--border)' },
};

interface Announcement {
    id: string;
    title: string;
    content: string;
    type: 'general' | 'urgent' | 'holiday' | 'event';
    date: string;
    isActive: boolean;
}

export const ParentAnnouncements = () => {
    const academyName = useAcademyName();
    useEffect(() => { document.title = `الإعلانات | ${academyName}`; }, [academyName]);
    const adminPhone = useAdminPhone();
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<string>('all');

    const { data: allAnnouncements = [], isLoading } = useQuery({
        queryKey: ['announcements'],
        queryFn: async () => {
            const data = await api.get<Announcement[]>('/announcements');
            return safeArray<Announcement>(data).filter(a => a.isActive);
        },
    });

    const filteredAnnouncements = useMemo(() => allAnnouncements
        .filter(ann =>
            (filterType === 'all' || ann.type === filterType) &&
            ((ann.title || '').toLowerCase().includes((searchQuery || '').toLowerCase()) ||
                (ann.content || '').toLowerCase().includes((searchQuery || '').toLowerCase()))
        )
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
        [allAnnouncements, filterType, searchQuery]
    );

    const getTypeConfig = (type: string) => TYPE_CONFIG[type] || TYPE_CONFIG.general;

    if (isLoading) {
        return (
            <div className="min-h-full pb-32 px-2 lg:px-8 pt-6 space-y-6" dir="rtl">
                <Skeleton className="h-28 w-full rounded-2xl" />
                <Skeleton className="h-12 w-full rounded-xl" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-2xl" />)}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-full pb-32 px-2 lg:px-8 pt-6 space-y-6" dir="rtl">

            <div className="bg-card rounded-2xl border border-border px-4 md:px-6 py-6 md:py-8">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-primary-soft">
                        <Bell size={20} className="text-primary" />
                    </div>
                    <div>
                        <span className="text-micro font-bold px-2 py-0.5 rounded-lg bg-primary-soft text-primary">آخر إعلانات المؤسسة</span>
                    </div>
                </div>
                <div className="space-y-1">
                    <h1 className="text-xl md:text-2xl font-bold text-main leading-tight">آخر إعلانات الدارين</h1>
                    <p className="text-xs font-bold text-muted">تابع كل أخبار المؤسسة والفعاليات والإعلانات هنا</p>
                </div>
            </div>

            <div className="space-y-3">
                <div className="relative">
                    <Search className="absolute start-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                    <input
                        type="text"
                        aria-label="بحث عن إعلان"
                        placeholder="بحث عن إعلان..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full ps-12 pe-6 py-3.5 bg-surface border border-border rounded-xl text-sm font-bold focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-muted text-main"
                    />
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3">
                    <FilterButton
                        label="كل شيء"
                        active={filterType === 'all'}
                        onClick={() => setFilterType('all')}
                        icon={Grid}
                        activeColor="var(--bg-primary)"
                        activeTextColor="text-on-primary"
                    />
                    <FilterButton
                        label="عاجل"
                        active={filterType === 'urgent'}
                        onClick={() => setFilterType('urgent')}
                        icon={Zap}
                        activeColor="var(--bg-error)"
                        activeTextColor="text-on-error"
                    />
                    <FilterButton
                        label="إجازة"
                        active={filterType === 'holiday'}
                        onClick={() => setFilterType('holiday')}
                        icon={Umbrella}
                        activeColor="var(--bg-warning)"
                        activeTextColor="text-on-warning"
                    />
                    <FilterButton
                        label="عام"
                        active={filterType === 'general'}
                        onClick={() => setFilterType('general')}
                        icon={Calendar}
                        activeColor="var(--bg-primary)"
                        activeTextColor="text-on-primary"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <AnimatePresence mode="popLayout">
                    {filteredAnnouncements.map((ann, idx) => {
                        const config = getTypeConfig(ann.type);
                        return (
                            <motion.div
                                layout
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.4, delay: idx * 0.05 }}
                                key={ann.id}
                                className="bg-card rounded-2xl p-5 md:p-6 border border-border relative overflow-hidden flex flex-col"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-2 text-muted text-micro font-bold">
                                        <Clock size={12} />
                                        {format(new Date(ann.date), 'dd MMM yyyy', { locale: ar })}
                                    </div>
                                    <span className="px-3 py-1 rounded-lg text-micro font-bold flex items-center gap-1.5" style={{ backgroundColor: config.bg, color: config.color, borderColor: config.border }}>
                                        {ann.type === 'urgent' && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                                        {config.label}
                                    </span>
                                </div>

                                <div className="space-y-2.5 mb-5 flex-1">
                                    <h3 className="text-sm md:text-lg font-bold text-main leading-tight">
                                        {ann.title}
                                    </h3>
                                    <p className="text-xs text-muted font-bold leading-relaxed line-clamp-4">
                                        {ann.content}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-border">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-primary-soft">
                                            <ShieldCheck size={14} className="text-primary" />
                                        </div>
                                        <span className="text-micro font-bold text-muted">إدارة المؤسسة</span>
                                    </div>
                                    
                                    <a 
                                        href={`https://wa.me/${(adminPhone?.replace(/\D/g, '') || '').replace(/^0/, '20') || '200000000000'}?text=${encodeURIComponent(`الإبلاغ عن مشكلة: ${ann.title}`)}`}
                                        target="_blank" rel="noopener noreferrer"
                                        className="text-primary border border-primary px-4 py-1.5 rounded-xl text-micro font-bold flex items-center gap-2 transition-all hover:bg-primary-hover hover:text-on-primary active:scale-95"
                                    >
                                        <MessageCircle size={14} />
                                        إبلاغ
                                    </a>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>

                {filteredAnnouncements.length === 0 && (
                    <div className="col-span-full py-16 flex flex-col items-center justify-center text-center bg-card rounded-2xl border border-dashed border-border p-8">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 bg-primary-soft">
                            <Bell size={22} className="text-primary" />
                        </div>
                        <h3 className="text-sm font-bold text-muted">لا توجد إعلانات حالياً</h3>
                        <p className="text-micro font-bold text-muted mt-1">تابع أحدث الإعلانات والأخبار هنا</p>
                    </div>
                )}
            </div>

        </div>
    );
};

const FilterButton = ({ label, active, onClick, icon: Icon, activeColor, activeTextColor = "text-on-primary" }: { label: string; active: boolean; onClick: () => void; icon: React.ComponentType<{ size?: number }>; activeColor: string; activeTextColor?: string }) => (
    <button
        onClick={onClick}
        className={cn(
            "flex items-center justify-between px-4 py-3.5 rounded-xl text-micro md:text-xs font-bold transition-all border active:scale-95",
            active 
                ? `${activeTextColor} border-transparent` 
                : "bg-card text-muted border-border hover:bg-surface"
        )}
        style={active ? { backgroundColor: activeColor, borderColor: activeColor } : {}}
    >
        <span>{label}</span>
        <Icon size={14} className={active ? "opacity-100" : "opacity-40"} />
    </button>
);
