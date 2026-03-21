
import React, { useState } from 'react';
import { 
    Calendar, 
    TrendingUp, 
    Users, 
    ArrowUpRight, 
    ArrowDownRight,
    Download,
    Phone,
    MessageCircle,
    CheckCircle2,
    AlertCircle,
    Presentation,
    Filter,
    BarChart3,
    Receipt,
    X,
    Printer
} from 'lucide-react';

// --- Salary Slip Modal Component ---
const SalarySlipModal = ({ teacher, month, onClose }: { teacher: any, month: string, onClose: () => void }) => {
    if (!teacher) return null;
    
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" dir="rtl">
            <div className="bg-white dark:bg-gray-900 border-4 border-gray-950 shadow-[15px_15px_0px_0px_black] w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="bg-gray-950 text-white p-6 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Receipt size={24} className="text-emerald-400" />
                        <h2 className="text-xl font-black uppercase tracking-tighter">قسيمة راتب المعلمة</h2>
                    </div>
                    <button onClick={onClose} className="hover:rotate-90 transition-transform">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-8 space-y-8 overflow-y-auto max-h-[80vh]">
                    {/* Academy & Teacher Info */}
                    <div className="flex justify-between items-start border-b-4 border-gray-100 dark:border-gray-800 pb-6">
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase mb-1">جهة الإصدار</p>
                            <h3 className="text-2xl font-black text-gray-950 dark:text-white mb-2">أكاديمية دارين التعليمية</h3>
                            <p className="text-xs font-bold text-gray-500">الفترة: {month}</p>
                        </div>
                        <div className="text-left">
                            <p className="text-[10px] font-black text-gray-400 uppercase mb-1">اسم المعلمة</p>
                            <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">{teacher.name}</h3>
                            <p className="text-xs font-bold text-emerald-600">{teacher.subject}</p>
                        </div>
                    </div>

                    {/* Financial Summary Box */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 dark:bg-gray-800/50 p-6 border-2 border-gray-950">
                            <p className="text-[10px] font-black text-gray-400 uppercase mb-1">إجمالي عدد الحصص</p>
                            <p className="text-3xl font-black text-gray-900 dark:text-white font-mono">{teacher.sessionsCount}</p>
                        </div>
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 p-6 border-2 border-gray-950">
                            <p className="text-[10px] font-black text-emerald-600 uppercase mb-1">صافي المستحق</p>
                            <p className="text-3xl font-black text-emerald-700 dark:text-emerald-400 font-mono">
                                {teacher.totalAmount.toLocaleString()} <span className="text-xs uppercase">ج.م</span>
                            </p>
                        </div>
                    </div>

                    {/* Detailed Sessions Table (Mini) */}
                    <div>
                        <h4 className="text-sm font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                             بيان الحصص المنجزة
                        </h4>
                        <div className="border-2 border-gray-100 dark:border-gray-800 rounded-none overflow-hidden text-sm">
                            <table className="w-full text-right">
                                <thead className="bg-gray-50 dark:bg-gray-800">
                                    <tr>
                                        <th className="p-3 font-black text-xs border-l border-gray-100 dark:border-gray-700">التاريخ</th>
                                        <th className="p-3 font-black text-xs border-l border-gray-100 dark:border-gray-700">الطالب</th>
                                        <th className="p-3 font-black text-xs">القيمة</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {teacher.sessionsList?.slice(0, 10).map((s: any, idx: number) => (
                                        <tr key={idx}>
                                            <td className="p-3 border-l border-gray-50 dark:border-gray-800 font-mono text-xs">{s.date}</td>
                                            <td className="p-3 border-l border-gray-50 dark:border-gray-800 font-bold">{s.studentName}</td>
                                            <td className="p-3 font-bold">{s.teacherPrice || teacher.price} ج.م</td>
                                        </tr>
                                    ))}
                                    {teacher.sessionsList?.length > 10 && (
                                        <tr>
                                            <td colSpan={3} className="p-2 text-center text-[10px] text-gray-400 font-bold italic">
                                                و {teacher.sessionsList.length - 10} حصص أخرى في السجل...
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex gap-4 pt-4">
                        <button 
                            onClick={() => window.print()}
                            className="flex-1 bg-gray-900 text-white py-4 font-black flex items-center justify-center gap-3 hover:bg-black transition-all"
                        >
                            <Printer size={18} /> طباعة القسيمة
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
import { useQuery } from '@tanstack/react-query';
import { attendanceService } from '../features/attendance/services/attendanceService';
import { teacherService } from '../features/teachers/services/teacherService';
import { cn } from '../lib/utils';
import { CURRENCY_SYMBOL } from '../config/constants';

type TabType = 'payroll' | 'renewals' | 'summary' | 'analysis' | 'teachers';

export const MonthlyClosing: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabType>('payroll');
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
    const [selectedTeacherForSlip, setSelectedTeacherForSlip] = useState<any>(null);

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

    const isLoading = sessionsLoading || teachersLoading || studentsLoading;

    // Filter sessions by month
    const filteredSessions = sessions?.filter(s => s.date.startsWith(selectedMonth)) || [];

    // --- 1. Teacher Payroll Logic ---
    const payrollData = teachers?.map(teacher => {
        const teacherSessions = filteredSessions.filter(s => 
            s.teacherName?.trim() === teacher.name?.trim() && 
            s.status === 'completed'
        );
        const totalAmount = teacherSessions.reduce((acc, curr) => acc + (curr.teacherPrice || teacher.price || 0), 0);
        return {
            ...teacher,
            sessionsCount: teacherSessions.length,
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
        
        // Quality metric: How many completed sessions have topics/homework written
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
        (student.enrollments || []).map(enroll => ({
            studentName: student.name,
            phone: student.parentPhone || '',
            subject: enroll.subject,
            remaining: enroll.sessionsTotal - enroll.sessionsUsed,
            total: enroll.sessionsTotal,
            isLow: (enroll.sessionsTotal - enroll.sessionsUsed) <= 2
        }))
    ).filter(item => item.isLow).sort((a, b) => a.remaining - b.remaining) || [];

    // --- 3. Summary Stats ---
    const totalIncome = filteredSessions.reduce((acc, curr) => acc + (curr.price || 0), 0);
    const totalTeacherPayout = payrollData.reduce((acc, curr) => acc + curr.totalAmount, 0);
    const netProfit = totalIncome - totalTeacherPayout;

    if (isLoading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <div className="w-12 h-12 border-4 border-gray-200 border-t-emerald-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="p-4 lg:p-10 min-h-screen bg-gray-50/50 dark:bg-gray-950/50" dir="rtl">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter flex items-center gap-4 mb-2">
                        <div className="w-1.5 h-12 bg-rose-600 border-2 border-gray-950 dark:border-gray-800"></div>
                        تقفيل الحسابات والأنشطة الشهرية
                    </h1>
                    <p className="text-gray-500 font-bold flex items-center gap-2">
                        <Calendar size={16} /> إدارة رواتب المعلمات ومتابعة اشتراكات الطلاب
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="bg-white border-2 border-gray-950 shadow-[4px_4px_0px_0px_black] px-4 py-2 flex items-center gap-3 dark:bg-gray-900 dark:border-gray-800">
                        <Filter size={18} className="text-gray-400" />
                        <input 
                            type="month" 
                            className="bg-transparent font-black border-none focus:ring-0 text-sm dark:text-white" 
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Quick Summary Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white border-2 border-gray-950 p-6 shadow-[8px_8px_0px_0px_black] dark:bg-gray-900 dark:border-gray-800 group transition-transform hover:translate-y-[-4px]">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">صافي ربح الشهر المتوقع</p>
                    <div className="flex items-end justify-between">
                        <div>
                            <h3 className="text-3xl font-black text-emerald-600 font-mono tracking-tighter">
                                {netProfit.toLocaleString()} <span className="text-xs uppercase opacity-70">{CURRENCY_SYMBOL}</span>
                            </h3>
                        </div>
                        <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center border-2 border-emerald-600">
                            <TrendingUp size={24} className="text-emerald-600" />
                        </div>
                    </div>
                </div>
                
                <div className="bg-white border-2 border-gray-950 p-6 shadow-[8px_8px_0px_0px_black] dark:bg-gray-900 dark:border-gray-800 group transition-transform hover:translate-y-[-4px]">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">إجمالي رواتب المعلمات</p>
                    <div className="flex items-end justify-between">
                        <div>
                            <h3 className="text-3xl font-black text-rose-600 font-mono tracking-tighter">
                                {totalTeacherPayout.toLocaleString()} <span className="text-xs uppercase opacity-70">{CURRENCY_SYMBOL}</span>
                            </h3>
                        </div>
                        <div className="w-12 h-12 bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center border-2 border-rose-600 text-rose-600">
                            <ArrowDownRight size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-white border-2 border-gray-950 p-6 shadow-[8px_8px_0px_0px_black] dark:bg-gray-900 dark:border-gray-800 group transition-transform hover:translate-y-[-4px]">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">طلاب بحاجة للتجديد</p>
                    <div className="flex items-end justify-between">
                        <div>
                            <h3 className="text-3xl font-black text-amber-600 font-mono tracking-tighter">
                                {renewalsData.length} <span className="text-xs uppercase opacity-70">طالب</span>
                            </h3>
                        </div>
                        <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center border-2 border-amber-600 text-amber-600 font-black text-xl">
                            !
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="flex border-2 border-gray-950 p-1 mb-8 bg-white dark:bg-gray-900 dark:border-gray-800 max-w-fit shadow-[4px_4px_0px_0px_black]">
                <button 
                    onClick={() => setActiveTab('payroll')}
                    className={cn(
                        "px-8 py-3 text-sm font-black transition-all flex items-center gap-3",
                        activeTab === 'payroll' ? "bg-gray-950 text-white dark:bg-white dark:text-gray-950" : "hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400"
                    )}
                >
                    <Presentation size={18} /> رواتب المعلمات
                </button>
                <button 
                    onClick={() => setActiveTab('renewals')}
                    className={cn(
                        "px-8 py-3 text-sm font-black transition-all flex items-center gap-3",
                        activeTab === 'renewals' ? "bg-gray-950 text-white dark:bg-white dark:text-gray-950" : "hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400"
                    )}
                >
                    <Users size={18} /> تجديد الاشتراكات
                </button>
                <button 
                    onClick={() => setActiveTab('summary')}
                    className={cn(
                        "px-8 py-3 text-sm font-black transition-all flex items-center gap-3",
                        activeTab === 'summary' ? "bg-gray-950 text-white dark:bg-white dark:text-gray-950" : "hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400"
                    )}
                >
                    <ArrowUpRight size={18} /> ملخص الأداء
                </button>
                <button 
                    onClick={() => setActiveTab('analysis')}
                    className={cn(
                        "px-8 py-3 text-sm font-black transition-all flex items-center gap-3",
                        activeTab === 'analysis' ? "bg-gray-950 text-white dark:bg-white dark:text-gray-950" : "hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400"
                    )}
                >
                    <BarChart3 size={18} /> تحليل المواد
                </button>
                <button 
                    onClick={() => setActiveTab('teachers')}
                    className={cn(
                        "px-8 py-3 text-sm font-black transition-all flex items-center gap-3",
                        activeTab === 'teachers' ? "bg-gray-950 text-white dark:bg-white dark:text-gray-950" : "hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400"
                    )}
                >
                    <Users size={18} /> تحليل المعلمات
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
                {activeTab === 'payroll' && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <div className="p-6 border-b-2 border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-950">
                            <h2 className="text-lg font-black tracking-tight text-gray-900 dark:text-white">رواتب معلمات الأكاديمية - {selectedMonth}</h2>
                            <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white font-black text-xs border-2 border-gray-950 shadow-[4px_4px_0px_0px_black] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all">
                                <Download size={14} /> تصدير PDF للمعلمات
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-right border-collapse">
                                <thead className="bg-gray-900 text-white dark:bg-black">
                                    <tr>
                                        <th className="px-6 py-4 font-black uppercase tracking-tighter text-[11px] border-l border-white/10">المعلمة</th>
                                        <th className="px-6 py-4 font-black uppercase tracking-tighter text-[11px] border-l border-white/10">المادة</th>
                                        <th className="px-6 py-4 font-black uppercase tracking-tighter text-[11px] border-l border-white/10 text-center">الحصص المكتملة</th>
                                        <th className="px-6 py-4 font-black uppercase tracking-tighter text-[11px] border-l border-white/10 text-center">سعر الحصة للمعلمة</th>
                                        <th className="px-6 py-4 font-black uppercase tracking-tighter text-[11px] text-center">المستحقات الإجمالية</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y-2 divide-gray-100 dark:divide-gray-800">
                                    {payrollData.length > 0 ? payrollData.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                                            <td className="px-6 py-5 border-l border-gray-100 dark:border-gray-800">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gray-900 border-2 border-gray-950 flex items-center justify-center text-white font-black dark:bg-white dark:text-black">
                                                        {item.name.charAt(0)}
                                                    </div>
                                                    <span className="font-black text-gray-900 dark:text-white">{item.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 border-l border-gray-100 dark:border-gray-800">
                                                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-[10px] font-black border border-gray-200 dark:border-gray-700 dark:text-gray-300">{item.subject}</span>
                                            </td>
                                            <td className="px-6 py-5 border-l border-gray-100 dark:border-gray-800 text-center font-mono font-black text-lg dark:text-white">
                                                {item.sessionsCount}
                                            </td>
                                            <td className="px-6 py-5 border-l border-gray-100 dark:border-gray-800 text-center font-mono font-black dark:text-white">
                                                {item.price?.toLocaleString()} <span className="text-[10px] opacity-30">{CURRENCY_SYMBOL}</span>
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <div className="flex flex-col items-center gap-2">
                                                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-950 text-white font-mono font-black text-xl shadow-[4px_4px_0px_0px_rgba(31,41,55,0.2)] dark:bg-white dark:text-gray-950">
                                                        {item.totalAmount.toLocaleString()} <span className="text-[11px]">{CURRENCY_SYMBOL}</span>
                                                    </div>
                                                    <button 
                                                        onClick={() => setSelectedTeacherForSlip(item)}
                                                        className="text-[10px] font-black text-emerald-600 hover:text-emerald-700 underline underline-offset-4 flex items-center gap-1"
                                                    >
                                                        <Receipt size={10} /> عرض قسيمة الراتب
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
                        <div className="p-6 border-b-2 border-gray-100 dark:border-gray-800 bg-amber-50 dark:bg-amber-900/10">
                            <h2 className="text-lg font-black tracking-tight text-amber-700 dark:text-amber-500 flex items-center gap-3">
                                <AlertCircle size={20} /> تنبيهات الطلاب الموشكين على إنهاء رصيد الحصص
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                            {renewalsData.length > 0 ? renewalsData.map((item, idx) => (
                                <div key={idx} className="bg-white border-4 border-gray-950 p-6 relative group dark:bg-gray-900 dark:border-gray-800 shadow-[8px_8px_0px_0px_black] hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
                                    <div className="absolute top-4 left-4">
                                        <div className={cn(
                                            "w-10 h-10 border-2 border-gray-950 flex flex-col items-center justify-center font-black shadow-[2px_2px_0px_0px_black]",
                                            item.remaining === 0 ? "bg-rose-600 text-white" : "bg-amber-400 text-gray-900"
                                        )}>
                                            <span className="text-xl leading-none">{item.remaining}</span>
                                            <span className="text-[8px] uppercase">باقي</span>
                                        </div>
                                    </div>
                                    <div className="mb-4">
                                        <h3 className="text-xl font-black text-gray-900 dark:text-white mb-1">{item.studentName}</h3>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.subject}</p>
                                    </div>
                                    <div className="pt-4 border-t-2 border-gray-100 dark:border-gray-800 space-y-3">
                                        <div className="flex items-center justify-between text-xs font-bold text-gray-500">
                                            <span>الرصيد الأصلي:</span>
                                            <span className="text-gray-900 dark:text-white font-black">{item.total} حصص</span>
                                        </div>
                                        <div className="w-full bg-gray-100 h-2 dark:bg-gray-800 mt-2">
                                            <div 
                                                className={cn("h-full", item.remaining === 0 ? "bg-rose-600" : "bg-amber-500")}
                                                style={{ width: `${(Math.max(0, item.remaining) / item.total) * 100}%` }}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 mt-6">
                                            <button className="flex items-center justify-center gap-2 py-2 bg-emerald-600 text-white text-[10px] font-black border-2 border-gray-950 hover:bg-emerald-700 transition-colors">
                                                <MessageCircle size={14} /> تذكير واتساب
                                            </button>
                                            <button className="flex items-center justify-center gap-2 py-2 bg-gray-900 text-white text-[10px] font-black border-2 border-gray-950 hover:bg-black transition-colors dark:bg-black">
                                                <Phone size={14} /> اتصال سريع
                                            </button>
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
                    <div className="p-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                            <div>
                                <h1 className="text-7xl font-black text-gray-950 dark:text-white tracking-tighter mb-4">ملخص الأداء الشهري <span className="text-emerald-600">+{((netProfit / (totalIncome || 1)) * 100).toFixed(0)}%</span></h1>
                                <p className="text-xl font-bold text-gray-500 leading-relaxed max-w-xl">
                                    لقد حققت الأكاديمية زيادة في الإنتاجية التعليمية هذا الشهر. إجمالي الحصص المنفذة وصل إلى <span className="text-gray-950 dark:text-white border-b-4 border-emerald-400">{filteredSessions.length} حصة مبرمجة</span>.
                                </p>
                                <div className="mt-10 grid grid-cols-2 gap-6">
                                    <div className="border-l-4 border-emerald-500 pl-6 py-2">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">معدل الإيرادات</p>
                                        <p className="text-2xl font-black text-gray-950 dark:text-white font-mono">{totalIncome.toLocaleString()} {CURRENCY_SYMBOL}</p>
                                    </div>
                                    <div className="border-l-4 border-rose-500 pl-6 py-2">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">معدل التكاليف</p>
                                        <p className="text-2xl font-black text-gray-950 dark:text-white font-mono">{totalTeacherPayout.toLocaleString()} {CURRENCY_SYMBOL}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-8 border-4 border-gray-950 bg-emerald-50 dark:bg-emerald-900/10 shadow-[20px_20px_0px_0px_rgba(16,185,129,0.1)] dark:border-gray-800">
                                <h3 className="text-xl font-black text-emerald-900 border-b-2 border-emerald-200 pb-4 mb-6 dark:text-emerald-400">نصيحة المدير الذكي 💡</h3>
                                <div className="space-y-6">
                                    <div className="flex gap-4 text-right">
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black">1</div>
                                        <p className="text-sm font-bold text-emerald-800 dark:text-emerald-500/80">هناك {renewalsData.length} طالب بحاجة لتجديد اشتراكهم فوراً لضمان تدفق السيولة.</p>
                                    </div>
                                    <div className="flex gap-4 text-right">
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black">2</div>
                                        <p className="text-sm font-bold text-emerald-800 dark:text-emerald-500/80">المعلمات حققن عائداً قوياً هذا الشهر، يفضل تثبيت مدفوعات الراتب قبل نهاية الأسبوع.</p>
                                    </div>
                                    <div className="flex gap-4 text-right">
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black">3</div>
                                        <p className="text-sm font-bold text-emerald-800 dark:text-emerald-500/80">معدل الربح الصافي لهذا الشهر هو {netProfit.toLocaleString()} {CURRENCY_SYMBOL}، يوصى بإعادة استثمار جزء في تطوير المواد العلمية.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'analysis' && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 p-8">
                        <div className="flex items-center justify-between mb-8 pb-4 border-b-4 border-gray-950">
                            <div>
                                <h2 className="text-2xl font-black text-gray-950 dark:text-white">تحليل ربحية المواد الدراسية</h2>
                                <p className="text-sm font-bold text-gray-400 mt-1">مقارنة الإيرادات بالتكاليف المباشرة لكل مادة</p>
                            </div>
                            <div className="w-12 h-12 bg-gray-950 flex items-center justify-center text-white dark:bg-white dark:text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]">
                                <BarChart3 size={24} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {subjectAnalysis.map((subj, idx) => (
                                <div key={idx} className="bg-white border-2 border-gray-950 dark:bg-gray-800 dark:border-gray-700 shadow-[6px_6px_0px_0px_black] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.05)] p-6 relative group overflow-hidden">
                                    <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500" />
                                    <div className="mb-6 flex justify-between items-start">
                                        <div>
                                            <h3 className="text-xl font-black text-gray-900 dark:text-white">{subj.name}</h3>
                                            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{subj.sessionsCount} حصة مكتملة</p>
                                        </div>
                                        <div className="text-left">
                                            <p className="text-[10px] font-black text-gray-400 uppercase">الربح الصافي</p>
                                            <p className="text-xl font-black text-emerald-600 font-mono tracking-tighter">
                                                {subj.profit.toLocaleString()} {CURRENCY_SYMBOL}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-end">
                                            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">الإيرادات</span>
                                            <span className="text-sm font-black text-gray-900 dark:text-white font-mono">{subj.income.toLocaleString()} {CURRENCY_SYMBOL}</span>
                                        </div>
                                        <div className="w-full bg-gray-100 h-1 dark:bg-gray-700">
                                            <div className="h-full bg-blue-500 w-full" />
                                        </div>
                                        <div className="flex justify-between items-end">
                                            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">مستحقات المعلمات</span>
                                            <span className="text-sm font-black text-gray-900 dark:text-white font-mono">{subj.payout.toLocaleString()} {CURRENCY_SYMBOL}</span>
                                        </div>
                                        <div className="w-full bg-gray-100 h-1 dark:bg-gray-700">
                                            <div className="h-full bg-rose-500" style={{ width: `${(subj.payout / (subj.income || 1)) * 100}%` }} />
                                        </div>
                                    </div>
                                    <div className="mt-6 pt-4 border-t-2 border-gray-50 dark:border-gray-700 flex justify-between items-center">
                                        <span className="text-[10px] font-black text-gray-400 uppercase">نسبة هامش الربح</span>
                                        <span className="text-sm font-black text-gray-950 dark:text-white">
                                            {subj.income > 0 ? ((subj.profit / subj.income) * 100).toFixed(1) : 0}%
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'teachers' && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 p-8">
                        <div className="flex items-center justify-between mb-8 pb-4 border-b-4 border-gray-950">
                            <div>
                                <h2 className="text-2xl font-black text-gray-950 dark:text-white">تحليل كفاءة أداء المعلمات</h2>
                                <p className="text-sm font-bold text-gray-400 mt-1">قياس الالتزام بالحضور وجودة التوثيق التعليمي</p>
                            </div>
                            <div className="w-12 h-12 bg-gray-950 flex items-center justify-center text-white dark:bg-white dark:text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]">
                                <Users size={24} />
                            </div>
                        </div>

                        <div className="space-y-6">
                            {teacherPerformance.map((perf, idx) => (
                                <div key={idx} className="bg-white border-2 border-gray-950 dark:bg-gray-800 dark:border-gray-700 shadow-[6px_6px_0px_0px_black] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.05)] p-6">
                                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                        <div className="flex items-center gap-4 min-w-[250px]">
                                            <div className="w-14 h-14 bg-gray-900 border-2 border-gray-950 flex items-center justify-center text-white text-xl font-black dark:bg-white dark:text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.1)]">
                                                {perf.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tighter">{perf.name}</h3>
                                                <p className="text-[10px] font-black text-gray-400 flex items-center gap-1 uppercase">إجمالي الحصص المجدولة: {perf.total}</p>
                                            </div>
                                        </div>

                                        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-6">
                                            <div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase mb-1">نسبة الالتزام</p>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xl font-black text-emerald-600 font-mono">{perf.attendanceRate.toFixed(1)}%</span>
                                                    <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700/50 rounded-none overflow-hidden">
                                                        <div className="h-full bg-emerald-500" style={{ width: `${perf.attendanceRate}%` }} />
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase mb-1">جودة التوثيق</p>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xl font-black text-blue-600 font-mono">{perf.documentationRate.toFixed(1)}%</span>
                                                    <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700/50 rounded-none overflow-hidden">
                                                        <div className="h-full bg-blue-500" style={{ width: `${perf.documentationRate}%` }} />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="hidden md:block">
                                                <p className="text-[10px] font-black text-gray-400 uppercase mb-1">الحصص المكتملة</p>
                                                <p className="text-xl font-black text-gray-900 dark:text-white font-mono">{perf.completed}</p>
                                            </div>

                                            <div className="hidden md:block">
                                                <p className="text-[10px] font-black text-gray-400 uppercase mb-1">الدروس الموثقة</p>
                                                <p className="text-xl font-black text-gray-900 dark:text-white font-mono">{perf.documented}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {perf.attendanceRate > 90 && perf.documentationRate > 80 ? (
                                                <div className="bg-amber-100 text-amber-700 border-2 border-amber-200 px-4 py-2 font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
                                                    <Star size={12} className="fill-amber-700" /> معلمة متميزة
                                                </div>
                                            ) : (
                                                <div className="bg-gray-100 text-gray-500 border-2 border-gray-200 px-4 py-2 font-black text-[10px] uppercase tracking-widest">
                                                    تحت التقييم
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
