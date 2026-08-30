import type { TabId } from './SettingsTabs'
import type { Dispatch, SetStateAction } from 'react'
import { useDarkMode } from '../../../../shared/hooks/useDarkMode'
import { GeneralSettings } from '../../components/GeneralSettings'
import { AcademyInfoSection } from '../../components/AcademyInfoSection'
import { AcademicYearSection } from '../../components/AcademicYearSection'
import { CurrenciesSection } from '../../components/CurrenciesSection'
import { PermissionsSection } from '../../components/PermissionsSection'
import { CommunicationsSection } from '../../components/CommunicationsSection'
import { WorkingHoursSection } from '../../components/WorkingHoursSection'
import { AttendanceSettingsSection } from '../../components/AttendanceSettingsSection'
import { ReportsSettingsSection } from '../../components/ReportsSettingsSection'
import { RewardsSettingsSection } from '../../components/RewardsSettingsSection'
import { BackupSection } from '../../components/BackupSection'
import { MobileSettings } from '../../components/MobileSettings'
import { AppearanceSection as AppearanceSettings } from '../../components/AppearanceSection'
import { UsersSettings } from '../../components/UsersSettings'
import { PoliciesSettings } from '../../components/PoliciesSettings'
import { AdvancedSettings } from '../../components/AdvancedSettings'
import { AuditLogSection } from '../../components/AuditLog'

interface SettingsTabContentProps {
  activeTab: TabId
  localAcademyName: string
  setLocalAcademyName: (v: string) => void
  localAcademyLogo: string
  setLocalAcademyLogo: (v: string) => void
  localAcademyTagline: string
  setLocalAcademyTagline: (v: string) => void
  localAdminPhone: string
  setLocalAdminPhone: (v: string) => void
  localTelegramHandle: string
  setLocalTelegramHandle: (v: string) => void
  localSemesterName: string
  setLocalSemesterName: (v: string) => void
  localSemesters: string
  setLocalSemesters: (v: string) => void
  localPrice: number
  localTeacherPrice: number
  localCurrency: string
  localThreshold: number
  localAutoFreeze: number
  localBackdateLock: boolean
  setLocalPrice: (v: number) => void
  setLocalTeacherPrice: (v: number) => void
  setLocalCurrency: (v: string) => void
  setLocalThreshold: (v: number) => void
  setLocalAutoFreeze: (v: number) => void
  setLocalBackdateLock: (v: boolean) => void
  setMaintenanceTarget: (v: boolean) => void
  setShowBackdateModal: (v: boolean) => void
  setBackdateTarget: (v: boolean) => void
  localLibraryTelegram: string
  setLocalLibraryTelegram: (v: string) => void
  localAcademicYear: string
  setLocalAcademicYear: (v: string) => void
  localSemesterStart: string
  setLocalSemesterStart: (v: string) => void
  localSemesterEnd: string
  setLocalSemesterEnd: (v: string) => void
  localFooterDescription: string
  setLocalFooterDescription: (v: string) => void
  localFooterAddress: string
  setLocalFooterAddress: (v: string) => void
  localFooterInstagram: string
  setLocalFooterInstagram: (v: string) => void
  academyAddress: string
  setAcademyAddress: (v: string) => void
  localHeroBanners: string[]
  setLocalHeroBanners: (v: string[]) => void
  themeColor: string
  setThemeColor: (color: string) => void
  notificationsEnabled: boolean
  setNotificationsEnabled: (v: boolean) => void
  newUser: { username: string; password: string; permissions: string[] }
  setNewUser: (v: { username: string; password: string; permissions: string[] }) => void
  editingUserId: string | null
  setEditingUserId: (v: string | null) => void
  setShowDeleteModal: (v: boolean | { id: string; username: string }) => void
  handleUserAction: () => void
  handleSaveGeneral: () => void
  isSaving: boolean
  showNotify: (msg: string) => void
  maintenanceMode: boolean
  setShowMaintenanceModal: (v: boolean) => void
  setMaintenanceMode: (v: boolean) => void
  handleExportBackup: () => void
  handleImportBackup: (e: React.ChangeEvent<HTMLInputElement>) => void
  triggerReset: () => void
  triggerArchive: () => void
  setSecureAction: (
    v: {
      type: 'reset' | 'archive'
      title: string
      description: string
      confirmWord: string
      actionFn: () => void
    } | null,
  ) => void
  setWhatsappTemplate: (v: string) => void
  whatsappAutoNotify: boolean
  setWhatsappAutoNotify: (v: boolean) => void
  localWhatsappTemplate: string
  setLocalWhatsappTemplate: Dispatch<SetStateAction<string>>
  academyName: string
  academyLogo: string
  academyTagline: string
  user: { id: string; name: string; username: string }
  users: { id: string; username: string; name?: string; permissions?: string[] }[]
  whatsappNumbers: string
  setWhatsappNumbers: (v: string) => Promise<void>
  backdateLockEnabled: boolean
  setBackdateLockEnabled: (v: boolean) => void
  teacherCommissionType: string
  setTeacherCommissionType: (v: string) => void
  autoFreezeThreshold: number
  setAutoFreezeThreshold: (v: number) => void
  reminderMinutesBefore: number
  setReminderMinutesBefore: (v: number) => void
  setSemesterName: (v: string) => void
  setSemesters: (v: string) => void
  auditLogs: { timestamp: string; username: string; action: string }[]
  fetchLogs: () => void
}

export const SettingsTabContent = (props: SettingsTabContentProps) => {
  const [theme, setTheme] = useDarkMode()
  const { activeTab } = props
  switch (activeTab) {
    case 'general':
      return (
        <GeneralSettings
          localAcademyName={props.localAcademyName}
          setLocalAcademyName={props.setLocalAcademyName}
          localAdminPhone={props.localAdminPhone}
          setLocalAdminPhone={props.setLocalAdminPhone}
          localTelegramHandle={props.localTelegramHandle}
          setLocalTelegramHandle={props.setLocalTelegramHandle}
          localLibraryTelegram={props.localLibraryTelegram}
          setLocalLibraryTelegram={props.setLocalLibraryTelegram}
          localSemesterName={props.localSemesterName}
          setLocalSemesterName={props.setLocalSemesterName}
          localPrice={props.localPrice}
          localTeacherPrice={props.localTeacherPrice}
          localCurrency={props.localCurrency}
          localThreshold={props.localThreshold}
          localAutoFreeze={props.localAutoFreeze}
          localBackdateLock={props.localBackdateLock}
          setLocalPrice={props.setLocalPrice}
          setLocalTeacherPrice={props.setLocalTeacherPrice}
          setLocalCurrency={props.setLocalCurrency}
          setLocalThreshold={props.setLocalThreshold}
          setLocalAutoFreeze={props.setLocalAutoFreeze}
          maintenanceMode={props.maintenanceMode}
          setMaintenanceTarget={props.setMaintenanceTarget}
          setShowMaintenanceModal={props.setShowMaintenanceModal}
          setShowBackdateModal={props.setShowBackdateModal}
          setBackdateTarget={props.setBackdateTarget}
          isSaving={props.isSaving}
          handleSaveGeneral={props.handleSaveGeneral}
          showNotify={props.showNotify}
        />
      )
    case 'academy':
      return (
        <AcademyInfoSection
          localAcademyName={props.localAcademyName}
          setLocalAcademyName={props.setLocalAcademyName}
          localAdminPhone={props.localAdminPhone}
          setLocalAdminPhone={props.setLocalAdminPhone}
          localTelegramHandle={props.localTelegramHandle}
          setLocalTelegramHandle={props.setLocalTelegramHandle}
          localLibraryTelegram={props.localLibraryTelegram}
          setLocalLibraryTelegram={props.setLocalLibraryTelegram}
          localFooterDescription={props.localFooterDescription}
          setLocalFooterDescription={props.setLocalFooterDescription}
          localFooterAddress={props.localFooterAddress}
          setLocalFooterAddress={props.setLocalFooterAddress}
          localFooterInstagram={props.localFooterInstagram}
          setLocalFooterInstagram={props.setLocalFooterInstagram}
          handleSaveGeneral={props.handleSaveGeneral}
          isSaving={props.isSaving}
        />
      )
    case 'academic-year':
      return (
        <AcademicYearSection
          localSemesterName={props.localSemesterName}
          setLocalSemesterName={props.setLocalSemesterName}
          localSemesters={props.localSemesters}
          setLocalSemesters={props.setLocalSemesters}
          setSemesterName={props.setSemesterName}
          setSemesters={props.setSemesters}
          localAcademicYear={props.localAcademicYear}
          setLocalAcademicYear={props.setLocalAcademicYear}
          localSemesterStart={props.localSemesterStart}
          setLocalSemesterStart={props.setLocalSemesterStart}
          localSemesterEnd={props.localSemesterEnd}
          setLocalSemesterEnd={props.setLocalSemesterEnd}
          showNotify={props.showNotify}
        />
      )
    case 'currencies':
      return (
        <CurrenciesSection
          localCurrency={props.localCurrency}
          setLocalCurrency={props.setLocalCurrency}
          showNotify={props.showNotify}
        />
      )
    case 'appearance':
      return (
        <AppearanceSettings
          theme={theme}
          setTheme={setTheme}
          themeColor={props.themeColor}
          setThemeColor={props.setThemeColor}
        />
      )
    case 'users':
      return (
        <UsersSettings
          users={props.users}
          user={props.user}
          newUser={props.newUser}
          setNewUser={props.setNewUser}
          editingUserId={props.editingUserId}
          setEditingUserId={props.setEditingUserId}
          setShowDeleteModal={props.setShowDeleteModal}
          handleUserAction={props.handleUserAction}
        />
      )
    case 'permissions':
      return <PermissionsSection showNotify={props.showNotify} />
    case 'communications':
      return (
        <CommunicationsSection
          whatsappAutoNotify={props.whatsappAutoNotify}
          setWhatsappAutoNotify={props.setWhatsappAutoNotify}
          localWhatsappTemplate={props.localWhatsappTemplate}
          setLocalWhatsappTemplate={props.setLocalWhatsappTemplate}
          setWhatsappTemplate={props.setWhatsappTemplate}
          showNotify={props.showNotify}
        />
      )
    case 'mobile':
      return (
        <MobileSettings
          whatsappNumbers={props.whatsappNumbers}
          setWhatsappNumbers={props.setWhatsappNumbers}
          showNotify={props.showNotify}
        />
      )
    case 'policies':
      return (
        <PoliciesSettings
          backdateLockEnabled={props.backdateLockEnabled}
          setShowBackdateModal={props.setShowBackdateModal}
          setBackdateTarget={props.setBackdateTarget}
          teacherCommissionType={props.teacherCommissionType}
          setTeacherCommissionType={props.setTeacherCommissionType}
          autoFreezeThreshold={props.autoFreezeThreshold}
          setAutoFreezeThreshold={props.setAutoFreezeThreshold}
          showNotify={props.showNotify}
          setSecureAction={props.setSecureAction}
        />
      )
    case 'working-hours':
      return <WorkingHoursSection showNotify={props.showNotify} />
    case 'attendance':
      return (
        <AttendanceSettingsSection
          localBackdateLock={props.localBackdateLock}
          setLocalBackdateLock={props.setLocalBackdateLock}
          localAutoFreeze={props.localAutoFreeze}
          setLocalAutoFreeze={props.setLocalAutoFreeze}
          showNotify={props.showNotify}
        />
      )
    case 'reports':
      return <ReportsSettingsSection showNotify={props.showNotify} />
    case 'rewards':
      return <RewardsSettingsSection showNotify={props.showNotify} />
    case 'backup':
      return (
        <BackupSection
          handleExportBackup={props.handleExportBackup}
          handleImportBackup={props.handleImportBackup}
          triggerReset={props.triggerReset}
          isSaving={props.isSaving}
          triggerArchive={props.triggerArchive}
        />
      )
    case 'advanced':
      return (
        <AdvancedSettings
          whatsappAutoNotify={props.whatsappAutoNotify}
          setWhatsappAutoNotify={props.setWhatsappAutoNotify}
          localWhatsappTemplate={props.localWhatsappTemplate}
          setLocalWhatsappTemplate={props.setLocalWhatsappTemplate}
          setWhatsappTemplate={props.setWhatsappTemplate}
          showNotify={props.showNotify}
          reminderMinutesBefore={props.reminderMinutesBefore}
          setReminderMinutesBefore={props.setReminderMinutesBefore}
          localSemesterName={props.localSemesterName}
          setLocalSemesterName={props.setLocalSemesterName}
          localSemesters={props.localSemesters}
          setLocalSemesters={props.setLocalSemesters}
          setSemesterName={props.setSemesterName}
          setSemesters={props.setSemesters}
          setSecureAction={props.setSecureAction}
        />
      )
    case 'audit':
      return <AuditLogSection auditLogs={props.auditLogs} fetchLogs={props.fetchLogs} />
    default:
      return null
  }
}
