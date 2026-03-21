import React, { useState, useEffect } from 'react';
import { Megaphone, ChevronLeft, ChevronRight, Bell, AlertTriangle, Calendar, Info } from 'lucide-react';
import { api } from '../../../lib/api';
import { cn } from '../../../lib/utils';

interface Announcement {
    id: string;
    title: string;
    content: string;
    type: 'general' | 'urgent' | 'holiday' | 'event';
    date: string;
    isActive: boolean;
}

export const ModernAnnouncements: React.FC = () => {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnnouncements = async () => {
            try {
                const data = await api.get<Announcement[]>('/announcements');
                setAnnouncements(data?.filter(a => a.isActive) || []);
            } catch (error) {
                console.error('Error fetching announcements:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchAnnouncements();
    }, []);

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
            case 'urgent': return { icon: AlertTriangle, color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/20', label: 'عاجل' };
            case 'holiday': return { icon: Calendar, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20', label: 'إجازة' };
            case 'event': return { icon: Megaphone, color: 'text-indigo-500', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', label: 'فعالية' };
            default: return { icon: Info, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20', label: 'تنبيه' };
        }
    };

    const type = getTypeDetails(current.type);

    return (
        <div className="relative group bg-gray-950 border-2 md:border-4 border-gray-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] md:shadow-[12px_12px_0px_0px_rgba(0,0,0,0.3)] overflow-hidden mx-1 md:mx-0">
            {/* Animated Progress Bar */}
            <div className="absolute bottom-0 right-0 h-1 bg-primary-600 transition-all duration-[8000ms] ease-linear z-20" 
                 style={{ width: `${((currentIndex + 1) / announcements.length) * 100}%` }} />
            
            <div className="flex flex-col md:flex-row items-stretch">
                {/* Type Badge - Sharp Sidebar */}
                <div className={cn("w-full md:w-32 flex flex-row md:flex-col items-center justify-center p-3 md:p-4 gap-2 transition-colors duration-500", type.bg)}>
                    <type.icon size={22} className={type.color} />
                    <span className={cn("text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em]", type.color)}>
                        {type.label}
                    </span>
                </div>

                {/* Content Area */}
                <div className="flex-1 p-5 md:p-8 flex flex-col justify-center relative min-h-[100px] md:min-h-[120px]">
                    <div className="absolute top-3 left-4 md:top-4 md:left-6 flex items-center gap-1 opacity-20 group-hover:opacity-40 transition-opacity">
                        <Bell size={12} className="text-white" />
                        <span className="text-[9px] md:text-[10px] font-black text-white uppercase tracking-widest">{currentIndex + 1} / {announcements.length}</span>
                    </div>

                    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                        <h4 className="text-white font-black text-base md:text-xl mb-1 md:mb-2 tracking-tight">
                            {current.title}
                        </h4>
                        <p className="text-gray-400 text-[11px] md:text-sm font-bold leading-relaxed max-w-3xl">
                            {current.content}
                        </p>
                    </div>

                    {/* Navigation Buttons */}
                    {announcements.length > 1 && (
                        <div className="absolute bottom-3 left-4 md:bottom-4 md:left-6 flex gap-2">
                            <button 
                                onClick={() => setCurrentIndex(prev => (prev - 1 + announcements.length) % announcements.length)}
                                className="p-1 md:p-1.5 border-2 border-white/5 hover:border-white/20 text-white/40 hover:text-white transition-all bg-white/5"
                            >
                                <ChevronRight size={14} />
                            </button>
                            <button 
                                onClick={() => setCurrentIndex(prev => (prev + 1) % announcements.length)}
                                className="p-1 md:p-1.5 border-2 border-white/5 hover:border-white/20 text-white/40 hover:text-white transition-all bg-white/5"
                            >
                                <ChevronLeft size={14} />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Decorative Grid Overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        </div>
    );
};
