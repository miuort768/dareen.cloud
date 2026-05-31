import { create } from 'zustand';
import { socketService } from '../lib/socket';
import type { LiveSession } from '../types';

interface ChatState {
    typingUsers: { conversationId: string; userName: string }[];
    activeConversationId: string | null;
    isConnected: boolean;
    liveSession: LiveSession | null;

    setTyping: (conversationId: string, isTyping: boolean, userName: string, currentUserId?: string) => void;
    setActiveConversationId: (id: string | null) => void;
    setIsConnected: (connected: boolean) => void;
    setLiveSession: (session: LiveSession | null) => void;
    setTypingUsers: (users: { conversationId: string; userName: string }[]) => void;
}

export const useChatStore = create<ChatState>((set) => ({
    typingUsers: [],
    activeConversationId: null,
    isConnected: false,
    liveSession: null,

    setTyping: (conversationId, isTyping, userName, currentUserId) => {
        const socket = socketService.getSocket();
        if (socket) {
            socket.emit('typing', { conversationId, userId: currentUserId, userName, isTyping });
        }
    },

    setActiveConversationId: (id) => {
        set({ activeConversationId: id });
    },

    setIsConnected: (connected) => {
        set({ isConnected: connected });
    },

    setLiveSession: (session) => {
        set({ liveSession: session });
    },

    setTypingUsers: (users) => {
        set({ typingUsers: users });
    },
}));
