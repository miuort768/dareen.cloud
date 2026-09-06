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

      {/* الحصة القادمة + الأسبوع — نصفا الشاشة */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <motion.div {...fadeUp(0.04)}>
          {nextSession ? (
            <NextSessionHero timeline={timeline} />
          ) : (
            <div className="flex h-full min-h-[150px] items-center justify-center rounded-card border border-border bg-card p-5 shadow-elevation-1">
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
      </div>

      <motion.div {...fadeUp(0.08)}>
        <DashboardStats stats={stats} isTeacher={true} />
      </motion.div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <SectionCard delay={0.1} className="lg:col-span-8">
          <LiveSessions />
        </SectionCard>

        <SectionCard delay={0.12} className="p-4 lg:col-span-4">
          <QuickActions showQuickLinks={true} />
        </SectionCard>
      </div>

      {timeline.length > 0 && (
        <SectionCard delay={0.14}>
          <TeacherSessionTimeline sessions={timeline} onStudentClick={setBriefingStudent} />
        </SectionCard>
      )}

      <SectionCard delay={0.16}>
        <SmartNotifications
          lowBalanceStudents={lowBalanceStudents}
          focusStudents={focusStudents || []}
        />
      </SectionCard>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <SectionCard delay={0.18}>
          <AttendanceChart rate={stats.attendanceRate} />
        </SectionCard>
        <SectionCard delay={0.2}>
          <TopAttendanceStudents sessions={rawSessions} onStudentClick={setBriefingStudent} />
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <SectionCard delay={0.22} className="p-4">
          <TasksAndRequests tasks={tasks} />
        </SectionCard>

        <SectionCard delay={0.24} className="p-4">
          <FinancialSnapshot
            monthNetProfit={stats.monthNetProfit}
            monthRevenue={stats.monthRevenue}
            expectedCollection={stats.expectedCollection}
            currency={stats.currency}
          />
        </SectionCard>

        <SectionCard delay={0.26} className="p-4">
          <TeacherAchievements
            stats={stats}
            lowBalanceStudents={lowBalanceStudents}
            isTeacher={true}
          />
        </SectionCard>
      </div>

      <SectionCard delay={0.28} id="announcements-section" className="scroll-mt-32">
        <ModernAnnouncements />
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
