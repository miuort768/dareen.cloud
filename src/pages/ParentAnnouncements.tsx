import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bell,
    AlertTriangle,
    Calendar,
    Search,
    ChevronLeft,
    Clock,
    ShieldCheck,
    Grid,
    Zap,
    Umbrella
} from 'lucide-react';
import { api } from '../lib/api';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface Announcement {
    id: string;
    title: string;
    content: string;
    type: 'general' | 'urgent' | 'holiday' | 'event';
    date: string;
    isActive: boolean;
}

export const ParentAnnouncements = () => {
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
        return (
            <div className="min-h-screen bg-[#f8faff] flex flex-col items-center justify-center p-4">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-slate-500 font-bold">جاري تحميل النشرة...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8faff] dark:bg-slate-950 pb-32 px-4 lg:px-8 pt-6 space-y-6" dir="rtl">

            {/* ═══════════════ HERO BANNER (As per image) ═══════════════ */}
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative overflow-hidden bg-indigo-600 rounded-[2.5rem] p-10 md:p-14 text-white text-center shadow-xl shadow-indigo-500/20"
            >
                <div className="absolute top-6 right-8">
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-lg text-[10px] font-black uppercase tracking-widest">قناة الإعلام المركزي</span>
                </div>
                
                <div className="relative z-10 space-y-3">
                    <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter">نشرة إعلانات المنصة</h1>
                    <p className="text-indigo-100/80 text-xs md:text-sm font-bold max-w-lg mx-auto leading-relaxed">ابق على اطلاع بأحدث التنبيهات والفعاليات داخل المؤسسة</p>
                </div>

                {/* Decorative circles */}
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-400/20 rounded-full blur-3xl" />
            </motion.div>

            {/* ═══════════════ SEARCH & FILTERS ═══════════════ */}
            <div className="space-y-4">
                <div className="relative group">
                    <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="ابحث في الأرشيف..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pr-14 pl-6 py-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-slate-400 dark:text-white"
                    />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
                        activeClass="bg-slate-900 text-white"
                    />
                    <FilterButton 
                        label="إجازة" 
                        active={filterType === 'holiday'} 
                        onClick={() => setFilterType('holiday')} 
                        icon={Umbrella}
                        activeClass="bg-rose-50 text-rose-600 border-rose-100"
                    />
                    <FilterButton 
                        label="نشرة" 
                        active={filterType === 'general'} 
                        onClick={() => setFilterType('general')} 
                        icon={Calendar}
                        activeClass="bg-indigo-50 text-indigo-600 border-indigo-100"
                    />
                </div>
            </div>

            {/* ═══════════════ ANNOUNCEMENTS LIST ═══════════════ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-sm border border-slate-50 dark:border-slate-800 relative group overflow-hidden"
                            >
                                {/* Header Info */}
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold">
                                        <Clock size={14} />
                                        {format(new Date(ann.date), 'dd MMM yyyy', { locale: ar })}
                                    </div>
                                    <span className={cn("px-4 py-1.5 rounded-xl text-[10px] font-black flex items-center gap-1.5", config.tagClass)}>
                                        {ann.type === 'urgent' && <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />}
                                        {config.label}
                                    </span>
                                </div>

                                {/* Content */}
                                <div className="space-y-3 mb-8 px-2">
                                    <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight">
                                        {ann.title}
                                    </h3>
                                    <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed line-clamp-3">
                                        {ann.content}
                                    </p>
                                </div>

                                {/* Footer */}
                                <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800 px-2">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 flex items-center justify-center border border-indigo-100/50">
                                            <ShieldCheck size={16} />
                                        </div>
                                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-black italic">إدارة الأكاديمية</span>
                                    </div>
                                    
                                    <motion.button 
                                        whileHover={{ x: -2 }}
                                        className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 px-4 py-2 rounded-xl text-[10px] font-black flex items-center gap-2 transition-colors hover:bg-indigo-600 hover:text-white"
                                    >
                                        فتح الإعلان <ChevronLeft size={14} />
                                    </motion.button>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>

                {filteredAnnouncements.length === 0 && (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center text-center bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-dashed border-slate-100 dark:border-slate-800 p-8">
                        <Bell className="text-slate-200 mb-4" size={50} strokeWidth={1} />
                        <h3 className="text-lg font-black text-slate-900 dark:text-white italic">لا توجد تحديثات جديدة</h3>
                        <p className="text-xs text-slate-400 font-bold mt-1">سوف تظهر الإعلانات الهامة هنا</p>
                    </div>
                )}
            </div>

        </div>
    );
};

const FilterButton = ({ label, active, onClick, icon: Icon, activeClass }: any) => (
    <button
        onClick={onClick}
        className={cn(
            "flex items-center justify-between px-5 py-4 rounded-2xl text-xs font-black transition-all border border-transparent shadow-sm",
            active 
                ? activeClass 
                : "bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
        )}
    >
        <span className="italic">{label}</span>
        <Icon size={16} className={active ? "opacity-100" : "opacity-40"} />
    </button>
);
