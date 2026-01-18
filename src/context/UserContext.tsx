import { createContext, useState, useEffect, useContext, type ReactNode } from 'react';
import { api } from '../lib/api';
import type { User } from '../types/auth';

interface UserContextType {
    users: User[];
    addUser: (user: Omit<User, 'id' | 'avatar'>) => Promise<void>;
    editUser: (id: string, updates: Partial<User>) => Promise<void>;
    deleteUser: (id: string) => Promise<void>;
    refreshUsers: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
    const [users, setUsers] = useState<User[]>([]);

    const fetchUsers = async () => {
        try {
            const data = await api.get<User[]>('/system/users');
            setUsers(data);
        } catch (e) {
            console.error("Error fetching users:", e);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const addUser = async (newUser: Omit<User, 'id' | 'avatar'>) => {
        try {
            const id = `user_${Date.now()}`;
            await api.post('/system/users', { ...newUser, id });
            await fetchUsers();
        } catch (e) {
            console.error("Error adding user:", e);
            throw e;
        }
    };

    const editUser = async (id: string, updates: Partial<User>) => {
        try {
            const userToUpdate = users.find(u => u.id === id);
            if (!userToUpdate) return;
            const updated = { ...userToUpdate, ...updates };
            await api.put(`/system/users/${id}`, updated);
            await fetchUsers();
        } catch (e) {
            console.error("Error editing user:", e);
            throw e;
        }
    };

    const deleteUser = async (id: string) => {
        try {
            await api.delete(`/system/users/${id}`);
            setUsers(prev => prev.filter(u => u.id !== id));
        } catch (e) {
            console.error("Error deleting user:", e);
            throw e;
        }
    };

    return (
        <UserContext.Provider value={{ users, addUser, editUser, deleteUser, refreshUsers: fetchUsers }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUsers = () => {
    const context = useContext(UserContext);
    if (!context) throw new Error('useUsers must be used within a UserProvider');
    return context;
};
