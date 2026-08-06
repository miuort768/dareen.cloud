import { useState, useEffect, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    RefreshCw, TrendingUp, BarChart3, AlertCircle, Users, Receipt, Wallet,
    CalendarCheck, FileText, Plus, TrendingDown, Activity as ActivityIcon
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSemesterName, useAcademyName } from '../context/AppContext';
import { attendanceService } from '../features/attendance/services/attendanceService';
import { teacherService } from '../features/teachers/services/teacherService';
import { cn } from '../lib/utils';
import { api } from '../lib/api';
import { CURRENCY_SYMBOL } from '@/config/constants';
import { PageLoader } from '../components/ui/PageLoader';
import { Skeleton } from '../shared/components/ui';

import { KpiCard } from './monthly-closing/components/ClosingUI';
import { SalarySlipModal } from './monthly-closing/components/SalarySlipModal';
import { PayrollTable } from './monthly-closing/components/PayrollTable';
import { CollectionsTable } from './monthly-closing/components/CollectionsTable';
import { RenewalsCards } from './monthly-closing/components/RenewalsCards';
import { TeacherPerformance } from './monthly-closing/components/TeacherPerformance';
import { CompensationTable } from './monthly-closing/components/CompensationTable';
import { StrategicSummary } from './monthly-closing/components/StrategicSummary';

const SubjectAnalysis = lazy(() => import('./monthly-closing/components/SubjectAnalysis'));

type TabType = 'payroll' | 'collections' | 'renewals' | 'summary' | 'analysis' | 'teachers' | 'compensation';

const particles = Array.from({ length: 10 }, (_, i) => ({
    id: i, x: Math.random() * 100, y: Math.random() * 100,
    size: Math.random() * 5 + 2, duration: Math.random() * 6 + 4, delay: Math.random() * 3,
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

export const MonthlyClosing = () => {
    const academyName = useAcademyName();
    useEffect(() => { document.title = `الإقفال الشهري | ${academyName}`; }, [academyName]);
    const semesterName = useSemesterName();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState<TabType>('payroll');
    const [fabOpen, setFabOpen] = useState(false);
    const [startDate, setStartDate] = useState(() => {
        const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState(() => {
        const d = new Date(); return new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split('T')[0];
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
        switch (action) { case 'refresh': handleRefresh(); break; case 'summary': setActiveTab('summary'); break; case 'analysis': setActiveTab('analysis'); break; }
    };

    const handleRefresh = () => {
        queryClient.invalidateQueries({ queryKey: ['sessions-closing'] });
        queryClient.invalidateQueries({ queryKey: ['teachers-closing'] });
        queryClient.invalidateQueries({ queryKey: ['students-closing'] });
        queryClient.invalidateQueries({ queryKey: ['student-invoices-closing'] });
    };

    const { data: sessions, isLoading: sessionsLoading } = useQuery({ queryKey: ['sessions-closing'], queryFn: attendanceService.getSessions });
    const { data: teachers, isLoading: teachersLoading } = useQuery({ queryKey: ['teachers-closing'], queryFn: teacherService.getAll });
    const { data: students, isLoading: studentsLoading } = useQuery({ queryKey: ['students-closing'], queryFn: attendanceService.getStudents });
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
        const teacherSessions = filteredSessions.filter(s => s.teacherName?.trim() === teacher.name?.trim() && s.status === 'completed');
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
            if (student.parentPhone) { const msg = `تنبيه تجديد الباقة: يتبقى للطالب ${student.name} في مادة ${enroll.subject} ${remaining} جلسات فقط. يرجى التواصل للتجديد.`; waLink = `https://wa.me/${student.parentPhone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`; }
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
        <div className="min-h-full pb-28 overflow-x-hidden relative" dir="rtl">
            <div className="max-w-page mx-auto px-2">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary-deep to-primary-hover p-6 md:p-8 mb-4">
                    {particles.map(p => (
                        <motion.div key={p.id} className="absolute rounded-full bg-white/10 pointer-events-none"
                            style={{ width: p.size, height: p.size, left: `${p.x}%`, top: `${p.y}%` }}
                            animate={{ y: [0, -20, 0], opacity: [0.2, 0.5, 0.2] }} transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }} />
                    ))}
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-2 rounded-xl bg-white/15 backdrop-blur-sm"><CalendarCheck className="text-white" size={20} /></div>
                                <span className="text-white/70 text-xs font-medium">{semesterName}</span>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">الإقفال الشهري</h1>
                            <p className="text-white/70 text-sm">تقرير مالي وإداري شامل عن الشهر</p>
                        </div>
                        <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                            <div className="text-center">
                                <p className="text-white/60 text-xs mb-1">صافي الربح</p>
                                <p className="text-2xl font-bold text-white tabular-nums">{netProjectedProfit.toLocaleString()} <span className="text-sm text-white/60">{CURRENCY_SYMBOL}</span></p>
                            </div>
                            <div className="w-px h-10 bg-white/10" />
                            <div className="text-center">
                                <p className="text-white/60 text-xs mb-1">الجلسات</p>
                                <p className="text-lg font-bold text-white">{filteredSessions.length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="relative z-10 flex flex-wrap items-center gap-2 mt-4">
                        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-3 py-1.5 border border-white/10">
                            <input aria-label="تاريخ البداية" type="date" className="w-[95px] bg-transparent text-xs font-bold text-white outline-none border-none [color-scheme:var(--color-scheme)] placeholder:text-white/40"
                                value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                            <span className="text-white/50">–</span>
                            <input aria-label="تاريخ النهاية" type="date" className="w-[95px] bg-transparent text-xs font-bold text-white outline-none border-none [color-scheme:var(--color-scheme)] placeholder:text-white/40"
                                value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                        </div>
                        <button onClick={handleRefresh}
                            className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl px-3 py-1.5 text-white/80 hover:text-white text-xs font-bold transition-all border border-white/10">
                            <RefreshCw size={13} /> تحديث
                        </button>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                        <KpiCard title="صافي الربح المتوقع" value={`${netProjectedProfit.toLocaleString()} ${CURRENCY_SYMBOL}`} icon={TrendingUp} accent="primary"
                            subValue={`الإيرادات: ${totalProjectedIncome.toLocaleString()}`} />
                        <KpiCard title="التحصيلات الفعلية" value={`${totalActualCollections.toLocaleString()} ${CURRENCY_SYMBOL}`} icon={Wallet} accent="success"
                            subValue={`صافي التدفق: ${netActualCashFlow.toLocaleString()} ${CURRENCY_SYMBOL}`} />
                        <KpiCard title="رواتب المعلمات" value={`${totalTeacherPayout.toLocaleString()} ${CURRENCY_SYMBOL}`} icon={TrendingDown} accent="error"
                            subValue={`${payrollData.length} معلمة مسجلة`} />
                        <KpiCard title="إجمالي الجلسات" value={filteredSessions.length} icon={ActivityIcon} accent="warning" subValue="كل الجلسات المكتملة" />
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                    <div className="bg-card border border-border/30 rounded-2xl p-1 flex overflow-x-auto no-scrollbar gap-1 shadow-sm mb-4">
                        {TABS.map(tab => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id as TabType)}
                                className={cn("relative flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap", activeTab === tab.id ? "text-on-primary" : "text-muted hover:text-main")}>
                                {activeTab === tab.id && (
                                    <motion.div layoutId="closing-tab-pill" className="absolute inset-0 bg-primary rounded-xl shadow-sm" transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
                                )}
                                <span className="relative z-10 flex items-center gap-1.5"><tab.icon size={14} />{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </motion.div>

                <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
                    {activeTab === 'payroll' && <PayrollTable payrollData={payrollData} teacherAdjustments={teacherAdjustments} handleTeacherAdjustment={handleTeacherAdjustment} setSelectedTeacherForSlip={setSelectedTeacherForSlip} startDate={startDate} endDate={endDate} />}
                    {activeTab === 'collections' && <CollectionsTable studentInvoices={studentInvoices} startDate={startDate} endDate={endDate} />}
                    {activeTab === 'renewals' && <RenewalsCards renewalsData={renewalsData} />}
                    {activeTab === 'analysis' && (
                        <Suspense fallback={<Skeleton className="h-64 rounded-2xl" />}>
                            <SubjectAnalysis subjectAnalysis={subjectAnalysis} reportCurrency={CURRENCY_SYMBOL} />
                        </Suspense>
                    )}
                    {activeTab === 'teachers' && <TeacherPerformance teacherPerformance={teacherPerformance} />}
                    {activeTab === 'compensation' && <CompensationTable filteredSessions={filteredSessions} />}
                    {activeTab === 'summary' && <StrategicSummary netProjectedProfit={netProjectedProfit} totalProjectedIncome={totalProjectedIncome} totalActualCollections={totalActualCollections} totalTeacherPayout={totalTeacherPayout} reportCurrency={CURRENCY_SYMBOL} />}
                </motion.div>

                {selectedTeacherForSlip && <SalarySlipModal teacher={selectedTeacherForSlip} month={`${startDate} / ${endDate}`} onClose={() => setSelectedTeacherForSlip(null)} />}
            </div>

            <div className="fixed bottom-6 end-6 z-50 flex flex-col items-end gap-3">
                <AnimatePresence>
                    {fabOpen && ([
                        { icon: RefreshCw, label: 'تحديث البيانات', action: 'refresh' as const },
                        { icon: FileText, label: 'تقرير شامل', action: 'summary' as const },
                        { icon: TrendingUp, label: 'تحليل الأداء', action: 'analysis' as const },
                    ]).map((item, i) => (
                        <motion.div key={item.label} initial={{ opacity: 0, scale: 0.3, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.3, y: 20 }} transition={{ delay: 0.05 * i }} className="flex items-center gap-2">
                            <span className="bg-card border border-border text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm whitespace-nowrap">{item.label}</span>
                            <button onClick={() => handleFabAction(item.action)}
                                className="w-10 h-10 rounded-full bg-primary text-on-primary shadow-lg hover:shadow-xl hover:bg-primary-hover transition-all flex items-center justify-center">
                                <item.icon size={18} />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
                <motion.button onClick={() => setFabOpen(!fabOpen)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    className={cn("w-12 h-12 rounded-full shadow-xl text-on-primary flex items-center justify-center transition-all", fabOpen ? "bg-error rotate-45" : "bg-primary")}>
                    <CalendarCheck size={22} />
                </motion.button>
            </div>
        </div>
    );
};

export default MonthlyClosing;
