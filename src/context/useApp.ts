import { useAuthStore } from '../store/authStore';
import { useSettingsStore } from '../store/settingsStore';
import { useUIStore } from '../store/uiStore';

/** @deprecated Use individual hooks (useCurrentUser, useSidebarCollapsed, etc.) for better re-render performance */
export const useCurrentUser = () => useAuthStore(s => s.currentUser);
export const useIsAuthenticated = () => useAuthStore(s => s.isAuthenticated);
export const useIsLoading = () => useAuthStore(s => s.isLoading);
export const useLogin = () => useAuthStore(s => s.login);
export const useLogout = () => useAuthStore(s => s.logout);

export const useSidebarCollapsed = () => useUIStore(s => s.sidebarCollapsed);
export const useSetSidebarCollapsed = () => useUIStore(s => s.setSidebarCollapsed);
export const useShowNotification = () => useUIStore(s => s.showNotification);

export const useAcademyName = () => useSettingsStore(s => s.academyName);
export const useAcademyLogo = () => useSettingsStore(s => s.academyLogo);
export const useAcademyTagline = () => useSettingsStore(s => s.academyTagline);
export const useAcademyAddress = () => useSettingsStore(s => s.academyAddress);
export const useAdminPhone = () => useSettingsStore(s => s.adminPhone);
export const useThemeColor = () => useSettingsStore(s => s.themeColor);
export const useNotificationsEnabled = () => useSettingsStore(s => s.notificationsEnabled);
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
export const useLibraryTelegram = () => useSettingsStore(s => s.libraryTelegram);
export const useHeroBanners = () => useSettingsStore(s => s.heroBanners);
export const useReminderMinutesBefore = () => useSettingsStore(s => s.reminderMinutesBefore);
export const useWhatsappNumbers = () => useSettingsStore(s => s.whatsappNumbers);
export const useIsSettingsLoading = () => useSettingsStore(s => s.isSettingsLoading);
export const useSetSetting = () => useSettingsStore(s => s.setSetting);
export const useAcademicYear = () => useSettingsStore(s => s.academicYear);
export const useSemesterStartDate = () => useSettingsStore(s => s.semesterStartDate);
export const useSemesterEndDate = () => useSettingsStore(s => s.semesterEndDate);
export const useFooterDescription = () => useSettingsStore(s => s.footerDescription);
export const useFooterAddress = () => useSettingsStore(s => s.footerAddress);
export const useFooterInstagram = () => useSettingsStore(s => s.footerInstagram);
