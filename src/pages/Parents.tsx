import { Search, AlertCircle, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { downloadExport } from '../lib/download';
import { useShowNotification } from '../context/AppContext';

import { ParentsHeader } from '../features/parents/components/ParentsHeader';
import { ParentsTable } from '../features/parents/components/ParentsTable';
import { ParentDetails } from '../features/parents/components/ParentDetails';
import { ParentForm } from '../features/parents/components/ParentForm';
import { useParents } from '../features/parents/hooks/useParents';

export const Parents = () => {
    const { state, actions } = useParents();
    const showNotification = useShowNotification();

    if (state.loading) {
        return (
            <div className="space-y-4 p-4 md:p-8 animate-pulse bg-background dark:bg-background min-h-full">
                <div className="h-24 bg-card rounded-card shadow-soft" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-28 bg-card rounded-card shadow-soft" />
                    ))}
                </div>
                <div className="h-96 bg-card rounded-card shadow-soft" />
            </div>
        );
    }

    const isEdit = !!state.editId;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="min-h-full pb-24 overflow-x-hidden relative font-sans bg-background dark:bg-background"
            dir="rtl"
        >
            <div className="relative z-10 max-w-page mx-auto px-2">

                <ParentsHeader
                    totalParents={state.totalParents}
                    totalLinkedStudents={state.totalLinkedStudents}
                    showAddForm={state.showAddForm}
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

                <div className="py-6 space-y-6">

                    <AnimatePresence>
                        {state.showAddForm && (
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.4 }}
                            >
                                <ParentForm
                                    isEdit={isEdit}
                                    formData={state.newParent}
                                    onChange={actions.setNewParent}
                                    onSubmit={actions.handleAddParent}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div>
                        {!state.showDetails ? (
                            <div className="space-y-6">
                                <div className="p-3 bg-white/80 backdrop-blur-xl shadow-sm border border-white/20 flex flex-col md:flex-row items-stretch md:items-center gap-4 rounded-2xl">
                                    <div className="flex-1 relative group">
                                        <div className="absolute start-0 top-0 bottom-0 w-12 flex items-center justify-center text-primary opacity-50 z-10">
                                            <Search size={15} />
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="ابحث باسم ولي الأمر..."
                                            value={state.searchTerm}
                                            onChange={(e) => actions.setSearchTerm(e.target.value)}
                                            className="w-full ps-14 pe-4 py-3 bg-primary-soft text-main dark:text-on-primary placeholder:text-muted text-xs font-bold outline-none transition-all rounded-xl border border-border focus:border-primary focus:bg-white dark:focus:bg-primary-active"
                                        />
                                    </div>
                                    <div className="hidden lg:flex items-center gap-3 px-5 border-s border-border">
                                        <div className="w-8 h-8 flex items-center justify-center bg-primary-soft rounded-xl">
                                            <Users size={14} className="text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-micro font-bold text-dim">إجمالي أولياء الأمور</p>
                                            <p className="text-micro font-bold text-primary">{state.filteredParents.length} / {state.totalParents}</p>
                                        </div>
                                    </div>
                                </div>

                                <ParentsTable
                                    parents={state.filteredParents}
                                    students={state.students}
                                    selectedParentId={state.selectedParent?.id || null}
                                    showDetails={false}
                                    onSelectParent={(parent) => {
                                        actions.setSelectedParent(parent);
                                        actions.setShowDetails(true);
                                    }}
                                    onEdit={actions.handleEditParent}
                                    onDelete={actions.handleDeleteParent}
                                    onViewParent={(parent) => {
                                        actions.setSelectedParent(parent);
                                        actions.setShowDetails(true);
                                    }}
                                />
                            </div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.4 }}
                            >
                                {state.selectedParent && state.selectedParentData && (
                                    <ParentDetails
                                        parent={state.selectedParent}
                                        details={state.selectedParentData}
                                        onClose={() => actions.setShowDetails(false)}
                                    />
                                )}
                            </motion.div>
                        )}
                    </div>
                </div>

                <AnimatePresence>
                    {state.confirmModal.show && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                                className="bg-card border border-border/50 shadow-xl w-full max-w-sm overflow-hidden rounded-card"
                            >
                                <div className="bg-gradient-to-r from-error to-error-hover h-1.5 w-full" />
                                <div className="p-8">
                                    <div className="w-16 h-16 bg-error-soft text-error border border-error flex items-center justify-center mb-6 mx-auto rounded-2xl">
                                        <AlertCircle size={32} />
                                    </div>
                                    <h3 className="font-medium text-lg text-main dark:text-inverse mb-3 text-center uppercase tracking-tighter">تأكيد عملية الحذف</h3>
                                    <p className="text-xs font-normal text-dim leading-relaxed mb-8 text-center uppercase tracking-widest">{state.confirmModal.message}</p>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                if (state.confirmModal.action) state.confirmModal.action();
                                                actions.setConfirmModal({ ...state.confirmModal, show: false });
                                            }}
                                            className={cn(
                                                "flex-1 py-4 text-on-primary font-medium text-micro shadow-sm transition-all active:scale-95 uppercase tracking-[0.2em] border rounded-xl",
                                                state.confirmModal.variant === 'primary'
                                                    ? "bg-primary border-primary hover:bg-primary-hover shadow-lg"
                                                    : "bg-error border-error hover:bg-error-hover shadow-lg"
                                            )}
                                        >
                                            {state.confirmModal.confirmText || 'تأكيد الحذف'}
                                        </button>
                                        <button
                                            onClick={() => actions.setConfirmModal({ ...state.confirmModal, show: false, action: null })}
                                            className="flex-1 py-4 bg-surface dark:bg-primary-active text-muted font-medium text-micro hover:bg-surface transition-all uppercase tracking-[0.2em] rounded-xl"
                                        >
                                            إلغاء
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};
