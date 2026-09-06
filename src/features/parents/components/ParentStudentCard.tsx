import { User, BookOpen, TrendingUp, CheckCircle2, Star, Trophy, Calendar } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '../../../lib/utils'
import { GamificationCard } from '../../students/components/GamificationCard'
import { ProgressBar } from '../../../shared/components/ui'

interface ParentEnrollment {
  teacherName?: string
  sessionsTotal?: number
  sessionsUsed?: number
  subject?: string
  teacher?: string
  [key: string]: unknown
}

interface ParentStudent {
  id: string
  name: string
  grade?: string
  enrollments?: ParentEnrollment[]
  totalPoints?: number
  [key: string]: unknown
}

interface ParentPointLog {
  id?: string
  amount?: number
  action?: string
  timestamp?: string
  [key: string]: unknown
}

interface ParentStudentCardProps {
  student: ParentStudent
  viewingAchievements: ParentStudent | null
  onViewDates: (student: ParentStudent) => void
  onViewAttendance: (student: ParentStudent) => void
  onViewAchievements: (student: ParentStudent) => void
  onCloseAchievements: () => void
  pointLogs: ParentPointLog[]
}

export const ParentStudentCard = ({
  student,
  viewingAchievements,
  onViewDates,
  onViewAttendance,
  onViewAchievements,
  onCloseAchievements,
  pointLogs,
}: ParentStudentCardProps) => {
  const enrollments = (student.enrollments || []) as {
    teacherName: string
    sessionsTotal?: number
    sessionsUsed?: number
    subject?: string
    teacher?: string
  }[]
  const totalPoints = Number(student.totalPoints) || 0
  const hasAchievements = viewingAchievements?.id === student.id
  const safeBadges =
    typeof student.badges === 'string' || Array.isArray(student.badges) ? student.badges : []
  const normalizedPointLogs = pointLogs.map((log) => ({
    id: log.id ?? '',
    amount: log.amount ?? 0,
    action: log.action ?? '',
    timestamp: log.timestamp ?? '',
  }))

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-slow hover:border-primary/30 hover:shadow-elevation-1">
      <div className="relative overflow-hidden bg-primary p-4 md:p-6">
        <div className="absolute start-0 top-0 h-24 w-24 -translate-y-12 translate-x-12 rotate-45 rounded-full bg-white/10 blur-xl transition-transform group-hover:scale-110"></div>
        <div className="absolute bottom-0 end-0 h-16 w-16 -translate-x-8 translate-y-8 rounded-full bg-white/5 blur-lg"></div>
        <div className="relative z-10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/20 text-on-primary backdrop-blur-sm md:h-14 md:w-14">
              <User size={20} className="md:size-[28px]" />
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-base font-medium leading-tight text-on-primary md:text-lg">
                {(student as { name: string }).name}
              </h3>
              <p className="mt-0.5 text-micro font-medium uppercase tracking-widest text-primary md:text-micro">
                {student.grade || 'غير محدد'}
              </p>
            </div>
          </div>
          {totalPoints > 0 && (
            <div className="flex shrink-0 flex-col items-center gap-0.5 rounded-xl bg-warning px-1.5 py-1 text-on-warning">
              <Star size={12} className="fill-current md:size-[16px]" />
              <span className="text-micro font-medium">{totalPoints}</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 border-b border-border">
        <div className="flex flex-col items-center justify-center border-e border-border p-3 md:p-4">
          <div className="mb-1 flex h-8 w-8 items-center justify-center rounded-xl bg-primary-soft">
            <BookOpen size={14} className="text-primary md:size-[16px]" />
          </div>
          <span className="text-micro font-medium uppercase text-muted md:text-micro">المواد</span>
          <span className="text-base font-medium text-main md:text-lg">{enrollments.length}</span>
        </div>
        <div className="flex flex-col items-center justify-center p-3 md:p-4">
          <div className="mb-1 flex h-8 w-8 items-center justify-center rounded-xl bg-success-soft">
            <TrendingUp size={14} className="text-success md:size-[16px]" />
          </div>
          <span className="text-micro font-medium uppercase text-muted md:text-micro">
            الالتزام
          </span>
          <span className="text-base font-medium text-success md:text-lg">
            {(() => {
              if (enrollments.length === 0) return '0%'
              const total = enrollments.reduce(
                (sum: number, en) => sum + Number(en.sessionsTotal || 0),
                0,
              )
              const used = enrollments.reduce(
                (sum: number, en) => sum + Number(en.sessionsUsed || 0),
                0,
              )
              return total > 0 ? `${Math.round((used / total) * 100)}%` : '0%'
            })()}
          </span>
        </div>
      </div>

      <div className="flex-1 space-y-3 p-4 md:p-5">
        <p className="flex items-center justify-between border-b border-border pb-2 text-micro font-medium text-muted">
          تفاصيل المواد الدراسية
          <CheckCircle2 size={12} className="text-muted" />
        </p>
        <div className="space-y-3">
          {enrollments.map((en, idx: number) => {
            const sessionsTotal = Number(en.sessionsTotal || 0)
            const sessionsUsed = Number(en.sessionsUsed || 0)
            return (
              <div
                key={idx}
                className="group/item relative overflow-hidden rounded-xl border border-transparent bg-surface p-3 transition-all hover:border-primary/20"
              >
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-main">{en.subject}</h4>
                    <p className="text-micro font-normal italic text-muted">المعلم: {en.teacher}</p>
                  </div>
                  <div className="text-end">
                    <span className="text-micro font-medium text-primary">
                      حضر {en.sessionsUsed} من {en.sessionsTotal}
                    </span>
                  </div>
                </div>
                <ProgressBar
                  value={Math.min(
                    100,
                    sessionsTotal > 0 ? (sessionsUsed / sessionsTotal) * 100 : 0,
                  )}
                  variant="primary"
                />
              </div>
            )
          })}
          {enrollments.length === 0 && (
            <div className="py-6 text-center">
              <p className="text-micro font-normal italic text-muted">
                لا توجد مواد مسجلة حالياً لهذا الابن
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-auto space-y-2 p-4 pt-0 md:p-5">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onViewDates(student)}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 text-micro font-medium text-on-primary outline-none transition-all hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.98] md:gap-2 md:text-micro"
          >
            <Calendar size={13} className="md:size-[14px]" />
            حصص الطالب
          </button>
          <button
            onClick={() => onViewAttendance(student)}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-surface py-2.5 text-micro font-medium text-main outline-none transition-all hover:border-primary/30 hover:bg-surface focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.98] md:gap-2 md:text-micro"
          >
            <TrendingUp size={13} className="md:size-[14px]" />
            نسبة الحضور
          </button>
        </div>
        <button
          onClick={() => onViewAchievements(student)}
          className={cn(
            'flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-micro font-medium outline-none transition-all focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.98] md:text-micro',
            hasAchievements
              ? 'border border-primary/30 bg-surface text-primary'
              : 'bg-primary text-on-primary hover:bg-primary-hover',
          )}
        >
          <Trophy size={14} />
          {hasAchievements ? 'إغلاق سجل الإنجازات' : 'عرض حصاد الإنجازات والأوسمة'}
        </button>
      </div>

      <AnimatePresence>
        {hasAchievements && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-border bg-surface"
          >
            <div className="space-y-4 p-4 md:p-6">
              <div className="mb-2 flex items-center gap-2">
                <Trophy size={16} className="text-warning" />
                <h4 className="text-micro font-medium uppercase tracking-widest text-main">
                  حصاد إنجازات الطالب
                </h4>
              </div>
              <GamificationCard
                totalPoints={totalPoints}
                badges={safeBadges}
                pointLogs={normalizedPointLogs}
              />
              <button
                onClick={onCloseAchievements}
                className="mt-2 w-full rounded-xl bg-error py-2 text-micro font-medium text-on-error outline-none transition-all hover:bg-error-hover focus-visible:ring-2 focus-visible:ring-focus active:scale-95"
              >
                إغلاق السجل
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
