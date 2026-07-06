import { useAuthStore } from '../store/authStore';
import { useSettingsStore } from '../store/settingsStore';
import { useUIStore } from '../store/uiStore';
import type { User } from '../types/auth';

/** @deprecated Use individual hooks (useCurrentUser, useSidebarCollapsed, etc.) for better re-render performance */
export const useCurrentUser = () => useAuthStore(s => s.currentUser);
export const useIsAuthenticated = () => useAuthStore(s => s.isAuthenticated);
export const useIsLoading = () => useAuthStore(s => s.isLoading);
export const useLogin = () => useAuthStore(s => s.login);
export const useLogout = () => useAuthStore(s => s.logout);
export const useUpdateCurrentUser = () => useAuthStore(s => s.updateCurrentUser);
export const useUser = () => useAuthStore(s => s.currentUser || ({ id: 'guest', name: 'ضيف', username: 'guest' } as User));

export const useSidebarCollapsed = () => useUIStore(s => s.sidebarCollapsed);
export const useSetSidebarCollapsed = () => useUIStore(s => s.setSidebarCollapsed);
export const useToasts = () => useUIStore(s => s.toasts);
export const useShowNotification = () => useUIStore(s => s.showNotification);
export const useRequestDesktopNotifications = () => useUIStore(s => s.requestDesktopNotifications);

export const useAcademyName = () => useSettingsStore(s => s.academyName);
export const useAcademyLogo = () => useSettingsStore(s => s.academyLogo);
export const useAcademyTagline = () => useSettingsStore(s => s.academyTagline);
export const useAcademyAddress = () => useSettingsStore(s => s.academyAddress);
export const useAdminPhone = () => useSettingsStore(s => s.adminPhone);
export const useThemeColor = () => useSettingsStore(s => s.themeColor);
export const useNotificationsEnabled = () => useSettingsStore(s => s.notificationsEnabled);
export const useAutoBackup = () => useSettingsStore(s => s.autoBackup);
export const useMaintenanceMode = () => useSettingsStore(s => s.maintenanceMode);
export const useWhatsappAutoNotify = () => useSettingsStore(s => s.whatsappAutoNotify);
export const useDefaultSessionPrice = () => useSettingsStore(s => s.defaultSessionPrice);
export const useDefaultTeacherPrice = () => useSettingsStore(s => s.defaultTeacherPrice);
export const useCurrencySymbol = () => useSettingsStore(s => s.currencySymbol);
export const useSemesterName = () => useSettingsStore(s => s.semesterName);
export const useSemesters = () => useSettingsStore(s => s.semesters);
export const useWhatsappTemplate = () => useSettingsStore(s => s.whatsappTemplate);
export const useBalanceWarningThreshold = () => useSettingsStore(s => s.balanceWarningThreshold);
export const useBackdateLockEnabled = () => useSettingsStore(s => s.backdateLockEnabled);
export const useTeacherCommissionType = () => useSettingsStore(s => s.teacherCommissionType);
export const useAutoFreezeThreshold = () => useSettingsStore(s => s.autoFreezeThreshold);
export const useTelegramHandle = () => useSettingsStore(s => s.telegramHandle);
export const useHeroBanners = () => useSettingsStore(s => s.heroBanners);
export const useReminderMinutesBefore = () => useSettingsStore(s => s.reminderMinutesBefore);
export const useWhatsappNumbers = () => useSettingsStore(s => s.whatsappNumbers);
export const useIsSettingsLoading = () => useSettingsStore(s => s.isSettingsLoading);
export const useSetAcademyName = () => useSettingsStore(s => s.setAcademyName);
export const useSetAcademyLogo = () => useSettingsStore(s => s.setAcademyLogo);
export const useSetAcademyTagline = () => useSettingsStore(s => s.setAcademyTagline);
export const useSetAcademyAddress = () => useSettingsStore(s => s.setAcademyAddress);
export const useSetAdminPhone = () => useSettingsStore(s => s.setAdminPhone);
export const useSetThemeColor = () => useSettingsStore(s => s.setThemeColor);
export const useSetNotificationsEnabled = () => useSettingsStore(s => s.setNotificationsEnabled);
export const useSetAutoBackup = () => useSettingsStore(s => s.setAutoBackup);
export const useSetMaintenanceMode = () => useSettingsStore(s => s.setMaintenanceMode);
export const useSetWhatsappAutoNotify = () => useSettingsStore(s => s.setWhatsappAutoNotify);
export const useSetDefaultSessionPrice = () => useSettingsStore(s => s.setDefaultSessionPrice);
export const useSetDefaultTeacherPrice = () => useSettingsStore(s => s.setDefaultTeacherPrice);
export const useSetCurrencySymbol = () => useSettingsStore(s => s.setCurrencySymbol);
export const useSetSemesterName = () => useSettingsStore(s => s.setSemesterName);
export const useSetSemesters = () => useSettingsStore(s => s.setSemesters);
export const useSetWhatsappTemplate = () => useSettingsStore(s => s.setWhatsappTemplate);
export const useSetBalanceWarningThreshold = () => useSettingsStore(s => s.setBalanceWarningThreshold);
export const useSetBackdateLockEnabled = () => useSettingsStore(s => s.setBackdateLockEnabled);
export const useSetTeacherCommissionType = () => useSettingsStore(s => s.setTeacherCommissionType);
export const useSetAutoFreezeThreshold = () => useSettingsStore(s => s.setAutoFreezeThreshold);
export const useSetTelegramHandle = () => useSettingsStore(s => s.setTelegramHandle);
export const useSetHeroBanners = () => useSettingsStore(s => s.setHeroBanners);
export const useSetReminderMinutesBefore = () => useSettingsStore(s => s.setReminderMinutesBefore);
export const useSetWhatsappNumbers = () => useSettingsStore(s => s.setWhatsappNumbers);

/** @deprecated Use individual hooks (useCurrentUser, useSidebarCollapsed, etc.) for better re-render performance */
export function useApp() {
    const currentUser = useAuthStore(s => s.currentUser);
    const isAuthenticated = useAuthStore(s => s.isAuthenticated);
    const isLoading = useAuthStore(s => s.isLoading);
    const login = useAuthStore(s => s.login);
    const logout = useAuthStore(s => s.logout);
    const updateCurrentUser = useAuthStore(s => s.updateCurrentUser);

    const toasts = useUIStore(s => s.toasts);
    const showNotification = useUIStore(s => s.showNotification);
    const requestDesktopNotifications = useUIStore(s => s.requestDesktopNotifications);
    const sidebarCollapsed = useUIStore(s => s.sidebarCollapsed);
    const setSidebarCollapsed = useUIStore(s => s.setSidebarCollapsed);

    const settings = useSettingsStore();

    return {
        toasts, showNotification, requestDesktopNotifications,
        sidebarCollapsed, setSidebarCollapsed,
        currentUser, isAuthenticated, isLoading, login, logout, updateCurrentUser,
        user: currentUser || ({ id: 'guest', name: 'ضيف', username: 'guest' } as User),
        updateUser: updateCurrentUser,
        academyName: settings.academyName,
        academyLogo: settings.academyLogo,
        academyTagline: settings.academyTagline,
        academyAddress: settings.academyAddress,
        adminPhone: settings.adminPhone,
        themeColor: settings.themeColor,
        notificationsEnabled: settings.notificationsEnabled,
        autoBackup: settings.autoBackup,
        maintenanceMode: settings.maintenanceMode,
        whatsappAutoNotify: settings.whatsappAutoNotify,
        defaultSessionPrice: settings.defaultSessionPrice,
        defaultTeacherPrice: settings.defaultTeacherPrice,
        currencySymbol: settings.currencySymbol,
        semesterName: settings.semesterName,
        semesters: settings.semesters,
        whatsappTemplate: settings.whatsappTemplate,
        balanceWarningThreshold: settings.balanceWarningThreshold,
        backdateLockEnabled: settings.backdateLockEnabled,
        teacherCommissionType: settings.teacherCommissionType,
        autoFreezeThreshold: settings.autoFreezeThreshold,
        telegramHandle: settings.telegramHandle,
        heroBanners: settings.heroBanners,
        reminderMinutesBefore: settings.reminderMinutesBefore,
        isSettingsLoading: settings.isSettingsLoading,
        setAcademyName: settings.setAcademyName,
        setAcademyLogo: settings.setAcademyLogo,
        setAcademyTagline: settings.setAcademyTagline,
        setAcademyAddress: settings.setAcademyAddress,
        setAdminPhone: settings.setAdminPhone,
        setThemeColor: settings.setThemeColor,
        setNotificationsEnabled: settings.setNotificationsEnabled,
        setAutoBackup: settings.setAutoBackup,
        setMaintenanceMode: settings.setMaintenanceMode,
        setWhatsappAutoNotify: settings.setWhatsappAutoNotify,
        setDefaultSessionPrice: settings.setDefaultSessionPrice,
        setDefaultTeacherPrice: settings.setDefaultTeacherPrice,
        setCurrencySymbol: settings.setCurrencySymbol,
        setSemesterName: settings.setSemesterName,
        setSemesters: settings.setSemesters,
        setWhatsappTemplate: settings.setWhatsappTemplate,
        setBalanceWarningThreshold: settings.setBalanceWarningThreshold,
        setBackdateLockEnabled: settings.setBackdateLockEnabled,
        setTeacherCommissionType: settings.setTeacherCommissionType,
        setAutoFreezeThreshold: settings.setAutoFreezeThreshold,
        setTelegramHandle: settings.setTelegramHandle,
        setHeroBanners: settings.setHeroBanners,
        setReminderMinutesBefore: settings.setReminderMinutesBefore,
    };
}
