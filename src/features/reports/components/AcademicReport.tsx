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
    filteredStudentProgress: { id: string; name: string; grade: string; subject: string; attendanceRate: number; sessionsCount: number; progress?: number; totalEnrollments?: number; totalSessions?: number; usedSessions?: number }[];
    studentProgressTotal: number;
    searchTerm: string;
    setSearchTerm: (val: string) => void;
}

const SectionCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={cn('bg-card border border-border rounded-card shadow-soft overflow-hidden', className)}>
        {children}
    </div>
);

const SectionHeader = ({ icon: Icon, label, sub }: { icon: React.ComponentType<{ size?: number }>; label: string; sub?: string }) => (
    <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-surface">
        <div className="w-8 h-8 rounded-xl bg-chart-4/10 flex items-center justify-center">
            <Icon size={15} className="text-chart-4" />
        </div>
        <div>
            <p className="text-xs font-bold text-main">{label}</p>
            {sub && <p className="text-micro font-bold text-muted mt-0.5">{sub}</p>}
        </div>
    </div>
);

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; name?: string }[]; label?: string }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-card border border-border shadow-xl px-4 py-3 rounded-xl" dir="rtl">
                <p className="text-micro font-bold text-muted mb-1">{label}</p>
                <p className="text-lg font-bold text-main tabular-nums">{payload[0].value} <span className="text-micro text-muted">طالب</span></p>
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
    studentProgressTotal,
    searchTerm,
    setSearchTerm
}: AcademicReportProps) => {

    const [page, setPage] = useState(1);

    const maxSubjectVal = Math.max(...subjectPieData.map(s => s.value), 1);

    React.useEffect(() => setPage(1), [searchTerm]);

    const sortedStudents = [...filteredStudentProgress].sort((a, b) => (b.progress || 0) - (a.progress || 0));
    const totalPages = Math.max(1, Math.ceil(sortedStudents.length / PAGE_SIZE));
    const pageStudents = sortedStudents.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <SectionCard>
                    <SectionHeader icon={BarChart3} label="توزيع الطلاب حسب الصف" sub="عدد الطلاب في كل مرحلة دراسية" />
                    <div className="p-4 h-64" dir="ltr">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={gradeBarData} margin={{ top: 16, right: 8, left: -20, bottom: 0 }} barCategoryGap="30%">
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                                <XAxis dataKey="grade" tick={{ fill: 'var(--text-dim)', fontSize: 9, fontWeight: 700 }} axisLine={false} tickLine={false} dy={8} />
                                <YAxis tick={{ fill: 'var(--text-dim)', fontSize: 9, fontWeight: 700 }} axisLine={false} tickLine={false} allowDecimals={false} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bg-hover)' }} />
                                <Bar dataKey="count" radius={[0, 0, 0, 0]} maxBarSize={36}>
                                    {gradeBarData.map((_, index) => (
                                        <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                    ))}
                                    <LabelList dataKey="count" position="top" style={{ fill: 'var(--text-dim)', fontSize: 9, fontWeight: 800 }} />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    {gradeBarData.length === 0 && (
                        <div className="h-32 flex items-center justify-center text-muted text-xs font-bold">لا توجد بيانات</div>
                    )}
                </SectionCard>

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
                                                <span className="text-xs font-bold text-muted truncate max-w-[120px]">{entry.name}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-micro font-bold text-muted tabular-nums">{entry.value}</span>
                                                <span className="text-micro font-bold px-1.5 py-0.5 rounded-lg text-on-primary" style={{ backgroundColor: color }}>{pct}%</span>
                                            </div>
                                        </div>
                                        <div className="h-1.5 bg-surface rounded-xl overflow-hidden">
                                            <div
                                                className="h-full rounded-xl transition-all duration-700"
                                                style={{ width: `${(entry.value / maxSubjectVal) * 100}%`, backgroundColor: color }}
                                            />
                                        </div>
                                    </div>
                                );
                            }) : (
                            <div className="h-32 flex items-center justify-center text-muted text-xs font-bold">لا توجد بيانات</div>
                        )}
                    </div>
                </SectionCard>
            </div>

            <div className="grid grid-cols-3 gap-3">
                {[
                    { label: 'إجمالي الطلاب', value: totalStudents, icon: Users, color: 'var(--chart-1)' },
                    { label: 'إجمالي الاشتراكات', value: totalEnrollments, icon: BookOpen, color: 'var(--chart-2)' },
                    { label: 'المواد الأكاديمية', value: uniqueSubjects, icon: BarChart3, color: 'var(--chart-4)' },
                ].map((item, i) => (
                    <div key={i} className="bg-card border border-border rounded-card shadow-soft p-4">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-2" style={{ backgroundColor: `${item.color}10` }}>
                            <item.icon size={16} style={{ color: item.color }} />
                        </div>
                        <p className="text-xl font-black tabular-nums" style={{ color: item.color }}>{item.value}</p>
                        <p className="text-micro font-bold mt-1 text-muted">{item.label}</p>
                    </div>
                ))}
            </div>

            <SectionCard>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 px-5 py-4 border-b border-border bg-surface">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-chart-4/10 flex items-center justify-center">
                            <Activity size={15} className="text-chart-4" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-main">تقرير تقدم الطلاب</p>
                            <p className="text-micro font-bold text-muted mt-0.5">
                                {sortedStudents.length} طالب • صفحة {page} من {totalPages}
                            </p>
                        </div>
                    </div>
                    <div className="relative w-full md:max-w-xs">
                        <Search className="absolute start-3 top-1/2 -translate-y-1/2 text-dim" size={13} />
                        <input
                            type="text"
                            placeholder="ابحث عن طالب أو صف..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full ps-9 pe-3 py-2 bg-card border border-border rounded-xl text-xs font-bold outline-none focus:border-chart-4 transition-all text-main placeholder:text-muted"
                        />
                    </div>
                </div>

                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-start">
                        <thead>
                            <tr className="bg-chart-4 text-on-primary">
                                <th className="px-5 py-3 text-micro font-bold text-on-primary opacity-70">#</th>
                                <th className="px-5 py-3 text-micro font-bold text-on-primary opacity-70 text-start">اسم الطالب</th>
                                <th className="px-5 py-3 text-micro font-bold text-on-primary opacity-70 text-center">الصف</th>
                                <th className="px-5 py-3 text-micro font-bold text-on-primary opacity-70 text-center">الاشتراكات</th>
                                <th className="px-5 py-3 text-micro font-bold text-on-primary opacity-70 text-center">المتوقعة</th>
                                <th className="px-5 py-3 text-micro font-bold text-on-primary opacity-70 text-center">المستخدمة</th>
                                <th className="px-5 py-3 text-micro font-bold text-on-primary opacity-70 text-center w-40">التقدم</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-divider">
                            {pageStudents.length > 0 ? pageStudents.map((student, idx) => {
                                const prog = student.progress || 0;
                                const globalIdx = (page - 1) * PAGE_SIZE + idx + 1;
                                const progBg = prog >= 80 ? 'bg-success' : prog >= 50 ? 'bg-warning' : 'bg-error';
                                const progText = prog >= 80 ? 'text-success-dark' : prog >= 50 ? 'text-warning-dark' : 'text-error-dark';
                                return (
                                    <tr key={student.id} className="hover:bg-hover transition-colors">
                                        <td className="px-5 py-3">
                                            <span className="text-micro font-medium text-dim tabular-nums">{String(globalIdx).padStart(2, '0')}</span>
                                        </td>
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-7 h-7 rounded-xl bg-chart-4/10 flex items-center justify-center text-micro font-black text-chart-4">
                                                    {student.name.charAt(0)}
                                                </div>
                                                <span className="text-xs font-bold text-main">{student.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3 text-center">
                                            <span className="inline-flex px-2 py-0.5 text-micro font-bold rounded-lg bg-chart-4/10 text-chart-4">
                                                {student.grade}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 text-center tabular-nums font-medium text-xs text-muted">{student.totalEnrollments}</td>
                                        <td className="px-5 py-3 text-center tabular-nums font-medium text-xs text-muted">{student.totalSessions}</td>
                                        <td className="px-5 py-3 text-center tabular-nums font-medium text-xs text-success">{student.usedSessions}</td>
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-2.5">
                                                <div className="flex-1 bg-surface h-2 rounded-xl overflow-hidden">
                                                    <div className={cn("h-full rounded-xl transition-all duration-700", progBg)} style={{ width: `${prog}%` }} />
                                                </div>
                                                <span className={cn("text-micro font-medium w-9 text-end", progText)}>{prog}%</span>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan={7} className="px-6 py-16 text-center">
                                        <div className="w-12 h-12 rounded-xl bg-muted/10 flex items-center justify-center mx-auto mb-2">
                                            <Users size={22} className="text-dim" />
                                        </div>
                                        <p className="text-xs font-bold text-muted">لا توجد نتائج</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="md:hidden divide-y divide-divider">
                    {pageStudents.length > 0 ? pageStudents.map((student, idx) => {
                        const prog = student.progress || 0;
                        const globalIdx = (page - 1) * PAGE_SIZE + idx + 1;
                        const progBg = prog >= 80 ? 'bg-success' : prog >= 50 ? 'bg-warning' : 'bg-error';
                        const progText = prog >= 80 ? 'text-success-dark' : prog >= 50 ? 'text-warning-dark' : 'text-error-dark';
                        return (
                            <div key={student.id} className="p-4 flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black shrink-0 relative bg-chart-4/10 text-chart-4">
                                    {student.name.charAt(0)}
                                    <span className="absolute -top-1 -start-1 text-micro font-bold text-on-primary w-4 h-4 flex items-center justify-center rounded-full bg-chart-4">{globalIdx}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="text-xs font-bold text-main truncate">{student.name}</p>
                                        <span className={cn("text-micro font-bold me-2 shrink-0", progText)}>{prog}%</span>
                                    </div>
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <span className="text-micro font-bold px-1.5 py-0.5 rounded-lg bg-chart-4/10 text-chart-4">{student.grade}</span>
                                        <span className="text-micro text-muted font-bold">{student.usedSessions}/{student.totalSessions} حصة</span>
                                    </div>
                                    <div className="h-1.5 bg-surface rounded-xl overflow-hidden">
                                        <div className={cn("h-full rounded-xl", progBg)} style={{ width: `${prog}%` }} />
                                    </div>
                                </div>
                            </div>
                        );
                    }) : (
                        <div className="py-12 text-center">
                            <div className="w-11 h-11 rounded-xl bg-muted/10 flex items-center justify-center mx-auto mb-2">
                                <Users size={20} className="text-dim" />
                            </div>
                            <p className="text-xs font-bold text-muted">لا توجد نتائج</p>
                        </div>
                    )}
                </div>

                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-surface">
                        <p className="text-micro font-bold text-muted">
                            {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, sortedStudents.length)} من {sortedStudents.length}
                        </p>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="w-8 h-8 flex items-center justify-center rounded-xl border border-border shadow-soft active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed transition-all bg-card text-muted"
                            >
                                <ChevronRight size={14} />
                            </button>
                            {[...Array(Math.min(totalPages, 7))].map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setPage(i + 1)}
                                    className={cn(
                                        'w-8 h-8 text-xs font-bold rounded-xl border shadow-soft active:scale-95 transition-all',
                                        page === i + 1 ? 'border-chart-4 bg-chart-4 text-on-primary' : 'border-border bg-card text-muted'
                                    )}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            {totalPages > 7 && <span className="text-dim text-xs font-bold px-1">...</span>}
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="w-8 h-8 flex items-center justify-center rounded-xl border border-border shadow-soft active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed transition-all bg-card text-muted"
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
