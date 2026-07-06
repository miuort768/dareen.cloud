import { create } from 'zustand';
import { api } from '../lib/api';

interface SettingsState {
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
    reminderMinutesBefore: number;
    libraryWhatsapp: string;
    libraryTelegram: string;
    whatsappNumbers: string;
    isSettingsLoading: boolean;

    fetchSettings: () => Promise<void>;
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
    setHeroBanners: (banners: string) => Promise<void>;
    setReminderMinutesBefore: (minutes: number) => Promise<void>;
    setLibraryWhatsapp: (phone: string) => Promise<void>;
    setLibraryTelegram: (handle: string) => Promise<void>;
    setWhatsappNumbers: (numbers: string) => Promise<void>;
}

// Global CSS Theme injector
const applyThemeColor = (color: string) => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    const colors: Record<string, { primary: string; deep: string; mid: string; light: string }> = {
        indigo:   { primary: '79 70 229', deep: '30 27 75', mid: '99 102 241', light: '224 231 255' },
        blue:     { primary: '37 99 235', deep: '23 37 84', mid: '59 130 246', light: '219 234 254' },
        emerald:  { primary: '16 185 129', deep: '6 78 59', mid: '52 211 153', light: '209 250 229' },
        rose:     { primary: '225 29 72', deep: '76 5 25', mid: '244 63 94', light: '255 228 235' },
        amber:    { primary: '217 119 6', deep: '69 26 3', mid: '245 158 11', light: '254 243 199' },
        purple:   { primary: '147 51 234', deep: '59 7 100', mid: '168 85 247', light: '243 232 255' },
        cyan:     { primary: '8 145 178', deep: '22 78 99', mid: '6 182 212', light: '207 250 254' },
        teal:     { primary: '13 148 136', deep: '19 78 74', mid: '20 184 166', light: '204 251 241' },
        orange:   { primary: '234 88 12', deep: '67 20 7', mid: '251 146 60', light: '255 237 213' },
        slate:    { primary: '71 85 105', deep: '15 23 42', mid: '100 116 139', light: '226 232 240' },
        pink:     { primary: '219 39 119', deep: '74 4 43', mid: '236 72 153', light: '252 231 243' },
        lime:     { primary: '101 163 13', deep: '39 59 10', mid: '132 204 22', light: '236 252 203' },
        sky:      { primary: '2 132 199', deep: '7 47 73', mid: '14 165 233', light: '224 242 254' },
        fuchsia:  { primary: '192 38 211', deep: '70 5 89', mid: '217 70 239', light: '250 232 255' },
        sunset:   { primary: '234 88 12', deep: '67 20 7', mid: '251 146 60', light: '255 237 213' },
        ocean:    { primary: '37 99 235', deep: '23 37 84', mid: '59 130 246', light: '219 234 254' },
        forest:   { primary: '16 185 129', deep: '6 78 59', mid: '52 211 153', light: '209 250 229' },
        royal:    { primary: '147 51 234', deep: '59 7 100', mid: '168 85 247', light: '243 232 255' },
        electric: { primary: '139 92 246', deep: '49 46 129', mid: '167 139 250', light: '237 233 254' },
        mint:     { primary: '20 184 166', deep: '19 78 74', mid: '52 211 153', light: '204 251 241' },
        berry:    { primary: '190 24 93', deep: '74 4 43', mid: '236 72 153', light: '252 231 243' },
        gold:     { primary: '234 179 8', deep: '113 63 18', mid: '250 204 21', light: '254 252 232' },
        crimson:  { primary: '190 18 60', deep: '76 5 25', mid: '225 29 72', light: '255 228 235' },
        midnight: { primary: '15 23 42', deep: '2 6 23', mid: '30 41 59', light: '226 232 240' },
        lava:     { primary: '220 38 38', deep: '69 10 10', mid: '239 68 68', light: '254 226 226' },
        lavender: { primary: '167 139 250', deep: '76 29 149', mid: '196 181 253', light: '245 243 255' },
        spring:   { primary: '132 204 22', deep: '54 83 20', mid: '163 230 53', light: '236 252 203' },
        flame:    { primary: '249 115 22', deep: '67 20 7', mid: '251 146 60', light: '255 237 213' },
        nebula:   { primary: '139 92 246', deep: '49 46 129', mid: '167 139 250', light: '237 233 254' },
        aurora:   { primary: '34 197 94', deep: '5 46 22', mid: '74 222 128', light: '220 252 231' },
        fire:     { primary: '239 68 68', deep: '69 10 10', mid: '248 113 113', light: '254 226 226' },
        ice:      { primary: '14 165 233', deep: '7 47 73', mid: '56 189 248', light: '224 242 254' },
        jungle:   { primary: '21 128 61', deep: '5 46 22', mid: '34 197 94', light: '220 252 231' },
        desert:   { primary: '180 83 9', deep: '69 26 3', mid: '217 119 6', light: '254 243 199' },
        coffee:   { primary: '120 113 108', deep: '41 37 36', mid: '168 162 158', light: '231 229 228' },
    };
    const c = colors[color] || colors.indigo;
    root.style.setProperty('--color-primary', c.primary);
    root.style.setProperty('--color-primary-deep', c.deep);
    root.style.setProperty('--color-primary-mid', c.mid);
    root.style.setProperty('--color-primary-light', c.light);
};

const updateSettingOnApi = async (key: string, value: string) => {
    try {
        await api.post('/system/settings', { key, value });
    } catch (e) {
        console.error("Error updating setting:", e);
        throw e;
    }
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
    academyName: 'دارين السابعة',
    academyLogo: '',
    academyTagline: 'مستقبل أفضل لأبنائنا',
    academyAddress: '',
    adminPhone: '201015098836',
    themeColor: localStorage.getItem('app_theme_color') || 'indigo',
    notificationsEnabled: localStorage.getItem('app_notifications') !== 'false',
    autoBackup: false,
    maintenanceMode: false,
    whatsappAutoNotify: false,
    defaultSessionPrice: 0,
    defaultTeacherPrice: 0,
    currencySymbol: 'ج.م',
    semesterName: 'الفصل الدراسي',
    semesters: 'الفصل الأول,الفصل الثاني',
    whatsappTemplate: 'تم تسجيل حصة {Subject} للطالب {Student} بتاريخ {Date}',
    balanceWarningThreshold: 2,
    backdateLockEnabled: false,
    teacherCommissionType: 'fixed',
    autoFreezeThreshold: 3,
    telegramHandle: 'dareen_app',
    reminderMinutesBefore: 30,
    libraryWhatsapp: '',
    libraryTelegram: '',
    whatsappNumbers: JSON.stringify([
        { label: 'تواصل عام', phone: '201015098836' },
        { label: 'إدارة الأكاديمية', phone: '201015098836' }
    ]),
    heroBanners: JSON.stringify([
        "انضم إلى أفضل منصة تعليمية",
        "تأسيس قوي لجميع المراحل",
        "نخبة من المعلمين المتخصصين",
        "متابعة دورية وتقييم مستمر"
    ]),
    isSettingsLoading: true,

    fetchSettings: async () => {
        try {
            const settings = await api.get<Record<string, unknown>>('/system/public-settings');
            if (settings) {
                const updates: Partial<SettingsState> = {};
                if (settings.academy_name !== undefined && settings.academy_name !== null) updates.academyName = settings.academy_name;
                if (settings.academy_logo !== undefined && settings.academy_logo !== null) updates.academyLogo = settings.academy_logo;
                if (settings.academy_tagline !== undefined && settings.academy_tagline !== null) updates.academyTagline = settings.academy_tagline;
                if (settings.academy_address !== undefined && settings.academy_address !== null) updates.academyAddress = settings.academy_address;
                if (settings.admin_phone !== undefined && settings.admin_phone !== null) updates.adminPhone = String(settings.admin_phone);
                if (settings.theme_color !== undefined && settings.theme_color !== null) {
                    updates.themeColor = settings.theme_color;
                    applyThemeColor(settings.theme_color);
                } else {
                    applyThemeColor(get().themeColor);
                }
                if (settings.notifications_enabled !== undefined && settings.notifications_enabled !== null) {
                    updates.notificationsEnabled = settings.notifications_enabled === true || settings.notifications_enabled === 'true';
                }
                if (settings.auto_backup !== undefined && settings.auto_backup !== null) {
                    updates.autoBackup = settings.auto_backup === true || settings.auto_backup === 'true';
                }
                if (settings.maintenance_mode !== undefined && settings.maintenance_mode !== null) {
                    updates.maintenanceMode = settings.maintenance_mode === true || settings.maintenance_mode === 'true';
                }
                if (settings.whatsapp_auto_notify !== undefined && settings.whatsapp_auto_notify !== null) {
                    updates.whatsappAutoNotify = settings.whatsapp_auto_notify === true || settings.whatsapp_auto_notify === 'true';
                }
                if (settings.default_session_price !== undefined && settings.default_session_price !== null) {
                    updates.defaultSessionPrice = Number(settings.default_session_price);
                }
                if (settings.default_teacher_price !== undefined && settings.default_teacher_price !== null) {
                    updates.defaultTeacherPrice = Number(settings.default_teacher_price);
                }
                if (settings.currency_symbol !== undefined && settings.currency_symbol !== null) updates.currencySymbol = settings.currency_symbol;
                if (settings.semester_name !== undefined && settings.semester_name !== null) updates.semesterName = settings.semester_name;
                if (settings.semesters !== undefined && settings.semesters !== null) updates.semesters = settings.semesters;
                if (settings.whatsapp_template !== undefined && settings.whatsapp_template !== null) updates.whatsappTemplate = settings.whatsapp_template;
                if (settings.balance_warning_threshold !== undefined && settings.balance_warning_threshold !== null) {
                    updates.balanceWarningThreshold = Number(settings.balance_warning_threshold);
                }
                if (settings.backdate_lock_enabled !== undefined && settings.backdate_lock_enabled !== null) {
                    updates.backdateLockEnabled = settings.backdate_lock_enabled === true || settings.backdate_lock_enabled === 'true';
                }
                if (settings.teacher_commission_type !== undefined && settings.teacher_commission_type !== null) {
                    updates.teacherCommissionType = settings.teacher_commission_type as 'percentage' | 'fixed';
                }
                if (settings.auto_freeze_threshold !== undefined && settings.auto_freeze_threshold !== null) {
                    updates.autoFreezeThreshold = Number(settings.auto_freeze_threshold);
                }
                if (settings.telegram_handle !== undefined && settings.telegram_handle !== null) updates.telegramHandle = String(settings.telegram_handle);
                if (settings.hero_banners !== undefined && settings.hero_banners !== null) updates.heroBanners = settings.hero_banners;
                if (settings.reminder_minutes_before !== undefined && settings.reminder_minutes_before !== null) {
                    updates.reminderMinutesBefore = Number(settings.reminder_minutes_before);
                }
                if (settings.library_whatsapp !== undefined && settings.library_whatsapp !== null) updates.libraryWhatsapp = String(settings.library_whatsapp);
                if (settings.library_telegram !== undefined && settings.library_telegram !== null) updates.libraryTelegram = String(settings.library_telegram);
                if (settings.whatsapp_numbers !== undefined && settings.whatsapp_numbers !== null) {
                    try { JSON.parse(String(settings.whatsapp_numbers)); updates.whatsappNumbers = String(settings.whatsapp_numbers); } catch { /* keep default */ }
                }

                set({ ...updates, isSettingsLoading: false });
            } else {
                applyThemeColor(get().themeColor);
                set({ isSettingsLoading: false });
            }
        } catch (e) {
            console.error("Error fetching settings:", e);
            applyThemeColor(get().themeColor);
            set({ isSettingsLoading: false });
        }
    },

    setAcademyName: async (name) => {
        set({ academyName: name });
        await updateSettingOnApi('academy_name', name);
    },
    setAcademyLogo: async (logo) => {
        set({ academyLogo: logo });
        await updateSettingOnApi('academy_logo', logo);
    },
    setAcademyTagline: async (tagline) => {
        set({ academyTagline: tagline });
        await updateSettingOnApi('academy_tagline', tagline);
    },
    setAcademyAddress: async (address) => {
        set({ academyAddress: address });
        await updateSettingOnApi('academy_address', address);
    },
    setAdminPhone: async (phone) => {
        set({ adminPhone: phone });
        await updateSettingOnApi('admin_phone', phone);
    },
    setThemeColor: async (color) => {
        set({ themeColor: color });
        localStorage.setItem('app_theme_color', color);
        applyThemeColor(color);
        await updateSettingOnApi('theme_color', color);
    },
    setNotificationsEnabled: async (enabled) => {
        set({ notificationsEnabled: enabled });
        localStorage.setItem('app_notifications', String(enabled));
        await updateSettingOnApi('notifications_enabled', String(enabled));
    },
    setAutoBackup: async (enabled) => {
        set({ autoBackup: enabled });
        await updateSettingOnApi('auto_backup', String(enabled));
    },
    setMaintenanceMode: async (enabled) => {
        set({ maintenanceMode: enabled });
        await updateSettingOnApi('maintenance_mode', String(enabled));
    },
    setWhatsappAutoNotify: async (enabled) => {
        set({ whatsappAutoNotify: enabled });
        await updateSettingOnApi('whatsapp_auto_notify', String(enabled));
    },
    setDefaultSessionPrice: async (price) => {
        set({ defaultSessionPrice: price });
        await updateSettingOnApi('default_session_price', String(price));
    },
    setDefaultTeacherPrice: async (price) => {
        set({ defaultTeacherPrice: price });
        await updateSettingOnApi('default_teacher_price', String(price));
    },
    setCurrencySymbol: async (symbol) => {
        set({ currencySymbol: symbol });
        await updateSettingOnApi('currency_symbol', symbol);
    },
    setSemesterName: async (name) => {
        set({ semesterName: name });
        await updateSettingOnApi('semester_name', name);
    },
    setSemesters: async (semesters) => {
        set({ semesters });
        await updateSettingOnApi('semesters', semesters);
    },
    setWhatsappTemplate: async (template) => {
        set({ whatsappTemplate: template });
        await updateSettingOnApi('whatsapp_template', template);
    },
    setBalanceWarningThreshold: async (threshold) => {
        set({ balanceWarningThreshold: threshold });
        await updateSettingOnApi('balance_warning_threshold', String(threshold));
    },
    setBackdateLockEnabled: async (enabled) => {
        set({ backdateLockEnabled: enabled });
        await updateSettingOnApi('backdate_lock_enabled', String(enabled));
    },
    setTeacherCommissionType: async (type) => {
        set({ teacherCommissionType: type });
        await updateSettingOnApi('teacher_commission_type', type);
    },
    setAutoFreezeThreshold: async (threshold) => {
        set({ autoFreezeThreshold: threshold });
        await updateSettingOnApi('auto_freeze_threshold', String(threshold));
    },
    setTelegramHandle: async (handle) => {
        set({ telegramHandle: handle });
        await updateSettingOnApi('telegram_handle', handle);
    },
    setHeroBanners: async (banners) => {
        set({ heroBanners: banners });
        await updateSettingOnApi('hero_banners', banners);
    },
    setReminderMinutesBefore: async (minutes) => {
        set({ reminderMinutesBefore: minutes });
        await updateSettingOnApi('reminder_minutes_before', String(minutes));
    },
    setLibraryWhatsapp: async (phone) => {
        set({ libraryWhatsapp: phone });
        await updateSettingOnApi('library_whatsapp', phone);
    },
    setLibraryTelegram: async (handle) => {
        set({ libraryTelegram: handle });
        await updateSettingOnApi('library_telegram', handle);
    },
    setWhatsappNumbers: async (numbers) => {
        set({ whatsappNumbers: numbers });
        await updateSettingOnApi('whatsapp_numbers', numbers);
    }
}));

// Auto-fetch settings on store initialization (deferred to avoid TDZ issues)
if (typeof window !== 'undefined') {
    queueMicrotask(() => useSettingsStore.getState().fetchSettings());
}

// Initialize theme color on load
if (typeof window !== 'undefined') {
    const savedColor = localStorage.getItem('app_theme_color') || 'indigo';
    applyThemeColor(savedColor);
}
