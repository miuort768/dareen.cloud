import { useState } from 'react';
import {
    RefreshCw,
    ArrowDownRight,
    TrendingUp, BarChart3, AlertCircle, Users, Receipt, Wallet, Activity as ActivityIcon
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSemesterName } from '../context/AppContext';
import { attendanceService } from '../features/attendance/services/attendanceService';
import { teacherService } from '../features/teachers/services/teacherService';
import { cn } from '../lib/utils';
import { api } from '../lib/api';
import { PageLoader } from '../components/ui/PageLoader';

import { StatItem } from './monthly-closing/components/ClosingUI';
import { SalarySlipModal } from './monthly-closing/components/SalarySlipModal';
import { PayrollTable } from './monthly-closing/components/PayrollTable';
import { CollectionsTable } from './monthly-closing/components/CollectionsTable';
import { RenewalsCards } from './monthly-closing/components/RenewalsCards';
import { SubjectAnalysis } from './monthly-closing/components/SubjectAnalysis';
import { TeacherPerformance } from './monthly-closing/components/TeacherPerformance';
import { CompensationTable } from './monthly-closing/components/CompensationTable';
import { StrategicSummary } from './monthly-closing/components/StrategicSummary';

type TabType = 'payroll' | 'collections' | 'renewals' | 'summary' | 'analysis' | 'teachers' | 'compensation';

export const MonthlyClosing = () => {
    const semesterName = useSemesterName();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState<TabType>('payroll');
    const [startDate, setStartDate] = useState(() => {
        const d = new Date();
        return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState(() => {
        const d = new Date();
        return new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split('T')[0];
    });

    const [selectedTeacherForSlip, setSelectedTeacherForSlip] = useState<{
        name: string;
        subject: string;
        sessionsCount: number;
        totalAmount: number;
        sessionsList?: { date: string; studentName: string; teacherPrice?: number }[];
        price?: number;
    } | null>(null);
    const [teacherAdjustments, setTeacherAdjustments] = useState<Record<string, number>>({});

    const handleTeacherAdjustment = (teacherId: string, amount: number) => {
        setTeacherAdjustments(prev => ({ ...prev, [teacherId]: amount }));
    };

    const handleRefresh = () => {
        queryClient.invalidateQueries({ queryKey: ['sessions-closing'] });
        queryClient.invalidateQueries({ queryKey: ['teachers-closing'] });
        queryClient.invalidateQueries({ queryKey: ['students-closing'] });
        queryClient.invalidateQueries({ queryKey: ['student-invoices-closing'] });
    };

    const { data: sessions, isLoading: sessionsLoading } = useQuery({
        queryKey: ['sessions-closing'],
        queryFn: attendanceService.getSessions
    });

    const { data: teachers, isLoading: teachersLoading } = useQuery({
        queryKey: ['teachers-closing'],
        queryFn: teacherService.getAll
    });

    const { data: students, isLoading: studentsLoading } = useQuery({
        queryKey: ['students-closing'],
        queryFn: attendanceService.getStudents
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
            s.teacherName?.trim() === teacher.name?.trim() &&
            s.status === 'completed'
        );
        const baseAmount = teacherSessions.reduce((acc, curr) => acc + (curr.teacherPrice || teacher.price || 0), 0);
        const adjustment = teacherAdjustments[teacher.id] || 0;
        const totalAmount = baseAmount + adjustment;
        return {
            ...teacher,
            sessionsCount: teacherSessions.length,
            baseAmount,
            adjustment,
            totalAmount,
            sessionsList: teacherSessions
        };
    }).sort((a, b) => b.totalAmount - a.totalAmount) || [];

    const subjectsList = Array.from(new Set(filteredSessions.map(s => s.subject))).filter(Boolean);
    const subjectAnalysis = subjectsList.map(subj => {
        const subjectSessions = filteredSessions.filter(s => s.subject === subj && s.status === 'completed');
        const income = subjectSessions.reduce((acc, curr) => acc + (curr.price || 0), 0);
        const payout = subjectSessions.reduce((acc, curr) => acc + (curr.teacherPrice || 0), 0);
        const profit = income - payout;
        return { name: subj, income, payout, profit, sessionsCount: subjectSessions.length };
    }).sort((a, b) => b.profit - a.profit);

    const teacherPerformance = teachers?.map(teacher => {
        const teacherMonthSessions = filteredSessions.filter(s => s.teacherName?.trim() === teacher.name?.trim());
        const completed = teacherMonthSessions.filter(s => s.status === 'completed').length;
        const total = teacherMonthSessions.length;
        const documented = teacherMonthSessions.filter(s => s.status === 'completed' && (s.topics || s.homework)).length;
        return {
            name: teacher.name,
            total,
            completed,
            documented,
            attendanceRate: total > 0 ? (completed / total) * 100 : 0,
            documentationRate: completed > 0 ? (documented / completed) * 100 : 0
        };
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
        <div className="min-h-full pb-24 overflow-x-hidden relative bg-white dark:bg-background" dir="rtl">
            <div className="max-w-page mx-auto px-2 space-y-3">
                <div className="bg-surface border border-border/50 rounded-2xl p-3 md:p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-primary-soft flex items-center justify-center">
                                <ActivityIcon size={17} className="text-primary" />
                            </div>
                            <div>
                                <h1 className="text-sm font-bold text-main leading-tight">التقرير الشهري</h1>
                                <p className="text-[10px] text-dim">{semesterName}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5 no-print">
                            <input type="date" className="h-8 px-2 bg-background border border-border text-[10px] font-bold text-main rounded-lg cursor-pointer w-20" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                            <span className="text-[10px] text-dim">إلى</span>
                            <input type="date" className="h-8 px-2 bg-background border border-border text-[10px] font-bold text-main rounded-lg cursor-pointer w-20" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                            <button onClick={handleRefresh} className="w-8 h-8 flex items-center justify-center bg-background border border-border rounded-lg text-dim" aria-label="تحديث">
                                <RefreshCw size={13} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <StatItem
                        title="صافي الربح المتوقع"
                        value={netProjectedProfit.toLocaleString()}
                        icon={TrendingUp}
                        color="var(--bg-primary)"
                        subValue={`${totalProjectedIncome > 0 ? ((netProjectedProfit / totalProjectedIncome) * 100).toFixed(0) : 0}% هامش ربح`}
                    />
                    <StatItem
                        title="التحصيلات الفعلية"
                        value={totalActualCollections.toLocaleString()}
                        icon={Wallet}
                        color="var(--bg-success)"
                        subValue={`صافي التدفق: ${netActualCashFlow.toLocaleString()}`}
                    />
                    <StatItem
                        title="رواتب المعلمات"
                        value={totalTeacherPayout.toLocaleString()}
                        icon={ArrowDownRight}
                        color="var(--bg-error)"
                        subValue={`${payrollData.length} معلمة مسجلة`}
                    />
                    <StatItem
                        title="إجمالي الجلسات"
                        value={filteredSessions.length}
                        icon={ActivityIcon}
                        color="var(--bg-warning)"
                        subValue="كل الجلسات المكتملة"
                    />
                </div>

                <div className="px-0 mb-3">
                    <div className="bg-surface border border-border/50 rounded-2xl p-1 flex overflow-x-auto no-scrollbar gap-1">
                        {[
                            { id: 'payroll', label: 'الرواتب', icon: Receipt },
                            { id: 'collections', label: 'التحصيلات', icon: Wallet },
                            { id: 'renewals', label: 'التجديدات', icon: AlertCircle },
                            { id: 'analysis', label: 'تحليل المواد', icon: BarChart3 },
                            { id: 'teachers', label: 'أداء المعلمات', icon: Users },
                            { id: 'compensation', label: 'التعويضات', icon: RefreshCw },
                            { id: 'summary', label: 'الملخص', icon: TrendingUp }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as TabType)}
                                className={cn(
                                    "flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-bold transition-all whitespace-nowrap",
                                    activeTab === tab.id
                                        ? "bg-primary text-on-primary shadow-sm"
                                        : "text-dim hover:text-main"
                                )}
                            >
                                <tab.icon size={14} />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="px-0 md:animate-in md:fade-in md:duration-500">
                    {activeTab === 'payroll' && (
                        <PayrollTable
                            payrollData={payrollData}
                            teacherAdjustments={teacherAdjustments}
                            handleTeacherAdjustment={handleTeacherAdjustment}
                            setSelectedTeacherForSlip={setSelectedTeacherForSlip}
                            startDate={startDate}
                            endDate={endDate}
                        />
                    )}
                    {activeTab === 'collections' && (
                        <CollectionsTable
                            studentInvoices={studentInvoices}
                            startDate={startDate}
                            endDate={endDate}
                        />
                    )}
                    {activeTab === 'renewals' && <RenewalsCards renewalsData={renewalsData} />}
                    {activeTab === 'analysis' && <SubjectAnalysis subjectAnalysis={subjectAnalysis} reportCurrency="KWD" />}
                    {activeTab === 'teachers' && <TeacherPerformance teacherPerformance={teacherPerformance} />}
                    {activeTab === 'compensation' && <CompensationTable filteredSessions={filteredSessions} />}
                    {activeTab === 'summary' && (
                        <StrategicSummary
                            netProjectedProfit={netProjectedProfit}
                            totalProjectedIncome={totalProjectedIncome}
                            totalActualCollections={totalActualCollections}
                            totalTeacherPayout={totalTeacherPayout}
                            reportCurrency="KWD"
                        />
                    )}
                </div>

                {selectedTeacherForSlip && (
                    <SalarySlipModal
                        teacher={selectedTeacherForSlip}
                        month={`${startDate} / ${endDate}`}
                        onClose={() => setSelectedTeacherForSlip(null)}
                    />
                )}
            </div>
        </div>
    );
};
