import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { socketService } from '../lib/socket';
import type { ChatMessage, Conversation, ChatUser } from '../types/chat.types';

export const useChat = (userId?: string) => {
    const queryClient = useQueryClient();

    // Socket listeners setup
    useEffect(() => {
        if (!userId) return;

        const socket = socketService.getSocket();

        const handleNewMessage = (message: ChatMessage) => {
            // Update messages for specific conversation
            queryClient.setQueryData(['messages', message.conversationId], (old: ChatMessage[] = []) => {
                if (!Array.isArray(old)) return [message];
                if (old.find(m => m.id === message.id)) return old;
                return [...old, message];
            });

            // Update conversations list (last message, unread count, and SORTING)
            queryClient.setQueryData(['conversations', userId], (old: Conversation[] = []) => {
                if (!Array.isArray(old)) return [];
                const activeConvId = document.querySelector('[data-active-conv-id]')?.getAttribute('data-active-conv-id');

                const updated = old.map(conv => {
                    if (conv.id === message.conversationId) {
                        const isCurrentlyActive = activeConvId === conv.id;
                        return {
                            ...conv,
                            lastMessage: message.content,
                            lastMessageTime: message.timestamp,
                            unreadCount: isCurrentlyActive ? 0 : (conv.unreadCount || 0) + 1
                        };
                    }
                    return conv;
                });

                // Re-sort: Latest message time first
                return [...updated].sort((a, b) => {
                    const timeA = new Date(a.lastMessageTime || 0).getTime();
                    const timeB = new Date(b.lastMessageTime || 0).getTime();
                    return timeB - timeA;
                });
            });
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
            queryClient.setQueryData(['conversations', userId], (old: Conversation[] = []) => {
                if (!Array.isArray(old)) return [conv];
                if (old.find(c => c.id === conv.id)) return old;
                return [conv, ...old];
            });
        };

        socket.on('new_message', handleNewMessage);
        socket.on('typing', handleTyping);
        socket.on('new_conversation', handleNewConversation);

        return () => {
            socket.off('new_message', handleNewMessage);
            socket.off('typing', handleTyping);
            socket.off('new_conversation', handleNewConversation);
        };
    }, [userId, queryClient]);

    const [typingUsers, setTypingUsers] = useState<{ conversationId: string, userName: string }[]>([]);

    const setTyping = (conversationId: string, isTyping: boolean, userName: string) => {
        socketService.getSocket().emit('typing', { conversationId, userId, userName, isTyping });
    };

    // Fetch conversations
    const { data: conversations = [], isLoading: isLoadingConversations, refetch: refetchConversations } = useQuery<Conversation[]>({
        queryKey: ['conversations', userId],
        queryFn: async () => {
            if (!userId) return [];
            return api.get<Conversation[]>(`/chat/conversations?userId=${userId}`);
        },
        enabled: !!userId,
        staleTime: 60000,
    });

    // Fetch messages helper hook
    const useMessages = (conversationId?: string) => {
        useEffect(() => {
            if (conversationId) {
                socketService.joinConversation(conversationId);
            }
            return () => {
                if (conversationId) socketService.leaveConversation(conversationId);
            };
        }, [conversationId]);

        return useQuery<ChatMessage[]>({
            queryKey: ['messages', conversationId],
            queryFn: async () => {
                if (!conversationId) return [];
                return api.get<ChatMessage[]>(`/chat/conversations/${conversationId}/messages`);
            },
            enabled: !!conversationId,
            staleTime: 300000,
        });
    };

    // Fetch available users
    const { data: availableUsers = [] } = useQuery<ChatUser[]>({
        queryKey: ['chat-users'],
        queryFn: async () => {
            return api.get<ChatUser[]>('/chat/users');
        },
    });

    // Fetch management profiles
    const { data: profiles = [] } = useQuery<ChatUser[]>({
        queryKey: ['chat-profiles'],
        queryFn: async () => {
            return api.get<ChatUser[]>('/chat/profiles');
        },
    });

    // Send Message Mutation with Optimistic Updates
    const sendMessageMutation = useMutation({
        mutationFn: async ({ conversationId, content, senderId, senderName }: { conversationId: string, content: string, senderId: string, senderName: string }) => {
            return api.post<ChatMessage>(`/chat/conversations/${conversationId}/messages`, { senderId, senderName, content });
        },
        onMutate: async (newMessage) => {
            await queryClient.cancelQueries({ queryKey: ['messages', newMessage.conversationId] });
            const previousMessages = queryClient.getQueryData<ChatMessage[]>(['messages', newMessage.conversationId]);
            const tempId = `temp-${Date.now()}`;

            if (previousMessages) {
                queryClient.setQueryData(['messages', newMessage.conversationId], [
                    ...previousMessages,
                    {
                        id: tempId,
                        ...newMessage,
                        timestamp: new Date().toISOString()
                    }
                ]);
            }
            return { previousMessages, tempId };
        },
        onSuccess: (data: ChatMessage, _variables, context) => {
            // Check if the real message already exists (from socket)
            // If it does, we just need to remove the temp message
            // If not, we replace the temp message with the real one
            if (context?.tempId) {
                queryClient.setQueryData(['messages', data.conversationId], (old: ChatMessage[] = []) => {
                    const realExists = old.find(m => m.id === data.id);
                    if (realExists) {
                        // Real message arrived via socket already -> Remove temp
                        return old.filter(m => m.id !== context.tempId);
                    } else {
                        // Real message not here yet -> Swap temp with real
                        return old.map(msg => msg.id === context.tempId ? data : msg);
                    }
                });
            }
        },
        onError: (_err, newMessage, context) => {
            if (context?.previousMessages) {
                queryClient.setQueryData(['messages', newMessage.conversationId], context.previousMessages);
            }
        }
    });

    // Create Direct Chat
    const createDirectChatMutation = useMutation({
        mutationFn: async (targetUserId: string) => {
            return api.post<Conversation>('/chat/conversations', {
                members: [userId, targetUserId],
                isGroup: false,
                createdBy: userId
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['conversations', userId] });
        }
    });

    // Create/Edit Group
    const saveGroupMutation = useMutation({
        mutationFn: async ({ id, name, members, isGroup }: { id?: string, name: string, members: string[], isGroup: boolean }) => {
            const endpoint = id ? `/chat/conversations/${id}` : '/chat/conversations';
            const method = id ? 'put' : 'post';
            return api[method](endpoint, { name, members: [...new Set([userId, ...members])].filter(Boolean), isGroup, createdBy: userId });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['conversations', userId] });
        }
    });

    // Delete Conversation
    const deleteConversationMutation = useMutation({
        mutationFn: async (id: string) => {
            return api.delete(`/chat/conversations/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['conversations', userId] });
        }
    });

    // Delete All Conversations
    const deleteAllConversationsMutation = useMutation({
        mutationFn: async () => {
            return api.delete('/chat/conversations/all');
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['conversations', userId] });
        }
    });

    // Mark as Read
    const markAsReadMutation = useMutation({
        mutationFn: async (id: string) => {
            return api.post(`/chat/conversations/${id}/read`);
        },
        onSuccess: (_data, id) => {
            queryClient.setQueryData(['conversations', userId], (old: Conversation[] = []) => {
                return (old || []).map(conv => conv.id === id ? { ...conv, unreadCount: 0 } : conv);
            });
        }
    });

    return {
        conversations,
        isLoadingConversations,
        availableUsers,
        profiles,
        useMessages,
        sendMessage: sendMessageMutation.mutate,
        isSending: sendMessageMutation.isPending,
        createDirectChat: createDirectChatMutation.mutateAsync,
        saveGroup: saveGroupMutation.mutateAsync,
        deleteConversation: deleteConversationMutation.mutateAsync,
        deleteAllConversations: deleteAllConversationsMutation.mutateAsync,
        refetchConversations,
        typingUsers,
        setTyping,
        markAsRead: markAsReadMutation.mutate
    };
};
