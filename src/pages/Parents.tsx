import { Search, AlertCircle, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

import { ParentsHeader } from '../features/parents/components/ParentsHeader';
import { ParentsTable } from '../features/parents/components/ParentsTable';
import { ParentDetails } from '../features/parents/components/ParentDetails';
import { ParentForm } from '../features/parents/components/ParentForm';
import { useParents } from '../features/parents/hooks/useParents';

export const Parents = () => {
    const { state, actions } = useParents();

    if (state.loading) {
        return (
            <div className="space-y-4 p-4 md:p-8 animate-pulse bg-[#F8F7FF] dark:bg-slate-950 min-h-full">
                <div className="h-24 bg-white dark:bg-slate-900 rounded-2xl shadow-sm" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-28 bg-white dark:bg-slate-900 rounded-2xl shadow-sm" />
                    ))}
                </div>
                <div className="h-96 bg-white dark:bg-slate-900 rounded-2xl shadow-sm" />
            </div>
        );
    }

    const isEdit = !!state.editId;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="min-h-full pb-24 overflow-x-hidden relative font-sans bg-[#F8F7FF] dark:bg-slate-950"
            dir="rtl"
        >
            <div className="relative z-10 max-w-[1600px] mx-auto px-2">

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
                    onExport={actions.handleExportParents}
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
                                        <div className="absolute right-0 top-0 bottom-0 w-12 flex items-center justify-center text-[#6C4BFF]/50 z-10">
                                            <Search size={15} />
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="ابحث باسم ولي الأمر..."
                                            value={state.searchTerm}
                                            onChange={(e) => actions.setSearchTerm(e.target.value)}
                                            className="w-full pr-14 pl-4 py-3 bg-[#6C4BFF]/5 text-slate-800 dark:text-white placeholder:text-slate-400 text-[11px] font-bold outline-none transition-all rounded-xl border border-[#6C4BFF]/10 focus:border-[#6C4BFF]/30 focus:bg-white dark:focus:bg-slate-900"
                                        />
                                    </div>
                                    <div className="hidden lg:flex items-center gap-3 px-5 border-r border-[#6C4BFF]/10">
                                        <div className="w-8 h-8 flex items-center justify-center bg-[#6C4BFF]/10 rounded-xl">
                                            <Users size={14} className="text-[#6C4BFF]" />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-bold text-[#6C4BFF]/60">إجمالي أولياء الأمور</p>
                                            <p className="text-[10px] font-bold text-[#6C4BFF]">{state.filteredParents.length} / {state.totalParents}</p>
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
                                className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl w-full max-w-sm overflow-hidden rounded-2xl"
                            >
                                <div className="bg-gradient-to-r from-rose-500 to-rose-600 h-1.5 w-full" />
                                <div className="p-8">
                                    <div className="w-16 h-16 bg-rose-50 dark:bg-rose-900/20 text-rose-500 border border-rose-100 dark:border-rose-800 flex items-center justify-center mb-6 mx-auto rounded-2xl">
                                        <AlertCircle size={32} />
                                    </div>
                                    <h3 className="font-medium text-lg text-slate-800 dark:text-white mb-3 text-center uppercase tracking-tighter">تأكيد عملية الحذف</h3>
                                    <p className="text-[11px] font-normal text-slate-500 leading-relaxed mb-8 text-center uppercase tracking-widest">{state.confirmModal.message}</p>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                if (state.confirmModal.action) state.confirmModal.action();
                                                actions.setConfirmModal({ ...state.confirmModal, show: false });
                                            }}
                                            className={cn(
                                                "flex-1 py-4 text-white font-medium text-[10px] shadow-sm transition-all active:scale-95 uppercase tracking-[0.2em] border rounded-xl",
                                                state.confirmModal.variant === 'primary'
                                                    ? "bg-[#6C4BFF] border-[#6C4BFF]/40 hover:bg-[#5A3FE0] shadow-[#6C4BFF]/20"
                                                    : "bg-rose-600 border-rose-400 hover:bg-rose-700 shadow-rose-600/20"
                                            )}
                                        >
                                            {state.confirmModal.confirmText || 'تأكيد الحذف'}
                                        </button>
                                        <button
                                            onClick={() => actions.setConfirmModal({ ...state.confirmModal, show: false, action: null })}
                                            className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-500 font-medium text-[10px] hover:bg-slate-200 transition-all uppercase tracking-[0.2em] rounded-xl"
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
