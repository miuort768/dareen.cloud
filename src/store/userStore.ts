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
        } catch (e: any) {
            console.error("Error fetching users:", e);
            set({ error: e.message || 'فشل جلب المستخدمين', isLoading: false });
        }
    },

    addUser: async (newUser) => {
        try {
            const id = `user_${Date.now()}`;
            await api.post('/system/users', { ...newUser, id });
            await get().fetchUsers();
        } catch (e: any) {
            console.error("Error adding user:", e);
            throw e;
        }
    },

    editUser: async (id, updates) => {
        try {
            const { users } = get();
            const userToUpdate = users.find(u => u.id === id);
            if (!userToUpdate) return;
            
            const updated = { ...userToUpdate, ...updates };
            await api.put(`/system/users/${id}`, updated);
            
            set((state) => ({
                users: state.users.map(u => u.id === id ? updated : u)
            }));
        } catch (e: any) {
            console.error("Error editing user:", e);
            throw e;
        }
    },

    deleteUser: async (id) => {
        try {
            await api.delete(`/system/users/${id}`);
            set((state) => ({
                users: state.users.filter(u => u.id !== id)
            }));
        } catch (e: any) {
            console.error("Error deleting user:", e);
            throw e;
        }
    }
}));
