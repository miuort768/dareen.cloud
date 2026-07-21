import { Settings as SettingsIcon } from 'lucide-react';
import { Skeleton } from '../../../shared/components/ui';
import { cn } from '../../../lib/utils';
import { SecureActionModal } from '../components/SecureActionModal';
import { DeleteUserModal } from '../components/DeleteUserModal';
import { MaintenanceModal } from '../components/MaintenanceModal';
import { SuccessToast } from '../components/SuccessToast';
import { TABS, SettingsTabContent } from './settings-page';
import { useSettingsHandlers } from '../hooks/useSettingsHandlers';

export const Settings = () => {
    const h = useSettingsHandlers();

    if (h.loading) return (
        <div className="p-4 space-y-3">
            <Skeleton className="h-14" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                {[...Array(4)].map((_, i) => <Skeleton key={`setting-${i}`} className="h-10" />)}
            </div>
            <Skeleton className="h-64" />
        </div>
    );

    return (
        <div className="space-y-0 pb-24 min-h-full max-w-page mx-auto overflow-x-hidden" dir="rtl">
            <div className="bg-primary px-4 md:px-6 py-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-white/15">
                        <SettingsIcon size={22} className="text-on-primary" />
                    </div>
                    <div>
                        <h1 className="text-lg md:text-xl font-bold text-on-primary leading-tight">مركز الإعدادات</h1>
                        <p className="text-xs font-bold text-on-primary opacity-70 mt-0.5">إدارة كافة إعدادات النظام من مكان واحد</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-micro font-bold px-3 py-1.5 bg-white/15 text-on-primary">
                    <SettingsIcon size={12} />
                    {TABS.find(t => t.id === h.activeTab)?.label}
                </div>
            </div>
            <div className="bg-primary px-2 md:px-4 py-1">
                <div className="flex overflow-x-auto no-scrollbar gap-1">
                    {TABS.map(tab => (
                        <button key={tab.id} onClick={() => h.setActiveTab(tab.id)}
                            className={cn('flex items-center gap-2 px-4 py-3 text-sm font-bold whitespace-nowrap transition-all tracking-tight',
                                h.activeTab === tab.id ? 'bg-card text-primary shadow-sm' : 'text-on-primary opacity-70 hover:text-on-primary')}>
                            <tab.icon size={15} />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>
            <div className="px-3 md:px-5 lg:px-8 pt-4 md:animate-in md:fade-in md:slide-in-from-bottom-2 md:duration-400">
                <SettingsTabContent
                    activeTab={h.activeTab}
                    localAcademyName={h.localAcademyName} setLocalAcademyName={h.setLocalAcademyName}
                    localAcademyLogo={h.localAcademyLogo} setLocalAcademyLogo={h.setLocalAcademyLogo}
                    localAcademyTagline={h.localAcademyTagline} setLocalAcademyTagline={h.setLocalAcademyTagline}
                    localAdminPhone={h.localAdminPhone} setLocalAdminPhone={h.setLocalAdminPhone}
                    localTelegramHandle={h.localTelegramHandle} setLocalTelegramHandle={h.setLocalTelegramHandle}
                    localSemesterName={h.localSemesterName} setLocalSemesterName={h.setLocalSemesterName}
                    localSemesters={h.localSemesters} setLocalSemesters={h.setLocalSemesters}
                    localPrice={h.localPrice} localTeacherPrice={h.localTeacherPrice}
                    localCurrency={h.localCurrency} localThreshold={h.localThreshold}
                    localAutoFreeze={h.localAutoFreeze} localBackdateLock={h.localBackdateLock}
                    setLocalPrice={h.setLocalPrice} setLocalTeacherPrice={h.setLocalTeacherPrice}
                    setLocalCurrency={h.setLocalCurrency} setLocalThreshold={h.setLocalThreshold}
                    setLocalAutoFreeze={h.setLocalAutoFreeze} setLocalBackdateLock={h.setLocalBackdateLock}
                    academyAddress={h.academyAddress} setAcademyAddress={h.setAcademyAddress}
                    academyEmail={h.academyEmail} setAcademyEmail={h.setAcademyEmail}
                    localHeroBanners={h.localHeroBanners} setLocalHeroBanners={h.setLocalHeroBanners}
                    themeColor={h.themeColor} setThemeColor={h.setThemeColor}
                    notificationsEnabled={h.notificationsEnabled} setNotificationsEnabled={h.setNotificationsEnabled}
                    newUser={h.newUser} setNewUser={h.setNewUser}
                    editingUserId={h.editingUserId} setEditingUserId={h.setEditingUserId}
                    setShowDeleteModal={h.setShowDeleteModal}
                    handleUserAction={h.handleUserAction}
                    handleSaveGeneral={h.handleSaveGeneral} isSaving={h.isSaving}
                    showNotify={h.showNotify}
                    maintenanceMode={h.maintenanceMode}
                    setShowMaintenanceModal={h.setShowMaintenanceModal} setMaintenanceMode={h.setMaintenanceMode}
                    handleExportBackup={h.handleExportBackup} handleImportBackup={h.handleImportBackup}
                    triggerReset={h.triggerReset} triggerArchive={h.triggerArchive}
                    setSecureAction={h.setSecureAction}
                    setWhatsappTemplate={h.setWhatsappTemplate}
                    whatsappAutoNotify={h.whatsappAutoNotify} setWhatsappAutoNotify={h.setWhatsappAutoNotify}
                    localWhatsappTemplate={h.localWhatsappTemplate} setLocalWhatsappTemplate={h.setLocalWhatsappTemplate}
                    academyName={h.academyName} academyLogo={h.academyLogo} academyTagline={h.academyTagline}
                    user={h.user} users={h.users}
                    whatsappNumbers={h.whatsappNumbers} setWhatsappNumbers={h.setWhatsappNumbers}
                    backdateLockEnabled={h.backdateLockEnabled} setBackdateLockEnabled={h.setBackdateLockEnabled}
                    teacherCommissionType={h.teacherCommissionType} setTeacherCommissionType={h.setTeacherCommissionType}
                    autoFreezeThreshold={h.autoFreezeThreshold} setAutoFreezeThreshold={h.setAutoFreezeThreshold}
                    reminderMinutesBefore={h.reminderMinutesBefore} setReminderMinutesBefore={h.setReminderMinutesBefore}
                    setSemesterName={h.setSemesterName} setSemesters={h.setSemesters}
                    auditLogs={h.auditLogs} fetchLogs={h.fetchLogs} />
            </div>
            <SecureActionModal secureAction={h.secureAction} secureInput={h.secureInput} setSecureInput={h.setSecureInput} setSecureAction={h.setSecureAction} />
            <DeleteUserModal showDeleteModal={h.showDeleteModal} setShowDeleteModal={h.setShowDeleteModal} deleteUser={h.deleteUser} showNotify={h.showNotify} />
            <MaintenanceModal showMaintenanceModal={h.showMaintenanceModal} setShowMaintenanceModal={h.setShowMaintenanceModal} setMaintenanceMode={h.setMaintenanceMode} showNotify={h.showNotify} />
            <SuccessToast showSuccess={h.showSuccess} message={h.notificationMessage} />
        </div>
    );
};

export default Settings;
