import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    RefreshCw, TrendingUp, BarChart3, AlertCircle, Users, Receipt, Wallet,
    CalendarCheck, FileText, Plus, TrendingDown, Activity as ActivityIcon
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSemesterName } from '../context/AppContext';
import { attendanceService } from '../features/attendance/services/attendanceService';
import { teacherService } from '../features/teachers/services/teacherService';
import { cn } from '../lib/utils';
import { api } from '../lib/api';
import { PageLoader } from '../components/ui/PageLoader';

import { KpiCard } from './monthly-closing/components/ClosingUI';
import { SalarySlipModal } from './monthly-closing/components/SalarySlipModal';
import { PayrollTable } from './monthly-closing/components/PayrollTable';
import { CollectionsTable } from './monthly-closing/components/CollectionsTable';
import { RenewalsCards } from './monthly-closing/components/RenewalsCards';
import { SubjectAnalysis } from './monthly-closing/components/SubjectAnalysis';
import { TeacherPerformance } from './monthly-closing/components/TeacherPerformance';
import { CompensationTable } from './monthly-closing/components/CompensationTable';
import { StrategicSummary } from './monthly-closing/components/StrategicSummary';

type TabType = 'payroll' | 'collections' | 'renewals' | 'summary' | 'analysis' | 'teachers' | 'compensation';

const PARTICLES = Array.from({ length: 10 }, (_, i) => ({
    id: i, x: Math.random() * 100, y: Math.random() * 100,
    size: 6 + Math.random() * 18, delay: Math.random() * 4,
    duration: 5 + Math.random() * 7,
}));

const TABS = [
    { id: 'payroll', label: 'الرواتب', icon: Receipt },
    { id: 'collections', label: 'التحصيلات', icon: Wallet },
    { id: 'renewals', label: 'التجديدات', icon: AlertCircle },
    { id: 'analysis', label: 'تحليل المواد', icon: BarChart3 },
    { id: 'teachers', label: 'أداء المعلمات', icon: Users },
    { id: 'compensation', label: 'التعويضات', icon: RefreshCw },
    { id: 'summary', label: 'الملخص', icon: TrendingUp },
] as const;

const FAB_ACTIONS = [
    { icon: RefreshCw, label: 'تحديث البيانات', action: 'refresh' as const, gradient: 'from-primary to-purple-400' },
    { icon: FileText, label: 'تقرير شامل', action: 'summary' as const, gradient: 'from-success to-emerald-400' },
    { icon: TrendingUp, label: 'تحليل الأداء', action: 'analysis' as const, gradient: 'from-info to-blue-400' },
];

export const MonthlyClosing = () => {
    useEffect(() => { document.title = 'الإقفال الشهري | دارين'; }, []);
    const semesterName = useSemesterName();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState<TabType>('payroll');
    const [fabOpen, setFabOpen] = useState(false);
    const [startDate, setStartDate] = useState(() => {
        const d = new Date();
        return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState(() => {
        const d = new Date();
        return new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split('T')[0];
    });

    const [selectedTeacherForSlip, setSelectedTeacherForSlip] = useState<{
        name: string; subject: string; sessionsCount: number; totalAmount: number;
        sessionsList?: { date: string; studentName: string; teacherPrice?: number }[];
        price?: number;
    } | null>(null);
    const [teacherAdjustments, setTeacherAdjustments] = useState<Record<string, number>>({});

    const handleTeacherAdjustment = (teacherId: string, amount: number) => {
        setTeacherAdjustments(prev => ({ ...prev, [teacherId]: amount }));
    };

    const handleFabAction = (action: string) => {
        setFabOpen(false);
        switch (action) {
            case 'refresh': handleRefresh(); break;
            case 'summary': setActiveTab('summary'); break;
            case 'analysis': setActiveTab('analysis'); break;
        }
    };

    const handleRefresh = () => {
        queryClient.invalidateQueries({ queryKey: ['sessions-closing'] });
        queryClient.invalidateQueries({ queryKey: ['teachers-closing'] });
        queryClient.invalidateQueries({ queryKey: ['students-closing'] });
        queryClient.invalidateQueries({ queryKey: ['student-invoices-closing'] });
    };

    const { data: sessions, isLoading: sessionsLoading } = useQuery({
        queryKey: ['sessions-closing'], queryFn: attendanceService.getSessions
    });
    const { data: teachers, isLoading: teachersLoading } = useQuery({
        queryKey: ['teachers-closing'], queryFn: teacherService.getAll
    });
    const { data: students, isLoading: studentsLoading } = useQuery({
        queryKey: ['students-closing'], queryFn: attendanceService.getStudents
    });
    const { data: studentInvoices, isLoading: invoicesLoading } = useQuery({
        queryKey: ['student-invoices-closing'],
        queryFn: async () => {
            const resp = await api.get<{ id: string; studentName: string; amount: number; date: string; status: string }[]>('/studentInvoices');
            return Array.isArray(resp) ? resp : (resp as { data?: { id: string; studentName: string; amount: number; date: string; status: string }[] }).data || [];
        }
    });

    const isLoading = sessionsLoading || teachersLoading || studentsLoading || invoicesLoading;
    const filteredSessions = sessions?.filter(s => s.date >= startDate && s.date <= endDate) || [];

    const payrollData = teachers?.map(teacher => {
        const teacherSessions = filteredSessions.filter(s =>
            s.teacherName?.trim() === teacher.name?.trim() && s.status === 'completed'
        );
        const baseAmount = teacherSessions.reduce((acc, curr) => acc + (curr.teacherPrice || teacher.price || 0), 0);
        const adjustment = teacherAdjustments[teacher.id] || 0;
        return { ...teacher, sessionsCount: teacherSessions.length, baseAmount, adjustment, totalAmount: baseAmount + adjustment, sessionsList: teacherSessions };
    }).sort((a, b) => b.totalAmount - a.totalAmount) || [];

    const subjectsList = Array.from(new Set(filteredSessions.map(s => s.subject))).filter(Boolean);
    const subjectAnalysis = subjectsList.map(subj => {
        const subjectSessions = filteredSessions.filter(s => s.subject === subj && s.status === 'completed');
        const income = subjectSessions.reduce((acc, curr) => acc + (curr.price || 0), 0);
        const payout = subjectSessions.reduce((acc, curr) => acc + (curr.teacherPrice || 0), 0);
        return { name: subj, income, payout, profit: income - payout, sessionsCount: subjectSessions.length };
    }).sort((a, b) => b.profit - a.profit);

    const teacherPerformance = teachers?.map(teacher => {
        const teacherMonthSessions = filteredSessions.filter(s => s.teacherName?.trim() === teacher.name?.trim());
        const completed = teacherMonthSessions.filter(s => s.status === 'completed').length;
        const total = teacherMonthSessions.length;
        const documented = teacherMonthSessions.filter(s => s.status === 'completed' && (s.topics || s.homework)).length;
        return { name: teacher.name, total, completed, documented, attendanceRate: total > 0 ? (completed / total) * 100 : 0, documentationRate: completed > 0 ? (documented / completed) * 100 : 0 };
    }).sort((a, b) => b.attendanceRate - a.attendanceRate) || [];

    const renewalsData = students?.flatMap(student =>
        (student.enrollments || []).map(enroll => {
            const remaining = enroll.sessionsTotal - enroll.sessionsUsed;
            const isLow = remaining <= 2;
            let waLink = '';
            if (student.parentPhone) {
                const msg = `تنبيه تجديد الباقة: يتبقى للطالب ${student.name} في مادة ${enroll.subject} ${remaining} جلسات فقط. يرجى التواصل للتجديد.`;
                waLink = `https://wa.me/${student.parentPhone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`;
            }
            return { studentName: student.name, phone: student.parentPhone || '', subject: enroll.subject, remaining, total: enroll.sessionsTotal, isLow, waLink };
        })
    ).filter(item => item.isLow).sort((a, b) => a.remaining - b.remaining) || [];

    const totalProjectedIncome = filteredSessions.reduce((acc, curr) => acc + (curr.price || 0), 0);
    const totalActualCollections = (studentInvoices || [])
        .filter((inv: { date: string; status: string }) => inv.date >= startDate && inv.date <= endDate && inv.status === 'paid')
        .reduce((acc: number, curr: { amount: number }) => acc + curr.amount, 0);
    const totalTeacherPayout = payrollData.reduce((acc, curr) => acc + curr.totalAmount, 0);
    const netProjectedProfit = totalProjectedIncome - totalTeacherPayout;
    const netActualCashFlow = totalActualCollections - totalTeacherPayout;

    if (isLoading) return <PageLoader />;

    return (
        <div className="min-h-full pb-28 overflow-x-hidden relative font-sans bg-surface" dir="rtl">
            {/* ── Hero ── */}
            <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-primary/[6%] to-background border-b border-border/60">
                <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
                    {PARTICLES.map(p => (
                        <motion.div key={p.id}
                            className="absolute rounded-full bg-primary/30"
                            style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
                            animate={{ y: [0, -30, 0], opacity: [0.15, 0.5, 0.15] }}
                            transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }}
                        />
                    ))}
                </div>
                <div className="relative z-10 max-w-page mx-auto px-2 pt-4 pb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-primary text-on-primary flex items-center justify-center shadow-sm">
                                <CalendarCheck size={16} />
                            </div>
                            <div>
                                <h1 className="text-sm font-bold text-main">التقرير الشهري</h1>
                                <p className="text-[8px] text-muted">{semesterName}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="flex items-center gap-1 bg-card border border-border/60 rounded-xl px-2.5 py-1.5">
                                <input type="date"
                                    className="w-[90px] bg-transparent text-[9px] font-bold text-main outline-none border-none [color-scheme:var(--color-scheme)]"
                                    value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                                <span className="text-[8px] text-muted">–</span>
                                <input type="date"
                                    className="w-[90px] bg-transparent text-[9px] font-bold text-main outline-none border-none [color-scheme:var(--color-scheme)]"
                                    value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                            </div>
                            <button onClick={handleRefresh}
                                className="w-8 h-8 flex items-center justify-center bg-card border border-border/60 rounded-xl text-muted hover:text-main transition-all" aria-label="تحديث">
                                <RefreshCw size={13} />
                            </button>
                        </div>
                    </div>
                    {/* Hero total */}
                    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                        className="text-center py-4">
                        <p className="text-[9px] font-bold text-muted mb-1">صافي الربح المتوقع</p>
                        <motion.p
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 12 }}
                            className="text-3xl font-bold text-main tabular-nums tracking-tight"
                        >
                            {netProjectedProfit.toLocaleString()}
                            <span className="text-sm text-muted font-bold me-1">KWD</span>
                        </motion.p>
                        <div className="flex items-center justify-center gap-3 mt-2">
                            <div className="flex items-center gap-1">
                                <TrendingUp size={10} className="text-success" />
                                <span className="text-[8px] font-bold text-muted">الإيرادات: <span className="text-main">{(totalProjectedIncome || 0).toLocaleString()}</span></span>
                            </div>
                            <div className="w-px h-3 bg-border/60" />
                            <div className="flex items-center gap-1">
                                <TrendingDown size={10} className="text-error/70" />
                                <span className="text-[8px] font-bold text-muted">الرواتب: <span className="text-main">{(totalTeacherPayout || 0).toLocaleString()}</span></span>
                            </div>
                        </div>
                    </motion.div>
                    {/* Quick insight chips */}
                    <div className="flex flex-wrap items-center justify-center gap-1.5 mt-2">
                        <div className="flex items-center gap-1 px-2 py-1 bg-card rounded-lg border border-border/40 text-[7px] font-bold">
                            <Wallet size={9} className="text-success" /> التحصيلات: <span className="text-main">{(totalActualCollections || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1 px-2 py-1 bg-card rounded-lg border border-border/40 text-[7px] font-bold">
                            <AlertCircle size={9} className="text-warning" /> تجديدات: <span className="text-main">{renewalsData.length}</span>
                        </div>
                        <div className="flex items-center gap-1 px-2 py-1 bg-card rounded-lg border border-border/40 text-[7px] font-bold">
                            <ActivityIcon size={9} className="text-primary" /> الجلسات: <span className="text-main">{filteredSessions.length}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Main Content ── */}
            <div className="relative z-10 max-w-page mx-auto px-2 -mt-2 space-y-3 pb-16">
                {/* KPI Cards */}
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                    className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
                    <KpiCard title="صافي الربح المتوقع" value={netProjectedProfit.toLocaleString()} icon={TrendingUp}
                        accent="primary" subValue={`${totalProjectedIncome > 0 ? ((netProjectedProfit / totalProjectedIncome) * 100).toFixed(0) : 0}% هامش ربح`} />
                    <KpiCard title="التحصيلات الفعلية" value={totalActualCollections.toLocaleString()} icon={Wallet}
                        accent="success" subValue={`صافي التدفق: ${netActualCashFlow.toLocaleString()}`} />
                    <KpiCard title="رواتب المعلمات" value={totalTeacherPayout.toLocaleString()} icon={TrendingDown}
                        accent="error" subValue={`${payrollData.length} معلمة مسجلة`} />
                    <KpiCard title="إجمالي الجلسات" value={filteredSessions.length} icon={ActivityIcon}
                        accent="warning" subValue="كل الجلسات المكتملة" />
                </motion.div>

                {/* Tabs */}
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <div className="bg-card border border-border/60 rounded-2xl p-1 flex overflow-x-auto no-scrollbar gap-1 shadow-sm">
                        {TABS.map(tab => (
                            <button key={tab.id}
                                onClick={() => setActiveTab(tab.id as TabType)}
                                className={cn(
                                    "relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-[9px] font-bold transition-all whitespace-nowrap",
                                    activeTab === tab.id ? "text-on-primary" : "text-muted hover:text-main"
                                )}
                            >
                                {activeTab === tab.id && (
                                    <motion.div layoutId="closing-tab-pill"
                                        className="absolute inset-0 bg-primary rounded-xl shadow-sm"
                                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                    />
                                )}
                                <span className="relative z-10 flex items-center gap-1.5">
                                    <tab.icon size={13} />
                                    {tab.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* Tab Content */}
                <motion.div key={activeTab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
                    {activeTab === 'payroll' && (
                        <PayrollTable payrollData={payrollData} teacherAdjustments={teacherAdjustments}
                            handleTeacherAdjustment={handleTeacherAdjustment}
                            setSelectedTeacherForSlip={setSelectedTeacherForSlip}
                            startDate={startDate} endDate={endDate} />
                    )}
                    {activeTab === 'collections' && (
                        <CollectionsTable studentInvoices={studentInvoices} startDate={startDate} endDate={endDate} />
                    )}
                    {activeTab === 'renewals' && <RenewalsCards renewalsData={renewalsData} />}
                    {activeTab === 'analysis' && <SubjectAnalysis subjectAnalysis={subjectAnalysis} reportCurrency="KWD" />}
                    {activeTab === 'teachers' && <TeacherPerformance teacherPerformance={teacherPerformance} />}
                    {activeTab === 'compensation' && <CompensationTable filteredSessions={filteredSessions} />}
                    {activeTab === 'summary' && (
                        <StrategicSummary netProjectedProfit={netProjectedProfit} totalProjectedIncome={totalProjectedIncome}
                            totalActualCollections={totalActualCollections} totalTeacherPayout={totalTeacherPayout} reportCurrency="KWD" />
                    )}
                </motion.div>

                {selectedTeacherForSlip && (
                    <SalarySlipModal teacher={selectedTeacherForSlip} month={`${startDate} / ${endDate}`}
                        onClose={() => setSelectedTeacherForSlip(null)} />
                )}
            </div>

            {/* ── FAB ── */}
            <div className="fixed bottom-6 start-6 z-50 flex flex-col items-center gap-2">
                <AnimatePresence>
                    {fabOpen && FAB_ACTIONS.map((item, i) => (
                        <motion.button key={item.label}
                            initial={{ opacity: 0, y: 20, scale: 0.8 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.8 }}
                            transition={{ delay: i * 0.05 }}
                            onClick={() => handleFabAction(item.action)}
                            className="flex items-center gap-2 px-3 py-2 bg-card border border-border/60 shadow-elevation-2 rounded-xl hover:shadow-elevation-3 transition-all active:scale-95 group"
                        >
                            <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${item.gradient} flex items-center justify-center text-white text-[10px]`}>
                                <item.icon size={12} />
                            </div>
                            <span className="text-[8px] font-bold text-main whitespace-nowrap">{item.label}</span>
                        </motion.button>
                    ))}
                </AnimatePresence>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setFabOpen(!fabOpen)}
                    className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary to-purple-400 text-white shadow-elevation-2 hover:shadow-elevation-3 flex items-center justify-center transition-all"
                >
                    <motion.div animate={{ rotate: fabOpen ? 45 : 0 }} transition={{ duration: 0.2 }}>
                        <Plus size={18} />
                    </motion.div>
                </motion.button>
            </div>
        </div>
    );
};

export default MonthlyClosing;