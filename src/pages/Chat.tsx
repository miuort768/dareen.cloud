import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { Share2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { useApp } from '../context/AppContext';
import { api } from '../lib/api';
import { useChat } from '../hooks/useChat';
import type { Conversation, ChatUser, ChatView, DeleteType } from '../types/chat.types';

// Sub-components
import { ChatSidebar } from '../features/chat/components/ChatSidebar';
import { ChatWindow } from '../features/chat/components/ChatWindow';
import { ChatManagement } from '../features/chat/components/ChatManagement';
import { ChatModals, type ProfileFormData } from '../features/chat/components/ChatModals';

export const Chat = () => {
    const { currentUser, logout } = useApp();
    const [searchParams] = useSearchParams();
    const location = useLocation();

    // Core Logic Hook
    const {
        conversations,
        availableUsers,
        profiles,
        useMessages,
        sendMessage,
        isSending,
        createDirectChat,
        saveGroup,
        deleteConversation,
        deleteAllConversations,
        typingUsers,
        setTyping,
        markAsRead,
        toggleLiveStatus
    } = useChat(currentUser?.id);

    // UI State
    const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
    const [view] = useState<ChatView>('chat');
    const [newMessage, setNewMessage] = useState('');
    const [showMoreMenu, setShowMoreMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Modal States
    const [showNewChatModal, setShowNewChatModal] = useState(false);
    const [isCreatingGroup, setIsCreatingGroup] = useState(false);
    const [isEditingGroup, setIsEditingGroup] = useState(false);
    const [groupName, setGroupName] = useState('');
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [searchUser, setSearchUser] = useState('');

    const [showProfileForm, setShowProfileForm] = useState(false);
    const [editingProfile, setEditingProfile] = useState<ChatUser | null>(null);
    const [profileData, setProfileData] = useState<ProfileFormData>({ name: '', username: '' });
    const [isSavingProfile, setIsSavingProfile] = useState(false);

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteType, setDeleteType] = useState<DeleteType | 'all_conversations'>('conversation');
    const [itemToDelete, setItemToDelete] = useState<Conversation | ChatUser | { displayName: string } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // HANDLERS
    const handleSendMessage = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedConv || !currentUser) return;

        sendMessage({
            conversationId: selectedConv.id,
            content: newMessage,
            senderId: currentUser.id,
            senderName: currentUser.name
        });
        setTyping(selectedConv.id, false, currentUser.name);
        setNewMessage('');
    }, [newMessage, selectedConv, currentUser, sendMessage]);

    const handleCreateDirectChat = useCallback(async (targetUserId: string) => {
        try {
            const newConv = await createDirectChat(targetUserId);
            setSelectedConv(newConv);
            setShowNewChatModal(false);
        } catch (error) {
            console.error("Error creating chat:", error);
        }
    }, [createDirectChat]);

    const handleCreateConversation = useCallback(async () => {
        if (!groupName.trim() || selectedUsers.length === 0) return;

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
        } catch (error) {
            console.error("Error saving conversation:", error);
        }
    }, [groupName, selectedUsers, isEditingGroup, selectedConv, saveGroup]);

    const openGroupSettings = useCallback((conv?: Conversation) => {
        const target = conv || selectedConv;
        if (!target || !target.isGroup) return;
        setGroupName(target.displayName || '');
        setSelectedUsers(target.members.filter(id => id !== currentUser?.id));
        setIsCreatingGroup(true);
        setIsEditingGroup(true);
        setShowNewChatModal(true);
    }, [selectedConv, currentUser]);

    const handleSaveProfile = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSavingProfile(true);

        try {
            if (editingProfile) {
                await api.put(`/chat/profiles/${editingProfile.id}`, profileData);
            } else {
                await api.post('/chat/profiles', profileData);
            }

            setShowProfileForm(false);
            setEditingProfile(null);
            setProfileData({ name: '', username: '', password: '' });
            window.location.reload();
        } catch (error) {
            console.error("Error saving profile:", error);
        } finally {
            setIsSavingProfile(false);
        }
    }, [editingProfile, profileData]);

    const handleDeleteAction = useCallback(async () => {
        if (!itemToDelete) return;
        setIsDeleting(true);

        try {
            if (deleteType === 'conversation' && itemToDelete && 'id' in itemToDelete) {
                await deleteConversation(itemToDelete.id);
                if (selectedConv?.id === itemToDelete.id) setSelectedConv(null);
            } else if (deleteType === 'all_conversations') {
                await deleteAllConversations();
                setSelectedConv(null);
            } else if (itemToDelete && 'id' in itemToDelete) {
                await api.delete(`/chat/profiles/${itemToDelete.id}`);
                window.location.reload();
            }
            setShowDeleteConfirm(false);
        } catch (error) {
            console.error("Error deleting:", error);
        } finally {
            setIsDeleting(false);
            setItemToDelete(null);
        }
    }, [itemToDelete, deleteType, deleteConversation, deleteAllConversations, selectedConv]);

    const confirmDeleteConversation = useCallback((conv: Conversation) => {
        setDeleteType('conversation');
        setItemToDelete(conv);
        setShowDeleteConfirm(true);
    }, []);

    const confirmDeleteProfile = useCallback((id: string) => {
        const profile = profiles.find(p => p.id === id);
        if (!profile) return;
        setDeleteType('profile');
        setItemToDelete(profile);
        setShowDeleteConfirm(true);
    }, [profiles]);

    const confirmDeleteAllConversations = useCallback(() => {
        setDeleteType('all_conversations');
        setItemToDelete({ displayName: 'كافة المحادثات' });
        setShowDeleteConfirm(true);
    }, []);

    const requestDesktopNotifications = useCallback(async () => {
        if (!('Notification' in window)) return false;
        if (Notification.permission === 'granted') return true;
        const result = await Notification.requestPermission();
        return result === 'granted';
    }, []);

    // Fetch messages for selected conversation
    const { data: messages = [] } = useMessages(selectedConv?.id);

    // Handle initial user/conversation selection from URL or State
    useEffect(() => {
        const targetUserId = searchParams.get('userId') || location.state?.startChatWith;
        const targetConvId = searchParams.get('conversationId');

        if (targetConvId && conversations.length > 0) {
            const conv = conversations.find(c => c.id === targetConvId);
            if (conv) setSelectedConv(conv);
        } else if (targetUserId && availableUsers.length > 0 && currentUser) {
            const existing = conversations.find(c => !c.isGroup && c.members.includes(targetUserId));
            if (existing) {
                setSelectedConv(existing);
            } else {
                const targetUser = availableUsers.find(u => u.id === targetUserId);
                if (targetUser) handleCreateDirectChat(targetUserId);
            }
        }
    }, [availableUsers, conversations, searchParams, currentUser, location.state, handleCreateDirectChat]);

    // Keep selectedConv in sync and mark as read
    useEffect(() => {
        if (selectedConv) {
            const updatedConv = conversations.find(c => c.id === selectedConv.id);
            if (updatedConv) {
                if (
                    updatedConv.displayName !== selectedConv.displayName ||
                    updatedConv.lastMessageTime !== selectedConv.lastMessageTime ||
                    updatedConv.isLive !== selectedConv.isLive ||
                    updatedConv.meetingUrl !== selectedConv.meetingUrl
                ) {
                    setSelectedConv(updatedConv);
                }
                if (updatedConv.unreadCount && updatedConv.unreadCount > 0) {
                    markAsRead(selectedConv.id);
                }
            }
        }
    }, [conversations, selectedConv, markAsRead]);

    // Mobile Back Button Handling
    useEffect(() => {
        // When opening a chat, add a hash to the URL to create a history entry
        if (selectedConv) {
            if (window.location.hash !== '#chat') {
                window.history.pushState({ chatOpen: true }, '', '#chat');
            }
        } else {
            // When closing chat (programmatically), clean up the hash if it exists
            if (window.location.hash === '#chat') {
                window.history.replaceState(null, '', window.location.pathname + window.location.search);
            }
        }
    }, [selectedConv?.id]); // Only run when the specific conversation ID changes or becomes null

    useEffect(() => {
        const handlePopState = () => {
            // If the user pressed back and removed the '#chat' hash, close the chat window
            if (!window.location.hash.includes('chat') && selectedConv) {
                setSelectedConv(null);
            }
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [selectedConv]);

    return (
        <div className={cn(
            "flex overflow-hidden bg-gray-50/50 dark:bg-gray-950/50",
            // Mobile: Fixed Full Screen Overlay (Treat as separate app view)
            "fixed inset-0 z-50 lg:static lg:z-auto",
            "h-[100dvh] lg:h-screen lg:py-4 lg:px-4 lg:gap-4"
        )}>
            <ChatSidebar
                conversations={conversations}
                selectedConv={selectedConv}
                setSelectedConv={setSelectedConv}
                currentUser={currentUser}
                openGroupSettings={openGroupSettings}
                confirmDeleteConversation={confirmDeleteConversation}
                setShowNewChatModal={setShowNewChatModal}
                confirmDeleteAllConversations={confirmDeleteAllConversations}
                setIsEditingGroup={setIsEditingGroup}
                logout={logout}
                requestDesktopNotifications={requestDesktopNotifications}
                typingUsers={typingUsers}
            />

            {view === 'chat' ? (
                selectedConv ? (
                    <div className="flex-1 flex overflow-hidden" data-active-conv-id={selectedConv.id}>
                        <ChatWindow
                            selectedConv={selectedConv}
                            messages={messages}
                            newMessage={newMessage}
                            setNewMessage={setNewMessage}
                            handleSendMessage={handleSendMessage}
                            isSending={isSending}
                            currentUser={currentUser}
                            setSelectedConv={setSelectedConv}
                            openGroupSettings={() => openGroupSettings()}
                            confirmDeleteConversation={confirmDeleteConversation}
                            showMoreMenu={showMoreMenu}
                            setShowMoreMenu={setShowMoreMenu}
                            menuRef={menuRef}
                            setTyping={setTyping}
                            toggleLiveStatus={toggleLiveStatus}
                        />
                    </div>
                ) : (
                    <div className="hidden lg:flex flex-1 flex-col items-center justify-center text-center p-12 bg-white/30 dark:bg-gray-950/30 backdrop-blur-md border border-white dark:border-gray-900 rounded-none shadow-sm">
                        <div className="w-32 h-32 bg-primary-600/10 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400 rounded-none flex items-center justify-center mb-8 relative">
                            <div className="absolute inset-0 bg-primary-600/20 rounded-none animate-pulse"></div>
                            <Share2 size={56} className="relative z-10" />
                        </div>
                        <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-4 tracking-tighter uppercase">مرحباً بك في مركز التواصل</h2>
                        <p className="text-gray-500 dark:text-gray-400 font-bold max-w-sm leading-relaxed text-lg">اختر محادثة من القائمة الجانبية للبدء في التواصل مع أعضاء المعهد بشكل مباشر وآمن</p>
                    </div>
                )
            ) : (
                <div className={cn("flex-1", selectedConv && "hidden lg:block")}>
                    <ChatManagement
                        profiles={profiles}
                        setEditingProfile={setEditingProfile}
                        setProfileData={setProfileData}
                        setShowProfileForm={setShowProfileForm}
                        confirmDeleteProfile={confirmDeleteProfile}
                    />
                </div>
            )}

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
                showProfileForm={showProfileForm}
                setShowProfileForm={setShowProfileForm}
                editingProfile={editingProfile}
                profileData={profileData}
                setProfileData={setProfileData}
                isSavingProfile={isSavingProfile}
                handleSaveProfile={handleSaveProfile}
                showDeleteConfirm={showDeleteConfirm}
                setShowDeleteConfirm={setShowDeleteConfirm}
                deleteType={deleteType as any}
                itemToDelete={itemToDelete}
                setItemToDelete={setItemToDelete}
                isDeleting={isDeleting}
                handleDeleteAction={handleDeleteAction}
            />
        </div>
    );
};
