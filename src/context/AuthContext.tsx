import { useEffect, type ReactNode } from 'react';
import { useAuthStore } from '../store/authStore';
import type { User } from '../types/auth';

interface AuthContextType {
    currentUser: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (username: string, password?: string) => Promise<boolean>;
    logout: () => void;
    updateCurrentUser: (updates: Partial<User>) => Promise<void>;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const verifyToken = useAuthStore((s) => s.verifyToken);

    useEffect(() => {
        verifyToken();
    }, [verifyToken]);

    return <>{children}</>;
};

export const useAuth = (): AuthContextType => {
    const store = useAuthStore();
    return {
        currentUser: store.currentUser,
        isAuthenticated: store.isAuthenticated,
        isLoading: store.isLoading,
        login: store.login,
        logout: store.logout,
        updateCurrentUser: store.updateCurrentUser
    };
};
