import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Calendar, Users, Clock } from 'lucide-react';

interface AttendanceHeaderProps {
    date: string;
    onDateChange: (date: string) => void;
    stats: { todayTotal: number; totalCompleted: number };
    isTeacher: boolean;
    teacherCount?: number;
}

export const AttendanceHeader = ({ date, onDateChange, isTeacher, stats, teacherCount = 0 }: AttendanceHeaderProps) => {
    const [lastSync, setLastSync] = useState(new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }));

    useEffect(() => {
        const interval = setInterval(() => {
            setLastSync(new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }));
        }, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary-deep to-primary-hover dark:from-primary-light dark:via-primary-deep dark:to-primary-soft"
        >
            <div className="absolute inset-0 opacity-[0.06]">
                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="att-hero-grid" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
                            <circle cx="2" cy="2" r="1" fill="white" />
                            <circle cx="16" cy="16" r="0.8" fill="white" opacity="0.4" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#att-hero-grid)" />
                </svg>
            </div>
            <div className="relative z-10 p-4 md:p-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white/20 flex items-center justify-center ring-2 ring-white/30">
                            <Activity size={20} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-sm md:text-lg font-bold text-on-primary leading-tight">تحضير الطلاب والمتابعة اليومية</h1>
                            <p className="text-[10px] md:text-micro font-bold text-white/70 mt-0.5">إدارة الجداول الأكاديمية والتحضير المباشر</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        {/* Live Status */}
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/15 backdrop-blur-sm rounded-xl">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
                            </span>
                            <span className="text-[10px] font-bold text-white">Live</span>
                        </div>

                        {/* Last Sync */}
                        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-xl">
                            <Clock size={10} className="text-white/60" />
                            <span className="text-[9px] text-white/60">آخر مزامنة: {lastSync}</span>
                        </div>

                        {/* Teachers count */}
                        {!isTeacher && (
                            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-xl">
                                <Users size={10} className="text-white/60" />
                                <span className="text-[9px] text-white/60">{teacherCount} معلمة</span>
                            </div>
                        )}

                        {/* Sessions count */}
                        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-xl">
                            <Activity size={10} className="text-white/60" />
                            <span className="text-[9px] text-white/60">{stats.todayTotal} حصة</span>
                        </div>

                        {/* Date */}
                        {!isTeacher && (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/15 rounded-xl">
                                <Calendar size={12} className="text-white/70" />
                                <input type="date" aria-label="التاريخ" value={date}
                                    onChange={(e) => onDateChange(e.target.value)}
                                    className="bg-transparent border-none p-0 text-[10px] font-bold text-white outline-none focus-visible:ring-0 cursor-pointer w-24" />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};