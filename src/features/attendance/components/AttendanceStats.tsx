import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Calendar, TrendingUp, TrendingDown, Info, Users } from 'lucide-react';
import type { AttendanceStats as IStats, TeacherStats as ITeacherStats } from '../types';

interface AttendanceStatsProps {
    stats: IStats;
    teacherStats?: ITeacherStats;
    isTeacher: boolean;
    periodLabel?: string;
    prevCompleted?: number;
    prevCancelled?: number;
}

const Counter = ({ value, suffix = '' }: { value: number; suffix?: string }) => (
    <motion.span
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="tabular-nums"
    >
        {value.toLocaleString('ar-EG')}{suffix && <span className="text-micro font-bold text-on-primary/60 me-1">{suffix}</span>}
    </motion.span>
);

const TrendBadge = ({ value, label }: { value: number; label: string }) => {
    if (value === 0) return null;
    const isUp = value > 0;
    return (
        <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[9px] font-bold mt-0.5"
            style={{ backgroundColor: isUp ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)', color: isUp ? '#22c55e' : '#ef4444' }}>
            {isUp ? <TrendingUp size={8} /> : <TrendingDown size={8} />}
            <span>{isUp ? '+' : ''}{value}% {label}</span>
        </div>
    );
};

const TooltipWrap = ({ text, children }: { text: string; children: React.ReactNode }) => {
    const [show, setShow] = useState(false);
    return (
        <div className="relative inline-flex" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
            {children}
            {show && (
                <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute -top-1 left-1/2 -translate-x-1/2 -translate-y-full z-20 px-2 py-1 rounded-lg bg-gray-900 text-white text-[9px] font-bold whitespace-nowrap shadow-lg"
                >
                    {text}
                    <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
                </motion.div>
            )}
        </div>
    );
};

export const AttendanceStats = ({ stats, teacherStats, isTeacher, periodLabel, prevCompleted = 0, prevCancelled = 0 }: AttendanceStatsProps) => {
    if (isTeacher && teacherStats) {
        const trendRate = prevCompleted ? Math.round(((teacherStats.rate - prevCompleted) / prevCompleted) * 100) : 0;
        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3 mb-4" dir="rtl">
                <div className="rounded-2xl p-4 md:p-5 bg-gradient-to-br from-primary via-primary-deep to-primary-hover dark:from-primary-soft dark:to-primary relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[10px] font-bold text-white/70">نسبة الإنجاز الإجمالية</span>
                            <TooltipWrap text="نسبة الحصص المنعقدة من إجمالي المطلوبة">
                                <Info size={10} className="text-white/50" />
                            </TooltipWrap>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl md:text-3xl font-bold text-white"><Counter value={teacherStats.rate} suffix="%" /></span>
                            <TrendBadge value={trendRate} label="مقارنة بالأمس" />
                        </div>
                        <div className="mt-3 h-2 bg-white/15 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(teacherStats.rate, 100)}%` }}
                                transition={{ duration: 0.8, ease: 'easeOut' }}
                                className="h-full bg-white rounded-full"
                            />
                        </div>
                    </div>
                    <div className="absolute inset-0 opacity-[0.04]">
                        <svg width="100%" height="100%"><defs><pattern id="tch-stats-grid" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.5" fill="white" /></pattern></defs><rect width="100%" height="100%" fill="url(#tch-stats-grid)" /></svg>
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-2xl p-4 bg-card border border-border">
                        <div className="flex items-center justify-between mb-2">
                            <Calendar size={14} className="text-primary" />
                            <TooltipWrap text="إجمالي الحصص المقررة لهذا اليوم"><Info size={9} className="text-muted" /></TooltipWrap>
                        </div>
                        <p className="text-lg font-bold text-main"><Counter value={teacherStats.expected} /></p>
                        <p className="text-micro font-bold text-muted mt-0.5">الحصص المتوقعة</p>
                    </div>
                    <div className="rounded-2xl p-4 bg-card border border-border">
                        <div className="flex items-center justify-between mb-2">
                            <CheckCircle2 size={14} className="text-success" />
                            <TooltipWrap text="الحصص التي تم عقدها فعلياً"><Info size={9} className="text-muted" /></TooltipWrap>
                        </div>
                        <p className="text-lg font-bold text-success"><Counter value={teacherStats.used} /></p>
                        <p className="text-micro font-bold text-muted mt-0.5">المنعقدة</p>
                    </div>
                    <div className="rounded-2xl p-4 bg-card border border-border">
                        <div className="flex items-center justify-between mb-2">
                            <XCircle size={14} className="text-warning" />
                            <TooltipWrap text="الحصص المتبقية من الجدول"><Info size={9} className="text-muted" /></TooltipWrap>
                        </div>
                        <p className="text-lg font-bold text-warning"><Counter value={teacherStats.remaining} /></p>
                        <p className="text-micro font-bold text-muted mt-0.5">المتبقية</p>
                    </div>
                </div>
            </motion.div>
        );
    }

    const total = stats.todayCompleted + stats.todayCancelled + stats.todayScheduled || 1;
    const completedPct = Math.round((stats.todayCompleted / total) * 100);
    const cancelledPct = Math.round((stats.todayCancelled / total) * 100);
    const scheduledPct = Math.round((stats.todayScheduled / total) * 100);
    const trendCompleted = prevCompleted ? Math.round(((stats.todayCompleted - prevCompleted) / prevCompleted) * 100) : 0;
    const trendCancelled = prevCancelled ? Math.round(((stats.todayCancelled - prevCancelled) / prevCancelled) * 100) : 0;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3 mb-4" dir="rtl">
            {/* Main big card */}
            <div className="rounded-2xl p-4 md:p-5 bg-gradient-to-br from-primary via-primary-deep to-primary-hover dark:from-primary-soft dark:to-primary relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-white/70">إجمالي اليوم ({periodLabel || 'اليوم'})</span>
                        <div className="flex items-center gap-2">
                            <TooltipWrap text="مجموع جميع الحصص لجميع المعلمات في اليوم الحالي">
                                <Info size={10} className="text-white/50" />
                            </TooltipWrap>
                            <Users size={12} className="text-white/50" />
                        </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl md:text-3xl font-bold text-white"><Counter value={total - 1} /></span>
                        <span className="text-[10px] font-bold text-white/60">حصة</span>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center gap-1">
                            <CheckCircle2 size={10} className="text-white/70" />
                            <span className="text-[9px] text-white/70">{stats.todayCompleted} حضور</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <XCircle size={10} className="text-white/70" />
                            <span className="text-[9px] text-white/70">{stats.todayCancelled} غياب</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Calendar size={10} className="text-white/70" />
                            <span className="text-[9px] text-white/70">{stats.todayScheduled} مجدولة</span>
                        </div>
                    </div>
                    <div className="mt-3 flex gap-0.5 h-2 rounded-full overflow-hidden bg-white/15">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${completedPct}%` }} transition={{ duration: 0.6 }} className="h-full bg-success rounded-s-full" />
                        <motion.div initial={{ width: 0 }} animate={{ width: `${cancelledPct}%` }} transition={{ duration: 0.6, delay: 0.1 }} className="h-full bg-error" />
                        <motion.div initial={{ width: 0 }} animate={{ width: `${scheduledPct}%` }} transition={{ duration: 0.6, delay: 0.2 }} className="h-full bg-warning rounded-e-full" />
                    </div>
                    <div className="flex items-center justify-between mt-1.5">
                        <span className="text-[8px] text-white/50">نسبة الإنجاز: {completedPct}%</span>
                        <span className="text-[8px] text-white/50">إجمالي الكل: <Counter value={stats.totalCompleted} /></span>
                    </div>
                </div>
                <div className="absolute inset-0 opacity-[0.04]">
                    <svg width="100%" height="100%"><defs><pattern id="stats-hero-grid" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.5" fill="white" /></pattern></defs><rect width="100%" height="100%" fill="url(#stats-hero-grid)" /></svg>
                </div>
            </div>

            {/* 3 smaller cards */}
            <div className="grid grid-cols-3 gap-3">
                <div className="rounded-2xl p-4 bg-card border border-border">
                    <div className="flex items-center justify-between mb-2">
                        <CheckCircle2 size={14} className="text-success" />
                        <TrendBadge value={trendCompleted} label="مقارنة" />
                    </div>
                    <p className="text-lg font-bold text-success"><Counter value={stats.todayCompleted} /></p>
                    <p className="text-[10px] font-bold text-muted mt-0.5">حضور</p>
                </div>
                <div className="rounded-2xl p-4 bg-card border border-border">
                    <div className="flex items-center justify-between mb-2">
                        <XCircle size={14} className="text-error" />
                        <TrendBadge value={trendCancelled} label="مقارنة" />
                    </div>
                    <p className="text-lg font-bold text-error"><Counter value={stats.todayCancelled} /></p>
                    <p className="text-[10px] font-bold text-muted mt-0.5">غياب</p>
                </div>
                <div className="rounded-2xl p-4 bg-card border border-border">
                    <div className="flex items-center justify-between mb-2">
                        <Calendar size={14} className="text-warning" />
                        <TooltipWrap text="الحصص التي لم يتم البدء بها بعد"><Info size={9} className="text-muted" /></TooltipWrap>
                    </div>
                    <p className="text-lg font-bold text-warning"><Counter value={stats.todayScheduled} /></p>
                    <p className="text-[10px] font-bold text-muted mt-0.5">مجدولة</p>
                </div>
            </div>
        </motion.div>
    );
};