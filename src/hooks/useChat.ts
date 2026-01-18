import { useEffect } from 'react';
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
                // If message already exists by ID, do nothing
                if (old.find(m => m.id === message.id)) return old;
                return [...old, message];
            });

            // Update conversations list (last message)
            queryClient.setQueryData(['conversations', userId], (old: Conversation[] = []) => {
                return old.map(conv => {
                    if (conv.id === message.conversationId) {
                        return {
                            ...conv,
                            lastMessage: message.content,
                            lastMessageTime: message.timestamp
                        };
                    }
                    return conv;
                });
            });
        };

        socket.on('new_message', handleNewMessage);

        return () => {
            socket.off('new_message', handleNewMessage);
        };
    }, [userId, queryClient]);

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
        refetchConversations
    };
};
