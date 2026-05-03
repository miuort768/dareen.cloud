import { createContext, useState, type ReactNode, useCallback } from 'react';
import { ToastContainer, type ToastProps } from '../components/ui/Toast';
import { AuthProvider } from './AuthContext';
import { SettingsProvider } from './SettingsContext';
import { UserProvider } from './UserContext';
import { sendNativeNotification, requestNotificationPermission } from '../lib/notificationUtils';

interface AppContextType {
    toasts: ToastProps[];
    showNotification: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
    requestDesktopNotifications: () => Promise<boolean>;
    sidebarCollapsed: boolean;
    setSidebarCollapsed: (collapsed: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
    const [toasts, setToasts] = useState<ToastProps[]>([]);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
        const saved = localStorage.getItem('sidebar_collapsed');
        return saved !== null ? saved === 'true' : true;
    });

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const showNotification = useCallback((message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') => {
        const id = Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
        const newToast: ToastProps = { id, message, type, onClose: removeToast };

        setToasts(prev => [...prev, newToast]);

        // Also send a native desktop notification
        sendNativeNotification(type === 'error' ? 'تنبيه خطأ' : 'إشعار جديد', {
            body: message,
            tag: id
        });

        setTimeout(() => removeToast(id), 5000);
    }, [removeToast]);

    const requestDesktopNotifications = async () => {
        const granted = await requestNotificationPermission();
        if (granted) {
            showNotification('تم تفعيل الإشعارات المكتبية بنجاح', 'success');
        } else {
            showNotification('لم يتم منح صلاحية الإشعارات المكتبية', 'warning');
        }
        return granted;
    };

    return (
        <AppContext.Provider value={{
            toasts,
            showNotification,
            requestDesktopNotifications,
            sidebarCollapsed,
            setSidebarCollapsed
        }}>
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
export { useSettings } from './SettingsContext';
