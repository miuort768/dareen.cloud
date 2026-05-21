import { type ReactNode } from 'react';
import { ToastContainer } from '../components/ui/Toast';
import { useUIStore } from '../store/uiStore';

export const AppProvider = ({ children }: { children: ReactNode }) => {
    const toasts = useUIStore((s) => s.toasts);
    const removeToast = useUIStore((s) => s.removeToast);

    return (
        <>
            {children}
            <ToastContainer toasts={toasts} onClose={removeToast} />
        </>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export { useApp } from './useApp';
