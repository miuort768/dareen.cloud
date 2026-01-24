export interface ChatMessage {
    id: string;
    conversationId: string;
    senderId: string;
    senderName: string;
    content: string;
    timestamp: string;
}

export interface Conversation {
    id: string;
    name: string | null;
    displayName: string;
    isGroup: boolean;
    lastMessage: string | null;
    lastMessageTime: string | null;
    members: string[];
    unreadCount?: number;
}

export interface ChatUser {
    id: string;
    name: string;
    username: string;
    type: string;
    avatar?: string;
}

export type ChatView = 'chat' | 'management';
export type DeleteType = 'conversation' | 'profile' | 'all_conversations';
