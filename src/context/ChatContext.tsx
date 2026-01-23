import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { socketService } from '../lib/socket';
import { useApp } from './AppContext';
import type { ChatMessage, Conversation } from '../types/chat.types';

interface ChatContextType {
    typingUsers: { conversationId: string; userName: string }[];
    setTyping: (conversationId: string, isTyping: boolean, userName: string) => void;
    totalUnreadCount: number;
    isConnected: boolean;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { currentUser, isAuthenticated } = useApp();
    const queryClient = useQueryClient();
    const [typingUsers, setTypingUsers] = useState<{ conversationId: string; userName: string }[]>([]);
    const [totalUnreadCount, setTotalUnreadCount] = useState(0);
    const [isConnected, setIsConnected] = useState(false);

    const setTyping = useCallback((conversationId: string, isTyping: boolean, userName: string) => {
        if (!isAuthenticated) return;
        socketService.getSocket().emit('typing', { conversationId, userId: currentUser?.id, userName, isTyping });
    }, [isAuthenticated, currentUser]);

    useEffect(() => {
        if (!isAuthenticated || !currentUser) {
            socketService.disconnect();
            return;
        }

        const socket = socketService.getSocket();
        if (!socket) return;

        setIsConnected(socket.connected);

        const onConnect = () => setIsConnected(true);
        const onDisconnect = () => setIsConnected(false);

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);

        const handleNewMessage = (message: ChatMessage) => {
            console.log('📬 Global Socket: New message received:', message);

            // 1. Update messages list if it exists in cache
            queryClient.setQueryData(['messages', message.conversationId], (old: ChatMessage[] = []) => {
                if (!Array.isArray(old)) return [message];
                if (old.find(m => m.id === message.id)) return old;
                return [...old, message];
            });

            // 2. Update conversations list
            queryClient.setQueryData(['conversations', currentUser.id], (old: Conversation[] = []) => {
                if (!Array.isArray(old)) return [];

                const activeConvId = document.querySelector('[data-active-conv-id]')?.getAttribute('data-active-conv-id');
                const isCurrentlyActive = activeConvId === message.conversationId;

                const updated = old.map(conv => {
                    if (conv.id === message.conversationId) {
                        return {
                            ...conv,
                            lastMessage: message.content,
                            lastMessageTime: message.timestamp,
                            unreadCount: isCurrentlyActive ? 0 : (conv.unreadCount || 0) + 1
                        };
                    }
                    return conv;
                });

                // If conversation doesn't exist in list yet (new chat), we might need to refetch or manually add
                // For now, let's just re-sort
                return [...updated].sort((a, b) => {
                    const timeA = new Date(a.lastMessageTime || 0).getTime();
                    const timeB = new Date(b.lastMessageTime || 0).getTime();
                    return timeB - timeA;
                });
            });

            // 3. Update total unread count across all conversations
            // This is better derived from the updated conversations list
        };

        const handleTyping = ({ conversationId: msgConvId, userName, isTyping }: { conversationId: string, userName: string, isTyping: boolean }) => {
            if (msgConvId !== 'global') {
                setTypingUsers(prev => {
                    const others = prev.filter(u => u.conversationId !== msgConvId || u.userName !== userName);
                    if (isTyping) return [...others, { conversationId: msgConvId, userName }];
                    return others;
                });
            }
        };

        const handleNewConversation = (conv: Conversation) => {
            console.log('🆕 Global Socket: New conversation created:', conv);
            queryClient.setQueryData(['conversations', currentUser.id], (old: Conversation[] = []) => {
                if (!Array.isArray(old)) return [conv];
                if (old.find(c => c.id === conv.id)) return old;
                return [conv, ...old];
            });
        };

        socket.on('new_message', handleNewMessage);
        socket.on('typing', handleTyping);
        socket.on('new_conversation', handleNewConversation);

        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.off('new_message', handleNewMessage);
            socket.off('typing', handleTyping);
            socket.off('new_conversation', handleNewConversation);
        };
    }, [isAuthenticated, currentUser, queryClient]);

    // Derived State: Total Unread Count
    useEffect(() => {
        if (!isAuthenticated || !currentUser) return;

        // Listen to conversation cache changes to update global badge
        const conversations = queryClient.getQueryData<Conversation[]>(['conversations', currentUser.id]);
        if (conversations) {
            const total = conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
            setTotalUnreadCount(total);
        }
    }, [isAuthenticated, currentUser, queryClient]);

    return (
        <ChatContext.Provider value={{ typingUsers, setTyping, totalUnreadCount, isConnected }}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChatContext = () => {
    const context = useContext(ChatContext);
    if (!context) throw new Error('useChatContext must be used within a ChatProvider');
    return context;
};
