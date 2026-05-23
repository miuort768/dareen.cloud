import React, { useState } from 'react';
import {
    Calendar, RefreshCw, Printer,
    ArrowDownRight,
    TrendingUp, BarChart3, AlertCircle, Users, Receipt, Wallet, Activity as ActivityIcon
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSemesterName, useSetSemesterName, useSemesters } from '../context/AppContext';
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
    const setSemesterName = useSetSemesterName();
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

    const [selectedTeacherForSlip, setSelectedTeacherForSlip] = useState<Record<string, unknown> | null>(null);
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
            const resp = await api.get<Record<string, unknown>[]>('/studentInvoices');
            return Array.isArray(resp) ? resp : (resp as Record<string, unknown>).data as Record<string, unknown>[] || [];
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
                const msg = `تذكير من دارين السابعة: المتبقي في رصيد الطالب ${student.name} في مادة ${enroll.subject} هو ${remaining} حصص فقط. يرجى التجديد لضمان استمرار المواعيد.`;
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
        <div className="min-h-full pb-24 overflow-x-hidden relative bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 dark:from-[#020617] dark:via-slate-950 dark:to-emerald-950/20" dir="rtl">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-400/10 dark:bg-emerald-500/5 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-teal-400/10 dark:bg-teal-500/5 blur-3xl pointer-events-none" />
            <div className="relative z-10 mx-auto px-2 space-y-4">
                <div className="bg-[#172554] border border-[#1e3a5f]/60 shadow-lg shadow-black/20 px-5 md:px-7 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-emerald-600 to-teal-600 text-white">
                            <ActivityIcon size={22} />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-white leading-tight">تقفيل الحسابات والأنشطة المالية</h1>
                            <p className="text-[10px] text-indigo-200/70 font-medium leading-none mt-1">التحليل المالي والختامي للفترة الحالية</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 no-print">
                        <div className="flex items-center gap-2 bg-indigo-500/10 px-3 py-1.5 border border-indigo-500/20">
                            <Calendar size={13} className="text-indigo-300" />
                            <select
                                value={semesterName}
                                onChange={(e) => setSemesterName(e.target.value)}
                                className="bg-transparent border-none p-0 text-[10px] font-bold text-indigo-200 outline-none focus:ring-0 cursor-pointer"
                            >
                                {semesterList.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>

                        <div className="flex items-center gap-2 bg-indigo-500/10 px-3 py-1.5 border border-indigo-500/20">
                            <input
                                type="date"
                                className="bg-transparent border-none p-0 text-[10px] font-bold text-indigo-200 outline-none cursor-pointer w-24"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                            <span className="text-[9px] text-indigo-300">→</span>
                            <input
                                type="date"
                                className="bg-transparent border-none p-0 text-[10px] font-bold text-indigo-200 outline-none cursor-pointer w-24"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>

                        <button onClick={handleRefresh} className="p-1.5 hover:bg-white/10 transition-all">
                            <RefreshCw size={14} className={cn("text-indigo-300", isLoading && "animate-spin")} />
                        </button>

                        <PrimaryBtn onClick={() => window.print()} className="py-2 px-3 bg-slate-900 hover:bg-black">
                            <Printer size={14} />
                            طباعة
                        </PrimaryBtn>
                    </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <StatItem
                        title="صافي الربح المتوقع"
                        value={netProjectedProfit.toLocaleString()}
                        icon={TrendingUp}
                        color="text-[#5c59f2]"
                        bg="bg-[#eef2ff] dark:bg-indigo-900/30"
                        subValue={`${totalProjectedIncome > 0 ? ((netProjectedProfit / totalProjectedIncome) * 100).toFixed(0) : 0}% هامش ربح`}
                    />
                    <StatItem
                        title="التحصيلات النقدية"
                        value={totalActualCollections.toLocaleString()}
                        icon={Wallet}
                        color="text-emerald-500"
                        bg="bg-emerald-50 dark:bg-emerald-900/20"
                        subValue={`صافي السيولة: ${netActualCashFlow.toLocaleString()}`}
                    />
                    <StatItem
                        title="رواتب المعلمات"
                        value={totalTeacherPayout.toLocaleString()}
                        icon={ArrowDownRight}
                        color="text-rose-500"
                        bg="bg-rose-50 dark:bg-rose-900/20"
                        subValue={`${payrollData.length} معلمة نشطة`}
                    />
                    <StatItem
                        title="إجمالي النشاط"
                        value={filteredSessions.length}
                        icon={ActivityIcon}
                        color="text-amber-500"
                        bg="bg-amber-50 dark:bg-amber-900/20"
                        subValue="حصة تعليمية منفذة"
                    />
                </div>

                <div className="px-0 mb-4">
                    <div className="bg-white dark:bg-slate-900 rounded-none border border-slate-100 dark:border-slate-800 p-1 flex overflow-x-auto no-scrollbar gap-1">
                        {[
                            { id: 'payroll', label: 'الرواتب', icon: Receipt },
                            { id: 'collections', label: 'التحصيلات', icon: Wallet },
                            { id: 'renewals', label: 'التجديدات', icon: AlertCircle },
                            { id: 'analysis', label: 'تحليل المواد', icon: BarChart3 },
                            { id: 'teachers', label: 'أداء الهيئة', icon: Users },
                            { id: 'compensation', label: 'التعويضات', icon: RefreshCw },
                            { id: 'summary', label: 'الملخص', icon: TrendingUp }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as TabType)}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2 rounded-none text-[10px] font-normal transition-all whitespace-nowrap",
                                    activeTab === tab.id
                                        ? "bg-[#eef2ff] dark:bg-indigo-900/30 text-[#5c59f2] shadow-sm"
                                        : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
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
                    {activeTab === 'analysis' && <SubjectAnalysis subjectAnalysis={subjectAnalysis} />}
                    {activeTab === 'teachers' && <TeacherPerformance teacherPerformance={teacherPerformance} />}
                    {activeTab === 'compensation' && <CompensationTable filteredSessions={filteredSessions} />}
                    {activeTab === 'summary' && (
                        <StrategicSummary
                            netProjectedProfit={netProjectedProfit}
                            totalProjectedIncome={totalProjectedIncome}
                            totalActualCollections={totalActualCollections}
                            totalTeacherPayout={totalTeacherPayout}
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
