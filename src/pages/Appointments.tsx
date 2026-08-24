import { useState, useEffect, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useCurrentUser, useShowNotification, useAcademyName } from '../context/AppContext'
import { api } from '../lib/api'
import { PageLoader } from '../components/ui/PageLoader'
import { ErrorBanner } from '../shared/components/ui/ErrorState'
import { MobileAppointments } from '../features/appointments/components/MobileAppointments'
import {
  AppointmentsFilters,
  DAYS_OF_WEEK,
  AppointmentScheduleGrid,
  AppointmentDetailPanel,
} from './appointments-page'
import { Plus, Calendar, CheckCircle, Clock, BarChart3 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../lib/utils'
import { normalizeDayName } from '../features/attendance/utils/slotUtils'

import type { Student } from '../types'

interface AppointmentEvent {
  id: string
  studentName: string
  studentGrade: string
  teacherName: string
  subject: string
  curriculum: string
  day: string
  hour: string
  period: string
  time: string
  isPM: boolean
}

const teacherNameOf = (enrollment: { teacher: unknown; teacherId?: string | number }): string => {
  const t = enrollment.teacher
  if (typeof t === 'string') return t.trim()
  if (t && typeof t === 'object' && 'name' in (t as Record<string, unknown>)) {
    return String((t as { name?: unknown }).name ?? '').trim()
  }
  return ''
}

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
  const currentUser = useCurrentUser()
  const showNotification = useShowNotification()
  const queryClient = useQueryClient()

  const [searchTerm, setSearchTerm] = useState('')
  const [filterDay, setFilterDay] = useState<string>('all')
  const [filterTeacher, setFilterTeacher] = useState<string>('all')
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentEvent | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [fabOpen, setFabOpen] = useState(false)

  const {
    data: students = [],
    isLoading: loading,
    error: queryError,
  } = useQuery<Student[]>({
    queryKey: ['appointments-students'],
    queryFn: async (): Promise<Student[]> => {
      if (currentUser?.role === 'student') {
        const me = await api.get<Student>('/student-portal/me')
        return [me]
      }
      const data = await api.get<Student[] | { data?: Student[] }>('/students')
      return Array.isArray(data) ? data : data.data || []
    },
  })

  const canComplete = currentUser?.role === 'admin' || currentUser?.role === 'teacher'

  const { data: completedSessionIds = [] } = useQuery({
    queryKey: ['completed-sessions'],
    queryFn: async () => {
      if (currentUser?.role === 'admin') {
        const settings = await api.get<{ last_appointment_reset?: string }>('/system/settings')
        const lastResetDate = settings?.last_appointment_reset
        const todayStr = new Date().toDateString()
        if (lastResetDate !== todayStr) {
          await api.delete('/appointments/completed-sessions/reset')
          await api.post('/system/settings', { key: 'last_appointment_reset', value: todayStr })
          return []
        }
      }
      const sessions = await api.get<string[]>('/appointments/completed-sessions')
      return sessions || []
    },
    refetchInterval: 15000,
    enabled: canComplete,
  })

  const completeMutation = useMutation({
    mutationFn: (id: string) => api.post('/appointments/completed-sessions', { id }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['completed-sessions'] }),
    onError: () => {
      showNotification('عذراً، حدث خطأ في تسجيل إتمام الحصة. يرجى المحاولة مرة أخرى.', 'error')
    },
  })

  const handleCompleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    completeMutation.mutate(id)
  }

  const error = queryError ? 'حدث خطأ في تحميل البيانات' : null

  const teacherToMatch = (currentUser?.teacherName || currentUser?.name || '').trim()
  const allAppointments: AppointmentEvent[] = (students || []).flatMap((student) =>
    (student.enrollments || [])
      .filter(
        (enrollment) =>
          currentUser?.role !== 'teacher' ||
          teacherNameOf(enrollment) === teacherToMatch ||
          enrollment.teacherId === currentUser.id,
      )
      .flatMap((enrollment) =>
        (enrollment.schedule || []).map((slot) => {
          const normalizedPeriod =
            slot.period === 'am' ||
            slot.period === 'صباحاً' ||
            slot.period === 'صباحا' ||
            slot.period === 'ص'
              ? 'ص'
              : 'م'
          const isPM = !(
            slot.period === 'am' ||
            slot.period === 'صباحاً' ||
            slot.period === 'صباحا' ||
            slot.period === 'ص'
          )
          const normHour = String(parseInt(String(slot.hour).trim(), 10) || '')
          const tName = teacherNameOf(enrollment)
          return {
            id: `${student.id}-${tName}-${normalizeDayName(slot.day)}-${slot.hour}-${slot.period}`,
            studentName: student.name,
            studentGrade: student.grade,
            teacherName: tName,
            subject: enrollment.subject,
            curriculum: enrollment.curr,
            day: normalizeDayName(slot.day),
            hour: normHour,
            period: slot.period,
            time: `${normHour} ${normalizedPeriod}`,
            isPM,
          }
        }),
      ),
  )

  const uniqueTeachers = Array.from(new Set(allAppointments.map((a) => a.teacherName)))

  const filteredAppointments = allAppointments.filter((appointment) => {
    const isCompleted = completedSessionIds.includes(appointment.id)
    if (isCompleted) return false
    const matchesSearch =
      appointment.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.subject.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDay = filterDay === 'all' || appointment.day === filterDay
    const matchesTeacher = filterTeacher === 'all' || appointment.teacherName === filterTeacher
    return matchesSearch && matchesDay && matchesTeacher
  })

  const appointmentsByDay = DAYS_OF_WEEK.map((day) => ({
    day,
    appointments: filteredAppointments
      .filter((a) => a.day === day)
      .sort((a, b) => {
        const timeA = Number(a.hour) + (a.isPM && Number(a.hour) !== 12 ? 12 : 0)
        const timeB = Number(b.hour) + (b.isPM && Number(b.hour) !== 12 ? 12 : 0)
        return timeA - timeB
      }),
  })).filter((dayObj) => filterDay === 'all' || dayObj.day === filterDay)

  const totalAppointments = allAppointments.length
  const todayAppointments = allAppointments.filter((a) => {
    const today = new Date().toLocaleDateString('ar-EG', { weekday: 'long' })
    return a.day === today
  }).length

  const remainingToday = allAppointments.filter((a) => {
    const today = new Date().toLocaleDateString('ar-EG', { weekday: 'long' })
    return a.day === today && !completedSessionIds.includes(a.id)
  }).length

  const completedCount = allAppointments.filter((a) => completedSessionIds.includes(a.id)).length
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

  const kpiCards = useMemo(
    () => [
      {
        label: 'إجمالي المواعيد',
        value: totalAppointments,
        icon: Calendar,
        gradient: 'from-primary/20 to-primary/5',
        iconBg: 'bg-primary/10 text-primary',
        accent: 'bg-primary',
      },
      {
        label: 'مواعيد اليوم',
        value: todayAppointments,
        icon: Clock,
        gradient: 'from-success-soft to-background dark:from-success-soft dark:to-card',
        iconBg: 'bg-white/50 text-success dark:bg-white/10',
        accent: 'bg-success',
      },
      {
        label: 'المتبقي اليوم',
        value: remainingToday,
        icon: BarChart3,
        gradient: 'from-warning-soft to-background dark:from-warning-soft dark:to-card',
        iconBg: 'bg-white/50 text-warning dark:bg-white/10',
        accent: 'bg-warning',
      },
      {
        label: 'تم الإنجاز',
        value: completedCount,
        icon: CheckCircle,
        gradient: 'from-info-soft to-background dark:from-info-soft dark:to-card',
        iconBg: 'bg-white/50 text-info dark:bg-white/10',
        accent: 'bg-info',
      },
    ],
    [totalAppointments, todayAppointments, remainingToday, completedCount],
  )

  const handleCompleteAll = () => {
    const remaining = allAppointments.filter((a) => !completedSessionIds.includes(a.id))
    if (remaining.length === 0) {
      showNotification('لا توجد مواعيد متبقية', 'info')
      return
    }
    remaining.forEach((a) => completeMutation.mutate(a.id))
    showNotification(`جاري تسجيل إتمام ${remaining.length} حصة`, 'success')
  }

  const fabActions = useMemo(
    () => [
      {
        icon: Calendar,
        label: 'مواعيد اليوم',
        onClick: () => {
          const today = new Date().toLocaleDateString('ar-EG', { weekday: 'long' })
          setFilterDay(today)
        },
      },
      ...(canComplete
        ? [{ icon: CheckCircle, label: 'إتمام الكل', onClick: handleCompleteAll }]
        : []),
    ],
    [allAppointments, completedSessionIds, completeMutation, canComplete],
  )

  if (loading) return <PageLoader />

  if (error) {
    return (
      <div className="relative min-h-full pb-24" dir="rtl">
        <div className="mx-auto hidden max-w-page px-2 md:block">
          <ErrorBanner className="mt-6 md:mt-10" />
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-full pb-24" dir="rtl">
      <div className="mx-auto hidden max-w-page px-2 md:block">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative mb-4 overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary-deep to-primary-hover p-6 md:p-8"
        >
          {particles.map((p) => (
            <motion.div
              key={p.id}
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
                  <Calendar className="text-white" size={20} />
                </div>
                <span className="text-xs font-medium text-white/70">المواعيد الدراسية</span>
              </div>
              <h1 className="mb-1 text-2xl font-bold text-on-primary md:text-3xl">المواعيد</h1>
              <p className="text-sm text-white/70">جدولة ومتابعة الحصص الأكاديمية للطلاب</p>
            </div>
            <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
              <div className="text-center">
                <p className="mb-1 text-xs text-white/60">اليوم</p>
                <p className="text-2xl font-bold text-white">{todayAppointments}</p>
              </div>
              <div className="h-10 w-px bg-white/10" />
              <div className="text-center">
                <p className="mb-1 text-xs text-white/60">المتبقي</p>
                <p className="text-2xl font-bold text-white">{remainingToday}</p>
              </div>
              <div className="h-10 w-px bg-white/10" />
              <div className="text-center">
                <p className="mb-1 text-xs text-white/60">الإجمالي</p>
                <p className="text-2xl font-bold text-white">{totalAppointments}</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
            {kpiCards.map((kpi, i) => {
              const Icon = kpi.icon
              return (
                <motion.div
                  key={kpi.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12 + i * 0.06 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  className={cn(
                    'relative overflow-hidden rounded-xl border border-border bg-gradient-to-br p-4',
                    kpi.gradient,
                  )}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div className={cn('rounded-lg p-2', kpi.iconBg)}>
                      <Icon size={16} />
                    </div>
                    <div className={cn('h-1 w-12 rounded-full', kpi.accent)} />
                  </div>
                  <p className="mb-1 text-xs text-muted">{kpi.label}</p>
                  <p className="text-2xl font-bold text-main">{kpi.value}</p>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

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

        <div className={`grid gap-4 ${showDetails ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1'}`}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className={showDetails ? 'lg:col-span-2' : ''}
            data-schedule-grid
          >
            <AppointmentScheduleGrid
              appointmentsByDay={appointmentsByDay}
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
      </div>
      <div className="block md:hidden">
        <MobileAppointments />
      </div>

      <div className="fixed bottom-6 end-6 z-50 flex flex-col items-end gap-3">
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
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-on-primary shadow-lg transition-all hover:bg-primary-hover hover:shadow-xl"
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
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-lg text-on-primary shadow-xl transition-all',
            fabOpen ? 'rotate-45 bg-error' : 'bg-primary',
          )}
        >
          <Plus size={24} />
        </motion.button>
      </div>
    </div>
  )
}
