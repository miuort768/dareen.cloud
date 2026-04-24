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
    const { currentUser, logout } = useApp();
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
        markAsRead
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

    const handleDeleteAction = async () => {
        if (!itemToDelete) return;
        setIsDeleting(true);
        try {
            if (deleteType === 'conversation' && 'id' in itemToDelete) {
                await deleteConversation((itemToDelete as Conversation).id);
                if (selectedConv?.id === itemToDelete.id) setSelectedConv(null);
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
                    logout={logout}
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
                        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', backgroundSize: '400px' }} />
                        <div className="z-10 text-center">
                            <div className="w-24 h-24 bg-gray-200 dark:bg-[#2a3942] rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                                <img src="/logo.png" alt="Dareen" className="w-16 h-16 grayscale opacity-40" />
                            </div>
                            <h2 className="text-3xl font-light text-[#41525d] dark:text-[#e9edef] mb-2 tracking-tight">واتساب دارين للكمبيوتر</h2>
                            <p className="text-sm text-[#667781] dark:text-[#8696a0] max-w-sm mx-auto leading-relaxed">
                                أرسل واستقبل الرسائل على التابلت والكمبيوتر بتجربة متكاملة.
                            </p>
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
