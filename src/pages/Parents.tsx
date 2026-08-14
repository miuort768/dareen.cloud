import { useEffect, useState, useMemo } from 'react';
import { AlertCircle, Plus, Users, GraduationCap, Phone, Mail, Download } from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { cn } from '../lib/utils';
import { downloadExport } from '../lib/download';
import { useShowNotification, useAcademyName } from '../context/AppContext';

import { ParentsHeader } from '../features/parents/components/ParentsHeader';
import { ParentsTable } from '../features/parents/components/ParentsTable';
import { ParentDrawer } from '../features/parents/components/ParentDrawer';
import { ParentForm } from '../features/parents/components/ParentForm';
import { useParents } from '../features/parents/hooks/useParents';

function AnimatedCounter({ value }: { value: number }) {
    const motionValue = useMotionValue(0);
    const spring = useSpring(motionValue, { stiffness: 80, damping: 20 });
    const rounded = useTransform(spring, (v) => Math.round(v));
    const displayValue = useTransform(rounded, (v) => v.toLocaleString('ar-EG'));
    useEffect(() => { motionValue.set(value); }, [value, motionValue]);
    return <motion.span className="text-2xl font-bold tabular-nums">{displayValue}</motion.span>;
}

const particles = Array.from({ length: 8 }, (_, i) => ({
    id: i, x: Math.random() * 100, y: Math.random() * 100,
    size: Math.random() * 5 + 2, duration: Math.random() * 6 + 4, delay: Math.random() * 3,
}));

export const Parents = () => {
    const academyName = useAcademyName();
    useEffect(() => { document.title = `أولياء الأمور | ${academyName}`; }, [academyName]);
    const { state, actions } = useParents();
    const showNotification = useShowNotification();
    const [fabOpen, setFabOpen] = useState(false);

    const [filterStatus, setFilterStatus] = useState('');

    const avgChildren = useMemo(() =>
        state.totalParents > 0 ? (state.totalLinkedStudents / state.totalParents) : 0,
    [state.totalParents, state.totalLinkedStudents]);

    const filteredParents = useMemo(() => {
        let list = state.filteredParents;
        if (filterStatus === 'active') list = list.filter(p => state.students.some(s => s.parentPhone === p.phone && (s.enrollments?.length || 0) > 0));
        else if (filterStatus === 'inactive') list = list.filter(p => !state.students.some(s => s.parentPhone === p.phone && (s.enrollments?.length || 0) > 0));
        else if (filterStatus === 'overdue') list = list.filter(p =>
            state.students.some(s => s.parentPhone === p.phone && (s.enrollments || []).some(en => (en.sessionsTotal - en.sessionsUsed) <= 2))
        );
        return list;
    }, [state.filteredParents, filterStatus, state.students]);

    const isEdit = !!state.editId;

    const kpiCards = useMemo(() => [
        { label: 'إجمالي أولياء الأمور', value: state.totalParents, icon: Users, gradient: 'from-primary/20 to-primary/5', iconBg: 'bg-primary/10 text-primary', accent: 'bg-primary' },
        { label: 'الأبناء المرتبطون', value: state.totalLinkedStudents, icon: GraduationCap, gradient: 'from-success/20 to-success/5', iconBg: 'bg-success/10 text-success', accent: 'bg-success' },
        { label: 'متوسط الأبناء', value: Math.round(avgChildren * 10) / 10, icon: Phone, gradient: 'from-info/20 to-info/5', iconBg: 'bg-info/10 text-info', accent: 'bg-info' },
        { label: 'جاهز للتصدير', value: filteredParents.length, icon: Download, gradient: 'from-warning/20 to-warning/5', iconBg: 'bg-warning/10 text-warning', accent: 'bg-warning' },
    ], [state.totalParents, state.totalLinkedStudents, avgChildren, filteredParents.length]);

    const fabActions = useMemo(() => [
        { icon: Plus, label: 'إضافة ولي أمر', onClick: () => { actions.setShowAddForm(!state.showAddForm); if (!state.showAddForm) { actions.setEditId(null); actions.setNewParent({ name: '', phone: '', email: '', username: '', password: '' }); } } },
        { icon: Download, label: 'تصدير Excel', onClick: () => downloadExport('parents', 'xlsx').then(() => showNotification('تم تصدير Excel', 'success')).catch(e => showNotification(e.message, 'error')) },
        { icon: Mail, label: 'تصدير PDF', onClick: () => downloadExport('parents', 'pdf').then(() => showNotification('تم تصدير PDF', 'success')).catch(e => showNotification(e.message, 'error')) },
    ], [state.showAddForm, showNotification, actions]);

    if (state.loading) {
        return (
            <div className="space-y-3 p-3 md:p-4 animate-pulse bg-background min-h-full">
                <div className="h-44 bg-card rounded-2xl" />
                <div className="h-64 bg-card rounded-2xl" />
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
            className="min-h-full pb-20 overflow-x-hidden relative font-sans bg-background" dir="rtl">
            <div className="relative z-10 max-w-page mx-auto px-2">
                <div className="relative overflow-hidden rounded-2xl">
                    {particles.map(p => (
                        <motion.div key={p.id} className="absolute rounded-full bg-white/10 pointer-events-none z-10"
                            style={{ width: p.size, height: p.size, left: `${p.x}%`, top: `${p.y}%` }}
                            animate={{ y: [0, -20, 0], opacity: [0.2, 0.5, 0.2] }} transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }} />
                    ))}
                    <ParentsHeader
                        totalParents={state.totalParents}
                        totalLinkedStudents={state.totalLinkedStudents}
                        avgChildren={Math.round(avgChildren * 10) / 10}
                        showAddForm={state.showAddForm}
                        searchTerm={state.searchTerm}
                        onSearchChange={actions.setSearchTerm}
                        filterStatus={filterStatus}
                        onFilterStatusChange={setFilterStatus}
                        onToggleAddForm={() => {
                            actions.setShowAddForm(!state.showAddForm);
                            if (!state.showAddForm) {
                                actions.setEditId(null);
                                actions.setNewParent({ name: '', phone: '', email: '', username: '', password: '' });
                            }
                        }}
                        onImport={actions.handleImportParents}
                        onExportExcel={() => downloadExport('parents', 'xlsx').then(() => showNotification('تم تصدير Excel', 'success')).catch(e => showNotification(e.message, 'error'))}
                        onExportPDF={() => downloadExport('parents', 'pdf').then(() => showNotification('تم تصدير PDF', 'success')).catch(e => showNotification(e.message, 'error'))}
                    />
                </div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                        {kpiCards.map((kpi, i) => {
                            const Icon = kpi.icon;
                            return (
                                <motion.div key={kpi.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 + i * 0.06 }}
                                    whileHover={{ scale: 1.02, y: -2 }} className={cn("relative overflow-hidden rounded-xl bg-gradient-to-br border border-border/50 p-4", kpi.gradient)}>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className={cn("p-2 rounded-lg", kpi.iconBg)}><Icon size={16} /></div>
                                        <div className={cn("h-1 w-12 rounded-full", kpi.accent)} />
                                    </div>
                                    <p className="text-xs text-muted mb-1">{kpi.label}</p>
                                    {typeof kpi.value === 'number' ? <AnimatedCounter value={kpi.value} /> : <span className="text-2xl font-bold">{kpi.value}</span>}
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>

                <div className="py-3 space-y-3">
                    <AnimatePresence>
                        {state.showAddForm && (
                            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
                                <ParentForm isEdit={isEdit} formData={state.newParent} onChange={actions.setNewParent} onSubmit={actions.handleAddParent} />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        {!state.showDetails ? (
                            <ParentsTable parents={filteredParents} students={state.students} selectedParentId={state.selectedParent?.id || null}
                                showDetails={state.showDetails} onSelectParent={(parent) => { actions.setSelectedParent(parent); actions.setShowDetails(true); }}
                                onEdit={actions.handleEditParent} onDelete={actions.handleDeleteParent}
                                onViewParent={(parent) => { actions.setSelectedParent(parent); actions.setShowDetails(true); }} />
                        ) : (
                            <ParentDrawer parent={state.selectedParent} details={state.selectedParentData} onClose={() => actions.setShowDetails(false)}
                                onEdit={actions.handleEditParent} onDelete={actions.handleDeleteParent}
                                onCall={(phone) => window.open(`tel:${phone}`)}
                                onWhatsApp={(phone) => window.open(`https://wa.me/${phone.replace(/[^0-9]/g, '')}`, '_blank')}
                                inline />
                        )}
                    </motion.div>
                </div>

                {/* Parent details now render inline above */}

                <AnimatePresence>
                    {state.confirmModal.show && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }}
                                className="bg-card border border-border shadow-elevation-2 w-full max-w-sm overflow-hidden rounded-2xl">
                                <div className="bg-gradient-to-r from-error to-error-hover h-1.5 w-full" />
                                <div className="p-8">
                                    <div className="w-16 h-16 bg-error-soft text-error border border-error flex items-center justify-center mb-6 mx-auto rounded-2xl">
                                        <AlertCircle size={32} />
                                    </div>
                                    <h3 className="font-medium text-lg text-main mb-3 text-center uppercase tracking-tighter">تأكيد عملية الحذف</h3>
                                    <p className="text-xs font-normal text-muted leading-relaxed mb-8 text-center">{state.confirmModal.message}</p>
                                    <div className="flex gap-2">
                                        <button onClick={() => { if (state.confirmModal.action) state.confirmModal.action(); actions.setConfirmModal({ ...state.confirmModal, show: false }); }}
                                            className={cn("flex-1 py-4 text-on-primary font-medium text-micro shadow-sm transition-all active:scale-95 uppercase tracking-label border rounded-xl", state.confirmModal.variant === 'primary' ? "bg-primary border-primary hover:bg-primary-hover shadow-lg" : "bg-error border-error hover:bg-error-hover shadow-lg")}>
                                            {state.confirmModal.confirmText || 'تأكيد الحذف'}
                                        </button>
                                        <button onClick={() => actions.setConfirmModal({ ...state.confirmModal, show: false, action: null })}
                                            className="flex-1 py-4 bg-surface text-muted font-medium text-micro hover:bg-surface transition-all rounded-xl">إلغاء</button>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="fixed bottom-6 end-6 z-50 flex flex-col items-end gap-3">
                <AnimatePresence>
                    {fabOpen && fabActions.map((action, i) => (
                        <motion.div key={action.label} initial={{ opacity: 0, scale: 0.3, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.3, y: 20 }} transition={{ delay: 0.05 * (fabActions.length - 1 - i) }} className="flex items-center gap-2">
                            <span className="bg-card border border-border text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm whitespace-nowrap">{action.label}</span>
                            <button onClick={() => { action.onClick(); setFabOpen(false); }}
                                className="w-10 h-10 rounded-full bg-primary text-on-primary shadow-lg hover:shadow-xl hover:bg-primary-hover transition-all flex items-center justify-center">
                                <action.icon size={18} />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
                <motion.button onClick={() => setFabOpen(!fabOpen)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    className={cn("w-12 h-12 rounded-full shadow-xl text-on-primary flex items-center justify-center transition-all", fabOpen ? "bg-error rotate-45" : "bg-primary")}>
                    <Plus size={24} />
                </motion.button>
            </div>
        </motion.div>
    );
};
