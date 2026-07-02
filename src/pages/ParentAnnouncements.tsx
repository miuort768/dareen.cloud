import { useState, useEffect } from 'react';
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
import { api } from '../lib/api';
import { useAdminPhone } from '../context/AppContext';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { PageLoader } from '../components/ui/PageLoader';

const TYPE_CONFIG: Record<string, { icon: React.ComponentType<{ size?: number }>; label: string; color: string; bg: string; border: string }> = {
    urgent: { icon: AlertTriangle, label: '⁄«Ã·', color: 'var(--text-error)', bg: 'var(--bg-error-soft)', border: 'var(--border-error)' },
    holiday: { icon: Umbrella, label: '≈Ã«“…', color: 'var(--text-warning)', bg: 'var(--bg-warning-soft)', border: 'var(--border-warning)' },
    event: { icon: Grid, label: '›⁄«·Ì…', color: 'var(--text-primary)', bg: 'var(--bg-primary-soft)', border: 'var(--border-primary)' },
    general: { icon: Bell, label: '‰‘—…', color: 'var(--text-dim)', bg: 'var(--bg-card)', border: 'var(--border)' },
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
    const adminPhone = useAdminPhone();
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<string>('all');

    useEffect(() => {
        const fetchAnnouncements = async () => {
            try {
                setIsLoading(true);
                const data = await api.get<Announcement[]>('/announcements');
                setAnnouncements(data?.filter(a => a.isActive) || []);
            } catch (error) {
                console.error('Error fetching announcements:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAnnouncements();
    }, []);

    const filteredAnnouncements = announcements
        .filter(ann =>
            (filterType === 'all' || ann.type === filterType) &&
            ((ann.title || '').toLowerCase().includes((searchQuery || '').toLowerCase()) ||
                (ann.content || '').toLowerCase().includes((searchQuery || '').toLowerCase()))
        )
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const getTypeConfig = (type: string) => TYPE_CONFIG[type] || TYPE_CONFIG.general;

    if (isLoading) {
        return <PageLoader />;
    }

    return (
        <div className="min-h-full pb-32 px-2 lg:px-8 pt-6 space-y-6" dir="rtl">

            <div className="bg-white dark:bg-primary-active rounded-2xl shadow-sm border border-border/50 dark:border-border/50 px-4 md:px-6 py-6 md:py-8">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-primary-soft">
                        <Bell size={20} className="text-primary" />
                    </div>
                    <div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-primary-soft text-primary">ﬁ‰«… «·≈⁄·«„ «·„—ﬂ“Ì</span>
                    </div>
                </div>
                <div className="space-y-1">
                    <h1 className="text-xl md:text-2xl font-black text-main dark:text-inverse leading-tight">‰‘—… ≈⁄·«‰«  «·„‰’…</h1>
                    <p className="text-[11px] font-bold text-muted">«»ﬁ ⁄·Ï «ÿ·«⁄ »√ÕœÀ «· ‰»ÌÂ«  Ê«·›⁄«·Ì«  œ«Œ· «·„ƒ””…</p>
                </div>
            </div>

            <div className="space-y-3">
                <div className="relative">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-dim" size={18} />
                    <input
                        type="text"
                        placeholder="«»ÕÀ ›Ì «·√—‘Ì›..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pr-12 pl-6 py-3.5 bg-white dark:bg-primary-active border border-border/50 dark:border-border/50 rounded-xl shadow-sm text-[13px] font-bold focus:outline-none focus:border-primary transition-all placeholder:text-muted dark:text-on-primary"
                    />
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3">
                    <FilterButton
                        label="⁄—÷ «·ﬂ·"
                        active={filterType === 'all'}
                        onClick={() => setFilterType('all')}
                        icon={Grid}
                        activeColor="var(--bg-primary)"
                    />
                    <FilterButton
                        label="⁄«Ã·"
                        active={filterType === 'urgent'}
                        onClick={() => setFilterType('urgent')}
                        icon={Zap}
                        activeColor="var(--bg-error)"
                    />
                    <FilterButton
                        label="≈Ã«“…"
                        active={filterType === 'holiday'}
                        onClick={() => setFilterType('holiday')}
                        icon={Umbrella}
                        activeColor="var(--bg-warning)"
                    />
                    <FilterButton
                        label="‰‘—…"
                        active={filterType === 'general'}
                        onClick={() => setFilterType('general')}
                        icon={Calendar}
                        activeColor="var(--bg-primary)"
                    />
                </div>
            </div>

            {/* ??????????????? ANNOUNCEMENTS LIST ??????????????? */}
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
                                className="bg-white dark:bg-primary-active rounded-2xl p-5 md:p-6 shadow-sm border border-border/50 dark:border-border/50 relative overflow-hidden flex flex-col"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-2 text-muted text-[10px] font-bold">
                                        <Clock size={12} />
                                        {format(new Date(ann.date), 'dd MMM yyyy', { locale: ar })}
                                    </div>
                                    <span className="px-3 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1.5 shadow-sm" style={{ backgroundColor: config.bg, color: config.color, borderColor: config.border }}>
                                        {ann.type === 'urgent' && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                                        {config.label}
                                    </span>
                                </div>

                                <div className="space-y-2.5 mb-5 flex-1">
                                    <h3 className="text-sm md:text-lg font-bold text-main dark:text-inverse leading-tight">
                                        {ann.title}
                                    </h3>
                                    <p className="text-[11px] md:text-xs text-dim dark:text-muted font-bold leading-relaxed line-clamp-4">
                                        {ann.content}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-divider">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-primary-soft">
                                            <ShieldCheck size={14} className="text-primary" />
                                        </div>
                                        <span className="text-[9px] font-bold text-dim dark:text-muted">≈œ«—… «·√ﬂ«œÌ„Ì…</span>
                                    </div>
                                    
                                    <a 
                                        href={`https://wa.me/${(adminPhone?.replace(/\D/g, '') || '').replace(/^0/, '20') || '200000000000'}?text=${encodeURIComponent(`«” ›”«— »Œ’Ê’ ≈⁄·«‰: ${ann.title}`)}`}
                                        target="_blank" rel="noopener noreferrer"
                                        className="text-primary border border-primary px-4 py-1.5 rounded-xl text-[10px] font-bold flex items-center gap-2 transition-all hover:bg-primary-hover hover:text-on-primary active:scale-95"
                                    >
                                        <MessageCircle size={14} />
                                        «” ›”«—
                                    </a>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>

                {filteredAnnouncements.length === 0 && (
                    <div className="col-span-full py-16 flex flex-col items-center justify-center text-center bg-white dark:bg-primary-active rounded-2xl border border-dashed border-border dark:border-border p-8">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 bg-primary-soft">
                            <Bell size={22} className="text-primary" />
                        </div>
                        <h3 className="text-sm font-bold text-muted">·«  ÊÃœ  ÕœÌÀ«  ÃœÌœ…</h3>
                        <p className="text-[10px] font-bold text-muted mt-1">”Ê›  ŸÂ— «·≈⁄·«‰«  «·Â«„… Â‰«</p>
                    </div>
                )}
            </div>

        </div>
    );
};

const FilterButton = ({ label, active, onClick, icon: Icon, activeColor }: { label: string; active: boolean; onClick: () => void; icon: React.ComponentType<{ size?: number }>; activeColor: string }) => (
    <button
        onClick={onClick}
        className={cn(
            "flex items-center justify-between px-4 py-3.5 rounded-xl text-[10px] md:text-xs font-bold transition-all border shadow-sm active:scale-95",
            active 
                ? "text-on-primary border-transparent" 
                : "bg-white dark:bg-primary-active text-muted dark:text-muted border-border/50 dark:border-border/50 hover:bg-surface dark:hover:bg-primary-active"
        )}
        style={active ? { backgroundColor: activeColor, borderColor: activeColor } : {}}
    >
        <span>{label}</span>
        <Icon size={14} className={active ? "opacity-100" : "opacity-40"} />
    </button>
);
