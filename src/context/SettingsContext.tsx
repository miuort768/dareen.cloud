import { createContext, useState, useEffect, useContext, type ReactNode } from 'react';
import { api } from '../lib/api';

interface SettingsContextType {
    academyName: string;
    adminPhone: string;
    themeColor: string;
    notificationsEnabled: boolean;
    autoBackup: boolean;
    maintenanceMode: boolean;
    whatsappAutoNotify: boolean;
    defaultSessionPrice: number;
    semesterName: string;
    semesters: string; // Stored as comma separated string for simplicity or JSON
    whatsappTemplate: string;
    balanceWarningThreshold: number;
    isSettingsLoading: boolean;
    setAcademyName: (name: string) => Promise<void>;
    setAdminPhone: (phone: string) => Promise<void>;
    setThemeColor: (color: string) => Promise<void>;
    setNotificationsEnabled: (enabled: boolean) => Promise<void>;
    setAutoBackup: (enabled: boolean) => Promise<void>;
    setMaintenanceMode: (enabled: boolean) => Promise<void>;
    setWhatsappAutoNotify: (enabled: boolean) => Promise<void>;
    setDefaultSessionPrice: (price: number) => Promise<void>;
    setSemesterName: (name: string) => Promise<void>;
    setSemesters: (semesters: string) => Promise<void>;
    setWhatsappTemplate: (template: string) => Promise<void>;
    setBalanceWarningThreshold: (threshold: number) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
    const [academyName, setAcademyNameState] = useState('دارين لتعليم و التدريب');
    const [adminPhone, setAdminPhoneState] = useState('201015098836');
    const [themeColor, setThemeColorState] = useState(() => localStorage.getItem('app_theme_color') || 'indigo');
    const [notificationsEnabled, setNotificationsEnabledState] = useState(() => localStorage.getItem('app_notifications') !== 'false');
    const [autoBackup, setAutoBackupState] = useState(false);
    const [maintenanceMode, setMaintenanceModeState] = useState(false);
    const [whatsappAutoNotify, setWhatsappAutoNotifyState] = useState(false);
    const [defaultSessionPrice, setDefaultSessionPriceState] = useState(0);
    const [semesterName, setSemesterNameState] = useState('الفصل الدراسي');
    const [semesters, setSemestersState] = useState('الفصل الأول,الفصل الثاني');
    const [whatsappTemplate, setWhatsappTemplateState] = useState('تم تسجيل حصة {Subject} للطالب {Student} بتاريخ {Date}');
    const [balanceWarningThreshold, setBalanceWarningThresholdState] = useState(2);
    const [isSettingsLoading, setIsSettingsLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const settings = await api.get<any>('/system/public-settings');
                if (settings) {
                    if (settings.academy_name) setAcademyNameState(settings.academy_name);
                    if (settings.admin_phone) setAdminPhoneState(settings.admin_phone);
                    if (settings.theme_color) setThemeColorState(settings.theme_color);
                    if (settings.notifications_enabled) setNotificationsEnabledState(settings.notifications_enabled === 'true');
                    if (settings.auto_backup) setAutoBackupState(settings.auto_backup === 'true');
                    if (settings.maintenance_mode) setMaintenanceModeState(settings.maintenance_mode === 'true');
                    if (settings.whatsapp_auto_notify) setWhatsappAutoNotifyState(settings.whatsapp_auto_notify === 'true');
                    if (settings.default_session_price) setDefaultSessionPriceState(Number(settings.default_session_price));
                    if (settings.semester_name) setSemesterNameState(settings.semester_name);
                    if (settings.semesters) setSemestersState(settings.semesters);
                    if (settings.whatsapp_template) setWhatsappTemplateState(settings.whatsapp_template);
                    if (settings.balance_warning_threshold) setBalanceWarningThresholdState(Number(settings.balance_warning_threshold));
                }
            } catch (e) {
                console.error("Error fetching settings:", e);
            } finally {
                setIsSettingsLoading(false);
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

    const setMaintenanceMode = async (enabled: boolean) => {
        setMaintenanceModeState(enabled);
        await updateSetting('maintenance_mode', String(enabled));
    };

    const setWhatsappAutoNotify = async (enabled: boolean) => {
        setWhatsappAutoNotifyState(enabled);
        await updateSetting('whatsapp_auto_notify', String(enabled));
    };

    const setDefaultSessionPrice = async (price: number) => {
        setDefaultSessionPriceState(price);
        await updateSetting('default_session_price', String(price));
    };

    const setSemesterName = async (name: string) => {
        setSemesterNameState(name);
        await updateSetting('semester_name', name);
    };

    const setSemesters = async (val: string) => {
        setSemestersState(val);
        await updateSetting('semesters', val);
    };

    const setWhatsappTemplate = async (val: string) => {
        setWhatsappTemplateState(val);
        await updateSetting('whatsapp_template', val);
    };

    const setBalanceWarningThreshold = async (threshold: number) => {
        setBalanceWarningThresholdState(threshold);
        await updateSetting('balance_warning_threshold', String(threshold));
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
            academyName, adminPhone, themeColor, notificationsEnabled, autoBackup, maintenanceMode,
            whatsappAutoNotify, defaultSessionPrice, semesterName, semesters, whatsappTemplate, balanceWarningThreshold,
            isSettingsLoading,
            setAcademyName, setAdminPhone, setThemeColor, setNotificationsEnabled, setAutoBackup, setMaintenanceMode,
            setWhatsappAutoNotify, setDefaultSessionPrice, setSemesterName, setSemesters, setWhatsappTemplate, setBalanceWarningThreshold
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
