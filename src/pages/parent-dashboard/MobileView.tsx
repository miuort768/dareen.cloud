import { useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Users, Calendar, Star, User, LogOut,
    TrendingUp, BookOpen, Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { confirm } from '../../lib/confirmDialog';
import { ParentMobileHeroSection, ParentQuickNav, ParentMobileLiveClasses } from './HeroSections';
import { ParentStatsStrip, ParentActiveTimers, ParentTodaySchedule, ParentRecentActivity, ParentSupportCard } from './DataWidgets';
import { ParentMobileNotesSection, ParentMobileAcademicProgress } from './InfoWidgets';
import type { ParentViewProps } from './types';

type MobileViewProps = ParentViewProps & {
    activeTab: string;
    setActiveTab: (tab: string) => void;
};

const tabs = [
    { id: 'home', label: 'الرئيسية', icon: LayoutDashboard },
    { id: 'children', label: 'الأبناء', icon: Users },
    { id: 'schedule', label: 'الجدول', icon: Calendar },
    { id: 'activity', label: 'النشاط', icon: Star },
];

export const ParentMobileView = ({
    currentUser, adminPhone, children, allPointLogs,
    activeTimers, stats, todayTasks, points, rank, logout, formatTime,
    activeTab, setActiveTab
}: MobileViewProps) => {
    const navigate = useNavigate();
    return (
        <div className="block md:hidden min-h-screen pb-28 overflow-y-auto relative bg-background dark:bg-background font-sans" dir="rtl">
            <div className="sticky top-0 z-30 bg-background dark:bg-background">
                <div className="px-4 pt-2 pb-1">
                    <div className="flex items-center gap-2 mb-2 px-0.5">
                        <div className="w-6 h-6 rounded-card bg-primary flex items-center justify-center">
                            <LayoutDashboard size={12} className="text-on-primary" />
                        </div>
                        <h2 className="text-dim text-xs font-bold tracking-wide">لوحة التحكم</h2>
                    </div>
                    <div className="bg-card rounded-card p-3.5 shadow-soft border border-border flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-card bg-primary flex items-center justify-center shadow-soft">
                                <User size={18} className="text-on-primary" />
                            </div>
                            <div>
                                <h1 className="text-main font-black text-base leading-tight">
                                    أهلاً {(currentUser?.name || currentUser?.username || 'ولي الأمر')}
                                </h1>
                                <p className="text-micro font-medium text-muted mt-0.5">لوحة تحكم ولي الأمر • {format(new Date(), 'eeee, d MMMM', { locale: ar })}</p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-success" />
                                    <p className="text-muted text-xs font-bold">
                                        {children.length > 0
                                            ? [...children].sort((a, b) => a.id.localeCompare(b.id))[0]?.name || 'طالب'
                                            : 'طالب'}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <button onClick={async () => { if (await confirm('هل أنت متأكد من تسجيل الخروج؟')) logout(); }}
                            className="w-10 h-10 bg-hover rounded-card flex items-center justify-center text-muted active:scale-90 transition-transform hover:bg-hover" aria-label="تسجيل الخروج">
                            <LogOut size={16} />
                        </button>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                        <div className="flex-1 bg-card rounded-card py-2.5 px-3 flex items-center gap-2.5 shadow-md border border-border">
                            <div className="w-7 h-7 rounded-lg bg-success-soft flex items-center justify-center">
                                <TrendingUp size={13} className="text-success-dark" />
                            </div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-main font-black text-base">{stats.academicProgress}%</span>
                                <span className="text-muted text-micro font-bold tracking-wide">الالتزام</span>
                            </div>
                        </div>
                        <div className="flex-1 bg-card rounded-card py-2.5 px-3 flex items-center gap-2.5 shadow-md border border-border">
                            <div className="w-7 h-7 rounded-lg bg-info-soft flex items-center justify-center">
                                <BookOpen size={13} className="text-info-dark" />
                            </div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-main font-black text-base">{children.reduce((sum, c) => sum + (c.enrollments?.length || 0), 0)}</span>
                                <span className="text-muted text-micro font-bold tracking-wide">المادة</span>
                            </div>
                        </div>
                        <div className="flex-1 bg-card rounded-card py-2.5 px-3 flex items-center gap-2.5 shadow-md border border-border">
                            <div className="w-7 h-7 rounded-lg bg-primary-soft flex items-center justify-center">
                                <Users size={13} className="text-primary" />
                            </div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-main font-black text-base">{stats.childCount}</span>
                                <span className="text-muted text-micro font-bold tracking-wide">الأبناء</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="px-4 pb-4">
                    <div className="flex gap-1 bg-card rounded-card p-1 shadow-md border border-border">
                        {tabs.map(tab => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-card text-xs font-bold transition-all duration-200 ${activeTab === tab.id
                                    ? 'bg-primary text-on-primary shadow-sm'
                                    : 'text-dim hover:bg-hover dark:hover:bg-primary-active/50'
                                }`}>
                                <tab.icon size={14} />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="px-3 pt-3 space-y-3.5">
                {activeTab === 'home' && (
                    <>
                        <ParentMobileHeroSection navigate={navigate} />
                        <ParentQuickNav navigate={navigate} />
                        <ParentStatsStrip points={points} attendanceRate={stats.attendanceRate} rankName={rank.name} />
                        {activeTimers.length > 0 && (
                            <ParentActiveTimers activeTimers={activeTimers} children={children} formatTime={formatTime} variant="mobile" />
                        )}
                        <ParentMobileLiveClasses />
                    </>
                )}

                {activeTab === 'children' && (
                    <>
                        <ParentMobileNotesSection children={children} />
                        <ParentMobileAcademicProgress academicProgress={stats.academicProgress} />
                    </>
                )}

                {activeTab === 'schedule' && (
                    <section>
                        <div className="flex items-center gap-2 mb-2 px-1">
                            <div className="w-1 h-4 bg-primary rounded-full" />
                            <h2 className="text-main text-sm font-black">جدول حصص اليوم</h2>
                        </div>
                        <div className="bg-card rounded-card shadow-md p-3.5">
                            <ParentTodaySchedule todayTasks={todayTasks} variant="mobile" />
                        </div>
                    </section>
                )}

                {activeTab === 'activity' && (
                    <>
                        <section>
                            <div className="flex items-center gap-2 mb-2 px-1">
                                <div className="w-1 h-4 bg-warning rounded-full" />
                                <h2 className="text-main text-sm font-black">آخر النشاطات</h2>
                            </div>
                            <div className="bg-card rounded-card shadow-md p-3.5">
                                <ParentRecentActivity allPointLogs={allPointLogs} />
                            </div>
                        </section>
                        <ParentSupportCard adminPhone={adminPhone} variant="mobile" />
                    </>
                )}
            </div>
        </div>
    );
};
