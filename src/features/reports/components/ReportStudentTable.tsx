import React, { useState, useEffect } from 'react';
import { Search, Activity, Users, ChevronRight, ChevronLeft } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface StudentProgress {
    id: string; name: string; grade: string; subject: string;
    attendanceRate: number; sessionsCount: number;
    progress?: number; totalEnrollments?: number; totalSessions?: number; usedSessions?: number;
}

interface ReportStudentTableProps {
    students: StudentProgress[];
    total: number;
    searchTerm: string;
    onSearchChange: (val: string) => void;
}

const PAGE_SIZE = 10;

export const ReportStudentTable = React.memo(({ students, searchTerm, onSearchChange }: ReportStudentTableProps) => {
    const [page, setPage] = useState(1);
    useEffect(() => setPage(1), [searchTerm]);

    const sortedStudents = [...students].sort((a, b) => (b.progress || 0) - (a.progress || 0));
    const totalPages = Math.max(1, Math.ceil(sortedStudents.length / PAGE_SIZE));
    const pageStudents = sortedStudents.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const renderProgressBar = (prog: number) => {
        const progBg = prog >= 80 ? 'bg-success' : prog >= 50 ? 'bg-warning' : 'bg-error';
        const progText = prog >= 80 ? 'text-success-dark' : prog >= 50 ? 'text-warning-dark' : 'text-error-dark';
        return { progBg, progText };
    };

    return (
        <div className="bg-card border border-border rounded-card overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 px-5 py-4 border-b border-border bg-surface">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-chart-4/10 flex items-center justify-center">
                        <Activity size={15} className="text-chart-4" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-main">تقرير تقدم الطلاب</p>
                        <p className="text-micro font-bold text-muted mt-0.5">{sortedStudents.length} طالب • صفحة {page} من {totalPages}</p>
                    </div>
                </div>
                <div className="relative w-full md:max-w-xs">
                    <Search className="absolute start-3 top-1/2 -translate-y-1/2 text-muted" size={13} />
                    <input type="text" aria-label="بحث عن طالب" placeholder="ابحث عن طالب أو صف..." value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full ps-9 pe-3 py-2 bg-card border border-border rounded-xl text-xs font-bold outline-none focus:border-chart-4 transition-all text-main placeholder:text-muted" />
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
                            const { progBg, progText } = renderProgressBar(prog);
                            return (
                                <tr key={student.id} className="hover:bg-hover transition-colors">
                                    <td className="px-5 py-3"><span className="text-micro font-medium text-muted tabular-nums">{String(globalIdx).padStart(2, '0')}</span></td>
                                    <td className="px-5 py-3">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-7 h-7 rounded-xl bg-chart-4/10 flex items-center justify-center text-micro font-semibold text-chart-4">{student.name.charAt(0)}</div>
                                            <span className="text-xs font-bold text-main">{student.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3 text-center"><span className="inline-flex px-2 py-0.5 text-micro font-bold rounded-lg bg-chart-4/10 text-chart-4">{student.grade}</span></td>
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
                                    <div className="w-12 h-12 rounded-xl bg-muted/10 flex items-center justify-center mx-auto mb-2"><Users size={22} className="text-muted" /></div>
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
                    const { progBg, progText } = renderProgressBar(prog);
                    return (
                        <div key={student.id} className="p-4 flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-semibold shrink-0 relative bg-chart-4/10 text-chart-4">
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
                        <div className="w-11 h-11 rounded-xl bg-muted/10 flex items-center justify-center mx-auto mb-2"><Users size={20} className="text-muted" /></div>
                        <p className="text-xs font-bold text-muted">لا توجد نتائج</p>
                    </div>
                )}
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-surface">
                    <p className="text-micro font-bold text-muted">{(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, sortedStudents.length)} من {sortedStudents.length}</p>
                    <div className="flex items-center gap-1">
                        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="w-8 h-8 flex items-center justify-center rounded-xl border border-border active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed transition-all bg-card text-muted">
                            <ChevronRight size={14} />
                        </button>
                        {[...Array(Math.min(totalPages, 7))].map((_, i) => (
                            <button key={`page-${i}`} onClick={() => setPage(i + 1)}
                                className={cn('w-8 h-8 text-xs font-bold rounded-xl border active:scale-95 transition-all', page === i + 1 ? 'border-chart-4 bg-chart-4 text-on-primary' : 'border-border bg-card text-muted')}>
                                {i + 1}
                            </button>
                        ))}
                        {totalPages > 7 && <span className="text-muted text-xs font-bold px-1">...</span>}
                        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="w-8 h-8 flex items-center justify-center rounded-xl border border-border active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed transition-all bg-card text-muted">
                            <ChevronLeft size={14} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
});
ReportStudentTable.displayName = 'ReportStudentTable';
