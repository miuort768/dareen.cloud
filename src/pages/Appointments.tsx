import { useState, useEffect, useMemo, useCallback } from 'react'
import { useAcademyName } from '../context/AppContext'
import { PageLoader } from '../components/ui/PageLoader'
import { MobileAppointments } from '../features/appointments/components/MobileAppointments'
import { DAYS_OF_WEEK, appointmentTimeSort } from '../features/appointments/types'
import type { AppointmentEvent } from '../features/appointments/types'
import { useAppointmentsData } from '../features/appointments/hooks/useAppointments'
import {
  AppointmentsFilters,
  AppointmentScheduleGrid,
  AppointmentDetailPanel,
} from './appointments-page'
import { Plus, Calendar, CheckCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../lib/utils'

const particles = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 5 + 2,
  duration: Math.random() * 6 + 4,
  delay: Math.random() * 3,
}))

export const Appointments = () => {
  const academyName = useAcademyName()
  useEffect(() => {
    document.title = `المواعيد | ${academyName}`
  }, [academyName])

  const [searchTerm, setSearchTerm] = useState('')
  const [filterDay, setFilterDay] = useState<string>('all')
  const [filterTeacher, setFilterTeacher] = useState<string>('all')
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentEvent | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [fabOpen, setFabOpen] = useState(false)

  // البيانات من قاعدة البيانات عبر /appointments/* و /students (React Query) — بلا أي تخزين محلي
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

  const filteredAppointments = useMemo(
    () =>
      allAppointments.filter((appointment) => {
        if (completedSessionIds.includes(appointment.id)) return false
        const q = searchTerm.toLowerCase()
        const matchesSearch =
          appointment.studentName.toLowerCase().includes(q) ||
          appointment.teacherName.toLowerCase().includes(q) ||
          appointment.subject.toLowerCase().includes(q)
        const matchesDay = filterDay === 'all' || appointment.day === filterDay
        const matchesTeacher = filterTeacher === 'all' || appointment.teacherName === filterTeacher
        return matchesSearch && matchesDay && matchesTeacher
      }),
    [allAppointments, completedSessionIds, searchTerm, filterDay, filterTeacher],
  )

  const appointmentsByDay = useMemo(
    () =>
      DAYS_OF_WEEK.map((day) => ({
        day,
        appointments: filteredAppointments.filter((a) => a.day === day).sort(appointmentTimeSort),
      })).filter(
        // نُخفي الأيام الفارغة لتقليل الضجيج — ما عدا يوم اليوم الحالي
        (dayObj) =>
          (filterDay === 'all' || dayObj.day === filterDay) &&
          (dayObj.appointments.length > 0 || dayObj.day === todayName),
      ),
    [filteredAppointments, filterDay, todayName],
  )

  const hasActiveFilters = searchTerm !== '' || filterDay !== 'all' || filterTeacher !== 'all'

  const handleSelectAppointment = (appointment: AppointmentEvent) => {
    setSelectedAppointment(appointment)
    setShowDetails(true)
  }

  const handleCloseDetails = () => setShowDetails(false)

  const handleResetFilters = () => {
    setSearchTerm('')
    setFilterDay('all')
    setFilterTeacher('all')
  }

  const handleCompleteSession = useCallback(
    (id: string, e?: React.MouseEvent) => {
      e?.stopPropagation()
      completeMutation.mutate(id)
    },
    [completeMutation],
  )

  const handleCompleteAll = useCallback(() => {
    const remaining = allAppointments.filter((a) => !completedSessionIds.includes(a.id))
    if (remaining.length === 0) return
    remaining.forEach((a) => completeMutation.mutate(a.id))
  }, [allAppointments, completedSessionIds, completeMutation])

  const fabActions = useMemo(
    () => [
      {
        icon: Calendar,
        label: 'مواعيد اليوم',
        onClick: () => setFilterDay(todayName),
      },
      ...(canComplete
        ? [{ icon: CheckCircle, label: 'إتمام الكل', onClick: handleCompleteAll }]
        : []),
    ],
    [canComplete, handleCompleteAll, todayName],
  )

  if (loading && allAppointments.length === 0) return <PageLoader />

  return (
    <div className="relative min-h-full pb-24" dir="rtl">
      <div className="mx-auto hidden max-w-page px-2 md:block">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative mb-4 overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary-deep to-primary-hover p-6 md:p-8"
        >
          {particles.map((p) => (
            <motion.div
              key={p.id}
              aria-hidden="true"
              className="pointer-events-none absolute rounded-full bg-white/10"
              style={{ width: p.size, height: p.size, left: `${p.x}%`, top: `${p.y}%` }}
              animate={{ y: [0, -20, 0], opacity: [0.2, 0.5, 0.2] }}
              transition={{
                duration: p.duration,
                repeat: Infinity,
                delay: p.delay,
                ease: 'easeInOut',
              }}
            />
          ))}
          <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <div className="rounded-xl bg-white/15 p-2 backdrop-blur-sm">
                  <Calendar className="text-on-primary" size={20} />
                </div>
                <span className="text-xs font-medium text-white/70">المواعيد الدراسية</span>
              </div>
              <h1 className="mb-1 text-2xl font-bold text-on-primary md:text-3xl">المواعيد</h1>
              <p className="text-sm text-white/70">جدولة ومتابعة الحصص الأكاديمية للطلاب</p>
            </div>
            <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
              <div className="text-center">
                <p className="mb-1 text-xs text-white/60">اليوم</p>
                <p className="text-2xl font-bold tabular-nums text-on-primary">{stats.today}</p>
              </div>
              <div className="h-10 w-px bg-white/10" />
              <div className="text-center">
                <p className="mb-1 text-xs text-white/60">المتبقي</p>
                <p className="text-2xl font-bold tabular-nums text-on-primary">
                  {stats.remainingToday}
                </p>
              </div>
              <div className="h-10 w-px bg-white/10" />
              <div className="text-center">
                <p className="mb-1 text-xs text-white/60">الإجمالي</p>
                <p className="text-2xl font-bold tabular-nums text-on-primary">{stats.total}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {isError ? (
          /* حالة الخطأ مع إعادة المحاولة */
          <div className="bg-error-soft/50 rounded-2xl border border-dashed border-error-soft py-16 text-center">
            <p className="text-sm font-bold text-main">حدث خطأ في تحميل البيانات</p>
            <p className="mt-1 text-xs text-muted">تحقق من الاتصال ثم أعد المحاولة</p>
            <button
              onClick={() => refetch()}
              className="mx-auto mt-4 block rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-on-primary transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            >
              إعادة المحاولة
            </button>
          </div>
        ) : (
          <>
            {/* الفلاتر */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <AppointmentsFilters
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                filterDay={filterDay}
                onDayChange={setFilterDay}
                filterTeacher={filterTeacher}
                onTeacherChange={setFilterTeacher}
                uniqueTeachers={uniqueTeachers}
                hasActiveFilters={hasActiveFilters}
                onReset={handleResetFilters}
              />
            </motion.div>

            <div
              className={`grid gap-4 ${showDetails ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1'}`}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className={showDetails ? 'lg:col-span-2' : ''}
                data-schedule-grid
              >
                <AppointmentScheduleGrid
                  appointmentsByDay={appointmentsByDay}
                  todayName={todayName}
                  onSelectAppointment={handleSelectAppointment}
                  onCompleteSession={handleCompleteSession}
                  isPending={completeMutation.isPending}
                  canComplete={canComplete}
                />
              </motion.div>
              <AppointmentDetailPanel
                appointment={selectedAppointment}
                showDetails={showDetails}
                onClose={handleCloseDetails}
              />
            </div>
          </>
        )}
      </div>

      {/* الهاتف */}
      <div className="block md:hidden">
        <MobileAppointments />
      </div>

      {/* FAB — سطح المكتب فقط */}
      <div className="fixed bottom-6 end-6 z-50 hidden flex-col items-end gap-3 md:flex">
        <AnimatePresence>
          {fabOpen &&
            fabActions.map((action, i) => (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, scale: 0.3, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.3, y: 20 }}
                transition={{ delay: 0.05 * (fabActions.length - 1 - i) }}
                className="flex items-center gap-2"
              >
                <span className="whitespace-nowrap rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-bold shadow-sm">
                  {action.label}
                </span>
                <button
                  onClick={() => {
                    action.onClick()
                    setFabOpen(false)
                  }}
                  aria-label={action.label}
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-on-primary shadow-lg transition-all hover:bg-primary-hover hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                >
                  <action.icon size={18} />
                </button>
              </motion.div>
            ))}
        </AnimatePresence>
        <motion.button
          onClick={() => setFabOpen(!fabOpen)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label={fabOpen ? 'إغلاق الإجراءات السريعة' : 'إجراءات سريعة'}
          aria-expanded={fabOpen}
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-lg text-on-primary shadow-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
            fabOpen ? 'rotate-45 bg-error text-on-error' : 'bg-primary',
          )}
        >
          <Plus size={24} />
        </motion.button>
      </div>
    </div>
  )
}
