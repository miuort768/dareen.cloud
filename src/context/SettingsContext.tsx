import { createContext, useState, useEffect, useContext, type ReactNode } from 'react';
import { api } from '../lib/api';

interface SettingsContextType {
    academyName: string;
    adminPhone: string;
    themeColor: string;
    notificationsEnabled: boolean;
    autoBackup: boolean;
    setAcademyName: (name: string) => Promise<void>;
    setAdminPhone: (phone: string) => Promise<void>;
    setThemeColor: (color: string) => Promise<void>;
    setNotificationsEnabled: (enabled: boolean) => Promise<void>;
    setAutoBackup: (enabled: boolean) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
    const [academyName, setAcademyNameState] = useState('دارين لتعليم و التدريب');
    const [adminPhone, setAdminPhoneState] = useState('01152001250');
    const [themeColor, setThemeColorState] = useState(() => localStorage.getItem('app_theme_color') || 'indigo');
    const [notificationsEnabled, setNotificationsEnabledState] = useState(() => localStorage.getItem('app_notifications') !== 'false');
    const [autoBackup, setAutoBackupState] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const settings = await api.get<any>('/system/settings');
                if (settings) {
                    if (settings.academy_name) setAcademyNameState(settings.academy_name);
                    if (settings.admin_phone) setAdminPhoneState(settings.admin_phone);
                    if (settings.theme_color) setThemeColorState(settings.theme_color);
                    if (settings.notifications_enabled) setNotificationsEnabledState(settings.notifications_enabled === 'true');
                    if (settings.auto_backup) setAutoBackupState(settings.auto_backup === 'true');
                }
            } catch (e) {
                console.error("Error fetching settings:", e);
            }
        };
        fetchSettings();
    }, []);

    const updateSetting = async (key: string, value: string) => {
        try {
            await api.post('/system/settings', { key, value });
        } catch (e) {
            console.error("Error updating setting:", e);
            throw e;
        }
    };

    const setAcademyName = async (name: string) => {
        setAcademyNameState(name);
        await updateSetting('academy_name', name);
    };

    const setAdminPhone = async (phone: string) => {
        setAdminPhoneState(phone);
        await updateSetting('admin_phone', phone);
    };

    const setThemeColor = async (color: string) => {
        setThemeColorState(color);
        localStorage.setItem('app_theme_color', color);
        await updateSetting('theme_color', color);
    };

    const setNotificationsEnabled = async (enabled: boolean) => {
        setNotificationsEnabledState(enabled);
        localStorage.setItem('app_notifications', String(enabled));
        await updateSetting('notifications_enabled', String(enabled));
    };

    const setAutoBackup = async (enabled: boolean) => {
        setAutoBackupState(enabled);
        await updateSetting('auto_backup', String(enabled));
    };

    useEffect(() => {
        const root = document.documentElement;
        const colors: Record<string, string> = {
            indigo: '79 70 229', blue: '37 99 235', emerald: '16 185 129', rose: '225 29 72',
            amber: '217 119 6', purple: '147 51 234', cyan: '8 145 178', teal: '13 148 136',
            orange: '234 88 12', slate: '71 85 105', pink: '219 39 119', lime: '101 163 13',
            sky: '2 132 199', fuchsia: '192 38 211'
        };
        root.style.setProperty('--color-primary', colors[themeColor] || colors.indigo);
    }, [themeColor]);

    return (
        <SettingsContext.Provider value={{
            academyName, adminPhone, themeColor, notificationsEnabled, autoBackup,
            setAcademyName, setAdminPhone, setThemeColor, setNotificationsEnabled, setAutoBackup
        }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) throw new Error('useSettings must be used within a SettingsProvider');
    return context;
};
