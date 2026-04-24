import React, { useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { ChatSidebar } from '../features/chat/components/ChatSidebar';
import { ChatWindow } from '../features/chat/components/ChatWindow';
import { ChatModals } from '../features/chat/components/ChatModals';
import { useApp } from '../context/AppContext';
import { useChatContext } from '../context/ChatContext';
import { useChat, useMessages } from '../hooks/useChat';
import { cn } from '../lib/utils';
import type { Conversation, DeleteType, ChatUser } from '../types/chat.types';

export const Chat: React.FC = () => {
    const { currentUser } = useApp();
    const {
        conversations,
        availableUsers,
        sendMessage,
        isSending,
        createDirectChat,
        saveGroup,
        deleteConversation,
        refetchConversations,
        typingUsers,
        setTyping,
        markAsRead,
        deleteAllConversations
    } = useChat(String(currentUser?.id));

    const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
    const { setActiveConversationId } = useChatContext();
    const [newMessage, setNewMessage] = useState('');
    const [showMoreMenu, setShowMoreMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const location = useLocation();

    React.useEffect(() => {
        setActiveConversationId(selectedConv?.id || null);
    }, [selectedConv, setActiveConversationId]);

    // Handle "Start Chat With" from other pages
    React.useEffect(() => {
        const targetUserId = location.state?.startChatWith;
        if (targetUserId && availableUsers.length > 0) {
            handleCreateDirectChat(targetUserId);
            // Clear the state so it doesn't re-trigger
            window.history.replaceState({}, document.title);
        }
    }, [location.state, availableUsers]);

    // Modal States
    const [showNewChatModal, setShowNewChatModal] = useState(false);
    const [isEditingGroup, setIsEditingGroup] = useState(false);
    const [isCreatingGroup, setIsCreatingGroup] = useState(false);
    const [groupName, setGroupName] = useState('');
    const [searchUser, setSearchUser] = useState('');
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteType, setDeleteType] = useState<DeleteType>('conversation');
    const [itemToDelete, setItemToDelete] = useState<Conversation | ChatUser | { displayName: string } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const openGroupSettings = () => {
        if (!selectedConv || !selectedConv.isGroup || currentUser?.role !== 'admin') return;
        setGroupName(selectedConv.displayName || '');
        setSelectedUsers(selectedConv.members || []);
        setIsEditingGroup(true);
        setIsCreatingGroup(true);
        setShowNewChatModal(true);
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        const content = newMessage.trim();
        if (!content || !selectedConv || !currentUser) return;

        sendMessage({
            conversationId: selectedConv.id,
            senderId: String(currentUser.id),
            senderName: currentUser.name,
            content
        });
        setNewMessage('');
    };

    const handleCreateConversation = async () => {
        try {
            await saveGroup({
                id: isEditingGroup ? selectedConv?.id : undefined,
                name: groupName,
                members: selectedUsers,
                isGroup: true
            });
            setShowNewChatModal(false);
            setGroupName('');
            setSelectedUsers([]);
            setIsCreatingGroup(false);
            setIsEditingGroup(false);
            refetchConversations();
        } catch (err) {
            console.error('Failed to save group:', err);
        }
    };

    const handleCreateDirectChat = async (targetUserId: string) => {
        try {
            const newConv = await createDirectChat(targetUserId);
            setSelectedConv(newConv);
            setShowNewChatModal(false);
            setSearchUser('');
        } catch (err) {
            console.error('Failed to create direct chat:', err);
        }
    };

    const handleDeleteAllClick = () => {
        setDeleteType('all_conversations');
        setItemToDelete({ displayName: 'جميع المحادثات' });
        setShowDeleteConfirm(true);
    };

    const handleDeleteAction = async () => {
        if (!itemToDelete) return;
        setIsDeleting(true);
        try {
            if (deleteType === 'conversation' && itemToDelete && 'id' in itemToDelete) {
                await deleteConversation((itemToDelete as Conversation).id);
                if (selectedConv?.id === itemToDelete.id) setSelectedConv(null);
            } else if (deleteType === 'all_conversations') {
                await deleteAllConversations();
                setSelectedConv(null);
            }
            setShowDeleteConfirm(false);
            setItemToDelete(null);
            refetchConversations();
        } catch (err) {
            console.error('Delete failed:', err);
        } finally {
            setIsDeleting(false);
        }
    };

    const { data: messages = [] } = useMessages(selectedConv?.id);

    return (
        <div 
            dir="rtl"
            className={cn(
                "flex overflow-hidden bg-white dark:bg-slate-900",
                "w-full h-[100dvh] lg:h-screen pb-[70px] lg:pb-0 relative z-10 max-w-[100vw] overflow-x-hidden"
            )}
        >

            <div className="flex w-full h-full max-w-full mx-auto relative z-10">
                <ChatSidebar
                    conversations={conversations}
                    selectedConv={selectedConv}
                    setSelectedConv={setSelectedConv}
                    currentUser={currentUser}
                    setShowNewChatModal={setShowNewChatModal}
                    setIsEditingGroup={setIsEditingGroup}
                    onDeleteAll={handleDeleteAllClick}
                    typingUsers={typingUsers}
                />

                {selectedConv ? (
                    <ChatWindow
                        selectedConv={selectedConv}
                        messages={messages}
                        newMessage={newMessage}
                        setNewMessage={setNewMessage}
                        handleSendMessage={handleSendMessage}
                        isSending={isSending}
                        currentUser={currentUser}
                        setSelectedConv={setSelectedConv}
                        openGroupSettings={openGroupSettings}
                        confirmDeleteConversation={(conv: Conversation) => {
                            setDeleteType('conversation');
                            setItemToDelete(conv);
                            setShowDeleteConfirm(true);
                        }}
                        showMoreMenu={showMoreMenu}
                        setShowMoreMenu={setShowMoreMenu}
                        menuRef={menuRef}
                        setTyping={setTyping}
                        markAsRead={markAsRead}
                    />
                ) : (
                    <div className="hidden lg:flex flex-1 flex-col items-center justify-center bg-[#f8f9fa] dark:bg-[#020617] relative border-l border-gray-200 dark:border-white/5">
                        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', backgroundSize: '400px' }} />
                        
                        {/* Sharp Design Element */}
                        <div className="absolute top-0 right-0 w-96 h-96 bg-[#5c59f2]/5 rotate-45 -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none"></div>

                        <div className="z-10 text-center">
                            <div className="w-20 h-20 bg-white/5 dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 flex items-center justify-center mx-auto mb-8 shadow-2xl rounded-none">
                                <img src="/logo.png" alt="Dareen" className="w-12 h-12 object-contain" />
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-3 tracking-tighter uppercase">واتساب دارين للكمبيوتر</h2>
                            <div className="flex items-center justify-center gap-3 mb-6">
                                <span className="h-[1px] w-8 bg-indigo-500/30"></span>
                                <p className="text-[10px] text-indigo-500 font-black uppercase tracking-[0.2em]">تواصل آمن • مشفر</p>
                                <span className="h-[1px] w-8 bg-indigo-500/30"></span>
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed font-medium">
                                أرسل واستقبل الرسائل على التابلت والكمبيوتر بتجربة متكاملة.
                            </p>
                        </div>
                        
                        <div className="absolute bottom-10 flex items-center gap-2 text-slate-400 dark:text-slate-600">
                             <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                             <span className="text-[10px] font-black uppercase tracking-widest">النظام متصل وآمن</span>
                        </div>
                    </div>
                )}
            </div>

            <ChatModals
                showNewChatModal={showNewChatModal}
                setShowNewChatModal={setShowNewChatModal}
                isEditingGroup={isEditingGroup}
                groupName={groupName}
                setGroupName={setGroupName}
                searchUser={searchUser}
                setSearchUser={setSearchUser}
                availableUsers={availableUsers}
                selectedUsers={selectedUsers}
                setSelectedUsers={setSelectedUsers}
                isCreatingGroup={isCreatingGroup}
                setIsCreatingGroup={setIsCreatingGroup}
                handleCreateConversation={handleCreateConversation}
                handleCreateDirectChat={handleCreateDirectChat}
                showDeleteConfirm={showDeleteConfirm}
                setShowDeleteConfirm={setShowDeleteConfirm}
                deleteType={deleteType}
                itemToDelete={itemToDelete}
                setItemToDelete={setItemToDelete}
                isDeleting={isDeleting}
                handleDeleteAction={handleDeleteAction}
            />
        </div>
    );
};
