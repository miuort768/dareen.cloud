import React, { useRef } from 'react';
import { X, Users as UsersIcon, ChevronLeft, Search, Check, Camera } from 'lucide-react';
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
    showDeleteConfirm, setShowDeleteConfirm, setItemToDelete, deleteType, itemToDelete,
    isDeleting, handleDeleteAction
}) => {
    
    const avatarInputRef = useRef<HTMLInputElement>(null);
    // Internal state to track "Select Members" vs "Add Group Info" steps
    const [step, setStep] = React.useState<'select' | 'info'>('select');

    const selectedUsersObjects = availableUsers.filter(u => selectedUsers.includes(u.id));

    const handleNextStep = () => {
        if (selectedUsers.length > 0) setStep('info');
    };

    const handleBackStep = () => {
        setStep('select');
    };

    const handleClose = () => {
        setShowNewChatModal(false);
        setStep('select');
        setIsCreatingGroup(false);
        setSelectedUsers([]);
        setGroupName('');
    };



    return (
        <>
            {/* New Chat / Group Flow Modal */}
            {showNewChatModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-0 md:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-card w-full max-w-lg h-full md:h-[650px] md:max-h-[90vh] shadow-sm overflow-hidden flex flex-col md:rounded-lg animate-in zoom-in-95 duration-300">
                    
                    {/* Header - WhatsApp Style */}
                    <div className="bg-success text-on-primary p-4 flex items-center gap-4 shrink-0 transition-all">
                        <button onClick={step === 'info' ? handleBackStep : handleClose} className="hover:bg-white/10 p-1 rounded-full">
                            {step === 'info' ? <ChevronLeft size={24} /> : <X size={24} />}
                        </button>
                        <div>
                            <h3 className="font-normal text-lg leading-tight">
                                {isEditingGroup ? 'تعديل المجموعة' : (isCreatingGroup ? (step === 'select' ? 'إضافة أعضاء المجموعة' : 'مجموعة جديدة') : 'بدء محادثة')}
                            </h3>
                            {isCreatingGroup && step === 'select' && (
                                <p className="text-xs text-on-primary/80">{selectedUsers.length} من {availableUsers.length} مختار</p>
                            )}
                        </div>
                    </div>

                    {step === 'select' ? (
                        <>
                            {/* Search Bar - Now always visible in select step */}
                            <div className="p-3 border-b border-border dark:border-border">
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={searchUser}
                                        onChange={(e) => setSearchUser(e.target.value)}
                                        placeholder="ابحث عن اسم أو رقم..."
                                        className="w-full bg-surface dark:bg-card border-none py-2 ps-10 pe-4 rounded-lg text-sm focus:ring-0 text-start"
                                    />
                                    <Search className="absolute start-3 top-1/2 -translate-y-1/2 text-muted font-normal" size={18} />
                                </div>
                            </div>

                            {/* Selected Chips Horizontal List */}
                            {selectedUsers.length > 0 && (
                                <div className="p-3 border-b border-border dark:border-border flex gap-3 overflow-x-auto custom-scrollbar bg-background/50 dark:bg-card/50 grow-0 shrink-0 min-h-[85px]">
                                    {selectedUsersObjects.map(user => (
                                        <div key={user.id} className="flex flex-col items-center gap-1 shrink-0 relative px-1">
                                            <div className="w-12 h-12 bg-primary-soft dark:bg-primary-active/30 rounded-full flex items-center justify-center relative shadow-sm text-primary dark:text-primary font-medium text-xs">
                                                {user.name.charAt(0)}
                                                <button 
                                                    onClick={() => setSelectedUsers(selectedUsers.filter(id => id !== user.id))}
                                                    className="absolute -top-0 -start-0 bg-background0 text-on-primary rounded-full p-0.5 border-2 border-white dark:border-card hover:bg-error transition-colors"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </div>
                                            <span className="text-micro font-normal text-muted dark:text-muted truncate w-14 text-center">{user.name}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Contact List */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar">
                                {!isCreatingGroup && (
                                    <button 
                                        onClick={() => setIsCreatingGroup(true)}
                                        className="w-full p-4 flex items-center gap-4 hover:bg-surface dark:hover:bg-hover transition-colors border-b border-border dark:border-border"
                                    >
                                        <div className="w-12 h-12 bg-success text-on-primary rounded-full flex items-center justify-center shadow-sm">
                                            <UsersIcon size={24} />
                                        </div>
                                        <span className="font-normal text-main text-start">إنشاء مجموعة جديدة</span>
                                    </button>
                                )}

                                {availableUsers
                                    .filter(u => (u.name || '').toLowerCase().includes((searchUser || '').toLowerCase()) || (u.username || '').toLowerCase().includes((searchUser || '').toLowerCase()))
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
                                            className="p-4 flex items-center justify-between cursor-pointer hover:bg-surface dark:hover:bg-hover transition-colors border-b border-border dark:border-border"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-primary-soft dark:bg-primary-active/30 rounded-full flex items-center justify-center font-medium text-primary dark:text-primary shadow-sm transition-all border-2 border-white dark:border-border">
                                                    {user.name.charAt(0)}
                                                </div>
                                                <div className="text-start">
                                                    <p className="font-normal text-base text-main">{user.name}</p>
                                                    <p className="text-xs text-muted dark:text-muted">@{user.username}</p>
                                                </div>
                                            </div>
                                            {(isCreatingGroup || isEditingGroup) && (
                                                <div className={cn(
                                                    "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                                                    selectedUsers.includes(user.id) ? "bg-success border-success text-on-primary" : "border-border dark:border-border"
                                                )}>
                                                    {selectedUsers.includes(user.id) && <Check size={16} />}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                            </div>

                            {/* Floating Next Button */}
                            {isCreatingGroup && selectedUsers.length > 0 && (
                                <div className="absolute bottom-6 end-6 animate-in slide-in-from-bottom-5 fade-in duration-300">
                                    <button 
                                        onClick={handleNextStep}
                                        className="bg-success text-on-primary p-4 rounded-full shadow-sm hover:scale-110 active:scale-95 transition-all"
                                    >
                                        <ChevronLeft size={32} />
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        /* Step 2: Group Info */
                        <div className="flex-1 flex flex-col p-6 animate-in slide-in-from-start-5 fade-in duration-300">
                            <div className="flex flex-col items-center mb-10">
                                <div onClick={() => avatarInputRef.current?.click()} className="w-40 h-40 bg-surface dark:bg-card rounded-full flex items-center justify-center text-muted relative group cursor-pointer shadow-inner">
                                    <Camera size={48} />
                                    <div className="absolute inset-0 bg-black/20 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="text-on-primary text-xs font-normal uppercase tracking-wider">تغيير الصورة</span>
                                    </div>
                                    <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) { alert('سيتم تفعيل رفع الصور قريباً'); } e.target.value = ''; }} />
                                </div>
                                <p className="mt-4 text-xs font-normal text-muted uppercase tracking-widest">أيقونة المجموعة</p>
                            </div>

                            <div className="space-y-6">
                                <div className="relative group">
                                    <input
                                        type="text"
                                        value={groupName}
                                        autoFocus
                                        onChange={(e) => setGroupName(e.target.value)}
                                        placeholder="اسم المجموعة..."
                                        className="w-full bg-transparent border-b-2 border-success/30 focus:border-success py-3 text-lg font-normal outline-none transition-colors text-main text-start"
                                    />
                                    <div className="flex justify-start mt-1">
                                        <span className="text-micro font-normal text-muted">{groupName.length}/25</span>
                                    </div>
                                </div>

                                <div className="pt-6">
                                    <p className="text-sm text-muted dark:text-muted mb-4 text-start">الأعضاء: {selectedUsers.length}</p>
                                    <div className="flex flex-wrap gap-2 justify-end">
                                        {selectedUsersObjects.slice(0, 5).map(u => (
                                            <span key={u.id} className="bg-surface dark:bg-card text-xs font-normal px-3 py-1 rounded-full dark:text-dim whitespace-nowrap">
                                                {u.name}
                                            </span>
                                        ))}
                                        {selectedUsers.length > 5 && (
                                            <span className="bg-surface dark:bg-card text-xs font-normal px-3 py-1 rounded-full dark:text-dim">
                                                +{selectedUsers.length - 5}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-auto pt-10">
                                <button
                                    onClick={handleCreateConversation}
                                    disabled={!groupName.trim() || isDeleting}
                                    className={cn(
                                        "w-full bg-success text-on-primary py-4 rounded-none font-normal uppercase tracking-widest transition-all active:scale-95 shadow-sm flex items-center justify-center gap-3",
                                        (!groupName.trim() || isDeleting) && "opacity-50 grayscale cursor-not-allowed"
                                    )}
                                >
                                    {isDeleting ? 'جاري الإنشاء...' : (isEditingGroup ? 'تحديث البيانات' : 'إنشاء المجموعة الآن')}
                                    {!isDeleting && <Check size={20} />}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            )}



            {/* Delete Confirmation UI */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-white dark:bg-card w-full max-w-sm shadow-sm rounded-lg p-6">
                        <h3 className="text-xl font-normal text-error mb-4 text-start">
                            {deleteType === 'all_conversations' ? 'حذف كافة المحادثات؟' : 'هل تريد الحذف؟'}
                        </h3>
                        <p className="text-muted dark:text-dim mb-8 text-sm text-start leading-relaxed">
                            {deleteType === 'all_conversations' 
                                ? 'سيتم مسح جميع سجلات الدردشة الخاصة بك نهائياً. لا يمكن التراجع عن هذا الإجراء.' 
                                : `هل أنت متأكد من حذف ${itemToDelete && 'displayName' in itemToDelete ? (itemToDelete as { displayName: string }).displayName : 'هذا العنصر'}؟`}
                        </p>
                        <div className="flex gap-3">
                             <button
                                onClick={() => { setShowDeleteConfirm(false); setItemToDelete(null); }}
                                className="flex-1 bg-surface dark:bg-hover dark:text-on-primary py-3 rounded-lg font-normal"
                            >
                                إلغاء
                            </button>
                            <button
                                onClick={handleDeleteAction}
                                className="flex-1 bg-error text-on-primary py-3 rounded-lg font-normal"
                            >
                                حذف الآن
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
