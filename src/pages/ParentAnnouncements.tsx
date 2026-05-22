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

    const getTypeConfig = (type: string) => {
        switch (type) {
            case 'urgent': return { 
                icon: AlertTriangle, 
                color: 'text-rose-600', 
                bg: 'bg-rose-50', 
                label: 'عاجل',
                tagClass: 'bg-red-700 text-white'
            };
            case 'holiday': return { 
                icon: Umbrella, 
                color: 'text-pink-600', 
                bg: 'bg-pink-50', 
                label: 'إجازة',
                tagClass: 'bg-pink-100 text-pink-600'
            };
            case 'event': return { 
                icon: Grid, 
                color: 'text-indigo-600', 
                bg: 'bg-indigo-50', 
                label: 'فعالية',
                tagClass: 'bg-indigo-100 text-indigo-600'
            };
            default: return { 
                icon: Bell, 
                color: 'text-slate-600', 
                bg: 'bg-slate-50', 
                label: 'نشرة',
                tagClass: 'bg-slate-100 text-slate-600'
            };
        }
    };

    if (isLoading) {
        return <PageLoader />;
    }

    return (
        <div className="min-h-full bg-[#f8faff] dark:bg-slate-950 pb-32 px-2 lg:px-8 pt-6 space-y-6 md:animate-in md:fade-in md:duration-500" dir="rtl">

            {/* ═══════════════ HERO BANNER ═══════════════ */}
            <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative overflow-hidden bg-indigo-600 dark:bg-indigo-700 rounded-none md:rounded-lg p-8 md:p-14 text-white text-center shadow-[0_0_20px_rgba(79,70,229,0.3)] dark:shadow-[0_0_30px_rgba(79,70,229,0.2)] border border-indigo-400/20"
            >
                <div className="absolute top-4 right-4 md:top-6 md:right-8">
                    <span className="px-3 py-1 bg-white/10  rounded-md text-[8px] md:text-[10px] font-medium uppercase tracking-widest border border-white/10">قناة الإعلام المركزي</span>
                </div>
                
                <div className="relative z-10 space-y-2 mt-4 md:mt-0">
                    <h1 className="text-xl md:text-5xl font-medium italic tracking-tighter leading-none">نشرة إعلانات المنصة</h1>
                    <p className="text-indigo-100/70 text-[8px] md:text-sm font-normal max-w-lg mx-auto leading-relaxed">ابق على اطلاع بأحدث التنبيهات والفعاليات داخل المؤسسة</p>
                </div>

                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-50" />
            </motion.div>

            {/* ═══════════════ SEARCH & FILTERS ═══════════════ */}
            <div className="space-y-3">
                <div className="relative group">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="ابحث في الأرشيف..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pr-12 pl-6 py-3.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg shadow-sm text-[13px] font-normal focus:outline-none focus:ring-1 focus:ring-indigo-500/20 transition-all placeholder:text-slate-400 dark:text-white"
                    />
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3">
                    <FilterButton 
                        label="عرض الكل" 
                        active={filterType === 'all'} 
                        onClick={() => setFilterType('all')} 
                        icon={Grid}
                        activeClass="bg-indigo-600 text-white"
                    />
                    <FilterButton 
                        label="عاجل" 
                        active={filterType === 'urgent'} 
                        onClick={() => setFilterType('urgent')} 
                        icon={Zap}
                        activeClass="bg-slate-900 dark:bg-slate-800 text-white border-slate-700"
                    />
                    <FilterButton 
                        label="إجازة" 
                        active={filterType === 'holiday'} 
                        onClick={() => setFilterType('holiday')} 
                        icon={Umbrella}
                        activeClass="bg-rose-50 dark:bg-rose-950/20 text-rose-600 border-rose-100 dark:border-rose-900/30"
                    />
                    <FilterButton 
                        label="نشرة" 
                        active={filterType === 'general'} 
                        onClick={() => setFilterType('general')} 
                        icon={Calendar}
                        activeClass="bg-indigo-50 dark:bg-indigo-900/10 text-indigo-600 border-indigo-100 dark:border-indigo-900/30"
                    />
                </div>
            </div>

            {/* ═══════════════ ANNOUNCEMENTS LIST ═══════════════ */}
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
                                className="bg-white dark:bg-slate-900 rounded-lg p-5 md:p-6 shadow-sm border border-slate-50 dark:border-slate-800 relative group overflow-hidden flex flex-col"
                            >
                                {/* Header Info */}
                                <div className="flex justify-between items-start mb-5">
                                    <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 text-[9px] font-normal">
                                        <Clock size={12} />
                                        {format(new Date(ann.date), 'dd MMM yyyy', { locale: ar })}
                                    </div>
                                    <span className={cn("px-3 py-1 rounded-md text-[9px] font-medium flex items-center gap-1.5 shadow-sm", config.tagClass)}>
                                        {ann.type === 'urgent' && <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />}
                                        {config.label}
                                    </span>
                                </div>

                                {/* Content */}
                                <div className="space-y-2.5 mb-6 px-1 flex-1">
                                    <h3 className="text-md md:text-xl font-medium text-slate-900 dark:text-white leading-tight italic tracking-tight">
                                        {ann.title}
                                    </h3>
                                    <p className="text-[12px] md:text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed line-clamp-4">
                                        {ann.content}
                                    </p>
                                </div>

                                {/* Footer (Updated to WhatsApp Inquiry) */}
                                <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800 px-1">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100/50 dark:border-indigo-900/30">
                                            <ShieldCheck size={14} />
                                        </div>
                                        <span className="text-[9px] text-slate-500 dark:text-slate-400 font-medium italic">إدارة الأكاديمية</span>
                                    </div>
                                    
                                    <a 
                                        href={`https://wa.me/${adminPhone?.replace(/\D/g, '').replace(/^0/, '20')}?text=${encodeURIComponent(`استفسار بخصوص إعلان: ${ann.title}`)}`}
                                        target="_blank" rel="noopener noreferrer"
                                        className="bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50 px-4 py-1.5 rounded-lg text-[10px] font-medium flex items-center gap-2 transition-all hover:bg-indigo-600 hover:text-white hover:border-indigo-600"
                                    >
                                        <MessageCircle size={14} />
                                        استفسار
                                    </a>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>

                {filteredAnnouncements.length === 0 && (
                    <div className="col-span-full py-16 flex flex-col items-center justify-center text-center bg-white dark:bg-slate-900 rounded-lg border-2 border-dashed border-slate-100 dark:border-slate-800 p-8">
                        <Bell className="text-slate-200 dark:text-slate-700 mb-3" size={40} strokeWidth={1} />
                        <h3 className="text-md font-medium dark:text-white italic">لا توجد تحديثات جديدة</h3>
                        <p className="text-[10px] text-slate-400 font-normal mt-1">سوف تظهر الإعلانات الهامة هنا</p>
                    </div>
                )}
            </div>

        </div>
    );
};

const FilterButton = ({ label, active, onClick, icon: Icon, activeClass }: { label: string; active: boolean; onClick: () => void; icon: React.ComponentType<{ size?: number }>; activeClass: string }) => (
    <button
        onClick={onClick}
        className={cn(
            "flex items-center justify-between px-4 py-3.5 rounded-lg text-[10px] md:text-xs font-medium transition-all border border-transparent shadow-sm",
            active 
                ? activeClass 
                : "bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
        )}
    >
        <span className="italic">{label}</span>
        <Icon size={14} className={active ? "opacity-100" : "opacity-40"} />
    </button>
);
