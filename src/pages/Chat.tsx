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
                "w-full h-[calc(100dvh-70px)] lg:h-screen relative z-10"
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
                    <div className="hidden lg:flex flex-1 flex-col items-center justify-center bg-[#f8f9fa] dark:bg-[#222e35] relative border-l border-gray-200 dark:border-gray-800">
                        <div className="z-10 text-center px-6">
                            <div className="max-w-[460px] mx-auto mb-10">
                                <img 
                                    src="https://static.whatsapp.net/rsrc.php/v3/y6/r/wa669ae5z2y.png" 
                                    alt="Welcome" 
                                    className="w-full h-auto opacity-80 dark:opacity-60 dark:invert-[0.1]" 
                                />
                            </div>
                            <h2 className="text-3xl font-light text-[#41525d] dark:text-[#e9edef] mb-4 tracking-tight">واتساب دارين للكمبيوتر</h2>
                            <p className="text-sm text-[#667781] dark:text-[#8696a0] max-w-md mx-auto leading-relaxed">
                                أرسل واستقبل الرسائل دون الحاجة لإبقاء هاتفك متصلاً بالإنترنت.<br/>
                                استخدم واتساب دارين على ما يصل إلى 4 أجهزة مرتبطة وهاتف واحد في نفس الوقت.
                            </p>
                        </div>
                        <div className="absolute bottom-10 text-[#8696a0] text-[12px] flex items-center gap-1.5 opacity-60">
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"/><path d="M12 6c-3.309 0-6 2.691-6 6s2.691 6 6 6 6-2.691 6-6-2.691-6-6-6zm0 10c-2.206 0-4-1.794-4-4s1.794-4 4-4 4 1.794 4 4-1.794 4-4 4z"/></svg>
                            <span>مشفر تماماً بين الطرفين</span>
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
