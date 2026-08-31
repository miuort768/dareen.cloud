import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageLoader } from '../components/ui/PageLoader'
import { useCurrentUser, useAcademyName } from '../context/AppContext'
import { useDashboardData } from '../features/dashboard/hooks/useDashboardData'
import { TeacherDashboardDesktop } from './teacher-dashboard/TeacherDashboardDesktop'
import { TeacherDashboardMobile } from './teacher-dashboard/TeacherDashboardMobile'

export const TeacherDashboard = () => {
  const academyName = useAcademyName()
  useEffect(() => {
    document.title = `لوحة تحكم المعلمة | ${academyName}`
  }, [academyName])
  const currentUser = useCurrentUser()
  const navigate = useNavigate()
  const {
    stats,
    tasks,
    loading,
    rawSessions,
    lowBalanceStudents,
    focusStudents,
    weekCounts,
    fetchDashboardData,
  } = useDashboardData(currentUser)

  const isInvalidRole = !!currentUser && currentUser.role !== 'teacher'
  useEffect(() => {
    if (isInvalidRole) navigate('/', { replace: true })
  }, [isInvalidRole, navigate])

  if (!currentUser || currentUser.role !== 'teacher')
    return <div className="min-h-full bg-surface font-sans" />
  if (loading) return <PageLoader />

  const timeline = stats.todayTimeline || []

  return (
    <>
      <div
        className="relative hidden min-h-full overflow-x-hidden bg-background transition-colors duration-500 md:block"
        dir="rtl"
      >
        <TeacherDashboardDesktop
          currentUser={currentUser}
          stats={stats}
          rawSessions={rawSessions}
          tasks={tasks}
          lowBalanceStudents={lowBalanceStudents}
          focusStudents={focusStudents}
          timeline={timeline}
          weekCounts={weekCounts}
        />
      </div>
      <div className="block md:hidden">
        <TeacherDashboardMobile
          currentUser={currentUser}
          stats={stats}
          rawSessions={rawSessions}
          tasks={tasks}
          lowBalanceStudents={lowBalanceStudents}
          focusStudents={focusStudents}
          timeline={timeline}
          weekCounts={weekCounts}
          onRefresh={fetchDashboardData}
        />
      </div>
    </>
  )
}
