import { memo, useMemo } from 'react';
import { Edit, Trash, Bell, GraduationCap } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { Table } from '../../../shared/components/ui/Table';
import type { Column } from '../../../shared/components/ui/Table';
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
                    <div className="flex items-center gap-3 min-w-[140px]">
                        <div className="flex-1 bg-surface h-1.5 overflow-hidden">
                            <div
                                className={cn('h-full transition-all duration-1000', progress < 30 ? 'bg-error' : progress < 70 ? 'bg-warning' : 'bg-success')}
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <span className="text-micro font-normal text-dim font-mono">{progress}%</span>
                    </div>
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
                    <button onClick={(e) => { e.stopPropagation(); onEdit(student); }} className="w-8 h-8 flex items-center justify-center text-dim hover:bg-hover hover:text-success transition-all" title="تعديل"><Edit size={14} /></button>
                    <button onClick={(e) => { e.stopPropagation(); onNotify(student); }} className="w-8 h-8 flex items-center justify-center text-dim hover:bg-warning-soft hover:text-warning transition-all" title="إشعار"><Bell size={14} /></button>
                    <button onClick={(e) => { e.stopPropagation(); onDelete(student.id); }} className="w-8 h-8 flex items-center justify-center text-dim hover:bg-error-soft hover:text-error transition-all" title="حذف"><Trash size={14} /></button>
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
            <div>
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 flex items-center justify-center font-bold text-sm bg-primary-soft text-primary">
                            {student.name.charAt(0)}
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-main leading-tight mb-1">{student.name}</h4>
                            <span className="text-micro font-bold px-1.5 py-0.5 bg-primary-soft text-primary">{student.grade}</span>
                        </div>
                    </div>
                    <div className="flex gap-1">
                        <button onClick={(e) => { e.stopPropagation(); onEdit(student); }} className="w-8 h-8 bg-card border border-border text-dim hover:text-success flex items-center justify-center transition-all"><Edit size={14} /></button>
                        <button onClick={(e) => { e.stopPropagation(); onNotify(student); }} className="w-8 h-8 flex items-center justify-center bg-warning-soft text-warning"><Bell size={14} /></button>
                        <button onClick={(e) => { e.stopPropagation(); onDelete(student.id); }} className="w-8 h-8 flex items-center justify-center bg-error-soft text-error"><Trash size={14} /></button>
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="p-2 text-center bg-primary-soft">
                        <span className="text-micro font-bold text-primary block mb-1">العقود</span>
                        <span className="text-xs font-black text-primary">{student.enrollments?.length || 0}</span>
                    </div>
                    <div className="p-2 text-center bg-success-soft">
                        <span className="text-micro font-bold text-success block mb-1">المستخدم</span>
                        <span className="text-xs font-black text-success">{totalUsed}</span>
                    </div>
                    <div className="p-2 text-center bg-warning-soft">
                        <span className="text-micro font-bold text-warning block mb-1">الرصيد</span>
                        <span className={cn('text-xs font-black', hasLowBalance ? 'text-error' : 'text-warning')}>{totalExpected - totalUsed}</span>
                    </div>
                </div>
                <div className="space-y-1.5">
                    <div className="flex justify-between text-micro font-normal text-dim">
                        <span>معدل الاستهلاك</span>
                        <span className="font-mono">{progress}%</span>
                    </div>
                    <div className="w-full bg-surface h-1.5 overflow-hidden">
                        <div
                            className={cn('h-full transition-all', progress < 30 ? 'bg-error' : progress < 70 ? 'bg-warning' : 'bg-success')}
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            </div>
        );
    };

    if (students.length === 0) {
        return (
            <div className="py-24 text-center opacity-40">
                <GraduationCap size={48} className="mx-auto mb-4 text-dim" />
                <p className="text-micro font-normal text-dim uppercase tracking-[4px]">لا توجد بيانات طلاب حالياً</p>
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
