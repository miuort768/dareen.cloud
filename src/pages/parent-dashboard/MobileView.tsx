import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, Users, Calendar, Star, User, LogOut,
    TrendingUp, BookOpen, Sparkles
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { confirm } from '../../lib/confirmDialog';
import { ParentMobileHeroSection, ParentQuickNav, ParentMobileLiveClasses } from './HeroSections';
import { ParentStatsStrip, ParentActiveTimers, ParentTodaySchedule, ParentRecentActivity, ParentSupportCard } from './DataWidgets';
import { ParentMobileNotesSection, ParentMobileAcademicProgress } from './InfoWidgets';
import { GlassCard } from '@/shared/components/ui';
import type { ParentViewProps } from './types';

type MobileViewProps = ParentViewProps & {
    activeTab: string;
    setActiveTab: (tab: string) => void;
};

const tabs = [
    { id: 'home' as const, label: 'الرئيسية', icon: LayoutDashboard },
    { id: 'children' as const, label: 'الأبناء', icon: Users },
    { id: 'schedule' as const, label: 'الجدول', icon: Calendar },
    { id: 'activity' as const, label: 'النشاط', icon: Star },
];

const glass = "bg-surface/80 backdrop-blur-xl border-b border-border";

export const ParentMobileView = ({
    currentUser, adminPhone, children, allPointLogs,
    activeTimers, stats, todayTasks, points, rank, logout, formatTime,
    activeTab, setActiveTab
}: MobileViewProps) => {
    const navigate = useNavigate();
    return (
        <div className="block md:hidden min-h-screen pb-28 overflow-y-auto relative bg-white dark:bg-background font-sans" dir="rtl">

            {/* Frosted Glass Header */}
            <div className={cn("sticky top-0 z-50 transition-all duration-500", glass)}>
                <div className="px-5 pt-5 pb-4">
                    <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-xl bg-primary-soft flex items-center justify-center">
                                <LayoutDashboard size={11} className="text-white" />
                            </div>
                            <h2 className="text-muted text-[10px] font-bold tracking-wide">لوحة التحكم</h2>
                        </div>
                        <button onClick={async () => { if (await confirm('هل أنت متأكد من تسجيل الخروج؟')) logout(); }}
                            className="w-8 h-8 rounded-xl bg-white/50 dark:bg-white/10 flex items-center justify-center text-muted border border-white/20 dark:border-white/5" aria-label="تسجيل الخروج">
                            <LogOut size={14} />
                        </button>
                    </div>
                    <GlassCard className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-primary-soft flex items-center justify-center shadow-lg shadow-primary/20">
                                <User size={18} className="text-white" />
                            </div>
                            <div>
                                <h1 className="text-main font-bold text-base leading-tight">
                                    أهلاً {(currentUser?.name || currentUser?.username || 'ولي الأمر')}
                                </h1>
                                <p className="text-[11px] font-medium text-muted mt-0.5">{format(new Date(), 'eeee, d MMMM', { locale: ar })}</p>
                            </div>
                        </div>
                    </GlassCard>
                    {/* Stats row */}
                    <div className="flex items-center gap-2 mt-3">
                        <div className="flex-1 bg-white/50 dark:bg-white/5 rounded-xl py-2 px-3 flex items-center gap-2 border border-white/20 dark:border-white/5">
                            <div className="w-6 h-6 rounded-lg bg-success-soft flex items-center justify-center shadow-lg shadow-success/20">
                                <TrendingUp size={11} className="text-white" />
                            </div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-main font-semibold text-sm">{stats.academicProgress}%</span>
                                <span className="text-muted text-[10px] font-bold">الالتزام</span>
                            </div>
                        </div>
                        <div className="flex-1 bg-white/50 dark:bg-white/5 rounded-xl py-2 px-3 flex items-center gap-2 border border-white/20 dark:border-white/5">
                            <div className="w-6 h-6 rounded-lg bg-info-soft flex items-center justify-center shadow-lg shadow-info/20">
                                <BookOpen size={11} className="text-white" />
                            </div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-main font-semibold text-sm">{children.reduce((sum, c) => sum + (c.enrollments?.length || 0), 0)}</span>
                                <span className="text-muted text-[10px] font-bold">المادة</span>
                            </div>
                        </div>
                        <div className="flex-1 bg-white/50 dark:bg-white/5 rounded-xl py-2 px-3 flex items-center gap-2 border border-white/20 dark:border-white/5">
                            <div className="w-6 h-6 rounded-lg bg-primary-soft flex items-center justify-center shadow-lg shadow-primary/20">
                                <Users size={11} className="text-white" />
                            </div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-main font-semibold text-sm">{stats.childCount}</span>
                                <span className="text-muted text-[10px] font-bold">الأبناء</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tab Content */}
            <div className="px-4 pt-4 pb-4">
                <AnimatePresence mode="wait">
                    <motion.div key={activeTab} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                        {activeTab === 'home' && (
                            <div className="space-y-4">
                                <ParentMobileHeroSection navigate={navigate} />
                                <ParentQuickNav navigate={navigate} />
                                <ParentStatsStrip points={points} attendanceRate={stats.attendanceRate} rankName={rank.name} />
                                {activeTimers.length > 0 && (
                                    <ParentActiveTimers activeTimers={activeTimers} children={children} formatTime={formatTime} variant="mobile" />
                                )}
                                <ParentMobileLiveClasses />
                            </div>
                        )}

                        {activeTab === 'children' && (
                            <div className="space-y-4">
                                <ParentMobileNotesSection children={children} />
                                <ParentMobileAcademicProgress academicProgress={stats.academicProgress} />
                            </div>
                        )}

                        {activeTab === 'schedule' && (
                            <section>
                                <div className="flex items-center gap-2 mb-3 px-1">
                                    <Sparkles size={13} className="text-primary" />
                                    <h2 className="text-xs font-bold text-muted">جدول حصص اليوم</h2>
                                </div>
                                <GlassCard className="p-4">
                                    <ParentTodaySchedule todayTasks={todayTasks} variant="mobile" />
                                </GlassCard>
                            </section>
                        )}

                        {activeTab === 'activity' && (
                            <div className="space-y-4">
                                <section>
                                    <div className="flex items-center gap-2 mb-3 px-1">
                                        <Sparkles size={13} className="text-warning" />
                                        <h2 className="text-xs font-bold text-muted">آخر النشاطات</h2>
                                    </div>
                                    <GlassCard className="p-4">
                                        <ParentRecentActivity allPointLogs={allPointLogs} />
                                    </GlassCard>
                                </section>
                                <ParentSupportCard adminPhone={adminPhone} variant="mobile" />
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* iOS-style Bottom Tab Bar */}
            <div className="fixed bottom-0 inset-x-0 z-50">
                <div className="h-2 bg-background" />
                <div className="bg-card border-t border-border shadow-2xl shadow-black/5 pb-[env(safe-area-inset-bottom)]">
                    <div className="flex items-center justify-around px-2 py-1.5">
                        {tabs.map(tab => {
                            const isActive = activeTab === tab.id;
                            return (
                                <motion.button key={tab.id} whileTap={{ scale: 0.9 }}
                                    onClick={() => setActiveTab(tab.id)}
                                    className="relative flex flex-col items-center gap-0.5 py-1 px-4 min-w-[64px]"
                                >
                                    <div className={cn(
                                        "rounded-xl p-1.5 transition-all duration-300 relative",
                                        isActive && "bg-primary/10"
                                    )}>
                                        <tab.icon size={20} strokeWidth={isActive ? 2 : 1.5}
                                            className={cn("transition-colors duration-300", isActive ? "text-primary" : "text-muted")}
                                        />
                                    </div>
                                    <span className={cn("text-[10px] font-bold transition-all duration-300", isActive ? "text-primary" : "text-muted")}>
                                        {tab.label}
                                    </span>
                                    {isActive && (
                                        <motion.div layoutId="parent-tab-indicator"
                                            className="absolute -top-1.5 w-8 h-1 rounded-full bg-gradient-to-r from-primary to-primary-active shadow-lg shadow-primary/30"
                                        />
                                    )}
                                </motion.button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};