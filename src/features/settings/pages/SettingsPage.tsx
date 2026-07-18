import { useState, useEffect, useCallback } from 'react';
import {
    Settings as SettingsIcon, MessageSquare, Calendar, Coins,
    Palette, Users, KeyRound, Lock, Clock, UserCheck, FileText, Award, HardDrive,
    Shield, Activity
} from 'lucide-react';
import { useAcademyName, useAcademyLogo, useAcademyTagline, useAdminPhone, useThemeColor, useNotificationsEnabled, useMaintenanceMode, useWhatsappAutoNotify, useWhatsappTemplate, useDefaultSessionPrice, useDefaultTeacherPrice, useCurrencySymbol, useSemesterName, useSemesters, useBalanceWarningThreshold, useBackdateLockEnabled, useTeacherCommissionType, useAutoFreezeThreshold, useTelegramHandle, useHeroBanners, useReminderMinutesBefore, useCurrentUser, useUsers, useAddUser, useEditUser, useDeleteUser, useAcademyAddress, useWhatsappNumbers, useSetSetting } from '../../../context/AppContext';
import { Skeleton } from '../../../shared/components/ui';
import { cn } from '../../../lib/utils';
import { confirm } from '../../../lib/confirmDialog';
import { settingsService } from '../services/settingsService';
import { SecureActionModal } from '../components/SecureActionModal';
import { DeleteUserModal } from '../components/DeleteUserModal';
import { MaintenanceModal } from '../components/MaintenanceModal';
import { SuccessToast } from '../components/SuccessToast';
import { TABS, SettingsTabContent } from './settings-page';
import type { TabId } from './settings-page';

export const Settings = () => {
    const academyName = useAcademyName();
    const academyLogo = useAcademyLogo();
    const academyTagline = useAcademyTagline();
    const adminPhone = useAdminPhone();
    const academyAddress = useAcademyAddress();
    const themeColor = useThemeColor();
    const notificationsEnabled = useNotificationsEnabled();
    const maintenanceMode = useMaintenanceMode();
    const whatsappAutoNotify = useWhatsappAutoNotify();
    const whatsappTemplate = useWhatsappTemplate();
    const defaultSessionPrice = useDefaultSessionPrice();
    const defaultTeacherPrice = useDefaultTeacherPrice();
    const currencySymbol = useCurrencySymbol();
    const semesterName = useSemesterName();
    const semesters = useSemesters();
    const balanceWarningThreshold = useBalanceWarningThreshold();
    const backdateLockEnabled = useBackdateLockEnabled();
    const teacherCommissionType = useTeacherCommissionType();
    const autoFreezeThreshold = useAutoFreezeThreshold();
    const telegramHandle = useTelegramHandle();
    const heroBanners = useHeroBanners();
    const reminderMinutesBefore = useReminderMinutesBefore();
    const whatsappNumbers = useWhatsappNumbers();
    const currentUser = useCurrentUser();
    const user = currentUser || { id: 'guest', name: 'ضيف', username: 'guest' };
    const users = useUsers();
    const addUser = useAddUser();
    const editUser = useEditUser();
    const deleteUser = useDeleteUser();

    const setSetting = useSetSetting();
    const setAcademyName = (v: string) => setSetting('academyName', v);
    const setAcademyLogo = (v: string) => setSetting('academyLogo', v);
    const setAcademyTagline = (v: string) => setSetting('academyTagline', v);
    const setAdminPhone = (v: string) => setSetting('adminPhone', v);
    const setAcademyAddress = (v: string) => setSetting('academyAddress', v);
    const setThemeColor = (v: string) => setSetting('themeColor', v);
    const setNotificationsEnabled = (v: boolean) => setSetting('notificationsEnabled', v);
    const setMaintenanceMode = (v: boolean) => setSetting('maintenanceMode', v);
    const setWhatsappAutoNotify = (v: boolean) => setSetting('whatsappAutoNotify', v);
    const setWhatsappTemplate = (v: string) => setSetting('whatsappTemplate', v);
    const setDefaultSessionPrice = (v: number) => setSetting('defaultSessionPrice', v);
    const setDefaultTeacherPrice = (v: number) => setSetting('defaultTeacherPrice', v);
    const setCurrencySymbol = (v: string) => setSetting('currencySymbol', v);
    const setSemesterName = (v: string) => setSetting('semesterName', v);
    const setSemesters = (v: string) => setSetting('semesters', v);
    const setBalanceWarningThreshold = (v: number) => setSetting('balanceWarningThreshold', v);
    const setBackdateLockEnabled = (v: boolean) => setSetting('backdateLockEnabled', v);
    const setTeacherCommissionType = (v: string) => setSetting('teacherCommissionType', v as 'percentage' | 'fixed');
    const setAutoFreezeThreshold = (v: string) => setSetting('autoFreezeThreshold', Number(v));
    const setTelegramHandle = (v: string) => setSetting('telegramHandle', v);
    const setHeroBanners = (v: string) => setSetting('heroBanners', v);
    const setReminderMinutesBefore = (v: string) => setSetting('reminderMinutesBefore', Number(v));
    const setWhatsappNumbers = (v: string) => setSetting('whatsappNumbers', v);

    const [activeTab, setActiveTab] = useState<TabId>('general');
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [auditLogs, setAuditLogs] = useState<{ timestamp: string; username: string; action: string }[]>([]);
    const [localAcademyName, setLocalAcademyName] = useState(academyName);
    const [localAcademyLogo, setLocalAcademyLogo] = useState(academyLogo);
    const [localAcademyTagline, setLocalAcademyTagline] = useState(academyTagline);
    const [localAdminPhone, setLocalAdminPhone] = useState(adminPhone);
    const [localSemesterName, setLocalSemesterName] = useState(semesterName);
    const [localSemesters, setLocalSemesters] = useState(semesters);
    const [localWhatsappTemplate, setLocalWhatsappTemplate] = useState(whatsappTemplate);
    const [localTelegramHandle, setLocalTelegramHandle] = useState(telegramHandle);
    const [academyEmail, setAcademyEmail] = useState('');
    const [localHeroBanners, setLocalHeroBanners] = useState<string[]>(() => {
        try { return JSON.parse(heroBanners); } catch (e) { console.warn(e); return ["", "", "", ""]; }
    });
    const [localPrice, setLocalPrice] = useState(defaultSessionPrice);
    const [localTeacherPrice, setLocalTeacherPrice] = useState(defaultTeacherPrice);
    const [localCurrency, setLocalCurrency] = useState(currencySymbol);
    const [localThreshold, setLocalThreshold] = useState(balanceWarningThreshold);
    const [localBackdateLock, setLocalBackdateLock] = useState(backdateLockEnabled);
    const [localAutoFreeze, setLocalAutoFreeze] = useState(autoFreezeThreshold);
    const [newUser, setNewUser] = useState({ username: '', password: '', permissions: [] as string[] });
    const [editingUserId, setEditingUserId] = useState<string | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState<boolean | { id: string; username: string }>(false);
    const [secureAction, setSecureAction] = useState<{
        type: 'reset' | 'archive'; title: string; description: string;
        confirmWord: string; actionFn: () => void
    } | null>(null);
    const [secureInput, setSecureInput] = useState('');
    const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState('');

    const fetchLogs = useCallback(async () => {
        try { const logs = await settingsService.getAuditLogs(); setAuditLogs(logs || []); } catch (e) { console.error(e); }
    }, []);

    const handleExportBackup = async () => {
        setIsSaving(true);
        try {
            const backupData = await settingsService.getBackup();
            const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = `darin_backup_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a); a.click(); a.remove();
            showNotify('تم تحميل النسخة الاحتياطية بنجاح');
        } catch (e: unknown) { alert('فشل تصدير البيانات: ' + (e instanceof Error ? e.message : 'خطأ غير متوقع')); }
        finally { setIsSaving(false); }
    };

    const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!await confirm({ message: 'استيراد البيانات سيؤدي إلى استبدال كافة البيانات الحالية. هل أنت متأكد؟', isDestructive: true })) { e.target.value = ''; return; }
        const reader = new FileReader();
        reader.onload = async (event) => {
            setIsSaving(true);
            try {
                await settingsService.restoreBackup(JSON.parse(event.target?.result as string));
                showNotify('تم استيراد البيانات بنجاح');
                setTimeout(() => window.location.reload(), 2000);
            } catch (e: unknown) { alert(`⚠️ ${e instanceof Error ? e.message : 'خطأ غير متوقع'}`); }
            finally { setIsSaving(false); e.target && (e.target.value = ''); }
        };
        reader.readAsText(file);
    };

    const triggerReset = () => {
        setSecureAction({
            type: 'reset', title: 'تصفير كافة الحسابات والبيانات',
            description: 'هذا الإجراء سيقوم بحذف كافة السجلات المالية وحصص الطلاب والمعلمين.',
            confirmWord: 'إعادة-تعيين-كل-البيانات',
            actionFn: async () => {
                setIsSaving(true);
                try { await settingsService.systemReset(); showNotify('تم تصفير النظام بنجاح'); window.location.reload(); }
                catch (e: unknown) { alert(e instanceof Error ? e.message : 'خطأ غير متوقع'); }
                finally { setIsSaving(false); }
            }
        });
    };

    const triggerArchive = () => {
        setSecureAction({
            type: 'archive', title: 'أرشفة بيانات الموسم الحالي',
            description: 'سيتم نقل كافة السجلات الحالية إلى الأرشيف.',
            confirmWord: 'أرشفة-الآن',
            actionFn: async () => {
                setIsSaving(true);
                try { await settingsService.archiveMonth(); showNotify('تمت الأرشفة بنجاح'); }
                catch (e: unknown) { alert(e instanceof Error ? e.message : 'خطأ غير متوقع'); }
                finally { setIsSaving(false); }
            }
        });
    };

    useEffect(() => {
        const timer = setTimeout(() => { setLoading(false); if (activeTab === 'audit') fetchLogs(); }, 300);
        return () => clearTimeout(timer);
    }, [activeTab, fetchLogs]);

    useEffect(() => {
        setLocalAcademyName(academyName); setLocalAcademyLogo(academyLogo);
        setLocalAcademyTagline(academyTagline); setLocalAdminPhone(adminPhone);
        setLocalSemesterName(semesterName); setLocalSemesters(semesters);
        setLocalPrice(defaultSessionPrice); setLocalTeacherPrice(defaultTeacherPrice);
        setLocalCurrency(currencySymbol); setLocalThreshold(balanceWarningThreshold);
        setLocalTelegramHandle(telegramHandle);
        setLocalBackdateLock(backdateLockEnabled); setLocalAutoFreeze(autoFreezeThreshold);
    }, [academyName, academyLogo, academyTagline, adminPhone, semesterName, semesters, defaultSessionPrice, defaultTeacherPrice, currencySymbol, balanceWarningThreshold, telegramHandle, backdateLockEnabled, autoFreezeThreshold]);

    useEffect(() => {
        try { setLocalHeroBanners(JSON.parse(heroBanners)); } catch (e) { console.warn('Failed to parse heroBanners:', e); }
    }, [heroBanners]);

    const showNotify = (msg: string) => { setNotificationMessage(msg); setShowSuccess(true); setTimeout(() => setShowSuccess(false), 3000); };

    const handleSaveGeneral = async () => {
        setIsSaving(true);
        try {
            await Promise.all([
                setSetting('academyName', localAcademyName),
                setSetting('academyLogo', localAcademyLogo),
                setSetting('academyTagline', localAcademyTagline),
                setSetting('adminPhone', localAdminPhone),
                setSetting('semesterName', localSemesterName),
                setSetting('telegramHandle', localTelegramHandle),
                setSetting('defaultSessionPrice', Number(localPrice)),
                setSetting('defaultTeacherPrice', Number(localTeacherPrice)),
                setSetting('currencySymbol', localCurrency),
                setSetting('balanceWarningThreshold', Number(localThreshold)),
                setSetting('backdateLockEnabled', localBackdateLock),
                setSetting('autoFreezeThreshold', Number(localAutoFreeze)),
            ]);
            showNotify('تم حفظ الإعدادات بنجاح');
        } catch (e) { console.error('Save error:', e); alert('خطأ في الحفظ'); }
        finally { setIsSaving(false); }
    };

    const handleUserAction = () => {
        if (!newUser.username) return;
        if (editingUserId) {
            editUser(editingUserId, { username: newUser.username, name: newUser.username, permissions: newUser.permissions, password: newUser.password || undefined });
            setEditingUserId(null);
        } else { addUser({ ...newUser, name: newUser.username, role: 'admin' }); }
        setNewUser({ username: '', password: '', permissions: [] });
    };

    if (loading) return (
        <div className="p-4 space-y-3">
            <Skeleton className="h-14" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                {[...Array(4)].map((_, i) => <Skeleton key={`setting-${i}`} className="h-10" />)}
            </div>
            <Skeleton className="h-64" />
        </div>
    );

    return (
        <div className="space-y-0 pb-24 min-h-full max-w-full w-full overflow-x-hidden" dir="rtl">
            <div className="bg-primary px-4 md:px-6 py-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-white/15">
                        <SettingsIcon size={22} className="text-on-primary" />
                    </div>
                    <div>
                        <h1 className="text-lg md:text-xl font-black text-on-primary leading-tight">مركز الإعدادات</h1>
                        <p className="text-xs font-bold text-on-primary opacity-70 mt-0.5">إدارة كافة إعدادات النظام من مكان واحد</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-micro font-bold px-3 py-1.5 bg-white/15 text-on-primary">
                    <SettingsIcon size={12} />
                    {TABS.find(t => t.id === activeTab)?.label}
                </div>
            </div>
            <div className="bg-primary px-2 md:px-4 py-1">
                <div className="flex overflow-x-auto no-scrollbar gap-1">
                    {TABS.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={cn('flex items-center gap-2 px-4 py-3 text-sm font-bold whitespace-nowrap transition-all tracking-tight',
                                activeTab === tab.id ? 'bg-card text-primary shadow-sm' : 'text-on-primary opacity-70 hover:text-on-primary')}>
                            <tab.icon size={15} />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>
            <div className="px-3 md:px-5 lg:px-8 pt-4 md:animate-in md:fade-in md:slide-in-from-bottom-2 md:duration-400">
                <SettingsTabContent
                    activeTab={activeTab}
                    localAcademyName={localAcademyName} setLocalAcademyName={setLocalAcademyName}
                    localAcademyLogo={localAcademyLogo} setLocalAcademyLogo={setLocalAcademyLogo}
                    localAcademyTagline={localAcademyTagline} setLocalAcademyTagline={setLocalAcademyTagline}
                    localAdminPhone={localAdminPhone} setLocalAdminPhone={setLocalAdminPhone}
                    localTelegramHandle={localTelegramHandle} setLocalTelegramHandle={setLocalTelegramHandle}
                    localSemesterName={localSemesterName} setLocalSemesterName={setLocalSemesterName}
                    localSemesters={localSemesters} setLocalSemesters={setLocalSemesters}
                    localPrice={localPrice} localTeacherPrice={localTeacherPrice}
                    localCurrency={localCurrency} localThreshold={localThreshold}
                    localAutoFreeze={localAutoFreeze} localBackdateLock={localBackdateLock}
                    setLocalPrice={setLocalPrice} setLocalTeacherPrice={setLocalTeacherPrice}
                    setLocalCurrency={setLocalCurrency} setLocalThreshold={setLocalThreshold}
                    setLocalAutoFreeze={setLocalAutoFreeze} setLocalBackdateLock={setLocalBackdateLock}
                    academyAddress={academyAddress} setAcademyAddress={setAcademyAddress}
                    academyEmail={academyEmail} setAcademyEmail={setAcademyEmail}
                    localHeroBanners={localHeroBanners} setLocalHeroBanners={setLocalHeroBanners}
                    themeColor={themeColor} setThemeColor={setThemeColor}
                    notificationsEnabled={notificationsEnabled} setNotificationsEnabled={setNotificationsEnabled}
                    newUser={newUser} setNewUser={setNewUser}
                    editingUserId={editingUserId} setEditingUserId={setEditingUserId}
                    setShowDeleteModal={setShowDeleteModal}
                    handleUserAction={handleUserAction}
                    handleSaveGeneral={handleSaveGeneral} isSaving={isSaving}
                    showNotify={showNotify}
                    maintenanceMode={maintenanceMode}
                    setShowMaintenanceModal={setShowMaintenanceModal} setMaintenanceMode={setMaintenanceMode}
                    handleExportBackup={handleExportBackup} handleImportBackup={handleImportBackup}
                    triggerReset={triggerReset} triggerArchive={triggerArchive}
                    setSecureAction={setSecureAction}
                    setWhatsappTemplate={setWhatsappTemplate}
                    whatsappAutoNotify={whatsappAutoNotify} setWhatsappAutoNotify={setWhatsappAutoNotify}
                    localWhatsappTemplate={localWhatsappTemplate} setLocalWhatsappTemplate={setLocalWhatsappTemplate}
                    academyName={academyName} academyLogo={academyLogo} academyTagline={academyTagline}
                    user={user} users={users}
                    whatsappNumbers={whatsappNumbers} setWhatsappNumbers={setWhatsappNumbers}
                    backdateLockEnabled={backdateLockEnabled} setBackdateLockEnabled={setBackdateLockEnabled}
                    teacherCommissionType={teacherCommissionType} setTeacherCommissionType={setTeacherCommissionType}
                    autoFreezeThreshold={autoFreezeThreshold} setAutoFreezeThreshold={setAutoFreezeThreshold}
                    reminderMinutesBefore={reminderMinutesBefore} setReminderMinutesBefore={setReminderMinutesBefore}
                    setSemesterName={setSemesterName} setSemesters={setSemesters}
                    auditLogs={auditLogs} fetchLogs={fetchLogs} />
            </div>
            <SecureActionModal secureAction={secureAction} secureInput={secureInput} setSecureInput={setSecureInput} setSecureAction={setSecureAction} />
            <DeleteUserModal showDeleteModal={showDeleteModal} setShowDeleteModal={setShowDeleteModal} deleteUser={deleteUser} showNotify={showNotify} />
            <MaintenanceModal showMaintenanceModal={showMaintenanceModal} setShowMaintenanceModal={setShowMaintenanceModal} setMaintenanceMode={setMaintenanceMode} showNotify={showNotify} />
            <SuccessToast showSuccess={showSuccess} message={notificationMessage} />
        </div>
    );
};

export default Settings;
