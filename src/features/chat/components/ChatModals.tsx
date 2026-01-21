import React from 'react';
import { X, Users as UsersIcon, ChevronRight, UserPlus, Key, Trash2 } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { ChatUser, DeleteType, Conversation } from '../../../types/chat.types';

export interface ProfileFormData {
    name: string;
    username: string;
    password?: string;
}

interface ChatModalsProps {
    showNewChatModal: boolean;
    setShowNewChatModal: (val: boolean) => void;
    isEditingGroup: boolean;
    groupName: string;
    setGroupName: (val: string) => void;
    searchUser: string;
    setSearchUser: (val: string) => void;
    availableUsers: ChatUser[];
    selectedUsers: string[];
    setSelectedUsers: (users: string[]) => void;
    isCreatingGroup: boolean;
    setIsCreatingGroup: (val: boolean) => void;
    handleCreateConversation: () => void;
    handleCreateDirectChat: (userId: string) => void;

    showProfileForm: boolean;
    setShowProfileForm: (val: boolean) => void;
    editingProfile: ChatUser | null;
    profileData: ProfileFormData;
    setProfileData: (val: ProfileFormData) => void;
    isSavingProfile: boolean;
    handleSaveProfile: (e: React.FormEvent) => void;

    showDeleteConfirm: boolean;
    setShowDeleteConfirm: (val: boolean) => void;
    deleteType: DeleteType;
    itemToDelete: Conversation | ChatUser | { displayName: string } | null;
    setItemToDelete: (val: Conversation | ChatUser | { displayName: string } | null) => void;
    isDeleting: boolean;
    handleDeleteAction: () => void;
}

export const ChatModals: React.FC<ChatModalsProps> = ({
    showNewChatModal, setShowNewChatModal, isEditingGroup, groupName, setGroupName,
    searchUser, setSearchUser, availableUsers, selectedUsers, setSelectedUsers,
    isCreatingGroup, setIsCreatingGroup, handleCreateConversation, handleCreateDirectChat,
    showProfileForm, setShowProfileForm, editingProfile, profileData, setProfileData,
    isSavingProfile, handleSaveProfile,
    showDeleteConfirm, setShowDeleteConfirm, deleteType, itemToDelete, setItemToDelete,
    isDeleting, handleDeleteAction
}) => {
    return (
        <>
            {/* New Chat / Group Modal */}
            {showNewChatModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-gray-950 w-full max-w-lg shadow-2xl border border-gray-100 dark:border-gray-800 rounded-none overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50 dark:bg-gray-900">
                            <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-widest text-sm">
                                {isEditingGroup ? 'تعديل بيانات المجموعة' : (isCreatingGroup ? 'إنشاء مجموعة جديدة' : 'ابدأ محادثة جديدة')}
                            </h3>
                            <button onClick={() => setShowNewChatModal(false)} className="text-gray-400 hover:text-rose-600 transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-8 space-y-6">
                            {!isEditingGroup && !isCreatingGroup ? (
                                <button
                                    onClick={() => setIsCreatingGroup(true)}
                                    className="w-full p-6 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-none hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-all flex flex-col items-center gap-3 group"
                                >
                                    <div className="w-12 h-12 bg-primary-50 dark:bg-primary-900/30 text-primary-600 rounded-none flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <UsersIcon size={24} />
                                    </div>
                                    <span className="font-black text-sm text-gray-700 dark:text-gray-300 uppercase tracking-widest">إنشاء مجموعة عمل</span>
                                </button>
                            ) : (
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block">اسم المجموعة</label>
                                    <input
                                        type="text"
                                        value={groupName}
                                        onChange={(e) => setGroupName(e.target.value)}
                                        placeholder="مثال: فصل اللغة العربية..."
                                        className="w-full bg-gray-100 dark:bg-gray-800 border-none p-4 font-bold text-sm focus:ring-2 ring-primary-500 outline-none rounded-none dark:text-white shadow-inner"
                                    />
                                </div>
                            )}

                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block">
                                    {isCreatingGroup || isEditingGroup ? 'اختر الأعضاء' : 'اختر مستخدماً'}
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={searchUser}
                                        onChange={(e) => setSearchUser(e.target.value)}
                                        placeholder="ابحث بالاسم أو اسم المستخدم..."
                                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4 pr-12 font-bold text-sm outline-none rounded-none dark:text-white"
                                    />
                                    <UsersIcon className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                                </div>

                                <div className="max-h-[300px] overflow-y-auto custom-scrollbar border border-gray-50 dark:border-gray-900">
                                    {availableUsers
                                        .filter(u => u.name.toLowerCase().includes(searchUser.toLowerCase()) || u.username.toLowerCase().includes(searchUser.toLowerCase()))
                                        .map(user => (
                                            <div
                                                key={user.id}
                                                onClick={() => {
                                                    if (isCreatingGroup || isEditingGroup) {
                                                        setSelectedUsers(selectedUsers.includes(user.id)
                                                            ? selectedUsers.filter(id => id !== user.id)
                                                            : [...selectedUsers, user.id]);
                                                    } else {
                                                        handleCreateDirectChat(user.id);
                                                    }
                                                }}
                                                className={cn(
                                                    "p-4 flex items-center justify-between cursor-pointer transition-all border-b border-gray-50 dark:border-gray-800 last:border-0",
                                                    selectedUsers.includes(user.id) ? "bg-primary-50 dark:bg-primary-900/20" : "hover:bg-gray-50 dark:hover:bg-gray-900/50"
                                                )}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 flex items-center justify-center font-black text-gray-500">
                                                        {user.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-sm text-gray-900 dark:text-white">{user.name}</p>
                                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">@{user.username}</p>
                                                    </div>
                                                </div>
                                                {(isCreatingGroup || isEditingGroup) ? (
                                                    <div className={cn(
                                                        "w-6 h-6 border-2 flex items-center justify-center transition-all",
                                                        selectedUsers.includes(user.id) ? "bg-primary-600 border-primary-600 text-white" : "border-gray-200 dark:border-gray-700"
                                                    )}>
                                                        {selectedUsers.includes(user.id) && <ChevronRight size={16} className="rotate-90" />}
                                                    </div>
                                                ) : (
                                                    <ChevronRight size={18} className="text-gray-300" />
                                                )}
                                            </div>
                                        ))}
                                </div>
                            </div>
                        </div>

                        {(isCreatingGroup || isEditingGroup) && (
                            <div className="p-6 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
                                <button
                                    onClick={handleCreateConversation}
                                    disabled={!groupName.trim() || selectedUsers.length === 0}
                                    className={cn(
                                        "w-full bg-primary-600 text-white py-5 font-black text-sm uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-primary-600/30",
                                        (!groupName.trim() || selectedUsers.length === 0) && "opacity-50 grayscale cursor-not-allowed"
                                    )}
                                >
                                    {isEditingGroup ? 'تحديث بيانات المجموعة' : 'إنشاء المجموعة الآن'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Profile Form Modal */}
            {showProfileForm && (
                <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-gray-950 w-full max-w-md shadow-2xl border border-gray-100 dark:border-gray-800 rounded-none overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/50">
                            <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-widest text-xs">
                                {editingProfile ? 'تعديل حساب مستخدم' : 'إضافة حساب دردشة جديد'}
                            </h3>
                            <button
                                onClick={() => setShowProfileForm(false)}
                                className="text-gray-400 hover:text-rose-600 transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveProfile} className="p-8 space-y-6">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">الاسم بالكامل</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={profileData.name}
                                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4 font-bold text-sm outline-none rounded-none dark:text-white focus:ring-2 ring-primary-500 transition-all"
                                        placeholder="مثال: أحمد محمد..."
                                        required
                                    />
                                    <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">اسم المستخدم (للدخول)</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={profileData.username}
                                        onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4 font-bold text-sm outline-none rounded-none dark:text-white focus:ring-2 ring-primary-500 transition-all"
                                        placeholder="اسم المستخدم بالأحرف الإنجليزية"
                                        required
                                    />
                                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">كـلمة المـرور</label>
                                <div className="relative">
                                    <input
                                        type="password"
                                        value={profileData.password}
                                        onChange={(e) => setProfileData({ ...profileData, password: e.target.value })}
                                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4 font-bold text-sm outline-none rounded-none dark:text-white focus:ring-2 ring-primary-500 transition-all shadow-inner"
                                        placeholder={editingProfile ? "اتركه فارغاً إذا لا تريد التغيير" : "كلمة مرور قوية..."}
                                        required={!editingProfile}
                                    />
                                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSavingProfile}
                                className={cn(
                                    "w-full bg-primary-600 text-white py-5 font-black text-sm uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-primary-600/30",
                                    isSavingProfile && "opacity-50 grayscale"
                                )}
                            >
                                {isSavingProfile ? 'جاري الحفظ...' : (editingProfile ? 'حفظ التعديلات' : 'تأكيد الإضافة')}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Premium Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-gray-900 w-full max-w-md shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] border border-gray-100 dark:border-gray-800 rounded-none overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-300">
                        <div className="relative p-10 text-center">
                            <div className="relative w-24 h-24 bg-rose-50 dark:bg-rose-950/30 rounded-full flex items-center justify-center mx-auto mb-8">
                                <div className="absolute inset-0 bg-rose-500 rounded-full animate-ping opacity-20"></div>
                                <Trash2 size={48} className="text-rose-600 dark:text-rose-500 relative z-10" />
                            </div>

                            <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">هل أنت متأكد؟</h3>
                            <p className="text-gray-500 dark:text-gray-400 font-bold text-base leading-relaxed mb-10 px-4">
                                {deleteType === 'conversation' && itemToDelete && 'id' in itemToDelete ? (
                                    <>
                                        سيتم حذف <span className="text-rose-600 dark:text-rose-400 font-black">{(itemToDelete as Conversation).isGroup ? 'المجموعة' : 'المحادثة'}</span> ({(itemToDelete as Conversation).displayName}) نهائياً مع كافة الرسائل والسجلات.
                                    </>
                                ) : deleteType === 'all_conversations' ? (
                                    <>
                                        سيتم حذف <span className="text-rose-600 dark:text-rose-400 font-black">كافة المحادثات والمجموعات</span> نهائياً. سيتم مسح جميع الرسائل والبيانات المتعلقة بالدردشة.
                                    </>
                                ) : (
                                    <>
                                        سيتم حذف حساب المستخدم <span className="text-rose-600 dark:text-rose-400 font-black">{(itemToDelete as ChatUser).name}</span> نهائياً. لن يتمكن من تسجيل الدخول أو المشاركة في الدردشة.
                                    </>
                                )}
                                <br />
                                <span className="text-xs text-rose-500/60 uppercase tracking-widest mt-4 block">هذا الإجراء لا يمكن التراجع عنه</span>
                            </p>

                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={handleDeleteAction}
                                    disabled={isDeleting}
                                    className={cn(
                                        "w-full bg-rose-600 text-white py-5 font-black text-sm uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-rose-600/30 flex items-center justify-center gap-3",
                                        isDeleting && "opacity-50 grayscale cursor-not-allowed"
                                    )}
                                >
                                    {isDeleting ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            جاري التنفيذ...
                                        </>
                                    ) : (
                                        <>
                                            <Trash2 size={18} />
                                            {deleteType === 'conversation' ? 'نعم، احذف المحادثة الآن' : deleteType === 'all_conversations' ? 'نعم، احذف كافة المحادثات الآن' : 'نعم، احذف الحساب الآن'}
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={() => {
                                        setShowDeleteConfirm(false);
                                        setItemToDelete(null);
                                    }}
                                    disabled={isDeleting}
                                    className="w-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 py-5 font-black text-sm uppercase tracking-widest hover:bg-gray-200 dark:hover:bg-gray-750 transition-all active:scale-95"
                                >
                                    إلغاء وتراجع
                                </button>
                            </div>
                        </div>

                        {isDeleting && (
                            <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gray-100 dark:bg-gray-800 overflow-hidden">
                                <div className="h-full bg-rose-600 animate-progress origin-left"></div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};
