import { Search, AlertCircle } from 'lucide-react';
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
            <div className="space-y-6 p-4">
                <div className="h-20 bg-white dark:bg-slate-900 rounded-2xl animate-pulse" />
                <div className="grid grid-cols-2 gap-4">
                    <div className="h-24 bg-white dark:bg-slate-900 rounded-2xl animate-pulse" />
                    <div className="h-24 bg-white dark:bg-slate-900 rounded-2xl animate-pulse" />
                </div>
                <div className="h-96 bg-white dark:bg-slate-900 rounded-2xl animate-pulse" />
            </div>
        );
    }

    const isEdit = !!state.editId;

    return (
        <div className="min-h-full bg-[#f1f5f9] dark:bg-[#020617] pb-20 font-sans" dir="rtl">
            {/* Header */}
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
                {state.showAddForm && (
                    <ParentForm
                        isEdit={isEdit}
                        formData={state.newParent}
                        onChange={actions.setNewParent}
                        onSubmit={actions.handleAddParent}
                    />
                )}

                {/* Search Bar */}
                <div className="px-4 md:px-6">
                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-3 rounded-2xl shadow-sm flex items-center gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                            <input
                                type="text"
                                placeholder="البحث في سجلات أولياء الأمور (الاسم، الجوال، البريد)..."
                                value={state.searchTerm}
                                onChange={(e) => actions.setSearchTerm(e.target.value)}
                                className="w-full pl-6 pr-11 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl outline-none text-xs font-bold focus:border-[#5c59f2]"
                            />
                        </div>
                    </div>
                </div>

                {/* Content Grid */}
                <div className="px-4 md:px-6">
                    <div className={`grid gap-6 ${state.showDetails ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1'}`}>
                        <ParentsTable
                            parents={state.filteredParents}
                            students={state.students}
                            selectedParentId={state.selectedParent?.id || null}
                            showDetails={state.showDetails}
                            onSelectParent={(parent) => {
                                actions.setSelectedParent(parent);
                                actions.setShowDetails(true);
                            }}
                            onEdit={actions.handleEditParent}
                            onDelete={actions.handleDeleteParent}
                        />

                        {state.showDetails && state.selectedParent && state.selectedParentData && (
                            <ParentDetails
                                parent={state.selectedParent}
                                details={state.selectedParentData}
                                onClose={() => actions.setShowDetails(false)}
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* Confirm Modal */}
            {state.confirmModal.show && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6">
                            <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 text-amber-500 rounded-2xl flex items-center justify-center mb-4">
                                <AlertCircle size={24} />
                            </div>
                            <h3 className="font-bold text-slate-800 dark:text-white mb-2">تأكيد الإجراء</h3>
                            <p className="text-xs text-slate-500 leading-relaxed mb-6">{state.confirmModal.message}</p>
                            
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        if (state.confirmModal.action) state.confirmModal.action();
                                        actions.setConfirmModal({ ...state.confirmModal, show: false });
                                    }}
                                    className={cn(
                                        "flex-1 py-2.5 text-white font-bold text-[11px] rounded-xl shadow-sm transition-all active:scale-95",
                                        state.confirmModal.variant === 'primary' ? "bg-[#5c59f2]" : "bg-rose-500"
                                    )}
                                >
                                    {state.confirmModal.confirmText || 'تأكيد'}
                                </button>
                                <button
                                    onClick={() => actions.setConfirmModal({ ...state.confirmModal, show: false, action: null })}
                                    className="flex-1 py-2.5 bg-slate-50 text-slate-500 font-bold text-[11px] rounded-xl hover:bg-slate-100 transition-all"
                                >
                                    إلغاء
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
