import React from 'react'
import { X, Users as UsersIcon, ChevronLeft, Search, Check } from 'lucide-react'
import { cn } from '../../../lib/utils'
import { useChatUIStore } from '../../../store/chatUIStore'
import type { ChatUser } from '../../../types/chat.types'

export interface ProfileFormData {
  name: string
  username: string
  password?: string
}

interface ChatModalsProps {
  availableUsers: ChatUser[]
  handleCreateConversation: () => void
  handleCreateDirectChat: (userId: string) => void
  handleDeleteAction: () => void
  isSubmitting?: boolean
}

export const ChatModals: React.FC<ChatModalsProps> = ({
  availableUsers,
  handleCreateConversation,
  handleCreateDirectChat,
  handleDeleteAction,
  isSubmitting = false,
}) => {
  const showNewChatModal = useChatUIStore((s) => s.showNewChatModal)
  const setShowNewChatModal = useChatUIStore((s) => s.setShowNewChatModal)
  const isEditingGroup = useChatUIStore((s) => s.isEditingGroup)
  const isCreatingGroup = useChatUIStore((s) => s.isCreatingGroup)
  const setIsCreatingGroup = useChatUIStore((s) => s.setIsCreatingGroup)
  const groupName = useChatUIStore((s) => s.groupName)
  const setGroupName = useChatUIStore((s) => s.setGroupName)
  const searchUser = useChatUIStore((s) => s.searchUser)
  const setSearchUser = useChatUIStore((s) => s.setSearchUser)
  const selectedUsers = useChatUIStore((s) => s.selectedUsers)
  const setSelectedUsers = useChatUIStore((s) => s.setSelectedUsers)
  const showDeleteConfirm = useChatUIStore((s) => s.showDeleteConfirm)
  const setShowDeleteConfirm = useChatUIStore((s) => s.setShowDeleteConfirm)
  const deleteType = useChatUIStore((s) => s.deleteType)
  const itemToDelete = useChatUIStore((s) => s.itemToDelete)
  const setItemToDelete = useChatUIStore((s) => s.setItemToDelete)

  const [step, setStep] = React.useState<'select' | 'info'>('select')

  const selectedUsersObjects = availableUsers.filter((u) => selectedUsers.includes(u.id))

  const handleNextStep = () => {
    if (selectedUsers.length > 0) setStep('info')
  }

  const handleBackStep = () => {
    setStep('select')
  }

  const handleClose = () => {
    setShowNewChatModal(false)
    setStep('select')
    setIsCreatingGroup(false)
    setSelectedUsers([])
    setGroupName('')
  }

  return (
    <>
      {/* New Chat / Group Flow Modal */}
      {showNewChatModal && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-0 backdrop-blur-sm duration-300 animate-in fade-in md:p-4"
          role="dialog"
          aria-modal="true"
          onKeyDown={(e) => {
            if (e.key === 'Escape') handleClose()
          }}
        >
          <div className="flex h-full w-full max-w-lg flex-col overflow-hidden bg-card shadow-sm duration-300 animate-in zoom-in-95 md:h-[650px] md:max-h-[90vh] md:rounded-lg">
            {/* Header - WhatsApp Style */}
            <div className="flex shrink-0 items-center gap-4 bg-success p-4 text-on-success transition-all">
              <button
                onClick={step === 'info' ? handleBackStep : handleClose}
                className="rounded-full p-1 hover:bg-white/10"
                aria-label={step === 'info' ? 'رجوع' : 'إغلاق'}
              >
                {step === 'info' ? <ChevronLeft size={24} /> : <X size={24} />}
              </button>
              <div>
                <h3 className="text-lg font-normal leading-tight">
                  {isEditingGroup
                    ? 'تعديل المجموعة'
                    : isCreatingGroup
                      ? step === 'select'
                        ? 'إضافة أعضاء المجموعة'
                        : 'مجموعة جديدة'
                      : 'بدء محادثة'}
                </h3>
                {isCreatingGroup && step === 'select' && (
                  <p className="text-white/80 text-xs">
                    {selectedUsers.length} من {availableUsers.length} مختار
                  </p>
                )}
              </div>
            </div>

            {step === 'select' ? (
              <>
                {/* Search Bar - Now always visible in select step */}
                <div className="border-b border-border p-3">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchUser}
                      onChange={(e) => setSearchUser(e.target.value)}
                      placeholder="ابحث عن اسم أو رقم..."
                      aria-label="بحث عن اسم أو رقم"
                      className="w-full rounded-lg border-none bg-surface py-2 pe-4 ps-10 text-start text-sm focus:ring-0 dark:bg-card"
                    />
                    <Search
                      className="absolute start-3 top-1/2 -translate-y-1/2 font-normal text-muted"
                      size={18}
                    />
                  </div>
                </div>

                {/* Selected Chips Horizontal List */}
                {selectedUsers.length > 0 && (
                  <div className="custom-scrollbar bg-surface dark:bg-card flex min-h-[85px] shrink-0 grow-0 gap-3 overflow-x-auto border-b border-border p-3">
                    {selectedUsersObjects.map((user) => (
                      <div
                        key={user.id}
                        className="relative flex shrink-0 flex-col items-center gap-1 px-1"
                      >
                        <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft text-xs font-medium text-primary shadow-sm dark:bg-card">
                          {user.name.charAt(0)}
                          <button
                            onClick={() =>
                              setSelectedUsers(selectedUsers.filter((id) => id !== user.id))
                            }
                            className="absolute -start-0 -top-0 rounded-full border-2 border-white bg-background p-0.5 text-main transition-colors hover:bg-error dark:border-card"
                            aria-label="إزالة"
                          >
                            <X size={12} />
                          </button>
                        </div>
                        <span className="w-14 truncate text-center text-micro font-normal text-muted">
                          {user.name}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Contact List */}
                <div className="custom-scrollbar flex-1 overflow-y-auto">
                  {!isCreatingGroup && (
                    <button
                      onClick={() => setIsCreatingGroup(true)}
                      className="flex w-full items-center gap-4 border-b border-border p-4 transition-colors hover:bg-surface dark:hover:bg-hover"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success text-on-success shadow-sm">
                        <UsersIcon size={24} />
                      </div>
                      <span className="text-start font-normal text-main">إنشاء مجموعة جديدة</span>
                    </button>
                  )}

                  {availableUsers
                    .filter(
                      (u) =>
                        (u.name || '').toLowerCase().includes((searchUser || '').toLowerCase()) ||
                        (u.username || '').toLowerCase().includes((searchUser || '').toLowerCase()),
                    )
                    .map((user) => (
                      <div
                        key={user.id}
                        onClick={() => {
                          if (isCreatingGroup || isEditingGroup) {
                            setSelectedUsers(
                              selectedUsers.includes(user.id)
                                ? selectedUsers.filter((id) => id !== user.id)
                                : [...selectedUsers, user.id],
                            )
                          } else {
                            handleCreateDirectChat(user.id)
                          }
                        }}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            if (isCreatingGroup || isEditingGroup) {
                              setSelectedUsers(
                                selectedUsers.includes(user.id)
                                  ? selectedUsers.filter((id) => id !== user.id)
                                  : [...selectedUsers, user.id],
                              )
                            } else {
                              handleCreateDirectChat(user.id)
                            }
                          }
                        }}
                        className="flex cursor-pointer items-center justify-between border-b border-border p-4 transition-colors hover:bg-surface dark:hover:bg-hover"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white bg-primary-soft font-medium text-primary shadow-sm transition-all dark:border-border dark:bg-card">
                            {user.name.charAt(0)}
                          </div>
                          <div className="text-start">
                            <p className="text-base font-normal text-main">{user.name}</p>
                            <p className="text-xs text-muted">@{user.username}</p>
                          </div>
                        </div>
                        {(isCreatingGroup || isEditingGroup) && (
                          <div
                            className={cn(
                              'flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all',
                              selectedUsers.includes(user.id)
                                ? 'border-success bg-success text-on-success'
                                : 'border-border',
                            )}
                          >
                            {selectedUsers.includes(user.id) && <Check size={16} />}
                          </div>
                        )}
                      </div>
                    ))}
                </div>

                {/* Floating Next Button */}
                {isCreatingGroup && selectedUsers.length > 0 && (
                  <div className="absolute bottom-6 end-6 duration-300 animate-in fade-in slide-in-from-bottom-5">
                    <button
                      onClick={handleNextStep}
                      className="rounded-none bg-success p-4 text-on-success shadow-sm transition-all hover:scale-110 active:scale-95"
                      aria-label="التالي"
                    >
                      <ChevronLeft size={32} />
                    </button>
                  </div>
                )}
              </>
            ) : (
              /* Step 2: Group Info */
              <div className="slide-in-from-start-5 flex flex-1 flex-col p-6 duration-300 animate-in fade-in">
                <div className="space-y-6">
                  <div className="group relative">
                    <input
                      type="text"
                      value={groupName}
                      autoFocus
                      onChange={(e) => setGroupName(e.target.value)}
                      placeholder="اسم المجموعة..."
                      aria-label="اسم المجموعة"
                      className="border-success-soft w-full border-b-2 bg-transparent py-3 text-start text-lg font-normal text-main outline-none transition-colors focus:border-success"
                    />
                    <div className="mt-1 flex justify-start">
                      <span className="text-micro font-normal text-muted">
                        {groupName.length}/25
                      </span>
                    </div>
                  </div>

                  <div className="pt-6">
                    <p className="mb-4 text-start text-sm text-muted">
                      الأعضاء: {selectedUsers.length}
                    </p>
                    <div className="flex flex-wrap justify-end gap-2">
                      {selectedUsersObjects.slice(0, 5).map((u) => (
                        <span
                          key={u.id}
                          className="whitespace-nowrap rounded-full bg-surface px-3 py-1 text-xs font-normal dark:bg-card dark:text-muted"
                        >
                          {u.name}
                        </span>
                      ))}
                      {selectedUsers.length > 5 && (
                        <span className="rounded-full bg-surface px-3 py-1 text-xs font-normal dark:bg-card dark:text-muted">
                          +{selectedUsers.length - 5}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-auto pt-10">
                  <button
                    onClick={handleCreateConversation}
                    disabled={!groupName.trim() || isSubmitting}
                    className={cn(
                      'flex w-full items-center justify-center gap-3 rounded-xl bg-success py-4 font-normal uppercase tracking-widest text-on-success shadow-sm transition-all active:scale-95',
                      (!groupName.trim() || isSubmitting) &&
                        'cursor-not-allowed opacity-50 grayscale',
                    )}
                  >
                    {isSubmitting
                      ? 'جاري الإنشاء...'
                      : isEditingGroup
                        ? 'تحديث البيانات'
                        : 'إنشاء المجموعة الآن'}
                    {!isSubmitting && <Check size={20} />}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation UI */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setShowDeleteConfirm(false)
              setItemToDelete(null)
            }
          }}
        >
          <div className="w-full max-w-sm rounded-lg bg-card p-6 shadow-sm">
            <h3 className="mb-4 text-start text-xl font-normal text-error">
              {deleteType === 'all_conversations' ? 'حذف كافة المحادثات؟' : 'هل تريد الحذف؟'}
            </h3>
            <p className="mb-8 text-start text-sm leading-relaxed text-muted dark:text-dim">
              {deleteType === 'all_conversations'
                ? 'سيتم مسح جميع سجلات الدردشة الخاصة بك نهائياً. لا يمكن التراجع عن هذا الإجراء.'
                : `هل أنت متأكد من حذف ${itemToDelete && 'displayName' in itemToDelete ? (itemToDelete as { displayName: string }).displayName : 'هذا العنصر'}؟`}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false)
                  setItemToDelete(null)
                }}
                className="flex-1 rounded-lg bg-surface py-3 font-normal dark:bg-hover dark:text-main"
              >
                إلغاء
              </button>
              <button
                onClick={handleDeleteAction}
                className="flex-1 rounded-lg bg-error py-3 font-normal text-on-error"
              >
                حذف الآن
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
