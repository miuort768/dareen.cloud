import React, { useState } from 'react';
import {
    Calendar, RefreshCw, Printer,
    ArrowDownRight,
    TrendingUp, BarChart3, AlertCircle, Users, Receipt, Wallet, Activity as ActivityIcon
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSemesterName, useSetSetting, useSemesters } from '../context/AppContext';
import { attendanceService } from '../features/attendance/services/attendanceService';
import { teacherService } from '../features/teachers/services/teacherService';
import { cn } from '../lib/utils';
import { api } from '../lib/api';
import { PageLoader } from '../components/ui/PageLoader';

import { PrimaryBtn, StatItem } from './monthly-closing/components/ClosingUI';
import { SalarySlipModal } from './monthly-closing/components/SalarySlipModal';
import { PayrollTable } from './monthly-closing/components/PayrollTable';
import { CollectionsTable } from './monthly-closing/components/CollectionsTable';
import { RenewalsCards } from './monthly-closing/components/RenewalsCards';
import { SubjectAnalysis } from './monthly-closing/components/SubjectAnalysis';
import { TeacherPerformance } from './monthly-closing/components/TeacherPerformance';
import { CompensationTable } from './monthly-closing/components/CompensationTable';
import { StrategicSummary } from './monthly-closing/components/StrategicSummary';

type TabType = 'payroll' | 'collections' | 'renewals' | 'summary' | 'analysis' | 'teachers' | 'compensation';

export const MonthlyClosing: React.FC = () => {
    const semesterName = useSemesterName();
    const setSetting = useSetSetting();
    const semesters = useSemesters();
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

    const semesterList = (semesters || '').split(',').map(s => s.trim()).filter(Boolean);
    if (!semesterList.includes(semesterName)) semesterList.push(semesterName);

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
        <div className="min-h-full pb-24 overflow-x-hidden relative bg-primary-light dark:bg-background" dir="rtl">
            <div className="mx-auto px-2 space-y-4">
                <div className="bg-gradient-to-br from-[var(--bg-primary)] to-[var(--bg-primary)] shadow-lg px-5 md:px-7 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl mt-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 flex items-center justify-center bg-white/15 backdrop-blur-sm rounded-xl">
                            <ActivityIcon size={22} className="text-on-primary" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-on-primary leading-tight">التقرير الشهري والإغلاق المالي</h1>
                            <p className="text-micro font-bold text-on-primary/70 mt-0.5">تحليل الأداء المالي والإداري للشهر الحالي</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 no-print">
                        <div className="flex items-center gap-2 rounded-xl px-3 py-1.5 bg-white/15 backdrop-blur-sm">
                            <Calendar size={13} className="text-on-primary/70" />
                            <select
                                value={semesterName}
                                onChange={(e) => setSetting('semesterName', e.target.value)}
                                aria-label="اختيار الفصل الدراسي"
                                className="bg-transparent border-none p-0 text-micro font-bold text-on-primary outline-none focus:ring-0 cursor-pointer"
                            >
                                {semesterList.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>

                        <div className="flex items-center gap-2 rounded-xl px-3 py-1.5 bg-white/15 backdrop-blur-sm">
                            <input
                                type="date"
                                className="bg-transparent border-none p-0 text-micro font-bold text-on-primary outline-none cursor-pointer w-24"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                            <span className="text-micro text-on-primary/50">إلى</span>
                            <input
                                type="date"
                                className="bg-transparent border-none p-0 text-micro font-bold text-on-primary outline-none cursor-pointer w-24"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>

                        <button onClick={handleRefresh} className="p-1.5 rounded-xl bg-white/15 backdrop-blur-sm hover:bg-white/30 transition-colors" aria-label="تحديث">
                            <RefreshCw size={14} className="text-on-primary" />
                        </button>

                        <PrimaryBtn onClick={() => window.print()}>
                            <Printer size={14} />
                            طباعة                        </PrimaryBtn>
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

                <div className="px-0 mb-4">
                    <div className="bg-card rounded-card border border-border/50 p-1 flex overflow-x-auto no-scrollbar gap-1 shadow-soft">
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
                                    "flex items-center gap-2 px-4 py-2 rounded-xl text-micro font-normal transition-all whitespace-nowrap",
                                    activeTab === tab.id
                                        ? "bg-primary-soft text-primary shadow-sm"
                                        : "text-muted hover:text-muted dark:hover:text-dim"
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
