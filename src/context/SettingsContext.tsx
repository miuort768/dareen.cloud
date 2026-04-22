import { createContext, useState, useEffect, useContext, type ReactNode } from 'react';
import { api } from '../lib/api';

interface SettingsContextType {
    academyName: string;
    academyLogo: string;
    academyTagline: string;
    academyAddress: string;
    adminPhone: string;
    themeColor: string;
    notificationsEnabled: boolean;
    autoBackup: boolean;
    maintenanceMode: boolean;
    whatsappAutoNotify: boolean;
    defaultSessionPrice: number;
    defaultTeacherPrice: number;
    currencySymbol: string;
    semesterName: string;
    semesters: string;
    whatsappTemplate: string;
    balanceWarningThreshold: number;
    backdateLockEnabled: boolean;
    teacherCommissionType: 'percentage' | 'fixed';
    autoFreezeThreshold: number;
    chatbotEnabled: boolean;
    chatbotWelcomeMsg: string;
    chatbotName: string;
    telegramHandle: string;
    isSettingsLoading: boolean;
    setAcademyName: (name: string) => Promise<void>;
    setAcademyLogo: (logo: string) => Promise<void>;
    setAcademyTagline: (tagline: string) => Promise<void>;
    setAcademyAddress: (address: string) => Promise<void>;
    setAdminPhone: (phone: string) => Promise<void>;
    setThemeColor: (color: string) => Promise<void>;
    setNotificationsEnabled: (enabled: boolean) => Promise<void>;
    setAutoBackup: (enabled: boolean) => Promise<void>;
    setMaintenanceMode: (enabled: boolean) => Promise<void>;
    setWhatsappAutoNotify: (enabled: boolean) => Promise<void>;
    setDefaultSessionPrice: (price: number) => Promise<void>;
    setDefaultTeacherPrice: (price: number) => Promise<void>;
    setCurrencySymbol: (symbol: string) => Promise<void>;
    setSemesterName: (name: string) => Promise<void>;
    setSemesters: (semesters: string) => Promise<void>;
    setWhatsappTemplate: (template: string) => Promise<void>;
    setBalanceWarningThreshold: (threshold: number) => Promise<void>;
    setBackdateLockEnabled: (enabled: boolean) => Promise<void>;
    setTeacherCommissionType: (type: 'percentage' | 'fixed') => Promise<void>;
    setAutoFreezeThreshold: (threshold: number) => Promise<void>;
    setChatbotEnabled: (enabled: boolean) => Promise<void>;
    setChatbotWelcomeMsg: (msg: string) => Promise<void>;
    setChatbotName: (name: string) => Promise<void>;
    setTelegramHandle: (handle: string) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
    const [academyName, setAcademyNameState] = useState('دارين لتعليم و التدريب');
    const [academyLogo, setAcademyLogoState] = useState('');
    const [academyTagline, setAcademyTaglineState] = useState('مستقبل أفضل لأبنائنا');
    const [academyAddress, setAcademyAddressState] = useState('');
    const [adminPhone, setAdminPhoneState] = useState('201015098836');
    const [themeColor, setThemeColorState] = useState(() => localStorage.getItem('app_theme_color') || 'indigo');
    const [notificationsEnabled, setNotificationsEnabledState] = useState(() => localStorage.getItem('app_notifications') !== 'false');
    const [autoBackup, setAutoBackupState] = useState(false);
    const [maintenanceMode, setMaintenanceModeState] = useState(false);
    const [whatsappAutoNotify, setWhatsappAutoNotifyState] = useState(false);
    const [defaultSessionPrice, setDefaultSessionPriceState] = useState(0);
    const [defaultTeacherPrice, setDefaultTeacherPriceState] = useState(0);
    const [currencySymbol, setCurrencySymbolState] = useState('ج.م');
    const [semesterName, setSemesterNameState] = useState('الفصل الدراسي');
    const [semesters, setSemestersState] = useState('الفصل الأول,الفصل الثاني');
    const [whatsappTemplate, setWhatsappTemplateState] = useState('تم تسجيل حصة {Subject} للطالب {Student} بتاريخ {Date}');
    const [balanceWarningThreshold, setBalanceWarningThresholdState] = useState(2);
    const [backdateLockEnabled, setBackdateLockEnabledState] = useState(false);
    const [teacherCommissionType, setTeacherCommissionTypeState] = useState<'percentage' | 'fixed'>('fixed');
    const [autoFreezeThreshold, setAutoFreezeThresholdState] = useState(3);
    const [chatbotEnabled, setChatbotEnabledState] = useState(false);
    const [chatbotWelcomeMsg, setChatbotWelcomeMsgState] = useState('مرحباً بك في معهد دارين! كيف يمكننا مساعدتك اليوم؟');
    const [chatbotName, setChatbotNameState] = useState('دارين بوت');
    const [telegramHandle, setTelegramHandleState] = useState('dareen_app');
    const [isSettingsLoading, setIsSettingsLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const settings = await api.get<any>('/system/public-settings');
                if (settings) {
                    if (settings.academy_name) setAcademyNameState(settings.academy_name);
                    if (settings.academy_logo) setAcademyLogoState(settings.academy_logo);
                    if (settings.academy_tagline) setAcademyTaglineState(settings.academy_tagline);
                    if (settings.academy_address) setAcademyAddressState(settings.academy_address);
                    if (settings.admin_phone) setAdminPhoneState(settings.admin_phone);
                    if (settings.theme_color) setThemeColorState(settings.theme_color);
                    if (settings.notifications_enabled) setNotificationsEnabledState(settings.notifications_enabled === 'true');
                    if (settings.auto_backup) setAutoBackupState(settings.auto_backup === 'true');
                    if (settings.maintenance_mode) setMaintenanceModeState(settings.maintenance_mode === 'true');
                    if (settings.whatsapp_auto_notify) setWhatsappAutoNotifyState(settings.whatsapp_auto_notify === 'true');
                    if (settings.default_session_price) setDefaultSessionPriceState(Number(settings.default_session_price));
                    if (settings.default_teacher_price) setDefaultTeacherPriceState(Number(settings.default_teacher_price));
                    if (settings.currency_symbol) setCurrencySymbolState(settings.currency_symbol);
                    if (settings.semester_name) setSemesterNameState(settings.semester_name);
                    if (settings.semesters) setSemestersState(settings.semesters);
                    if (settings.whatsapp_template) setWhatsappTemplateState(settings.whatsapp_template);
                    if (settings.balance_warning_threshold) setBalanceWarningThresholdState(Number(settings.balance_warning_threshold));
                    if (settings.backdate_lock_enabled) setBackdateLockEnabledState(settings.backdate_lock_enabled === 'true');
                    if (settings.teacher_commission_type) setTeacherCommissionTypeState(settings.teacher_commission_type as any);
                    if (settings.auto_freeze_threshold) setAutoFreezeThresholdState(Number(settings.auto_freeze_threshold));
                    if (settings.chatbot_enabled) setChatbotEnabledState(settings.chatbot_enabled === 'true');
                    if (settings.chatbot_welcome_msg) setChatbotWelcomeMsgState(settings.chatbot_welcome_msg);
                    if (settings.chatbot_name) setChatbotNameState(settings.chatbot_name);
                    if (settings.telegram_handle) setTelegramHandleState(settings.telegram_handle);
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

    const setAcademyLogo = async (logo: string) => {
        setAcademyLogoState(logo);
        await updateSetting('academy_logo', logo);
    };

    const setAcademyTagline = async (tagline: string) => {
        setAcademyTaglineState(tagline);
        await updateSetting('academy_tagline', tagline);
    };

    const setAcademyAddress = async (address: string) => {
        setAcademyAddressState(address);
        await updateSetting('academy_address', address);
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

    const setDefaultTeacherPrice = async (price: number) => {
        setDefaultTeacherPriceState(price);
        await updateSetting('default_teacher_price', String(price));
    };

    const setCurrencySymbol = async (symbol: string) => {
        setCurrencySymbolState(symbol);
        await updateSetting('currency_symbol', symbol);
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

    const setBackdateLockEnabled = async (enabled: boolean) => {
        setBackdateLockEnabledState(enabled);
        await updateSetting('backdate_lock_enabled', String(enabled));
    };

    const setTeacherCommissionType = async (type: 'percentage' | 'fixed') => {
        setTeacherCommissionTypeState(type);
        await updateSetting('teacher_commission_type', type);
    };

    const setAutoFreezeThreshold = async (threshold: number) => {
        setAutoFreezeThresholdState(threshold);
        await updateSetting('auto_freeze_threshold', String(threshold));
    };

    const setChatbotEnabled = async (enabled: boolean) => {
        setChatbotEnabledState(enabled);
        await updateSetting('chatbot_enabled', String(enabled));
    };

    const setChatbotWelcomeMsg = async (msg: string) => {
        setChatbotWelcomeMsgState(msg);
        await updateSetting('chatbot_welcome_msg', msg);
    };

    const setChatbotName = async (name: string) => {
        setChatbotNameState(name);
        await updateSetting('chatbot_name', name);
    };

    const setTelegramHandle = async (handle: string) => {
        setTelegramHandleState(handle);
        await updateSetting('telegram_handle', handle);
    };

    useEffect(() => {
        const root = document.documentElement;
        const colors: Record<string, string> = {
            indigo: '79 70 229', blue: '37 99 235', emerald: '16 185 129', rose: '225 29 72',
            amber: '217 119 6', purple: '147 51 234', cyan: '8 145 178', teal: '13 148 136',
            orange: '234 88 12', slate: '71 85 105', pink: '219 39 119', lime: '101 163 13',
            sky: '2 132 199', fuchsia: '192 38 211',
            // New 14 colors mapping
            sunset: '234 88 12', ocean: '37 99 235', forest: '16 185 129', royal: '147 51 234',
            electric: '139 92 246', mint: '20 184 166', berry: '190 24 93', gold: '234 179 8',
            crimson: '190 18 60', midnight: '15 23 42', lava: '220 38 38', lavender: '167 139 250',
            spring: '132 204 22', flame: '249 115 22', nebula: '139 92 246', aurora: '34 197 94',
            fire: '239 68 68', ice: '14 165 233', jungle: '21 128 61', desert: '180 83 9',
            coffee: '120 113 108'
        };
        root.style.setProperty('--color-primary', colors[themeColor] || colors.indigo);
    }, [themeColor]);

    return (
        <SettingsContext.Provider value={{
            academyName, academyLogo, academyTagline, academyAddress, adminPhone, themeColor, notificationsEnabled, 
            autoBackup, maintenanceMode, whatsappAutoNotify, defaultSessionPrice, defaultTeacherPrice, currencySymbol,
            semesterName, semesters, whatsappTemplate, balanceWarningThreshold,
            backdateLockEnabled, teacherCommissionType, autoFreezeThreshold,
            chatbotEnabled, chatbotWelcomeMsg, chatbotName, telegramHandle,
            isSettingsLoading,
            setAcademyName, setAcademyLogo, setAcademyTagline, setAcademyAddress, setAdminPhone, setThemeColor, 
            setNotificationsEnabled, setAutoBackup, setMaintenanceMode, setWhatsappAutoNotify, 
            setDefaultSessionPrice, setDefaultTeacherPrice, setCurrencySymbol,
            setSemesterName, setSemesters, setWhatsappTemplate, setBalanceWarningThreshold,
            setBackdateLockEnabled, setTeacherCommissionType, setAutoFreezeThreshold,
            setChatbotEnabled, setChatbotWelcomeMsg, setChatbotName, setTelegramHandle
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
