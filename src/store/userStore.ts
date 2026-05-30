import { create } from 'zustand';
import { api } from '../lib/api';
import type { User } from '../types/auth';

interface UserState {
    users: User[];
    isLoading: boolean;
    error: string | null;
    fetchUsers: () => Promise<void>;
    addUser: (user: Omit<User, 'id' | 'avatar'>) => Promise<void>;
    editUser: (id: string, updates: Partial<User>) => Promise<void>;
    deleteUser: (id: string) => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
    users: [],
    isLoading: false,
    error: null,

    fetchUsers: async () => {
        try {
            set({ isLoading: true, error: null });
            const data = await api.get<User[]>('/system/users');
            set({ users: data, isLoading: false });
        } catch (e) {
            set({ error: e instanceof Error ? e.message : 'فشل جلب المستخدمين', isLoading: false });
        }
    },

    addUser: async (newUser) => {
        const id = `user_${Date.now()}`;
        await api.post('/system/users', { ...newUser, id });
        await get().fetchUsers();
    },

    editUser: async (id, updates) => {
        const { users } = get();
        const userToUpdate = users.find(u => u.id === id);
        if (!userToUpdate) return;
        await api.put(`/system/users/${id}`, { ...userToUpdate, ...updates });
        set((state) => ({
            users: state.users.map(u => u.id === id ? { ...u, ...updates } : u)
        }));
    },

    deleteUser: async (id) => {
        await api.delete(`/system/users/${id}`);
        set((state) => ({
            users: state.users.filter(u => u.id !== id)
        }));
    }
}));

export const useUsers = () => useUserStore(s => s.users);
export const useAddUser = () => useUserStore(s => s.addUser);
export const useEditUser = () => useUserStore(s => s.editUser);
export const useDeleteUser = () => useUserStore(s => s.deleteUser);
