import { useNavigate } from 'react-router-dom';
import {
    Users, CalendarDays, Star, User, LogOut,
    LayoutDashboard
} from 'lucide-react';
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

export const ParentDesktopView = ({
    currentUser, adminPhone, children, allPointLogs,
    activeTimers, stats, todayTasks, points, rank, logout, formatTime
}: DesktopViewProps) => {
    const navigate = useNavigate();
    return (
        <div className="hidden md:block min-h-full pb-24 overflow-x-hidden relative bg-surface font-sans" dir="rtl">
            <div className="max-w-page mx-auto px-2 pt-4 md:pt-6 pb-32 space-y-4 md:space-y-6">
                <div className="bg-card border border-border rounded-card p-4 md:p-5 shadow-soft flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-warning rounded-card flex items-center justify-center text-on-warning shadow-soft">
                            <User size={22} />
                        </div>
                        <div>
                            <h1 className="text-base md:text-lg font-black text-main">
                                مرحباً... {(currentUser?.name || currentUser?.username || 'ولي الأمر').split(' ')[0]}
                            </h1>
                            <p className="text-xs md:text-xs font-medium text-dim">لوحة تحكم ولي الأمر • {format(new Date(), 'eeee, d MMMM', { locale: ar })}</p>
                        </div>
                    </div>
                    <button onClick={async () => { if (await confirm('هل أنت متأكد من تسجيل الخروج؟')) logout(); }}
                        className="w-10 h-10 bg-card text-dim hover:text-error flex items-center justify-center rounded-card border border-border transition-all hover:bg-error-soft dark:hover:bg-error-soft">
                        <LogOut size={18} />
                    </button>
                </div>

                <ParentHeroSection navigate={navigate} />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-4">
                    <StatCard title="الأبناء" value={stats.childCount} icon={Users} variant="warning" />
                    <StatCard title="قادمة" value={stats.upcomingSessions} icon={CalendarDays} variant="info" />
                    <StatCard title="الانضباط" value={`${stats.attendanceRate}%`} icon={Star} variant="error" />
                </div>

                <ParentStatsStrip points={points} attendanceRate={stats.attendanceRate} rankName={rank.name} />

                <div className="grid grid-cols-2 gap-2">
                    <NavButton label="ملفات الأبناء" icon={Users} onClick={() => navigate('/parent-students')} />
                    <NavButton label="المنتدى" icon={LayoutDashboard} onClick={() => navigate('/forum')} />
                </div>

                {activeTimers.length > 0 && (
                    <ParentActiveTimers activeTimers={activeTimers} children={children} formatTime={formatTime} variant="desktop" />
                )}

                <div className="mb-6">
                    <LiveClasses />
                </div>

                <ParentNotesSection children={children} />

                <ParentAcademicProgress academicProgress={stats.academicProgress} />

                <ParentTodaySchedule todayTasks={todayTasks} variant="desktop" />

                <ParentRecentActivity allPointLogs={allPointLogs} />

                <ParentSupportCard adminPhone={adminPhone} variant="desktop" />
            </div>
        </div>
    );
};
