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
    telegramHandle: string;
    heroBanners: string;
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
    setTelegramHandle: (handle: string) => Promise<void>;
    setHeroBanners: (val: string) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
    const [academyName, setAcademyNameState] = useState('دارين السابعة');
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
    const [telegramHandle, setTelegramHandleState] = useState('dareen_app');
    const [heroBanners, setHeroBannersState] = useState(JSON.stringify([
        "انضم إلى أفضل منصة تعليمية",
        "تأسيس قوي لجميع المراحل",
        "نخبة من المعلمين المتخصصين",
        "متابعة دورية وتقييم مستمر"
    ]));
    const [isSettingsLoading, setIsSettingsLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const settings = await api.get<any>('/system/public-settings');
                if (settings) {
                    if (settings.academy_name !== undefined && settings.academy_name !== null) setAcademyNameState(settings.academy_name);
                    if (settings.academy_logo !== undefined && settings.academy_logo !== null) setAcademyLogoState(settings.academy_logo);
                    if (settings.academy_tagline !== undefined && settings.academy_tagline !== null) setAcademyTaglineState(settings.academy_tagline);
                    if (settings.academy_address !== undefined && settings.academy_address !== null) setAcademyAddressState(settings.academy_address);
                    if (settings.admin_phone !== undefined && settings.admin_phone !== null) setAdminPhoneState(settings.admin_phone);
                    if (settings.theme_color !== undefined && settings.theme_color !== null) setThemeColorState(settings.theme_color);
                    if (settings.notifications_enabled !== undefined && settings.notifications_enabled !== null) setNotificationsEnabledState(settings.notifications_enabled === true || settings.notifications_enabled === 'true');
                    if (settings.auto_backup !== undefined && settings.auto_backup !== null) setAutoBackupState(settings.auto_backup === true || settings.auto_backup === 'true');
                    if (settings.maintenance_mode !== undefined && settings.maintenance_mode !== null) setMaintenanceModeState(settings.maintenance_mode === true || settings.maintenance_mode === 'true');
                    if (settings.whatsapp_auto_notify !== undefined && settings.whatsapp_auto_notify !== null) setWhatsappAutoNotifyState(settings.whatsapp_auto_notify === true || settings.whatsapp_auto_notify === 'true');
                    if (settings.default_session_price !== undefined && settings.default_session_price !== null) setDefaultSessionPriceState(Number(settings.default_session_price));
                    if (settings.default_teacher_price !== undefined && settings.default_teacher_price !== null) setDefaultTeacherPriceState(Number(settings.default_teacher_price));
                    if (settings.currency_symbol !== undefined && settings.currency_symbol !== null) setCurrencySymbolState(settings.currency_symbol);
                    if (settings.semester_name !== undefined && settings.semester_name !== null) setSemesterNameState(settings.semester_name);
                    if (settings.semesters !== undefined && settings.semesters !== null) setSemestersState(settings.semesters);
                    if (settings.whatsapp_template !== undefined && settings.whatsapp_template !== null) setWhatsappTemplateState(settings.whatsapp_template);
                    if (settings.balance_warning_threshold !== undefined && settings.balance_warning_threshold !== null) setBalanceWarningThresholdState(Number(settings.balance_warning_threshold));
                    if (settings.backdate_lock_enabled !== undefined && settings.backdate_lock_enabled !== null) setBackdateLockEnabledState(settings.backdate_lock_enabled === true || settings.backdate_lock_enabled === 'true');
                    if (settings.teacher_commission_type !== undefined && settings.teacher_commission_type !== null) setTeacherCommissionTypeState(settings.teacher_commission_type as any);
                    if (settings.auto_freeze_threshold !== undefined && settings.auto_freeze_threshold !== null) setAutoFreezeThresholdState(Number(settings.auto_freeze_threshold));
                    if (settings.telegram_handle !== undefined && settings.telegram_handle !== null) setTelegramHandleState(settings.telegram_handle);
                    if (settings.hero_banners !== undefined && settings.hero_banners !== null) setHeroBannersState(settings.hero_banners);
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

    const setTelegramHandle = async (handle: string) => {
        setTelegramHandleState(handle);
        await updateSetting('telegram_handle', handle);
    };

    const setHeroBanners = async (val: string) => {
        setHeroBannersState(val);
        await updateSetting('hero_banners', val);
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
            telegramHandle, heroBanners,
            isSettingsLoading,
            setAcademyName, setAcademyLogo, setAcademyTagline, setAcademyAddress, setAdminPhone, setThemeColor, 
            setNotificationsEnabled, setAutoBackup, setMaintenanceMode, setWhatsappAutoNotify, 
            setDefaultSessionPrice, setDefaultTeacherPrice, setCurrencySymbol,
            setSemesterName, setSemesters, setWhatsappTemplate, setBalanceWarningThreshold,
            setBackdateLockEnabled, setTeacherCommissionType, setAutoFreezeThreshold,
            setTelegramHandle, setHeroBanners
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
