import { useEffect, type ReactNode } from 'react';
import { useSettingsStore } from '../store/settingsStore';

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
    const fetchSettings = useSettingsStore((s) => s.fetchSettings);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    return <>{children}</>;
};

export const useSettings = () => {
    return useSettingsStore();
};
