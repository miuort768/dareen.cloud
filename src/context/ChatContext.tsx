import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { socketService } from '../lib/socket';
import { useApp } from './AppContext';
import { api } from '../lib/api';
import { sendNativeNotification, playNotificationSound } from '../lib/notificationUtils';
import type { ChatMessage, Conversation } from '../types/chat.types';

interface ChatContextType {
    typingUsers: { conversationId: string; userName: string }[];
    setTyping: (conversationId: string, isTyping: boolean, userName: string) => void;
    activeConversationId: string | null;
    setActiveConversationId: (id: string | null) => void;
    totalUnreadCount: number;
    isConnected: boolean;
    liveSession: any | null;
}


const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { currentUser, isAuthenticated } = useApp();
    const queryClient = useQueryClient();
    const [typingUsers, setTypingUsers] = useState<{ conversationId: string; userName: string }[]>([]);
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
    const activeConvRef = React.useRef<string | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [liveSession, setLiveSession] = useState<any | null>(null);


    // Reactive Conversations Query (Shared with useChat hooks)
    const { data: conversations = [] } = useQuery<Conversation[]>({
        queryKey: ['conversations', String(currentUser?.id)],
        queryFn: async () => {
            if (!currentUser?.id) return [];
            return api.get<Conversation[]>(`/chat/conversations?userId=${currentUser.id}`);
        },
        enabled: isAuthenticated && !!currentUser?.id,
        staleTime: 30000, // 30 seconds
    });

    // Derive total unread count reactively from query data
    const totalUnreadCount = Array.isArray(conversations) 
        ? conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0) 
        : 0;

    React.useEffect(() => {
        activeConvRef.current = activeConversationId;
        
        // Optimistically clear unread count for the active conversation
        if (activeConversationId && currentUser?.id) {
            queryClient.setQueryData(['conversations', String(currentUser.id)], (old: any) => {
                if (!Array.isArray(old)) return old;
                return old.map((conv: any) => 
                    conv.id === activeConversationId ? { ...conv, unreadCount: 0 } : conv
                );
            });
        }
    }, [activeConversationId, currentUser?.id, queryClient]);

    const setTyping = useCallback((conversationId: string, isTyping: boolean, userName: string) => {
        if (!isAuthenticated) return;
        socketService.getSocket().emit('typing', { conversationId, userId: currentUser?.id, userName, isTyping });
    }, [isAuthenticated, currentUser]);

    useEffect(() => {
        if (!isAuthenticated || !currentUser) {
            socketService.disconnect();
            setIsConnected(false);
            return;
        }

        const socket = socketService.getSocket();
        if (!socket) return;
        (window as any).socket = socket;

        // Ensure currentUserId is a string for consistent cache keys
        const currentUserId = String(currentUser.id);

        const onConnect = () => {
            // console.log('✅ Chat Socket connected');
            setIsConnected(true);
        };
        const onDisconnect = () => {
            // console.log('❌ Chat Socket disconnected');
            setIsConnected(false);
        };
        const onConnectError = (err: any) => {
            console.error('⚠️ Chat Socket connection error:', err);
            setIsConnected(false);
        };

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on('connect_error', onConnectError);

        // Update initial state
        setIsConnected(socket.connected);

        // Internal map to track timeouts for typing indicators
        const typingTimeouts: Record<string, any> = {};

        const handleTyping = ({ conversationId: msgConvId, userName, isTyping }: { conversationId: string, userName: string, isTyping: boolean }) => {
            if (msgConvId !== 'global') {
                const key = `${msgConvId}_${userName}`;

                // Clear existing timeout if any
                if (typingTimeouts[key]) {
                    clearTimeout(typingTimeouts[key]);
                }

                setTypingUsers(prev => {
                    const others = prev.filter(u => u.conversationId !== msgConvId || u.userName !== userName);
                    if (isTyping) return [...others, { conversationId: msgConvId, userName }];
                    return others;
                });

                // Auto-clear after 4 seconds if no "stop typing" event is received
                if (isTyping) {
                    typingTimeouts[key] = setTimeout(() => {
                        setTypingUsers(prev => prev.filter(u => u.conversationId !== msgConvId || u.userName !== userName));
                        delete typingTimeouts[key];
                    }, 4000);
                }
            }
        };

        const handleNewMessage = (message: ChatMessage) => {
            // console.log('📬 Global Socket: New message received:', message);

            // Immediately clear typing status for the person who just sent a message
            setTypingUsers(prev => prev.filter(u => u.conversationId !== message.conversationId || u.userName !== message.senderName));

            // 1. Update messages list cache
            queryClient.setQueryData(['messages', message.conversationId], (old: any) => {
                const messages = Array.isArray(old) ? old : [];
                if (messages.find((m: any) => m.id === message.id)) return messages;
                return [...messages, message];
            });

            // 2. Update conversations list cache
            queryClient.setQueryData(['conversations', currentUserId], (old: any) => {
                const conversations = Array.isArray(old) ? old : [];
                const isCurrentlyActive = activeConvRef.current === message.conversationId;

                const updated = conversations.map((conv: any) => {
                    if (conv.id === message.conversationId) {
                        const isFromOthers = String(message.senderId) !== currentUserId;
                        return {
                            ...conv,
                            lastMessage: message.content,
                            lastMessageTime: message.timestamp,
                            unreadCount: isCurrentlyActive ? 0 : (isFromOthers ? (conv.unreadCount || 0) + 1 : conv.unreadCount)
                        };
                    }
                    return conv;
                });
// ... (omitted sorting logic for brevity in chunk but it stays)
                return [...updated].sort((a: any, b: any) => {
                    const timeA = new Date(a.lastMessageTime || 0).getTime();
                    const timeB = new Date(b.lastMessageTime || 0).getTime();
                    return timeB - timeA;
                });
            });

            // 3. Fallback: Invalidate to ensure freshness
            queryClient.invalidateQueries({ queryKey: ['conversations', currentUserId] });
            queryClient.invalidateQueries({ queryKey: ['messages', message.conversationId] });

            // 4. Send Native Notification & Play Sound
            const isCurrentlyActive = activeConvRef.current === message.conversationId;
            const isFromOthers = String(message.senderId) !== currentUserId;

            if (isFromOthers) {
                // Play strong sound effect only if we are receiving it
                if (!isCurrentlyActive || document.visibilityState === 'hidden') {
                    playNotificationSound();
                    sendNativeNotification(`رسالة جديدة من ${message.senderName}`, {
                        body: message.content,
                        tag: message.conversationId, // Group notifications from same chat
                        // @ts-ignore
                        renotify: true
                    });
                }
            }
        };

        const handleNewConversation = (conv: Conversation) => {
            // console.log('🆕 Global Socket: New conversation created:', conv);
            queryClient.setQueryData(['conversations', currentUserId], (old: any) => {
                const conversations = Array.isArray(old) ? old : [];
                if (conversations.find((c: any) => c.id === conv.id)) return conversations;
                return [conv, ...conversations];
            });
            queryClient.invalidateQueries({ queryKey: ['conversations', currentUserId] });
        };

        const handleSessionInvite = (data: any) => {
            console.log('💎 Live session invite received:', data);
            setLiveSession(data);
        };

        const handleSessionEnded = () => {
            console.log('🛑 Live session ended');
            setLiveSession(null);
        };

        socket.on('new_message', handleNewMessage);
        socket.on('typing', handleTyping);
        socket.on('new_conversation', handleNewConversation);
        socket.on('session_invite', handleSessionInvite);
        socket.on('session_ended', handleSessionEnded);


        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.off('connect_error', onConnectError);
            socket.off('new_message', handleNewMessage);
            socket.off('typing', handleTyping);
            socket.off('new_conversation', handleNewConversation);
            socket.off('session_invite', handleSessionInvite);
            socket.off('session_ended', handleSessionEnded);

        };
    }, [isAuthenticated, currentUser, queryClient]);

    // Derived State: Total Unread Count is now calculated reactively above
    // No manual useEffect needed anymore

    return (
        <ChatContext.Provider value={{ typingUsers, setTyping, activeConversationId, setActiveConversationId, totalUnreadCount, isConnected, liveSession }}>
            {children}
        </ChatContext.Provider>

    );
};

export const useChatContext = () => {
    const context = useContext(ChatContext);
    if (!context) throw new Error('useChatContext must be used within a ChatProvider');
    return context;
};
