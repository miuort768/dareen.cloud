import { createContext, useState, type ReactNode, useCallback } from 'react';
import { ToastContainer, type ToastProps } from '../components/ui/Toast';
import { AuthProvider } from './AuthContext';
import { SettingsProvider } from './SettingsContext';
import { UserProvider } from './UserContext';
import { MeetingProvider } from './MeetingContext';
import { sendNativeNotification, requestNotificationPermission } from '../lib/notificationUtils';

interface AppContextType {
    toasts: ToastProps[];
    showNotification: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
    requestDesktopNotifications: () => Promise<boolean>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
    const [toasts, setToasts] = useState<ToastProps[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const showNotification = useCallback((message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') => {
        const id = crypto.randomUUID();
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
        <AppContext.Provider value={{ toasts, showNotification, requestDesktopNotifications }}>
            <AuthProvider>
                <SettingsProvider>
                    <UserProvider>
                        <MeetingProvider>
                            {children}
                            <ToastContainer toasts={toasts} onClose={removeToast} />
                        </MeetingProvider>
                    </UserProvider>
                </SettingsProvider>
            </AuthProvider>
        </AppContext.Provider>
    );
};

export { AppContext };
export { useApp } from './useApp';
export { useSettings } from './SettingsContext';
