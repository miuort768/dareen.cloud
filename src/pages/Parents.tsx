import { useEffect, useState, useMemo } from 'react';
import { Plus, Download, FileText, FileUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { downloadExport } from '../lib/download';
import { useShowNotification, useAcademyName } from '../context/AppContext';
import type { Parent, Student } from '../types';

import { ParentsHeader } from '../features/parents/components/ParentsHeader';
import { ParentsTable } from '../features/parents/components/ParentsTable';
import { ParentDrawer } from '../features/parents/components/ParentDrawer';
import { ParentForm } from '../features/parents/components/ParentForm';
import { useParents } from '../features/parents/hooks/useParents';
import { ConfirmModal } from '../shared/components/ConfirmModal';
import { canonicalPhone } from '../lib/phone';

const samePhone = (a?: string | null, b?: string | null) => {
    const ca = canonicalPhone(a);
    const cb = canonicalPhone(b);
    return ca.length > 0 && ca === cb;
};

const parentHasStudents = (parent: Parent, students: Student[]) =>
    students.filter(s => samePhone(parent.phone, s.parentPhone) || (parent.id && s.parent?.id === parent.id));

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
        if (filterStatus === 'active') list = list.filter(p => parentHasStudents(p, state.students).some(s => (s.enrollments?.length || 0) > 0));
        else if (filterStatus === 'inactive') list = list.filter(p => !parentHasStudents(p, state.students).some(s => (s.enrollments?.length || 0) > 0));
        else if (filterStatus === 'overdue') list = list.filter(p =>
            parentHasStudents(p, state.students).some(s => (s.enrollments || []).some(en => (en.sessionsTotal - en.sessionsUsed) <= 2))
        );
        return list;
    }, [state.filteredParents, filterStatus, state.students]);

    const isEdit = !!state.editId;

    const openEditParent = (parent: Parent) => {
        actions.handleEditParent(parent);
        actions.setShowDetails(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const openAddParent = () => {
        actions.setShowAddForm(true);
        actions.setEditId(null);
        actions.setNewParent({ name: '', phone: '', phone2: '', username: '', password: '' });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const fabActions = useMemo(() => [
        { icon: Plus, label: 'إضافة ولي أمر', onClick: () => { if (!state.showAddForm) openAddParent(); } },
        { icon: FileUp, label: 'استيراد من الطلاب', onClick: actions.handleImportParents },
        { icon: Download, label: 'تصدير Excel', onClick: () => downloadExport('parents', 'xlsx').then(() => showNotification('تم تصدير Excel', 'success')).catch(e => showNotification(e.message, 'error')) },
        { icon: FileText, label: 'تصدير PDF', onClick: () => downloadExport('parents', 'pdf').then(() => showNotification('تم تصدير PDF', 'success')).catch(e => showNotification(e.message, 'error')) },
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
                            if (state.showAddForm) {
                                actions.setShowAddForm(false);
                                actions.setEditId(null);
                            } else {
                                openAddParent();
                            }
                        }}
                        onImport={actions.handleImportParents}
                        onExportExcel={() => downloadExport('parents', 'xlsx').then(() => showNotification('تم تصدير Excel', 'success')).catch(e => showNotification(e.message, 'error'))}
                        onExportPDF={() => downloadExport('parents', 'pdf').then(() => showNotification('تم تصدير PDF', 'success')).catch(e => showNotification(e.message, 'error'))}
                    />
                </div>

                <div className="py-3 space-y-3">
                    <AnimatePresence>
                        {state.showAddForm && (
                            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
                                <ParentForm isEdit={isEdit} formData={state.newParent} onChange={actions.setNewParent} onSubmit={actions.handleAddParent}
                                    onClose={() => { actions.setShowAddForm(false); actions.setEditId(null); }} />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        {!state.showDetails ? (
                            <ParentsTable parents={filteredParents} students={state.students} selectedParentId={state.selectedParent?.id || null}
                                showDetails={state.showDetails} onSelectParent={(parent) => { actions.setSelectedParent(parent); actions.setShowDetails(true); }}
                                onEdit={openEditParent} onDelete={actions.handleDeleteParent}
                                onViewParent={(parent) => { actions.setSelectedParent(parent); actions.setShowDetails(true); }} />
                        ) : (
                            <ParentDrawer parent={state.selectedParent} details={state.selectedParentData} onClose={() => actions.setShowDetails(false)}
                                onEdit={openEditParent} onDelete={actions.handleDeleteParent}
                                onCall={(phone) => window.open(`tel:${phone}`)}
                                onWhatsApp={(phone) => window.open(`https://wa.me/${phone.replace(/[^0-9]/g, '')}`, '_blank')}
                                inline />
                        )}
                    </motion.div>
                </div>

                {/* Parent details now render inline above */}
            </div>

            <ConfirmModal
                isOpen={state.confirmModal.show}
                title={state.confirmModal.title || (state.confirmModal.variant === 'danger' ? 'تأكيد عملية الحذف' : 'إشعار')}
                message={state.confirmModal.message}
                confirmText={state.confirmModal.confirmText}
                cancelText="إلغاء"
                isDestructive={state.confirmModal.variant !== 'primary'}
                requirePassword={state.confirmModal.variant === 'danger'}
                expectedPassword="dareen"
                onConfirm={() => { if (state.confirmModal.action) state.confirmModal.action(); }}
                onClose={() => actions.setConfirmModal({ ...state.confirmModal, show: false, action: null })}
            />

            <div className="fixed bottom-6 end-6 z-50 flex flex-col items-end gap-3">
                <AnimatePresence>
                    {fabOpen && fabActions.map((action, i) => (
                        <motion.div key={action.label} initial={{ opacity: 0, scale: 0.3, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.3, y: 20 }} transition={{ delay: 0.05 * (fabActions.length - 1 - i) }} className="flex items-center gap-2">
                            <span className="bg-card border border-border text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm whitespace-nowrap">{action.label}</span>
                            <button onClick={() => { action.onClick(); setFabOpen(false); }}
                                className="w-10 h-10 rounded-lg bg-primary text-on-primary shadow-lg hover:shadow-xl hover:bg-primary-hover transition-all flex items-center justify-center">
                                <action.icon size={18} />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
                <motion.button onClick={() => setFabOpen(!fabOpen)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    className={cn("w-12 h-12 rounded-xl shadow-xl text-on-primary flex items-center justify-center transition-all", fabOpen ? "bg-error rotate-45" : "bg-primary")}>
                    <Plus size={24} />
                </motion.button>
            </div>
        </motion.div>
    );
};
