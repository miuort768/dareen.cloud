import React, { useState } from 'react';
import { 
    Calendar, Filter, Download, RefreshCw, Printer, 
    ArrowDownRight,
    TrendingUp, BarChart3, AlertCircle, Users, Receipt, X, Phone, MessageCircle, CheckCircle2,
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

// ── Reusable Styled Components ──────────────────────────────────────────────

const SectionCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={cn(
        'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden',
        className
    )}>
        {children}
    </div>
);

const SectionTitle = ({ icon: Icon, label, sub }: { icon: any; label: string; sub?: string }) => (
    <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-50 dark:border-slate-800">
        <div className="w-8 h-8 flex items-center justify-center bg-[#eef2ff] dark:bg-indigo-900/30 rounded-xl">
            <Icon size={16} className="text-[#5c59f2]" />
        </div>
        <div>
            <p className="text-sm font-bold text-slate-800 dark:text-white">{label}</p>
            {sub && <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>}
        </div>
    </div>
);

const PrimaryBtn = ({ onClick, children, className = '', disabled }: {
    onClick?: () => void; children: React.ReactNode; className?: string; disabled?: boolean;
}) => (
    <button
        disabled={disabled}
        onClick={onClick}
        className={cn(
            'flex items-center justify-center gap-2 bg-[#5c59f2] hover:bg-indigo-700',
            'text-white text-[11px] font-bold px-4 py-2 rounded-xl transition-all shadow-sm active:scale-95',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            className
        )}
    >
        {children}
    </button>
);

const SecondaryBtn = ({ onClick, children, className = '' }: {
    onClick?: () => void; children: React.ReactNode; className?: string;
}) => (
    <button
        onClick={onClick}
        className={cn(
            'flex items-center justify-center gap-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700',
            'text-slate-600 dark:text-slate-300 text-[11px] font-bold px-4 py-2 rounded-xl transition-all',
            className
        )}
    >
        {children}
    </button>
);

const StatItem = ({ title, value, icon: Icon, color, subValue, bg }: { title: string, value: string | number, icon: any, color: string, subValue?: string, bg: string }) => (
    <SectionCard className="p-4 flex flex-col items-center text-center">
        <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center mb-2", bg)}>
            <Icon size={16} className={color} />
        </div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{title}</p>
        <p className="text-sm font-black text-slate-800 dark:text-white mt-0.5">{value}</p>
        {subValue && <p className="text-[9px] text-slate-400 mt-0.5">{subValue}</p>}
    </SectionCard>
);

// --- Salary Slip Modal Component ---
const SalarySlipModal = ({ teacher, month, onClose }: { teacher: any, month: string, onClose: () => void }) => {
    if (!teacher) return null;
    
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" dir="rtl">
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden md:animate-in md:zoom-in-95 md:duration-200">
                {/* Header */}
                <div className="bg-slate-900 text-white p-5 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                            <Receipt size={20} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold">قسيمة راتب المعلمة</h2>
                            <p className="text-[10px] text-slate-400 uppercase tracking-wider">سجل مالي معتمد • {month}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center hover:bg-slate-800 rounded-lg transition-colors">
                        <X size={18} />
                    </button>
                </div>

                <div className="p-6 space-y-6 overflow-y-auto max-h-[80vh]">
                    <div className="flex justify-between items-start pb-6 border-b border-slate-50 dark:border-slate-800">
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">المعلمة</p>
                            <h3 className="text-lg font-black text-slate-800 dark:text-white">{teacher.name}</h3>
                            <p className="text-[10px] font-bold text-[#5c59f2] bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-md inline-block mt-1">{teacher.subject}</p>
                        </div>
                        <div className="text-left">
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">التاريخ</p>
                            <p className="text-xs font-black text-slate-800 dark:text-white">{new Date().toLocaleDateString('ar-EG')}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">إجمالي الحصص</p>
                            <p className="text-2xl font-black text-slate-800 dark:text-white font-mono">{teacher.sessionsCount}</p>
                        </div>
                        <div className="bg-[#eef2ff] dark:bg-indigo-900/20 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-800/30">
                            <p className="text-[10px] font-bold text-[#5c59f2] uppercase mb-1">صافي المستحق</p>
                            <div className="flex items-baseline gap-1">
                                <p className="text-2xl font-black text-[#5c59f2] font-mono">{teacher.totalAmount.toLocaleString()}</p>
                                <span className="text-[10px] font-bold text-[#5c59f2] uppercase">{CURRENCY_SYMBOL}</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <SectionTitle icon={ActivityIcon} label="بيان الحصص التفصيلي" />
                        <div className="border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden">
                            <table className="w-full text-right text-[11px]">
                                <thead className="bg-slate-50 dark:bg-slate-800">
                                    <tr>
                                        <th className="p-2.5 font-bold text-slate-500">التاريخ</th>
                                        <th className="p-2.5 font-bold text-slate-500">الطالب</th>
                                        <th className="p-2.5 font-bold text-slate-500 text-center">القيمة</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                    {teacher.sessionsList?.slice(0, 10).map((s: any, idx: number) => (
                                        <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="p-2.5 font-mono text-slate-600 dark:text-slate-400">{s.date}</td>
                                            <td className="p-2.5 font-bold text-slate-700 dark:text-slate-300">{s.studentName}</td>
                                            <td className="p-2.5 font-bold text-center text-emerald-600 font-mono">{s.teacherPrice || teacher.price} {CURRENCY_SYMBOL}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {teacher.sessionsList?.length > 10 && (
                            <p className="text-[10px] text-center text-slate-400 mt-2 italic">... و {teacher.sessionsList.length - 10} حصص أخرى في السجل</p>
                        )}
                    </div>

                    <div className="flex gap-3 pt-2 no-print">
                        <SecondaryBtn onClick={onClose} className="flex-1">إغلاق</SecondaryBtn>
                        <PrimaryBtn onClick={() => window.print()} className="flex-[2] py-3 shadow-indigo-500/10">
                            <Printer size={16} /> طباعة القسيمة الرسمية
                        </PrimaryBtn>
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
        <div className="min-h-full bg-[#f1f5f9] dark:bg-[#020617] pb-20 font-sans" dir="rtl">
            {/* Header */}
            <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-4 md:px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 flex items-center justify-center bg-rose-50 dark:bg-rose-900/30 rounded-xl">
                        <ActivityIcon size={18} className="text-rose-500" />
                    </div>
                    <div>
                        <h1 className="text-sm font-bold text-slate-800 dark:text-white">تقفيل الحسابات والأنشطة المالية</h1>
                        <p className="text-[10px] text-slate-400 italic">التحليل المالي والختامي للفترة الحالية</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 no-print">
                    <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-700">
                        <Calendar size={14} className="text-slate-400" />
                        <select 
                            value={semesterName} 
                            onChange={(e) => setSemesterName(e.target.value)}
                            className="bg-transparent border-none p-0 text-[11px] font-bold text-slate-700 dark:text-slate-200 outline-none focus:ring-0 cursor-pointer"
                        >
                            {semesterList.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>

                    <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-700">
                        <Filter size={14} className="text-slate-400" />
                        <input 
                            type="month" 
                            className="bg-transparent border-none p-0 text-[11px] font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer" 
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                        />
                    </div>
                    
                    <button onClick={handleRefresh} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all">
                        <RefreshCw size={16} className={cn("text-slate-400", isLoading && "animate-spin")} />
                    </button>
                    
                    <PrimaryBtn onClick={() => window.print()} className="py-2 px-3 bg-slate-900 hover:bg-black">
                        <Printer size={14} />
                        طباعة
                    </PrimaryBtn>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 px-4 md:px-6 py-4">
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

            {/* Navigation Tabs */}
            <div className="px-4 md:px-6 mb-4">
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-1 flex overflow-x-auto no-scrollbar gap-1">
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
                                "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold transition-all whitespace-nowrap",
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

            {/* Tab Contents */}
            <div className="px-4 md:px-6 md:animate-in md:fade-in md:duration-500">
                {activeTab === 'payroll' && (
                    <SectionCard>
                        <div className="p-4 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center">
                            <SectionTitle icon={Receipt} label="مسير رواتب المعلمات" sub={`دورة شهر ${selectedMonth}`} />
                            <SecondaryBtn className="h-8 text-[10px]">
                                <Download size={14} /> تصدير PDF
                            </SecondaryBtn>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-right">
                                <thead className="bg-slate-50 dark:bg-slate-800">
                                    <tr>
                                        <th className="px-4 py-3 font-bold text-[10px] text-slate-500 uppercase tracking-wider">المعلمة</th>
                                        <th className="px-4 py-3 font-bold text-[10px] text-slate-500 text-center">الحصص</th>
                                        <th className="px-4 py-3 font-bold text-[10px] text-slate-500 text-center">الأساسي</th>
                                        <th className="px-4 py-3 font-bold text-[10px] text-slate-500 text-center">تعديلات</th>
                                        <th className="px-4 py-3 font-bold text-[10px] text-slate-500 text-center">الصافي</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                    {payrollData.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-slate-900 dark:bg-slate-800 flex items-center justify-center text-white font-bold text-[10px] rounded-lg">
                                                        {item.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <span className="block font-bold text-xs text-slate-800 dark:text-white leading-tight">{item.name}</span>
                                                        <span className="text-[9px] text-slate-400 font-medium">{item.subject}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-center font-bold text-xs text-slate-700 dark:text-slate-300">{item.sessionsCount}</td>
                                            <td className="px-4 py-4 text-center font-bold text-xs text-slate-400">{item.baseAmount.toLocaleString()}</td>
                                            <td className="px-4 py-4 text-center">
                                                <input 
                                                    type="number"
                                                    value={teacherAdjustments[item.id] || ''}
                                                    onChange={(e) => handleTeacherAdjustment(item.id, parseFloat(e.target.value) || 0)}
                                                    className="w-16 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1 text-center font-bold text-[10px] outline-none focus:border-[#5c59f2]"
                                                    placeholder="0"
                                                />
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex flex-col items-center gap-1.5">
                                                    <span className="font-bold text-xs text-emerald-600">{item.totalAmount.toLocaleString()} ج.م</span>
                                                    <button onClick={() => setSelectedTeacherForSlip(item)} className="text-[9px] font-bold text-[#5c59f2] hover:underline flex items-center gap-1">
                                                        <Receipt size={10} /> القسيمة
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </SectionCard>
                )}

                {activeTab === 'collections' && (
                    <SectionCard>
                        <div className="p-4 border-b border-slate-50 dark:border-slate-800">
                            <SectionTitle icon={Wallet} label="سجل التحصيلات النقدية" sub="مدفوعات الطلاب المسجلة" />
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-right">
                                <thead className="bg-slate-50 dark:bg-slate-800">
                                    <tr>
                                        <th className="px-4 py-3 font-bold text-[10px] text-slate-500 uppercase tracking-wider">الطالب</th>
                                        <th className="px-4 py-3 font-bold text-[10px] text-slate-500 text-center">المبلغ</th>
                                        <th className="px-4 py-3 font-bold text-[10px] text-slate-500 text-center">التاريخ</th>
                                        <th className="px-4 py-3 font-bold text-[10px] text-slate-500 text-center">الحالة</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                    {(studentInvoices || []).filter((inv: any) => inv.date.startsWith(selectedMonth)).map((item: any) => (
                                        <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                            <td className="px-4 py-4">
                                                <span className="block font-bold text-xs text-slate-800 dark:text-white mb-0.5">{item.studentName}</span>
                                                <span className="text-[9px] text-slate-400 font-medium line-clamp-1">{item.description}</span>
                                            </td>
                                            <td className="px-4 py-4 text-center font-bold text-xs text-emerald-600">
                                                {item.amount.toLocaleString()} ج.م
                                            </td>
                                            <td className="px-4 py-4 text-center text-[10px] text-slate-400 font-mono">{item.date}</td>
                                            <td className="px-4 py-4 text-center">
                                                <button
                                                    onClick={async () => {
                                                        const newStatus = item.status === 'paid' ? 'pending' : 'paid';
                                                        await api.patch(`/studentInvoices/${item.id}`, { status: newStatus });
                                                        queryClient.invalidateQueries({ queryKey: ['student-invoices-closing'] });
                                                    }}
                                                    className={cn(
                                                        "px-3 py-1 rounded-lg font-bold text-[9px] uppercase transition-all shadow-sm active:scale-95 text-white",
                                                        item.status === 'paid' ? "bg-emerald-600" : "bg-rose-600"
                                                    )}
                                                >
                                                    {item.status === 'paid' ? 'تم التحصيل' : 'انتظار'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </SectionCard>
                )}

                {activeTab === 'renewals' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {renewalsData.map((item, idx) => (
                            <SectionCard key={idx} className="p-5 flex flex-col justify-between h-full">
                                <div>
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-800 dark:text-white leading-tight">{item.studentName}</h3>
                                            <p className="text-[10px] font-bold text-[#5c59f2] mt-0.5">{item.subject}</p>
                                        </div>
                                        <div className="px-2 py-0.5 bg-amber-50 dark:bg-amber-900/30 text-amber-600 rounded-md text-[9px] font-bold">رصيد منخفض</div>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 flex items-center justify-between mb-4 border border-slate-100 dark:border-slate-800">
                                        <span className="text-[10px] font-bold text-slate-400">الحصص المتبقية</span>
                                        <span className="text-lg font-black text-slate-800 dark:text-white font-mono">{item.remaining}</span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <button onClick={() => window.open(item.waLink, '_blank')} className="flex items-center justify-center gap-1.5 py-2 bg-emerald-600 text-white text-[10px] font-bold rounded-xl hover:bg-emerald-700 transition-all"><MessageCircle size={14} /> واتساب</button>
                                    <a href={`tel:${item.phone}`} className="flex items-center justify-center gap-1.5 py-2 bg-slate-900 text-white text-[10px] font-bold rounded-xl hover:bg-black transition-all"><Phone size={14} /> اتصال</a>
                                </div>
                            </SectionCard>
                        ))}
                        {renewalsData.length === 0 && (
                            <div className="col-span-full py-20 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                                <CheckCircle2 className="mx-auto mb-3 text-slate-100 dark:text-slate-800" size={48} />
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">لا توجد تجديدات مطلوبة</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'analysis' && (
                    <div className="space-y-6">
                        <SectionCard className="p-6">
                            <SectionTitle icon={BarChart3} label="تحليل ربحية المواد العلمية" sub="مقارنة الإيرادات مقابل المصاريف" />
                            <div className="h-[300px] w-full mt-6">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={subjectAnalysis}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="name" fontSize={9} fontStyle="italic" />
                                        <YAxis fontSize={9} fontStyle="italic" />
                                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '12px', border: 'none', fontSize: '10px' }} />
                                        <Bar dataKey="income" name="الإيرادات" fill="#5c59f2" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="payout" name="التكاليف" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </SectionCard>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {subjectAnalysis.map((subj, idx) => (
                                <SectionCard key={idx} className="p-5 border-t-4 border-indigo-600">
                                    <h3 className="text-xs font-bold text-slate-800 dark:text-white mb-3">{subj.name}</h3>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center text-[10px]">
                                            <span className="text-slate-400">صافي الربح</span>
                                            <span className="font-bold text-indigo-600">{subj.profit.toLocaleString()} ج.م</span>
                                        </div>
                                        <div className="h-1 bg-slate-50 dark:bg-slate-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-indigo-500" style={{ width: `${Math.min(100, (subj.profit/subj.income)*100)}%` }} />
                                        </div>
                                        <div className="flex justify-between items-center text-[9px] text-slate-400 mt-1">
                                            <span>النشاط: {subj.sessionsCount} حصة</span>
                                        </div>
                                    </div>
                                </SectionCard>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'teachers' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {teacherPerformance.map((perf, idx) => (
                            <SectionCard key={idx} className="p-5 flex items-center gap-4">
                                <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-bold text-lg">
                                    {perf.name.charAt(0)}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-sm font-bold text-slate-800 dark:text-white">{perf.name}</h3>
                                        <span className="text-[9px] font-bold text-slate-400 uppercase">{perf.total} حصة</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-[8px] font-bold text-slate-400 uppercase"><span>الحضور</span><span>{perf.attendanceRate.toFixed(0)}%</span></div>
                                            <div className="h-1 bg-slate-50 dark:bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-emerald-500" style={{ width: `${perf.attendanceRate}%` }} /></div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-[8px] font-bold text-slate-400 uppercase"><span>التوثيق</span><span>{perf.documentationRate.toFixed(0)}%</span></div>
                                            <div className="h-1 bg-slate-50 dark:bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-[#5c59f2]" style={{ width: `${perf.documentationRate}%` }} /></div>
                                        </div>
                                    </div>
                                </div>
                            </SectionCard>
                        ))}
                    </div>
                )}

                {activeTab === 'compensation' && (
                    <SectionCard>
                        <div className="p-4 border-b border-slate-50 dark:border-slate-800">
                            <SectionTitle icon={RefreshCw} label="سجل حصص التعويض المعلقة" sub="الإلغاءات التي تتطلب إعادة جدولة" />
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-right">
                                <thead className="bg-slate-50 dark:bg-slate-800">
                                    <tr>
                                        <th className="px-4 py-3 font-bold text-[10px] text-slate-500 uppercase tracking-wider">الطالب</th>
                                        <th className="px-4 py-3 font-bold text-[10px] text-slate-500">المعلمة</th>
                                        <th className="px-4 py-3 font-bold text-[10px] text-slate-500 text-center">التاريخ</th>
                                        <th className="px-4 py-3 font-bold text-[10px] text-slate-500 text-center">الحالة</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                    {filteredSessions.filter(s => s.needsCompensation && s.status === 'cancelled').map((session, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                            <td className="px-4 py-4 text-xs font-bold text-slate-800 dark:text-white">{session.studentName}</td>
                                            <td className="px-4 py-4 text-xs font-bold text-slate-600 dark:text-slate-400">{session.teacherName}</td>
                                            <td className="px-4 py-4 text-center font-mono text-[10px] text-rose-500">{session.date}</td>
                                            <td className="px-4 py-4 text-center">
                                                <div className="inline-block px-2 py-0.5 bg-rose-50 dark:bg-rose-900/30 text-rose-600 text-[9px] font-bold rounded-md">تعويض معلق</div>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredSessions.filter(s => s.needsCompensation && s.status === 'cancelled').length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-20 text-center">
                                                <CheckCircle2 className="mx-auto mb-3 text-slate-100 dark:text-slate-800" size={48} />
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">لا توجد تعويضات معلقة</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </SectionCard>
                )}

                {activeTab === 'summary' && (
                    <SectionCard className="p-8 bg-slate-900 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12">
                            <div>
                                <h2 className="text-2xl font-black mb-4">الملخص المالي الاستراتيجي</h2>
                                <p className="text-xs text-slate-400 mb-8 max-w-md leading-relaxed">تقرير يوضح التوازن بين الإيرادات المحصلة والالتزامات التعليمية المنفذة خلال هذه الفترة المالية.</p>
                                <div className="space-y-6">
                                    <div className="border-r-4 border-emerald-500 pr-6">
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">صافي الربح المتوقع</p>
                                        <p className="text-4xl font-black italic">{netProjectedProfit.toLocaleString()} <span className="text-xs">ج.م</span></p>
                                    </div>
                                    <div className="border-r-4 border-indigo-500 pr-6">
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">إجمالي عوائد المنظومة</p>
                                        <p className="text-4xl font-black italic">{totalProjectedIncome.toLocaleString()} <span className="text-xs">ج.م</span></p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                                <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-6">ملاحظات التدقيق</h3>
                                <div className="space-y-6">
                                    <div className="flex gap-4">
                                        <div className="shrink-0 w-6 h-6 bg-emerald-500 rounded-lg flex items-center justify-center font-bold text-slate-950 text-xs italic">1</div>
                                        <p className="text-[11px] font-medium leading-relaxed opacity-80 italic">تم التحقق من تطابق الجلسات الموثقة مع سجلات الدفع والتحصيل النقدي الفعلي.</p>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="shrink-0 w-6 h-6 bg-emerald-500 rounded-lg flex items-center justify-center font-bold text-slate-950 text-xs italic">2</div>
                                        <p className="text-[11px] font-medium leading-relaxed opacity-80 italic">نسبة التحصيل الفعلي: {totalProjectedIncome > 0 ? ((totalActualCollections / totalProjectedIncome) * 100).toFixed(0) : 0}% من التوقعات.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </SectionCard>
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
