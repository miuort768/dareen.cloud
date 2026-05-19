import { useAuthStore } from '../store/authStore';
import { useSettingsStore } from '../store/settingsStore';
import { useUIStore } from '../store/uiStore';
import { useUsers } from './UserContext';
import type { User } from '../types/auth';

export const useApp = () => {
    const ui = useUIStore();
    const auth = useAuthStore();
    const settings = useSettingsStore();
    const users = useUsers();

    return {
        // UI
        toasts: ui.toasts,
        showNotification: ui.showNotification,
        requestDesktopNotifications: ui.requestDesktopNotifications,
        sidebarCollapsed: ui.sidebarCollapsed,
        setSidebarCollapsed: ui.setSidebarCollapsed,
        // Auth
        currentUser: auth.currentUser,
        isAuthenticated: auth.isAuthenticated,
        isLoading: auth.isLoading,
        login: auth.login,
        logout: auth.logout,
        updateCurrentUser: auth.updateCurrentUser,
        user: auth.currentUser || ({ id: 'guest', name: 'ضيف', username: 'guest' } as User),
        updateUser: auth.updateCurrentUser,
        // Settings
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
        // Users
        ...users
    };
};
