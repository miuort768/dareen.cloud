import { useState } from 'react'
import { Calendar } from 'lucide-react'
import { motion } from 'framer-motion'
import { fadeUp } from '../../shared/animations/fadeUp'
import { DashboardSectionCard as SectionCard } from '../../shared/components/DashboardSectionCard'
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
import { SmartNotifications } from '../../features/dashboard/components/SmartNotifications'
import { LiveSessions } from '../../features/dashboard/components/LiveSessions'
import { GreetingStrip } from './GreetingStrip'
import { WeekStrip } from './WeekStrip'
import { sessionOutcome } from '../../shared/utils/enrollments'
import type { Session } from '../../types'
import type { TeacherDashboardShellProps } from './types'

export const TeacherDashboardDesktop = ({
  currentUser,
  stats,
  rawSessions,
  tasks,
  lowBalanceStudents,
  focusStudents,
  timeline,
  weekCounts,
}: TeacherDashboardShellProps) => {
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
          monthTotal={stats.monthTotalSessions}
        />
      </motion.div>

      <motion.div {...fadeUp(0.02)} id="announcements-section" className="scroll-mt-32">
        <ModernAnnouncements />
      </motion.div>

      <motion.div {...fadeUp(0.04)}>
        <DashboardStats stats={stats} isTeacher={true} />
      </motion.div>

      {briefingStudent && briefingStudent.id && briefingStudent.name && briefingStudent.grade && (
        <StudentQuickBrief
          isOpen={!!briefingStudent}
          onClose={() => setBriefingStudent(null)}
          onGenerateReport={(student) => {
            // Canonical resolver — the raw `'completed'` equality missed the Arabic
            // statuses ('مكتملة', 'تم الإنجاز') and silently reported 0% attendance.
            const studentSessions = rawSessions.filter(
              (s: Session & { studentID?: string }) =>
                s.studentId === student.id || s.studentID === student.id,
            )
            const concluded = studentSessions.filter((s) => sessionOutcome(s.status) !== null)
            const completed = concluded.filter((s) => sessionOutcome(s.status) === 'done').length
            const total = concluded.length
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
