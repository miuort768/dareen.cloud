import { useState, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Calendar,
  Loader2,
  RefreshCw,
  Clock,
  Users,
  ListTodo,
  AlertCircle,
  Sparkle,
  GraduationCap,
  BookOpen,
  Star,
  UserCheck,
  FileText,
} from 'lucide-react'
import { EmptyState } from '../../shared/components/ui/EmptyState'
import { DashboardSectionCard as SectionCard } from '../../shared/components/DashboardSectionCard'
import {
  usePullToRefresh,
  OverviewHeader,
  OverviewHero,
  OverviewSearchFilter,
  OverviewCategoryPills,
  OverviewFeaturedCard,
  OverviewPromoBanner,
  type OverviewCategoryItem,
} from '../../shared/components/mobile'
import { DashboardStats } from '../../features/dashboard/components/DashboardStats'
import { ModernAnnouncements } from '../../features/dashboard/components/ModernAnnouncements'
import { NextSessionHero } from '../../features/dashboard/components/NextSessionHero'
import { QuickActions } from '../../features/dashboard/components/QuickActions'
import { SmartNotifications } from '../../features/dashboard/components/SmartNotifications'
import { TasksAndRequests } from '../../features/dashboard/components/TasksAndRequests'
import { TeacherSessionTimeline } from '../../features/dashboard/components/TeacherSessionTimeline'
import { StudentQuickBrief } from '../../features/dashboard/components/StudentQuickBrief'
import { MonthlyReportPreview } from '../../features/dashboard/components/MonthlyReportPreview'
import { TeacherHero } from './TeacherHero'
import { WeekStrip } from './WeekStrip'
import { sessionOutcome } from '../../shared/utils/enrollments'
import type { TeacherDashboardMobileProps } from './types'
import type { Session } from '../../types'

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
  const { isRefreshing, pullDistance, handlers } = usePullToRefresh({ onRefresh })
  const quickActionsRef = useRef<HTMLDivElement>(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')

  const nextSession = timeline.find((s) => s.status === 'scheduled' || s.status === 'in-progress')
  const firstName = (currentUser?.name || 'المعلمة').split(' ')[0] || 'المعلمة'

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

  const categories: OverviewCategoryItem[] = useMemo(
    () => [
      { id: 'all', label: 'الكل', icon: Sparkle },
      { id: 'sessions', label: 'حصص اليوم', icon: Clock, count: timeline.length },
      { id: 'students', label: 'الطلاب', icon: Users, count: stats.studentsCount },
      { id: 'tasks', label: 'المهام', icon: ListTodo, count: tasks.length },
      { id: 'alerts', label: 'التنبيهات', icon: AlertCircle, count: lowBalanceStudents.length },
    ],
    [timeline.length, stats.studentsCount, tasks.length, lowBalanceStudents.length],
  )

  // Filter timeline sessions for the featured cards
  const filteredSessions = useMemo(() => {
    let list = timeline
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      list = list.filter(
        (s) =>
          s.studentName?.toLowerCase().includes(q) ||
          s.subject?.toLowerCase().includes(q) ||
          s.time?.toLowerCase().includes(q),
      )
    }
    return list
  }, [timeline, searchQuery])

  const scrollToQuickActions = () => {
    quickActionsRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div
      className="overview-mobile-scope min-h-full overflow-x-hidden bg-background pb-8 font-teacher text-main transition-colors duration-500"
      dir="rtl"
      {...handlers}
    >
      {/* Pull To Refresh Indicator */}
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

      <div className="mx-auto max-w-page space-y-4 px-2.5 pb-8 pt-2 sm:px-4">
        {/* 1. Petly Style Top Header */}
        <OverviewHeader
          appName="أكاديمية دارين"
          slogan={`أهلاً أ. ${firstName} · لوحة تحكم المعلمة`}
          logoIcon={<GraduationCap size={22} className="text-on-accent" strokeWidth={2.2} />}
          notificationCount={lowBalanceStudents.length}
          onNotificationClick={() => navigate('/announcements')}
          contextLabel="جدول الحصص والطلاب المسندين"
        />

        {/* 2. Petly Style Hero Banner */}
        <OverviewHero
          badge="يوم دراسي متميز"
          title={`مرحباً، أ. ${firstName}`}
          subtitle={
            nextSession
              ? `حصتك التالية مع ${nextSession.studentName || 'الطالب'} في تمام الساعة ${nextSession.time || 'اليوم'}`
              : 'أهلاً بكِ في لوحة التعليم والتدريب، جاهزون لبدء حصص اليوم بكل نشاط!'
          }
          metric={{
            value: `${stats.todaySessions} حصص`,
            label: 'إجمالي حصص اليوم',
          }}
          ctaText="إجراءات المعلمة"
          onCtaClick={scrollToQuickActions}
          illustration={
            <div className="border-accent/40 bg-accent/20 relative flex h-20 w-20 items-center justify-center rounded-3xl border text-accent shadow-elevation-2">
              <BookOpen size={38} strokeWidth={2} />
            </div>
          }
        />

        {/* 3. Search & Filter Bar */}
        <OverviewSearchFilter
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="ابحث عن حصة، طالب، أو موضوع..."
        />

        {/* 4. Category Pills Row */}
        <OverviewCategoryPills
          categories={categories}
          activeId={activeCategory}
          onSelect={setActiveCategory}
        />

        {/* Announcements Banner */}
        <ModernAnnouncements />

        {/* 5. Featured Cards ("العناصر المميزة" / حصص اليوم) */}
        {(activeCategory === 'all' || activeCategory === 'sessions') && (
          <section>
            <div className="mb-2.5 flex items-center justify-between px-0.5">
              <div className="flex items-center gap-2">
                <span className="bg-accent/20 flex h-6 w-6 items-center justify-center rounded-lg text-accent">
                  <Star size={13} strokeWidth={2.5} className="fill-accent text-accent" />
                </span>
                <h3 className="text-sm font-black text-main">حصص اليوم المميزة</h3>
              </div>
              <span className="text-xs font-bold text-accent">{timeline.length} حصة مجدولة</span>
            </div>

            {filteredSessions.length > 0 ? (
              <div className="grid grid-cols-2 gap-2.5">
                {filteredSessions.slice(0, 4).map((s) => {
                  const isScheduled = s.status === 'scheduled' || !s.status
                  const isCompleted = s.status === 'completed'
                  return (
                    <OverviewFeaturedCard
                      key={s.id}
                      badge={{
                        label: isCompleted ? 'تم الإنجاز' : isScheduled ? 'قادمة' : 'ملغاة',
                        tone: isCompleted ? 'success' : isScheduled ? 'info' : 'warning',
                      }}
                      title={s.studentName || 'طالب'}
                      subtitle={s.subject || 'جلسة تعليمية'}
                      meta={s.time ? `الساعة ${s.time}` : 'اليوم'}
                      highlight={s.time || 'اليوم'}
                      highlightLabel="موعد الحصة"
                      actionLabel="التحضير"
                      onClick={() => {
                        setBriefingStudent({
                          id: s.id,
                          name: s.studentName,
                          grade: 'الصف الحالي',
                          curriculum: s.subject,
                          totalPoints: 100,
                        })
                      }}
                      visual={
                        <div className="flex flex-col items-center justify-center gap-1 text-primary">
                          <UserCheck size={26} strokeWidth={1.8} />
                          <span className="line-clamp-1 text-[9px] font-black text-main">
                            {s.studentName}
                          </span>
                        </div>
                      }
                    />
                  )
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-border bg-card p-5 text-center shadow-elevation-1">
                <EmptyState
                  icon={Calendar}
                  title="لا توجد حصص قادمة اليوم"
                  subtitle="يمكنك بدء حصة مباشرة متى شئت"
                  compact
                />
              </div>
            )}
          </section>
        )}

        {/* 6. Petly Style Promo Banner */}
        <OverviewPromoBanner
          title="التقارير الشهرية للطلاب"
          subtitle="إنشاء ومشاركة تقارير تقييم الطلاب بضغطة زر واحدة"
          icon={<FileText size={24} className="text-accent" strokeWidth={2} />}
          onClick={() => navigate('/teacher-reports')}
          ariaLabel="الانتقال إلى تقارير المعلمة"
        />

        {/* 7. Preserved Existing Panels */}
        {nextSession && <NextSessionHero timeline={timeline} />}

        {(activeCategory === 'all' || activeCategory === 'students') && (
          <>
            <TeacherHero
              name={currentUser?.name || currentUser?.username || 'المعلمة'}
              stats={stats}
              lowBalanceStudents={lowBalanceStudents}
            />
            <DashboardStats stats={stats} isTeacher={true} carousel />
          </>
        )}

        <div ref={quickActionsRef}>
          <SectionCard>
            <QuickActions showQuickLinks={true} withHeader={true} />
          </SectionCard>
        </div>

        {(activeCategory === 'all' || activeCategory === 'sessions') && timeline.length > 0 && (
          <SectionCard>
            <TeacherSessionTimeline sessions={timeline} onStudentClick={setBriefingStudent} />
          </SectionCard>
        )}

        {(activeCategory === 'all' || activeCategory === 'alerts') && (
          <SectionCard>
            <SmartNotifications
              lowBalanceStudents={lowBalanceStudents}
              focusStudents={focusStudents || []}
            />
          </SectionCard>
        )}

        {(activeCategory === 'all' || activeCategory === 'tasks') && (
          <SectionCard>
            <TasksAndRequests tasks={tasks} limit={3} />
          </SectionCard>
        )}

        <WeekStrip counts={weekCounts} />
      </div>

      {/* Modals */}
      {briefingStudent && briefingStudent.id && briefingStudent.name && (
        <StudentQuickBrief
          isOpen={!!briefingStudent}
          onClose={() => setBriefingStudent(null)}
          onGenerateReport={(student) => {
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
          student={{
            id: briefingStudent.id,
            name: briefingStudent.name,
            grade: briefingStudent.grade || '',
            notes: briefingStudent.notes,
            curriculum: briefingStudent.curriculum,
            totalPoints: briefingStudent.totalPoints,
          }}
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
