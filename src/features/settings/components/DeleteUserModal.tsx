import { Trash2 } from 'lucide-react';
import { SecondaryBtn } from './SettingsUI';

interface DeleteUserModalProps {
    showDeleteModal: any;
    setShowDeleteModal: (v: any) => void;
    deleteUser: (id: string) => void;
    showNotify: (msg: string) => void;
}

export const DeleteUserModal = ({ showDeleteModal, setShowDeleteModal, deleteUser, showNotify }: DeleteUserModalProps) => {
    if (!showDeleteModal) return null;

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 backdrop-blur-sm bg-black/40 animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-rose-50 dark:bg-rose-900/20 rounded-xl flex items-center justify-center">
                        <Trash2 size={18} className="text-rose-500" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-800 dark:text-white">تأكيد حذف المستخدم</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">هذا الإجراء نهائي</p>
                    </div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                    هل أنت متأكد من حذف "<span className="font-bold text-slate-700 dark:text-slate-200">{showDeleteModal.username}</span>"؟
                </p>
                <div className="flex gap-2">
                    <SecondaryBtn onClick={() => setShowDeleteModal(null)} className="flex-1">إلغاء</SecondaryBtn>
                    <button
                        onClick={() => { deleteUser(showDeleteModal.id); setShowDeleteModal(null); showNotify('تم حذف المستخدم'); }}
                        className="flex-1 py-2 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-xl transition-all"
                    >
                        تأكيد الحذف
                    </button>
                </div>
            </div>
        </div>
    );
};
