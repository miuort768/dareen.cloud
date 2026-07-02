import { Trash2 } from 'lucide-react';
import { SecondaryBtn } from './SettingsUI';

interface DeleteUserModalProps {
    showDeleteModal: boolean | { id: string; username: string };
    setShowDeleteModal: (v: boolean | { id: string; username: string }) => void;
    deleteUser: (id: string) => void;
    showNotify: (msg: string) => void;
}

export const DeleteUserModal = ({ showDeleteModal, setShowDeleteModal, deleteUser, showNotify }: DeleteUserModalProps) => {
    if (!showDeleteModal) return null;

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4  bg-black/40 animate-in fade-in">
            <div className="bg-card p-6 max-w-sm w-full shadow-sm border border-border">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-error-soft flex items-center justify-center">
                        <Trash2 size={18} className="text-error" />
                    </div>
                    <div>
                        <p className="text-sm font-normal text-main">تأكيد حذف المستخدم</p>
                        <p className="text-[10px] text-dim mt-0.5">هذا الإجراء نهائي</p>
                    </div>
                </div>
                <p className="text-xs text-muted mb-4">
                    هل أنت متأكد من حذف "<span className="font-normal text-main">{showDeleteModal.username}</span>"؟
                </p>
                <div className="flex gap-2">
                    <SecondaryBtn onClick={() => setShowDeleteModal(null)} className="flex-1">إلغاء</SecondaryBtn>
                    <button
                        onClick={() => { deleteUser(showDeleteModal.id); setShowDeleteModal(null); showNotify('تم حذف المستخدم'); }}
                        className="flex-1 py-2 bg-error hover:bg-error-hover text-on-error text-xs font-normal transition-all"
                    >
                        تأكيد الحذف
                    </button>
                </div>
            </div>
        </div>
    );
};