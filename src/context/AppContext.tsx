import { createContext, useState, type ReactNode } from 'react';
import { ToastContainer, type ToastProps } from '../components/ui/Toast';
import { AuthProvider } from './AuthContext';
import { SettingsProvider } from './SettingsContext';
import { UserProvider } from './UserContext';

interface AppContextType {
    toasts: ToastProps[];
    showNotification: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
    const [toasts, setToasts] = useState<ToastProps[]>([]);

    const showNotification = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') => {
        const id = crypto.randomUUID();
        const newToast: ToastProps = { id, message, type, onClose: removeToast };
        setToasts(prev => [...prev, newToast]);
        setTimeout(() => removeToast(id), 5000);
    };

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    return (
        <AppContext.Provider value={{ toasts, showNotification }}>
            <AuthProvider>
                <SettingsProvider>
                    <UserProvider>
                        {children}
                        <ToastContainer toasts={toasts} onClose={removeToast} />
                    </UserProvider>
                </SettingsProvider>
            </AuthProvider>
        </AppContext.Provider>
    );
};

export { AppContext };
export { useApp } from './useApp';
