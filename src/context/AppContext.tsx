import { type ReactNode } from 'react';
import { ToastContainer } from '../components/ui/Toast';
import { AuthProvider } from './AuthContext';
import { SettingsProvider } from './SettingsContext';
import { UserProvider } from './UserContext';
import { useUIStore } from '../store/uiStore';

export const AppProvider = ({ children }: { children: ReactNode }) => {
    const toasts = useUIStore((s) => s.toasts);
    const removeToast = useUIStore((s) => s.removeToast);

    return (
        <AuthProvider>
            <SettingsProvider>
                <UserProvider>
                    {children}
                    <ToastContainer toasts={toasts} onClose={removeToast} />
                </UserProvider>
            </SettingsProvider>
        </AuthProvider>
    );
};

export { useApp } from './useApp';
export { useSettings } from './SettingsContext';
