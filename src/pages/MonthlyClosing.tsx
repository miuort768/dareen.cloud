import React, { useState } from 'react';
import { 
    Calendar, Filter, Download, RefreshCw, Printer, 
    ArrowDownRight,
    TrendingUp, BarChart3, AlertCircle, Users, Receipt, X, Phone, MessageCircle, CheckCircle2, Star,
    DollarSign, Activity as ActivityIcon, Wallet
} from 'lucide-react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { api } from '../lib/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useApp } from '../context/useApp';
import { attendanceService } from '../features/attendance/services/attendanceService';
import { teacherService } from '../features/teachers/services/teacherService';
import { cn } from '../lib/utils';
import { CURRENCY_SYMBOL } from '../config/constants';

// --- Salary Slip Modal Component ---
const SalarySlipModal = ({ teacher, month, onClose }: { teacher: any, month: string, onClose: () => void }) => {
    if (!teacher) return null;
    
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" dir="rtl">
            <div className="bg-white dark:bg-gray-900 border-4 border-gray-950 shadow-[10px_10px_0px_0px_black] w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="bg-gray-950 text-white p-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Receipt size={20} className="text-emerald-400" />
                        <h2 className="text-lg font-black uppercase tracking-tighter">قسيمة راتب المعلمة</h2>
                    </div>
                    <button onClick={onClose} className="hover:rotate-90 transition-transform">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-6 overflow-y-auto max-h-[80vh]">
                    {/* Academy & Teacher Info */}
                    <div className="flex justify-between items-start border-b-2 border-gray-100 dark:border-gray-800 pb-4">
                        <div>
                            <p className="text-[8px] font-black text-gray-400 uppercase mb-0.5">جهة الإصدار</p>
                            <h3 className="text-xl font-black text-gray-950 dark:text-white mb-1">أكاديمية دارين</h3>
                            <p className="text-[10px] font-bold text-gray-500">الفترة: {month}</p>
                        </div>
                        <div className="text-left">
                            <p className="text-[8px] font-black text-gray-400 uppercase mb-0.5">اسم المعلمة</p>
                            <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tighter">{teacher.name}</h3>
                            <p className="text-[10px] font-bold text-emerald-600">{teacher.subject}</p>
                        </div>
                    </div>

                    {/* Financial Summary Box */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 border-2 border-gray-950">
                            <p className="text-[8px] font-black text-gray-400 uppercase mb-0.5">إجمالي الحصص</p>
                            <p className="text-xl font-black text-gray-900 dark:text-white font-mono">{teacher.sessionsCount}</p>
                        </div>
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 border-2 border-gray-950">
                            <p className="text-[8px] font-black text-emerald-600 uppercase mb-0.5">صافي المستحق</p>
                            <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400 font-mono">
                                {teacher.totalAmount.toLocaleString()} <span className="text-[10px] uppercase">ج.م</span>
                            </p>
                        </div>
                    </div>

                    {/* Detailed Sessions Table (Mini) */}
                    <div>
                        <h4 className="text-xs font-black text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                             بيان الحصص المنجزة
                        </h4>
                        <div className="border border-gray-100 dark:border-gray-800 rounded-none overflow-hidden text-[11px]">
                            <table className="w-full text-right">
                                <thead className="bg-gray-50 dark:bg-gray-800">
                                    <tr>
                                        <th className="p-2 font-black text-[10px] border-l border-gray-100 dark:border-gray-700">التاريخ</th>
                                        <th className="p-2 font-black text-[10px] border-l border-gray-100 dark:border-gray-700">الطالب</th>
                                        <th className="p-2 font-black text-[10px]">القيمة</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {teacher.sessionsList?.slice(0, 8).map((s: any, idx: number) => (
                                        <tr key={idx}>
                                            <td className="p-2 border-l border-gray-50 dark:border-gray-800 font-mono text-[10px]">{s.date}</td>
                                            <td className="p-2 border-l border-gray-50 dark:border-gray-800 font-bold">{s.studentName}</td>
                                            <td className="p-2 font-bold">{s.teacherPrice || teacher.price} ج.م</td>
                                        </tr>
                                    ))}
                                    {teacher.sessionsList?.length > 8 && (
                                        <tr>
                                            <td colSpan={3} className="p-1.5 text-center text-[9px] text-gray-400 font-bold italic">
                                                و {teacher.sessionsList.length - 8} حصص أخرى...
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex gap-3 pt-2">
                        <button 
                            onClick={() => window.print()}
                            className="flex-1 bg-gray-900 text-white py-3 font-black text-xs flex items-center justify-center gap-2 hover:bg-black transition-all"
                        >
                            <Printer size={16} /> طباعة القسيمة
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};�عة القسيمة
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};


type TabType = 'payroll' | 'collections' | 'renewals' | 'summary' | 'analysis' | 'teachers' | 'compensation';

export const MonthlyClosing: React.FC = () => {
    const { 
        semesterName, 
        setSemesterName, 
        semesters 
    } = useApp();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState<TabType>('payroll');
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
    const [selectedTeacherForSlip, setSelectedTeacherForSlip] = useState<any>(null);
    const [teacherAdjustments, setTeacherAdjustments] = useState<Record<string, number>>({});

    const handleTeacherAdjustment = (teacherId: string, amount: number) => {
        setTeacherAdjustments(prev => ({
            ...prev,
            [teacherId]: amount
        }));
    };

    // Split semesters string into array for dropdown
    const semesterList = (semesters || '').split(',').map(s => s.trim()).filter(Boolean);
    if (!semesterList.includes(semesterName)) semesterList.push(semesterName);

    const handleRefresh = () => {
        queryClient.invalidateQueries({ queryKey: ['sessions-closing'] });
        queryClient.invalidateQueries({ queryKey: ['teachers-closing'] });
        queryClient.invalidateQueries({ queryKey: ['students-closing'] });
        queryClient.invalidateQueries({ queryKey: ['student-invoices-closing'] });
    };

    // Fetch data
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
            const resp = await api.get<any[]>('/studentInvoices');
            return Array.isArray(resp) ? resp : (resp as any).data || [];
        }
    });

    const isLoading = sessionsLoading || teachersLoading || studentsLoading || invoicesLoading;

    // Filter sessions by month
    const filteredSessions = sessions?.filter(s => s.date.startsWith(selectedMonth)) || [];

    // --- 1. Teacher Payroll Logic ---
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

    // --- 2. Subject Profitability Logic ---
    const subjectsList = Array.from(new Set(filteredSessions.map(s => s.subject))).filter(Boolean);
    const subjectAnalysis = subjectsList.map(subj => {
        const subjectSessions = filteredSessions.filter(s => s.subject === subj && s.status === 'completed');
        const income = subjectSessions.reduce((acc, curr) => acc + (curr.price || 0), 0);
        const payout = subjectSessions.reduce((acc, curr) => acc + (curr.teacherPrice || 0), 0);
        const profit = income - payout;
        return {
            name: subj,
            income,
            payout,
            profit,
            sessionsCount: subjectSessions.length
        };
    }).sort((a, b) => b.profit - a.profit);

    // --- 3. Teacher Performance Logic ---
    const teacherPerformance = teachers?.map(teacher => {
        const teacherMonthSessions = filteredSessions.filter(s => 
            s.teacherName?.trim() === teacher.name?.trim()
        );
        const completed = teacherMonthSessions.filter(s => s.status === 'completed').length;
        const cancelled = teacherMonthSessions.filter(s => s.status === 'cancelled').length;
        const total = teacherMonthSessions.length;
        const documented = teacherMonthSessions.filter(s => s.status === 'completed' && (s.topics || s.homework)).length;
        
        return {
            name: teacher.name,
            total,
            completed,
            cancelled,
            documented,
            attendanceRate: total > 0 ? (completed / total) * 100 : 0,
            documentationRate: completed > 0 ? (documented / completed) * 100 : 0
        };
    }).sort((a, b) => b.attendanceRate - a.attendanceRate) || [];

    // --- 4. Student Renewals Logic ---
    const renewalsData = students?.flatMap(student => 
        (student.enrollments || []).map(enroll => {
            const remaining = enroll.sessionsTotal - enroll.sessionsUsed;
            const isLow = remaining <= 2;
            
            // Build WhatsApp Link
            let waLink = '';
            if (student.parentPhone) {
                const msg = `تذكير من أكاديمية دارين: المتبقي في رصيد الطالب ${student.name} في مادة ${enroll.subject} هو ${remaining} حصص فقط. يرجى التجديد لضمان استمرار المواعيد.`;
                waLink = `https://wa.me/${student.parentPhone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`;
            }

            return {
                studentName: student.name,
                phone: student.parentPhone || '',
                subject: enroll.subject,
                remaining,
                total: enroll.sessionsTotal,
                isLow,
                waLink
            };
        })
    ).filter(item => item.isLow).sort((a, b) => a.remaining - b.remaining) || [];

    // --- 5. Summary Stats ---
    const totalProjectedIncome = filteredSessions.reduce((acc, curr) => acc + (curr.price || 0), 0);
    const totalActualCollections = (studentInvoices || [])
        .filter((inv: any) => inv.date.startsWith(selectedMonth) && inv.status === 'paid')
        .reduce((acc: number, curr: any) => acc + curr.amount, 0);
    const totalTeacherPayout = payrollData.reduce((acc, curr) => acc + curr.totalAmount, 0);
    const netProjectedProfit = totalProjectedIncome - totalTeacherPayout;
    const netActualCashFlow = totalActualCollections - totalTeacherPayout;

    if (isLoading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <div className="w-12 h-12 border-4 border-gray-200 border-t-emerald-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="p-3 lg:p-6 min-h-screen bg-gray-50/50 dark:bg-gray-950/50" dir="rtl">
            {/* Header with Semester & Month Switcher */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-xl font-black text-gray-900 dark:text-white tracking-tighter flex items-center gap-2 mb-1">
                        <div className="w-1 h-6 bg-rose-600 border border-gray-950 dark:border-gray-800"></div>
                        تقفيل الحسابات والأنشطة
                    </h1>
                    <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        <Calendar size={12} /> 
                        <span>{semesterName}</span>
                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                        <span>{selectedMonth}</span>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {/* Semester Selector */}
                    <div className="bg-white border-2 border-gray-950 shadow-[1px_1px_0px_0px_black] px-2 py-1 flex items-center gap-1 dark:bg-gray-900 dark:border-gray-800">
                        <span className="text-[7px] font-black opacity-40 uppercase ml-0.5 dark:text-gray-400">الفصل:</span>
                        <select 
                            value={semesterName} 
                            onChange={(e) => setSemesterName(e.target.value)}
                            className="bg-transparent font-black border-none focus:ring-0 text-[10px] dark:text-white outline-none cursor-pointer p-0"
                        >
                            {semesterList.map(s => (
                                <option key={s} value={s} className="dark:bg-gray-800">{s}</option>
                            ))}
                        </select>
                    </div>

                    <div className="bg-white border-2 border-gray-950 shadow-[1px_1px_0px_0px_black] px-2 py-1 flex items-center gap-1 dark:bg-gray-900 dark:border-gray-800">
                        <Filter size={12} className="text-gray-400" />
                        <input 
                            type="month" 
                            className="bg-transparent font-black border-none focus:ring-0 text-[10px] dark:text-white outline-none cursor-pointer p-0" 
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                        />
                    </div>
                    
                    <button 
                        onClick={handleRefresh}
                        className="p-1.5 bg-gray-950 text-white hover:bg-black transition-all shadow-[1px_1px_0px_0px_#444] border-2 border-gray-950"
                    >
                        <RefreshCw size={14} />
                    </button>
                    
                    <button 
                        onClick={() => window.print()}
                        className="p-1.5 bg-rose-600 text-white hover:bg-rose-700 transition-all shadow-[1px_1px_0px_0px_black] border-2 border-gray-950"
                    >
                        <Printer size={14} />
                    </button>
                </div>
            </div>

            {/* Quick Summary Bar */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                <div className="bg-white border-2 border-gray-950 p-2 shadow-[2px_2px_0px_0px_black] dark:bg-gray-900 dark:border-gray-800 group transition-transform hover:translate-y-[-2px]">
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">الربح المتوقع</p>
                    <div className="flex items-end justify-between">
                        <div>
                            <h3 className="text-lg font-black text-blue-600 font-mono tracking-tighter leading-none">
                                {netProjectedProfit.toLocaleString()} <span className="text-[8px] uppercase opacity-70">{CURRENCY_SYMBOL}</span>
                            </h3>
                            <p className="text-[8px] font-bold text-blue-400 mt-1">الهامش: {totalProjectedIncome > 0 ? ((netProjectedProfit / totalProjectedIncome) * 100).toFixed(0) : 0}%</p>
                        </div>
                        <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center border-2 border-blue-600 text-blue-600">
                            <DollarSign size={16} />
                        </div>
                    </div>
                </div>

                <div className="bg-white border-2 border-gray-950 p-2 shadow-[2px_2px_0px_0px_black] dark:bg-gray-900 dark:border-gray-800 group transition-transform hover:translate-y-[-2px]">
                    <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest mb-0.5">التحصيلات الفعلية</p>
                    <div className="flex items-end justify-between">
                        <div>
                            <h3 className="text-lg font-black text-emerald-600 font-mono tracking-tighter leading-none">
                                {totalActualCollections.toLocaleString()} <span className="text-[8px] uppercase opacity-70">{CURRENCY_SYMBOL}</span>
                            </h3>
                            <p className="text-[8px] font-bold text-emerald-400 mt-1">
                                الفائض: {netActualCashFlow.toLocaleString()}
                            </p>
                        </div>
                        <div className="w-8 h-8 bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center border-2 border-emerald-600">
                            <Wallet size={16} className="text-emerald-600" />
                        </div>
                    </div>
                </div>
                
                <div className="bg-white border-2 border-gray-950 p-2 shadow-[2px_2px_0px_0px_black] dark:bg-gray-900 dark:border-gray-800 group transition-transform hover:translate-y-[-2px]">
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">رواتب المعلمات</p>
                    <div className="flex items-end justify-between">
                        <div>
                            <h3 className="text-lg font-black text-rose-600 font-mono tracking-tighter leading-none">
                                {totalTeacherPayout.toLocaleString()} <span className="text-[8px] uppercase opacity-70">{CURRENCY_SYMBOL}</span>
                            </h3>
                        </div>
                        <div className="w-8 h-8 bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center border-2 border-rose-600 text-rose-600">
                            <ArrowDownRight size={16} />
                        </div>
                    </div>
                </div>

                <div className="bg-white border-2 border-gray-950 p-2 shadow-[2px_2px_0px_0px_black] dark:bg-gray-900 dark:border-gray-800 group transition-transform hover:translate-y-[-2px]">
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">نشاط الأكاديمية</p>
                    <div className="flex items-end justify-between">
                        <div>
                            <h3 className="text-lg font-black text-amber-600 font-mono tracking-tighter leading-none">
                                {filteredSessions.length} <span className="text-[8px] uppercase opacity-70">حصة</span>
                            </h3>
                        </div>
                        <div className="w-8 h-8 bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center border-2 border-amber-600 text-amber-600">
                            <ActivityIcon size={16} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex overflow-x-auto no-scrollbar bg-white dark:bg-gray-900 border-2 border-gray-950 dark:border-gray-800 mb-6 shadow-[4px_4px_0px_0px_black] md:shadow-[4px_4px_0px_0px_black] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.05)] sticky top-0 z-40">
                <button 
                    onClick={() => setActiveTab('payroll')}
                    className={cn(
                        "px-2 py-1.5 text-[10px] font-black transition-all flex items-center gap-1 whitespace-nowrap",
                        activeTab === 'payroll' ? "bg-gray-950 text-white dark:bg-white dark:text-gray-950" : "hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400"
                    )}
                >
                    <Receipt size={10} /> الرواتب
                </button>
                <button 
                    onClick={() => setActiveTab('collections')}
                    className={cn(
                        "px-2 py-1.5 text-[9px] font-black transition-all flex items-center gap-1 whitespace-nowrap",
                        activeTab === 'collections' ? "bg-gray-950 text-white dark:bg-white dark:text-gray-950" : "hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400"
                    )}
                >
                    <Wallet size={10} /> التحاصيل
                </button>
                <button 
                    onClick={() => setActiveTab('renewals')}
                    className={cn(
                        "px-2 py-1.5 text-[9px] font-black transition-all flex items-center gap-1 whitespace-nowrap",
                        activeTab === 'renewals' ? "bg-gray-950 text-white dark:bg-white dark:text-gray-950" : "hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400"
                    )}
                >
                    <AlertCircle size={10} /> التجديدات
                </button>
                <button 
                    onClick={() => setActiveTab('analysis')}
                    className={cn(
                        "px-2 py-1.5 text-[9px] font-black transition-all flex items-center gap-1 whitespace-nowrap",
                        activeTab === 'analysis' ? "bg-gray-950 text-white dark:bg-white dark:text-gray-950" : "hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400"
                    )}
                >
                    <BarChart3 size={10} /> التحليل
                </button>
                <button 
                    onClick={() => setActiveTab('summary')}
                    className={cn(
                        "px-2 py-1.5 text-[9px] font-black transition-all flex items-center gap-1 whitespace-nowrap",
                        activeTab === 'summary' ? "bg-gray-950 text-white dark:bg-white dark:text-gray-950" : "hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400"
                    )}
                >
                    <TrendingUp size={10} /> الملخص
                </button>
                <button 
                    onClick={() => setActiveTab('teachers')}
                    className={cn(
                        "px-2 py-1.5 text-[9px] font-black transition-all flex items-center gap-1 whitespace-nowrap",
                        activeTab === 'teachers' ? "bg-gray-950 text-white dark:bg-white dark:text-gray-950" : "hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400"
                    )}
                >
                    <Users size={10} /> المعلمات
                </button>
                <button 
                    onClick={() => setActiveTab('compensation')}
                    className={cn(
                        "px-2 py-1.5 text-[9px] font-black transition-all flex items-center gap-1 whitespace-nowrap",
                        activeTab === 'compensation' ? "bg-gray-950 text-white dark:bg-white dark:text-gray-950" : "hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400"
                    )}
                >
                    <RefreshCw size={10} /> التعويض
                </button>
            </div>

            {/* Salary Slip Modal */}
            <SalarySlipModal 
                teacher={selectedTeacherForSlip} 
                month={selectedMonth} 
                onClose={() => setSelectedTeacherForSlip(null)} 
            />

            {/* Content Area */}
            <div className="bg-white border-2 border-gray-950 shadow-[12px_12px_0px_0px_black] dark:bg-gray-900 dark:border-gray-800 overflow-hidden min-h-[500px]">
                {activeTab === 'collections' && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <div className="p-4 border-b-2 border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-950">
                            <h2 className="text-base font-black tracking-tight text-gray-900 dark:text-white">تحصيل مبالغ الطلاب - {selectedMonth}</h2>
                            <div className="flex gap-2">
                                <div className="bg-emerald-50 text-emerald-700 px-3 py-1.5 border-2 border-emerald-600 font-black text-[10px] shadow-[2px_2px_0px_0px_black]">
                                     المحصل: {studentInvoices?.filter((inv: any) => inv.status === 'paid' && inv.date.startsWith(selectedMonth)).reduce((acc: number, curr: any) => acc + curr.amount, 0).toLocaleString()} ج.م
                                </div>
                                <div className="bg-rose-50 text-rose-700 px-3 py-1.5 border-2 border-rose-600 font-black text-[10px] shadow-[2px_2px_0px_0px_black]">
                                     المتبقي: {studentInvoices?.filter((inv: any) => inv.status !== 'paid' && inv.date.startsWith(selectedMonth)).reduce((acc: number, curr: any) => acc + curr.amount, 0).toLocaleString()} ج.م
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-right border-collapse">
                                <thead className="bg-gray-900 text-white dark:bg-black">
                                    <tr>
                                        <th className="px-4 py-3 font-black uppercase tracking-tighter text-[9px] border-l border-white/10">الطالب</th>
                                        <th className="px-4 py-3 font-black uppercase tracking-tighter text-[9px] border-l border-white/10">البيان</th>
                                        <th className="px-4 py-3 font-black uppercase tracking-tighter text-[9px] border-l border-white/10 text-center">المبلغ</th>
                                        <th className="px-4 py-3 font-black uppercase tracking-tighter text-[9px] border-l border-white/10 text-center">التاريخ</th>
                                        <th className="px-4 py-3 font-black uppercase tracking-tighter text-[9px] text-center">الحالة</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y-2 divide-gray-100 dark:divide-gray-800">
                                    {(studentInvoices || [])
                                        .filter((inv: any) => inv.date.startsWith(selectedMonth))
                                        .map((item: any) => (
                                            <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                                                <td className="px-4 py-3 border-l border-gray-100 dark:border-gray-800">
                                                    <span className="block font-black text-xs text-gray-900 dark:text-white leading-none mb-0.5">{item.studentName}</span>
                                                    <span className="text-[9px] font-bold text-gray-400">ID: {item.studentId.slice(0, 6)}</span>
                                                </td>
                                                <td className="px-4 py-3 border-l border-gray-100 dark:border-gray-800 text-[10px] font-bold text-gray-500">
                                                    {item.description}
                                                </td>
                                                <td className="px-4 py-3 border-l border-gray-100 dark:border-gray-800 text-center font-mono font-black text-base text-emerald-600">
                                                    {item.amount.toLocaleString()} <span className="text-[9px]">ج.م</span>
                                                </td>
                                                <td className="px-4 py-3 border-l border-gray-100 dark:border-gray-800 text-center font-mono font-bold text-[10px]">
                                                    {item.date}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <button
                                                        onClick={async () => {
                                                            const newStatus = item.status === 'paid' ? 'pending' : 'paid';
                                                            await api.patch(`/studentInvoices/${item.id}`, { status: newStatus });
                                                            queryClient.invalidateQueries({ queryKey: ['student-invoices-closing'] });
                                                        }}
                                                        className={cn(
                                                            "px-3 py-1.5 border-2 font-black text-[9px] uppercase tracking-widest transition-all shadow-[2px_2px_0px_0px_black] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none",
                                                            item.status === 'paid' 
                                                                ? "bg-emerald-600 text-white border-gray-950" 
                                                                : "bg-white text-rose-600 border-rose-600 hover:bg-rose-50"
                                                        )}
                                                    >
                                                        {item.status === 'paid' ? 'تم التحصيل' : 'انتظار'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    {!(studentInvoices || []).some((inv: any) => inv.date.startsWith(selectedMonth)) && (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-20 text-center text-gray-400 font-black uppercase tracking-widest text-sm">
                                                <Wallet className="mx-auto mb-4 opacity-10" size={64} />
                                                لا توجد فواتير طلاب مسجلة لهذا الشهر
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
                {activeTab === 'payroll' && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <div className="p-4 border-b-2 border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-950">
                            <h2 className="text-base font-black tracking-tight text-gray-900 dark:text-white">رواتب معلمات الأكاديمية - {selectedMonth}</h2>
                            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white font-black text-[10px] border border-gray-950 shadow-[2px_2px_0px_0px_black] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all">
                                <Download size={12} /> تصدير PDF
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-right border-collapse">
                                <thead className="bg-gray-900 text-white dark:bg-black">
                                    <tr>
                                        <th className="px-4 py-3 font-black uppercase tracking-tighter text-[9px] border-l border-white/10">المعلمة</th>
                                        <th className="px-4 py-3 font-black uppercase tracking-tighter text-[9px] border-l border-white/10 text-center">الحصص</th>
                                        <th className="px-4 py-3 font-black uppercase tracking-tighter text-[9px] border-l border-white/10 text-center">الأساسي</th>
                                        <th className="px-4 py-3 font-black uppercase tracking-tighter text-[9px] border-l border-white/10 text-center">إضافات/خصم</th>
                                        <th className="px-4 py-3 font-black uppercase tracking-tighter text-[9px] text-center">المستحق</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y-2 divide-gray-100 dark:divide-gray-800">
                                    {payrollData.length > 0 ? payrollData.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                                            <td className="px-4 py-3 border-l border-gray-100 dark:border-gray-800">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 bg-gray-900 border-2 border-gray-950 flex items-center justify-center text-white font-black dark:bg-white dark:text-black text-xs">
                                                        {item.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <span className="block font-black text-xs text-gray-950 dark:text-white leading-none mb-0.5">{item.name}</span>
                                                        <span className="text-[8px] font-black text-gray-400 uppercase">{item.subject}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 border-l border-gray-100 dark:border-gray-800 text-center font-mono font-black text-base dark:text-white">
                                                {item.sessionsCount}
                                            </td>
                                            <td className="px-4 py-3 border-l border-gray-100 dark:border-gray-800 text-center font-mono font-black text-xs text-gray-400">
                                                {item.baseAmount.toLocaleString()}
                                            </td>
                                            <td className="px-4 py-3 border-l border-gray-100 dark:border-gray-800 text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <input 
                                                        type="number"
                                                        value={item.adjustment || ''}
                                                        placeholder="0"
                                                        onChange={(e) => handleTeacherAdjustment(item.id, parseFloat(e.target.value) || 0)}
                                                        className="w-16 bg-gray-50 border border-gray-200 p-1 text-center font-black text-xs dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:border-gray-950 outline-none transition-all"
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <div className="flex flex-col items-center gap-1">
                                                    <div className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-600 text-white font-mono font-black text-base shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] dark:bg-emerald-500">
                                                        {item.totalAmount.toLocaleString()} <span className="text-[9px] font-black uppercase">LE</span>
                                                    </div>
                                                    <button 
                                                        onClick={() => setSelectedTeacherForSlip(item)}
                                                        className="text-[9px] font-black text-gray-400 hover:text-emerald-600 underline underline-offset-4 flex items-center gap-1 transition-colors italic"
                                                    >
                                                        <Receipt size={8} /> القسيمة
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-20 text-center text-gray-400 font-black uppercase tracking-widest text-sm">
                                                <AlertCircle className="mx-auto mb-4 opacity-10" size={64} />
                                                لا توجد بيانات رواتب لهذا الشهر
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'renewals' && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <div className="p-3 border-b-2 border-gray-100 dark:border-gray-800 bg-amber-50 dark:bg-amber-900/10">
                            <h2 className="text-sm font-black tracking-tight text-amber-700 dark:text-amber-500 flex items-center gap-2">
                                <AlertCircle size={16} /> تنبيهات الطلاب الموشكين على إنهاء الرصيد
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-4">
                            {renewalsData.length > 0 ? renewalsData.map((item, idx) => (
                                <div key={idx} className="bg-white border-2 border-gray-950 p-3 relative group dark:bg-gray-900 dark:border-gray-800 shadow-[4px_4px_0px_0px_black] hover:translate-x-[1px] hover:translate-y-[1px] transition-all">
                                    <div className="absolute top-3 left-3">
                                        <div className={cn(
                                            "w-7 h-7 border-2 border-gray-950 flex flex-col items-center justify-center font-black shadow-[1px_1px_0px_0px_black]",
                                            item.remaining === 0 ? "bg-rose-600 text-white" : "bg-amber-400 text-gray-900"
                                        )}>
                                            <span className="text-sm leading-none">{item.remaining}</span>
                                            <span className="text-[6px] uppercase">باقي</span>
                                        </div>
                                    </div>
                                    <div className="mb-2">
                                        <h3 className="text-base font-black text-gray-900 dark:text-white mb-0.5">{item.studentName}</h3>
                                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{item.subject}</p>
                                    </div>
                                    <div className="pt-2 border-t border-gray-100 dark:border-gray-800 space-y-2">
                                        <div className="flex items-center justify-between text-[10px] font-bold text-gray-500">
                                            <span>الرصيد الأصلي: {item.total} حصص</span>
                                        </div>
                                        <div className="w-full bg-gray-100 h-1 dark:bg-gray-800 mt-1">
                                            <div 
                                                className={cn("h-full", item.remaining === 0 ? "bg-rose-600" : "bg-amber-500")}
                                                style={{ width: `${(Math.max(0, item.remaining) / item.total) * 100}%` }}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 mt-4">
                                            <a 
                                                href={item.waLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-center gap-1.5 py-1.5 bg-emerald-600 text-white text-[9px] font-black border border-gray-950 hover:bg-emerald-700 transition-colors"
                                            >
                                                <MessageCircle size={10} /> واتساب
                                            </a>
                                            <a 
                                                href={`tel:${item.phone}`}
                                                className="flex items-center justify-center gap-1.5 py-1.5 bg-gray-900 text-white text-[9px] font-black border border-gray-950 hover:bg-black transition-colors dark:bg-black"
                                            >
                                                <Phone size={10} /> اتصال
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="col-span-full py-20 text-center text-gray-400">
                                    <CheckCircle2 className="mx-auto mb-4 opacity-10" size={64} />
                                    <p className="font-black uppercase tracking-widest">جميع الأرصدة مكتملة ومؤمنة</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'summary' && (
                    <div className="p-4 animate-in fade-in slide-in-from-bottom-5 duration-700">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div>
                                <h1 className="text-xl lg:text-2xl font-black text-gray-950 dark:text-white tracking-tighter mb-2">ملخص الأداء المالي <span className="text-emerald-600">+{((netProjectedProfit / (totalProjectedIncome || 1)) * 100).toFixed(0)}%</span></h1>
                                <p className="text-[10px] font-bold text-gray-500 leading-relaxed max-w-xl">
                                    تحليل التدفق النقدي والأرباح المسجلة لهذا الشهر.
                                </p>
                                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
                                    <div className="border-l-2 border-emerald-500 pl-3 py-1">
                                        <p className="text-[7px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">إيرادات متوقعة</p>
                                        <p className="text-base font-black text-gray-950 dark:text-white font-mono leading-none">{totalProjectedIncome.toLocaleString()} <span className="text-[8px]">{CURRENCY_SYMBOL}</span></p>
                                    </div>
                                    <div className="border-l-2 border-emerald-600 pl-3 py-1 bg-emerald-50/30">
                                        <p className="text-[7px] font-black text-emerald-700 uppercase tracking-widest leading-none mb-1">تحصيلات فعلية</p>
                                        <p className="text-base font-black text-emerald-800 dark:text-emerald-400 font-mono leading-none">{totalActualCollections.toLocaleString()} <span className="text-[8px]">{CURRENCY_SYMBOL}</span></p>
                                    </div>
                                    <div className="border-l-2 border-rose-500 pl-3 py-1">
                                        <p className="text-[7px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">تكاليف الرواتب</p>
                                        <p className="text-base font-black text-gray-950 dark:text-white font-mono leading-none">{totalTeacherPayout.toLocaleString()} <span className="text-[8px]">{CURRENCY_SYMBOL}</span></p>
                                    </div>
                                    <div className="border-l-2 border-gray-950 pl-3 py-1">
                                        <p className="text-[7px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">إجمالي الحصص</p>
                                        <p className="text-base font-black text-gray-950 dark:text-white font-mono leading-none">{filteredSessions.length}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 border-2 border-gray-950 bg-emerald-50 dark:bg-emerald-900/10 shadow-[4px_4px_0px_0px_rgba(16,185,129,0.1)] dark:border-gray-800">
                                <h3 className="text-sm font-black text-emerald-900 border-b-2 border-emerald-200 pb-2 mb-3 dark:text-emerald-400 leading-none">نصيحة المدير الذكي 💡</h3>
                                <div className="space-y-2">
                                    <div className="flex gap-2 text-right">
                                        <div className="flex-shrink-0 w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-[9px]">1</div>
                                        <p className="text-[10px] font-bold text-emerald-800 dark:text-emerald-500/80 leading-tight">طلاب بحاجة للتجديد: {renewalsData.length}.</p>
                                    </div>
                                    <div className="flex gap-2 text-right">
                                        <div className="flex-shrink-0 w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-[9px]">2</div>
                                        <p className="text-[10px] font-bold text-emerald-800 dark:text-emerald-500/80 leading-tight">السيولة المتاحة: {netActualCashFlow.toLocaleString()} {CURRENCY_SYMBOL}.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'analysis' && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 p-4">
                        <div className="flex items-center justify-between mb-4 pb-2 border-b-2 border-gray-950">
                            <div>
                                <h2 className="text-base font-black text-gray-950 dark:text-white uppercase tracking-tighter">تحليل ربحية المواد الدراسية</h2>
                                <p className="text-[9px] font-bold text-gray-400 mt-0.5">مقارنة الإيرادات بالتكاليف المباشرة</p>
                            </div>
                            <div className="w-8 h-8 bg-gray-950 flex items-center justify-center text-white dark:bg-white dark:text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)]">
                                <BarChart3 size={16} />
                            </div>
                        </div>

                        {/* Recharts Visualization */}
                        <div className="bg-gray-50 dark:bg-gray-900 border-2 border-gray-950 p-4 mb-6 shadow-[6px_6px_0px_0px_black] dark:border-gray-800">
                            <h3 className="text-base font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <div className="w-3 h-3 bg-emerald-600 border border-gray-950"></div>
                                المخطط التحليلي للمواد
                            </h3>
                            <div className="h-[250px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={subjectAnalysis}
                                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                                        <XAxis dataKey="name" stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                                        <Tooltip 
                                            contentStyle={{ 
                                                backgroundColor: '#fff', 
                                                border: '2px solid #000', 
                                                borderRadius: '0px',
                                                boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)',
                                                fontSize: '10px'
                                            }} 
                                        />
                                        <Legend verticalAlign="top" height={24} iconSize={10} wrapperStyle={{ fontSize: '10px' }} />
                                        <Bar dataKey="income" name="إجمالي الإيرادات" fill="#10b981" radius={[2, 2, 0, 0]} />
                                        <Bar dataKey="payout" name="رواتب المعلمات" fill="#f43f5e" radius={[2, 2, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {subjectAnalysis.map((subj, idx) => (
                                <div key={idx} className="bg-white border-2 border-gray-950 dark:bg-gray-800 dark:border-gray-700 shadow-[3px_3px_0px_0px_black] p-3 relative group overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
                                    <div className="mb-4 flex justify-between items-start text-right">
                                        <div>
                                            <h3 className="text-sm font-black text-gray-900 dark:text-white leading-none mb-1">{subj.name}</h3>
                                            <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">{subj.sessionsCount} حصة</p>
                                        </div>
                                        <div className="text-left">
                                            <p className="text-[8px] font-black text-gray-400 uppercase">الربح</p>
                                            <p className="text-base font-black text-emerald-600 font-mono tracking-tighter">
                                                {subj.profit.toLocaleString()} <span className="text-[9px]">LE</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-end">
                                            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">الإيرادات</span>
                                            <span className="text-xs font-black text-gray-900 dark:text-white font-mono">{subj.income.toLocaleString()}</span>
                                        </div>
                                        <div className="w-full bg-gray-100 h-1 dark:bg-gray-700">
                                            <div className="h-full bg-blue-500 w-full" />
                                        </div>
                                        <div className="flex justify-between items-end">
                                            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">المستحقات</span>
                                            <span className="text-xs font-black text-gray-900 dark:text-white font-mono">{subj.payout.toLocaleString()}</span>
                                        </div>
                                        <div className="w-full bg-gray-100 h-1 dark:bg-gray-700">
                                            <div className="h-full bg-rose-500" style={{ width: `${(subj.payout / (subj.income || 1)) * 100}%` }} />
                                        </div>
                                    </div>
                                    <div className="mt-4 pt-2 border-t border-gray-50 dark:border-gray-700 flex justify-between items-center">
                                        <span className="text-[8px] font-black text-gray-400 uppercase">الهامش</span>
                                        <span className="text-xs font-black text-gray-950 dark:text-white">
                                            {subj.income > 0 ? ((subj.profit / subj.income) * 100).toFixed(0) : 0}%
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'teachers' && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 p-4">
                        <div className="flex items-center justify-between mb-4 pb-2 border-b-2 border-gray-950">
                            <div>
                                <h2 className="text-base font-black text-gray-950 dark:text-white uppercase tracking-tighter">تحليل أداء المعلمات</h2>
                                <p className="text-[9px] font-bold text-gray-400 mt-0.5">قياس الالتزام وجودة التوثيق التعليمي</p>
                            </div>
                            <div className="w-8 h-8 bg-gray-950 flex items-center justify-center text-white dark:bg-white dark:text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)]">
                                <Users size={16} />
                            </div>
                        </div>

                        <div className="space-y-3">
                            {teacherPerformance.map((perf, idx) => (
                                <div key={idx} className="bg-white border-2 border-gray-950 dark:bg-gray-800 dark:border-gray-700 shadow-[3px_3px_0px_0px_black] p-3 transition-colors hover:bg-gray-50 dark:hover:bg-white/5">
                                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                                        <div className="flex items-center gap-3 min-w-[200px]">
                                            <div className="w-10 h-10 bg-gray-900 border-2 border-gray-950 flex items-center justify-center text-white text-lg font-black dark:bg-white dark:text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]">
                                                {perf.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none mb-1">{perf.name}</h3>
                                                <p className="text-[8px] font-black text-gray-400 flex items-center gap-1 uppercase">إجمالي: {perf.total}</p>
                                            </div>
                                        </div>

                                        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div>
                                                <p className="text-[8px] font-black text-gray-400 uppercase mb-0.5 tracking-widest">الالتزام</p>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-base font-black text-emerald-600 font-mono">{perf.attendanceRate.toFixed(0)}%</span>
                                                    <div className="flex-1 h-1 bg-gray-100 dark:bg-gray-700/50 rounded-none overflow-hidden">
                                                        <div className="h-full bg-emerald-500" style={{ width: `${perf.attendanceRate}%` }} />
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div>
                                                <p className="text-[8px] font-black text-gray-400 uppercase mb-0.5 tracking-widest">التوثيق</p>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-base font-black text-blue-600 font-mono">{perf.documentationRate.toFixed(0)}%</span>
                                                    <div className="flex-1 h-1 bg-gray-100 dark:bg-gray-700/50 rounded-none overflow-hidden">
                                                        <div className="h-full bg-blue-500" style={{ width: `${perf.documentationRate}%` }} />
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="hidden md:block">
                                                <p className="text-[8px] font-black text-gray-400 uppercase mb-0.5 tracking-widest">المكتمل</p>
                                                <p className="text-base font-black text-gray-900 dark:text-white font-mono">{perf.completed}</p>
                                            </div>

                                            <div className="hidden md:block">
                                                <p className="text-[8px] font-black text-gray-400 uppercase mb-0.5 tracking-widest">الموثق</p>
                                                <p className="text-base font-black text-gray-900 dark:text-white font-mono">{perf.documented}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1.5">
                                            {perf.attendanceRate > 90 && perf.documentationRate > 80 ? (
                                                <div className="bg-amber-100 text-amber-700 border border-amber-200 px-2 py-1 font-black text-[8px] uppercase tracking-widest flex items-center gap-1.5">
                                                    <Star size={10} className="fill-amber-700" /> متميزة
                                                </div>
                                            ) : (
                                                <div className="bg-gray-50 text-gray-400 border border-gray-200 px-2 py-1 font-black text-[8px] uppercase tracking-widest">
                                                    عادي
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'compensation' && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 p-4">
                        <div className="flex items-center justify-between mb-4 pb-2 border-b-2 border-gray-950">
                            <div>
                                <h2 className="text-base font-black text-gray-950 dark:text-white uppercase tracking-tighter">حصص التعويضات المعلقة</h2>
                                <p className="text-[9px] font-bold text-gray-400 mt-0.5">الحصص بانتظار تحديد موعد بديل</p>
                            </div>
                            <div className="w-8 h-8 bg-gray-950 flex items-center justify-center text-white dark:bg-white dark:text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)]">
                                <RefreshCw size={16} />
                            </div>
                        </div>

                        <div className="overflow-x-auto bg-white border border-gray-950 dark:bg-gray-800 dark:border-gray-700 shadow-[4px_4px_0px_0px_black]">
                            <table className="w-full text-right border-collapse min-w-[500px]">
                                <thead>
                                    <tr className="bg-gray-950 text-white text-[9px] font-black uppercase tracking-widest border-b border-gray-950">
                                        <th className="px-3 py-2">الطالب</th>
                                        <th className="px-3 py-2">المادة</th>
                                        <th className="px-3 py-2">المعلمة</th>
                                        <th className="px-3 py-2">تاريخ الإلغاء</th>
                                        <th className="px-3 py-2 text-center">الحالة</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {filteredSessions.filter(s => s.needsCompensation && !s.isCompensation && s.status === 'cancelled').map((session, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                            <td className="px-3 py-2">
                                                <div className="text-xs font-black text-gray-950 dark:text-white leading-none">{session.studentName}</div>
                                            </td>
                                            <td className="px-3 py-2">
                                                <div className="text-[10px] font-bold text-gray-500">{session.subject}</div>
                                            </td>
                                            <td className="px-3 py-2">
                                                <div className="text-[10px] font-bold text-gray-500">{session.teacherName}</div>
                                            </td>
                                            <td className="px-3 py-2">
                                                <div className="text-[10px] font-bold text-rose-500 font-mono">{session.date}</div>
                                            </td>
                                            <td className="px-3 py-2 text-center">
                                                <div className="text-[8px] font-black bg-rose-50 text-rose-600 px-2 py-0.5 inline-block border border-rose-100 uppercase tracking-tighter">
                                                    بانتظار التعويض
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredSessions.filter(s => s.needsCompensation && !s.isCompensation && s.status === 'cancelled').length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-3 py-10 text-center text-gray-400 font-black uppercase tracking-widest text-[10px]">
                                                لا توجد حصص تعويضية معلقة
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
