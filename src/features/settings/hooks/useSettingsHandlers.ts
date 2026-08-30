import { useState, useEffect, useCallback, useRef } from 'react'
import {
  useAcademyName,
  useAcademyLogo,
  useAcademyTagline,
  useAdminPhone,
  useThemeColor,
  useNotificationsEnabled,
  useMaintenanceMode,
  useWhatsappAutoNotify,
  useWhatsappTemplate,
  useDefaultSessionPrice,
  useDefaultTeacherPrice,
  useCurrencySymbol,
  useSemesterName,
  useSemesters,
  useBalanceWarningThreshold,
  useBackdateLockEnabled,
  useTeacherCommissionType,
  useAutoFreezeThreshold,
  useTelegramHandle,
  useHeroBanners,
  useReminderMinutesBefore,
  useCurrentUser,
  useUsers,
  useAddUser,
  useEditUser,
  useDeleteUser,
  useAcademyAddress,
  useWhatsappNumbers,
  useSetSetting,
  useLibraryTelegram,
  useAcademicYear,
  useSemesterStartDate,
  useSemesterEndDate,
  useFooterDescription,
  useFooterAddress,
  useFooterInstagram,
} from '../../../context/AppContext'
import { confirm } from '../../../lib/confirmDialog'
import { settingsService } from '../services/settingsService'
import type { TabId } from '../pages/settings-page'

export const useSettingsHandlers = () => {
  const academyName = useAcademyName()
  const academyLogo = useAcademyLogo()
  const academyTagline = useAcademyTagline()
  const adminPhone = useAdminPhone()
  const academyAddress = useAcademyAddress()
  const themeColor = useThemeColor()
  const notificationsEnabled = useNotificationsEnabled()
  const maintenanceMode = useMaintenanceMode()
  const whatsappAutoNotify = useWhatsappAutoNotify()
  const whatsappTemplate = useWhatsappTemplate()
  const defaultSessionPrice = useDefaultSessionPrice()
  const defaultTeacherPrice = useDefaultTeacherPrice()
  const currencySymbol = useCurrencySymbol()
  const semesterName = useSemesterName()
  const semesters = useSemesters()
  const balanceWarningThreshold = useBalanceWarningThreshold()
  const backdateLockEnabled = useBackdateLockEnabled()
  const teacherCommissionType = useTeacherCommissionType()
  const autoFreezeThreshold = useAutoFreezeThreshold()
  const telegramHandle = useTelegramHandle()
  const heroBanners = useHeroBanners()
  const reminderMinutesBefore = useReminderMinutesBefore()
  const whatsappNumbers = useWhatsappNumbers()
  const libraryTelegram = useLibraryTelegram()
  const academicYear = useAcademicYear()
  const semesterStartDate = useSemesterStartDate()
  const semesterEndDate = useSemesterEndDate()
  const footerDescription = useFooterDescription()
  const footerAddress = useFooterAddress()
  const footerInstagram = useFooterInstagram()
  const currentUser = useCurrentUser()
  const user = currentUser || { id: 'guest', name: 'ضيف', username: 'guest' }
  const users = useUsers()
  const addUser = useAddUser()
  const editUser = useEditUser()
  const deleteUser = useDeleteUser()

  const setSetting = useSetSetting()
  const setAcademyName = (v: string) => setSetting('academyName', v)
  const setAcademyLogo = (v: string) => setSetting('academyLogo', v)
  const setAcademyTagline = (v: string) => setSetting('academyTagline', v)
  const setAdminPhone = (v: string) => setSetting('adminPhone', v)
  const setAcademyAddress = (v: string) => setSetting('academyAddress', v)
  const setThemeColor = (v: string) => setSetting('themeColor', v)
  const setNotificationsEnabled = (v: boolean) => setSetting('notificationsEnabled', v)
  const setMaintenanceMode = (v: boolean) => setSetting('maintenanceMode', v)
  const setWhatsappAutoNotify = (v: boolean) => setSetting('whatsappAutoNotify', v)
  const setWhatsappTemplate = (v: string) => setSetting('whatsappTemplate', v)
  const setDefaultSessionPrice = (v: number) => setSetting('defaultSessionPrice', v)
  const setDefaultTeacherPrice = (v: number) => setSetting('defaultTeacherPrice', v)
  const setCurrencySymbol = (v: string) => setSetting('currencySymbol', v)
  const setSemesterName = (v: string) => setSetting('semesterName', v)
  const setSemesters = (v: string) => setSetting('semesters', v)
  const setBalanceWarningThreshold = (v: number) => setSetting('balanceWarningThreshold', v)
  const setBackdateLockEnabled = (v: boolean) => setSetting('backdateLockEnabled', v)
  const setTeacherCommissionType = (v: string) =>
    setSetting('teacherCommissionType', v as 'percentage' | 'fixed')
  const setAutoFreezeThreshold = (v: string | number) =>
    setSetting('autoFreezeThreshold', Number(v))
  const setTelegramHandle = (v: string) => setSetting('telegramHandle', v)
  const setHeroBanners = (v: string) => setSetting('heroBanners', v)
  const setReminderMinutesBefore = (v: string | number) =>
    setSetting('reminderMinutesBefore', Number(v))
  const setWhatsappNumbers = (v: string) => setSetting('whatsappNumbers', v)

  const [activeTab, setActiveTab] = useState<TabId>('general')
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [auditLogs, setAuditLogs] = useState<
    { timestamp: string; username: string; action: string }[]
  >([])
  const [localAcademyName, setLocalAcademyName] = useState(academyName)
  const [localAcademyLogo, setLocalAcademyLogo] = useState(academyLogo)
  const [localAcademyTagline, setLocalAcademyTagline] = useState(academyTagline)
  const [localAdminPhone, setLocalAdminPhone] = useState(adminPhone)
  const [localSemesterName, setLocalSemesterName] = useState(semesterName)
  const [localSemesters, setLocalSemesters] = useState(semesters)
  const [localWhatsappTemplate, setLocalWhatsappTemplate] = useState(whatsappTemplate)
  const [localTelegramHandle, setLocalTelegramHandle] = useState(telegramHandle)
  const [localHeroBanners, setLocalHeroBanners] = useState<string[]>(() => {
    try {
      return JSON.parse(heroBanners)
    } catch (e) {
      console.warn(e)
      return ['', '', '', '']
    }
  })
  const [localPrice, setLocalPrice] = useState(defaultSessionPrice)
  const [localTeacherPrice, setLocalTeacherPrice] = useState(defaultTeacherPrice)
  const [localCurrency, setLocalCurrency] = useState(currencySymbol)
  const [localThreshold, setLocalThreshold] = useState(balanceWarningThreshold)
  const [localBackdateLock, setLocalBackdateLock] = useState(backdateLockEnabled)
  const [localAutoFreeze, setLocalAutoFreeze] = useState(autoFreezeThreshold)
  const [localLibraryTelegram, setLocalLibraryTelegram] = useState(libraryTelegram)
  const [localAcademicYear, setLocalAcademicYear] = useState(academicYear)
  const [localSemesterStart, setLocalSemesterStart] = useState(semesterStartDate)
  const [localSemesterEnd, setLocalSemesterEnd] = useState(semesterEndDate)
  const [localFooterDescription, setLocalFooterDescription] = useState(footerDescription)
  const [localFooterAddress, setLocalFooterAddress] = useState(footerAddress)
  const [localFooterInstagram, setLocalFooterInstagram] = useState(footerInstagram)
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    permissions: [] as string[],
  })
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState<
    boolean | { id: string; username: string }
  >(false)
  const [secureAction, setSecureAction] = useState<{
    type: 'reset' | 'archive'
    title: string
    description: string
    confirmWord: string
    actionFn: () => void
  } | null>(null)
  const [secureInput, setSecureInput] = useState('')
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false)
  const [maintenanceTarget, setMaintenanceTarget] = useState(false)
  const [showBackdateModal, setShowBackdateModal] = useState(false)
  const [backdateTarget, setBackdateTarget] = useState(false)
  const [notificationMessage, setNotificationMessage] = useState('')
  const notifyTimeoutRef = useRef<ReturnType<typeof setTimeout>>()

  const showNotify = (msg: string) => {
    clearTimeout(notifyTimeoutRef.current)
    setNotificationMessage(msg)
    setShowSuccess(true)
    notifyTimeoutRef.current = setTimeout(() => setShowSuccess(false), 4000)
  }

  useEffect(() => () => clearTimeout(notifyTimeoutRef.current), [])

  const fetchLogs = useCallback(async () => {
    try {
      const logs = await settingsService.getAuditLogs()
      setAuditLogs(logs || [])
    } catch (e) {
      console.error(e)
    }
  }, [])

  const handleSaveGeneral = async () => {
    setIsSaving(true)
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
        setSetting('libraryTelegram', localLibraryTelegram),
        setSetting('academicYear', localAcademicYear),
        setSetting('semesterStartDate', localSemesterStart),
        setSetting('semesterEndDate', localSemesterEnd),
        setSetting('footerDescription', localFooterDescription),
        setSetting('footerAddress', localFooterAddress),
        setSetting('footerInstagram', localFooterInstagram),
      ])
      showNotify('تم حفظ الإعدادات بنجاح')
    } catch (e) {
      console.error('Save error:', e)
      showNotify('خطأ في الحفظ')
    } finally {
      setIsSaving(false)
    }
  }

  const handleExportBackup = async () => {
    setIsSaving(true)
    try {
      const backupData = await settingsService.getBackup()
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `darin_backup_${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      a.remove()
      showNotify('تم تحميل النسخة الاحتياطية بنجاح')
    } catch (e: unknown) {
      showNotify('فشل تصدير البيانات: ' + (e instanceof Error ? e.message : 'خطأ غير متوقع'))
    } finally {
      setIsSaving(false)
    }
  }

  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (
      !(await confirm({
        message: 'استيراد البيانات سيؤدي إلى استبدال كافة البيانات الحالية. هل أنت متأكد؟',
        isDestructive: true,
      }))
    ) {
      e.target.value = ''
      return
    }
    const reader = new FileReader()
    reader.onload = async (event) => {
      setIsSaving(true)
      try {
        await settingsService.restoreBackup(JSON.parse(event.target?.result as string))
        showNotify('تم استيراد البيانات بنجاح')
        setTimeout(() => window.location.reload(), 2000)
      } catch (e: unknown) {
        showNotify(e instanceof Error ? e.message : 'خطأ غير متوقع')
      } finally {
        setIsSaving(false)
        if (e.target) e.target.value = ''
      }
    }
    reader.readAsText(file)
  }

  const triggerReset = () => {
    setSecureAction({
      type: 'reset',
      title: 'تصفير كافة الحسابات والبيانات',
      description: 'هذا الإجراء سيقوم بحذف كافة السجلات المالية وحصص الطلاب والمعلمين.',
      confirmWord: 'إعادة-تعيين-كل-البيانات',
      actionFn: async () => {
        setIsSaving(true)
        try {
          await settingsService.systemReset()
          showNotify('تم تصفير النظام بنجاح')
          window.location.reload()
        } catch (e: unknown) {
          showNotify(e instanceof Error ? e.message : 'خطأ غير متوقع')
        } finally {
          setIsSaving(false)
        }
      },
    })
  }

  const triggerArchive = () => {
    setSecureAction({
      type: 'archive',
      title: 'أرشفة بيانات الموسم الحالي',
      description: 'سيتم نقل كافة السجلات الحالية إلى الأرشيف.',
      confirmWord: 'أرشفة-الآن',
      actionFn: async () => {
        setIsSaving(true)
        try {
          await settingsService.archiveMonth()
          showNotify('تمت الأرشفة بنجاح')
        } catch (e: unknown) {
          showNotify(e instanceof Error ? e.message : 'خطأ غير متوقع')
        } finally {
          setIsSaving(false)
        }
      },
    })
  }

  const handleUserAction = async () => {
    const username = newUser.username.trim()
    if (!username) return
    if (
      !editingUserId &&
      users.some((u) => (u.username || '').toLowerCase() === username.toLowerCase())
    ) {
      showNotify('اسم الدخول مستخدم بالفعل')
      return
    }
    if (!editingUserId && !newUser.password) {
      showNotify('أدخل كلمة مرور للحساب الجديد')
      return
    }
    setIsSaving(true)
    try {
      if (editingUserId) {
        await editUser(editingUserId, {
          username,
          name: username,
          permissions: newUser.permissions,
          password: newUser.password || undefined,
        })
        showNotify('تم تعديل الحساب بنجاح')
      } else {
        await addUser({ ...newUser, username, name: username, role: 'admin' })
        showNotify('تم إنشاء الحساب بنجاح')
      }
      setEditingUserId(null)
      setNewUser({ username: '', password: '', permissions: [] })
    } catch (e) {
      showNotify('خطأ في حفظ الحساب: ' + (e instanceof Error ? e.message : 'خطأ غير متوقع'))
    } finally {
      setIsSaving(false)
    }
  }

  const confirmBackdateToggle = async (password: string) => {
    try {
      await settingsService.verifyPassword(password)
      // Persist globally — the sync effect will update the local mirror.
      await setSetting('backdateLockEnabled', backdateTarget)
      showNotify(
        backdateTarget ? 'تم تفعيل قفل تعديل الحصص القديمة' : 'تم إلغاء قفل تعديل الحصص القديمة',
      )
      setShowBackdateModal(false)
    } catch (e) {
      throw e instanceof Error ? e : new Error('كلمة المرور غير صحيحة')
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
      if (activeTab === 'audit') fetchLogs()
    }, 300)
    return () => clearTimeout(timer)
  }, [activeTab, fetchLogs])

  // Sync local mirrors from global settings — but only keys whose global value
  // actually changed, so unrelated global updates never wipe unsaved local edits.
  const lastSyncedRef = useRef<Record<string, unknown>>({})
  useEffect(() => {
    const syncIfChanged = <T>(key: string, incoming: T, setter: (v: T) => void) => {
      if (lastSyncedRef.current[key] !== incoming) {
        lastSyncedRef.current[key] = incoming
        setter(incoming)
      }
    }
    syncIfChanged('academyName', academyName, setLocalAcademyName)
    syncIfChanged('academyLogo', academyLogo, setLocalAcademyLogo)
    syncIfChanged('academyTagline', academyTagline, setLocalAcademyTagline)
    syncIfChanged('adminPhone', adminPhone, setLocalAdminPhone)
    syncIfChanged('semesterName', semesterName, setLocalSemesterName)
    syncIfChanged('semesters', semesters, setLocalSemesters)
    syncIfChanged('price', defaultSessionPrice, setLocalPrice)
    syncIfChanged('teacherPrice', defaultTeacherPrice, setLocalTeacherPrice)
    syncIfChanged('currency', currencySymbol, setLocalCurrency)
    syncIfChanged('threshold', balanceWarningThreshold, setLocalThreshold)
    syncIfChanged('telegramHandle', telegramHandle, setLocalTelegramHandle)
    syncIfChanged('backdateLock', backdateLockEnabled, setLocalBackdateLock)
    syncIfChanged('autoFreeze', autoFreezeThreshold, setLocalAutoFreeze)
    syncIfChanged('libraryTelegram', libraryTelegram, setLocalLibraryTelegram)
    syncIfChanged('academicYear', academicYear, setLocalAcademicYear)
    syncIfChanged('semesterStart', semesterStartDate, setLocalSemesterStart)
    syncIfChanged('semesterEnd', semesterEndDate, setLocalSemesterEnd)
    syncIfChanged('footerDescription', footerDescription, setLocalFooterDescription)
    syncIfChanged('footerAddress', footerAddress, setLocalFooterAddress)
    syncIfChanged('footerInstagram', footerInstagram, setLocalFooterInstagram)
  }, [
    academyName,
    academyLogo,
    academyTagline,
    adminPhone,
    semesterName,
    semesters,
    defaultSessionPrice,
    defaultTeacherPrice,
    currencySymbol,
    balanceWarningThreshold,
    telegramHandle,
    backdateLockEnabled,
    autoFreezeThreshold,
    libraryTelegram,
    academicYear,
    semesterStartDate,
    semesterEndDate,
    footerDescription,
    footerAddress,
    footerInstagram,
  ])

  useEffect(() => {
    try {
      setLocalHeroBanners(JSON.parse(heroBanners))
    } catch (e) {
      console.warn('Failed to parse heroBanners:', e)
    }
  }, [heroBanners])

  return {
    user,
    users,
    deleteUser,
    academyName,
    academyLogo,
    academyTagline,
    academyAddress,
    adminPhone,
    themeColor,
    notificationsEnabled,
    maintenanceMode,
    whatsappAutoNotify,
    whatsappTemplate,
    defaultSessionPrice,
    defaultTeacherPrice,
    currencySymbol,
    semesterName,
    semesters,
    balanceWarningThreshold,
    backdateLockEnabled,
    teacherCommissionType,
    autoFreezeThreshold,
    telegramHandle,
    heroBanners,
    reminderMinutesBefore,
    whatsappNumbers,
    setAcademyName,
    setAcademyLogo,
    setAcademyTagline,
    setAdminPhone,
    setAcademyAddress,
    setThemeColor,
    setNotificationsEnabled,
    setMaintenanceMode,
    setWhatsappAutoNotify,
    setWhatsappTemplate,
    setDefaultSessionPrice,
    setDefaultTeacherPrice,
    setCurrencySymbol,
    setSemesterName,
    setSemesters,
    setBalanceWarningThreshold,
    setBackdateLockEnabled,
    setTeacherCommissionType,
    setAutoFreezeThreshold,
    setTelegramHandle,
    setHeroBanners,
    setReminderMinutesBefore,
    setWhatsappNumbers,
    activeTab,
    setActiveTab,
    loading,
    isSaving,
    showSuccess,
    auditLogs,
    localAcademyName,
    setLocalAcademyName,
    localAcademyLogo,
    setLocalAcademyLogo,
    localAcademyTagline,
    setLocalAcademyTagline,
    localAdminPhone,
    setLocalAdminPhone,
    localSemesterName,
    setLocalSemesterName,
    localSemesters,
    setLocalSemesters,
    localWhatsappTemplate,
    setLocalWhatsappTemplate,
    localTelegramHandle,
    setLocalTelegramHandle,
    localHeroBanners,
    setLocalHeroBanners,
    localPrice,
    setLocalPrice,
    localTeacherPrice,
    setLocalTeacherPrice,
    localCurrency,
    setLocalCurrency,
    localThreshold,
    setLocalThreshold,
    localBackdateLock,
    setLocalBackdateLock,
    localAutoFreeze,
    setLocalAutoFreeze,
    newUser,
    setNewUser,
    editingUserId,
    setEditingUserId,
    showDeleteModal,
    setShowDeleteModal,
    secureAction,
    setSecureAction,
    secureInput,
    setSecureInput,
    showMaintenanceModal,
    setShowMaintenanceModal,
    maintenanceTarget,
    setMaintenanceTarget,
    showBackdateModal,
    setShowBackdateModal,
    backdateTarget,
    setBackdateTarget,
    confirmBackdateToggle,
    notificationMessage,
    showNotify,
    handleSaveGeneral,
    handleExportBackup,
    handleImportBackup,
    triggerReset,
    triggerArchive,
    handleUserAction,
    fetchLogs,
    localLibraryTelegram,
    setLocalLibraryTelegram,
    localAcademicYear,
    setLocalAcademicYear,
    localSemesterStart,
    setLocalSemesterStart,
    localSemesterEnd,
    setLocalSemesterEnd,
    localFooterDescription,
    setLocalFooterDescription,
    localFooterAddress,
    setLocalFooterAddress,
    localFooterInstagram,
    setLocalFooterInstagram,
  }
}
