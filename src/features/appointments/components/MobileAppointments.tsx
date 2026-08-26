import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { CalendarCheck2, CheckCircle2, Loader2, RefreshCw, AlertTriangle } from 'lucide-react'
import { triggerHaptic } from '../../../lib/haptics'
import { cn } from '../../../lib/utils'
import { MobilePage, usePullToRefresh, MobileSkeleton } from '../../../shared/components/mobile'
import {
  AppointmentsHero,
  AppointmentListView,
  AppointmentFilters,
  AppointmentDetailsSheet,
} from './mobile-appointments'
import { DAYS_OF_WEEK, appointmentTimeSort, type AppointmentEvent } from '../types'
import { useAppointmentsData } from '../hooks/useAppointments'

type Tab = 'upcoming' | 'completed'

/** واجهة الهاتف — تصميم فاخر: Hero بحلقة تقدم اليوم + تبويبات لاصقة + بطاقات بخانة وقت */
export const MobileAppointments = () => {
  const [activeTab, setActiveTab] = useState<Tab>('upcoming')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterDay, setFilterDay] = useState<string>('all')
  const [filterTeacher, setFilterTeacher] = useState<string>('all')
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentEvent | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  const {
    loading,
    isError,
    refetch,
    allAppointments,
    uniqueTeachers,
    completedSessionIds,
    completeMutation,
    canComplete,
    todayName,
    stats,
  } = useAppointmentsData()

  const { isRefreshing, pullDistance, handlers } = usePullToRefresh({ onRefresh: refetch })

  // القادمة = غير مكتملة (مخفية من السجل)، المكتملة معكوس
  const filtered = useMemo(() => {
    const source =
      activeTab === 'upcoming'
        ? allAppointments.filter((a) => !completedSessionIds.includes(a.id))
        : allAppointments.filter((a) => completedSessionIds.includes(a.id))
    const q = searchTerm.trim().toLowerCase()
    return source.filter((a) => {
      const matchesSearch =
        !q ||
        a.studentName.toLowerCase().includes(q) ||
        a.teacherName.toLowerCase().includes(q) ||
        a.subject.toLowerCase().includes(q)
      const matchesDay = filterDay === 'all' || a.day === filterDay
      const matchesTeacher = filterTeacher === 'all' || a.teacherName === filterTeacher
      return matchesSearch && matchesDay && matchesTeacher
    })
  }, [activeTab, allAppointments, completedSessionIds, searchTerm, filterDay, filterTeacher])

  const appointmentsByDay = useMemo(
    () =>
      DAYS_OF_WEEK.map((day) => ({
        day,
        appointments: filtered.filter((a) => a.day === day).sort(appointmentTimeSort),
      })).filter((d) => filterDay === 'all' || d.day === filterDay),
    [filtered, filterDay],
  )

  const handleCompleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    triggerHaptic('medium')
    completeMutation.mutate(id)
  }

  const tabs: { key: Tab; label: string; icon: typeof CalendarCheck2; count: number }[] = [
    {
      key: 'upcoming',
      label: 'القادمة',
      icon: CalendarCheck2,
      count: stats.total - stats.completed,
    },
    { key: 'completed', label: 'المكتملة', icon: CheckCircle2, count: stats.completed },
  ]

  return (
    <MobilePage>
      <div {...handlers}>
        {/* السحب للتحديث */}
        <motion.div
          style={{ height: pullDistance }}
          animate={{ height: isRefreshing ? 50 : pullDistance }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="flex w-full items-center justify-center overflow-hidden"
        >
          <div className="flex items-center gap-2.5 text-xs font-medium text-primary">
            {isRefreshing ? (
              <>
                <Loader2 size={16} className="animate-spin" strokeWidth={1.5} />
                <span>جاري التحديث...</span>
              </>
            ) : pullDistance > 55 ? (
              <>
                <RefreshCw size={16} className="animate-pulse" strokeWidth={1.5} />
                <span>أفلت للتحديث</span>
              </>
            ) : (
              <span className="text-muted">اسحب للتحديث</span>
            )}
          </div>
        </motion.div>

        {/* بطاقة البطل */}
        <AppointmentsHero
          todayTotal={stats.today}
          remainingToday={stats.remainingToday}
          totalAppointments={stats.total}
          completedCount={stats.completed}
          todayName={todayName}
        />
      </div>

      {/* التبويبات اللاصقة */}
      <div className="bg-background/95 sticky top-0 z-30 mt-3 px-4 pb-2 pt-2 backdrop-blur-sm">
        <div className="flex gap-1 rounded-2xl border border-border bg-card p-1">
          {tabs.map((tab) => (
            <motion.button
              key={tab.key}
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                triggerHaptic('light')
                setActiveTab(tab.key)
                setSearchTerm('')
                setFilterDay('all')
              }}
              aria-pressed={activeTab === tab.key}
              className={cn(
                'relative flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-xl px-2 py-2.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
                activeTab === tab.key
                  ? 'bg-primary font-bold text-on-primary shadow-elevation-1'
                  : 'font-bold text-muted hover:text-main',
              )}
            >
              <tab.icon size={14} strokeWidth={1.7} />
              <span className="text-micro">{tab.label}</span>
              <span
                className={cn(
                  'rounded-full px-1.5 py-0.5 text-micro font-bold tabular-nums leading-none',
                  activeTab === tab.key ? 'bg-white/20 text-on-primary' : 'bg-surface text-muted',
                )}
              >
                {tab.count}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* البحث والفلاتر */}
      <AppointmentFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filterDay={filterDay}
        onDayChange={setFilterDay}
        filterTeacher={filterTeacher}
        onTeacherChange={setFilterTeacher}
        uniqueTeachers={uniqueTeachers}
      />

      {/* المحتوى */}
      <div className="px-4 pb-28">
        {loading && allAppointments.length === 0 ? (
          <MobileSkeleton rows={6} />
        ) : isError ? (
          <div className="bg-error-soft/50 rounded-2xl border border-dashed border-error-soft py-10 text-center">
            <AlertTriangle size={26} className="mx-auto mb-2 text-error" strokeWidth={1.5} />
            <p className="text-xs font-bold text-main">تعذر تحميل المواعيد</p>
            <button
              onClick={() => refetch()}
              className="mx-auto mt-3 block rounded-xl bg-primary px-4 py-2 text-micro font-bold text-on-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            >
              إعادة المحاولة
            </button>
          </div>
        ) : (
          <AppointmentListView
            activeTab={activeTab}
            appointmentsByDay={appointmentsByDay}
            todayName={todayName}
            onComplete={handleCompleteSession}
            onSelect={(app) => {
              triggerHaptic('light')
              setSelectedAppointment(app)
              setShowDetails(true)
            }}
            canComplete={canComplete}
          />
        )}
      </div>

      {/* ورقة التفاصيل */}
      <AppointmentDetailsSheet
        show={showDetails}
        appointment={selectedAppointment}
        activeTab={activeTab}
        canComplete={canComplete}
        onClose={() => {
          triggerHaptic('light')
          setShowDetails(false)
        }}
        onComplete={handleCompleteSession}
      />
    </MobilePage>
  )
}
