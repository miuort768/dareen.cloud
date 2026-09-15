import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import {
  GraduationCap,
  BookOpen,
  ClipboardList,
  UserRound,
  Users,
  HeartHandshake,
} from 'lucide-react'
import { CountUp } from '../../shared/components/CountUp'

export interface GreetingStripProps {
  name: string
  childCount: number
  subjectCount: number
  todayCount: number
  attendanceRate: number
  eldestChildName?: string | null
  eldestChildGrade?: string | null
}

const getGreeting = (): string => {
  const h = new Date().getHours()
  if (h < 5) return 'ليلة هادئة'
  if (h < 12) return 'صباح الخير'
  if (h < 17) return 'يوم سعيد'
  return 'مساء الخير'
}

/** هيرو ترحيبي ناعم لهوية ولي الأمر البرتقالية — تاريخ + ترحيب + حلقة الحضور + رقائق البيانات */
export const GreetingStrip = ({
  name,
  childCount,
  subjectCount,
  todayCount,
  attendanceRate,
  eldestChildName,
  eldestChildGrade,
}: GreetingStripProps) => {
  const firstName = (name || 'ولي الأمر').split(' ')[0] || 'ولي الأمر'
  const today = format(new Date(), 'eeee، d MMMM yyyy', { locale: ar })
  const RING_SIZE = 56
  const RING_RADIUS = 24
  const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS
  const clampedRate = Math.min(Math.max(attendanceRate, 0), 100)

  return (
    <section
      aria-label="ترحيب"
      className="relative overflow-hidden rounded-2xl border border-primary/20 bg-card shadow-elevation-1"
    >
      {/* خلفية برتقالية ناعمة + هالات زخرفية */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary-light via-primary-soft to-transparent"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -end-14 -top-20 h-56 w-56 rounded-full border border-primary/10"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -end-4 -top-8 h-28 w-28 rounded-full border border-primary/10 bg-primary/5"
        aria-hidden="true"
      />

      <div className="relative z-10 p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-xs font-bold text-muted">
              <UserRound size={13} className="text-primary" />
              <span className="font-dash">{today}</span>
            </p>

            <h1 className="mt-3 text-xl font-black leading-tight text-main md:text-2xl">
              {getGreeting()}، {firstName}
            </h1>

            {eldestChildName ? (
              <p className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] font-bold text-muted">
                <GraduationCap size={12} className="text-primary" />
                متابعة رحلة {eldestChildName.split(' ')[0]}
                {eldestChildGrade ? ` — ${eldestChildGrade}` : ''}
              </p>
            ) : (
              <p className="mt-1 text-[11px] font-bold text-muted">نبض يومي لمتابعة أبنائك</p>
            )}
          </div>

          {/* حلقة الحضور الإجمالية */}
          <div
            className="relative flex shrink-0 items-center justify-center"
            aria-label={`نسبة الحضور الإجمالية ${attendanceRate} بالمئة`}
          >
            <svg width={RING_SIZE} height={RING_SIZE} viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}>
              <circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RING_RADIUS}
                fill="none"
                stroke="currentColor"
                className="text-primary/15"
                strokeWidth={5}
              />
              <motion.circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RING_RADIUS}
                fill="none"
                stroke="currentColor"
                className="text-primary"
                strokeWidth={5}
                strokeLinecap="round"
                strokeDasharray={RING_CIRCUMFERENCE}
                initial={{ strokeDashoffset: RING_CIRCUMFERENCE }}
                animate={{ strokeDashoffset: RING_CIRCUMFERENCE * (1 - clampedRate / 100) }}
                transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
                transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
              />
            </svg>
            <span className="absolute flex items-baseline gap-0.5">
              <CountUp
                value={attendanceRate}
                format={(n) => `${n}`}
                className="text-sm font-black tabular-nums text-primary"
              />
              <span className="text-[9px] font-black text-primary">%</span>
            </span>
          </div>
        </div>

        <p className="mt-2 max-w-xl text-xs font-bold leading-relaxed text-muted sm:text-sm">
          متابعتك اليومية تصنع الفرق .. وأبناؤك في أيدٍ أمينة
        </p>

        {/* رقائق البيانات */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-2.5 py-1 text-[10px] font-black text-on-primary shadow-elevation-1">
            <Users size={11} />
            {childCount === 1 ? 'ابن واحد' : `${childCount} أبناء`}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-2.5 py-1 text-[10px] font-black text-primary">
            <BookOpen size={11} />
            {subjectCount} {subjectCount === 1 ? 'مادة' : 'مواد'}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-2.5 py-1 text-[10px] font-black text-primary">
            <ClipboardList size={11} />
            {todayCount > 0 ? `${todayCount} حصص اليوم` : 'لا حصص اليوم'}
          </span>
        </div>

        {/* أيقونة تعريفية بمقومات المرافقة */}
        <div className="mt-4 flex items-end justify-between gap-3" aria-hidden="true">
          <div className="flex items-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-on-primary shadow-elevation-2">
              <HeartHandshake size={20} />
            </span>
            <div className="-ms-2 space-y-1.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-border bg-card text-info shadow-elevation-1">
                <UserRound size={13} />
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-border bg-card text-success-strong shadow-elevation-1">
                <GraduationCap size={13} />
              </span>
            </div>
          </div>

          <span className="mb-1 hidden items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-[10px] font-bold text-muted shadow-elevation-1 sm:inline-flex">
            <BookOpen size={10} className="text-primary" />
            شراكة مدرسية لمستقبل أبنائك
          </span>
        </div>
      </div>
    </section>
  )
}
