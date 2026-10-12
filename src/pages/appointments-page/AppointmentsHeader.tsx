import { motion } from 'framer-motion'
import { Calendar, CalendarClock, Hourglass, Layers, CheckCircle2 } from 'lucide-react'
import { PageHeader, StatCard } from '../../shared/components/ui'
import type { StatCardProps } from '../../shared/components/ui'
import { AppointmentsFilters } from './AppointmentsFilters'

interface AppointmentsHeaderProps {
  stats: { total: number; today: number; remainingToday: number; completed: number }
  searchTerm: string
  onSearchChange: (v: string) => void
  filterDay: string
  onDayChange: (v: string) => void
  filterTeacher: string
  onTeacherChange: (v: string) => void
  uniqueTeachers: string[]
  todayName: string
  dayCounts: Record<string, number>
  hasActiveFilters: boolean
  onReset: () => void
}

interface AppointmentsStat {
  title: string
  value: number
  icon: StatCardProps['icon']
  variant: NonNullable<StatCardProps['variant']>
}

/**
 * ترويسة صفحة المواعيد — بنفس لغة صفحات أولياء الأمور/المهام:
 * `PageHeader` مع فلتر داخلي (بحث + يوم + معلمة) + شبكة بطاقات إحصائية ملونة.
 */
export const AppointmentsHeader = ({
  stats,
  searchTerm,
  onSearchChange,
  filterDay,
  onDayChange,
  filterTeacher,
  onTeacherChange,
  uniqueTeachers,
  todayName,
  dayCounts,
  hasActiveFilters,
  onReset,
}: AppointmentsHeaderProps) => {
  const cards: AppointmentsStat[] = [
    { title: 'إجمالي المواعيد', value: stats.total, icon: Layers, variant: 'primary' },
    { title: 'مواعيد اليوم', value: stats.today, icon: CalendarClock, variant: 'info' },
    { title: 'المتبقي اليوم', value: stats.remainingToday, icon: Hourglass, variant: 'warning' },
    { title: 'المكتملة', value: stats.completed, icon: CheckCircle2, variant: 'success' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-4 md:space-y-5"
    >
      <PageHeader
        title="المواعيد"
        subtitle="جدولة ومتابعة الحصص الأكاديمية للطلاب"
        icon={<Calendar size={24} />}
        meta={
          <>
            <span className="inline-flex items-center rounded-lg border border-border bg-surface px-2 py-0.5 text-micro font-bold tabular-nums text-muted">
              {stats.total} موعد
            </span>
            <span className="inline-flex items-center rounded-lg bg-success px-2 py-0.5 text-micro font-bold tabular-nums text-on-success">
              {stats.completed} مكتملة
            </span>
          </>
        }
        toolbar={
          <AppointmentsFilters
            searchTerm={searchTerm}
            onSearchChange={onSearchChange}
            filterDay={filterDay}
            onDayChange={onDayChange}
            filterTeacher={filterTeacher}
            onTeacherChange={onTeacherChange}
            uniqueTeachers={uniqueTeachers}
            todayName={todayName}
            dayCounts={dayCounts}
            hasActiveFilters={hasActiveFilters}
            onReset={onReset}
          />
        }
      />

      {/* شبكة البطاقات الإحصائية الملونة */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 * i, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <StatCard
              title={card.title}
              value={card.value}
              icon={card.icon}
              variant={card.variant}
              className="h-full"
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

AppointmentsHeader.displayName = 'AppointmentsHeader'
