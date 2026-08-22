import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../../store/authStore';
import { useDashboardData } from '../hooks/useDashboardData';
import { ExecutiveDashboard } from '../components/executive/ExecutiveDashboardLayout';
import { MobileDashboardView } from '../components/MobileDashboardView';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CalendarDays } from 'lucide-react';
import { useAcademicYear } from '../../../context/useApp';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.06 } }
};

export const Dashboard = () => {
    useEffect(() => { document.title = 'لوحة التحكم | دارين السابعة للتعليم والتدريب'; }, []);
    const currentUser = useAuthStore(s => s.currentUser);
    const academicYear = useAcademicYear();

    const {
        stats,
        todaySessions,
        monthlyData,
        lowBalanceStudents,
        tasks,
        loading,
        rawStudents,
        rawSessions,
        rawStudentInvoices,
        fetchDashboardData
    } = useDashboardData(currentUser);

    if (!currentUser || (!currentUser.permissions?.includes('*') && !currentUser.permissions?.includes('dashboard'))) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center max-w-md">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-error-soft flex items-center justify-center">
                        <AlertCircle size={28} className="text-error" />
                    </div>
                    <h2 className="text-lg font-bold text-main mb-2">لا تملك صلاحية الوصول</h2>
                    <p className="text-sm text-muted mb-4">ليس لديك صلاحية لعرض لوحة التحكم. يرجى التواصل مع مدير النظام.</p>
                    <Button variant="outline" size="sm" onClick={() => window.history.back()}>العودة</Button>
                </div>
            </div>
        );
    }

    return (
        <AnimatePresence mode="wait">
            {loading ? (
                <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="min-h-full pb-24"
                    dir="rtl"
                >
                    <div className="hidden md:block max-w-page mx-auto px-6 space-y-6 relative z-10">
                        <Skeleton className="h-[180px] rounded-2xl" />
                        <div className="grid grid-cols-4 gap-3">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <Card key={`skel-kpi-${i}`} className="overflow-hidden">
                                    <CardContent className="p-5">
                                        <Skeleton className="h-10 w-10 rounded-xl mb-3" />
                                        <Skeleton className="h-8 w-24 mb-1" />
                                        <Skeleton className="h-3 w-20" />
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <Skeleton className="h-[280px] rounded-2xl" />
                            <Skeleton className="h-[280px] rounded-2xl" />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <Skeleton className="h-[240px] rounded-2xl" />
                            <Skeleton className="h-[240px] rounded-2xl" />
                        </div>
                    </div>

                    <div className="block md:hidden px-4 pt-4 space-y-4">
                        <Skeleton className="h-[160px] rounded-2xl" />
                        <div className="flex gap-3 overflow-hidden">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <Skeleton key={`skel-mob-${i}`} className="h-24 w-[140px] rounded-2xl shrink-0" />
                            ))}
                        </div>
                        <Skeleton className="h-[200px] rounded-2xl" />
                    </div>
                </motion.div>
            ) : (
                <motion.div
                    key="content"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="min-h-full pb-24 bg-background"
                    dir="rtl"
                >
                    {/* Desktop */}
                    <div className="hidden md:block max-w-page mx-auto px-6 relative z-10">

                        {academicYear && (
                            <div className="flex justify-end pt-5">
                                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-soft text-primary text-[11px] font-bold rounded-lg">
                                    <CalendarDays size={13} />
                                    السنة الدراسية: {academicYear}
                                </span>
                            </div>
                        )}

                        <ExecutiveDashboard />
                    </div>

                    {/* Mobile */}
                    <div className="block md:hidden">
                        <MobileDashboardView
                            currentUser={currentUser}
                            stats={stats}
                            todaySessions={todaySessions}
                            monthlyData={monthlyData}
                            lowBalanceStudents={lowBalanceStudents}
                            tasks={tasks}
                            rawStudents={rawStudents}
                            rawSessions={rawSessions}
                            rawStudentInvoices={rawStudentInvoices}
                            onRefresh={fetchDashboardData}
                        />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default Dashboard;
