import React, { useState, useRef, useEffect } from 'react';
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
import { ChatModals } from '../features/chat/components/ChatModals';

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
    } = useChat(currentUser?.id);

    // UI State
    const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
    const [view, setView] = useState<ChatView>('chat');
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
    const [profileData, setProfileData] = useState({ name: '', username: '', password: '' });
    const [isSavingProfile, setIsSavingProfile] = useState(false);

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteType, setDeleteType] = useState<DeleteType | 'all_conversations'>('conversation');
    const [itemToDelete, setItemToDelete] = useState<any>(null);
    const [isDeleting, setIsDeleting] = useState(false);

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
    }, [availableUsers, conversations, searchParams, currentUser, location.state]);

    // HANDLERS
    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedConv || !currentUser) return;

        sendMessage({
            conversationId: selectedConv.id,
            content: newMessage,
            senderId: currentUser.id,
            senderName: currentUser.name
        });
        setNewMessage('');
    };

    const handleCreateDirectChat = async (targetUserId: string) => {
        try {
            const newConv = await createDirectChat(targetUserId);
            setSelectedConv(newConv);
            setShowNewChatModal(false);
        } catch (error) {
            console.error("Error creating chat:", error);
        }
    };

    const handleCreateConversation = async () => {
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
    };

    const openGroupSettings = (conv?: Conversation) => {
        const target = conv || selectedConv;
        if (!target || !target.isGroup) return;
        setGroupName(target.displayName || '');
        setSelectedUsers(target.members.filter(id => id !== currentUser?.id));
        setIsCreatingGroup(true);
        setIsEditingGroup(true);
        setShowNewChatModal(true);
    };

    const handleSaveProfile = async (e: React.FormEvent) => {
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
    };

    const handleDeleteAction = async () => {
        if (!itemToDelete) return;
        setIsDeleting(true);

        try {
            if (deleteType === 'conversation') {
                await deleteConversation(itemToDelete.id);
                if (selectedConv?.id === itemToDelete.id) setSelectedConv(null);
            } else if (deleteType === 'all_conversations') {
                await deleteAllConversations();
                setSelectedConv(null);
            } else {
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
    };

    const confirmDeleteConversation = (conv: Conversation) => {
        setDeleteType('conversation');
        setItemToDelete(conv);
        setShowDeleteConfirm(true);
    };

    const confirmDeleteProfile = (id: string) => {
        const profile = profiles.find(p => p.id === id);
        setDeleteType('profile');
        setItemToDelete(profile);
        setShowDeleteConfirm(true);
    };

    const confirmDeleteAllConversations = () => {
        setDeleteType('all_conversations');
        setItemToDelete({ displayName: 'كافة المحادثات' });
        setShowDeleteConfirm(true);
    };

    const requestDesktopNotifications = async () => {
        if (!('Notification' in window)) return false;
        if (Notification.permission === 'granted') return true;
        const result = await Notification.requestPermission();
        return result === 'granted';
    };

    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden lg:h-screen lg:py-4 lg:px-4 lg:gap-4 bg-gray-50/50 dark:bg-gray-950/50">
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
                setView={setView}
                view={view}
                logout={logout}
                requestDesktopNotifications={requestDesktopNotifications}
            />

            {view === 'chat' ? (
                selectedConv ? (
                    <ChatWindow
                        selectedConv={selectedConv}
                        messages={messages}
                        newMessage={newMessage}
                        setNewMessage={setNewMessage}
                        handleSendMessage={handleSendMessage}
                        sendMessage={sendMessage}
                        isSending={isSending}
                        currentUser={currentUser}
                        setSelectedConv={setSelectedConv}
                        openGroupSettings={() => openGroupSettings()}
                        confirmDeleteConversation={confirmDeleteConversation}
                        showMoreMenu={showMoreMenu}
                        setShowMoreMenu={setShowMoreMenu}
                        menuRef={menuRef}
                    />
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
