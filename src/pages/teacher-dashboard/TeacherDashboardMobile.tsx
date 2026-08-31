import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar,
  CalendarDays,
  ClipboardList,
  Home,
  Bell,
  Loader2,
  RefreshCw,
  User as UserIcon,
} from 'lucide-react'
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

const SectionLabel = ({ label, tone }: { label: string; tone: string }) => (
  <div className="flex items-center gap-2 px-1">
    <span className={cn('h-1.5 w-1.5 rounded-full', tone)} aria-hidden="true" />
    <h2 className="text-sm font-black text-main">{label}</h2>
  </div>
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

      <div className="space-y-4 px-2.5 pt-4 sm:px-4">
        {/* Profile + notifications row */}
        <div className="flex items-center justify-between px-1">
          <button
            onClick={() => navigate('/teacher-profile')}
            className="flex items-center gap-2.5 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            aria-label="الملف الشخصي"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 shadow-md shadow-primary/25">
              <UserIcon size={17} className="text-on-primary" />
            </div>
            <div className="text-start">
              <p className="text-sm font-black text-main">
                أ. {(currentUser?.name || 'المعلمة').split(' ')[0]}
              </p>
              <p className="text-[10px] font-bold text-muted">لوحة المعلمة</p>
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
            className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-primary-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus dark:bg-primary/10"
            aria-label="الإعلانات"
          >
            <Bell size={15} className="text-primary" />
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

        {/* Tab bar */}
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
                  'flex min-h-10 items-center justify-center gap-1.5 rounded-xl px-1 text-[11px] font-black transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
                  isActive
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'text-muted hover:bg-hover hover:text-main',
                )}
              >
                <Icon size={14} />
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
            className="space-y-4"
          >
            {activeTab === 'home' && (
              <>
                {nextSession ? (
                  <NextSessionHero timeline={timeline} />
                ) : (
                  <div className="rounded-3xl border border-border bg-card p-4 shadow-elevation-1">
                    <EmptyState
                      icon={Calendar}
                      title="لا حصص قادمة اليوم"
                      subtitle="يوم هادئ"
                      compact
                    />
                  </div>
                )}
                <WeekStrip counts={weekCounts} />
                <div className="px-1">
                  <QuickActions showQuickLinks={true} />
                </div>
                <SectionLabel label="التنبيهات الذكية" tone="bg-error" />
                <div className="rounded-3xl border border-border bg-card p-4 shadow-elevation-1">
                  <SmartNotifications
                    lowBalanceStudents={lowBalanceStudents}
                    focusStudents={focusStudents || []}
                  />
                </div>
                <section id="announcements-section" className="scroll-mt-24 space-y-3">
                  <SectionLabel label="الإعلانات" tone="bg-info" />
                  <div className="rounded-3xl border border-border bg-card p-3.5 shadow-elevation-1">
                    <ModernAnnouncements />
                  </div>
                </section>
              </>
            )}

            {activeTab === 'schedule' && (
              <>
                <WeekStrip counts={weekCounts} />
                {timeline.length > 0 ? (
                  <div className="rounded-3xl border border-border bg-card p-4 shadow-elevation-1">
                    <TeacherSessionTimeline
                      sessions={timeline}
                      onStudentClick={setBriefingStudent}
                    />
                  </div>
                ) : (
                  <div className="rounded-3xl border border-border bg-card p-4 shadow-elevation-1">
                    <EmptyState
                      icon={Calendar}
                      title="لا توجد حصص اليوم"
                      subtitle="استمتع بيومك!"
                      compact
                    />
                  </div>
                )}
              </>
            )}

            {activeTab === 'reports' && (
              <>
                <div className="rounded-3xl border border-border bg-card p-4 shadow-elevation-1">
                  <FinancialSnapshot
                    monthNetProfit={stats.monthNetProfit}
                    monthRevenue={stats.monthRevenue}
                    expectedCollection={stats.expectedCollection}
                    currency={stats.currency}
                  />
                </div>
                <div className="rounded-3xl border border-border bg-card p-4 shadow-elevation-1">
                  <AttendanceChart rate={stats.attendanceRate} />
                </div>
                <SectionLabel label="الأكثر حضوراً" tone="bg-success" />
                <div className="rounded-3xl border border-border bg-card p-3.5 shadow-elevation-1">
                  <TopAttendanceStudents
                    sessions={rawSessions}
                    onStudentClick={setBriefingStudent}
                  />
                </div>
                <SectionLabel label="الإنجازات التعليمية" tone="bg-primary" />
                <div className="rounded-3xl border border-border bg-card p-3.5 shadow-elevation-1">
                  <TeacherAchievements
                    stats={stats}
                    lowBalanceStudents={lowBalanceStudents}
                    isTeacher={true}
                  />
                </div>
                <SectionLabel label="المهام والطلبات" tone="bg-error" />
                <div className="rounded-3xl border border-border bg-card p-3.5 shadow-elevation-1">
                  <TasksAndRequests tasks={tasks} />
                </div>
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
