import { useEffect, useMemo, useState, lazy, Suspense } from 'react';
import { Award, CheckCircle2, DollarSign, Target, LayoutDashboard, Users, TrendingUp, Calendar, BarChart3, Plus, FileText, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from '../shared/components/ui';
import { useReports } from '../features/reports/hooks/useReports';
import { ReportsHeader } from '../features/reports/components/ReportsHeader';
import { FinancialReport } from '../features/reports/components/FinancialReport';
import type { ReportType } from '../features/reports/types';
import { CURRENCY_SYMBOL } from '@/config/constants';
import { useAcademyName } from '../context/AppContext';
import { cn } from '../lib/utils';

const AcademicReport = lazy(() => import('../features/reports/components/AcademicReport'));
const AttendanceReport = lazy(() => import('../features/reports/components/AttendanceReport'));

const particles = Array.from({ length: 8 }, (_, i) => ({
    id: i, x: Math.random() * 100, y: Math.random() * 100,
    size: Math.random() * 5 + 2, duration: Math.random() * 6 + 4, delay: Math.random() * 3,
}));

export const Reports = () => {
    const academyName = useAcademyName();
    useEffect(() => { document.title = `التقارير | ${academyName}`; }, [academyName]);
    const { state, actions, filtered } = useReports();

    const [fabOpen, setFabOpen] = useState(false);

    const tabs = [
        { id: 'overview', label: 'نظرة عامة', icon: LayoutDashboard },
        { id: 'academic', label: 'الأكاديمي', icon: Award },
        { id: 'attendance', label: 'الحضور والغياب', icon: CheckCircle2 },
        { id: 'financial', label: 'المالي', icon: DollarSign },
        { id: 'enrollment', label: 'التسجيلات', icon: Target },
    ];

    const uniqueSubjects = new Set(state.subjectPieData.map(s => s.name)).size;

    const tabVariants: Record<string, { bg: string; iconBg: string; text: string }> = {
        academic: { bg: 'bg-primary-soft', iconBg: 'bg-primary-light', text: 'text-primary' },
        attendance: { bg: 'bg-success-soft', iconBg: 'bg-success-light', text: 'text-success' },
        financial: { bg: 'bg-warning-soft', iconBg: 'bg-warning-light', text: 'text-warning' },
        enrollment: { bg: 'bg-error-soft', iconBg: 'bg-error-light', text: 'text-error' },
    };

    const kpiCards = useMemo(() => [
        { label: 'الطلاب', value: state.totalStudents, icon: Users, gradient: 'from-primary/20 to-primary/5', iconBg: 'bg-primary/10 text-primary', accent: 'bg-primary' },
        { label: 'الاشتراكات', value: state.totalEnrollments, icon: Target, gradient: 'from-success/20 to-success/5', iconBg: 'bg-success/10 text-success', accent: 'bg-success' },
        { label: 'الإيرادات', value: Math.round(state.totalRevenue / 1000) + 'k', icon: DollarSign, gradient: 'from-warning/20 to-warning/5', iconBg: 'bg-warning/10 text-warning', accent: 'bg-warning' },
        { label: 'الحضور', value: state.attendanceRate + '%', icon: TrendingUp, gradient: 'from-info/20 to-info/5', iconBg: 'bg-info/10 text-info', accent: 'bg-info' },
    ], [state]);

    const fabActions = useMemo(() => [
        { icon: FileText, label: 'تقرير أكاديمي', onClick: () => actions.setActiveReport('academic') },
        { icon: CheckCircle2, label: 'تقرير الحضور', onClick: () => actions.setActiveReport('attendance') },
        { icon: DollarSign, label: 'تقرير مالي', onClick: () => actions.setActiveReport('financial') },
    ], [actions]);

    if (state.loading) {
        return (
            <div className="space-y-6 p-4 md:p-6">
                <Skeleton className="h-20" />
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => <Skeleton key={`skel-${i}`} className="h-24" />)}
                </div>
                <Skeleton className="h-16" />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Skeleton className="h-80" />
                    <Skeleton className="h-80" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-full pb-24 overflow-x-hidden relative" dir="rtl">
            <div className="max-w-page mx-auto px-2 space-y-4">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary-deep to-primary-hover p-6 md:p-8">
                    {particles.map(p => (
                        <motion.div key={p.id} className="absolute rounded-full bg-white/10 pointer-events-none"
                            style={{ width: p.size, height: p.size, left: `${p.x}%`, top: `${p.y}%` }}
                            animate={{ y: [0, -20, 0], opacity: [0.2, 0.5, 0.2] }} transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }} />
                    ))}
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-2 rounded-xl bg-white/15 backdrop-blur-sm"><BarChart3 className="text-white" size={20} /></div>
                                <span className="text-white/70 text-xs font-medium">التقارير</span>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">التقارير والإحصائيات</h1>
                            <p className="text-white/70 text-sm">تحليل الأداء الأكاديمي والمالي</p>
                        </div>
                        <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                            <div className="text-center">
                                <p className="text-white/60 text-xs mb-1">معدل الإنجاز</p>
                                <p className="text-2xl font-bold text-white">{state.attendanceRate}%</p>
                            </div>
                            <div className="w-px h-10 bg-white/10" />
                            <div className="text-center">
                                <p className="text-white/60 text-xs mb-1">النمو الشهري</p>
                                <p className="text-2xl font-bold text-white">+{Math.round((state.monthRevenue / (state.totalRevenue || 1)) * 100)}%</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {kpiCards.map((kpi, i) => {
                            const Icon = kpi.icon;
                            return (
                                <motion.div key={kpi.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 + i * 0.06 }}
                                    whileHover={{ scale: 1.02, y: -2 }} className={cn("relative overflow-hidden rounded-xl bg-gradient-to-br border border-border/50 p-4", kpi.gradient)}>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className={cn("p-2 rounded-lg", kpi.iconBg)}><Icon size={16} /></div>
                                        <div className={cn("h-1 w-12 rounded-full", kpi.accent)} />
                                    </div>
                                    <p className="text-xs text-muted mb-1">{kpi.label}</p>
                                    <p className="text-2xl font-bold text-main">{kpi.value}</p>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>

                <ReportsHeader onExport={() => window.print()} />

                <div className="no-print bg-surface border border-border rounded-2xl p-1 flex overflow-x-auto no-scrollbar gap-1">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = state.activeReport === tab.id;
                        return (
                            <button key={tab.id} onClick={() => actions.setActiveReport(tab.id as ReportType)}
                                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-bold transition-all whitespace-nowrap ${isActive ? 'bg-primary text-on-primary' : 'text-muted hover:text-main'}`}>
                                <Icon size={14} /> {tab.label}
                            </button>
                        );
                    })}
                </div>

                <div className="px-0 transition-all duration-300 animate-in fade-in slide-in-from-bottom-2">
                    {state.activeReport === 'overview' && (
                        <div className="space-y-4">
                            <div className="bg-card rounded-2xl border border-border p-4">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-primary-soft">
                                                <BarChart3 size={16} className="text-primary" />
                                            </div>
                                            <h2 className="text-base font-bold text-main">ملخص الأداء العام</h2>
                                        </div>
                                        <p className="text-xs font-bold text-muted leading-relaxed max-w-md">
                                            تقرير شامل يوضح الحالة الأكاديمية والمالية للمؤسسة. تم تحليل {state.totalEnrollments} اشتراك نشط عبر {uniqueSubjects} مادة مختلفة.
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4 p-4 rounded-xl border bg-surface border-border">
                                        <div><p className="text-xs font-bold text-primary">معدل الإنجاز</p><p className="text-2xl font-bold font-mono leading-none mt-1 text-main">{state.attendanceRate}%</p></div>
                                        <div className="w-px h-10 bg-border" />
                                        <div><p className="text-xs font-bold text-success">النمو الشهري</p><p className="text-2xl font-bold font-mono leading-none mt-1 text-main">+{Math.round((state.monthRevenue / (state.totalRevenue || 1)) * 100)}%</p></div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {tabs.filter(t => t.id !== 'overview').map((tab) => {
                                    const Icon = tab.icon;
                                    const v = tabVariants[tab.id] || tabVariants.academic;
                                    return (
                                        <button key={tab.id} onClick={() => actions.setActiveReport(tab.id as ReportType)}
                                            className={`border-0 p-4 transition-all group rounded-xl hover:shadow-md active:scale-95 ${v.bg}`}>
                                            <div className="flex flex-col items-center text-center">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform ${v.iconBg}`}>
                                                    <Icon size={18} className={v.text} />
                                                </div>
                                                <p className={`text-xs font-bold ${v.text}`}>{tab.label}</p>
                                                <p className={`text-micro font-bold mt-1 ${v.text} opacity-60`}>انتقال سريع</p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {[
                                    { label: 'الطلاب', value: state.totalStudents, icon: Users, textClass: 'text-chart-1', bgClass: 'bg-chart-1/10' },
                                    { label: 'الاشتراكات', value: state.totalEnrollments, icon: Target, textClass: 'text-chart-1', bgClass: 'bg-chart-1/10' },
                                    { label: 'المواد', value: uniqueSubjects, icon: Award, textClass: 'text-chart-4', bgClass: 'bg-chart-4/10' },
                                    { label: 'الحصص', value: state.totalSessions, icon: Calendar, textClass: 'text-chart-2', bgClass: 'bg-chart-2/10' },
                                    { label: 'المكتملة', value: state.completedSessions, icon: CheckCircle2, textClass: 'text-chart-6', bgClass: 'bg-chart-6/10' },
                                    { label: 'الإيرادات', value: Math.round(state.totalRevenue / 1000) + 'k', icon: DollarSign, textClass: 'text-chart-5', bgClass: 'bg-chart-5/10' },
                                    { label: 'النمو', value: state.attendanceRate + '%', icon: TrendingUp, textClass: 'text-chart-3', bgClass: 'bg-chart-3/10' },
                                    { label: 'النشطة', value: state.totalEnrollments, icon: Target, textClass: 'text-muted', bgClass: 'bg-muted/10' }
                                ].map((stat, i) => (
                                    <div key={`stat-${i}`} className="bg-card border border-border rounded-xl p-3 flex flex-col justify-between aspect-square">
                                        <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${stat.bgClass}`}>
                                            <stat.icon size={14} className={stat.textClass} />
                                        </div>
                                        <div className="mt-auto">
                                            <p className={`text-sm font-bold font-mono leading-none ${stat.textClass}`}>{stat.value}</p>
                                            <p className="text-[10px] font-bold mt-1 truncate text-muted">{stat.label}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-card border border-border rounded-2xl p-4">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-xl flex items-center justify-center bg-primary-soft">
                                            <BarChart3 size={14} className="text-primary" />
                                        </div>
                                        <h3 className="text-micro font-bold text-muted">توزيع الاشتراكات حسب المادة</h3>
                                    </div>
                                    <span className="text-micro font-bold px-2 py-0.5 rounded-lg bg-success-soft text-success-dark">تحليل مباشر</span>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                                    {state.subjectPieData.slice(0, 6).map((s, i) => {
                                        const chartColorClasses = [
                                            { text: 'text-chart-1', bg: 'bg-chart-1', var: 'var(--chart-1)' },
                                            { text: 'text-chart-2', bg: 'bg-chart-2', var: 'var(--chart-2)' },
                                            { text: 'text-chart-4', bg: 'bg-chart-4', var: 'var(--chart-4)' },
                                            { text: 'text-chart-5', bg: 'bg-chart-5', var: 'var(--chart-5)' },
                                            { text: 'text-chart-3', bg: 'bg-chart-3', var: 'var(--chart-3)' },
                                            { text: 'text-chart-1', bg: 'bg-chart-1', var: 'var(--chart-1)' },
                                        ];
                                        const cc = chartColorClasses[i];
                                        const pct = state.totalEnrollments > 0 ? Math.round((s.value / state.totalEnrollments) * 100) : 0;
                                        return (
                                            <div key={`report-${i}`} className="flex flex-col gap-2 p-3 rounded-card border transition-all bg-card" style={{ borderColor: `color-mix(in srgb, ${cc.var} 25%, transparent)` }}>
                                                <div className="flex items-center justify-between">
                                                    <div className={`w-2.5 h-2.5 rounded-sm ${cc.bg}`} />
                                                    <p className={`text-micro font-bold font-mono ${cc.text}`}>{pct}%</p>
                                                </div>
                                                <p className="text-micro font-bold text-muted truncate">{s.name}</p>
                                                <div className="w-full h-1.5 rounded-xl overflow-hidden bg-surface">
                                                    <div className={`h-full rounded-xl transition-all ${cc.bg}`} style={{ width: `${pct}%` }} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {state.activeReport === 'academic' && (
                        <Suspense fallback={<Skeleton className="h-64 rounded-2xl" />}>
                            <AcademicReport gradeBarData={state.gradeBarData} subjectPieData={state.subjectPieData}
                                totalEnrollments={state.totalEnrollments} totalStudents={state.totalStudents}
                                uniqueSubjects={uniqueSubjects} filteredStudentProgress={filtered.studentProgress}
                                studentProgressTotal={state.studentProgressData.length} searchTerm={state.searchTerm} setSearchTerm={actions.setSearchTerm} />
                        </Suspense>
                    )}

                    {state.activeReport === 'attendance' && (
                        <Suspense fallback={<Skeleton className="h-64 rounded-2xl" />}>
                            <AttendanceReport monthlySessionsData={state.monthlySessionsData} teacherPerformanceData={state.teacherPerformanceData} />
                        </Suspense>
                    )}

                    {state.activeReport === 'financial' && (
                        <FinancialReport totalRevenue={state.totalRevenue} monthRevenue={state.monthRevenue}
                            totalExpenses={state.totalExpenses} monthExpenses={state.monthExpenses}
                            completedSessions={state.completedSessions} reportCurrency={CURRENCY_SYMBOL} />
                    )}

                    {state.activeReport === 'enrollment' && (
                        <Suspense fallback={<Skeleton className="h-64 rounded-2xl" />}>
                            <AcademicReport gradeBarData={state.gradeBarData} subjectPieData={state.subjectPieData}
                                totalEnrollments={state.totalEnrollments} totalStudents={state.totalStudents}
                                uniqueSubjects={uniqueSubjects} filteredStudentProgress={filtered.studentProgress}
                                studentProgressTotal={state.studentProgressData.length} searchTerm={state.searchTerm} setSearchTerm={actions.setSearchTerm} />
                        </Suspense>
                    )}
                </div>
            </div>

            <div className="fixed bottom-6 end-6 z-50 flex flex-col items-end gap-3">
                <AnimatePresence>
                    {fabOpen && fabActions.map((action, i) => (
                        <motion.div key={action.label} initial={{ opacity: 0, scale: 0.3, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.3, y: 20 }} transition={{ delay: 0.05 * (fabActions.length - 1 - i) }} className="flex items-center gap-2">
                            <span className="bg-card border border-border text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm whitespace-nowrap">{action.label}</span>
                            <button onClick={() => { action.onClick(); setFabOpen(false); }}
                                className="w-10 h-10 rounded-full bg-primary text-white shadow-lg hover:shadow-xl hover:bg-primary-hover transition-all flex items-center justify-center">
                                <action.icon size={18} />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
                <motion.button onClick={() => setFabOpen(!fabOpen)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    className={cn("w-12 h-12 rounded-full shadow-xl text-white flex items-center justify-center transition-all", fabOpen ? "bg-error rotate-45" : "bg-primary")}>
                    <Plus size={24} />
                </motion.button>
            </div>
        </div>
    );
};



