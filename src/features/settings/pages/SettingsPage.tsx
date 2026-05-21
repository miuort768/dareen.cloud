import { useState, useEffect } from 'react';
import {
    Settings as SettingsIcon, Palette, Users, Smartphone, Lock,
    Shield, Activity, Sparkles
} from 'lucide-react';
import { useApp } from '../../../context/useApp';
import { Skeleton } from '../../../components/ui/Skeleton';
import { cn } from '../../../lib/utils';
import { settingsService } from '../services/settingsService';
import { GeneralSettings } from '../components/GeneralSettings';
import { MobileSettings } from '../components/MobileSettings';
import { AppearanceSection as AppearanceSettings } from '../components/AppearanceSection';
import { UsersSettings } from '../components/UsersSettings';
import { PoliciesSettings } from '../components/PoliciesSettings';
import { AdvancedSettings } from '../components/AdvancedSettings';
import { AuditLogSection } from '../components/AuditLog';
import { SecureActionModal } from '../components/SecureActionModal';
import { DeleteUserModal } from '../components/DeleteUserModal';
import { MaintenanceModal } from '../components/MaintenanceModal';
import { SuccessToast } from '../components/SuccessToast';

type TabId = 'general' | 'appearance' | 'users' | 'mobile' | 'policies' | 'advanced' | 'audit';

export const Settings = () => {
    const {
        academyName, setAcademyName,
        academyLogo, setAcademyLogo,
        academyTagline, setAcademyTagline,
        adminPhone, setAdminPhone,
        themeColor, setThemeColor,
        notificationsEnabled, setNotificationsEnabled,
        maintenanceMode, setMaintenanceMode,
        whatsappAutoNotify, setWhatsappAutoNotify,
        whatsappTemplate, setWhatsappTemplate,
        defaultSessionPrice, setDefaultSessionPrice,
        defaultTeacherPrice, setDefaultTeacherPrice,
        currencySymbol, setCurrencySymbol,
        semesterName, setSemesterName,
        semesters, setSemesters,
        balanceWarningThreshold, setBalanceWarningThreshold,
        backdateLockEnabled, setBackdateLockEnabled,
        teacherCommissionType, setTeacherCommissionType,
        autoFreezeThreshold, setAutoFreezeThreshold,
        telegramHandle, setTelegramHandle,
        heroBanners, setHeroBanners,
        reminderMinutesBefore, setReminderMinutesBefore,
        user, users, addUser, editUser, deleteUser
    } = useApp();

    const [activeTab, setActiveTab] = useState<TabId>('general');
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [auditLogs, setAuditLogs] = useState<any[]>([]);

    const [localAcademyName, setLocalAcademyName] = useState(academyName);
    const [localAcademyLogo, setLocalAcademyLogo] = useState(academyLogo);
    const [localAcademyTagline, setLocalAcademyTagline] = useState(academyTagline);
    const [localAdminPhone, setLocalAdminPhone] = useState(adminPhone);
    const [localSemesterName, setLocalSemesterName] = useState(semesterName);
    const [localSemesters, setLocalSemesters] = useState(semesters);
    const [localWhatsappTemplate, setLocalWhatsappTemplate] = useState(whatsappTemplate);
    const [localTelegramHandle, setLocalTelegramHandle] = useState(telegramHandle);

    const [localHeroBanners, setLocalHeroBanners] = useState<string[]>(() => {
        try {
            return JSON.parse(heroBanners);
        } catch {
            return ["", "", "", ""];
        }
    });

    const [localPrice, setLocalPrice] = useState(defaultSessionPrice);
    const [localTeacherPrice, setLocalTeacherPrice] = useState(defaultTeacherPrice);
    const [localCurrency, setLocalCurrency] = useState(currencySymbol);
    const [localThreshold, setLocalThreshold] = useState(balanceWarningThreshold);
    const [localBackdateLock, setLocalBackdateLock] = useState(backdateLockEnabled);
    const [localAutoFreeze, setLocalAutoFreeze] = useState(autoFreezeThreshold);

    const [newUser, setNewUser] = useState({ username: '', password: '', permissions: [] as string[] });
    const [editingUserId, setEditingUserId] = useState<string | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState<any>(null);
    const [secureAction, setSecureAction] = useState<{
        type: 'reset' | 'archive'; title: string; description: string;
        confirmWord: string; actionFn: () => void
    } | null>(null);
    const [secureInput, setSecureInput] = useState('');
    const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState('');

    const [hapticEnabled, setHapticEnabled] = useState(() => localStorage.getItem('haptic_enabled') !== 'false');

    const handleExportBackup = async () => {
        setIsSaving(true);
        try {
            const backupData = await settingsService.getBackup();
            const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = `darin_backup_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            showNotify('تم تحميل النسخة الاحتياطية بنجاح');
        } catch (e: any) {
            alert('فشل تصدير البيانات: ' + e.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!window.confirm('⚠️ تحذير: استيراد البيانات سيؤدي إلى استبدال كافة البيانات الحالية بالبيانات الموجودة في الملف. هل أنت متأكد؟')) {
            e.target.value = '';
            return;
        }
        const reader = new FileReader();
        reader.onload = async (event) => {
            setIsSaving(true);
            try {
                const content = event.target?.result as string;
                await settingsService.restoreBackup(JSON.parse(content));
                showNotify('تم استيراد البيانات بنجاح! سيتم تحديث الصفحة...');
                setTimeout(() => window.location.reload(), 2000);
            } catch (e: any) {
                console.error('Import Error:', e);
                alert(`⚠️ عذراً: فشل الاستيراد - ${e.message}`);
            } finally {
                setIsSaving(false);
                if (e.target) e.target.value = '';
            }
        };
        reader.readAsText(file);
    };

    const triggerReset = () => {
        setSecureAction({
            type: 'reset',
            title: 'تصفير كافة الحسابات والبيانات',
            description: 'هذا الإجراء سيقوم بحذف كافة السجلات المالية وحصص الطلاب والمعلمين وتصفير الأرصدة. لا يمكن التراجع عن هذا الإجراء.',
            confirmWord: 'RESET-ALL-DATA',
            actionFn: async () => {
                setIsSaving(true);
                try {
                    await settingsService.systemReset();
                    showNotify('تم تصفير النظام بنجاح');
                    window.location.reload();
                } catch (e: any) { alert(e.message); }
                finally { setIsSaving(false); }
            }
        });
    };

    const triggerArchive = () => {
        setSecureAction({
            type: 'archive',
            title: 'أرشفة بيانات الموسم الحالي',
            description: 'سيتم نقل كافة السجلات الحالية إلى الأرشيف التاريخي وبدء موسم جديد ببيانات نظيفة.',
            confirmWord: 'ARCHIVE-NOW',
            actionFn: async () => {
                setIsSaving(true);
                try {
                    await settingsService.archiveMonth();
                    showNotify('تمت الأرشفة بنجاح');
                } catch (e: any) { alert(e.message); }
                finally { setIsSaving(false); }
            }
        });
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
            if (activeTab === 'audit') fetchLogs();
        }, 300);
        return () => clearTimeout(timer);
    }, [activeTab]);

    useEffect(() => {
        setLocalAcademyName(academyName);
        setLocalAcademyLogo(academyLogo);
        setLocalAcademyTagline(academyTagline);
        setLocalAdminPhone(adminPhone);
        setLocalSemesterName(semesterName);
        setLocalSemesters(semesters);
        setLocalPrice(defaultSessionPrice);
        setLocalTeacherPrice(defaultTeacherPrice);
        setLocalCurrency(currencySymbol);
        setLocalThreshold(balanceWarningThreshold);
        setLocalTelegramHandle(telegramHandle);
        setLocalBackdateLock(backdateLockEnabled);
        setLocalAutoFreeze(autoFreezeThreshold);
    }, [
        academyName, academyLogo, academyTagline, adminPhone,
        semesterName, semesters, defaultSessionPrice,
        defaultTeacherPrice, currencySymbol, balanceWarningThreshold,
        telegramHandle, backdateLockEnabled, autoFreezeThreshold
    ]);

    useEffect(() => {
        try {
            setLocalHeroBanners(JSON.parse(heroBanners));
        } catch {
            /* keep existing if parse fails */
        }
    }, [heroBanners]);

    const fetchLogs = async () => {
        try {
            const logs = await settingsService.getAuditLogs();
            setAuditLogs(logs || []);
        } catch (e) { console.error(e); }
    };

    const showNotify = (msg: string) => {
        setNotificationMessage(msg);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
    };

    const handleSaveGeneral = async () => {
        setIsSaving(true);
        try {
            await Promise.all([
                setAcademyName(localAcademyName),
                setAcademyLogo(localAcademyLogo),
                setAcademyTagline(localAcademyTagline),
                setAdminPhone(localAdminPhone),
                setSemesterName(localSemesterName),
                setTelegramHandle(localTelegramHandle),
                setDefaultSessionPrice(Number(localPrice)),
                setDefaultTeacherPrice(Number(localTeacherPrice)),
                setCurrencySymbol(localCurrency),
                setBalanceWarningThreshold(Number(localThreshold)),
                setBackdateLockEnabled(localBackdateLock),
                setAutoFreezeThreshold(Number(localAutoFreeze))
            ]);
            showNotify('تم حفظ الإعدادات بنجاح');
        } catch (e) { alert('خطأ في الحفظ'); }
        finally { setIsSaving(false); }
    };

    const handleUserAction = () => {
        if (!newUser.username) return;
        if (editingUserId) {
            editUser(editingUserId, { username: newUser.username, name: newUser.username, permissions: newUser.permissions, password: newUser.password || undefined });
            setEditingUserId(null);
        } else {
            addUser({ ...newUser, name: newUser.username, role: 'admin' });
        }
        setNewUser({ username: '', password: '', permissions: [] });
    };

    const TABS: { id: TabId; label: string; icon: any }[] = [
        { id: 'general', label: 'الإعدادات', icon: SettingsIcon },
        { id: 'appearance', label: 'الهوية', icon: Palette },
        { id: 'users', label: 'المستخدمون', icon: Users },
        { id: 'mobile', label: 'الموبايل', icon: Smartphone },
        { id: 'policies', label: 'السياسات', icon: Lock },
        { id: 'advanced', label: 'الأرشيف', icon: Shield },
        { id: 'audit', label: 'السجلات', icon: Activity },
    ];

    if (loading) return (
        <div className="p-4 space-y-3">
            <Skeleton className="h-14 rounded-2xl" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10 rounded-xl" />)}
            </div>
            <Skeleton className="h-64 rounded-2xl" />
        </div>
    );

    const renderTab = () => {
        switch (activeTab) {
            case 'general':
                return <GeneralSettings
                    localAcademyName={localAcademyName} setLocalAcademyName={setLocalAcademyName}
                    localAcademyLogo={localAcademyLogo} setLocalAcademyLogo={setLocalAcademyLogo}
                    localAcademyTagline={localAcademyTagline} setLocalAcademyTagline={setLocalAcademyTagline}
                    localAdminPhone={localAdminPhone} setLocalAdminPhone={setLocalAdminPhone}
                    localTelegramHandle={localTelegramHandle} setLocalTelegramHandle={setLocalTelegramHandle}
                    localSemesterName={localSemesterName} setLocalSemesterName={setLocalSemesterName}
                    localPrice={localPrice} localTeacherPrice={localTeacherPrice}
                    localCurrency={localCurrency} localThreshold={localThreshold}
                    localAutoFreeze={localAutoFreeze} localBackdateLock={localBackdateLock}
                    setLocalPrice={setLocalPrice} setLocalTeacherPrice={setLocalTeacherPrice}
                    setLocalCurrency={setLocalCurrency} setLocalThreshold={setLocalThreshold}
                    setLocalAutoFreeze={setLocalAutoFreeze} setLocalBackdateLock={setLocalBackdateLock}
                    maintenanceMode={maintenanceMode} setShowMaintenanceModal={setShowMaintenanceModal}
                    setMaintenanceMode={setMaintenanceMode} showNotify={showNotify}
                    isSaving={isSaving} handleSaveGeneral={handleSaveGeneral}
                />;
            case 'mobile':
                return <MobileSettings
                    hapticEnabled={hapticEnabled} setHapticEnabled={setHapticEnabled}
                    showNotify={showNotify}
                />;
            case 'appearance':
                return <AppearanceSettings
                    academyLogo={academyLogo} academyName={academyName}
                    academyTagline={academyTagline} themeColor={themeColor}
                    setThemeColor={setThemeColor} notificationsEnabled={notificationsEnabled}
                    setNotificationsEnabled={setNotificationsEnabled}
                    localHeroBanners={localHeroBanners} setLocalHeroBanners={setLocalHeroBanners}
                    isSaving={isSaving} setHeroBanners={setHeroBanners} showNotify={showNotify}
                    handleExportBackup={handleExportBackup} handleImportBackup={handleImportBackup}
                    triggerReset={triggerReset} triggerArchive={triggerArchive}
                />;
            case 'users':
                return <UsersSettings
                    users={users} user={user} newUser={newUser}
                    setNewUser={setNewUser} editingUserId={editingUserId}
                    setEditingUserId={setEditingUserId} setShowDeleteModal={setShowDeleteModal}
                    handleUserAction={handleUserAction}
                />;
            case 'policies':
                return <PoliciesSettings
                    backdateLockEnabled={backdateLockEnabled}
                    setBackdateLockEnabled={setBackdateLockEnabled}
                    teacherCommissionType={teacherCommissionType}
                    setTeacherCommissionType={setTeacherCommissionType}
                    autoFreezeThreshold={autoFreezeThreshold}
                    setAutoFreezeThreshold={setAutoFreezeThreshold}
                    showNotify={showNotify} setSecureAction={setSecureAction}
                    settingsService={settingsService}
                />;
            case 'advanced':
                return <AdvancedSettings
                    whatsappAutoNotify={whatsappAutoNotify}
                    setWhatsappAutoNotify={setWhatsappAutoNotify}
                    localWhatsappTemplate={localWhatsappTemplate}
                    setLocalWhatsappTemplate={setLocalWhatsappTemplate}
                    setWhatsappTemplate={setWhatsappTemplate} showNotify={showNotify}
                    reminderMinutesBefore={reminderMinutesBefore}
                    setReminderMinutesBefore={setReminderMinutesBefore}
                    localSemesterName={localSemesterName}
                    setLocalSemesterName={setLocalSemesterName}
                    localSemesters={localSemesters} setLocalSemesters={setLocalSemesters}
                    setSemesterName={setSemesterName} setSemesters={setSemesters}
                    setSecureAction={setSecureAction}
                />;
            case 'audit':
                return <AuditLogSection auditLogs={auditLogs} fetchLogs={fetchLogs} />;
            default:
                return null;
        }
    };

    return (
        <div className="space-y-4 pb-24 min-h-full bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 dark:from-[#020617] dark:via-slate-950 dark:to-indigo-950/20 md:animate-in md:fade-in md:duration-700 font-sans" dir="rtl">
            <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-0 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-emerald-400/30 shadow-[0_0_15px_rgba(52,211,153,0.3)] shrink-0 bg-white/5 backdrop-blur-md">
                        <img src="/chat-avatar.jpg" alt="Logo" className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <h1 className="text-sm font-bold text-slate-800 dark:text-white">إعدادات النظام</h1>
                        <p className="text-[10px] text-slate-400">إدارة السياسات والهوية والصلاحيات</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-700">
                    <Sparkles size={12} className="text-amber-400" />
                    {activeTab && TABS.find(t => t.id === activeTab)?.label}
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-none p-2 shadow-sm">
                <div className="flex overflow-x-auto no-scrollbar gap-2 px-0">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                'flex items-center gap-2 px-4 py-3 rounded-xl text-[13px] font-black whitespace-nowrap transition-all uppercase tracking-tight',
                                activeTab === tab.id
                                    ? 'bg-[#5c59f2] text-white shadow-md transform scale-105 z-10'
                                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 bg-slate-50/50 dark:bg-slate-800/50'
                            )}
                        >
                            <tab.icon size={15} />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="px-0 md:animate-in md:fade-in md:slide-in-from-bottom-2 md:duration-400">
                {renderTab()}
            </div>

            <SecureActionModal
                secureAction={secureAction}
                secureInput={secureInput}
                setSecureInput={setSecureInput}
                setSecureAction={setSecureAction}
            />
            <DeleteUserModal
                showDeleteModal={showDeleteModal}
                setShowDeleteModal={setShowDeleteModal}
                deleteUser={deleteUser}
                showNotify={showNotify}
            />
            <MaintenanceModal
                showMaintenanceModal={showMaintenanceModal}
                setShowMaintenanceModal={setShowMaintenanceModal}
                setMaintenanceMode={setMaintenanceMode}
                showNotify={showNotify}
            />
            <SuccessToast showSuccess={showSuccess} message={notificationMessage} />
        </div>
    );
};

export default Settings;
