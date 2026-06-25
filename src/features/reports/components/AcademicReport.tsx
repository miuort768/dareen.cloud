import { BarChart3, BookOpen, Search, Activity, Users, ChevronRight, ChevronLeft } from 'lucide-react';
import React, { useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Cell, LabelList
} from 'recharts';
import { CHART_COLORS } from '../types';
import { cn } from '../../../lib/utils';

interface AcademicReportProps {
    gradeBarData: { name: string; count: number }[];
    subjectPieData: { name: string; value: number }[];
    totalEnrollments: number;
    totalStudents: number;
    uniqueSubjects: number;
    filteredStudentProgress: { id: string; name: string; grade: string; subject: string; attendanceRate: number; sessionsCount: number }[];
    studentProgressTotal: number;
    searchTerm: string;
    setSearchTerm: (val: string) => void;
}

const SectionCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={cn(
        'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden',
        className
    )}>
        {children}
    </div>
);

const SectionHeader = ({ icon: Icon, label, sub, color = '#8B5CF6' }: { icon: React.ComponentType<{ size?: number }>; label: string; sub?: string; color?: string }) => (
    <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100/50 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-800/40">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}12` }}>
            <Icon size={15} style={{ color }} />
        </div>
        <div>
            <p className="text-xs font-bold text-slate-800 dark:text-white">{label}</p>
            {sub && <p className="text-[9px] font-bold text-slate-400 mt-0.5">{sub}</p>}
        </div>
    </div>
);

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; name?: string }[]; label?: string }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-900 text-white px-4 py-3 rounded-xl shadow-sm border border-white/10 text-right" dir="rtl">
                <p className="text-[10px] font-medium text-slate-400 uppercase mb-1">{label}</p>
                <p className="text-lg font-medium font-mono">{payload[0].value} <span className="text-[10px] text-slate-400">طالب</span></p>
            </div>
        );
    }
    return null;
};

const PAGE_SIZE = 10;

export const AcademicReport = ({
    gradeBarData,
    subjectPieData,
    totalEnrollments,
    totalStudents,
    uniqueSubjects,
    filteredStudentProgress,
    searchTerm,
    setSearchTerm
}: AcademicReportProps) => {

    const [page, setPage] = useState(1);

    const maxSubjectVal = Math.max(...subjectPieData.map(s => s.value), 1);

    React.useEffect(() => setPage(1), [searchTerm]);

    const sortedStudents = [...filteredStudentProgress].sort((a, b) => b.progress - a.progress);
    const totalPages = Math.max(1, Math.ceil(sortedStudents.length / PAGE_SIZE));
    const pageStudents = sortedStudents.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    return (
        <div className="space-y-4">
            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                {/* Grade Distribution - Bar Chart */}
                <SectionCard>
                    <SectionHeader icon={BarChart3} label="توزيع الطلاب حسب الصف" sub="عدد الطلاب في كل مرحلة دراسية" />
                    <div className="p-4 h-64" dir="ltr">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={gradeBarData} margin={{ top: 16, right: 8, left: -20, bottom: 0 }} barCategoryGap="30%">
                                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                                <XAxis dataKey="grade" tick={{ fill: '#94A3B8', fontSize: 9, fontWeight: 700 }} axisLine={false} tickLine={false} dy={8} />
                                <YAxis tick={{ fill: '#94A3B8', fontSize: 9, fontWeight: 700 }} axisLine={false} tickLine={false} allowDecimals={false} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99,102,241,0.05)' }} />
                                <Bar dataKey="count" radius={[0, 0, 0, 0]} maxBarSize={36}>
                                    {gradeBarData.map((_, index) => (
                                        <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                    ))}
                                    <LabelList dataKey="count" position="top" style={{ fill: '#64748b', fontSize: 9, fontWeight: 800 }} />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    {gradeBarData.length === 0 && (
                        <div className="h-32 flex items-center justify-center text-slate-300 text-xs font-normal">لا توجد بيانات</div>
                    )}
                </SectionCard>

                {/* Subject Distribution - Horizontal Bars */}
                <SectionCard>
                    <SectionHeader icon={BookOpen} label="توزيع الاشتراكات حسب المادة" sub={`إجمالي ${totalEnrollments} اشتراك`} />
                    <div className="p-4 space-y-2.5 max-h-64 overflow-y-auto">
                        {subjectPieData.length > 0 ? subjectPieData
                            .sort((a, b) => b.value - a.value)
                            .map((entry, index) => {
                                const pct = Math.round((entry.value / totalEnrollments) * 100);
                                const color = CHART_COLORS[index % CHART_COLORS.length];
                                return (
                                    <div key={index}>
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-sm shrink-0" style={{ backgroundColor: color }} />
                                                <span className="text-[11px] font-normal text-slate-700 dark:text-slate-300 truncate max-w-[120px]">{entry.name}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-medium text-slate-500 font-mono">{entry.value}</span>
                                                <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-lg text-white" style={{ backgroundColor: color }}>{pct}%</span>
                                            </div>
                                        </div>
                                        <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden">
                                            <div
                                                className="h-full rounded-xl transition-all duration-700"
                                                style={{ width: `${(entry.value / maxSubjectVal) * 100}%`, backgroundColor: color }}
                                            />
                                        </div>
                                    </div>
                                );
                            }) : (
                            <div className="h-32 flex items-center justify-center text-slate-300 text-xs font-normal">لا توجد بيانات</div>
                        )}
                    </div>
                </SectionCard>
            </div>

            {/* ── ملخص إحصائيات التسجيلات ── */}
            <div className="grid grid-cols-3 gap-3">
                {[
                    { label: 'إجمالي الطلاب', value: totalStudents, icon: Users, color: '#6C4BFF' },
                    { label: 'إجمالي الاشتراكات', value: totalEnrollments, icon: BookOpen, color: '#10B981' },
                    { label: 'المواد الأكاديمية', value: uniqueSubjects, icon: BarChart3, color: '#8B5CF6' },
                ].map((item, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 border border-slate-100/50 dark:border-slate-800/50 rounded-2xl shadow-sm p-4">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-2" style={{ backgroundColor: `${item.color}12` }}>
                            <item.icon size={16} style={{ color: item.color }} />
                        </div>
                        <p className="text-xl font-black font-mono" style={{ color: item.color }}>{item.value}</p>
                        <p className="text-[9px] font-bold mt-1 text-slate-400">{item.label}</p>
                    </div>
                ))}
            </div>

            {/* Student Progress Table */}
            <SectionCard>
                {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 px-5 py-4 border-b border-slate-100/50 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-800/40">
                    <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#8B5CF612' }}>
            <Activity size={15} style={{ color: '#8B5CF6' }} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-800 dark:text-white">تقرير تقدم الطلاب</p>
                            <p className="text-[9px] font-bold text-slate-400 mt-0.5">
                                {sortedStudents.length} طالب • صفحة {page} من {totalPages}
                            </p>
                        </div>
                    </div>
                    <div className="relative w-full md:max-w-xs">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2" size={13} style={{ color: '#94A3B8' }} />
                        <input
                            type="text"
                            placeholder="ابحث عن طالب أو صف..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pr-9 pl-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none focus:border-[#6C4BFF] transition-all"
                        />
                    </div>
                </div>

                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-right">
                        <thead>
                            <tr className="bg-gradient-to-l from-[#6C4BFF] to-[#8B5CF6] text-white">
                                <th className="px-5 py-3 text-[9px] font-bold text-white/70">#</th>
                                <th className="px-5 py-3 text-[9px] font-bold text-white/70 text-right">اسم الطالب</th>
                                <th className="px-5 py-3 text-[9px] font-bold text-white/70 text-center">الصف</th>
                                <th className="px-5 py-3 text-[9px] font-bold text-white/70 text-center">الاشتراكات</th>
                                <th className="px-5 py-3 text-[9px] font-bold text-white/70 text-center">المتوقعة</th>
                                <th className="px-5 py-3 text-[9px] font-bold text-white/70 text-center">المستخدمة</th>
                                <th className="px-5 py-3 text-[9px] font-bold text-white/70 text-center w-40">التقدم</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                            {pageStudents.length > 0 ? pageStudents.map((student, idx) => {
                                const prog = student.progress;
                                const globalIdx = (page - 1) * PAGE_SIZE + idx + 1;
                                const progColor = prog >= 80 ? 'bg-emerald-500' : prog >= 50 ? 'bg-amber-500' : 'bg-rose-500';
                                const textColor = prog >= 80 ? 'text-emerald-600' : prog >= 50 ? 'text-amber-600' : 'text-rose-500';
                                return (
                                    <tr key={student.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                        <td className="px-5 py-3">
                                            <span className="text-[10px] font-medium text-slate-300 font-mono">{String(globalIdx).padStart(2, '0')}</span>
                                        </td>
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-7 h-7 rounded-xl flex items-center justify-center text-[10px] font-black shrink-0" style={{ backgroundColor: '#8B5CF612', color: '#8B5CF6' }}>
                                                    {student.name.charAt(0)}
                                                </div>
                                                <span className="text-xs font-bold text-slate-800 dark:text-white">{student.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3 text-center">
                                            <span className="inline-flex px-2 py-0.5 text-[9px] font-bold rounded-lg" style={{ backgroundColor: '#8B5CF612', color: '#8B5CF6' }}>
                                                {student.grade}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 text-center font-mono font-medium text-xs text-slate-600 dark:text-slate-400">{student.totalEnrollments}</td>
                                        <td className="px-5 py-3 text-center font-mono font-medium text-xs text-slate-600 dark:text-slate-400">{student.totalSessions}</td>
                                        <td className="px-5 py-3 text-center font-mono font-medium text-xs text-emerald-600">{student.usedSessions}</td>
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-2.5">
                                                <div className="flex-1 bg-slate-100 dark:bg-slate-700 h-2 rounded-xl overflow-hidden">
                                                    <div className={cn("h-full rounded-xl transition-all duration-700", progColor)} style={{ width: `${prog}%` }} />
                                                </div>
                                                <span className={cn("text-[10px] font-medium w-9 text-left", textColor)}>{prog}%</span>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan={7} className="px-6 py-16 text-center">
                                        <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-2" style={{ backgroundColor: '#64748B12' }}>
                                            <Users size={22} className="text-slate-400" />
                                        </div>
                                        <p className="text-xs font-bold text-slate-400">لا توجد نتائج</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden divide-y divide-slate-50 dark:divide-slate-800">
                    {pageStudents.length > 0 ? pageStudents.map((student, idx) => {
                        const prog = student.progress;
                        const globalIdx = (page - 1) * PAGE_SIZE + idx + 1;
                        const progColor = prog >= 80 ? 'bg-emerald-500' : prog >= 50 ? 'bg-amber-500' : 'bg-rose-500';
                        const textColor = prog >= 80 ? 'text-emerald-600' : prog >= 50 ? 'text-amber-600' : 'text-rose-500';
                        return (
                            <div key={student.id} className="p-4 flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black shrink-0 relative" style={{ backgroundColor: '#8B5CF612', color: '#8B5CF6' }}>
                                    {student.name.charAt(0)}
                                    <span className="absolute -top-1 -right-1 text-[8px] font-bold text-white w-4 h-4 flex items-center justify-center rounded-full" style={{ backgroundColor: '#8B5CF6' }}>{globalIdx}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="text-xs font-normal text-slate-800 dark:text-white truncate">{student.name}</p>
                                        <span className={cn("text-[10px] font-medium ml-2 shrink-0", textColor)}>{prog}%</span>
                                    </div>
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-lg" style={{ backgroundColor: '#8B5CF612', color: '#8B5CF6' }}>{student.grade}</span>
                                        <span className="text-[9px] text-slate-400 font-normal">{student.usedSessions}/{student.totalSessions} حصة</span>
                                    </div>
                                    <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-xl overflow-hidden">
                                        <div className={cn("h-full rounded-xl", progColor)} style={{ width: `${prog}%` }} />
                                    </div>
                                </div>
                            </div>
                        );
                    }) : (
                        <div className="py-12 text-center">
                            <div className="w-11 h-11 rounded-xl flex items-center justify-center mx-auto mb-2" style={{ backgroundColor: '#64748B12' }}>
                                <Users size={20} className="text-slate-400" />
                            </div>
                            <p className="text-xs font-bold text-slate-400">لا توجد نتائج</p>
                        </div>
                    )}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100/50 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-800/40">
                        <p className="text-[10px] font-bold text-slate-400">
                            {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, sortedStudents.length)} من {sortedStudents.length}
                        </p>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="w-8 h-8 flex items-center justify-center rounded-xl border shadow-sm active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed transition-all" style={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', color: '#64748B' }}
                            >
                                <ChevronRight size={14} />
                            </button>
                            {[...Array(Math.min(totalPages, 7))].map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setPage(i + 1)}
                                    className="w-8 h-8 text-[11px] font-bold rounded-xl border shadow-sm active:scale-95 transition-all"
                                    style={page === i + 1 ? { backgroundColor: '#8B5CF6', borderColor: '#8B5CF6', color: '#FFFFFF' } : { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', color: '#64748B' }}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            {totalPages > 7 && <span className="text-slate-400 text-xs font-bold px-1">...</span>}
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="w-8 h-8 flex items-center justify-center rounded-xl border shadow-sm active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed transition-all" style={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', color: '#64748B' }}
                            >
                                <ChevronLeft size={14} />
                            </button>
                        </div>
                    </div>
                )}
            </SectionCard>
        </div>
    );
};

