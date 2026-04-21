import React, { useState } from 'react';
import { 
    Calendar, Filter, Download, RefreshCw, Printer, 
    ArrowDownRight,
    TrendingUp, BarChart3, AlertCircle, Users, Receipt, X, Phone, MessageCircle, CheckCircle2, Star,
    Activity as ActivityIcon, Wallet
} from 'lucide-react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { api } from '../lib/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useApp } from '../context/useApp';
import { attendanceService } from '../features/attendance/services/attendanceService';
import { teacherService } from '../features/teachers/services/teacherService';
import { cn } from '../lib/utils';
import { CURRENCY_SYMBOL } from '../config/constants';
import { PageLoader } from '../components/ui/PageLoader';

// --- Salary Slip Modal Component ---
const SalarySlipModal = ({ teacher, month, onClose }: { teacher: any, month: string, onClose: () => void }) => {
    if (!teacher) return null;
    
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" dir="rtl">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none shadow-2xl w-full max-w-xl overflow-hidden md:animate-in md:zoom-in-95 md:duration-200">
                {/* Header */}
                <div className="bg-slate-900 text-white p-6 flex justify-between items-center border-b border-slate-800">
                    <div className="flex items-center gap-3">
                        <Receipt size={24} className="text-emerald-400" />
                        <div>
                            <h2 className="text-lg font-black uppercase tracking-tighter italic leading-none">قسيمة راتب المعلمة</h2>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">سجل مالي معتمد</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 flex items-center justify-center hover:bg-slate-800 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8 space-y-8 overflow-y-auto max-h-[80vh]">
                    {/* Academy & Teacher Info */}
                    <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-6">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">جهة الإصدار</p>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">أكاديمية دارين</h3>
                            <p className="inline-flex items-center gap-2 text-[11px] font-black text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-0.5 mt-2 uppercase tracking-tight italic">الفترة: {month}</p>
                        </div>
                        <div className="text-left space-y-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">اسم المعلمة</p>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none">{teacher.name}</h3>
                            <p className="text-[11px] font-black text-emerald-600 italic uppercase tracking-widest">{teacher.subject}</p>
                        </div>
                    </div>

                    {/* Financial Summary Box */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-6 border border-slate-100 dark:border-slate-800 rounded-none relative">
                            <div className="absolute top-0 right-0 w-1 h-full bg-slate-900"></div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic mb-2">إجمالي الحصص</p>
                            <div className="flex items-baseline gap-2">
                                <p className="text-3xl font-black text-slate-900 dark:text-white font-mono italic leading-none">{teacher.sessionsCount}</p>
                                <span className="text-[10px] font-black text-slate-500 uppercase italic">حصة</span>
                            </div>
                        </div>
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 p-6 border border-emerald-100 dark:border-emerald-800/30 rounded-none relative">
                            <div className="absolute top-0 right-0 w-1 h-full bg-emerald-600"></div>
                            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest italic mb-2">صافي المستحق</p>
                            <div className="flex items-baseline gap-2">
                                <p className="text-4xl font-black text-emerald-700 dark:text-emerald-400 font-mono italic leading-none">
                                    {teacher.totalAmount.toLocaleString()}
                                </p>
                                <span className="text-[10px] font-black text-emerald-600 uppercase italic">{CURRENCY_SYMBOL}</span>
                            </div>
                        </div>
                    </div>

                    {/* Detailed Sessions Table (Mini) */}
                    <div>
                        <h4 className="text-[11px] font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2 uppercase tracking-widest italic leading-none">
                             <div className="w-1.5 h-4 bg-slate-900"></div>
                             بيان الحصص المنجزة
                        </h4>
                        <div className="border border-slate-100 dark:border-slate-800 overflow-hidden text-[11px] bg-slate-50/30 dark:bg-slate-900/30">
                            <table className="w-full text-right">
                                <thead className="bg-slate-900 text-white uppercase tracking-widest italic">
                                    <tr>
                                        <th className="p-3 font-black text-[9px]">التاريخ</th>
                                        <th className="p-3 font-black text-[9px]">الطالب</th>
                                        <th className="p-3 font-black text-[9px] text-center">القيمة</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {teacher.sessionsList?.slice(0, 10).map((s: any, idx: number) => (
                                        <tr key={idx} className="hover:bg-white dark:hover:bg-white/5 transition-colors">
                                            <td className="p-3 font-mono text-[10px] tracking-tight">{s.date}</td>
                                            <td className="p-3 font-black uppercase text-slate-700 dark:text-slate-300 italic">{s.studentName}</td>
                                            <td className="p-3 font-black text-center text-emerald-600 font-mono italic">{s.teacherPrice || teacher.price} {CURRENCY_SYMBOL}</td>
                                        </tr>
                                    ))}
                                    {teacher.sessionsList?.length > 10 && (
                                        <tr>
                                            <td colSpan={3} className="p-2 text-center text-[9px] text-slate-400 font-black italic uppercase bg-slate-50 dark:bg-slate-900/50">
                                                و {teacher.sessionsList.length - 10} حصص أخرى مسجلة في البيان الكامل
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex gap-4 pt-4 no-print">
                        <button 
                            onClick={onClose}
                            className="px-6 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-slate-200 font-black text-[10px] uppercase tracking-widest italic transition-all"
                        >
                            إغلاق
                        </button>
                        <button 
                            onClick={() => window.print()}
                            className="flex-1 bg-slate-900 text-white py-4 font-black text-[10px] flex items-center justify-center gap-3 hover:bg-black transition-all uppercase tracking-[2px] italic shadow-xl shadow-slate-900/10"
                        >
                            <Printer size={16} /> طباعة القسيمة الرسمية
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

    // --- 4. Student Renewals Logic ---
    const renewalsData = students?.flatMap(student => 
        (student.enrollments || []).map(enroll => {
            const remaining = enroll.sessionsTotal - enroll.sessionsUsed;
            const isLow = remaining <= 2;
            
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
        return <PageLoader />;
    }

    return (
        <div className="p-4 lg:p-8 min-h-full bg-white dark:bg-slate-950/20" dir="rtl">
            {/* Premium Header */}
            <div className="relative group mb-10">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-rose-500 to-indigo-500 rounded-none blur opacity-5 group-hover:opacity-10 transition duration-1000"></div>
                
                <div className="relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-none shadow-sm">
                    <div className="absolute -top-12 -right-12 w-48 h-48 bg-rose-50 dark:bg-rose-900/10 rounded-full blur-3xl opacity-50"></div>
                    <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-indigo-50 dark:bg-indigo-900/10 rounded-full blur-3xl opacity-50"></div>
                    
                    <div className="relative z-10 p-3 md:px-6 md:py-8 flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
                        <div className="flex items-center gap-3 md:gap-5 w-full md:w-auto">
                            <div className="relative shrink-0">
                                <div className="w-10 h-10 md:w-16 md:h-16 bg-slate-900 dark:bg-slate-800 flex items-center justify-center text-white shadow-lg rotate-3 group-hover:rotate-0 transition-transform">
                                    <ActivityIcon size={20} className="md:size-32" />
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-3 h-3 md:w-6 md:h-6 bg-rose-500 border-2 border-white dark:border-slate-900 flex items-center justify-center animate-pulse">
                                    <Star size={8} className="text-white md:size-3" />
                                </div>
                            </div>

                            <div className="text-right">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="bg-rose-50 dark:bg-rose-900/40 text-rose-600 text-[8px] md:text-[10px] font-black px-2 py-0.5 uppercase tracking-widest leading-none italic">التحليل المالي والختامي</span>
                                    <AlertCircle size={10} className="text-rose-500 md:size-3" />
                                </div>
                                <h1 className="text-sm md:text-4xl font-black text-slate-800 dark:text-white leading-none tracking-tighter uppercase italic mt-1">تقفيل الحسابات والأنشطة</h1>
                                <div className="flex items-center gap-2 mt-2">
                                    <div className="flex items-center gap-1.5 text-[8px] md:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">
                                        <Calendar size={10} />
                                        <span>الفصل: {semesterName}</span>
                                    </div>
                                    <span className="w-1 h-1 bg-slate-200 dark:bg-slate-700 rounded-full"></span>
                                    <div className="flex items-center gap-1.5 text-[8px] md:text-[10px] font-black text-[#5c59f2] uppercase tracking-widest leading-none italic">
                                        <span>نطاق البحث: {selectedMonth}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 md:gap-3 no-print w-full md:w-auto">
                            <div className="bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 px-3 py-2 flex items-center gap-2 transition-all hover:bg-white dark:hover:bg-slate-700">
                                <span className="text-[9px] font-black text-slate-400 uppercase leading-none">الفصل:</span>
                                <select 
                                    value={semesterName} 
                                    onChange={(e) => setSemesterName(e.target.value)}
                                    className="bg-transparent font-black border-none focus:ring-0 text-xs dark:text-white outline-none cursor-pointer p-0 pr-4"
                                >
                                    {semesterList.map(s => (
                                        <option key={s} value={s} className="dark:bg-slate-800">{s}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 px-3 py-2 flex items-center gap-2 transition-all hover:bg-white dark:hover:bg-slate-700">
                                <Filter size={14} className="text-slate-400" />
                                <input 
                                    type="month" 
                                    className="bg-transparent font-black border-none focus:ring-0 text-xs dark:text-white outline-none cursor-pointer p-0" 
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(e.target.value)}
                                />
                            </div>
                            
                            <button 
                                onClick={handleRefresh}
                                className="w-11 h-11 bg-slate-900 border border-slate-800 text-white hover:bg-black transition-all flex items-center justify-center shadow-lg"
                                title="تحديث البيانات"
                            >
                                <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
                            </button>
                            
                            <button 
                                onClick={() => window.print()}
                                className="px-5 py-3 bg-rose-600 text-white font-black text-xs uppercase tracking-widest transition-all hover:bg-rose-700 shadow-xl shadow-rose-100 dark:shadow-none flex items-center gap-2"
                            >
                                <Printer size={16} />
                                <span>طباعة التقارير</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* High-Performance Stats Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-none relative overflow-hidden group shadow-sm transition-all hover:shadow-xl">
                    <div className="absolute top-0 right-0 w-24 h-full bg-indigo-500/5 -skew-x-12 transform translate-x-12 pointer-events-none transition-transform group-hover:translate-x-8"></div>
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 text-[#5c59f2] flex items-center justify-center shadow-sm">
                            <TrendingUp size={20} />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">الربح المتوقع للمنشأة</p>
                        <div className="flex items-baseline gap-2">
                             <h3 className="text-2xl font-black text-slate-800 dark:text-white tabular-nums tracking-tighter">{netProjectedProfit.toLocaleString()}</h3>
                             <span className="text-[10px] font-black text-slate-400 uppercase">{CURRENCY_SYMBOL}</span>
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-tight italic">هامش الربح التشغيلي</span>
                        <div className="text-[11px] font-black text-[#5c59f2] tabular-nums">
                            {totalProjectedIncome > 0 ? ((netProjectedProfit / totalProjectedIncome) * 100).toFixed(0) : 0}%
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-none relative overflow-hidden group shadow-sm transition-all hover:shadow-xl">
                    <div className="absolute top-0 right-0 w-24 h-full bg-emerald-500/5 -skew-x-12 transform translate-x-12 pointer-events-none transition-transform group-hover:translate-x-8"></div>
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 flex items-center justify-center shadow-sm">
                            <Wallet size={20} />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">إجمالي التحصيلات النقدية</p>
                        <div className="flex items-baseline gap-2">
                             <h3 className="text-2xl font-black text-slate-800 dark:text-white tabular-nums tracking-tighter">{totalActualCollections.toLocaleString()}</h3>
                             <span className="text-[10px] font-black text-slate-400 uppercase">{CURRENCY_SYMBOL}</span>
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-tight italic">صافي التدفق المالي</span>
                        <div className="text-[11px] font-black text-emerald-600 tabular-nums">{netActualCashFlow.toLocaleString()}</div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-none relative overflow-hidden group shadow-sm transition-all hover:shadow-xl">
                    <div className="absolute top-0 right-0 w-24 h-full bg-rose-500/5 -skew-x-12 transform translate-x-12 pointer-events-none transition-transform group-hover:translate-x-8"></div>
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 bg-rose-50 dark:bg-rose-900/20 text-rose-600 flex items-center justify-center shadow-sm">
                            <ArrowDownRight size={20} />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">إجمالي رواتب المعلمات</p>
                        <div className="flex items-baseline gap-2">
                             <h3 className="text-2xl font-black text-slate-800 dark:text-white tabular-nums tracking-tighter">{totalTeacherPayout.toLocaleString()}</h3>
                             <span className="text-[10px] font-black text-slate-400 uppercase">{CURRENCY_SYMBOL}</span>
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-tight italic">إدارة الكوادر التعليمية</span>
                        <div className="text-[11px] font-black text-rose-600 tabular-nums">{payrollData.length} معلمة</div>
                    </div>
                </div>

                <div className="bg-slate-900 text-white p-6 rounded-none relative overflow-hidden group shadow-2xl transition-all hover:shadow-white/5 border-r-4 border-amber-500">
                    <div className="absolute top-0 left-0 w-32 h-full bg-amber-500/5 rotate-12 -translate-x-16 pointer-events-none"></div>
                    <div className="flex items-center justify-between mb-4 relative z-10">
                        <div className="w-10 h-10 bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/20">
                            <ActivityIcon size={20} />
                        </div>
                    </div>
                    <div className="space-y-1 relative z-10">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">حركة النشاط التعليمي</p>
                        <div className="flex items-baseline gap-2">
                             <h3 className="text-3xl font-black text-white tabular-nums tracking-tighter leading-none italic">{filteredSessions.length}</h3>
                             <span className="text-[10px] font-black text-amber-500 uppercase italic">حصة منجزة</span>
                        </div>
                    </div>
                    <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between relative z-10">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-tight italic">متوسط السعر لكل حصة</span>
                        <div className="flex items-center gap-1 text-amber-400 italic">
                             <span className="text-[10px] font-black tabular-nums">{filteredSessions.length > 0 ? (totalProjectedIncome / filteredSessions.length).toFixed(1) : 0}</span>
                             <span className="text-[8px] font-black">ج.م</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="flex border-b border-slate-100 dark:border-slate-800 mb-8 sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl z-40 no-print overflow-x-auto no-scrollbar">
                {[
                    { id: 'payroll', label: 'كشوف الرواتب', icon: Receipt, color: 'text-[#5c59f2]', bar: 'bg-[#5c59f2]' },
                    { id: 'collections', label: 'التحصيلات النقدية', icon: Wallet, color: 'text-emerald-600', bar: 'bg-emerald-600' },
                    { id: 'renewals', label: 'تجديدات الرصيد', icon: AlertCircle, color: 'text-amber-600', bar: 'bg-amber-600' },
                    { id: 'analysis', label: 'تحليل المواد', icon: BarChart3, color: 'text-indigo-600', bar: 'bg-indigo-600' },
                    { id: 'teachers', label: 'أداء الهيئة', icon: Users, color: 'text-slate-900 dark:text-white', bar: 'bg-slate-900 dark:bg-white' },
                    { id: 'compensation', label: 'التعويضات', icon: RefreshCw, color: 'text-rose-600', bar: 'bg-rose-600' },
                    { id: 'summary', label: 'الملخص الاستراتيجي', icon: TrendingUp, color: 'text-slate-900 dark:text-white', bar: 'bg-slate-900 dark:bg-white' }
                ].map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as TabType)}
                        className={cn(
                            "group relative px-6 py-5 text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-3",
                            activeTab === tab.id ? tab.color : "text-slate-400 hover:text-slate-600"
                        )}
                    >
                        <tab.icon size={16} />
                        <span>{tab.label}</span>
                        {activeTab === tab.id && (
                            <div className={cn("absolute bottom-0 left-0 right-0 h-1 animate-in slide-in-from-right duration-300", tab.bar)}></div>
                        )}
                    </button>
                ))}
            </div>

            {/* Tab Contents */}
            <div className="min-h-[500px]">
                {activeTab === 'payroll' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/50">
                            <div className="flex items-center gap-3">
                                <div className="w-1.5 h-6 bg-[#5c59f2]"></div>
                                <div>
                                    <h2 className="text-sm font-black tracking-tight text-slate-800 dark:text-white uppercase italic">كشوف رواتب الهيئة التعليمية</h2>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic leading-none mt-1">مسير الرواتب لشهر {selectedMonth}</p>
                                </div>
                            </div>
                            <button className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white font-black text-[10px] border border-slate-800 shadow-xl hover:bg-black transition-all uppercase tracking-widest italic">
                                <Download size={14} /> 
                                <span>تصدير القوائم المالية</span>
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-right border-collapse">
                                <thead className="bg-slate-900 dark:bg-black border-y border-slate-800">
                                    <tr>
                                        <th className="px-6 py-4 font-black uppercase tracking-widest text-[9px] text-slate-400 italic">بيانات المعلمة</th>
                                        <th className="px-6 py-4 font-black uppercase tracking-widest text-[9px] text-slate-400 italic text-center">إجمالي الحصص</th>
                                        <th className="px-6 py-4 font-black uppercase tracking-widest text-[9px] text-slate-400 italic text-center">الراتب الأساسي</th>
                                        <th className="px-6 py-4 font-black uppercase tracking-widest text-[9px] text-slate-400 italic text-center">تعديلات</th>
                                        <th className="px-6 py-4 font-black uppercase tracking-widest text-[9px] text-slate-400 italic text-center">صافي المستحق</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                    {payrollData.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors group">
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-slate-900 dark:bg-slate-800 flex items-center justify-center text-white font-black text-xs shadow-lg group-hover:bg-[#5c59f2] transition-colors italic">
                                                        {item.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <span className="block font-black text-xs text-slate-800 dark:text-white leading-none mb-1">{item.name}</span>
                                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">{item.subject}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-center font-mono font-black text-base italic text-slate-800 dark:text-white">{item.sessionsCount}</td>
                                            <td className="px-6 py-5 text-center font-mono font-black text-xs text-slate-400 italic tabular-nums">{item.baseAmount.toLocaleString()}</td>
                                            <td className="px-6 py-5 text-center">
                                                <input 
                                                    type="number"
                                                    value={teacherAdjustments[item.id] || ''}
                                                    onChange={(e) => handleTeacherAdjustment(item.id, parseFloat(e.target.value) || 0)}
                                                    className="w-20 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 p-2 text-center font-black text-xs outline-none"
                                                    placeholder="0"
                                                />
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col items-center gap-2">
                                                    <div className="px-4 py-1.5 bg-emerald-600 text-white font-mono font-black text-base italic shadow-lg shadow-emerald-500/10">
                                                        {item.totalAmount.toLocaleString()} <span className="text-[9px]">ج.م</span>
                                                    </div>
                                                    <button onClick={() => setSelectedTeacherForSlip(item)} className="text-[9px] font-black text-[#5c59f2] hover:underline flex items-center gap-1.5 transition-colors italic uppercase tracking-widest">
                                                        <Receipt size={10} /> <span>استخراج القسيمة</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'collections' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/50">
                            <div className="flex items-center gap-3">
                                <div className="w-1.5 h-6 bg-emerald-500"></div>
                                <div>
                                    <h2 className="text-sm font-black tracking-tight text-slate-800 dark:text-white uppercase italic">تحصيل مبالغ الطلاب</h2>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic leading-none mt-1">الدورة المالية لشهر {selectedMonth}</p>
                                </div>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-right border-collapse">
                                <thead className="bg-slate-900 dark:bg-black border-y border-slate-800">
                                    <tr>
                                        <th className="px-6 py-4 font-black uppercase tracking-widest text-[9px] text-slate-400 italic">سجل الطالب</th>
                                        <th className="px-6 py-4 font-black uppercase tracking-widest text-[9px] text-slate-400 italic text-center">المبلغ المستحق</th>
                                        <th className="px-6 py-4 font-black uppercase tracking-widest text-[9px] text-slate-400 italic text-center">تاريخ القيد</th>
                                        <th className="px-6 py-4 font-black uppercase tracking-widest text-[9px] text-slate-400 italic text-center">حالة السداد</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                    {(studentInvoices || []).filter((inv: any) => inv.date.startsWith(selectedMonth)).map((item: any) => (
                                        <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors group">
                                            <td className="px-6 py-5">
                                                <span className="block font-black text-xs text-slate-800 dark:text-white leading-none mb-1">{item.studentName}</span>
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic truncate">{item.description}</span>
                                            </td>
                                            <td className="px-6 py-5 text-center font-mono font-black text-sm text-emerald-600 italic">
                                                {item.amount.toLocaleString()} <span className="text-[10px]">ج.م</span>
                                            </td>
                                            <td className="px-6 py-5 text-center font-mono font-black text-[10px] text-slate-400 whitespace-nowrap">{item.date}</td>
                                            <td className="px-6 py-5 text-center">
                                                <button
                                                    onClick={async () => {
                                                        const newStatus = item.status === 'paid' ? 'pending' : 'paid';
                                                        await api.patch(`/studentInvoices/${item.id}`, { status: newStatus });
                                                        queryClient.invalidateQueries({ queryKey: ['student-invoices-closing'] });
                                                    }}
                                                    className={cn(
                                                        "px-4 py-2 font-black text-[9px] uppercase tracking-[2px] transition-all shadow-lg active:scale-95 text-white",
                                                        item.status === 'paid' ? "bg-emerald-600" : "bg-rose-600"
                                                    )}
                                                >
                                                    {item.status === 'paid' ? 'تم السداد' : 'بانتظار التحصيل'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'renewals' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {renewalsData.map((item, idx) => (
                                <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 relative group transition-all hover:shadow-xl hover:-translate-y-1">
                                    <div className="absolute top-0 right-0 w-1.5 h-full bg-amber-500"></div>
                                    <h3 className="text-base font-black text-slate-800 dark:text-white leading-none tracking-tight mb-2">{item.studentName}</h3>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic mb-6">{item.subject}</p>
                                    <div className="flex justify-between items-center bg-slate-900 p-4 mb-4">
                                        <span className="text-[10px] font-black text-amber-500 uppercase italic">الحصص المتبقية</span>
                                        <span className="text-2xl font-black text-white font-mono italic">{item.remaining}</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 pt-2">
                                        <a href={item.waLink} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 py-3 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest italic"><MessageCircle size={14} /> واتساب</a>
                                        <a href={`tel:${item.phone}`} className="flex items-center justify-center gap-2 py-3 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest italic"><Phone size={14} /> اتصال</a>
                                    </div>
                                </div>
                            ))}
                            {renewalsData.length === 0 && (
                                <div className="col-span-full py-32 text-center text-slate-300 dark:text-slate-700 font-black uppercase tracking-[4px] text-xs italic">
                                    <CheckCircle2 className="mx-auto mb-6 opacity-5" size={80} />
                                    لا توجد تنبيهات تجديد معلقة حاليًا
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'analysis' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 p-8">
                        <div className="h-[400px] w-full mb-12 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={subjectAnalysis}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" fontSize={10} fontStyle="italic" />
                                    <YAxis fontSize={10} fontStyle="italic" />
                                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', color: '#fff', border: 'none', fontStyle: 'italic', fontSize: '10px' }} />
                                    <Bar dataKey="income" name="الإيرادات" fill="#5c59f2" />
                                    <Bar dataKey="payout" name="التكاليف" fill="#f43f5e" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                            {subjectAnalysis.map((subj, idx) => (
                                <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-2 h-full bg-indigo-600"></div>
                                    <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase italic leading-none mb-2">{subj.name}</h3>
                                    <div className="flex justify-between items-baseline mb-6">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">صافي الربح التقديري</p>
                                        <p className="text-xl font-black text-indigo-600 italic font-mono">{subj.profit.toLocaleString()} <span className="text-[10px]">ج.م</span></p>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-[10px] font-black uppercase italic"><span className="text-slate-400">الإيرادات</span><span className="text-slate-900 dark:text-white">{subj.income.toLocaleString()}</span></div>
                                        <div className="flex justify-between text-[10px] font-black uppercase italic"><span className="text-slate-400">التكاليف</span><span className="text-slate-900 dark:text-white">{subj.payout.toLocaleString()}</span></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'teachers' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 p-8 space-y-6">
                        {teacherPerformance.map((perf, idx) => (
                            <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 flex flex-col lg:flex-row items-center justify-between gap-8 group">
                                <div className="flex items-center gap-6 min-w-[300px]">
                                    <div className="w-16 h-16 bg-slate-900 text-white flex items-center justify-center font-black text-2xl italic group-hover:bg-[#5c59f2] transition-colors">{perf.name.charAt(0)}</div>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase italic leading-none mb-1">{perf.name}</h3>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic leading-none">الحصص المخططة: {perf.total}</p>
                                    </div>
                                </div>
                                <div className="flex-1 grid grid-cols-2 md:grid-cols-2 gap-12 w-full">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-[10px] font-black uppercase italic"><span>معدل الحضور</span><span>{perf.attendanceRate.toFixed(0)}%</span></div>
                                        <div className="h-1.5 bg-slate-100 dark:bg-slate-800 overflow-hidden"><div className="h-full bg-emerald-500" style={{ width: `${perf.attendanceRate}%` }} /></div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-[10px] font-black uppercase italic"><span>جودة التوثيق</span><span>{perf.documentationRate.toFixed(0)}%</span></div>
                                        <div className="h-1.5 bg-slate-100 dark:bg-slate-800 overflow-hidden"><div className="h-full bg-[#5c59f2]" style={{ width: `${perf.documentationRate}%` }} /></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'compensation' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="overflow-x-auto">
                            <table className="w-full text-right border-collapse">
                                <thead className="bg-slate-900 dark:bg-black border-y border-slate-800">
                                    <tr>
                                        <th className="px-6 py-4 font-black uppercase tracking-widest text-[9px] text-slate-400 italic">الطالب</th>
                                        <th className="px-6 py-4 font-black uppercase tracking-widest text-[9px] text-slate-400 italic">المعلمة</th>
                                        <th className="px-6 py-4 font-black uppercase tracking-widest text-[9px] text-slate-400 italic text-center">تاريخ الإلغاء</th>
                                        <th className="px-6 py-4 font-black uppercase tracking-widest text-[9px] text-slate-400 italic text-center">الحالة الإلزامية</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                    {filteredSessions.filter(s => s.needsCompensation && s.status === 'cancelled').map((session, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors group">
                                            <td className="px-6 py-5">
                                                <span className="font-black text-xs text-slate-800 dark:text-white uppercase italic">{session.studentName}</span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className="font-black text-xs text-slate-800 dark:text-white uppercase italic">{session.teacherName}</span>
                                            </td>
                                            <td className="px-6 py-5 text-center font-mono font-black text-xs text-rose-500 italic">{session.date}</td>
                                            <td className="px-6 py-5 text-center">
                                                <div className="px-4 py-2 bg-rose-600 text-white font-black text-[9px] uppercase tracking-widest italic">بانتظار التعويض</div>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredSessions.filter(s => s.needsCompensation && s.status === 'cancelled').length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-32 text-center text-slate-300 dark:text-slate-700 font-black uppercase tracking-[4px] text-xs italic">
                                                <CheckCircle2 className="mx-auto mb-6 opacity-5" size={80} />
                                                لا توجد تعويضات معلقة حاليًا
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'summary' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 p-12 bg-slate-900 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 -skew-x-12 transform translate-x-32 -translate-y-32"></div>
                        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-20">
                            <div className="space-y-12">
                                <div>
                                    <h1 className="text-4xl font-black uppercase tracking-tight italic leading-none mb-4">بيان الاستدامة المـالية</h1>
                                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest italic max-w-lg leading-relaxed">تقرير استراتيجي يوضح التوازن بين الإيرادات المحصلة والالتزامات التعليمية المنفذة.</p>
                                </div>
                                <div className="grid grid-cols-1 gap-12">
                                    <div className="border-r-4 border-emerald-500 pr-8">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic mb-2">صافي الربح المتوقع للدورة</p>
                                        <p className="text-5xl font-black italic tabular-nums leading-none">{netProjectedProfit.toLocaleString()} <span className="text-xs">ج.م</span></p>
                                    </div>
                                    <div className="border-r-4 border-indigo-600 pr-8">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic mb-2">إجمالي عوائد المنظومة</p>
                                        <p className="text-5xl font-black italic tabular-nums leading-none">{totalProjectedIncome.toLocaleString()} <span className="text-xs">ج.م</span></p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-12 bg-white/5 border border-white/10 relative group">
                                <div className="absolute top-0 right-0 w-2 h-full bg-emerald-500"></div>
                                <h3 className="text-xs font-black uppercase tracking-[6px] italic text-emerald-400 mb-8">إشعار التدقيق</h3>
                                <div className="space-y-8">
                                    <div className="flex gap-6">
                                        <div className="w-8 h-8 bg-emerald-500 text-slate-950 flex items-center justify-center font-black italic">01</div>
                                        <p className="text-xs font-black leading-relaxed italic opacity-80 uppercase tracking-tight">تم التحقق من كافة الجلسات المكتملة والموثقة وتطابقها مع سجلات الدفع.</p>
                                    </div>
                                    <div className="flex gap-6">
                                        <div className="w-8 h-8 bg-emerald-500 text-slate-950 flex items-center justify-center font-black italic">02</div>
                                        <p className="text-xs font-black leading-relaxed italic opacity-80 uppercase tracking-tight">نسبة التحصيل النقدي الفعلي مقارنة بالتوقعات: {totalProjectedIncome > 0 ? ((totalActualCollections / totalProjectedIncome) * 100).toFixed(0) : 0}%</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Salary Slip Modal */}
            {selectedTeacherForSlip && (
                <SalarySlipModal 
                    teacher={selectedTeacherForSlip} 
                    month={selectedMonth} 
                    onClose={() => setSelectedTeacherForSlip(null)} 
                />
            )}
        </div>
    );
};
