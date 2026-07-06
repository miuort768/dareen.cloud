import React, { useState, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { ChatSidebar } from '../features/chat/components/ChatSidebar';
import { ChatWindow } from '../features/chat/components/ChatWindow';
import { ChatModals } from '../features/chat/components/ChatModals';
import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';
import { useUnreadStore } from '../store/unreadStore';
import { useChat, useMessages } from '../hooks/useChat';
import { Image } from '../shared/components/ui';
import { cn } from '../lib/utils';
import type { Conversation, DeleteType, ChatUser } from '../types/chat.types';

export const Chat: React.FC = () => {
    const currentUser = useAuthStore(s => s.currentUser);
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
    const setActiveConversationId = useChatStore(s => s.setActiveConversationId);
    const isConnected = useChatStore(s => s.isConnected);
    const [newMessage, setNewMessage] = useState('');
    const [showMoreMenu, setShowMoreMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const location = useLocation();

    React.useEffect(() => {
        const id = selectedConv?.id || null;
        setActiveConversationId(id);
        useUnreadStore.getState().setActiveConversationId(id);
    }, [selectedConv, setActiveConversationId]);

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

    const handleCreateDirectChat = useCallback(async (targetUserId: string) => {
        try {
            const newConv = await createDirectChat(targetUserId);
            setSelectedConv(newConv);
            setShowNewChatModal(false);
            setSearchUser('');
        } catch (err) {
            console.error('Failed to create direct chat:', err);
        }
    }, [createDirectChat]);

    // Handle "Start Chat With" from other pages
    React.useEffect(() => {
        const targetUserId = location.state?.startChatWith;
        if (targetUserId && availableUsers.length > 0) {
            handleCreateDirectChat(targetUserId);
            // Clear the state so it doesn't re-trigger
            window.history.replaceState({}, document.title);
        }
    }, [location.state, availableUsers, handleCreateDirectChat]);

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

    const { data: messages = [], isLoading: isLoadingMessages, isError: isMessagesError } = useMessages(selectedConv?.id);

    return (
        <div 
            dir="rtl"
            className={cn(
                "flex flex-col overflow-hidden bg-white dark:bg-primary-active",
                "fixed inset-x-0 top-0 lg:relative lg:inset-auto lg:bottom-auto lg:w-full lg:h-screen z-10 transition-all duration-300",
                selectedConv ? "bottom-0" : "bottom-[70px]"
            )}
        >
            {/* Standard Global Header */}
            <div className="relative overflow-hidden bg-background px-4 md:px-8 py-6 flex-row items-center justify-between gap-4 border-b border-white/5 shrink-0 hidden lg:flex">
                <div className="relative z-10 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-success/30 shadow-[0_0_15px_rgba(52,211,153,0.30)] shrink-0 bg-white/5 ">
                        <Image src="/chat-avatar.jpg" alt="الشعار" className="w-full h-full" />
                    </div>
                    <div>
                        <div className="flex flex-col">
                            <h1 className="text-lg md:text-2xl font-medium text-on-primary tracking-tighter uppercase">مركز المحادثات</h1>
                            <p className="text-xs md:text-sm font-light text-dim uppercase tracking-widest mt-0.5">تواصل آمن ومباشر</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex w-full flex-1 min-h-0 mx-auto relative z-10">
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
                        isLoadingMessages={isLoadingMessages}
                        isMessagesError={isMessagesError}
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
                    <div className="hidden lg:flex flex-1 flex-col items-center justify-center bg-background dark:bg-background relative border-l border-border dark:border-white/5">
                        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', backgroundSize: '400px' }} />
                        
                        <div className="z-10 text-center">
                            <div className="w-20 h-20 bg-white/5 dark:bg-white/5  border border-border dark:border-white/10 flex items-center justify-center mx-auto mb-8 shadow-sm rounded-none">
                                <Image src="/logo.png" alt="دارين" className="w-12 h-12" imgClassName="object-contain" />
                            </div>
                            <h2 className="text-3xl font-medium text-main dark:text-on-primary mb-3 tracking-tighter uppercase">واتساب دارين للكمبيوتر</h2>
                            <div className="flex items-center justify-center gap-3 mb-6">
                                <span className="h-[1px] w-8 bg-primary/30"></span>
                                <p className="text-micro text-primary font-medium uppercase tracking-[0.2em]">تواصل آمن • مشفر</p>
                                <span className="h-[1px] w-8 bg-primary/30"></span>
                            </div>
                            <p className="text-sm text-muted dark:text-muted max-w-sm mx-auto leading-relaxed font-medium">
                                أرسل واستقبل الرسائل على التابلت والكمبيوتر بتجربة متكاملة.
                            </p>
                        </div>
                        
                        <div className="absolute bottom-10 flex items-center gap-2 text-muted dark:text-muted">
                             <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.50)]", isConnected ? "bg-success" : "bg-error")}></div>
                             <span className="text-micro font-medium uppercase tracking-widest">{isConnected ? "النظام متصل وآمن" : "غير متصل"}</span>
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
