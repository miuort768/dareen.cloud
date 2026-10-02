import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageLoader } from '../components/ui/PageLoader'
import { useCurrentUser, useAcademyName } from '../context/AppContext'
import { useDashboardData } from '../features/dashboard/hooks/useDashboardData'
import { useDeviceWidth } from '../shared/hooks/useDeviceWidth'
import { ErrorState, ErrorBanner } from '../shared/components/ui/ErrorState'
import { TeacherDashboardDesktop } from './teacher-dashboard/TeacherDashboardDesktop'
import { TeacherDashboardTablet } from './teacher-dashboard/TeacherDashboardTablet'
import { TeacherDashboardMobile } from './teacher-dashboard/TeacherDashboardMobile'
import type { TeacherDashboardShellProps } from './teacher-dashboard/types'

export const TeacherDashboard = () => {
  const academyName = useAcademyName()
  useEffect(() => {
    document.title = `لوحة تحكم المعلمة | ${academyName}`
  }, [academyName])
  const currentUser = useCurrentUser()
  const navigate = useNavigate()
  const device = useDeviceWidth()
  const {
    stats,
    tasks,
    loading,
    rawSessions,
    lowBalanceStudents,
    focusStudents,
    weekCounts,
    fetchDashboardData,
    hasCriticalErrors,
    nonCriticalErrors,
  } = useDashboardData(currentUser)

  const isInvalidRole = !!currentUser && currentUser.role !== 'teacher'
  useEffect(() => {
    if (isInvalidRole) navigate('/', { replace: true })
  }, [isInvalidRole, navigate])

  if (!currentUser || currentUser.role !== 'teacher')
    return <div className="min-h-full bg-surface font-sans" />
  if (loading) return <PageLoader />

  // Critical query failure must never masquerade as "0 students, 0 sessions",
  // and must not paint a half-empty dashboard either. Non-critical failures
  // (invoices / transactions / expenses / parents / evaluations) degrade to a
  // banner so the rest of the dashboard stays usable.
  if (hasCriticalErrors)
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4" dir="rtl">
        <ErrorState
          title="تعذّر تحميل لوحة التحكم"
          message="حدث خطأ أثناء جلب البيانات. تحقّق من الاتصال ثم أعد المحاولة."
          onRetry={fetchDashboardData}
        />
      </div>
    )

  const timeline = stats.todayTimeline || []

  const sharedProps: TeacherDashboardShellProps = {
    currentUser,
    stats,
    rawSessions,
    tasks,
    lowBalanceStudents,
    focusStudents,
    timeline,
    weekCounts,
  }

  // The JS device hook is the single owner of the split. The previous build ALSO
  // gated with `md:hidden` / `hidden md:block`; that double gate is what let the
  // 768–1023px band fall through to the desktop shell while CSS hid its wrapper.
  const nonCriticalBanner = nonCriticalErrors ? (
    <div className="mx-auto w-full max-w-page px-2.5 pt-3 sm:px-4 md:px-6">
      <ErrorBanner message="تعذّر تحميل بعض البيانات (الفواتير / المصروفات). بقية اللوحة تعمل بشكل طبيعي." />
    </div>
  ) : null

  if (device === 'mobile') {
    return (
      <>
        {nonCriticalBanner}
        <TeacherDashboardMobile {...sharedProps} onRefresh={fetchDashboardData} />
      </>
    )
  }
  if (device === 'tablet') {
    return (
      <>
        {nonCriticalBanner}
        <TeacherDashboardTablet {...sharedProps} />
      </>
    )
  }
  return (
    <>
      {nonCriticalBanner}
      <TeacherDashboardDesktop {...sharedProps} />
    </>
  )
}
