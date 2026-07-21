import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Users, CalendarDays, Star, User, LogOut,
    LayoutDashboard, Sparkles
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { StatCard } from '../../shared/components/ui';
import { confirm } from '../../lib/confirmDialog';
import { LiveClasses } from '../../components/dashboard/LiveClasses';
import { NavButton } from './NavButton';
import { ParentHeroSection } from './HeroSections';
import { ParentStatsStrip, ParentActiveTimers, ParentTodaySchedule, ParentRecentActivity, ParentSupportCard } from './DataWidgets';
import { ParentNotesSection, ParentAcademicProgress } from './InfoWidgets';
import type { ParentViewProps } from './types';

type DesktopViewProps = ParentViewProps;

const glass = "bg-white/70 dark:bg-white/[0.07] backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl shadow-lg shadow-black/[0.03]";

export const ParentDesktopView = ({
    currentUser, adminPhone, children, allPointLogs,
    activeTimers, stats, todayTasks, points, rank, logout, formatTime
}: DesktopViewProps) => {
    const navigate = useNavigate();
    return (
        <div className="hidden md:block min-h-full pb-24 overflow-x-hidden relative bg-gradient-to-b from-sky-50 via-white to-white dark:from-slate-950 dark:via-background dark:to-background font-sans" dir="rtl">
            <div className="max-w-page mx-auto px-2 pt-4 md:pt-6 pb-32 space-y-4 md:space-y-6">
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                    className={cn(glass, "p-4 md:p-5 flex items-center justify-between")}
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-warning to-orange-500 flex items-center justify-center shadow-lg shadow-warning/20">
                            <User size={22} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-base md:text-lg font-black text-main">
                                مرحباً... {(currentUser?.name || currentUser?.username || 'ولي الأمر').split(' ')[0]}
                            </h1>
                            <p className="text-xs md:text-xs font-medium text-muted">لوحة تحكم ولي الأمر • {format(new Date(), 'eeee, d MMMM', { locale: ar })}</p>
                        </div>
                    </div>
                    <button onClick={async () => { if (await confirm('هل أنت متأكد من تسجيل الخروج؟')) logout(); }}
                        className="w-10 h-10 rounded-xl bg-white/50 dark:bg-white/10 text-dim hover:text-error flex items-center justify-center border border-white/20 dark:border-white/5 transition-all">
                        <LogOut size={18} />
                    </button>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 }}>
                    <ParentHeroSection navigate={navigate} />
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-4"
                >
                    <StatCard title="الأبناء" value={stats.childCount} icon={Users} variant="warning" />
                    <StatCard title="قادمة" value={stats.upcomingSessions} icon={CalendarDays} variant="info" />
                    <StatCard title="الانضباط" value={`${stats.attendanceRate}%`} icon={Star} variant="error" />
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
                    className={cn(glass, "p-4")}
                >
                    <ParentStatsStrip points={points} attendanceRate={stats.attendanceRate} rankName={rank.name} />
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}
                    className={cn(glass, "p-4 grid grid-cols-2 gap-3")}
                >
                    <NavButton label="ملفات الأبناء" icon={Users} onClick={() => navigate('/parent-students')} />
                    <NavButton label="المنتدى" icon={LayoutDashboard} onClick={() => navigate('/forum')} />
                </motion.div>

                {activeTimers.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                        className={cn(glass, "p-4")}
                    >
                        <ParentActiveTimers activeTimers={activeTimers} children={children} formatTime={formatTime} variant="desktop" />
                    </motion.div>
                )}

                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }} className={cn(glass, "p-4")}>
                    <div className="flex items-center gap-2 mb-3">
                        <Sparkles size={14} className="text-primary" />
                        <h2 className="text-xs font-bold text-muted">البث المباشر</h2>
                    </div>
                    <LiveClasses />
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }} className={cn(glass, "p-4")}>
                    <ParentNotesSection children={children} />
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }} className={cn(glass, "p-4")}>
                    <ParentAcademicProgress academicProgress={stats.academicProgress} />
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.36 }} className={cn(glass, "p-4")}>
                    <div className="flex items-center gap-2 mb-3">
                        <Sparkles size={14} className="text-info" />
                        <h2 className="text-xs font-bold text-muted">جدول حصص اليوم</h2>
                    </div>
                    <ParentTodaySchedule todayTasks={todayTasks} variant="desktop" />
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className={cn(glass, "p-4")}>
                    <div className="flex items-center gap-2 mb-3">
                        <Sparkles size={14} className="text-warning" />
                        <h2 className="text-xs font-bold text-muted">آخر النشاطات</h2>
                    </div>
                    <ParentRecentActivity allPointLogs={allPointLogs} />
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.44 }}>
                    <ParentSupportCard adminPhone={adminPhone} variant="desktop" />
                </motion.div>
            </div>
        </div>
    );
};
