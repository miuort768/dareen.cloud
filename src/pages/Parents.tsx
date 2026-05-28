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
        <div className="min-h-full pb-24 overflow-x-hidden relative font-sans" dir="rtl">
    <div className="relative z-10 max-w-[1600px] mx-auto px-2">
            
            {/* ?? Header ?? */}
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
                
                {/* ?? Form Section ?? */}
                {state.showAddForm && (
                    <div className="px-0 animate-in slide-in-from-top-4 duration-500">
                        <ParentForm
                            isEdit={isEdit}
                            formData={state.newParent}
                            onChange={actions.setNewParent}
                            onSubmit={actions.handleAddParent}
                        />
                    </div>
                )}

                {/* ?? Main Content Area ?? */}
                <div className="px-0">
                    {!state.showDetails ? (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            {/* Toolbar - Only visible when not in details mode */}
                            <div className="p-3 shadow-sm flex flex-col md:flex-row items-stretch md:items-center gap-4 rounded-none" style={{ backgroundColor: '#2563EB' }}>
                                <div className="flex-1 relative group">
                                    <div className="absolute right-0 top-0 bottom-0 w-12 flex items-center justify-center text-white/50 z-10">
                                        <Search size={15} />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="ابحث باسم ولي الأمر..."
                                        value={state.searchTerm}
                                        onChange={(e) => actions.setSearchTerm(e.target.value)}
                                        className="w-full pr-14 pl-4 py-3 text-white placeholder:text-white/50 text-[11px] font-bold outline-none transition-all rounded-none" style={{ backgroundColor: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)' }}
                                    />
                                </div>
                                <div className="hidden lg:flex items-center gap-3 px-5 border-r border-white/20">
                                    <div className="w-8 h-8 flex items-center justify-center shadow-sm rounded-none" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
                                        <Users size={14} style={{ color: '#fff' }} />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-bold text-white/70">إجمالي أولياء الأمور</p>
                                        <p className="text-[10px] font-bold text-white">{state.filteredParents.length} / {state.totalParents}</p>
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
                        <div className="w-full animate-in slide-in-from-left-8 duration-500">
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

            {/* ?? Confirm Modal ?? */}
            {state.confirmModal.show && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60  p-4 animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 rounded-none">
                        <div className="p-8">
                            <div className="w-16 h-16 bg-rose-50 dark:bg-rose-900/20 text-rose-500 border border-rose-100 dark:border-rose-800 flex items-center justify-center mb-6 mx-auto rounded-none">
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
                                        "flex-1 py-4 text-white font-medium text-[10px] shadow-sm transition-all active:scale-95 uppercase tracking-[0.2em] border rounded-none",
                                        state.confirmModal.variant === 'primary' 
                                            ? "bg-blue-600 border-blue-400 hover:bg-blue-700 shadow-blue-600/20" 
                                            : "bg-rose-600 border-rose-400 hover:bg-rose-700 shadow-rose-600/20"
                                    )}
                                >
                                    {state.confirmModal.confirmText || 'تأكيد الحذف'}
                                </button>
                                <button
                                    onClick={() => actions.setConfirmModal({ ...state.confirmModal, show: false, action: null })}
                                    className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-500 font-medium text-[10px] hover:bg-slate-200 transition-all uppercase tracking-[0.2em] rounded-none"
                                >
                                    إلغاء
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
        </div>
    );
};
