import { memo, useMemo, useState, Fragment } from 'react';
import { Edit, Trash2, Users, Phone, Mail, MessageCircle, ArrowUpRight, GraduationCap, AlertCircle, Star, X, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../../lib/utils';
import type { Parent, Student } from '../../../types';

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

type SortField = 'name' | 'phone' | 'students';
type SortDir = 'asc' | 'desc';

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

export const ParentsTable = memo<ParentsTableProps>(({
    parents,
    students,
    selectedParentId,
    onSelectParent,
    onEdit,
    onDelete,
    onViewParent
}) => {
    const [sortField, setSortField] = useState<SortField>('name');
    const [sortDir, setSortDir] = useState<SortDir>('asc');
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const toggleSort = (field: SortField) => {
        if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortField(field); setSortDir('asc'); }
    };

    const sortedParents = useMemo(() => {
        return [...parents].sort((a, b) => {
            const childrenA = students.filter(s => s.parentPhone === a.phone);
            const childrenB = students.filter(s => s.parentPhone === b.phone);
            let cmp = 0;
            if (sortField === 'name') cmp = a.name.localeCompare(b.name);
            else if (sortField === 'phone') cmp = a.phone.localeCompare(b.phone);
            else if (sortField === 'students') cmp = childrenA.length - childrenB.length;
            return sortDir === 'asc' ? cmp : -cmp;
        });
    }, [parents, students, sortField, sortDir]);

    const handleToggleExpand = (parent: Parent) => {
        setExpandedId(expandedId === parent.id ? null : parent.id);
        onSelectParent(parent);
    };

    const SortIcon = ({ field }: { field: SortField }) => {
        if (sortField !== field) return <ArrowUpRight size={10} className="text-muted/40" />;
        return sortDir === 'asc' ? <ChevronUp size={10} /> : <ChevronDown size={10} />;
    };

    return (
        <div className="bg-card border border-border overflow-hidden rounded-2xl">
            {/* ── Desktop Table ── */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-start border-collapse">
                    <thead className="sticky top-0 z-10">
                        <tr className="bg-gradient-to-l from-primary/5 via-primary/10 to-primary/5 border-b border-border">
                            <th className="px-5 py-3 font-bold text-[10px] text-muted text-center w-12">#</th>
                            <th className="px-5 py-3 font-bold text-[10px] text-muted cursor-pointer select-none" onClick={() => toggleSort('name')}>
                                <span className="flex items-center gap-1.5"><SortIcon field="name" /> ولي الأمر</span>
                            </th>
                            <th className="px-5 py-3 font-bold text-[10px] text-muted">بيانات التواصل</th>
                            <th className="px-5 py-3 font-bold text-[10px] text-muted cursor-pointer select-none text-center" onClick={() => toggleSort('students')}>
                                <span className="inline-flex items-center gap-1.5"><SortIcon field="students" /> الطلاب</span>
                            </th>
                            <th className="px-5 py-3 font-bold text-[10px] text-muted text-center">الإجراءات</th>
                            <th className="px-5 py-3 font-bold text-[10px] text-muted text-center w-10"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {sortedParents.length > 0 ? sortedParents.map((parent, idx) => {
                            const children = students.filter(s => s.parentPhone === parent.phone);
                            const isSelected = selectedParentId === parent.id;
                            const isExpanded = expandedId === parent.id;
                            const status = getStatusBadge(children);
                            const hasOverdue = children.some(c => (c.enrollments || []).some(en => (en.sessionsTotal - en.sessionsUsed) <= 2));

                            return (
                                <Fragment key={parent.id}>
                                    <tr
                                        onClick={() => handleToggleExpand(parent)}
                                        className={cn(
                                            "group cursor-pointer transition-all duration-150",
                                            idx % 2 === 0 ? 'bg-card' : 'bg-surface/50',
                                            isExpanded && "bg-primary-soft/30 shadow-sm"
                                        )}
                                    >
                                        <td className="px-5 py-4 text-center">
                                            <span className="text-[10px] font-bold text-muted font-mono">
                                                {String(idx + 1).padStart(2, '0')}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className={cn(
                                                    "w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ring-2 transition-all",
                                                    isExpanded ? 'bg-primary text-on-primary ring-primary/20' : 'bg-primary-soft text-primary ring-primary/20'
                                                )}>
                                                    {(parent.name || '?').charAt(0)}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-bold text-xs text-main leading-tight truncate">{parent.name}</p>
                                                        <span className={cn("inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-bold", status.bg, status.text)}>
                                                            <span className={cn("w-1 h-1 rounded-full", status.dot)} />
                                                            {status.label}
                                                        </span>
                                                        {hasOverdue && (
                                                            <span className="text-[8px] text-error animate-pulse">⚠️</span>
                                                        )}
                                                    </div>
                                                    <p className="text-[9px] text-muted font-mono mt-0.5">ID: {(parent.id || '').substring(0, 8)}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex flex-col gap-1.5">
                                                <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-success-soft/50 border border-success/10 rounded-lg w-fit">
                                                    <Phone size={9} className="text-success shrink-0" />
                                                    <span className="font-mono text-[10px] font-bold text-main" dir="ltr">{parent.phone}</span>
                                                </div>
                                                {parent.email && (
                                                    <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-info-soft/50 border border-info/10 rounded-lg w-fit">
                                                        <Mail size={9} className="text-info shrink-0" />
                                                        <span className="text-[9px] font-medium text-muted truncate max-w-[160px]">{parent.email}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex flex-col items-center gap-1">
                                                <div className="flex -space-x-1.5 space-x-reverse">
                                                    {children.slice(0, 3).map((child, i) => (
                                                        <div key={child.id} className="relative group/child">
                                                            <div className={cn(
                                                                "w-7 h-7 flex items-center justify-center text-[8px] font-bold rounded-lg border-2 transition-all",
                                                                i === 0 ? 'bg-purple-500/10 text-purple-600 border-purple-500/20' :
                                                                i === 1 ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
                                                                'bg-amber-500/10 text-amber-600 border-amber-500/20'
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
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center justify-center gap-1">
                                                <Tooltip label="تعديل">
                                                    <button onClick={(e) => { e.stopPropagation(); onEdit(parent); }} className="w-7 h-7 flex items-center justify-center rounded-lg bg-primary-soft text-primary hover:bg-primary hover:text-on-primary transition-all active:scale-90" aria-label="تعديل">
                                                        <Edit size={11} />
                                                    </button>
                                                </Tooltip>
                                                <Tooltip label="واتساب">
                                                    <a href={`https://wa.me/${parent.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="w-7 h-7 flex items-center justify-center rounded-lg bg-success-soft text-success hover:bg-success hover:text-on-success transition-all active:scale-90" title="واتساب">
                                                        <MessageCircle size={11} />
                                                    </a>
                                                </Tooltip>
                                                <Tooltip label="حذف">
                                                    <button onClick={(e) => { e.stopPropagation(); onDelete(parent.id); }} className="w-7 h-7 flex items-center justify-center rounded-lg bg-error-soft text-error hover:bg-error hover:text-on-error transition-all active:scale-90" aria-label="حذف">
                                                        <Trash2 size={11} />
                                                    </button>
                                                </Tooltip>
                                                <Tooltip label="فتح الملف">
                                                    <button onClick={(e) => { e.stopPropagation(); onViewParent?.(parent); }} className="w-7 h-7 flex items-center justify-center rounded-lg bg-primary-soft text-primary hover:bg-primary hover:text-on-primary transition-all active:scale-90" aria-label="فتح الملف">
                                                        <ArrowUpRight size={11} />
                                                    </button>
                                                </Tooltip>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-center">
                                            <ChevronDown size={13} className={cn("text-muted transition-transform duration-200", isExpanded && "rotate-180")} />
                                        </td>
                                    </tr>
                                    {/* Expanded Row */}
                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.tr
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <td colSpan={6} className="p-0">
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                                                        className="overflow-hidden"
                                                    >
                                                        <div className={cn(
                                                            "border-t border-border/50 px-6 py-5 space-y-5",
                                                            idx % 2 === 0 ? 'bg-surface/30' : 'bg-card'
                                                        )}>
                                                            {/* Contact Row */}
                                                            <div className="grid grid-cols-4 gap-3">
                                                                <div className="flex items-center gap-2 px-3 py-2 bg-success-soft/30 rounded-xl border border-success/10">
                                                                    <Phone size={12} className="text-success shrink-0" />
                                                                    <span className="text-[10px] font-bold text-main font-mono" dir="ltr">{parent.phone}</span>
                                                                </div>
                                                                {parent.email && (
                                                                    <div className="flex items-center gap-2 px-3 py-2 bg-info-soft/30 rounded-xl border border-info/10">
                                                                        <Mail size={12} className="text-info shrink-0" />
                                                                        <span className="text-[10px] font-bold text-main truncate">{parent.email}</span>
                                                                    </div>
                                                                )}
                                                                <div className="flex items-center gap-2 px-3 py-2 bg-warning-soft/30 rounded-xl border border-warning/10">
                                                                    <Users size={12} className="text-warning shrink-0" />
                                                                    <span className="text-[10px] font-bold text-main">{children.length} أبناء</span>
                                                                </div>
                                                                <div className="flex items-center gap-2 px-3 py-2 bg-surface rounded-xl border border-border">
                                                                    <Star size={12} className="text-muted shrink-0" />
                                                                    <span className="text-[10px] font-bold text-main">{status.label}</span>
                                                                </div>
                                                            </div>

                                                            {/* Children Mini Cards */}
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
                                                                                    <div className="mt-2 h-1 w-full bg-surface rounded-full overflow-hidden">
                                                                                        <div className={cn("h-full rounded-full transition-all", hasLowBalance ? 'bg-error' : 'bg-primary')} style={{ width: `${Math.round((used / total) * 100)}%` }} />
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
                                                </td>
                                            </motion.tr>
                                        )}
                                    </AnimatePresence>
                                </Fragment>
                            );
                        }) : (
                            <tr>
                                <td colSpan={6} className="py-16 text-center">
                                    <div className="w-14 h-14 bg-surface flex items-center justify-center mx-auto mb-3 border border-border rounded-2xl">
                                        <Users size={28} className="text-muted" />
                                    </div>
                                    <p className="text-[11px] font-bold text-muted">لا توجد سجلات حالياً</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* ── Mobile View ── */}
            <div className="md:hidden space-y-2 p-2">
                {sortedParents.map((parent) => {
                    const children = students.filter(s => s.parentPhone === parent.phone);
                    const isSelected = selectedParentId === parent.id;
                    const isExpanded = expandedId === parent.id;
                    const status = getStatusBadge(children);

                    return (
                        <Fragment key={parent.id}>
                            <div
                                onClick={() => handleToggleExpand(parent)}
                                className={cn(
                                    "bg-card border transition-all duration-200 p-3 rounded-2xl cursor-pointer",
                                    isExpanded ? "border-primary/30 ring-1 ring-primary/10" : "border-border"
                                )}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                        <div className={cn(
                                            "w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ring-2",
                                            isExpanded ? 'bg-primary text-on-primary ring-primary/20' : 'bg-primary-soft text-primary ring-primary/20'
                                        )}>
                                            {(parent.name || '?').charAt(0)}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-1.5">
                                                <p className="text-xs font-bold text-main truncate">{parent.name}</p>
                                                <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", status.dot)} />
                                            </div>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <Phone size={8} className="text-success shrink-0" />
                                                <span className="text-[9px] font-mono text-muted" dir="ltr">{parent.phone}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <ChevronDown size={14} className={cn("text-muted shrink-0 transition-transform", isExpanded && "rotate-180")} />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex -space-x-1.5 space-x-reverse">
                                        {children.slice(0, 3).map((child, i) => (
                                            <div key={child.id} className={cn(
                                                "w-6 h-6 flex items-center justify-center text-[7px] font-bold rounded-lg border-2",
                                                i === 0 ? 'bg-purple-500/10 text-purple-600 border-purple-500/20' :
                                                i === 1 ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
                                                'bg-amber-500/10 text-amber-600 border-amber-500/20'
                                            )}>
                                                {(child.name || '?').charAt(0)}
                                            </div>
                                        ))}
                                        {children.length > 3 && (
                                            <div className="w-6 h-6 flex items-center justify-center text-[7px] font-bold bg-primary text-on-primary rounded-lg border-2 border-primary/30">+{children.length - 3}</div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Tooltip label="تعديل">
                                            <button onClick={(e) => { e.stopPropagation(); onEdit(parent); }} className="w-7 h-7 flex items-center justify-center rounded-lg bg-primary-soft text-primary active:scale-90"><Edit size={11} /></button>
                                        </Tooltip>
                                        <Tooltip label="واتساب">
                                            <a href={`https://wa.me/${parent.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="w-7 h-7 flex items-center justify-center rounded-lg bg-success-soft text-success active:scale-90"><MessageCircle size={11} /></a>
                                        </Tooltip>
                                        <Tooltip label="حذف">
                                            <button onClick={(e) => { e.stopPropagation(); onDelete(parent.id); }} className="w-7 h-7 flex items-center justify-center rounded-lg bg-error-soft text-error active:scale-90"><Trash2 size={11} /></button>
                                        </Tooltip>
                                    </div>
                                </div>
                            </div>

                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="px-3 pb-3 space-y-3">
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="flex items-center gap-2 px-2.5 py-2 bg-success-soft/30 rounded-xl border border-success/10">
                                                    <Phone size={10} className="text-success shrink-0" />
                                                    <span className="text-[9px] font-bold text-main font-mono" dir="ltr">{parent.phone}</span>
                                                </div>
                                                {parent.email && (
                                                    <div className="flex items-center gap-2 px-2.5 py-2 bg-info-soft/30 rounded-xl border border-info/10">
                                                        <Mail size={10} className="text-info shrink-0" />
                                                        <span className="text-[9px] font-bold text-main truncate">{parent.email}</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <p className="text-[9px] font-bold text-muted flex items-center gap-1.5">
                                                    <GraduationCap size={10} />
                                                    الأبناء ({children.length})
                                                </p>
                                                {children.length > 0 ? children.slice(0, 2).map(child => {
                                                    const total = (child.enrollments || []).reduce((s, en) => s + en.sessionsTotal, 0);
                                                    const used = (child.enrollments || []).reduce((s, en) => s + en.sessionsUsed, 0);
                                                    return (
                                                        <div key={child.id} className="flex items-center gap-2 p-2 bg-card border border-border rounded-xl">
                                                            <div className="w-6 h-6 rounded-lg bg-primary-soft text-primary flex items-center justify-center text-[8px] font-bold shrink-0">
                                                                {(child.name || '?').charAt(0)}
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <div className="flex items-center justify-between">
                                                                    <span className="text-[9px] font-bold text-main truncate">{child.name}</span>
                                                                    <span className="text-[8px] text-muted">{child.grade || '—'}</span>
                                                                </div>
                                                                {total > 0 && (
                                                                    <div className="mt-1 h-1 w-full bg-surface rounded-full overflow-hidden">
                                                                        <div className="h-full bg-primary rounded-full" style={{ width: `${Math.round((used / total) * 100)}%` }} />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                }) : (
                                                    <p className="text-[9px] text-muted">لا يوجد أبناء</p>
                                                )}
                                                {children.length > 2 && (
                                                    <p className="text-[8px] text-muted">+{children.length - 2} أبناء آخرون</p>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </Fragment>
                    );
                })}
            </div>
        </div>
    );
});

