import { Search, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { Skeleton } from '../components/ui/Skeleton';
import { ParentsHeader } from '../features/parents/components/ParentsHeader';
import { ParentsTable } from '../features/parents/components/ParentsTable';
import { ParentDetails } from '../features/parents/components/ParentDetails';
import { ParentForm } from '../features/parents/components/ParentForm';
import { useParents } from '../features/parents/hooks/useParents';

export const Parents = () => {
    const { state, actions } = useParents();

    if (state.loading) {
        return (
            <div className="space-y-6 min-h-full md:animate-in md:fade-in">
                <Skeleton className="h-48 rounded-none" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Skeleton className="h-32 rounded-2xl" />
                    <Skeleton className="h-32 rounded-2xl" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Skeleton className="lg:col-span-2 h-96 rounded-none" />
                </div>
            </div>
        );
    }

    const isEdit = !!state.editId;

    return (
        <div className="space-y-6 pb-32 min-h-full md:animate-in md:fade-in md:duration-700">
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

            {state.showAddForm && (
                <ParentForm
                    isEdit={isEdit}
                    formData={state.newParent}
                    onChange={actions.setNewParent}
                    onSubmit={actions.handleAddParent}
                />
            )}

            <div className="bg-white p-3 md:p-5 shadow-sm border border-slate-100 dark:bg-gray-900 dark:border-gray-800 flex items-center gap-4 rounded-none">
                <div className="relative flex-1 group">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="البحث في سجلات أولياء الأمور (الاسم، الجوال، البريد)..."
                        value={state.searchTerm}
                        onChange={(e) => actions.setSearchTerm(e.target.value)}
                        className="w-full pl-6 pr-12 py-3.5 border border-slate-200 focus:outline-none focus:border-primary-500 text-sm font-bold rounded-none bg-slate-50 focus:bg-white transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    />
                </div>
            </div>

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

            {state.confirmModal.show && (
                <div className="fixed bottom-6 right-6 z-[100] animate-in slide-in-from-bottom-5 fade-in">
                    <div className="bg-white dark:bg-gray-800 rounded-none shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden min-w-[380px] max-w-md">
                        <div className="p-5">
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-amber-100 rounded-none dark:bg-amber-900/30">
                                    <AlertCircle className="text-amber-600 dark:text-amber-400" size={24} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-gray-900 dark:text-white mb-1 text-base">تأكيد الإجراء</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{state.confirmModal.message}</p>
                                </div>
                            </div>
                            <div className="flex gap-2 mt-4">
                                <button
                                    onClick={() => {
                                        if (state.confirmModal.action) state.confirmModal.action();
                                        actions.setConfirmModal({ ...state.confirmModal, show: false });
                                    }}
                                    className={cn(
                                        "flex-1 px-4 py-2.5 text-white font-bold text-sm rounded-none transition-colors shadow-sm",
                                        state.confirmModal.variant === 'primary'
                                            ? "bg-primary-600 hover:bg-primary-700"
                                            : "bg-red-600 hover:bg-red-700"
                                    )}
                                >
                                    {state.confirmModal.confirmText || 'تأكيد'}
                                </button>
                                <button
                                    onClick={() => actions.setConfirmModal({ ...state.confirmModal, show: false, action: null })}
                                    className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-bold text-sm rounded-none hover:bg-gray-200 transition-colors dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
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
