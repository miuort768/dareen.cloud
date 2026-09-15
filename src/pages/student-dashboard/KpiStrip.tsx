import { CheckCircle2, CalendarCheck, BookOpen, CalendarRange } from 'lucide-react'
import { StatCard } from '../../shared/components/ui'
import type { StudentStats } from './types'

interface KpiStripProps {
  stats: StudentStats
}

/** شريط مؤشرات مشبع تحت الـ hero — نسبة الحضور / حصص منفذة / تقدم المنهج / إجمالي الحصص */
export const KpiStrip = ({ stats }: KpiStripProps) => (
  <section aria-label="مؤشرات سريعة" className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:gap-4">
    <StatCard
      icon={CheckCircle2}
      variant="success"
      title="نسبة الحضور"
      value={stats.attendanceRate}
      unit="%"
      subtitle={`حاضر ${stats.attendance} · غياب ${stats.absence}`}
    />
    <StatCard
      icon={CalendarCheck}
      variant="primary"
      title="حصص منفذة"
      value={stats.sessionsUsed}
      unit={`من ${stats.sessionsTotal}`}
      subtitle="من إجمالي حصصك"
    />
    <StatCard
      icon={BookOpen}
      variant="info"
      title="تقدم المنهج"
      value={stats.curriculumProgress}
      unit="%"
      subtitle="مكتمل من خطتك"
    />
    <StatCard
      icon={CalendarRange}
      variant="warning"
      title="إجمالي الحصص"
      value={stats.sessionsTotal}
      subtitle="في برنامجك الدراسي"
    />
  </section>
)
