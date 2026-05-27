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
                color: '#F43F5E', 
                label: 'عاجل'
            };
            case 'holiday': return { 
                icon: Umbrella, 
                color: '#F59E0B', 
                label: 'إجازة'
            };
            case 'event': return { 
                icon: Grid, 
                color: '#8B5CF6', 
                label: 'فعالية'
            };
            default: return { 
                icon: Bell, 
                color: '#64748B', 
                label: 'نشرة'
            };
        }
    };

    if (isLoading) {
        return <PageLoader />;
    }

    return (
        <div className="min-h-full pb-32 px-2 lg:px-8 pt-6 space-y-6" dir="rtl">

            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100/50 dark:border-slate-800/50 px-4 md:px-6 py-6 md:py-8">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#8B5CF612' }}>
                        <Bell size={20} style={{ color: '#8B5CF6' }} />
                    </div>
                    <div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg" style={{ backgroundColor: '#8B5CF612', color: '#8B5CF6' }}>قناة الإعلام المركزي</span>
                    </div>
                </div>
                <div className="space-y-1">
                    <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white leading-tight">نشرة إعلانات المنصة</h1>
                    <p className="text-[11px] font-bold text-slate-400">ابق على اطلاع بأحدث التنبيهات والفعاليات داخل المؤسسة</p>
                </div>
            </div>

            <div className="space-y-3">
                <div className="relative">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2" size={18} style={{ color: '#94A3B8' }} />
                    <input
                        type="text"
                        placeholder="ابحث في الأرشيف..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pr-12 pl-6 py-3.5 bg-white dark:bg-slate-900 border border-slate-100/50 dark:border-slate-800/50 rounded-xl shadow-sm text-[13px] font-bold focus:outline-none focus:border-[#8B5CF6] transition-all placeholder:text-slate-400 dark:text-white"
                    />
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3">
                    <FilterButton
                        label="عرض الكل"
                        active={filterType === 'all'}
                        onClick={() => setFilterType('all')}
                        icon={Grid}
                        activeColor="#8B5CF6"
                    />
                    <FilterButton
                        label="عاجل"
                        active={filterType === 'urgent'}
                        onClick={() => setFilterType('urgent')}
                        icon={Zap}
                        activeColor="#F43F5E"
                    />
                    <FilterButton
                        label="إجازة"
                        active={filterType === 'holiday'}
                        onClick={() => setFilterType('holiday')}
                        icon={Umbrella}
                        activeColor="#F59E0B"
                    />
                    <FilterButton
                        label="نشرة"
                        active={filterType === 'general'}
                        onClick={() => setFilterType('general')}
                        icon={Calendar}
                        activeColor="#8B5CF6"
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
                                className="bg-white dark:bg-slate-900 rounded-2xl p-5 md:p-6 shadow-sm border border-slate-100/50 dark:border-slate-800/50 relative overflow-hidden flex flex-col"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold">
                                        <Clock size={12} />
                                        {format(new Date(ann.date), 'dd MMM yyyy', { locale: ar })}
                                    </div>
                                    <span className="px-3 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1.5 shadow-sm" style={{ backgroundColor: `${config.color}12`, color: config.color, border: `1px solid ${config.color}20` }}>
                                        {ann.type === 'urgent' && <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: '#FFFFFF' }} />}
                                        {config.label}
                                    </span>
                                </div>

                                <div className="space-y-2.5 mb-5 flex-1">
                                    <h3 className="text-sm md:text-lg font-bold text-slate-900 dark:text-white leading-tight">
                                        {ann.title}
                                    </h3>
                                    <p className="text-[11px] md:text-xs text-slate-500 dark:text-slate-400 font-bold leading-relaxed line-clamp-4">
                                        {ann.content}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-slate-100/50 dark:border-slate-800/50">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#8B5CF612' }}>
                                            <ShieldCheck size={14} style={{ color: '#8B5CF6' }} />
                                        </div>
                                        <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400">إدارة الأكاديمية</span>
                                    </div>
                                    
                                    <a 
                                        href={`https://wa.me/${adminPhone?.replace(/\D/g, '').replace(/^0/, '20')}?text=${encodeURIComponent(`استفسار بخصوص إعلان: ${ann.title}`)}`}
                                        target="_blank" rel="noopener noreferrer"
                                        className="text-[#8B5CF6] border border-[#8B5CF620] px-4 py-1.5 rounded-xl text-[10px] font-bold flex items-center gap-2 transition-all hover:bg-[#8B5CF6] hover:text-white active:scale-95"
                                        style={{ backgroundColor: '#8B5CF608' }}
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
                    <div className="col-span-full py-16 flex flex-col items-center justify-center text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 p-8">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: '#8B5CF612' }}>
                            <Bell size={22} style={{ color: '#8B5CF6' }} />
                        </div>
                        <h3 className="text-sm font-bold text-slate-400">لا توجد تحديثات جديدة</h3>
                        <p className="text-[10px] font-bold text-slate-400 mt-1">سوف تظهر الإعلانات الهامة هنا</p>
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
                ? "text-white border-transparent" 
                : "bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-100/50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800"
        )}
        style={active ? { backgroundColor: activeColor, borderColor: activeColor } : {}}
    >
        <span>{label}</span>
        <Icon size={14} className={active ? "opacity-100" : "opacity-40"} />
    </button>
);
