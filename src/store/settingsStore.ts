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
    googlePlayUrl: string;
    appStoreUrl: string;
    isSettingsLoading: boolean;

    fetchSettings: () => Promise<void>;
    setSetting: <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => Promise<void>;
}

// Maps camelCase state keys → snake_case API keys + coercion type for fetchSettings
const SETTING_META: Record<string, { apiKey: string; coerce?: 'boolean' | 'number' | 'json' }> = {
    academyName:              { apiKey: 'academy_name' },
    academyLogo:              { apiKey: 'academy_logo' },
    academyTagline:           { apiKey: 'academy_tagline' },
    academyAddress:           { apiKey: 'academy_address' },
    adminPhone:               { apiKey: 'admin_phone' },
    themeColor:               { apiKey: 'theme_color' },
    notificationsEnabled:     { apiKey: 'notifications_enabled', coerce: 'boolean' },
    autoBackup:               { apiKey: 'auto_backup',           coerce: 'boolean' },
    maintenanceMode:          { apiKey: 'maintenance_mode',      coerce: 'boolean' },
    whatsappAutoNotify:       { apiKey: 'whatsapp_auto_notify',  coerce: 'boolean' },
    defaultSessionPrice:      { apiKey: 'default_session_price', coerce: 'number' },
    defaultTeacherPrice:      { apiKey: 'default_teacher_price', coerce: 'number' },
    currencySymbol:           { apiKey: 'currency_symbol' },
    semesterName:             { apiKey: 'semester_name' },
    semesters:                { apiKey: 'semesters' },
    whatsappTemplate:         { apiKey: 'whatsapp_template' },
    balanceWarningThreshold:  { apiKey: 'balance_warning_threshold', coerce: 'number' },
    backdateLockEnabled:      { apiKey: 'backdate_lock_enabled',     coerce: 'boolean' },
    teacherCommissionType:    { apiKey: 'teacher_commission_type' },
    autoFreezeThreshold:      { apiKey: 'auto_freeze_threshold',     coerce: 'number' },
    telegramHandle:           { apiKey: 'telegram_handle' },
    heroBanners:              { apiKey: 'hero_banners' },
    reminderMinutesBefore:    { apiKey: 'reminder_minutes_before',   coerce: 'number' },
    libraryWhatsapp:          { apiKey: 'library_whatsapp' },
    libraryTelegram:          { apiKey: 'library_telegram' },
    whatsappNumbers:          { apiKey: 'whatsapp_numbers',          coerce: 'json' },
    googlePlayUrl:            { apiKey: 'google_play_url' },
    appStoreUrl:              { apiKey: 'app_store_url' },
};

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
    const c = colors[color] ?? colors.indigo!;
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
    currencySymbol: 'ر.س',
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
        { label: 'طلب حصة مجانية', phone: '201015098836' },
        { label: 'احجز حصتك المجانية الآن', phone: '201015098836' },
        { label: 'ابدأ رحلة التميز', phone: '201015098836' },
        { label: 'ابدأ الحفظ الآن', phone: '201015098836' },
        { label: 'سجل الآن', phone: '201015098836' },
        { label: 'تواصل عبر واتساب', phone: '201015098836' },
        { label: 'تواصل معانا', phone: '201015098836' },
        { label: 'تواصل مع الدعم الفني', phone: '201015098836' },
        { label: 'تواصل مع قسم الحسابات', phone: '201015098836' },
        { label: 'تواصل مع إدارة المعهد', phone: '201015098836' }
    ]),
    heroBanners: JSON.stringify([
        "انضم إلى أفضل منصة تعليمية",
        "تأسيس قوي لجميع المراحل",
        "نخبة من المعلمين المتخصصين",
        "متابعة دورية وتقييم مستمر"
    ]),
    googlePlayUrl: '',
    appStoreUrl: '',
    isSettingsLoading: true,

    fetchSettings: async () => {
        try {
            const settings = await api.get<Record<string, unknown>>('/system/public-settings');
            if (!settings) {
                applyThemeColor(get().themeColor);
                set({ isSettingsLoading: false });
                return;
            }

            const updates: Partial<SettingsState> = {};

            for (const [stateKey, meta] of Object.entries(SETTING_META)) {
                const raw = settings[meta.apiKey];
                if (raw === undefined || raw === null) continue;

                switch (meta.coerce) {
                    case 'boolean':
                        (updates as Record<string, unknown>)[stateKey] = raw === true || raw === 'true';
                        break;
                    case 'number':
                        (updates as Record<string, unknown>)[stateKey] = Number(raw);
                        break;
                    case 'json':
                        try {
                            JSON.parse(String(raw));
                            (updates as Record<string, unknown>)[stateKey] = String(raw);
                        } catch (e) { console.warn(`Invalid JSON for ${meta.apiKey}:`, e); }
                        break;
                    default:
                        (updates as Record<string, unknown>)[stateKey] = String(raw);
                }
            }

            if (updates.themeColor !== undefined) {
                if (!localStorage.getItem('app_theme_color')) {
                    applyThemeColor(updates.themeColor as string);
                }
            } else {
                applyThemeColor(get().themeColor);
            }

            set({ ...updates, isSettingsLoading: false });
        } catch (e) {
            console.error("Error fetching settings:", e);
            applyThemeColor(get().themeColor);
            set({ isSettingsLoading: false });
        }
    },

    setSetting: async (key, value) => {
        const previousValue = get()[key];
        set({ [key]: value } as Pick<SettingsState, typeof key>);

        if (key === 'themeColor') {
            localStorage.setItem('app_theme_color', value as string);
            applyThemeColor(value as string);
        } else if (key === 'notificationsEnabled') {
            localStorage.setItem('app_notifications', String(value));
        }

        const apiKey = SETTING_META[key as string]?.apiKey
            ?? (key as string).replace(/([A-Z])/g, '_$1').toLowerCase();
        try {
            await updateSettingOnApi(apiKey, String(value));
        } catch (e) {
            console.error("Failed to persist setting, rolling back:", e);
            set({ [key]: previousValue } as Pick<SettingsState, typeof key>);
            if (key === 'themeColor') {
                localStorage.setItem('app_theme_color', previousValue as string);
                applyThemeColor(previousValue as string);
            } else if (key === 'notificationsEnabled') {
                localStorage.setItem('app_notifications', String(previousValue));
            }
            throw e;
        }
    },
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
