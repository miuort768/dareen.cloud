import { create } from 'zustand';

interface UnreadState {
    totalUnreadCount: number;
    activeConversationId: string | null;
    setTotalUnreadCount: (count: number) => void;
    setActiveConversationId: (id: string | null) => void;
}

export const useUnreadStore = create<UnreadState>((set) => ({
    totalUnreadCount: 0,
    activeConversationId: null,
    setTotalUnreadCount: (count) => set({ totalUnreadCount: count }),
    setActiveConversationId: (id) => set({ activeConversationId: id }),
}));
