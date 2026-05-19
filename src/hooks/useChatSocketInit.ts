import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { socketService } from '../lib/socket';
import { useApp } from '../context/useApp';
import { useChatStore } from '../store/chatStore';

export const useChatSocketInit = () => {
    const { isAuthenticated, currentUser } = useApp();
    const queryClient = useQueryClient();
    const typingTimeoutsRef = useRef<Record<string, NodeJS.Timeout>>({});
    
    const setTyping = useChatStore(s => s.setTyping);
    const setLiveSession = useChatStore(s => s.setLiveSession);
    const activeConversationId = useChatStore(s => s.activeConversationId);
    // Since activeConversationId from hook can be stale inside socket callbacks, use a ref
    const activeConvRef = useRef(activeConversationId);

    useEffect(() => {
        activeConvRef.current = activeConversationId;
    }, [activeConversationId]);

    useEffect(() => {
        if (!isAuthenticated || !currentUser) return;
        const currentUserId = String(currentUser.id);

        const socket = socketService.connect(currentUserId);
        if (!socket) return;

        // --- Notification Audio ---
        let audio: HTMLAudioElement | null = null;
        try {
            audio = new Audio('/notification.mp3');
        } catch (e) {
            console.error('Audio initialization failed', e);
        }

        const playNotificationSound = () => {
            if (audio) {
                audio.currentTime = 0;
                const playPromise = audio.play();
                if (playPromise !== undefined) {
                    playPromise.catch(error => console.warn('Autoplay prevented:', error));
                }
            }
        };

        const sendNativeNotification = (title: string, options?: NotificationOptions) => {
            if (!("Notification" in window)) return;
            if (Notification.permission === "granted") {
                try {
                    new Notification(title, options);
                } catch (e) {
                    console.warn('Native notification failed', e);
                }
            }
        };

        const handleTyping = (data: { conversationId: string; userId: string; userName: string; isTyping: boolean }) => {
            // Only tracking typing for current conversation or general
            useChatStore.getState().setTypingUsers(
                useChatStore.getState().typingUsers.filter(t => t.conversationId !== data.conversationId || t.userName !== data.userName)
            );

            if (data.isTyping) {
                useChatStore.getState().setTypingUsers([
                    ...useChatStore.getState().typingUsers,
                    { conversationId: data.conversationId, userName: data.userName }
                ]);

                if (typingTimeoutsRef.current[data.userId]) {
                    clearTimeout(typingTimeoutsRef.current[data.userId]);
                }

                typingTimeoutsRef.current[data.userId] = setTimeout(() => {
                    useChatStore.getState().setTypingUsers(
                        useChatStore.getState().typingUsers.filter(t => t.conversationId !== data.conversationId || t.userName !== data.userName)
                    );
                }, 3000);
            }
        };

        const handleNewMessage = (message: any) => {
            // 1. Update messages cache
            queryClient.setQueryData(['messages', message.conversationId], (old: any) => {
                const msgs = Array.isArray(old) ? old : [];
                if (msgs.find((m: any) => m.id === message.id)) return msgs;
                return [...msgs, message];
            });

            // 2. Update conversations cache
            queryClient.setQueryData(['conversations', currentUserId], (old: any) => {
                const conversations = Array.isArray(old) ? old : [];
                const updated = conversations.map((conv: any) => {
                    if (conv.id === message.conversationId) {
                        const isCurrentlyActive = activeConvRef.current === message.conversationId;
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

                return [...updated].sort((a: any, b: any) => {
                    const timeA = new Date(a.lastMessageTime || 0).getTime();
                    const timeB = new Date(b.lastMessageTime || 0).getTime();
                    return timeB - timeA;
                });
            });

            queryClient.invalidateQueries({ queryKey: ['conversations', currentUserId] });
            queryClient.invalidateQueries({ queryKey: ['messages', message.conversationId] });

            // 4. Notifications
            const isCurrentlyActive = activeConvRef.current === message.conversationId;
            const isFromOthers = String(message.senderId) !== currentUserId;

            if (isFromOthers) {
                if (!isCurrentlyActive || document.visibilityState === 'hidden') {
                    playNotificationSound();
                    sendNativeNotification(`رسالة جديدة من ${message.senderName}`, {
                        body: message.content,
                        tag: message.conversationId,
                        // @ts-ignore
                        renotify: true
                    });
                }
            }
        };

        const handleNewConversation = (conv: any) => {
            queryClient.setQueryData(['conversations', currentUserId], (old: any) => {
                const conversations = Array.isArray(old) ? old : [];
                if (conversations.find((c: any) => c.id === conv.id)) return conversations;
                return [conv, ...conversations];
            });
            queryClient.invalidateQueries({ queryKey: ['conversations', currentUserId] });
        };

        const handleSessionInvite = (data: any) => {
            setLiveSession(data);
        };

        const handleSessionEnded = () => {
            setLiveSession(null);
        };

        socket.on('new_message', handleNewMessage);
        socket.on('typing', handleTyping);
        socket.on('new_conversation', handleNewConversation);
        socket.on('session_invite', handleSessionInvite);
        socket.on('session_ended', handleSessionEnded);

        return () => {
            socket.off('new_message', handleNewMessage);
            socket.off('typing', handleTyping);
            socket.off('new_conversation', handleNewConversation);
            socket.off('session_invite', handleSessionInvite);
            socket.off('session_ended', handleSessionEnded);
            
            Object.values(typingTimeoutsRef.current).forEach(timeout => clearTimeout(timeout));
        };
    }, [isAuthenticated, currentUser, queryClient, setLiveSession]);

};
