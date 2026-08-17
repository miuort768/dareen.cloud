import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Clock,
  Users,
  Award,
  Bell,
  LayoutDashboard,
  Calendar,
  CheckSquare,
  Sparkles,
  Wallet,
  ArrowLeft,
  Loader2,
  RefreshCw,
  User as UserIcon,
  LogOut,
} from 'lucide-react'
import { triggerHaptic } from '../lib/haptics'
import { EmptyState } from '../shared/components/ui/EmptyState'
import { cn } from '../lib/utils'
import { MobileBottomNav } from '../shared/components/ui/MobileBottomNav'
import { usePullToRefresh } from '../shared/components/mobile/usePullToRefresh'
import { TeacherAchievements } from '../features/dashboard/components/TeacherAchievements'
import { TasksAndRequests } from '../features/dashboard/components/TasksAndRequests'
import { ModernAnnouncements } from '../features/dashboard/components/ModernAnnouncements'
import { TopAttendanceStudents } from '../features/dashboard/components/TopAttendanceStudents'
import { TeacherSessionTimeline } from '../features/dashboard/components/TeacherSessionTimeline'
import { StudentQuickBrief } from '../features/dashboard/components/StudentQuickBrief'
import { MonthlyReportPreview } from '../features/dashboard/components/MonthlyReportPreview'
import { LiveSessions } from '../features/dashboard/components/LiveSessions'
import { NextSessionHero } from '../features/dashboard/components/NextSessionHero'
import { QuickActions } from '../features/dashboard/components/QuickActions'
import { SmartNotifications } from '../features/dashboard/components/SmartNotifications'
import { StartLiveSessionDialog } from '../features/dashboard/components/StartLiveSessionDialog'
import { FinancialSnapshot } from '../features/dashboard/components/FinancialSnapshot'
import { AttendanceChart } from '../features/dashboard/components/AttendanceChart'
import type {
  DashboardStats as DashboardStatsType,
  LowBalanceStudent,
  DashboardTask,
} from '../features/dashboard/types'
import type { User } from '../types/auth'

interface TeacherDashboardMobileProps {
  currentUser: User | null
  stats: DashboardStatsType
  rawSessions: unknown[]
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
  onRefresh: () => void
  logout?: () => void
}

const tabs = [
  { id: 'home' as const, label: 'الرئيسية', icon: LayoutDashboard },
  { id: 'schedule' as const, label: 'الجدول', icon: Calendar },
  { id: 'reports' as const, label: 'التقارير', icon: CheckSquare },
]

export const TeacherDashboardMobile = ({
  currentUser,
  stats,
  rawSessions,
  tasks,
  lowBalanceStudents,
  focusStudents,
  timeline,
  onRefresh,
  logout,
}: TeacherDashboardMobileProps) => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'home' | 'schedule' | 'reports'>('home')
  const handleTabChange = (tab: 'home' | 'schedule' | 'reports') => {
    triggerHaptic('light')
    setActiveTab(tab)
  }
  const { isRefreshing, pullDistance, handlers } = usePullToRefresh({ onRefresh })
  const containerRef = useRef<HTMLDivElement>(null)
  const [briefingStudent, setBriefingStudent] = useState<{
    id?: string
    name?: string
    grade?: string
    notes?: string
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
  const [startDialog, setStartDialog] = useState<{
    open: boolean
    studentId?: string
    subject?: string
  }>({ open: false })

  const nextSession = timeline.find((s) => s.status === 'scheduled' || s.status === 'in-progress')
  const allTimeline = timeline || []
  const remainingSessions = allTimeline.filter(
    (s) => s.status === 'scheduled' || s.status === 'in-progress',
  )
  // Filter to find the next upcoming session (not the first one, but the one after current time)
  const nextUpcomingSession =
    remainingSessions.length > 0
      ? [...remainingSessions].sort(
          (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime(),
        )[0]
      : null
  const openStart = (studentId?: string, subject?: string) =>
    setStartDialog({ open: true, studentId, subject })
  const handleSkip = () => {
    // Find the session after the current nextSession
    if (nextUpcomingSession) {
      const currentIndex = remainingSessions.indexOf(nextUpcomingSession)
      const nextIndex = currentIndex + 1
      if (nextIndex < remainingSessions.length) {
        setStartDialog({
          open: true,
          studentId: remainingSessions[nextIndex].studentId,
          subject: remainingSessions[nextIndex].subject,
        })
      } else {
        // No more sessions
        setStartDialog({ open: false })
      }
    } else {
      setStartDialog({ open: false })
    }
  }

  return (
    <div
      ref={containerRef}
      className="relative min-h-full overflow-x-hidden bg-background pb-28 font-sans transition-colors duration-500 dark:bg-background"
      dir="rtl"
      {...handlers}
    >
      {/* Pull to refresh indicator */}
      <motion.div
        animate={{ height: isRefreshing ? 44 : pullDistance }}
        className="flex items-center justify-center overflow-hidden"
      >
        <div className="flex items-center gap-2 text-xs font-bold text-primary dark:text-primary">
          {isRefreshing ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>جاري التحميل...</span>
            </>
          ) : pullDistance > 40 ? (
            <>
              <RefreshCw size={16} className="animate-pulse" />
              <span>اترك للتحديث</span>
            </>
          ) : (
            <span className="text-muted">اسحب للتحديث</span>
          )}
        </div>
      </motion.div>

      {/* Frosted Glass Header */}
      <div
        className={cn(
          'bg-surface/90 dark:bg-surface/90 sticky top-0 z-50 border-b border-border backdrop-blur-xl transition-all duration-500 dark:border-border',
        )}
      >
        <div className="px-5 pb-4 pt-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/teacher-profile')}
                className="flex items-center gap-3 text-start"
                aria-label="الملف الشخصي"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary dark:bg-primary">
                  <UserIcon size={18} className="text-on-primary dark:text-on-primary" />
                </div>
              </button>
              <div>
                <h1 className="text-base font-bold leading-tight text-main dark:text-main">
                  {(currentUser?.name || currentUser?.username || 'المعلم').split(' ')[0]}
                </h1>
                <p className="text-[11px] font-medium text-muted dark:text-muted">معلم</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setActiveTab('home')
                  setTimeout(() => {
                    const el = document.getElementById('announcements-section')
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }, 250)
                }}
                className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-primary-soft dark:bg-primary/10"
                aria-label="الإعلانات"
              >
                <Bell size={15} className="text-primary dark:text-primary" />
                <span className="absolute -end-0.5 -top-0.5 h-2 w-2 rounded-full border-2 border-surface bg-error dark:border-background dark:bg-error" />
              </button>
              {logout && (
                <button
                  onClick={logout}
                  className="dark:bg-error/10 flex h-9 w-9 items-center justify-center rounded-xl bg-error-soft"
                  aria-label="تسجيل الخروج"
                >
                  <LogOut size={15} className="text-error dark:text-error" />
                </button>
              )}
            </div>
          </div>
          {/* Stats row */}
          <div className="mt-3 flex items-center gap-2">
            <div className="flex flex-1 items-center gap-2 rounded-xl border border-primary/20 bg-primary-soft px-3 py-2.5 dark:border-border dark:bg-primary/10">
              <Clock size={13} className="shrink-0 text-primary dark:text-primary" />
              <div className="flex items-baseline gap-1">
                <span className="text-base font-bold text-main dark:text-main">
                  {stats.todaySessions || 0}
                </span>
                <span className="text-[11px] font-medium text-muted dark:text-muted">حصة</span>
              </div>
            </div>
            <div className="flex flex-1 items-center gap-2 rounded-xl border border-primary/20 bg-primary-soft px-3 py-2.5 dark:border-border dark:bg-primary/10">
              <Users size={13} className="shrink-0 text-info dark:text-primary" />
              <div className="flex items-baseline gap-1">
                <span className="text-base font-bold text-main dark:text-main">
                  {stats.studentsCount || 0}
                </span>
                <span className="text-[11px] font-medium text-muted dark:text-muted">طالب</span>
              </div>
            </div>
            <div className="flex flex-1 items-center gap-2 rounded-xl border border-primary/20 bg-primary-soft px-3 py-2.5 dark:border-border dark:bg-primary/10">
              <Award size={13} className="shrink-0 text-success dark:text-primary" />
              <div className="flex items-baseline gap-1">
                <span className="text-base font-bold text-main dark:text-main">
                  {stats.completedSessions || 0}
                </span>
                <span className="text-[11px] font-medium text-muted dark:text-muted">منجز</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-4 pb-4 pt-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'home' && (
              <div className="space-y-4">
                {nextSession && (
                  <div className="rounded-2xl border border-border bg-surface p-4 dark:border-border dark:bg-card">
                    <NextSessionHero
                      timeline={timeline}
                      onStart={(id, subject) => openStart(id, subject)}
                      onSkip={() => handleSkip()}
                    />
                  </div>
                )}
                <div className="rounded-2xl border border-border bg-surface p-4 dark:border-border dark:bg-card">
                  <QuickActions
                    onStartSession={() => openStart(nextSession?.studentId, nextSession?.subject)}
                    sessionAvailable={!!nextSession}
                    showQuickLinks={false}
                  />
                </div>
                <div className="rounded-2xl border border-border bg-surface p-4 dark:border-border dark:bg-card">
                  <button
                    onClick={() => navigate('/teacher-payment-history')}
                    className="flex w-full items-center gap-3 py-1 text-start transition-all duration-200 hover:opacity-80 active:scale-[0.99]"
                    aria-label="سجل الدفعات"
                  >
                    <div className="dark:bg-success/10 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-success-soft">
                      <Wallet size={16} className="text-success dark:text-success" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-bold text-main dark:text-main">سجل الدفعات</p>
                      <p className="text-[11px] font-medium text-muted dark:text-muted">
                        عرض سجل المعاملات المالية
                      </p>
                    </div>
                    <ArrowLeft size={14} className="shrink-0 text-muted dark:text-muted" />
                  </button>
                </div>
                <section>
                  <div className="mb-3 flex items-center gap-2 px-1">
                    <Sparkles size={14} className="text-primary dark:text-primary" />
                    <h2 className="text-sm font-bold text-main dark:text-main">الحصص المباشرة</h2>
                  </div>
                  <div className="rounded-2xl border border-border bg-surface p-3.5 dark:border-border dark:bg-card">
                    <LiveSessions />
                  </div>
                </section>
                <section id="announcements-section" className="scroll-mt-24">
                  <div className="mb-3 flex items-center gap-2 px-1">
                    <Sparkles size={14} className="text-warning dark:text-warning" />
                    <h2 className="text-sm font-bold text-main dark:text-main">الإعلانات</h2>
                  </div>
                  <div className="rounded-2xl border border-border bg-surface p-3.5 dark:border-border dark:bg-card">
                    <ModernAnnouncements />
                  </div>
                </section>
                <div className="rounded-2xl border border-border bg-surface p-4 dark:border-border dark:bg-card">
                  <SmartNotifications
                    lowBalanceStudents={lowBalanceStudents}
                    focusStudents={focusStudents || []}
                  />
                </div>
              </div>
            )}
            {activeTab === 'schedule' && (
              <div className="space-y-4">
                {timeline.length > 0 ? (
                  <section>
                    <div className="mb-3 flex items-center gap-2 px-1">
                      <Sparkles size={14} className="text-info dark:text-info" />
                      <h2 className="text-sm font-bold text-main dark:text-main">الجدول اليومي</h2>
                    </div>
                    <div className="rounded-2xl border border-border bg-surface p-4 dark:border-border dark:bg-card">
                      <TeacherSessionTimeline
                        sessions={timeline}
                        onStudentClick={setBriefingStudent}
                        onSessionStart={(s) => openStart(s.studentId, s.subject)}
                      />
                    </div>
                  </section>
                ) : (
                  <EmptyState
                    icon={Calendar}
                    title="لا توجد حصص اليوم"
                    subtitle="استمتع بيومك!"
                    compact
                  />
                )}
              </div>
            )}
            {activeTab === 'reports' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-border bg-surface p-4 dark:border-border dark:bg-card">
                    <FinancialSnapshot
                      monthNetProfit={stats.monthNetProfit}
                      monthRevenue={stats.monthRevenue}
                      expectedCollection={stats.expectedCollection}
                    />
                  </div>
                  <div className="rounded-2xl border border-border bg-surface p-4 dark:border-border dark:bg-card">
                    <AttendanceChart rate={stats.attendanceRate} />
                  </div>
                </div>
                <section>
                  <div className="mb-3 flex items-center gap-2 px-1">
                    <Sparkles size={14} className="text-success dark:text-success" />
                    <h2 className="text-sm font-bold text-main dark:text-main">
                      الإنجازات التعليمية
                    </h2>
                  </div>
                  <div className="rounded-2xl border border-border bg-surface p-3.5 dark:border-border dark:bg-card">
                    <TeacherAchievements
                      stats={stats}
                      lowBalanceStudents={lowBalanceStudents}
                      isTeacher={true}
                    />
                  </div>
                </section>
                <section>
                  <div className="mb-3 flex items-center gap-2 px-1">
                    <Sparkles size={14} className="text-error dark:text-error" />
                    <h2 className="text-sm font-bold text-main dark:text-main">المهام والطلبات</h2>
                  </div>
                  <div className="rounded-2xl border border-border bg-surface p-3.5 dark:border-border dark:bg-card">
                    <TasksAndRequests tasks={tasks} />
                  </div>
                </section>
                <section>
                  <div className="mb-3 flex items-center gap-2 px-1">
                    <Sparkles size={14} className="text-warning dark:text-warning" />
                    <h2 className="text-sm font-bold text-main dark:text-main">الأكثر حضوراً</h2>
                  </div>
                  <div className="rounded-2xl border border-border bg-surface p-3.5 dark:border-border dark:bg-card">
                    <TopAttendanceStudents
                      sessions={rawSessions}
                      onStudentClick={setBriefingStudent}
                    />
                  </div>
                </section>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Tab Bar */}
      <MobileBottomNav
        items={tabs}
        activeTab={activeTab}
        onTabChange={(id) => handleTabChange(id as 'home' | 'schedule' | 'reports')}
        layoutId="teacher-tab-dot"
      />

      {briefingStudent && (
        <StudentQuickBrief
          isOpen={!!briefingStudent}
          onClose={() => setBriefingStudent(null)}
          onGenerateReport={(student) => {
            const studentSessions = rawSessions.filter(
              (s: Record<string, unknown>) =>
                s.studentId === student.id || s.studentID === student.id,
            )
            const completed = studentSessions.filter(
              (s: Record<string, unknown>) => s.status === 'completed',
            ).length
            const total = studentSessions.filter(
              (s: Record<string, unknown>) => s.status === 'completed' || s.status === 'cancelled',
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
          student={briefingStudent}
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
      <StartLiveSessionDialog
        open={startDialog.open}
        onClose={() => setStartDialog({ open: false })}
        defaultStudentId={startDialog.studentId}
        defaultSubject={startDialog.subject}
      />
    </div>
  )
}
