import { create } from 'zustand';
import type { Conversation, ChatUser, DeleteType } from '../types/chat.types';

interface ChatUIState {
  selectedConv: Conversation | null;
  newMessage: string;
  showMoreMenu: boolean;
  showNewChatModal: boolean;
  isEditingGroup: boolean;
  isCreatingGroup: boolean;
  groupName: string;
  searchUser: string;
  selectedUsers: string[];
  showDeleteConfirm: boolean;
  deleteType: DeleteType;
  itemToDelete: Conversation | ChatUser | { displayName: string } | null;
  isDeleting: boolean;

  setSelectedConv: (conv: Conversation | null) => void;
  setNewMessage: (msg: string) => void;
  setShowMoreMenu: (show: boolean) => void;
  setShowNewChatModal: (show: boolean) => void;
  setIsEditingGroup: (edit: boolean) => void;
  setIsCreatingGroup: (creating: boolean) => void;
  setGroupName: (name: string) => void;
  setSearchUser: (user: string) => void;
  setSelectedUsers: (users: string[]) => void;
  setShowDeleteConfirm: (show: boolean) => void;
  setDeleteType: (type: DeleteType) => void;
  setItemToDelete: (item: Conversation | ChatUser | { displayName: string } | null) => void;
  setIsDeleting: (deleting: boolean) => void;

  resetNewChat: () => void;
}

export const useChatUIStore = create<ChatUIState>((set) => ({
  selectedConv: null,
  newMessage: '',
  showMoreMenu: false,
  showNewChatModal: false,
  isEditingGroup: false,
  isCreatingGroup: false,
  groupName: '',
  searchUser: '',
  selectedUsers: [],
  showDeleteConfirm: false,
  deleteType: 'conversation' as DeleteType,
  itemToDelete: null,
  isDeleting: false,

  setSelectedConv: (selectedConv) => set({ selectedConv }),
  setNewMessage: (newMessage) => set({ newMessage }),
  setShowMoreMenu: (showMoreMenu) => set({ showMoreMenu }),
  setShowNewChatModal: (showNewChatModal) => set({ showNewChatModal }),
  setIsEditingGroup: (isEditingGroup) => set({ isEditingGroup }),
  setIsCreatingGroup: (isCreatingGroup) => set({ isCreatingGroup }),
  setGroupName: (groupName) => set({ groupName }),
  setSearchUser: (searchUser) => set({ searchUser }),
  setSelectedUsers: (selectedUsers) => set({ selectedUsers }),
  setShowDeleteConfirm: (showDeleteConfirm) => set({ showDeleteConfirm }),
  setDeleteType: (deleteType) => set({ deleteType }),
  setItemToDelete: (itemToDelete) => set({ itemToDelete }),
  setIsDeleting: (isDeleting) => set({ isDeleting }),

  resetNewChat: () => set({
    showNewChatModal: false,
    groupName: '',
    searchUser: '',
    selectedUsers: [],
    isEditingGroup: false,
    isCreatingGroup: false,
  }),
}));
