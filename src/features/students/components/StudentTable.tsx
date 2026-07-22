import { memo, useMemo } from 'react';
import { Edit, Trash, Bell, GraduationCap } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { Table, ProgressBar } from '../../../shared/components/ui';
import type { Column } from '../../../shared/components/ui';
import type { Student } from '../types';

interface StudentTableProps {
    students: Student[];
    selectedId?: string;
    onSelect: (student: Student) => void;
    onEdit: (student: Student) => void;
    onDelete: (id: string) => void;
    onNotify: (student: Student) => void;
    showDetails: boolean;
    isTeacherView: boolean;
}

export const StudentTable = memo(({ students, selectedId, onSelect, onEdit, onDelete, onNotify }: StudentTableProps) => {
    const columns: Column<Student>[] = useMemo(() => [
        {
            key: 'name',
            header: 'توصيف الطالب',
            sortable: true,
            render: (student) => {
                const hasLowBalance = (student.enrollments || []).some(en => (en.sessionsTotal - en.sessionsUsed) <= 2);
                return (
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 flex items-center justify-center font-bold text-sm bg-primary-soft text-primary">
                            {student.name.charAt(0)}
                        </div>
                        <div>
                            <p className="font-bold text-xs text-main leading-tight">{student.name}</p>
                            {hasLowBalance && (
                                <span className="text-micro font-bold text-error bg-error-soft px-1">رصيد منخفض ⚠️</span>
                            )}
                        </div>
                    </div>
                );
            },
            mobileLabel: 'الطالب',
        },
        {
            key: 'grade',
            header: 'المستوى',
            sortable: true,
            align: 'center',
            render: (student) => (
                <span className="text-micro font-bold px-2 py-0.5 bg-primary-soft text-primary">
                    {student.grade}
                </span>
            ),
            mobileLabel: 'المستوى',
        },
        {
            key: 'enrollments',
            header: 'الاشتراكات',
            align: 'center',
            render: (student) => (
                <span className="w-7 h-7 inline-flex items-center justify-center font-bold text-xs bg-primary-soft text-primary">
                    {student.enrollments?.length || 0}
                </span>
            ),
            mobileLabel: 'العقود',
        },
        {
            key: 'sessions',
            header: 'الحصص',
            align: 'center',
            render: (student) => {
                const totalExpected = (student.enrollments || []).reduce((acc, en) => acc + (en.sessionsTotal || 0), 0);
                const totalUsed = (student.enrollments || []).reduce((acc, en) => acc + (en.sessionsUsed || 0), 0);
                return (
                    <span className="text-xs font-normal text-muted font-mono">
                        {totalUsed} <span className="text-dim">/</span> {totalExpected}
                    </span>
                );
            },
            mobileLabel: 'الحصص',
        },
        {
            key: 'progress',
            header: 'مؤشر التقدم',
            align: 'center',
            render: (student) => {
                const totalExpected = (student.enrollments || []).reduce((acc, en) => acc + (en.sessionsTotal || 0), 0);
                const totalUsed = (student.enrollments || []).reduce((acc, en) => acc + (en.sessionsUsed || 0), 0);
                const progress = totalExpected > 0 ? Math.round((totalUsed / totalExpected) * 100) : 0;
                return (
                    <ProgressBar value={progress} showLabel className="min-w-[140px]" />
                );
            },
            mobileLabel: 'التقدم',
        },
        {
            key: 'actions',
            header: 'إجراءات',
            align: 'center',
            className: 'text-center',
            render: (student) => (
                <div className="flex items-center justify-center gap-2">
                    <button onClick={(e) => { e.stopPropagation(); onEdit(student); }} className="w-8 h-8 flex items-center justify-center text-dim hover:bg-hover hover:text-success transition-all" title="تعديل" aria-label="تعديل"><Edit size={14} /></button>
                    <button onClick={(e) => { e.stopPropagation(); onNotify(student); }} className="w-8 h-8 flex items-center justify-center text-dim hover:bg-warning-soft hover:text-warning transition-all" title="إرسال إشعار" aria-label="إرسال إشعار"><Bell size={14} /></button>
                    <button onClick={(e) => { e.stopPropagation(); onDelete(student.id); }} className="w-8 h-8 flex items-center justify-center text-dim hover:bg-error-soft hover:text-error transition-all" title="حذف" aria-label="حذف"><Trash size={14} /></button>
                </div>
            ),
        },
    ], [onEdit, onNotify, onDelete]);

    const mobileCard = (student: Student) => {
        const totalExpected = (student.enrollments || []).reduce((acc, en) => acc + (en.sessionsTotal || 0), 0);
        const totalUsed = (student.enrollments || []).reduce((acc, en) => acc + (en.sessionsUsed || 0), 0);
        const progress = totalExpected > 0 ? Math.round((totalUsed / totalExpected) * 100) : 0;
        const hasLowBalance = (student.enrollments || []).some(en => (en.sessionsTotal - en.sessionsUsed) <= 2);

        return (
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-10 h-10 rounded-xl bg-primary-soft flex items-center justify-center font-bold text-sm text-primary shrink-0">
                            {student.name.charAt(0)}
                        </div>
                        <div className="min-w-0 flex-1">
                            <h4 className="text-sm font-bold text-main leading-tight truncate">{student.name}</h4>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-primary-soft text-primary rounded">{student.grade}</span>
                                {hasLowBalance && (
                                    <span className="text-[10px] font-bold text-error">رصيد منخفض</span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                        <button onClick={(e) => { e.stopPropagation(); onEdit(student); }} className="w-8 h-8 flex items-center justify-center text-dim hover:text-success rounded-lg active:bg-hover transition-colors" aria-label="تعديل"><Edit size={14} /></button>
                        <button onClick={(e) => { e.stopPropagation(); onNotify(student); }} className="w-8 h-8 flex items-center justify-center text-dim hover:text-warning rounded-lg active:bg-hover transition-colors" aria-label="إرسال إشعار"><Bell size={14} /></button>
                        <button onClick={(e) => { e.stopPropagation(); onDelete(student.id); }} className="w-8 h-8 flex items-center justify-center text-dim hover:text-error rounded-lg active:bg-hover transition-colors" aria-label="حذف"><Trash size={14} /></button>
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                    <div className="text-center p-2 bg-primary-soft/50 rounded-lg">
                        <span className="text-[9px] font-bold text-dim block">العقود</span>
                        <span className="text-xs font-bold text-primary">{student.enrollments?.length || 0}</span>
                    </div>
                    <div className="text-center p-2 bg-success-soft/50 rounded-lg">
                        <span className="text-[9px] font-bold text-dim block">المستخدم</span>
                        <span className="text-xs font-bold text-success">{totalUsed}</span>
                    </div>
                    <div className="text-center p-2 bg-warning-soft/50 rounded-lg">
                        <span className="text-[9px] font-bold text-dim block">الرصيد</span>
                        <span className={cn('text-xs font-bold', hasLowBalance ? 'text-error' : 'text-warning')}>{totalExpected - totalUsed}</span>
                    </div>
                </div>
                <div>
                    <div className="flex justify-between text-[10px] text-dim mb-1">
                        <span>معدل الاستهلاك</span>
                        <span className="font-bold tabular-nums">{progress}%</span>
                    </div>
                    <ProgressBar value={progress} className="h-1.5" />
                </div>
            </div>
        );
    };

    if (students.length === 0) {
        return (
            <div className="py-16 text-center">
                <GraduationCap size={40} className="mx-auto mb-3 text-dim/30" />
                <p className="text-xs font-bold text-dim">لا توجد بيانات طلاب حالياً</p>
            </div>
        );
    }

    return (
        <Table<Student>
            data={students}
            columns={columns}
            headerVariant="primary"
            getId={(s) => s.id}
            selectedId={selectedId}
            onRowClick={onSelect}
            mobileCard={mobileCard}
        />
    );
});
