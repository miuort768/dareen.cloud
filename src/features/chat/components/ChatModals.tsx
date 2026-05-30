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
                    <div className="bg-white dark:bg-[#111b21] w-full max-w-lg h-full md:h-[650px] md:max-h-[90vh] shadow-sm overflow-hidden flex flex-col md:rounded-lg animate-in zoom-in-95 duration-300">
                    
                    {/* Header - WhatsApp Style */}
                    <div className="bg-[#00a884] text-white p-4 flex items-center gap-4 shrink-0 transition-all">
                        <button onClick={step === 'info' ? handleBackStep : handleClose} className="hover:bg-white/10 p-1 rounded-full">
                            {step === 'info' ? <ChevronLeft size={24} /> : <X size={24} />}
                        </button>
                        <div>
                            <h3 className="font-normal text-lg leading-tight">
                                {isEditingGroup ? 'تعديل المجموعة' : (isCreatingGroup ? (step === 'select' ? 'إضافة أعضاء المجموعة' : 'مجموعة جديدة') : 'بدء محادثة')}
                            </h3>
                            {isCreatingGroup && step === 'select' && (
                                <p className="text-xs text-white/80">{selectedUsers.length} من {availableUsers.length} مختار</p>
                            )}
                        </div>
                    </div>

                    {step === 'select' ? (
                        <>
                            {/* Search Bar - Now always visible in select step */}
                            <div className="p-3 border-b border-gray-100 dark:border-gray-800">
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={searchUser}
                                        onChange={(e) => setSearchUser(e.target.value)}
                                        placeholder="ابحث عن اسم أو رقم..."
                                        className="w-full bg-[#f0f2f5] dark:bg-[#202c33] border-none py-2 pr-10 pl-4 rounded-lg text-sm focus:ring-0 text-right"
                                    />
                                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-normal" size={18} />
                                </div>
                            </div>

                            {/* Selected Chips Horizontal List */}
                            {selectedUsers.length > 0 && (
                                <div className="p-3 border-b border-gray-100 dark:border-gray-800 flex gap-3 overflow-x-auto custom-scrollbar bg-gray-50/50 dark:bg-[#111b21]/50 grow-0 shrink-0 min-h-[85px]">
                                    {selectedUsersObjects.map(user => (
                                        <div key={user.id} className="flex flex-col items-center gap-1 shrink-0 relative px-1">
                                            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center relative shadow-sm text-indigo-600 dark:text-indigo-400 font-medium text-xs">
                                                {user.name.charAt(0)}
                                                <button 
                                                    onClick={() => setSelectedUsers(selectedUsers.filter(id => id !== user.id))}
                                                    className="absolute -top-0 -right-0 bg-gray-500 text-white rounded-full p-0.5 border-2 border-white dark:border-[#111b21] hover:bg-rose-500 transition-colors"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </div>
                                            <span className="text-[10px] font-normal text-gray-600 dark:text-gray-400 truncate w-14 text-center">{user.name}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Contact List */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar">
                                {!isCreatingGroup && (
                                    <button 
                                        onClick={() => setIsCreatingGroup(true)}
                                        className="w-full p-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-[#202c33] transition-colors border-b border-gray-50 dark:border-gray-800"
                                    >
                                        <div className="w-12 h-12 bg-[#00a884] text-white rounded-full flex items-center justify-center shadow-sm">
                                            <UsersIcon size={24} />
                                        </div>
                                        <span className="font-normal text-[#111b21] dark:text-[#e9edef] text-right">إنشاء مجموعة جديدة</span>
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
                                            className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-[#202c33] transition-colors border-b border-gray-50 dark:border-gray-800"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center font-medium text-indigo-600 dark:text-indigo-400 shadow-sm transition-all border-2 border-white dark:border-slate-800">
                                                    {user.name.charAt(0)}
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-normal text-base text-[#111b21] dark:text-[#e9edef]">{user.name}</p>
                                                    <p className="text-xs text-gray-500 dark:text-[#8696a0]">@{user.username}</p>
                                                </div>
                                            </div>
                                            {(isCreatingGroup || isEditingGroup) && (
                                                <div className={cn(
                                                    "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                                                    selectedUsers.includes(user.id) ? "bg-[#00a884] border-[#00a884] text-white" : "border-gray-300 dark:border-[#374248]"
                                                )}>
                                                    {selectedUsers.includes(user.id) && <Check size={16} />}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                            </div>

                            {/* Floating Next Button */}
                            {isCreatingGroup && selectedUsers.length > 0 && (
                                <div className="absolute bottom-6 left-6 animate-in slide-in-from-bottom-5 fade-in duration-300">
                                    <button 
                                        onClick={handleNextStep}
                                        className="bg-[#00a884] text-white p-4 rounded-full shadow-sm hover:scale-110 active:scale-95 transition-all"
                                    >
                                        <ChevronLeft size={32} />
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        /* Step 2: Group Info */
                        <div className="flex-1 flex flex-col p-6 animate-in slide-in-from-right-5 fade-in duration-300">
                            <div className="flex flex-col items-center mb-10">
                                <div onClick={() => avatarInputRef.current?.click()} className="w-40 h-40 bg-[#dfe5e7] dark:bg-[#3b4a54] rounded-full flex items-center justify-center text-[#707c84] dark:text-[#8696a0] relative group cursor-pointer shadow-inner">
                                    <Camera size={48} />
                                    <div className="absolute inset-0 bg-black/20 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="text-white text-xs font-normal uppercase tracking-wider">تغيير الصورة</span>
                                    </div>
                                    <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) { /* handle avatar upload */ } }} />
                                </div>
                                <p className="mt-4 text-xs font-normal text-gray-400 uppercase tracking-widest">أيقونة المجموعة</p>
                            </div>

                            <div className="space-y-6">
                                <div className="relative group">
                                    <input
                                        type="text"
                                        value={groupName}
                                        autoFocus
                                        onChange={(e) => setGroupName(e.target.value)}
                                        placeholder="اسم المجموعة..."
                                        className="w-full bg-transparent border-b-2 border-[#00a884]/30 focus:border-[#00a884] py-3 text-lg font-normal outline-none transition-colors dark:text-white text-right"
                                    />
                                    <div className="flex justify-start mt-1">
                                        <span className="text-[10px] font-normal text-gray-400">{groupName.length}/25</span>
                                    </div>
                                </div>

                                <div className="pt-6">
                                    <p className="text-sm text-gray-500 dark:text-[#8696a0] mb-4 text-right">الأعضاء: {selectedUsers.length}</p>
                                    <div className="flex flex-wrap gap-2 justify-end">
                                        {selectedUsersObjects.slice(0, 5).map(u => (
                                            <span key={u.id} className="bg-gray-100 dark:bg-[#202c33] text-[12px] font-normal px-3 py-1 rounded-full dark:text-gray-300 whitespace-nowrap">
                                                {u.name}
                                            </span>
                                        ))}
                                        {selectedUsers.length > 5 && (
                                            <span className="bg-gray-100 dark:bg-[#202c33] text-[12px] font-normal px-3 py-1 rounded-full dark:text-gray-300">
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
                                        "w-full bg-[#00a884] text-white py-4 rounded-none font-normal uppercase tracking-widest transition-all active:scale-95 shadow-sm shadow-[#00a884]/20 flex items-center justify-center gap-3",
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
                    <div className="bg-white dark:bg-[#233138] w-full max-w-sm shadow-sm rounded-lg p-6">
                        <h3 className="text-xl font-normal text-rose-500 mb-4 text-right">
                            {deleteType === 'all_conversations' ? 'حذف كافة المحادثات؟' : 'هل تريد الحذف؟'}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-8 text-sm text-right leading-relaxed">
                            {deleteType === 'all_conversations' 
                                ? 'سيتم مسح جميع سجلات الدردشة الخاصة بك نهائياً. لا يمكن التراجع عن هذا الإجراء.' 
                                : `هل أنت متأكد من حذف ${itemToDelete && 'displayName' in itemToDelete ? (itemToDelete as { displayName: string }).displayName : 'هذا العنصر'}؟`}
                        </p>
                        <div className="flex gap-3">
                             <button
                                onClick={() => { setShowDeleteConfirm(false); setItemToDelete(null); }}
                                className="flex-1 bg-gray-100 dark:bg-[#182229] dark:text-white py-3 rounded-lg font-normal"
                            >
                                إلغاء
                            </button>
                            <button
                                onClick={handleDeleteAction}
                                className="flex-1 bg-rose-500 text-white py-3 rounded-lg font-normal"
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
