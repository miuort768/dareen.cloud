import { useState, useEffect, useMemo, useCallback } from 'react'
import { useAcademyName } from '../context/AppContext'
import { PageLoader } from '../components/ui/PageLoader'
import { FAB_SURFACE } from '../shared/components/ui'
import { MobileAppointments } from '../features/appointments/components/MobileAppointments'
import { DAYS_OF_WEEK, appointmentTimeSort } from '../features/appointments/types'
import type { AppointmentEvent } from '../features/appointments/types'
import { useAppointmentsData } from '../features/appointments/hooks/useAppointments'
import {
  AppointmentsHeader,
  AppointmentScheduleGrid,
  AppointmentDetailPanel,
} from './appointments-page'
import { Plus, Calendar, CheckCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../lib/utils'

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

  // searched = بحث + معلمة فقط (بلا فلترة يوم) — مصدر عدّادات شريط الأيام
  const searchedAppointments = useMemo(
    () =>
      allAppointments.filter((appointment) => {
        if (completedSessionIds.includes(appointment.id)) return false
        const q = searchTerm.toLowerCase()
        const matchesSearch =
          appointment.studentName.toLowerCase().includes(q) ||
          appointment.teacherName.toLowerCase().includes(q) ||
          appointment.subject.toLowerCase().includes(q)
        const matchesTeacher = filterTeacher === 'all' || appointment.teacherName === filterTeacher
        return matchesSearch && matchesTeacher
      }),
    [allAppointments, completedSessionIds, searchTerm, filterTeacher],
  )

  const filteredAppointments = useMemo(
    () =>
      searchedAppointments.filter(
        (appointment) => filterDay === 'all' || appointment.day === filterDay,
      ),
    [searchedAppointments, filterDay],
  )

  const dayCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const appointment of searchedAppointments) {
      counts[appointment.day] = (counts[appointment.day] || 0) + 1
    }
    return counts
  }, [searchedAppointments])

  const appointmentsByDay = useMemo(
    () =>
      DAYS_OF_WEEK.map((day) => ({
        day,
        appointments: filteredAppointments.filter((a) => a.day === day).sort(appointmentTimeSort),
      })).filter(
        // نعرض كل أيام الأسبوع دائمًا — اليوم الفارغ يظهر بحالة "لا مواعيد"
        // ويُقصر العرض على اليوم المفلتر فقط عند اختيار يوم محدد
        (dayObj) => filterDay === 'all' || dayObj.day === filterDay,
      ),
    [filteredAppointments, filterDay],
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
    <div className="relative min-h-full bg-background" dir="rtl">
      <div className="hidden px-2 md:block">
        {isError ? (
          /* حالة الخطأ مع إعادة المحاولة */
          <div className="rounded-2xl border border-dashed border-error-soft bg-error-soft py-16 text-center">
            <p className="text-sm font-bold text-main">حدث خطأ في تحميل البيانات</p>
            <p className="mt-1 text-xs text-muted">تحقق من الاتصال ثم أعد المحاولة</p>
            <button
              onClick={() => refetch()}
              className="mx-auto mt-4 block rounded-2xl bg-primary px-5 py-2.5 text-xs font-bold text-on-primary transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            >
              إعادة المحاولة
            </button>
          </div>
        ) : (
          <>
            {/* الترويسة + الإحصاءات + الفلاتر */}
            <AppointmentsHeader
              stats={stats}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              filterDay={filterDay}
              onDayChange={setFilterDay}
              filterTeacher={filterTeacher}
              onTeacherChange={setFilterTeacher}
              uniqueTeachers={uniqueTeachers}
              todayName={todayName}
              dayCounts={dayCounts}
              hasActiveFilters={hasActiveFilters}
              onReset={handleResetFilters}
            />

            <div
              className={`mt-4 grid gap-4 md:mt-5 ${showDetails ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1'}`}
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
                  hasActiveFilters={hasActiveFilters}
                  onShowWeek={() => setFilterDay('all')}
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
                <span className="whitespace-nowrap rounded-2xl border border-border bg-card px-3 py-1.5 text-xs font-bold shadow-elevation-1">
                  {action.label}
                </span>
                <button
                  onClick={() => {
                    action.onClick()
                    setFabOpen(false)
                  }}
                  aria-label={action.label}
                  className={cn(FAB_SURFACE, 'h-10 w-10 rounded-2xl')}
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
            FAB_SURFACE,
            'h-12 w-12 rounded-2xl',
            fabOpen
              ? 'rotate-45 border-error bg-error text-on-error hover:border-error-hover hover:bg-error-hover'
              : '',
          )}
        >
          <Plus size={24} />
        </motion.button>
      </div>
    </div>
  )
}
