import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Megaphone,
    Bell,
    AlertTriangle,
    Info,
    Calendar,
    Search,
    ChevronLeft,
    Clock,
    Volume2,
    ShieldCheck,
    Zap,
    MapPin,
    Users
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
        .sort((a, b) => {
            if (a.type === 'urgent' && b.type !== 'urgent') return -1;
            if (a.type !== 'urgent' && b.type === 'urgent') return 1;
            return new Date(b.date).getTime() - new Date(a.date).getTime();
        });

    const getTypeConfig = (type: string) => {
        switch (type) {
            case 'urgent': return { 
                icon: AlertTriangle, 
                color: 'text-rose-600', 
                border: 'border-rose-500', 
                bg: 'bg-rose-50', 
                label: 'تنبيه عاجل (URGENT)',
                shadow: 'shadow-[6px_6px_0px_0px_#ef4444]',
                gradient: 'from-rose-500/10 to-transparent'
            };
            case 'holiday': return { 
                icon: Calendar, 
                color: 'text-amber-600', 
                border: 'border-amber-500', 
                bg: 'bg-amber-50', 
                label: 'إجازة رسمية (HOLIDAY)',
                shadow: 'shadow-[6px_6px_0px_0px_#f59e0b]',
                gradient: 'from-amber-500/10 to-transparent'
            };
            case 'event': return { 
                icon: Volume2, 
                color: 'text-indigo-600', 
                border: 'border-indigo-500', 
                bg: 'bg-indigo-50', 
                label: 'فعالية المعهد (EVENT)',
                shadow: 'shadow-[6px_6px_0px_0px_#6366f1]',
                gradient: 'from-indigo-500/10 to-transparent'
            };
            default: return { 
                icon: Info, 
                color: 'text-emerald-600', 
                border: 'border-emerald-500', 
                bg: 'bg-emerald-50', 
                label: 'إعلان عام (GENERAL)',
                shadow: 'shadow-[6px_6px_0px_0px_#10b981]',
                gradient: 'from-emerald-500/10 to-transparent'
            };
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="h-48 bg-gray-100 dark:bg-gray-800 animate-pulse border-8 border-gray-950" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[...Array(4)].map((_, i) => <div key={i} className="h-64 bg-gray-100 dark:bg-gray-800 animate-pulse border-4 border-gray-950" />)}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-32" dir="rtl">
            
            {/* ═══════════════ PREMIUM ANNOUNCEMENTS HEADER ═══════════════ */}
            <div className="relative overflow-hidden rounded-none bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6 lg:p-10 shadow-2xl shadow-indigo-500/10 border-l border-t border-white/10">
                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none" 
                    style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary-500/10 rounded-full blur-[80px]" />
                
                <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-5 md:gap-6">
                        <div className="relative shrink-0">
                            <motion.div 
                                animate={{ rotate: [0, 5, -5, 0] }}
                                transition={{ repeat: Infinity, duration: 4 }}
                                className="w-16 h-16 bg-gradient-to-br from-primary-500 to-indigo-600 p-0.5 shadow-lg shadow-primary-500/20"
                            >
                                <div className="w-full h-full bg-slate-900/40 backdrop-blur-md flex items-center justify-center border border-white/20">
                                    <Megaphone size={24} className="text-white" strokeWidth={1.5} />
                                </div>
                            </motion.div>
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-slate-900 animate-pulse" />
                        </div>
                        
                        <div>
                            <div className="flex items-center gap-2 mb-1.5">
                                <span className="px-2 py-0.5 bg-white/10 backdrop-blur-md text-white text-[8px] font-bold uppercase tracking-widest rounded-none border border-white/10 italic">قناة الإعلام المركزي</span>
                                <div className="flex gap-1">
                                    {[1,2,3].map(i => <div key={i} className="w-1 h-1 bg-emerald-500 animate-pulse" style={{ animationDelay: `${i*0.2}s` }} />)}
                                </div>
                            </div>
                            <h1 className="text-xl md:text-3xl font-black text-white leading-tight uppercase italic tracking-tight">نشرة إعلانات المنصة</h1>
                            <p className="text-slate-400 text-[10px] md:text-xs font-medium flex items-center gap-2 mt-0.5">
                                <ShieldCheck size={14} className="text-primary-400" /> آخر القرارات والتحديثات الإستراتيجية
                            </p>
                        </div>
                    </div>

                    <div className="w-full lg:w-auto space-y-4">
                        <div className="relative group">
                            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-white transition-colors" size={16} />
                            <input
                                type="text"
                                placeholder="ابحث في الأرشيف..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full lg:w-80 pr-10 pl-4 py-3 bg-white/5 backdrop-blur-xl border border-white/10 text-white font-black text-[10px] uppercase tracking-widest focus:bg-white/10 focus:border-white/20 focus:outline-none transition-all placeholder:text-slate-600 rounded-none shadow-inner"
                            />
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {['all', 'urgent', 'holiday', 'event'].map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setFilterType(type)}
                                    className={cn(
                                        "px-3 py-1.5 text-[8px] font-black uppercase tracking-widest border transition-all rounded-none italic shadow-sm",
                                        filterType === type 
                                            ? "bg-primary-600 border-primary-500 text-white shadow-lg shadow-primary-500/20" 
                                            : "bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10"
                                    )}
                                >
                                    {type === 'all' ? 'عرض الكل' : type === 'urgent' ? 'عاجل' : type === 'holiday' ? 'إجازة' : 'فعالية'}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══════════════ ANNOUNCEMENTS GRID ═══════════════ */}
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
                                className={cn(
                                    "group p-0 rounded-none bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-lg overflow-hidden relative transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary-500/10"
                                )}
                            >
                                {/* Category Header */}
                                <div className={cn("px-5 py-2.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50")}>
                                    <div className={cn("flex items-center gap-2 text-[9px] font-black uppercase tracking-widest italic", config.color)}>
                                        <config.icon size={12} />
                                        {config.label}
                                    </div>
                                    <div className="flex items-center gap-2 text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                                        <Clock size={11} />
                                        {format(new Date(ann.date), 'dd MMM yyyy', { locale: ar })}
                                    </div>
                                </div>

                                <div className="p-6 md:p-8 flex-1 relative">
                                    <div className={cn("absolute top-0 right-0 w-1 h-10 bg-gradient-to-b", ann.type === 'urgent' ? 'from-rose-500' : 'from-primary-600')} />
                                    
                                    <h3 className="text-lg md:text-xl font-black text-slate-900 dark:text-white mb-3 leading-tight italic tracking-tight group-hover:text-primary-600 transition-colors">
                                        {ann.title}
                                    </h3>
                                    <div className="relative pl-4 border-r-2 border-slate-50 dark:border-slate-800 pr-3">
                                        <p className="text-xs md:text-[13px] text-slate-600 dark:text-slate-400 font-medium leading-relaxed whitespace-pre-wrap">
                                            {ann.content}
                                        </p>
                                    </div>
                                </div>

                                <div className="px-6 md:px-8 py-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between group-hover:bg-slate-50 dark:group-hover:bg-slate-800/30 transition-all">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-7 h-7 bg-primary-600/10 text-primary-600 flex items-center justify-center">
                                            <ShieldCheck size={14} />
                                        </div>
                                        <span className="text-[9px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest italic leading-none">إدارة الأكاديمية</span>
                                    </div>
                                    <motion.div 
                                        whileHover={{ x: -3 }}
                                        className="text-primary-600 dark:text-primary-400 uppercase text-[8px] font-black flex items-center gap-1 cursor-pointer"
                                    >
                                        فتح الإعلان <ChevronLeft size={12} />
                                    </motion.div>
                                </div>

                                {ann.type === 'urgent' && (
                                    <div className="absolute top-2 -left-10 bg-rose-600 text-white px-10 py-0.5 -rotate-45 text-[7px] font-black uppercase tracking-widest shadow-xl">
                                        عاجل
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </AnimatePresence>

                {filteredAnnouncements.length === 0 && (
                    <div className="col-span-full py-24 flex flex-col items-center justify-center text-center space-y-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8">
                        <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 text-slate-200 dark:text-slate-700 flex items-center justify-center">
                            <Bell size={40} strokeWidth={1} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-slate-200 uppercase italic tracking-tight">قنوات البث هادئة</h3>
                            <p className="text-[10px] text-slate-500 font-medium mt-1 uppercase tracking-widest leading-none italic">لا توجد تحديثات جديدة حالياً</p>
                        </div>
                    </div>
                )}
            </div>

            {/* ═══════════════ OPERATIONAL FOOTER ═══════════════ */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-4 p-3.5 bg-white/5 border border-slate-100 dark:border-slate-800">
                    <div className="w-10 h-10 bg-white/5 flex items-center justify-center text-slate-900 dark:text-white shrink-0">
                        <Zap size={18} className="text-primary-500" />
                    </div>
                    <div>
                        <h5 className="font-black text-[9px] uppercase italic tracking-widest text-slate-900 dark:text-white mb-0.5 leading-none">تحديث فوري</h5>
                        <p className="text-[8px] text-slate-500 font-bold leading-tight">تنبيهات فورية عند الاعتماد.</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 p-3.5 bg-white/5 border border-slate-100 dark:border-slate-800">
                    <div className="w-10 h-10 bg-white/5 flex items-center justify-center text-slate-900 dark:text-white shrink-0">
                        <MapPin size={18} className="text-primary-500" />
                    </div>
                    <div>
                        <h5 className="font-black text-[9px] uppercase italic tracking-widest text-slate-900 dark:text-white mb-0.5 leading-none">مركز المتابعة</h5>
                        <p className="text-[8px] text-slate-500 font-bold leading-tight">القناة الرسمية الوحيدة للتعميمات.</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 p-3.5 bg-white/5 border border-slate-100 dark:border-slate-800">
                    <div className="w-10 h-10 bg-white/5 flex items-center justify-center text-slate-900 dark:text-white shrink-0">
                        <Users size={18} className="text-primary-500" />
                    </div>
                    <div>
                        <h5 className="font-black text-[9px] uppercase italic tracking-widest text-slate-900 dark:text-white mb-0.5 leading-none">مجتمع ذكي</h5>
                        <p className="text-[8px] text-slate-500 font-bold leading-tight">وصول دقيق لكافة المعلومات.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
