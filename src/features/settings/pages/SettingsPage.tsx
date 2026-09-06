import { useEffect } from 'react'
import { Settings as SettingsIcon, Wrench } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Skeleton } from '../../../shared/components/ui'
import { cn } from '../../../lib/utils'
import { SecureActionModal } from '../components/SecureActionModal'
import { DeleteUserModal } from '../components/DeleteUserModal'
import { MaintenanceModal } from '../components/MaintenanceModal'
import { PasswordConfirmModal } from '../components/PasswordConfirmModal'
import { SuccessToast } from '../components/SuccessToast'
import { TABS, SettingsTabContent } from './settings-page'
import { useSettingsHandlers } from '../hooks/useSettingsHandlers'
import { useAcademyName } from '../../../context/AppContext'

const tabGroups = [
  { label: 'عام', items: ['general', 'academy', 'academic-year'] },
  { label: 'النظام', items: ['users', 'permissions', 'policies', 'working-hours'] },
  { label: 'المالية والتقارير', items: ['currencies', 'reports', 'rewards'] },
  { label: 'الاتصالات', items: ['communications', 'mobile'] },
  { label: 'المظهر', items: ['appearance', 'attendance'] },
  { label: 'الصيانة', items: ['backup', 'advanced', 'audit'] },
]

export const Settings = () => {
  const academyName = useAcademyName()
  useEffect(() => {
    document.title = `الإعدادات | ${academyName} للتعليم والتدريب`
  }, [academyName])
  const h = useSettingsHandlers()

  const activeTabLabel = TABS.find((t) => t.id === h.activeTab)?.label || ''

  if (h.loading)
    return (
      <div className="from-primary-soft/30 mx-auto max-w-page space-y-3 bg-gradient-to-b via-background to-background px-2 pt-4">
        <Skeleton className="h-[76px] rounded-2xl" />
        <Skeleton className="h-14 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    )

  return (
    <div
      className="from-primary-soft/30 relative min-h-full overflow-x-hidden bg-gradient-to-b via-background to-background"
      dir="rtl"
    >
      <div className="mx-auto max-w-page px-2">
        {/* Header strip */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-3 rounded-2xl border border-border bg-card p-4 shadow-elevation-1 md:p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-soft">
              <SettingsIcon size={20} strokeWidth={1.9} className="text-primary" />
            </span>
            <div>
              <h1 className="text-lg font-black leading-tight tracking-tight text-main md:text-xl">
                إعدادات النظام
              </h1>
              <p className="mt-0.5 text-[11px] font-bold text-muted">
                تكوين المنصة والصلاحيات والمالية
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {h.maintenanceMode && (
              <span className="flex items-center gap-1.5 rounded-lg border border-warning-soft bg-warning-soft px-2.5 py-1.5 text-[10px] font-black text-warning-dark">
                <Wrench size={11} />
                وضع الصيانة مفعّل
              </span>
            )}
            <span className="rounded-lg bg-primary-soft px-2.5 py-1.5 text-[10px] font-black text-primary">
              {activeTabLabel}
            </span>
          </div>
        </div>

        {/* Mobile — grouped native select (OS picker, zero layout cost) */}
        <div className="mb-4 md:hidden">
          <label className="sr-only" htmlFor="settings-tab-select">
            اختيار قسم الإعدادات
          </label>
          <select
            id="settings-tab-select"
            value={h.activeTab}
            onChange={(e) => h.setActiveTab(e.target.value)}
            className="h-11 w-full appearance-none rounded-xl border border-border bg-card px-4 text-sm font-bold text-main shadow-elevation-1 outline-none transition-all focus:border-primary/60 focus:ring-2 focus:ring-primary/10 dark:[color-scheme:dark]"
          >
            {tabGroups.map((group) => (
              <optgroup key={group.label} label={group.label}>
                {group.items.map((tabId) => {
                  const tab = TABS.find((t) => t.id === tabId)
                  if (!tab) return null
                  return (
                    <option key={tab.id} value={tab.id}>
                      {tab.label}
                    </option>
                  )
                })}
              </optgroup>
            ))}
          </select>
        </div>

        {/* Tabs — single scrollable row (desktop) */}
        <div className="scrollbar-none mb-4 hidden overflow-x-auto rounded-2xl border border-border bg-card p-2 shadow-elevation-1 md:block">
          <div className="flex min-w-max items-center gap-1">
            {tabGroups.map((group, gi) => (
              <div
                key={group.label}
                className={cn(
                  'flex items-center gap-1',
                  gi > 0 && 'ms-1.5 border-s border-divider ps-1.5',
                )}
              >
                {group.items.map((tabId) => {
                  const tab = TABS.find((t) => t.id === tabId)
                  if (!tab) return null
                  const isActive = h.activeTab === tabId
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => h.setActiveTab(tab.id)}
                      aria-current={isActive ? 'page' : undefined}
                      title={tab.label}
                      className={cn(
                        'flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-2 text-[11px] font-bold outline-none transition-all focus-visible:ring-2 focus-visible:ring-focus',
                        isActive
                          ? 'bg-primary text-on-primary shadow-elevation-1'
                          : 'text-muted hover:bg-hover hover:text-main',
                      )}
                    >
                      <Icon size={13} />
                      <span>{tab.label}</span>
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={h.activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <SettingsTabContent
              activeTab={h.activeTab}
              localAcademyName={h.localAcademyName}
              setLocalAcademyName={h.setLocalAcademyName}
              localAcademyLogo={h.localAcademyLogo}
              setLocalAcademyLogo={h.setLocalAcademyLogo}
              localAcademyTagline={h.localAcademyTagline}
              setLocalAcademyTagline={h.setLocalAcademyTagline}
              localAdminPhone={h.localAdminPhone}
              setLocalAdminPhone={h.setLocalAdminPhone}
              localTelegramHandle={h.localTelegramHandle}
              setLocalTelegramHandle={h.setLocalTelegramHandle}
              localSemesterName={h.localSemesterName}
              setLocalSemesterName={h.setLocalSemesterName}
              localSemesters={h.localSemesters}
              setLocalSemesters={h.setLocalSemesters}
              localPrice={h.localPrice}
              localTeacherPrice={h.localTeacherPrice}
              localCurrency={h.localCurrency}
              localThreshold={h.localThreshold}
              localAutoFreeze={h.localAutoFreeze}
              localBackdateLock={h.localBackdateLock}
              setLocalPrice={h.setLocalPrice}
              setLocalTeacherPrice={h.setLocalTeacherPrice}
              setLocalCurrency={h.setLocalCurrency}
              setLocalThreshold={h.setLocalThreshold}
              setLocalAutoFreeze={h.setLocalAutoFreeze}
              setLocalBackdateLock={h.setLocalBackdateLock}
              setMaintenanceTarget={h.setMaintenanceTarget}
              setShowBackdateModal={h.setShowBackdateModal}
              setBackdateTarget={h.setBackdateTarget}
              localLibraryTelegram={h.localLibraryTelegram}
              setLocalLibraryTelegram={h.setLocalLibraryTelegram}
              localAcademicYear={h.localAcademicYear}
              setLocalAcademicYear={h.setLocalAcademicYear}
              localSemesterStart={h.localSemesterStart}
              setLocalSemesterStart={h.setLocalSemesterStart}
              localSemesterEnd={h.localSemesterEnd}
              setLocalSemesterEnd={h.setLocalSemesterEnd}
              localFooterDescription={h.localFooterDescription}
              setLocalFooterDescription={h.setLocalFooterDescription}
              localFooterAddress={h.localFooterAddress}
              setLocalFooterAddress={h.setLocalFooterAddress}
              localFooterInstagram={h.localFooterInstagram}
              setLocalFooterInstagram={h.setLocalFooterInstagram}
              academyAddress={h.academyAddress}
              setAcademyAddress={h.setAcademyAddress}
              localHeroBanners={h.localHeroBanners}
              setLocalHeroBanners={h.setLocalHeroBanners}
              themeColor={h.themeColor}
              setThemeColor={h.setThemeColor}
              notificationsEnabled={h.notificationsEnabled}
              setNotificationsEnabled={h.setNotificationsEnabled}
              newUser={h.newUser}
              setNewUser={h.setNewUser}
              editingUserId={h.editingUserId}
              setEditingUserId={h.setEditingUserId}
              setShowDeleteModal={h.setShowDeleteModal}
              handleUserAction={h.handleUserAction}
              handleSaveGeneral={h.handleSaveGeneral}
              isSaving={h.isSaving}
              showNotify={h.showNotify}
              maintenanceMode={h.maintenanceMode}
              setShowMaintenanceModal={h.setShowMaintenanceModal}
              setMaintenanceMode={h.setMaintenanceMode}
              handleExportBackup={h.handleExportBackup}
              handleImportBackup={h.handleImportBackup}
              triggerReset={h.triggerReset}
              triggerArchive={h.triggerArchive}
              setSecureAction={h.setSecureAction}
              setWhatsappTemplate={h.setWhatsappTemplate}
              whatsappAutoNotify={h.whatsappAutoNotify}
              setWhatsappAutoNotify={h.setWhatsappAutoNotify}
              localWhatsappTemplate={h.localWhatsappTemplate}
              setLocalWhatsappTemplate={h.setLocalWhatsappTemplate}
              academyName={h.academyName}
              academyLogo={h.academyLogo}
              academyTagline={h.academyTagline}
              user={h.user}
              users={h.users}
              whatsappNumbers={h.whatsappNumbers}
              setWhatsappNumbers={h.setWhatsappNumbers}
              backdateLockEnabled={h.backdateLockEnabled}
              setBackdateLockEnabled={h.setBackdateLockEnabled}
              teacherCommissionType={h.teacherCommissionType}
              setTeacherCommissionType={h.setTeacherCommissionType}
              autoFreezeThreshold={h.autoFreezeThreshold}
              setAutoFreezeThreshold={h.setAutoFreezeThreshold}
              reminderMinutesBefore={h.reminderMinutesBefore}
              setReminderMinutesBefore={h.setReminderMinutesBefore}
              setSemesterName={h.setSemesterName}
              setSemesters={h.setSemesters}
              auditLogs={h.auditLogs}
              fetchLogs={h.fetchLogs}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <SecureActionModal
        secureAction={h.secureAction}
        secureInput={h.secureInput}
        setSecureInput={h.setSecureInput}
        setSecureAction={h.setSecureAction}
      />
      <DeleteUserModal
        showDeleteModal={h.showDeleteModal}
        setShowDeleteModal={h.setShowDeleteModal}
        deleteUser={h.deleteUser}
        showNotify={h.showNotify}
      />
      <MaintenanceModal
        showMaintenanceModal={h.showMaintenanceModal}
        setShowMaintenanceModal={h.setShowMaintenanceModal}
        maintenanceTarget={h.maintenanceTarget}
        setMaintenanceTarget={h.setMaintenanceTarget}
        setMaintenanceMode={h.setMaintenanceMode}
        showNotify={h.showNotify}
      />
      <PasswordConfirmModal
        show={h.showBackdateModal}
        title={h.backdateTarget ? 'تفعيل قفل تعديل الحصص القديمة' : 'إلغاء قفل تعديل الحصص القديمة'}
        description="منع أو السماح بتسجيل حصص بتواريخ سابقة. هذا الإجراء حساس ولا يمكن تنفيذه إلا بكلمة مرور المسؤول."
        confirmLabel={h.backdateTarget ? 'تفعيل القفل' : 'إلغاء القفل'}
        onConfirm={h.confirmBackdateToggle}
        onClose={() => h.setShowBackdateModal(false)}
      />
      <SuccessToast showSuccess={h.showSuccess} message={h.notificationMessage} />
    </div>
  )
}

export default Settings
