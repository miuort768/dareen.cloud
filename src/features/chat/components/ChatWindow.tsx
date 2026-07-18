import React, { useEffect } from 'react';
import { useChatStore } from '../../../store/chatStore';
import { useChatUIStore } from '../../../store/chatUIStore';
import type { Conversation, ChatMessage } from '../../../types/chat.types';
import type { User } from '../../../types/auth';
import { ChatWindowHeader } from './ChatWindowHeader';
import { ChatMessageList } from './ChatMessageList';
import { ChatInputFooter } from './ChatInputFooter';

interface ChatWindowProps {
    selectedConv: Conversation;
    messages: ChatMessage[];
    isLoadingMessages?: boolean;
    isMessagesError?: boolean;
    handleSendMessage: (e: React.FormEvent) => void;
    isSending: boolean;
    currentUser: User | null;
    openGroupSettings: () => void;
    menuRef: React.RefObject<HTMLDivElement | null>;
    setTyping: (convId: string, isTyping: boolean, name: string) => void;
    markAsRead: (convId: string) => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
    selectedConv, messages, isLoadingMessages, isMessagesError,
    handleSendMessage, isSending, currentUser, openGroupSettings,
    menuRef, setTyping, markAsRead
}) => {
    const newMessage = useChatUIStore(s => s.newMessage);
    const setNewMessage = useChatUIStore(s => s.setNewMessage);
    const showMoreMenu = useChatUIStore(s => s.showMoreMenu);
    const setShowMoreMenu = useChatUIStore(s => s.setShowMoreMenu);
    const setSelectedConv = useChatUIStore(s => s.setSelectedConv);
    const setDeleteType = useChatUIStore(s => s.setDeleteType);
    const setItemToDelete = useChatUIStore(s => s.setItemToDelete);
    const setShowDeleteConfirm = useChatUIStore(s => s.setShowDeleteConfirm);
    const typingUsers = useChatStore(s => s.typingUsers);

    useEffect(() => {
        if (selectedConv?.id && 'unreadCount' in selectedConv && selectedConv.unreadCount > 0) {
            markAsRead(selectedConv.id);
        } else if (selectedConv?.id && messages.length > 0) {
            const lastMsg = messages[messages.length - 1];
            if (lastMsg.senderId !== currentUser?.id) {
                markAsRead(selectedConv.id);
            }
        }
    }, [selectedConv, messages, markAsRead, currentUser?.id]);

    const typingInThisConv = typingUsers.filter(u => u.conversationId === selectedConv.id);

    return (
        <div className="flex-1 flex flex-col bg-background dark:bg-card overflow-hidden relative h-full">
            <div className="absolute inset-0 z-0 opacity-[0.06] dark:opacity-[0.1]"
                style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', backgroundRepeat: 'repeat', backgroundSize: '400px' }} />

            <ChatWindowHeader
                selectedConv={selectedConv}
                currentUser={currentUser}
                openGroupSettings={openGroupSettings}
                menuRef={menuRef}
                onBack={() => setSelectedConv(null)}
                showMoreMenu={showMoreMenu}
                onToggleMoreMenu={() => setShowMoreMenu(!showMoreMenu)}
                onDeleteConversation={() => { setDeleteType('conversation'); setItemToDelete(selectedConv); setShowDeleteConfirm(true); }}
                typingInThisConv={typingInThisConv}
            />

            <ChatMessageList
                messages={messages}
                isLoadingMessages={isLoadingMessages}
                isMessagesError={isMessagesError}
                isGroup={selectedConv.isGroup}
                currentUserId={currentUser?.id}
            />

            <ChatInputFooter
                newMessage={newMessage}
                onMessageChange={setNewMessage}
                onSend={handleSendMessage}
                isSending={isSending}
                currentUser={currentUser}
                conversationId={selectedConv.id}
                onTyping={setTyping}
            />
        </div>
    );
};
