import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BarChart3 } from 'lucide-react'
import { PageLoader } from '../components/ui/PageLoader'
import { useCurrentUser, useAcademyName } from '../context/AppContext'
import { useDashboardData } from '../features/dashboard/hooks/useDashboardData'
import { PageHeader } from '../shared/components/ui/PageHeader'
import { DashboardSectionCard as SectionCard } from '../shared/components/DashboardSectionCard'
import { AttendanceChart } from '../features/dashboard/components/AttendanceChart'
import { TopAttendanceStudents } from '../features/dashboard/components/TopAttendanceStudents'
import { TasksAndRequests } from '../features/dashboard/components/TasksAndRequests'

export const TeacherReports = () => {
  const academyName = useAcademyName()
  useEffect(() => {
    document.title = `تقارير المعلمة | ${academyName}`
  }, [academyName])
  const currentUser = useCurrentUser()
  const navigate = useNavigate()
  const { stats, tasks, loading, rawSessions } = useDashboardData(currentUser)

  const isInvalidRole = !!currentUser && currentUser.role !== 'teacher'
  useEffect(() => {
    if (isInvalidRole) navigate('/', { replace: true })
  }, [isInvalidRole, navigate])

  if (!currentUser || currentUser.role !== 'teacher')
    return <div className="min-h-full bg-surface font-sans" />
  if (loading) return <PageLoader />

  return (
    <div
      className="min-h-full overflow-x-hidden bg-background p-2 transition-colors duration-500 md:p-4 lg:p-6"
      dir="rtl"
    >
      <div className="mx-auto max-w-page">
        <PageHeader
          title="التقارير"
          subtitle="ملخص أدائك ونشاط حصصك"
          icon={<BarChart3 size={20} />}
          meta={[
            <span
              key="attendance"
              className="rounded-full bg-primary-soft px-2.5 py-1 text-micro font-bold text-primary"
            >
              الحضور {stats.attendanceRate}%
            </span>,
          ]}
        />

        <div className="space-y-5">
          <SectionCard>
            <AttendanceChart rate={stats.attendanceRate} />
          </SectionCard>
          <SectionCard>
            <TopAttendanceStudents sessions={rawSessions} />
          </SectionCard>
          <SectionCard>
            <TasksAndRequests tasks={tasks} />
          </SectionCard>
        </div>
      </div>
    </div>
  )
}
