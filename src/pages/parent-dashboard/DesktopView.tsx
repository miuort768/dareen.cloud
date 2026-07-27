import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Users, CalendarDays, Star, User, LogOut,
    LayoutDashboard, Sparkles
} from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { StatCard, GlassCard } from '../../shared/components/ui';
import { confirm } from '../../lib/confirmDialog';
import { LiveClasses } from '../../components/dashboard/LiveClasses';
import { NavButton } from './NavButton';
import { ParentHeroSection } from './HeroSections';
import { ParentStatsStrip, ParentActiveTimers, ParentTodaySchedule, ParentRecentActivity, ParentSupportCard } from './DataWidgets';
import { ParentNotesSection, ParentAcademicProgress } from './InfoWidgets';
import type { ParentViewProps } from './types';

type DesktopViewProps = ParentViewProps;

export const ParentDesktopView = ({
    currentUser, adminPhone, children, allPointLogs,
    activeTimers, stats, todayTasks, points, rank, logout, formatTime
}: DesktopViewProps) => {
    const navigate = useNavigate();
    return (
        <div className="hidden md:block min-h-full pb-24 overflow-x-hidden relative bg-background font-sans" dir="rtl">
            <div className="max-w-page mx-auto px-2 pt-4 md:pt-6 pb-32 space-y-4 md:space-y-6">
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                    <GlassCard className="p-4 md:p-5 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-warning-soft flex items-center justify-center shadow-lg shadow-warning/20">
                                <User size={22} className="text-white" />
                            </div>
                            <div>
                                <h1 className="text-base md:text-lg font-bold text-main">
                                    مرحباً... {(currentUser?.name || currentUser?.username || 'ولي الأمر').split(' ')[0]}
                                </h1>
                                <p className="text-xs md:text-xs font-medium text-muted">لوحة تحكم ولي الأمر • {format(new Date(), 'eeee, d MMMM', { locale: ar })}</p>
                            </div>
                        </div>
                        <button onClick={async () => { if (await confirm('هل أنت متأكد من تسجيل الخروج؟')) logout(); }}
                            className="w-10 h-10 rounded-xl bg-white/15 text-muted hover:text-error flex items-center justify-center border border-white/20 transition-all">
                            <LogOut size={18} />
                        </button>
                    </GlassCard>
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

                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
                    <GlassCard className="p-4">
                        <ParentStatsStrip points={points} attendanceRate={stats.attendanceRate} rankName={rank.name} />
                    </GlassCard>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}>
                    <GlassCard className="p-4 grid grid-cols-2 gap-3">
                        <NavButton label="ملفات الأبناء" icon={Users} onClick={() => navigate('/parent-students')} />
                        <NavButton label="المنتدى" icon={LayoutDashboard} onClick={() => navigate('/forum')} />
                    </GlassCard>
                </motion.div>

                {activeTimers.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        <GlassCard className="p-4">
                            <ParentActiveTimers activeTimers={activeTimers} children={children} formatTime={formatTime} variant="desktop" />
                        </GlassCard>
                    </motion.div>
                )}

                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}>
                    <GlassCard className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <Sparkles size={14} className="text-primary" />
                            <h2 className="text-xs font-bold text-muted">البث المباشر</h2>
                        </div>
                        <LiveClasses />
                    </GlassCard>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}>
                    <GlassCard className="p-4">
                        <ParentNotesSection children={children} />
                    </GlassCard>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }}>
                    <GlassCard className="p-4">
                        <ParentAcademicProgress academicProgress={stats.academicProgress} />
                    </GlassCard>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.36 }}>
                    <GlassCard className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <Sparkles size={14} className="text-info" />
                            <h2 className="text-xs font-bold text-muted">جدول حصص اليوم</h2>
                        </div>
                        <ParentTodaySchedule todayTasks={todayTasks} variant="desktop" />
                    </GlassCard>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                    <GlassCard className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <Sparkles size={14} className="text-warning" />
                            <h2 className="text-xs font-bold text-muted">آخر النشاطات</h2>
                        </div>
                        <ParentRecentActivity allPointLogs={allPointLogs} />
                    </GlassCard>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.44 }}>
                    <ParentSupportCard adminPhone={adminPhone} variant="desktop" />
                </motion.div>
            </div>
        </div>
    );
};
