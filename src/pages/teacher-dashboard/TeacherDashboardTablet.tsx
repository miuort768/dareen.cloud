import { useState } from 'react'
import { Calendar } from 'lucide-react'
import { motion } from 'framer-motion'
import { fadeUp } from '../../shared/animations/fadeUp'
import { DashboardSectionCard as SectionCard } from '../../shared/components/DashboardSectionCard'
import { EmptyState } from '../../shared/components/ui/EmptyState'
import { DashboardStats } from '../../features/dashboard/components/DashboardStats'
import { TasksAndRequests } from '../../features/dashboard/components/TasksAndRequests'
import { ModernAnnouncements } from '../../features/dashboard/components/ModernAnnouncements'
import { TopAttendanceStudents } from '../../features/dashboard/components/TopAttendanceStudents'
import { TeacherSessionTimeline } from '../../features/dashboard/components/TeacherSessionTimeline'
import { StudentQuickBrief } from '../../features/dashboard/components/StudentQuickBrief'
import { MonthlyReportPreview } from '../../features/dashboard/components/MonthlyReportPreview'
import { NextSessionHero } from '../../features/dashboard/components/NextSessionHero'
import { QuickActions } from '../../features/dashboard/components/QuickActions'
import { SmartNotifications } from '../../features/dashboard/components/SmartNotifications'
import { LiveSessions } from '../../features/dashboard/components/LiveSessions'
import { TeacherHero } from './TeacherHero'
import { WeekStrip } from './WeekStrip'
import { sessionOutcome } from '../../shared/utils/enrollments'
import type { TeacherDashboardShellProps } from './types'
import type { Session } from '../../types'

export const TeacherDashboardTablet = ({
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
    <div className="min-h-full bg-background font-teacher transition-colors duration-500" dir="rtl">
      <div className="mx-auto max-w-page space-y-5 px-2.5 pb-8 pt-4 sm:px-4 md:px-5">
        <motion.div {...fadeUp(0)}>
          <TeacherHero
            name={currentUser?.name || currentUser?.username || 'المعلمة'}
            stats={stats}
            lowBalanceStudents={lowBalanceStudents}
          />
        </motion.div>

        <motion.div {...fadeUp(0.02)} id="announcements-section" className="scroll-mt-32">
          <ModernAnnouncements />
        </motion.div>

        <motion.div {...fadeUp(0.04)}>
          <div className="grid grid-cols-1 overflow-hidden rounded-2xl border border-border bg-card shadow-elevation-2 md:grid-cols-12">
            <div className="md:col-span-7">
              <WeekStrip counts={weekCounts} framed={false} />
            </div>
            <div className="border-t border-border md:col-span-5 md:border-s md:border-t-0">
              {nextSession ? (
                <NextSessionHero timeline={timeline} framed={false} />
              ) : (
                <div className="flex h-full min-h-[150px] items-center justify-center p-5">
                  <EmptyState
                    icon={Calendar}
                    title="لا توجد حصة قادمة اليوم"
                    subtitle="يمكنك بدء حصة مباشرة متى شئت"
                    compact
                  />
                </div>
              )}
            </div>
          </div>
        </motion.div>

        <motion.div {...fadeUp(0.06)}>
          <DashboardStats stats={stats} isTeacher={true} />
        </motion.div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <SectionCard delay={0.08}>
            <SmartNotifications
              lowBalanceStudents={lowBalanceStudents}
              focusStudents={focusStudents || []}
            />
          </SectionCard>
          <SectionCard delay={0.1}>
            <QuickActions showQuickLinks={true} />
          </SectionCard>
        </div>

        <SectionCard delay={0.12}>
          <LiveSessions />
        </SectionCard>

        <SectionCard delay={0.16}>
          <TasksAndRequests tasks={tasks} limit={3} />
        </SectionCard>

        {timeline.length > 0 && (
          <SectionCard delay={0.2}>
            <TeacherSessionTimeline sessions={timeline} onStudentClick={setBriefingStudent} />
          </SectionCard>
        )}

        <SectionCard delay={0.22}>
          <TopAttendanceStudents sessions={rawSessions} onStudentClick={setBriefingStudent} />
        </SectionCard>

        {briefingStudent && briefingStudent.id && briefingStudent.name && briefingStudent.grade && (
          <StudentQuickBrief
            isOpen={!!briefingStudent}
            onClose={() => setBriefingStudent(null)}
            onGenerateReport={(student) => {
              const studentSessions = rawSessions.filter(
                (s: Session & { studentID?: string }) =>
                  s.studentId === student.id || s.studentID === student.id,
              )
              // Canonical resolver — raw 'completed' equality misses the Arabic
              // statuses ('مكتملة', 'تم الإنجاز') and reported 0% attendance.
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
    </div>
  )
}
