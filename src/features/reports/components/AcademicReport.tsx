import { BarChart3, BookOpen, Users } from 'lucide-react';
import React from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Cell, LabelList
} from 'recharts';
import { cn } from '../../../lib/utils';
import { CHART_COLORS } from '../types';
import { ReportStudentTable } from './ReportStudentTable';

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
    <div className={cn('bg-card border border-border rounded-card overflow-hidden', className)}>
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

export const AcademicReport = React.memo(({
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

    const maxSubjectVal = Math.max(...subjectPieData.map(s => s.value), 1);

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
                    { label: 'إجمالي الطلاب', value: totalStudents, icon: Users, textClass: 'text-chart-1', bgClass: 'bg-chart-1/10' },
                    { label: 'إجمالي الاشتراكات', value: totalEnrollments, icon: BookOpen, textClass: 'text-chart-2', bgClass: 'bg-chart-2/10' },
                    { label: 'المواد الأكاديمية', value: uniqueSubjects, icon: BarChart3, textClass: 'text-chart-4', bgClass: 'bg-chart-4/10' },
                ].map((item, i) => (
                    <div key={`report-${i}`} className="bg-card border border-border rounded-card p-4">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-2 ${item.bgClass}`}>
                            <item.icon size={16} className={item.textClass} />
                        </div>
                        <p className={`text-xl font-bold tabular-nums ${item.textClass}`}>{item.value}</p>
                        <p className="text-micro font-bold mt-1 text-muted">{item.label}</p>
                    </div>
                ))}
            </div>

            <ReportStudentTable
                students={filteredStudentProgress}
                total={studentProgressTotal}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
            />
        </div>
    );
});
AcademicReport.displayName = 'AcademicReport';
export default AcademicReport;
