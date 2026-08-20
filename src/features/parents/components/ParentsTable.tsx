import { memo, useMemo, useState } from 'react';
import { Edit, Trash2, Users, Phone, MessageCircle, ArrowUpRight, GraduationCap, AlertCircle, ChevronDown, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../../lib/utils';
import { canonicalPhone } from '../../../lib/phone';
import { Table, ProgressBar } from '../../../shared/components/ui';
import type { Column } from '../../../shared/components/ui';
import type { Parent, Student } from '../../../types';

const samePhone = (a?: string | null, b?: string | null) => {
    const ca = canonicalPhone(a);
    const cb = canonicalPhone(b);
    return ca.length > 0 && ca === cb;
};

const childrenOf = (parent: Parent, students: Student[]) =>
    students.filter(s => samePhone(parent.phone, s.parentPhone) || (parent.id && s.parent?.id === parent.id));

interface ParentsTableProps {
    parents: Parent[];
    students: Student[];
    selectedParentId: string | null;
    showDetails: boolean;
    onSelectParent: (parent: Parent) => void;
    onEdit: (parent: Parent) => void;
    onDelete: (id: string) => void;
    onViewParent?: (parent: Parent) => void;
}

const Tooltip = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="relative group">
        {children}
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded-lg bg-main text-inverse text-[9px] font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-sm">
            {label}
        </div>
    </div>
);

const getStatusBadge = (children: Student[]) => {
    const hasActive = children.some(c => (c.enrollments?.length || 0) > 0);
    const hasNoEnrollments = children.length === 0 || children.every(c => (c.enrollments?.length || 0) === 0);
    if (hasActive) return { label: 'نشط', bg: 'bg-success-soft', text: 'text-success', dot: 'bg-success' };
    if (hasNoEnrollments && children.length > 0) return { label: 'غير نشط', bg: 'bg-surface', text: 'text-muted', dot: 'bg-muted' };
    return { label: 'جديد', bg: 'bg-info-soft', text: 'text-info', dot: 'bg-info' };
};

const ExpandedRowContent = ({ parent, students }: { parent: Parent; students: Student[] }) => {
    const children = childrenOf(parent, students);

    return (
        <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
        >
            <div className="border-t border-border/50 bg-surface/30 px-6 py-5 space-y-5">
                <div className="grid grid-cols-3 gap-3">
                    <div className="flex items-center gap-2 px-3 py-2 bg-success-soft/30 rounded-xl border border-success/10">
                        <Phone size={12} className="text-success shrink-0" />
                        <span className="text-[10px] font-bold text-main font-mono" dir="ltr">{parent.phone}</span>
                    </div>
                    {parent.phone2 && (
                        <div className="flex items-center gap-2 px-3 py-2 bg-info-soft/30 rounded-xl border border-info/10">
                            <Phone size={12} className="text-info shrink-0" />
                            <span className="text-[10px] font-bold text-main font-mono" dir="ltr">{parent.phone2}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-2 px-3 py-2 bg-warning-soft/30 rounded-xl border border-warning/10">
                        <Users size={12} className="text-warning shrink-0" />
                        <span className="text-[10px] font-bold text-main">{children.length} أبناء</span>
                    </div>
                </div>

                <div>
                    <h5 className="text-[10px] font-bold text-muted mb-3 flex items-center gap-2">
                        <GraduationCap size={11} />
                        الأبناء المسجلين
                        <span className="px-1.5 py-0.5 bg-primary-soft text-primary text-[8px] font-bold rounded">{children.length}</span>
                    </h5>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                        {children.length > 0 ? children.map(child => {
                            const total = (child.enrollments || []).reduce((s, en) => s + en.sessionsTotal, 0);
                            const used = (child.enrollments || []).reduce((s, en) => s + en.sessionsUsed, 0);
                            const progress = total > 0 ? Math.round((used / total) * 100) : 0;
                            const hasLowBalance = (child.enrollments || []).some(en => (en.sessionsTotal - en.sessionsUsed) <= 2);
                            return (
                                <div key={child.id} className="p-3 bg-card border border-border rounded-xl hover:border-primary/20 transition-all">
                                    <div className="flex items-center gap-2.5 mb-2">
                                        <div className="w-7 h-7 rounded-lg bg-primary-soft text-primary flex items-center justify-center text-[9px] font-bold shrink-0">
                                            {(child.name || '?').charAt(0)}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[10px] font-bold text-main truncate">{child.name}</p>
                                            <p className="text-[8px] text-muted">{child.grade || '—'}</p>
                                        </div>
                                        {hasLowBalance && <AlertCircle size={10} className="text-error shrink-0" />}
                                    </div>
                                    {(child.enrollments || []).length > 0 && (
                                        <div className="space-y-1">
                                            {(child.enrollments || []).slice(0, 2).map((en, i) => (
                                                <div key={i} className="flex items-center justify-between text-[8px]">
                                                    <span className="text-muted">{en.subject}</span>
                                                    <span className="font-bold text-main">{en.sessionsUsed}/{en.sessionsTotal}</span>
                                                </div>
                                            ))}
                                            {(child.enrollments || []).length > 2 && (
                                                <p className="text-[7px] text-muted">+{(child.enrollments || []).length - 2} مواد أخرى</p>
                                            )}
                                        </div>
                                    )}
                                    {total > 0 && (
                                        <div className="mt-2">
                                            <ProgressBar value={progress} variant={hasLowBalance ? 'error' : 'primary'} className="h-1" />
                                        </div>
                                    )}
                                </div>
                            );
                        }) : (
                            <div className="col-span-full py-6 text-center border border-dashed border-border rounded-xl">
                                <p className="text-[10px] text-muted">لا يوجد أبناء مرتبطين</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export const ParentsTable = memo<ParentsTableProps>(({
    parents,
    students,
    onSelectParent,
    onEdit,
    onDelete,
    onViewParent
}) => {
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const handleToggleExpand = (parent: Parent) => {
        setExpandedId(expandedId === parent.id ? null : parent.id);
        onSelectParent(parent);
    };

    const columns: Column<Parent>[] = useMemo(() => [
        {
            key: 'name',
            header: 'ولي الأمر',
            sortable: true,
            render: (parent) => {
                const children = childrenOf(parent, students);
                const status = getStatusBadge(children);
                const hasOverdue = children.some(c => (c.enrollments || []).some(en => (en.sessionsTotal - en.sessionsUsed) <= 2));
                const isExpanded = expandedId === parent.id;
                return (
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ring-2 transition-all",
                            isExpanded ? 'bg-primary text-on-primary ring-primary/20' : 'bg-primary-soft text-primary ring-primary/20'
                        )}>
                            {(parent.name || '?').charAt(0)}
                        </div>
                        <div>
                            <div className="flex items-center gap-1.5">
                                <p className="font-bold text-xs text-main leading-tight truncate">{parent.name}</p>
                                <span className={cn("inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-bold", status.bg, status.text)}>
                                    <span className={cn("w-1 h-1 rounded-full", status.dot)} />
                                    {status.label}
                                </span>
                                {hasOverdue && <AlertTriangle size={8} className="text-error animate-pulse" />}
                            </div>
                            <p className="text-[9px] text-muted font-mono mt-0.5">ID: {(parent.id || '').substring(0, 8)}</p>
                        </div>
                    </div>
                );
            },
            mobileLabel: 'ولي الأمر',
        },
        {
            key: 'phone',
            header: 'بيانات التواصل',
            render: (parent) => (
                <div className="flex flex-col gap-1.5">
                    <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-success-soft/50 border border-success/10 rounded-lg w-fit">
                        <Phone size={9} className="text-success shrink-0" />
                        <span className="font-mono text-[10px] font-bold text-main" dir="ltr">{parent.phone}</span>
                    </div>
                    {parent.phone2 && (
                        <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-info-soft/50 border border-info/10 rounded-lg w-fit">
                            <Phone size={9} className="text-info shrink-0" />
                            <span className="font-mono text-[10px] font-bold text-main" dir="ltr">{parent.phone2}</span>
                        </div>
                    )}
                </div>
            ),
            mobileLabel: 'التواصل',
        },
        {
            key: 'students',
            header: 'الطلاب',
            align: 'center',
            render: (parent) => {
                const children = childrenOf(parent, students);
                return (
                    <div className="flex flex-col items-center gap-1">
                        <div className="flex -space-x-1.5 space-x-reverse">
                            {children.slice(0, 3).map((child, i) => (
                                <div key={child.id} className="relative group/child">
                                    <div className={cn(
                                        "w-7 h-7 flex items-center justify-center text-[8px] font-bold rounded-lg border-2 transition-all",
                                        i === 0 ? 'bg-primary/10 text-primary border-primary/20' :
                                        i === 1 ? 'bg-success/10 text-success border-success/20' :
                                        'bg-warning/10 text-warning border-warning/20'
                                    )}>
                                        {(child.name || '?').charAt(0)}
                                    </div>
                                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-main text-inverse text-[8px] font-bold rounded whitespace-nowrap opacity-0 group-hover/child:opacity-100 transition-opacity pointer-events-none z-50">
                                        {child.name}
                                    </div>
                                </div>
                            ))}
                            {children.length > 3 && (
                                <div className="w-7 h-7 flex items-center justify-center text-[8px] font-bold bg-primary text-on-primary rounded-lg border-2 border-primary/30">
                                    +{children.length - 3}
                                </div>
                            )}
                        </div>
                        <span className="text-[9px] font-bold text-muted">{children.length} طلاب</span>
                    </div>
                );
            },
            mobileLabel: 'الأبناء',
        },
        {
            key: 'actions',
            header: 'إجراءات',
            align: 'center',
            className: 'text-center',
            render: (parent) => (
                <div className="flex items-center justify-center gap-1">
                    <Tooltip label="تعديل">
                        <button onClick={(e) => { e.stopPropagation(); onEdit(parent); }} className="w-7 h-7 flex items-center justify-center rounded-lg bg-primary text-on-primary hover:bg-primary-hover transition-all active:scale-90" aria-label="تعديل">
                            <Edit size={11} />
                        </button>
                    </Tooltip>
                    <Tooltip label="واتساب">
                        <a href={`https://wa.me/${parent.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="w-7 h-7 flex items-center justify-center rounded-lg bg-success text-on-success hover:bg-success-hover transition-all active:scale-90" title="واتساب">
                            <MessageCircle size={11} />
                        </a>
                    </Tooltip>
                    <Tooltip label="حذف">
                        <button onClick={(e) => { e.stopPropagation(); onDelete(parent.id); }} className="w-7 h-7 flex items-center justify-center rounded-lg bg-error text-on-error hover:bg-error-hover transition-all active:scale-90" aria-label="حذف">
                            <Trash2 size={11} />
                        </button>
                    </Tooltip>
                    <Tooltip label="فتح الملف">
                        <button onClick={(e) => { e.stopPropagation(); onViewParent?.(parent); }} className="w-7 h-7 flex items-center justify-center rounded-lg bg-surface border border-border text-primary hover:bg-primary-soft transition-all active:scale-90" aria-label="فتح الملف">
                            <ArrowUpRight size={11} />
                        </button>
                    </Tooltip>
                </div>
            ),
        },
        {
            key: 'expand',
            header: '',
            align: 'center',
            className: 'w-10',
            render: (parent) => (
                <ChevronDown size={13} className={cn("text-muted transition-transform duration-200", expandedId === parent.id && "rotate-180")} />
            ),
        },
    ], [students, expandedId, onEdit, onDelete, onViewParent]);

    const mobileCard = (parent: Parent) => {
        const children = childrenOf(parent, students);
        const status = getStatusBadge(children);
        const isExpanded = expandedId === parent.id;
        const total = children.reduce((s, c) => s + (c.enrollments || []).reduce((se, en) => se + en.sessionsTotal, 0), 0);
        const used = children.reduce((s, c) => s + (c.enrollments || []).reduce((se, en) => se + en.sessionsUsed, 0), 0);

        return (
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ring-2",
                            isExpanded ? 'bg-primary text-on-primary ring-primary/20' : 'bg-primary-soft text-primary ring-primary/20'
                        )}>
                            {(parent.name || '?').charAt(0)}
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                                <h4 className="text-sm font-bold text-main leading-tight truncate">{parent.name}</h4>
                                <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", status.dot)} />
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                                <Phone size={8} className="text-success shrink-0" />
                                <span className="text-[9px] font-mono text-muted" dir="ltr">{parent.phone}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                        <Tooltip label="تعديل">
                            <button onClick={(e) => { e.stopPropagation(); onEdit(parent); }} className="w-7 h-7 flex items-center justify-center rounded-lg bg-primary text-on-primary active:scale-90"><Edit size={11} /></button>
                        </Tooltip>
                        <Tooltip label="واتساب">
                            <a href={`https://wa.me/${parent.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="w-7 h-7 flex items-center justify-center rounded-lg bg-success text-on-success active:scale-90"><MessageCircle size={11} /></a>
                        </Tooltip>
                        <Tooltip label="حذف">
                            <button onClick={(e) => { e.stopPropagation(); onDelete(parent.id); }} className="w-7 h-7 flex items-center justify-center rounded-lg bg-error text-on-error active:scale-90"><Trash2 size={11} /></button>
                        </Tooltip>
                    </div>
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex -space-x-1.5 space-x-reverse">
                        {children.slice(0, 3).map((child, i) => (
                            <div key={child.id} className={cn(
                                "w-6 h-6 flex items-center justify-center text-[7px] font-bold rounded-lg border-2",
                                i === 0 ? 'bg-primary/10 text-primary border-primary/20' :
                                i === 1 ? 'bg-success/10 text-success border-success/20' :
                                'bg-warning/10 text-warning border-warning/20'
                            )}>
                                {(child.name || '?').charAt(0)}
                            </div>
                        ))}
                        {children.length > 3 && (
                            <div className="w-6 h-6 flex items-center justify-center text-[7px] font-bold bg-primary text-on-primary rounded-lg border-2 border-primary/30">+{children.length - 3}</div>
                        )}
                    </div>
                    <span className="text-[9px] font-bold text-muted">{children.length} طلاب</span>
                </div>
                {total > 0 && (
                    <div>
                        <div className="flex justify-between text-[10px] text-muted mb-1">
                            <span>معدل الاستهلاك</span>
                            <span className="font-bold tabular-nums">{Math.round((used / total) * 100)}%</span>
                        </div>
                        <ProgressBar value={Math.round((used / total) * 100)} variant="primary" className="h-1.5" />
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-0">
            <Table<Parent>
                data={parents}
                columns={columns}
                headerVariant="gradient"
                getId={(p) => p.id}
                selectedId={expandedId}
                onRowClick={handleToggleExpand}
                mobileCard={mobileCard}
            />

            <AnimatePresence>
                {expandedId && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <ExpandedRowContent
                            parent={parents.find(p => p.id === expandedId)!}
                            students={students}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
});
