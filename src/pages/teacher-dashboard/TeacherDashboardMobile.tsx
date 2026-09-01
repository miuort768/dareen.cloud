import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, CalendarDays, ClipboardList, Home, Bell, Loader2, RefreshCw } from 'lucide-react'
import { triggerHaptic } from '../../lib/haptics'
import { EmptyState } from '../../shared/components/ui/EmptyState'
import { cn } from '../../lib/utils'
import { usePullToRefresh } from '../../shared/components/mobile/usePullToRefresh'
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
import { GreetingStrip } from './GreetingStrip'
import { WeekStrip } from './WeekStrip'
import type {
  DashboardStats as DashboardStatsType,
  LowBalanceStudent,
  DashboardTask,
} from '../../features/dashboard/types'
import type { Session } from '../../types'
import type { User } from '../../types/auth'

interface TeacherDashboardMobileProps {
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
  onRefresh: () => void
}

const TABS = [
  { id: 'home' as const, label: 'الرئيسية', icon: Home },
  { id: 'schedule' as const, label: 'الجدول', icon: CalendarDays },
  { id: 'reports' as const, label: 'التقارير', icon: ClipboardList },
]

const SectionCard = ({
  id,
  title,
  tone,
  className,
  children,
}: {
  id?: string
  title?: string
  tone?: string
  className?: string
  children: ReactNode
}) => (
  <section
    id={id}
    className={cn(
      'rounded-3xl border border-border bg-card p-5 shadow-elevation-1 transition-colors duration-300',
      className,
    )}
  >
    {title && (
      <div className="mb-3 flex items-center gap-2">
        <span className={cn('h-1.5 w-1.5 rounded-full', tone ?? 'bg-primary')} aria-hidden="true" />
        <h2 className="text-sm font-black text-main">{title}</h2>
      </div>
    )}
    {children}
  </section>
)

export const TeacherDashboardMobile = ({
  currentUser,
  stats,
  rawSessions,
  tasks,
  lowBalanceStudents,
  focusStudents,
  timeline,
  weekCounts,
  onRefresh,
}: TeacherDashboardMobileProps) => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'home' | 'schedule' | 'reports'>('home')
  const { isRefreshing, pullDistance, handlers } = usePullToRefresh({ onRefresh })
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
  const firstName = (currentUser?.name || 'المعلمة').split(' ')[0]

  return (
    <div
      className="min-h-full overflow-x-hidden bg-background pb-6 transition-colors duration-500"
      dir="rtl"
      {...handlers}
    >
      <motion.div
        animate={{ height: isRefreshing ? 44 : pullDistance }}
        className="flex items-center justify-center overflow-hidden"
      >
        <div className="flex items-center gap-2 text-xs font-bold text-primary">
          {isRefreshing ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>جاري التحديث...</span>
            </>
          ) : pullDistance > 40 ? (
            <>
              <RefreshCw size={16} className="animate-pulse" />
              <span>أفلت للتحديث</span>
            </>
          ) : (
            <span className="text-muted">اسحب للتحديث</span>
          )}
        </div>
      </motion.div>

      <div className="space-y-5 px-4 pt-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/teacher-profile')}
            className="flex items-center gap-2.5 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            aria-label="الملف الشخصي"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-base font-black text-on-primary">
              {firstName.charAt(0)}
            </div>
            <div className="text-start">
              <p className="text-sm font-black text-main">أ. {firstName}</p>
              <p className="text-[11px] font-bold text-muted">لوحة المعلمة</p>
            </div>
          </button>
          <button
            onClick={() => {
              setActiveTab('home')
              setTimeout(() => {
                document
                  .getElementById('announcements-section')
                  ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }, 250)
            }}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            aria-label="الإعلانات"
          >
            <Bell size={16} className="text-main" />
            <span className="absolute -end-0.5 -top-0.5 h-2 w-2 rounded-full border-2 border-background bg-error" />
          </button>
        </div>

        <GreetingStrip
          name={currentUser?.name || currentUser?.username || 'المعلمة'}
          studentsCount={stats.studentsCount}
          todayCount={stats.todaySessions}
          monthCompleted={stats.monthCompletedSessions}
          points={stats.teacherPoints}
        />

        <div
          role="tablist"
          aria-label="أقسام لوحة التحكم"
          className="grid grid-cols-3 gap-1 rounded-2xl border border-border bg-card p-1 shadow-elevation-1"
        >
          {TABS.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => {
                  if (activeTab === tab.id) return
                  triggerHaptic('light')
                  setActiveTab(tab.id)
                }}
                className={cn(
                  'flex min-h-11 items-center justify-center gap-1.5 rounded-xl px-1 text-xs font-black transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
                  isActive
                    ? 'bg-primary text-on-primary'
                    : 'text-muted hover:bg-hover hover:text-main',
                )}
              >
                <Icon size={15} />
                {tab.label}
              </button>
            )
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-5"
          >
            {activeTab === 'home' && (
              <>
                {nextSession ? (
                  <NextSessionHero timeline={timeline} />
                ) : (
                  <SectionCard>
                    <EmptyState
                      icon={Calendar}
                      title="لا حصص قادمة اليوم"
                      subtitle="يوم هادئ"
                      compact
                    />
                  </SectionCard>
                )}
                <WeekStrip counts={weekCounts} />
                <QuickActions showQuickLinks={true} />
                <SectionCard>
                  <SmartNotifications
                    lowBalanceStudents={lowBalanceStudents}
                    focusStudents={focusStudents || []}
                  />
                </SectionCard>
                <SectionCard
                  id="announcements-section"
                  title="الإعلانات"
                  tone="bg-info"
                  className="scroll-mt-24"
                >
                  <ModernAnnouncements />
                </SectionCard>
              </>
            )}

            {activeTab === 'schedule' && (
              <>
                <WeekStrip counts={weekCounts} />
                {timeline.length > 0 ? (
                  <SectionCard>
                    <TeacherSessionTimeline
                      sessions={timeline}
                      onStudentClick={setBriefingStudent}
                    />
                  </SectionCard>
                ) : (
                  <SectionCard>
                    <EmptyState
                      icon={Calendar}
                      title="لا توجد حصص اليوم"
                      subtitle="استمتع بيومك!"
                      compact
                    />
                  </SectionCard>
                )}
              </>
            )}

            {activeTab === 'reports' && (
              <>
                <SectionCard>
                  <FinancialSnapshot
                    monthNetProfit={stats.monthNetProfit}
                    monthRevenue={stats.monthRevenue}
                    expectedCollection={stats.expectedCollection}
                    currency={stats.currency}
                  />
                </SectionCard>
                <SectionCard>
                  <AttendanceChart rate={stats.attendanceRate} />
                </SectionCard>
                <SectionCard>
                  <TopAttendanceStudents
                    sessions={rawSessions}
                    onStudentClick={setBriefingStudent}
                  />
                </SectionCard>
                <SectionCard>
                  <TeacherAchievements
                    stats={stats}
                    lowBalanceStudents={lowBalanceStudents}
                    isTeacher={true}
                  />
                </SectionCard>
                <SectionCard>
                  <TasksAndRequests tasks={tasks} />
                </SectionCard>
              </>
            )}
          </motion.div>
        </AnimatePresence>
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
