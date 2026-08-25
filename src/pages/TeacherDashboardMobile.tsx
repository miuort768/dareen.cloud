import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar,
  Clock,
  Users,
  Award,
  Bell,
  Sparkles,
  Wallet,
  ArrowLeft,
  Loader2,
  RefreshCw,
  User as UserIcon,
  LogOut,
} from 'lucide-react'
import { EmptyState } from '../shared/components/ui/EmptyState'
import { cn } from '../lib/utils'
import { usePullToRefresh } from '../shared/components/mobile/usePullToRefresh'
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
import type {
  DashboardStats as DashboardStatsType,
  LowBalanceStudent,
  DashboardTask,
} from '../features/dashboard/types'
import type { Session } from '../types'
import type { User } from '../types/auth'

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
  onRefresh: () => void
  logout?: () => void
}

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
  const { isRefreshing, pullDistance, handlers } = usePullToRefresh({ onRefresh })
  const containerRef = useRef<HTMLDivElement>(null)
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
      ref={containerRef}
      className="relative min-h-full overflow-x-hidden bg-surface pb-28 font-sans transition-colors duration-500 dark:bg-background"
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
          'border-border/50 sticky top-0 z-50 border-b bg-gradient-to-br from-primary-light via-primary-soft to-surface backdrop-blur-xl transition-all duration-500 dark:border-border dark:from-card dark:via-surface dark:to-background',
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
            <div className="border-border/50 bg-surface/70 flex flex-1 items-center gap-2 rounded-2xl border px-3 py-2.5 shadow-sm dark:border-border dark:bg-primary/10">
              <Clock size={13} className="shrink-0 text-primary dark:text-primary" />
              <div className="flex items-baseline gap-1">
                <span className="text-base font-bold text-main dark:text-main">
                  {stats.todaySessions || 0}
                </span>
                <span className="text-[11px] font-medium text-muted dark:text-muted">حصة</span>
              </div>
            </div>
            <div className="border-border/50 bg-surface/70 flex flex-1 items-center gap-2 rounded-2xl border px-3 py-2.5 shadow-sm dark:border-border dark:bg-primary/10">
              <Users size={13} className="shrink-0 text-info dark:text-primary" />
              <div className="flex items-baseline gap-1">
                <span className="text-base font-bold text-main dark:text-main">
                  {stats.studentsCount || 0}
                </span>
                <span className="text-[11px] font-medium text-muted dark:text-muted">طالب</span>
              </div>
            </div>
            <div className="border-border/50 bg-surface/70 flex flex-1 items-center gap-2 rounded-2xl border px-3 py-2.5 shadow-sm dark:border-border dark:bg-primary/10">
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
      <div className="px-2.5 pb-4 pt-4 sm:px-4">
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
                  <div className="border-border/50 rounded-3xl border bg-surface p-4 shadow-sm dark:border-primary/20 dark:bg-card">
                    <NextSessionHero timeline={timeline} />
                  </div>
                )}
                <div className="px-1">
                  <QuickActions showQuickLinks={true} />
                </div>
                <div className="border-border/50 rounded-3xl border bg-surface p-4 shadow-sm dark:border-primary/20 dark:bg-card">
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
                <section id="announcements-section" className="scroll-mt-24">
                  <div className="mb-3 flex items-center gap-2 px-1">
                    <Sparkles size={14} className="text-warning dark:text-warning" />
                    <h2 className="text-sm font-bold text-main dark:text-main">الإعلانات</h2>
                  </div>
                  <div className="border-border/50 rounded-3xl border bg-surface p-3.5 shadow-sm dark:border-primary/20 dark:bg-card">
                    <ModernAnnouncements />
                  </div>
                </section>
                <div className="border-border/50 rounded-3xl border bg-surface p-4 shadow-sm dark:border-primary/20 dark:bg-card">
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
                    <div className="border-border/50 rounded-3xl border bg-surface p-4 shadow-sm dark:border-primary/20 dark:bg-card">
                      <TeacherSessionTimeline
                        sessions={timeline}
                        onStudentClick={setBriefingStudent}
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
                  <div className="border-border/50 rounded-3xl border bg-surface p-4 shadow-sm dark:border-primary/20 dark:bg-card">
                    <FinancialSnapshot
                      monthNetProfit={stats.monthNetProfit}
                      monthRevenue={stats.monthRevenue}
                      expectedCollection={stats.expectedCollection}
                      currency={stats.currency}
                    />
                  </div>
                  <div className="border-border/50 rounded-3xl border bg-surface p-4 shadow-sm dark:border-primary/20 dark:bg-card">
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
                  <div className="border-border/50 rounded-3xl border bg-surface p-3.5 shadow-sm dark:border-primary/20 dark:bg-card">
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
                  <div className="border-border/50 rounded-3xl border bg-surface p-3.5 shadow-sm dark:border-primary/20 dark:bg-card">
                    <TasksAndRequests tasks={tasks} />
                  </div>
                </section>
                <section>
                  <div className="mb-3 flex items-center gap-2 px-1">
                    <Sparkles size={14} className="text-warning dark:text-warning" />
                    <h2 className="text-sm font-bold text-main dark:text-main">الأكثر حضوراً</h2>
                  </div>
                  <div className="border-border/50 rounded-3xl border bg-surface p-3.5 shadow-sm dark:border-primary/20 dark:bg-card">
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
