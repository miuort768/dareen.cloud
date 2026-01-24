import { useState, useEffect } from 'react';
import {
    Megaphone,
    Bell,
    AlertTriangle,
    Info,
    Calendar,
    Search,
    ChevronLeft,
    Clock,
    Volume2
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
                // Fetching only active announcements for parents
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
            // Priority sort: urgent first, then by date
            if (a.type === 'urgent' && b.type !== 'urgent') return -1;
            if (a.type !== 'urgent' && b.type === 'urgent') return 1;
            return new Date(b.date).getTime() - new Date(a.date).getTime();
        });

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="h-48 bg-gray-100 dark:bg-gray-800 animate-pulse"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[...Array(2)].map((_, i) => <div key={i} className="h-64 bg-gray-100 dark:bg-gray-800 animate-pulse"></div>)}
                </div>
            </div>
        );
    }

    const getTypeConfig = (type: string) => {
        switch (type) {
            case 'urgent': return { icon: AlertTriangle, color: 'text-rose-600', border: 'border-rose-500', bg: 'bg-rose-50/50', label: 'تنبيه عاجل' };
            case 'holiday': return { icon: Calendar, color: 'text-amber-600', border: 'border-amber-500', bg: 'bg-amber-50/50', label: 'إجازة رسمية' };
            case 'event': return { icon: Volume2, color: 'text-indigo-600', border: 'border-indigo-500', bg: 'bg-indigo-50/50', label: 'فعالية المعهد' };
            default: return { icon: Info, color: 'text-blue-600', border: 'border-blue-500', bg: 'bg-blue-50/50', label: 'إعلان عام' };
        }
    };

    return (
        <div className="space-y-8 pb-32 animate-in fade-in duration-700" dir="rtl">
            {/* Header Section */}
            <div className="relative overflow-hidden bg-gray-900 p-4 md:p-8 text-white">
                <div className="absolute top-0 left-0 w-64 h-64 bg-primary-600/10 blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-white/10 flex items-center justify-center border border-white/20">
                            <Megaphone size={32} className="text-primary-400" />
                        </div>
                        <div>
                            <h1 className="text-lg md:text-2xl font-black tracking-tight whitespace-nowrap text-white">لوحة إعلانات المعهد</h1>
                            <p className="text-xs md:text-sm text-gray-400 font-bold mt-1 max-w-[250px] md:max-w-full truncate">تابع آخر أخبار وقرارات المعهد.</p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative group w-full sm:w-64">
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary-400 transition-colors" size={16} />
                            <input
                                type="text"
                                placeholder="بحث في الإعلانات..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pr-10 pl-4 py-2.5 bg-white/5 border border-white/10 focus:bg-white/10 focus:border-primary-500 focus:outline-none font-bold transition-all text-xs"
                            />
                        </div>
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="bg-white/5 border border-white/10 px-4 py-2.5 font-black text-[10px] uppercase tracking-widest focus:outline-none focus:border-primary-500 transition-all text-white"
                        >
                            <option value="all" className="bg-gray-900">كل التصنيفات</option>
                            <option value="urgent" className="bg-gray-900">تنبيهات عاجلة</option>
                            <option value="holiday" className="bg-gray-900">إجازات رسمية</option>
                            <option value="event" className="bg-gray-900">فعاليات ونشاطات</option>
                            <option value="general" className="bg-gray-900">إعلانات عامة</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Announcements Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredAnnouncements.map((ann) => {
                    const config = getTypeConfig(ann.type);
                    return (
                        <div
                            key={ann.id}
                            className={cn(
                                "group bg-white dark:bg-gray-900 border-r-4 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col",
                                config.border,
                                ann.type === 'urgent' && "animate-pulse-subtle"
                            )}
                        >
                            <div className="p-6 flex-1">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={cn("px-3 py-1 flex items-center gap-2 border text-[9px] font-black uppercase tracking-[0.15em]", config.bg, config.color)}>
                                        <config.icon size={12} />
                                        {config.label}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[9px] text-gray-400 font-black uppercase tracking-widest">
                                        <Clock size={12} />
                                        {format(new Date(ann.date), 'dd MMMM yyyy', { locale: ar })}
                                    </div>
                                </div>

                                <h3 className="text-lg font-black text-gray-900 dark:text-white mb-3 group-hover:text-primary-600 transition-colors leading-tight">
                                    {ann.title}
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 font-bold leading-relaxed whitespace-pre-wrap">
                                    {ann.content}
                                </p>
                            </div>

                            <div className="px-6 py-4 bg-gray-50/50 dark:bg-gray-800/30 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                                <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest italic">إدارة الأكاديمية</span>
                                <div className="p-2 bg-white dark:bg-gray-900 shadow-sm border border-gray-100 dark:border-gray-800 text-gray-400 transition-transform group-hover:translate-x-[-4px]">
                                    <ChevronLeft size={16} />
                                </div>
                            </div>
                        </div>
                    );
                })}

                {filteredAnnouncements.length === 0 && (
                    <div className="col-span-full py-32 flex flex-col items-center justify-center text-center space-y-4 bg-gray-50/50 dark:bg-gray-800/20 border-2 border-dashed border-gray-200 dark:border-gray-800">
                        <div className="w-20 h-20 bg-white dark:bg-gray-900 shadow-sm flex items-center justify-center text-gray-200">
                            <Bell size={40} />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-gray-400 uppercase tracking-widest">لا توجد إعلانات حالياً</h3>
                            <p className="text-[10px] text-gray-400/80 font-bold mt-2">سنقوم بنشر الإعلانات والتعميمات الجديدة هنا فور صدورها.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
