import { createContext, useState, useEffect, useContext, type ReactNode } from 'react';
import { API_BASE_URL } from '../config/api';
import type { User } from '../types/auth';

interface UserContextType {
    users: User[];
    addUser: (user: Omit<User, 'id' | 'avatar'>) => Promise<void>;
    editUser: (id: string, updates: Partial<User>) => Promise<void>;
    deleteUser: (id: string) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
    const [users, setUsers] = useState<User[]>([]);

    const fetchUsers = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/system/users`);
            if (res.ok) setUsers(await res.json());
        } catch (e) { console.error("Error fetching users:", e); }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const addUser = async (newUser: Omit<User, 'id' | 'avatar'>) => {
        try {
            const id = crypto.randomUUID();
            await fetch(`${API_BASE_URL}/system/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...newUser, id })
            });
            await fetchUsers();
        } catch (e) { console.error("Error adding user:", e); }
    };

    const editUser = async (id: string, updates: Partial<User>) => {
        try {
            const userToUpdate = users.find(u => u.id === id);
            if (!userToUpdate) return;
            const updated = { ...userToUpdate, ...updates };
            await fetch(`${API_BASE_URL}/system/users/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updated)
            });
            await fetchUsers();
        } catch (e) { console.error("Error editing user:", e); }
    };

    const deleteUser = async (id: string) => {
        try {
            await fetch(`${API_BASE_URL}/system/users/${id}`, {
                method: 'DELETE'
            });
            setUsers(prev => prev.filter(u => u.id !== id));
        } catch (e) { console.error("Error deleting user:", e); }
    };

    return (
        <UserContext.Provider value={{ users, addUser, editUser, deleteUser }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUsers = () => {
    const context = useContext(UserContext);
    if (!context) throw new Error('useUsers must be used within a UserProvider');
    return context;
};
