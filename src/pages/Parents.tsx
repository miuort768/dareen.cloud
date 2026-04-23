import { Search, AlertCircle, Users } from 'lucide-react';
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
            <div className="space-y-4 p-4 md:p-8 animate-pulse">
                <div className="h-24 bg-white dark:bg-slate-900 rounded-none shadow-sm" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-28 bg-white dark:bg-slate-900 rounded-none shadow-sm" />
                    ))}
                </div>
                <div className="h-96 bg-white dark:bg-slate-900 rounded-none shadow-sm" />
            </div>
        );
    }

    const isEdit = !!state.editId;

    return (
        <div className="min-h-full bg-[#f8fafc] dark:bg-[#020617] pb-20 font-sans" dir="rtl">
            
            {/* ── Header ── */}
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
                
                {/* ── Form Section ── */}
                {state.showAddForm && (
                    <div className="px-4 md:px-8 animate-in slide-in-from-top-4 duration-500">
                        <ParentForm
                            isEdit={isEdit}
                            formData={state.newParent}
                            onChange={actions.setNewParent}
                            onSubmit={actions.handleAddParent}
                        />
                    </div>
                )}

                {/* ── Main Content Area ── */}
                <div className="px-4 md:px-8">
                    {!state.showDetails ? (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            {/* Toolbar - Only visible when not in details mode */}
                            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-none shadow-sm flex flex-col md:flex-row items-stretch md:items-center gap-4 overflow-hidden">
                                <div className="flex-1 relative group">
                                    <div className="absolute right-0 top-0 bottom-0 w-12 flex items-center justify-center bg-slate-950 text-white z-10">
                                        <Search size={16} />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="البحث في سجلات أولياء الأمور (الاسم، الجوال، البريد)..."
                                        value={state.searchTerm}
                                        onChange={(e) => actions.setSearchTerm(e.target.value)}
                                        className="w-full pl-6 pr-16 py-4 bg-transparent outline-none text-xs font-black uppercase tracking-tight placeholder:text-slate-400 dark:text-white"
                                    />
                                </div>
                                <div className="hidden lg:flex items-center gap-6 px-8 border-r border-slate-50 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 flex items-center justify-center bg-indigo-600 rounded-none shadow-lg shadow-indigo-600/20">
                                            <Users size={14} className="text-white" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-widest leading-none">إجمالي السجلات</p>
                                            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">{state.filteredParents.length} من {state.totalParents}</p>
                                        </div>
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
                            />
                        </div>
                    ) : (
                        <div className="max-w-4xl mx-auto animate-in slide-in-from-left-8 duration-500">
                            {state.selectedParent && state.selectedParentData && (
                                <ParentDetails
                                    parent={state.selectedParent}
                                    details={state.selectedParentData}
                                    onClose={() => actions.setShowDetails(false)}
                                />
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Confirm Modal ── */}
            {state.confirmModal.show && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-none shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-8">
                            <div className="w-16 h-16 bg-rose-50 dark:bg-rose-900/20 text-rose-500 rounded-none border border-rose-100 dark:border-rose-800 flex items-center justify-center mb-6 mx-auto">
                                <AlertCircle size={32} />
                            </div>
                            <h3 className="font-black text-lg text-slate-800 dark:text-white mb-3 text-center uppercase tracking-tighter">تأكيد الإجراء المالي</h3>
                            <p className="text-[11px] font-bold text-slate-500 leading-relaxed mb-8 text-center uppercase tracking-widest">{state.confirmModal.message}</p>
                            
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        if (state.confirmModal.action) state.confirmModal.action();
                                        actions.setConfirmModal({ ...state.confirmModal, show: false });
                                    }}
                                    className={cn(
                                        "flex-1 py-4 text-white font-black text-[10px] rounded-none shadow-lg transition-all active:scale-95 uppercase tracking-[0.2em] border",
                                        state.confirmModal.variant === 'primary' 
                                            ? "bg-indigo-600 border-indigo-400 hover:bg-indigo-700 shadow-indigo-600/20" 
                                            : "bg-rose-600 border-rose-400 hover:bg-rose-700 shadow-rose-600/20"
                                    )}
                                >
                                    {state.confirmModal.confirmText || 'تأكيد العملية'}
                                </button>
                                <button
                                    onClick={() => actions.setConfirmModal({ ...state.confirmModal, show: false, action: null })}
                                    className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-500 font-black text-[10px] rounded-none hover:bg-slate-200 transition-all uppercase tracking-[0.2em]"
                                >
                                    تراجع
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
