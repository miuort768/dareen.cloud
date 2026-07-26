import { memo } from 'react';
import { Edit, Trash2, Users, Phone, Mail, ArrowUpRight, MessageCircle } from 'lucide-react';
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

export const ParentsTable = memo<ParentsTableProps>(({
    parents,
    students,
    selectedParentId,
    showDetails,
    onSelectParent,
    onEdit,
    onDelete,
    onViewParent
}) => {
    return (
        <div className={cn("bg-transparent", showDetails ? "lg:col-span-2" : "col-span-3")}>
            
            {/* ── Desktop View ── */}
            <div className="hidden md:block bg-card border border-border/50 shadow-soft overflow-x-auto rounded-card">
                <table className="w-full text-start border-collapse">
                    <thead>
                        <tr className="bg-primary">
                            <th className="px-6 py-4 font-bold text-micro uppercase tracking-widest text-on-primary text-center w-16">ID</th>
                            <th className="px-6 py-4 font-bold text-micro uppercase tracking-widest text-on-primary">ولي الأمر</th>
                            <th className="px-6 py-4 font-bold text-micro uppercase tracking-widest text-on-primary">بيانات التواصل</th>
                            <th className="px-6 py-4 font-bold text-micro uppercase tracking-widest text-on-primary text-center">الطلاب المرتبطين</th>
                            <th className="px-6 py-4 font-bold text-micro uppercase tracking-widest text-on-primary text-center">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border dark:divide-border">
                        {parents.length > 0 ? parents.map((parent, idx) => {
                            const children = students.filter(s => s.parentPhone === parent.phone);
                            const isSelected = selectedParentId === parent.id;

                            return (
                                <tr
                                    key={parent.id}
                                    onClick={() => onSelectParent(parent)}
                                    className={cn(
                                        "group cursor-pointer transition-all duration-200",
                                        isSelected ? "bg-info-light" : "hover:bg-surface"
                                    )}
                                >
                                    <td className="px-6 py-4 text-center">
                                        <span className="text-micro font-medium text-dim font-mono">
                                            {String(idx + 1).padStart(2, '0')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 flex items-center justify-center font-bold text-sm bg-primary/10 text-primary rounded-xl">
                                                {parent.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm text-main uppercase tracking-tight">{parent.name}</p>
                                                <p className="text-micro font-normal text-muted mt-0.5 font-mono">#{parent.id.substring(0, 8)}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1.5">
                                            <div className="flex items-center gap-2">
                                                <div className="w-5 h-5 flex items-center justify-center bg-success-soft border border-success/50 rounded-lg">
                                                    <Phone size={10} className="text-success" />
                                                </div>
                                                <span className="font-mono text-xs font-medium text-main" dir="ltr">{parent.phone}</span>
                                            </div>
                                            {parent.email && (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-5 h-5 flex items-center justify-center bg-background border border-border/50 rounded-lg">
                                                        <Mail size={10} className="text-muted" />
                                                    </div>
                                                    <span className="text-micro font-normal text-muted truncate max-w-[180px]">{parent.email}</span>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col items-center gap-1.5">
                                            <div className="flex -space-x-2 space-x-reverse">
                                                {children.slice(0, 3).map((child, i) => (
                                                    <div key={`child-${i}`} className="w-7 h-7 bg-card border-2 border-border/50 flex items-center justify-center text-micro font-medium text-primary rounded-lg">
                                                        {child.name.charAt(0)}
                                                    </div>
                                                ))}
                                                {children.length > 3 && (
                                                    <div className="w-7 h-7 bg-primary border-2 border-white dark:border-border flex items-center justify-center text-micro font-medium text-on-primary rounded-lg">
                                                        +{children.length - 3}
                                                    </div>
                                                )}
                                            </div>
                                            <span className="text-micro font-medium text-muted uppercase tracking-widest">{children.length} طلاب</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-1">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); onEdit(parent); }}
                                                        className="w-8 h-8 flex items-center justify-center bg-card border border-border/50 text-muted hover:bg-primary hover:text-on-primary hover:border-primary transition-all rounded-xl"
                                                    >
                                                        <Edit size={13} />
                                                    </button>
                                                    <a
                                                        href={`https://wa.me/${parent.phone.replace(/[^0-9]/g, '')}`}
                                                        target="_blank" rel="noopener noreferrer"
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="w-8 h-8 flex items-center justify-center bg-card border border-border/50 text-muted hover:bg-success-soft hover:text-success transition-all rounded-xl"
                                                        title="واتساب"
                                                    >
                                                        <MessageCircle size={13} />
                                                    </a>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); onDelete(parent.id); }}
                                                        className="w-8 h-8 flex items-center justify-center bg-card border border-border/50 text-muted hover:bg-error hover:text-on-error hover:border-error transition-all rounded-xl"
                                                    >
                                                        <Trash2 size={13} />
                                                    </button>
                                                    <button onClick={() => onViewParent?.(parent)} className="w-8 h-8 flex items-center justify-center bg-card border border-border/50 text-muted hover:bg-primary hover:text-on-primary hover:border-primary transition-all rounded-xl">
                                                        <ArrowUpRight size={13} />
                                                    </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        }) : (
                            <tr>
                                <td colSpan={5} className="py-20 text-center">
                                            <div className="w-16 h-16 bg-background flex items-center justify-center mx-auto mb-4 border border-border/50 rounded-card">
                                        <Users size={32} className="text-dim" />
                                    </div>
                                    <p className="text-micro font-medium text-muted uppercase tracking-label">لا توجد سجلات حالياً</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* ── Mobile View ── */}
            <div className="md:hidden space-y-3">
                {parents.map((parent) => {
                    const children = students.filter(s => s.parentPhone === parent.phone);
                    const isSelected = selectedParentId === parent.id;

                    return (
                        <div
                            key={parent.id}
                            onClick={() => onSelectParent(parent)}
                            className={cn(
                                "bg-card border transition-all duration-200 p-4 relative shadow-soft rounded-card",
                                isSelected ? "border-primary ring-1 ring-primary/20" : "border-border/50"
                            )}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 flex items-center justify-center font-bold text-base shadow-soft bg-primary/10 text-primary rounded-xl">
                                        {parent.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-main uppercase tracking-tight leading-tight">{parent.name}</h3>
                                        <div className="flex items-center gap-1.5 mt-1">
                                            <Phone size={10} className="text-success" />
                                            <span className="text-micro font-medium text-muted font-mono" dir="ltr">{parent.phone}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button onClick={(e) => { e.stopPropagation(); onEdit(parent); }} className="w-8 h-8 flex items-center justify-center bg-card border border-border/50 text-muted hover:text-success shadow-soft transition-all rounded-xl"><Edit size={13} /></button>
                                    <a href={`https://wa.me/${parent.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="w-8 h-8 flex items-center justify-center bg-card border border-border/50 text-muted hover:text-success shadow-soft transition-all rounded-xl"><MessageCircle size={13} /></a>
                                    <button onClick={(e) => { e.stopPropagation(); onDelete(parent.id); }} className="w-8 h-8 flex items-center justify-center shadow-soft transition-all rounded-xl bg-error/10 text-error"><Trash2 size={13} /></button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
                                <div className="flex items-center gap-2">
                                    <span className="text-micro font-bold text-muted">الأبناء</span>
                                    <div className="flex -space-x-2 space-x-reverse">
                                        {children.slice(0, 3).map((_, i) => (
                                            <div key={`child-${i}`} className="w-5 h-5 rounded-md bg-primary/10 border border-primary/25" />
                                        ))}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5 px-3 py-1 shadow-soft text-on-primary text-micro font-bold rounded-xl bg-primary">
                                    <Users size={11} />
                                    {children.length}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
});
