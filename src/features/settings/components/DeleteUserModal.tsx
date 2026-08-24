import { Trash2 } from 'lucide-react'
import { SecondaryBtn } from './SettingsUI'

interface DeleteUserModalProps {
  showDeleteModal: boolean | { id: string; username: string }
  setShowDeleteModal: (v: boolean | { id: string; username: string }) => void
  deleteUser: (id: string) => void
  showNotify: (msg: string) => void
}

export const DeleteUserModal = ({
  showDeleteModal,
  setShowDeleteModal,
  deleteUser,
  showNotify,
}: DeleteUserModalProps) => {
  if (!showDeleteModal || typeof showDeleteModal === 'boolean') return null

  const target = showDeleteModal

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 p-4 animate-in fade-in">
      <div className="w-full max-w-sm border border-border bg-card p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center bg-error-soft">
            <Trash2 size={18} className="text-error" />
          </div>
          <div>
            <p className="text-sm font-normal text-main">تأكيد حذف المستخدم</p>
            <p className="mt-0.5 text-micro text-muted">هذا الإجراء نهائي</p>
          </div>
        </div>
        <p className="mb-4 text-xs text-muted">
          هل أنت متأكد من حذف "<span className="font-normal text-main">{target.username}</span>"؟
        </p>
        <div className="flex gap-2">
          <SecondaryBtn onClick={() => setShowDeleteModal(false)} className="flex-1">
            إلغاء
          </SecondaryBtn>
          <button
            onClick={() => {
              deleteUser(target.id)
              setShowDeleteModal(false)
              showNotify('تم حذف المستخدم')
            }}
            className="flex-1 bg-error py-2 text-xs font-normal text-on-error transition-all hover:bg-error-hover"
          >
            تأكيد الحذف
          </button>
        </div>
      </div>
    </div>
  )
}
