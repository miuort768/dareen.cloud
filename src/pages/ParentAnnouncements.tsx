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
        <div className="space-y-10 pb-32" dir="rtl">
            
            {/* Cyber Header Section */}
            <div className="relative bg-gray-950 p-8 lg:p-12 border-8 border-gray-950 shadow-[10px_10px_0px_0px_#ef4444] overflow-hidden">
                <div className="absolute top-0 right-0 w-full h-full opacity-5 pointer-events-none" 
                     style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                
                <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
                    <div className="flex items-center gap-8">
                        <div className="relative">
                            <motion.div 
                                animate={{ rotate: [0, 5, -5, 0] }}
                                transition={{ repeat: Infinity, duration: 4 }}
                                className="w-20 h-20 bg-primary-600 text-white border-4 border-gray-950 shadow-[6px_6px_0px_0px_white] flex items-center justify-center transform -rotate-3"
                            >
                                <Megaphone size={40} strokeWidth={3} />
                            </motion.div>
                            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-rose-500 border-4 border-gray-950 animate-ping" />
                        </div>
                        
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="px-3 py-1 bg-white text-gray-950 text-[10px] font-black uppercase tracking-widest italic border-2 border-gray-950">قناة الاتصال المباشر</span>
                                <div className="flex gap-1">
                                    <div className="w-2 h-2 bg-rose-500 animate-pulse" />
                                    <div className="w-2 h-2 bg-primary-500 animate-pulse" style={{ animationDelay: '0.2s' }} />
                                </div>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase italic leading-none mb-4">لوحة إعلانات المعهد</h1>
                            <p className="text-gray-400 text-xs font-black flex items-center gap-3 uppercase tracking-[4px]">
                                <ShieldCheck size={16} className="text-primary-500" />
                                آخر التحديثات والقرارات الاستراتيجية
                            </p>
                        </div>
                    </div>

                    <div className="w-full lg:w-auto space-y-4">
                        <div className="relative group">
                            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-white transition-colors" size={20} />
                            <input
                                type="text"
                                placeholder="ابحث في سجل البيانات..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full lg:w-96 pr-12 pl-4 py-4 bg-white/5 border-4 border-white/10 text-white font-black text-xs uppercase tracking-widest focus:bg-white/10 focus:border-primary-500 focus:outline-none transition-all placeholder:text-gray-600"
                            />
                        </div>
                        <div className="flex gap-2">
                            {['all', 'urgent', 'holiday', 'event'].map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setFilterType(type)}
                                    className={cn(
                                        "px-4 py-2 text-[9px] font-black uppercase tracking-widest border-2 transition-all",
                                        filterType === type 
                                            ? "bg-primary-600 border-primary-600 text-white shadow-[4px_4px_0px_0px_white]" 
                                            : "bg-white/5 border-white/10 text-gray-400 hover:border-white/30"
                                    )}
                                >
                                    {type === 'all' ? 'عرض الكل' : type === 'urgent' ? 'عاجل' : type === 'holiday' ? 'إجازة' : 'فعالية'}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Announcements Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <AnimatePresence mode="popLayout">
                    {filteredAnnouncements.map((ann, idx) => {
                        const config = getTypeConfig(ann.type);
                        return (
                            <motion.div
                                layout
                                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.4, delay: idx * 0.05 }}
                                key={ann.id}
                                className={cn(
                                    "group bg-white border-8 border-gray-950 flex flex-col relative overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:-translate-x-2 hover:shadow-[15px_15px_0px_0px_black]",
                                    config.shadow
                                )}
                            >
                                {/* Pattern Background for cards */}
                                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                                     style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '15px 15px' }} />
                                
                                <div className={cn("absolute top-0 right-0 w-full h-1 bg-gradient-to-l", ann.type === 'urgent' ? 'from-rose-500' : 'from-primary-600')} />

                                <div className="p-8 flex-1 relative z-10">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className={cn("px-4 py-1.5 flex items-center gap-3 border-2 border-gray-950 text-[10px] font-black uppercase tracking-[0.2em] italic", config.bg, config.color)}>
                                            <config.icon size={14} strokeWidth={3} />
                                            {config.label}
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] text-gray-400 font-black uppercase tracking-widest bg-gray-50 px-3 py-1.5 border border-gray-200">
                                            <Clock size={14} strokeWidth={3} />
                                            {format(new Date(ann.date), 'dd MMM yyyy', { locale: ar })}
                                        </div>
                                    </div>

                                    <h3 className="text-2xl font-black text-gray-950 mb-4 group-hover:text-primary-600 transition-colors leading-tight italic tracking-tighter">
                                        {ann.title}
                                    </h3>
                                    <div className="relative">
                                        <div className="absolute top-0 right-0 w-1 h-full bg-gray-100 -mr-4" />
                                        <p className="text-sm text-gray-600 font-bold leading-relaxed whitespace-pre-wrap pl-2">
                                            {ann.content}
                                        </p>
                                    </div>
                                </div>

                                <div className="px-8 py-5 bg-gray-950 border-t-8 border-gray-950 flex items-center justify-between group-hover:bg-primary-600 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-white/20 flex items-center justify-center text-white rotate-3">
                                            <ShieldCheck size={16} />
                                        </div>
                                        <span className="text-[10px] text-white font-black uppercase tracking-[3px] italic">إدارة الأكاديمية</span>
                                    </div>
                                    <motion.div 
                                        whileHover={{ x: -10 }}
                                        className="w-10 h-10 bg-white text-gray-950 flex items-center justify-center shadow-[4px_4px_0px_0px_#ef4444]"
                                    >
                                        <ChevronLeft size={20} strokeWidth={4} />
                                    </motion.div>
                                </div>

                                {ann.type === 'urgent' && (
                                    <div className="absolute top-2 -left-8 bg-rose-600 text-white px-10 py-1 -rotate-45 text-[8px] font-black uppercase tracking-widest shadow-xl">
                                        URGENT
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </AnimatePresence>

                {filteredAnnouncements.length === 0 && (
                    <div className="col-span-full py-40 flex flex-col items-center justify-center text-center space-y-8 bg-gray-50 border-8 border-dashed border-gray-200">
                        <div className="relative">
                            <div className="w-32 h-32 bg-white shadow-[10px_10px_0px_0px_#cbd5e1] border-4 border-gray-950 flex items-center justify-center text-gray-200 transform rotate-6">
                                <Bell size={64} strokeWidth={1} />
                            </div>
                            <div className="absolute -top-4 -right-4 w-12 h-12 bg-white border-2 border-slate-200 flex items-center justify-center -rotate-12">
                                <Search size={24} className="text-slate-200" />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-3xl font-black text-gray-300 uppercase italic tracking-tighter">قنوات البث صامتة حالياً</h3>
                            <p className="text-[11px] text-gray-400 font-black mt-4 uppercase tracking-[5px]">Data stream is empty • Check back later</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Tactical Footer Note */}
            <div className="mt-20 border-t-4 border-gray-950 pt-10 grid grid-cols-1 md:grid-cols-3 gap-10">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-gray-950 text-white flex items-center justify-center shrink-0">
                        <Zap size={24} />
                    </div>
                    <div>
                        <h5 className="font-black text-xs uppercase italic tracking-widest">تحديث فوري</h5>
                        <p className="text-[10px] text-gray-500 font-bold mt-1">يتم تحديث الإعلانات لحظياً فور صدورها من الإدارة.</p>
                    </div>
                </div>
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-gray-950 text-white flex items-center justify-center shrink-0">
                        <MapPin size={24} />
                    </div>
                    <div>
                        <h5 className="font-black text-xs uppercase italic tracking-widest">مركز المتابعة</h5>
                        <p className="text-[10px] text-gray-500 font-bold mt-1">المصدر الرسمي والوحيد لكافة تعميمات المعهد.</p>
                    </div>
                </div>
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-gray-950 text-white flex items-center justify-center shrink-0">
                        <Users size={24} />
                    </div>
                    <div>
                        <h5 className="font-black text-xs uppercase italic tracking-widest">مجتمع دارين</h5>
                        <p className="text-[10px] text-gray-500 font-bold mt-1">انضم إلى مجتمعنا التعليمي المتكامل والذكي.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
