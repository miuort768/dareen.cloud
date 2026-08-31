import { useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar } from 'lucide-react'
import { fadeUp } from '../../shared/animations/fadeUp'
import { EmptyState } from '../../shared/components/ui/EmptyState'
import { DashboardStats } from '../../features/dashboard/components/DashboardStats'
import { TeacherAchievements } from '../../features/dashboard/components/TeacherAchievements'
import { TasksAndRequests } from '../../features/dashboard/components/TasksAndRequests'
import { ModernAnnouncements } from '../../features/dashboard/components/ModernAnnouncements'
import { TopAttendanceStudents } from '../../features/dashboard/components/TopAttendanceStudents'
import { TeacherSessionTimeline } from '../../features/dashboard/components/TeacherSessionTimeline'
import { StudentQuickBrief } from '../../features/dashboard/components/StudentQuickBrief'
import { MonthlyReportPreview } from '../../features/dashboard/components/MonthlyReportPreview'
import { NextSessionHero } from '../../features/dashboard/components/NextSessionHero'
import { QuickActions } from '../../features/dashboard/components/QuickActions'
import { SmartNotifications } from '../../features/dashboard/components/SmartNotifications'
import { FinancialSnapshot } from '../../features/dashboard/components/FinancialSnapshot'
import { AttendanceChart } from '../../features/dashboard/components/AttendanceChart'
import { LiveSessions } from '../../features/dashboard/components/LiveSessions'
import { GreetingStrip } from './GreetingStrip'
import { WeekStrip } from './WeekStrip'
import type {
  DashboardStats as DashboardStatsType,
  LowBalanceStudent,
  DashboardTask,
} from '../../features/dashboard/types'
import type { Session } from '../../types'
import type { User } from '../../types/auth'

interface TeacherDashboardDesktopProps {
  currentUser: User | null
  stats: DashboardStatsType
  rawSessions: Session[]
  tasks: DashboardTask[]
  lowBalanceStudents: LowBalanceStudent[]
  focusStudents: { id: string; name: string; reason: string; type: string }[]
  timeline: {
    id: string
    studentId?: string
    studentName: string
    time: string
    subject: string
    status: string
  }[]
  weekCounts: number[]
}

export const TeacherDashboardDesktop = ({
  currentUser,
  stats,
  rawSessions,
  tasks,
  lowBalanceStudents,
  focusStudents,
  timeline,
  weekCounts,
}: TeacherDashboardDesktopProps) => {
  const [briefingStudent, setBriefingStudent] = useState<{
    id?: string
    name?: string
    grade?: string
    notes?: string
    curriculum?: string
    totalPoints?: number
  } | null>(null)
  const [selectedStudentForReport, setSelectedStudentForReport] = useState<{
    id: string
    name: string
    grade: string
    subject: string
    points: number
    attendance: number
    sessionsCompleted: number
    lastNotes: string[]
  } | null>(null)

  const nextSession = timeline.find((s) => s.status === 'scheduled' || s.status === 'in-progress')

  return (
    <div className="mx-auto max-w-page space-y-5 px-2.5 pb-8 pt-5 sm:px-4 md:px-6" dir="rtl">
      <motion.div {...fadeUp(0)}>
        <GreetingStrip
          name={currentUser?.name || currentUser?.username || 'المعلمة'}
          studentsCount={stats.studentsCount}
          todayCount={stats.todaySessions}
          monthCompleted={stats.monthCompletedSessions}
          points={stats.teacherPoints}
        />
      </motion.div>

      <motion.div {...fadeUp(0.04)}>
        {nextSession ? (
          <NextSessionHero timeline={timeline} />
        ) : (
          <div className="flex h-full min-h-[140px] items-center justify-center rounded-3xl border border-border bg-surface p-5">
            <EmptyState
              icon={Calendar}
              title="لا توجد حصة قادمة اليوم"
              subtitle="يمكنك بدء حصة مباشرة متى شئت"
              compact
            />
          </div>
        )}
      </motion.div>

      <motion.div {...fadeUp(0.06)}>
        <WeekStrip counts={weekCounts} />
      </motion.div>

      <motion.div {...fadeUp(0.08)}>
        <DashboardStats stats={stats} isTeacher={true} />
      </motion.div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="space-y-5 lg:col-span-8">
          <motion.div
            {...fadeUp(0.1)}
            className="rounded-3xl border border-border bg-surface p-5 shadow-sm transition-colors duration-300"
          >
            <LiveSessions />
          </motion.div>

          {timeline.length > 0 && (
            <motion.div
              {...fadeUp(0.12)}
              className="rounded-3xl border border-border bg-surface p-5 shadow-sm transition-colors duration-300"
            >
              <TeacherSessionTimeline sessions={timeline} onStudentClick={setBriefingStudent} />
            </motion.div>
          )}

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <motion.div
              {...fadeUp(0.14)}
              className="rounded-3xl border border-border bg-surface p-5 shadow-sm transition-colors duration-300"
            >
              <AttendanceChart rate={stats.attendanceRate} />
            </motion.div>
            <motion.div
              {...fadeUp(0.16)}
              className="rounded-3xl border border-border bg-surface p-5 shadow-sm transition-colors duration-300"
            >
              <TopAttendanceStudents sessions={rawSessions} onStudentClick={setBriefingStudent} />
            </motion.div>
          </div>

          <motion.div
            {...fadeUp(0.18)}
            id="announcements-section"
            className="scroll-mt-32 rounded-3xl border border-border bg-surface p-5 shadow-sm transition-colors duration-300"
          >
            <ModernAnnouncements />
          </motion.div>
        </div>

        <div className="space-y-5 lg:col-span-4">
          <motion.div
            {...fadeUp(0.1)}
            className="rounded-3xl border border-border bg-surface p-4 shadow-sm transition-colors duration-300"
          >
            <QuickActions showQuickLinks={false} />
          </motion.div>

          <motion.div
            {...fadeUp(0.14)}
            className="rounded-3xl border border-border bg-surface p-5 shadow-sm transition-colors duration-300"
          >
            <SmartNotifications
              lowBalanceStudents={lowBalanceStudents}
              focusStudents={focusStudents || []}
            />
          </motion.div>

          <motion.div
            {...fadeUp(0.18)}
            className="rounded-3xl border border-border bg-surface p-5 shadow-sm transition-colors duration-300"
          >
            <TasksAndRequests tasks={tasks} />
          </motion.div>

          <motion.div
            {...fadeUp(0.22)}
            className="rounded-3xl border border-border bg-surface p-5 shadow-sm transition-colors duration-300"
          >
            <FinancialSnapshot
              monthNetProfit={stats.monthNetProfit}
              monthRevenue={stats.monthRevenue}
              expectedCollection={stats.expectedCollection}
              currency={stats.currency}
            />
          </motion.div>

          <motion.div
            {...fadeUp(0.26)}
            className="rounded-3xl border border-border bg-surface p-5 shadow-sm transition-colors duration-300"
          >
            <TeacherAchievements
              stats={stats}
              lowBalanceStudents={lowBalanceStudents}
              isTeacher={true}
            />
          </motion.div>
        </div>
      </div>

      {briefingStudent && briefingStudent.id && briefingStudent.name && briefingStudent.grade && (
        <StudentQuickBrief
          isOpen={!!briefingStudent}
          onClose={() => setBriefingStudent(null)}
          onGenerateReport={(student) => {
            const studentSessions = rawSessions.filter(
              (s: Session & { studentID?: string }) =>
                s.studentId === student.id || s.studentID === student.id,
            )
            const completed = studentSessions.filter((s) => s.status === 'completed').length
            const total = studentSessions.filter(
              (s) => s.status === 'completed' || s.status === 'cancelled',
            ).length
            setSelectedStudentForReport({
              id: student.id,
              name: student.name,
              grade: student.grade,
              subject: student.curriculum || 'مادة عامة',
              points: student.totalPoints || 0,
              attendance: total > 0 ? Math.round((completed / total) * 100) : 0,
              sessionsCompleted: completed,
              lastNotes: [student.notes || 'تقدم ممتاز في المادة'],
            })
            setBriefingStudent(null)
          }}
          student={
            briefingStudent.id && briefingStudent.name && briefingStudent.grade
              ? {
                  id: briefingStudent.id,
                  name: briefingStudent.name,
                  grade: briefingStudent.grade,
                  notes: briefingStudent.notes,
                  curriculum: briefingStudent.curriculum,
                  totalPoints: briefingStudent.totalPoints,
                }
              : null
          }
          recentSessions={[]}
        />
      )}
      {selectedStudentForReport && (
        <MonthlyReportPreview
          isOpen={!!selectedStudentForReport}
          onClose={() => setSelectedStudentForReport(null)}
          student={selectedStudentForReport}
          onShare={() => {}}
        />
      )}
    </div>
  )
}
