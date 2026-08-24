import { motion } from 'framer-motion'
import { Calendar } from 'lucide-react'
import { fadeUp } from '../shared/animations/fadeUp'
import { EmptyState } from '../shared/components/ui/EmptyState'
import { TeacherDashboardHeader } from './TeacherDashboardHeader'
import { DashboardStats } from '../features/dashboard/components/DashboardStats'
import { TeacherAchievements } from '../features/dashboard/components/TeacherAchievements'
import { TasksAndRequests } from '../features/dashboard/components/TasksAndRequests'
import { ModernAnnouncements } from '../features/dashboard/components/ModernAnnouncements'
import { TopAttendanceStudents } from '../features/dashboard/components/TopAttendanceStudents'
import { TeacherSessionTimeline } from '../features/dashboard/components/TeacherSessionTimeline'
import { StudentQuickBrief } from '../features/dashboard/components/StudentQuickBrief'
import { MonthlyReportPreview } from '../features/dashboard/components/MonthlyReportPreview'
import { NextSessionHero } from '../features/dashboard/components/NextSessionHero'
import { QuickActions } from '../features/dashboard/components/QuickActions'
import { SmartNotifications } from '../features/dashboard/components/SmartNotifications'
import { FinancialSnapshot } from '../features/dashboard/components/FinancialSnapshot'
import { AttendanceChart } from '../features/dashboard/components/AttendanceChart'
import { LiveSessions } from '../features/dashboard/components/LiveSessions'
import type {
  DashboardStats as DashboardStatsType,
  LowBalanceStudent,
  DashboardTask,
} from '../features/dashboard/types'
import type { Session } from '../types'
import type { User } from '../types/auth'
import { useState } from 'react'

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
  logout: () => void
}

export const TeacherDashboardDesktop = ({
  stats,
  rawSessions,
  tasks,
  lowBalanceStudents,
  focusStudents,
  timeline,
  logout,
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
    <>
      <TeacherDashboardHeader logout={logout} />
      <div className="mx-auto max-w-page space-y-3 px-4 pb-28 pt-4 md:space-y-4">
        <motion.div {...fadeUp(0.04)}>
          {nextSession ? (
            <NextSessionHero timeline={timeline} />
          ) : (
            <div className="flex h-full min-h-[160px] items-center justify-center rounded-2xl border border-border bg-surface p-5 dark:border-border dark:bg-card">
              <EmptyState
                icon={Calendar}
                title="لا توجد حصة قادمة"
                subtitle="يمكنك بدء حصة مباشرة متى شئت"
                compact
              />
            </div>
          )}
        </motion.div>

        <motion.div {...fadeUp(0.08)}>
          <DashboardStats stats={stats} isTeacher={true} />
        </motion.div>

        {/* ════════════════════════════════════════
            Main Grid Layout (3 Columns)
           ════════════════════════════════════════ */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column (Main Content - span 2) */}
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm transition-shadow duration-300 hover:shadow-md dark:border-border dark:bg-card">
              <LiveSessions />
            </div>

            {timeline.length > 0 && (
              <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm transition-shadow duration-300 hover:shadow-md dark:border-border dark:bg-card">
                <TeacherSessionTimeline sessions={timeline} onStudentClick={setBriefingStudent} />
              </div>
            )}

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm transition-shadow duration-300 hover:shadow-md dark:border-border dark:bg-card">
                <AttendanceChart rate={stats.attendanceRate} />
              </div>
              <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm transition-shadow duration-300 hover:shadow-md dark:border-border dark:bg-card">
                <TopAttendanceStudents sessions={rawSessions} onStudentClick={setBriefingStudent} />
              </div>
            </div>

            <div
              id="announcements-section"
              className="scroll-mt-32 rounded-2xl border border-border bg-surface p-5 shadow-sm transition-shadow duration-300 hover:shadow-md dark:border-border dark:bg-card"
            >
              <ModernAnnouncements />
            </div>
          </div>

          {/* Right Column (Sidebar/Widgets - span 1) */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm transition-all duration-300 hover:shadow-md dark:border-border dark:bg-card">
              <QuickActions showQuickLinks={false} />
            </div>

            <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm transition-shadow duration-300 hover:shadow-md dark:border-border dark:bg-card">
              <SmartNotifications
                lowBalanceStudents={lowBalanceStudents}
                focusStudents={focusStudents || []}
              />
            </div>

            <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm transition-shadow duration-300 hover:shadow-md dark:border-border dark:bg-card">
              <TasksAndRequests tasks={tasks} />
            </div>

            <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm transition-shadow duration-300 hover:shadow-md dark:border-border dark:bg-card">
              <FinancialSnapshot
                monthNetProfit={stats.monthNetProfit}
                monthRevenue={stats.monthRevenue}
                expectedCollection={stats.expectedCollection}
                currency={stats.currency}
              />
            </div>

            <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm transition-shadow duration-300 hover:shadow-md dark:border-border dark:bg-card">
              <TeacherAchievements
                stats={stats}
                lowBalanceStudents={lowBalanceStudents}
                isTeacher={true}
              />
            </div>
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
    </>
  )
}
