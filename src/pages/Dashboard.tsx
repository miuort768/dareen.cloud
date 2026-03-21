import { Bell } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useDashboardData } from '../features/dashboard/hooks/useDashboardData';
import { DashboardHeader } from '../features/dashboard/components/DashboardHeader';
import { DashboardStats } from '../features/dashboard/components/DashboardStats';
import { ImportantNotifications } from '../features/dashboard/components/ImportantNotifications';
import { DashboardCharts } from '../features/dashboard/components/DashboardCharts';
import { PerformanceSummary } from '../features/dashboard/components/PerformanceSummary';
import { TasksAndRequests } from '../features/dashboard/components/TasksAndRequests';
import { SessionAnalysis } from '../features/dashboard/components/SessionAnalysis';
import { TeacherAchievements } from '../features/dashboard/components/TeacherAchievements';
import { RenewalAlertsList } from '../features/dashboard/components/RenewalAlertsList';
import { SmartAlerts } from '../features/dashboard/components/SmartAlerts';
import { AnalyticsDashboard } from '../features/dashboard/components/AnalyticsDashboard';

export const Dashboard = () => {
    const { currentUser } = useApp();

    const {
        stats,
        monthlyData,
        lowBalanceStudents,
        tasks,
        loading,
        rawStudents,
        rawSessions,
        rawStudentInvoices
    } = useDashboardData(currentUser);

    const isTeacher = currentUser?.role === 'teacher';

    if (!currentUser || (!currentUser.permissions?.includes('*') && !currentUser.permissions?.includes('dashboard') && currentUser.role !== 'teacher')) {
        return <div className="min-h-screen bg-gray-50 dark:bg-gray-950" />;
    }

    if (loading) {
        return (
            <div className="space-y-8 p-4 lg:p-8 bg-gray-50 dark:bg-gray-950 min-h-screen">
                <div className="h-64 bg-gray-200 dark:bg-gray-800 border-4 border-gray-950 dark:border-gray-700"></div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="h-40 bg-gray-200 dark:bg-gray-800 border-4 border-gray-950 dark:border-gray-700"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-32 max-w-[1600px] mx-auto" dir="rtl">
            <DashboardHeader
                isTeacher={isTeacher}
                currentUser={currentUser}
                stats={stats}
            />

            <DashboardStats stats={stats} isTeacher={isTeacher} />

            {/* General System Notes - Sharp Premium Style (Watermelon Theme) */}
            <div className="bg-gray-950 border-4 border-[#ef4444] p-8 shadow-[10px_10px_0px_0px_rgba(0,0,0,0.2)] relative overflow-hidden group">
                {/* Decorative Sharp Element (Green Rind) */}
                <div className="absolute top-0 left-0 w-3 h-full bg-[#10b981]"></div>
                
                <div className="flex flex-col md:flex-row items-start md:items-center gap-8 relative z-10">
                    <div className="p-4 bg-[#ef4444]/10 border-2 border-[#ef4444]/20 text-[#ef4444]">
                        <Bell size={28} />
                    </div>
                    <div className="flex-1 w-full">
                        <h3 className="text-white font-black uppercase text-[10px] lg:text-xs tracking-[0.4em] mb-4 opacity-40">حالة النظام والتنبيهات الذكية</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {!isTeacher && stats.pendingInvoices > 0 && (
                                <div className="flex items-center justify-between bg-white/5 border-l-4 border-[#ef4444] p-4">
                                    <span className="text-white/60 font-black text-[10px] uppercase tracking-widest">فواتير معلقة</span>
                                    <span className="text-[#ef4444] font-black text-lg lg:text-xl tabular-nums">{stats.pendingInvoices}</span>
                                </div>
                            )}
                            <div className="flex items-center justify-between bg-white/5 border-l-4 border-[#10b981] p-4">
                                <span className="text-white/60 font-black text-[10px] uppercase tracking-widest">سلامة النظام</span>
                                <span className="text-[#10b981] font-black text-xs lg:text-sm tracking-tighter uppercase whitespace-nowrap">مُــحـسّـن (100%)</span>
                            </div>
                            <div className="flex items-center justify-between bg-white/5 border-l-4 border-[#ef4444] p-4">
                                <span className="text-white/60 font-black text-[10px] uppercase tracking-widest">مزامنة البيانات</span>
                                <span className="text-white/90 font-black text-[10px] lg:text-xs tracking-widest whitespace-nowrap">نـشـط الآن</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {isTeacher ? (
                <div className="space-y-8">
                    {/* Teacher Specific Sharp Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <TeacherAchievements
                            stats={stats}
                            lowBalanceStudents={lowBalanceStudents}
                            isTeacher={true}
                        />
                        <TasksAndRequests tasks={tasks} />
                        <SessionAnalysis stats={stats} monthlyData={monthlyData} />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <DashboardCharts isTeacher={true} monthlyData={monthlyData} />
                        <RenewalAlertsList
                            stats={stats}
                            lowBalanceStudents={lowBalanceStudents}
                        />
                    </div>

                    <div className="w-full">
                        <PerformanceSummary stats={stats} isTeacher={true} />
                    </div>
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Admin Specific Sharp Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <PerformanceSummary stats={stats} isTeacher={false} />
                        <TasksAndRequests tasks={tasks} />
                        <SessionAnalysis stats={stats} monthlyData={monthlyData} />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <ImportantNotifications
                            tasks={tasks}
                            lowBalanceStudents={lowBalanceStudents}
                        />
                        <DashboardCharts isTeacher={false} monthlyData={monthlyData} />
                    </div>

                    <SmartAlerts
                        students={rawStudents}
                        sessions={rawSessions}
                        studentInvoices={rawStudentInvoices}
                        lowBalanceStudents={lowBalanceStudents}
                    />

                    <div className="w-full">
                        <RenewalAlertsList
                            stats={stats}
                            lowBalanceStudents={lowBalanceStudents}
                        />
                    </div>

                    <div className="w-full">
                        <AnalyticsDashboard
                            students={rawStudents}
                            sessions={rawSessions}
                            monthlyData={monthlyData}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};
