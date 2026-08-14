import { memo, useMemo } from 'react';
import { Edit, Trash, Bell, GraduationCap, Star, AlertTriangle } from 'lucide-react';
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
  showDetails?: boolean;
  isTeacherView?: boolean;
  teachers?: unknown[];
}

const Tooltip = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="relative group">
    {children}
    <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded-lg bg-main text-inverse text-[9px] font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-sm">
      {label}
    </div>
  </div>
);

const gradeColors: Record<string, { bg: string; text: string; ring: string }> = {
  أول: { bg: 'bg-primary/10', text: 'text-primary', ring: 'ring-primary/20' },
  ثاني: { bg: 'bg-success/10', text: 'text-success', ring: 'ring-success/20' },
  ثالث: { bg: 'bg-info/10', text: 'text-info', ring: 'ring-info/20' },
  رابع: { bg: 'bg-warning/10', text: 'text-warning', ring: 'ring-warning/20' },
  خامس: { bg: 'bg-accent/10', text: 'text-accent', ring: 'ring-accent/20' },
  سادس: { bg: 'bg-error/10', text: 'text-error', ring: 'ring-error/20' },
};

const getGradeColor = (grade?: string) => {
  if (!grade) return { bg: 'bg-primary-soft', text: 'text-primary', ring: 'ring-primary/20' };
  const key = Object.keys(gradeColors).find(k => grade.includes(k));
  return key ? gradeColors[key] : { bg: 'bg-info-soft', text: 'text-info', ring: 'ring-info/20' };
};

export const StudentTable = memo(({ students, selectedId, onSelect, onEdit, onDelete, onNotify }: StudentTableProps) => {
  const columns: Column<Student>[] = useMemo(() => [
    {
      key: 'name',
      header: 'الطالب',
      sortable: true,
      render: (student) => {
        const hasLowBalance = (student.enrollments || []).some(en => (en.sessionsTotal - en.sessionsUsed) <= 2);
        const gc = getGradeColor(student.grade);
        return (
          <div className="flex items-center gap-3">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ring-2", gc.bg, gc.text, gc.ring)}>
              {(student.name || '?').charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <p className="font-bold text-xs text-main leading-tight">{student.name || '—'}</p>
                {hasLowBalance && (
                   <span className="text-[8px] font-bold text-error bg-error-soft px-1.5 py-0.5 rounded animate-pulse"><AlertTriangle size={8} /></span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[9px] text-muted font-mono">ID: {(student.id || '').substring(0, 6)}</span>
                {student.parentPhone && (
                  <span className="text-[9px] text-muted">{student.parentPhone}</span>
                )}
              </div>
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
      render: (student) => {
        const gc = getGradeColor(student.grade);
        return (
          <span className={cn("inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold ring-1", gc.bg, gc.text, gc.ring)}>
            <GraduationCap size={10} />
            {student.grade || '—'}
          </span>
        );
      },
      mobileLabel: 'المستوى',
    },
    {
      key: 'enrollments',
      header: 'الاشتراكات',
      align: 'center',
      render: (student) => {
        const count = student.enrollments?.length || 0;
        return (
          <span className={cn(
            "w-7 h-7 inline-flex items-center justify-center font-bold text-xs rounded-lg ring-1",
            count > 0 ? 'bg-primary-soft text-primary ring-primary/20' : 'bg-surface text-muted ring-border'
          )}>
            {count}
          </span>
        );
      },
      mobileLabel: 'العقود',
    },
    {
      key: 'sessions',
      header: 'الحصص',
      sortable: true,
      align: 'center',
      render: (student) => {
        const totalExpected = (student.enrollments || []).reduce((acc, en) => acc + (en.sessionsTotal || 0), 0);
        const totalUsed = (student.enrollments || []).reduce((acc, en) => acc + (en.sessionsUsed || 0), 0);
        const remaining = totalExpected - totalUsed;
        return (
          <span className="text-xs font-bold text-main tabular-nums">
            {totalUsed} <span className="text-muted">/</span> {totalExpected}
            {remaining <= 2 && remaining > 0 && (
              <span className="text-[8px] text-error block">{remaining} رصيد</span>
            )}
          </span>
        );
      },
      mobileLabel: 'الحصص',
    },
    {
      key: 'progress',
      header: 'التقدم',
      align: 'center',
      render: (student) => {
        const totalExpected = (student.enrollments || []).reduce((acc, en) => acc + (en.sessionsTotal || 0), 0);
        const totalUsed = (student.enrollments || []).reduce((acc, en) => acc + (en.sessionsUsed || 0), 0);
        const progress = totalExpected > 0 ? Math.round((totalUsed / totalExpected) * 100) : 0;
        const isLow = (totalExpected - totalUsed) <= 2;
        return (
          <div className="flex items-center gap-2">
            <ProgressBar
              value={progress}
              showLabel
              variant={isLow ? 'error' : 'primary'}
              className="min-w-[120px]"
            />
          </div>
        );
      },
      mobileLabel: 'التقدم',
    },
    {
      key: 'xp',
      header: 'XP',
      align: 'center',
      render: (student) => {
        const pts = student.totalPoints || 0;
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-warning">
            <Star size={10} />
            {pts > 0 ? pts.toLocaleString() : '—'}
          </span>
        );
      },
      mobileLabel: 'XP',
    },
    {
      key: 'actions',
      header: 'إجراءات',
      align: 'center',
      className: 'text-center',
      render: (student) => (
        <div className="flex items-center justify-center gap-1">
          <Tooltip label="تعديل">
            <button onClick={(e) => { e.stopPropagation(); onEdit(student); }} className="min-w-[34px] min-h-[34px] flex items-center justify-center bg-primary text-on-primary rounded-xl text-[10px] font-bold hover:bg-primary-hover transition-all active:scale-95 shadow-sm" aria-label="تعديل">
              <Edit size={13} />
            </button>
          </Tooltip>
          <Tooltip label="إشعار">
            <button onClick={(e) => { e.stopPropagation(); onNotify(student); }} className="min-w-[34px] min-h-[34px] flex items-center justify-center text-muted hover:bg-warning-soft hover:text-warning rounded-xl transition-all" aria-label="إشعار">
              <Bell size={13} />
            </button>
          </Tooltip>
          <Tooltip label="حذف">
            <button onClick={(e) => { e.stopPropagation(); onDelete(student.id); }} className="min-w-[34px] min-h-[34px] flex items-center justify-center text-muted hover:bg-error-soft hover:text-error rounded-xl transition-all" aria-label="حذف">
              <Trash size={13} />
            </button>
          </Tooltip>
        </div>
      ),
    },
  ], [onEdit, onNotify, onDelete]);

  const mobileCard = (student: Student) => {
    const totalExpected = (student.enrollments || []).reduce((acc, en) => acc + (en.sessionsTotal || 0), 0);
    const totalUsed = (student.enrollments || []).reduce((acc, en) => acc + (en.sessionsUsed || 0), 0);
    const progress = totalExpected > 0 ? Math.round((totalUsed / totalExpected) * 100) : 0;
    const hasLowBalance = (student.enrollments || []).some(en => (en.sessionsTotal - en.sessionsUsed) <= 2);
    const gc = getGradeColor(student.grade);
    const pts = student.totalPoints || 0;

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ring-2", gc.bg, gc.text, gc.ring)}>
              {(student.name || '?').charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-bold text-main leading-tight truncate">{student.name || '—'}</h4>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={cn("inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold ring-1", gc.bg, gc.text, gc.ring)}>
                  {student.grade || '—'}
                </span>
                {pts > 0 && (
                  <span className="text-[9px] text-warning font-bold flex items-center gap-0.5">
                    <Star size={8} />{pts}
                  </span>
                )}
                 {hasLowBalance && <AlertTriangle size={10} className="text-error" />}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Tooltip label="تعديل">
              <button onClick={(e) => { e.stopPropagation(); onEdit(student); }} className="min-w-[34px] min-h-[34px] flex items-center justify-center bg-primary text-on-primary rounded-xl active:scale-95" aria-label="تعديل"><Edit size={13} /></button>
            </Tooltip>
            <Tooltip label="إشعار">
              <button onClick={(e) => { e.stopPropagation(); onNotify(student); }} className="min-w-[34px] min-h-[34px] flex items-center justify-center text-muted hover:bg-warning-soft hover:text-warning rounded-xl" aria-label="إشعار"><Bell size={13} /></button>
            </Tooltip>
            <Tooltip label="حذف">
              <button onClick={(e) => { e.stopPropagation(); onDelete(student.id); }} className="min-w-[34px] min-h-[34px] flex items-center justify-center text-muted hover:bg-error-soft hover:text-error rounded-xl" aria-label="حذف"><Trash size={13} /></button>
            </Tooltip>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2 bg-primary-soft/50 rounded-xl">
            <span className="text-[9px] font-bold text-muted block">العقود</span>
            <span className="text-xs font-bold text-primary">{student.enrollments?.length || 0}</span>
          </div>
          <div className="text-center p-2 bg-success-soft/50 rounded-xl">
            <span className="text-[9px] font-bold text-muted block">المستخدم</span>
            <span className="text-xs font-bold text-success">{totalUsed}</span>
          </div>
          <div className="text-center p-2 bg-warning-soft/50 rounded-xl">
            <span className="text-[9px] font-bold text-muted block">الرصيد</span>
            <span className={cn('text-xs font-bold', hasLowBalance ? 'text-error' : 'text-warning')}>{totalExpected - totalUsed}</span>
          </div>
        </div>
        <div>
          <div className="flex justify-between text-[10px] text-muted mb-1">
            <span>معدل الاستهلاك</span>
            <span className="font-bold tabular-nums">{progress}%</span>
          </div>
          <ProgressBar value={progress} variant={hasLowBalance ? 'error' : 'primary'} className="h-1.5" />
        </div>
      </div>
    );
  };

  if (students.length === 0) {
    return (
      <div className="py-16 text-center bg-card border border-border rounded-2xl">
        <GraduationCap size={48} className="mx-auto mb-3 text-muted/20" />
        <p className="text-sm font-bold text-muted">لا توجد بيانات طلاب حالياً</p>
        <p className="text-[10px] text-muted/60 mt-1">قم بإضافة طالب جديد للبدء</p>
      </div>
    );
  }

  return (
    <Table<Student>
      data={students}
      columns={columns}
      headerVariant="gradient"
      getId={(s) => s.id}
      selectedId={selectedId}
      onRowClick={onSelect}
      mobileCard={mobileCard}
    />
  );
});