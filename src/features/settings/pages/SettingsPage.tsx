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
            <div className="bg-surface border border-border/50 rounded-2xl p-3 md:p-4 mb-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-primary-soft flex items-center justify-center">
                            <SettingsIcon size={17} className="text-primary" />
                        </div>
                        <div>
                            <h1 className="text-sm font-bold text-main leading-tight">الإعدادات</h1>
                            <p className="text-[10px] text-dim">{TABS.find(t => t.id === h.activeTab)?.label}</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="bg-surface border border-border/50 rounded-2xl p-1 mx-2 mb-3">
                <div className="flex overflow-x-auto no-scrollbar gap-1">
                    {TABS.map(tab => (
                        <button key={tab.id} onClick={() => h.setActiveTab(tab.id)}
                            className={cn('flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-bold whitespace-nowrap transition-all',
                                h.activeTab === tab.id ? 'bg-primary text-on-primary shadow-sm' : 'text-dim hover:text-main')}>
                            <tab.icon size={13} />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>
            <div className="px-3 md:px-5 lg:px-8 pt-3 md:animate-in md:fade-in md:slide-in-from-bottom-2 md:duration-400">
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
