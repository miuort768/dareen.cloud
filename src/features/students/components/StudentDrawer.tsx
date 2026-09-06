import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  ChevronLeft,
  Phone,
  MessageSquare,
  Star,
  Trophy,
  BookOpen,
  Users,
  DollarSign,
  Calendar,
  Clock,
  GraduationCap,
  CheckCircle2,
  Plus,
  TrendingUp,
  Zap,
  Flame,
} from 'lucide-react'
import { cn, formatLocalDate } from '../../../lib/utils'
import { getCurrencySymbol } from '../../../config/constants'
import type { LucideIcon } from 'lucide-react'
import type { Student, ScheduleSlot } from '../types'
import type { Teacher } from '../../teachers/types'
import { EnrollmentForm } from './EnrollmentForm'
import { enrollmentTeacherName } from '../utils/enrollmentUtils'
import { normalizeCurriculum } from '../utils/curriculumUtils'

interface StudentDrawerProps {
  student: Student | null
  onClose: () => void
  onEdit?: (student: Student) => void
  sessions?: { date: string; status: string; subject: string }[]
  teachers?: Teacher[]
  isAddingProgram?: boolean
  inline?: boolean
  onAddProgram?: (data: {
    teacherId?: string
    teacher: string
    subject: string
    curr: string
    curriculum?: string
    totalSessions: number
    schedule: ScheduleSlot[]
  }) => void
}

type TabKey = 'overview' | 'programs' | 'timeline'

const avatarGradients = [
  { g: 'from-primary to-primary-hover', on: 'text-on-primary' },
  { g: 'from-success to-success-hover', on: 'text-on-success' },
  { g: 'from-info to-info-hover', on: 'text-on-info' },
  { g: 'from-warning to-warning-hover', on: 'text-on-warning' },
  { g: 'from-error to-error-hover', on: 'text-on-error' },
  { g: 'from-accent to-accent-hover', on: 'text-on-accent' },
]

const getAvatarGradient = (name: string) => {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return avatarGradients[Math.abs(hash) % avatarGradients.length]!
}

const gradeColors: Record<string, string> = {
  أول: 'text-primary bg-primary/10 ring-primary/20',
  ثاني: 'text-success bg-success-soft ring-success-soft',
  ثالث: 'text-info bg-info-soft ring-info-soft',
  رابع: 'text-warning bg-warning-soft ring-warning-soft',
  خامس: 'text-accent bg-accent-soft ring-accent-soft',
  سادس: 'text-error bg-error-soft ring-error-soft',
}

const getGradeStyle = (grade?: string) => {
  if (!grade) return 'text-info bg-info-soft ring-info-soft'
  const key = Object.keys(gradeColors).find((k) => grade.includes(k))
  return key ? gradeColors[key] : 'text-info bg-info-soft ring-info-soft'
}

const getNextLevel = (xp: number) => {
  if (xp < 500)
    return { current: 0, next: 500, label: 'مبتدئ', nextLabel: 'متقدم', progress: (xp / 500) * 100 }
  if (xp < 1500)
    return {
      current: 500,
      next: 1500,
      label: 'متقدم',
      nextLabel: 'خبير',
      progress: ((xp - 500) / 1000) * 100,
    }
  if (xp < 3000)
    return {
      current: 1500,
      next: 3000,
      label: 'خبير',
      nextLabel: 'عبقري',
      progress: ((xp - 1500) / 1500) * 100,
    }
  if (xp < 5000)
    return {
      current: 3000,
      next: 5000,
      label: 'عبقري',
      nextLabel: 'أسطوري',
      progress: ((xp - 3000) / 2000) * 100,
    }
  return { current: 5000, next: 5000, label: 'أسطوري', nextLabel: null, progress: 100 }
}

const tabs: { key: TabKey; label: string; icon: LucideIcon }[] = [
  { key: 'overview', label: 'نظرة عامة', icon: Trophy },
  { key: 'programs', label: 'البرامج', icon: BookOpen },
  { key: 'timeline', label: 'النشاطات', icon: Clock },
]

export const StudentDrawer = ({
  student,
  onClose,
  sessions = [],
  teachers = [],
  isAddingProgram = false,
  inline = false,
  onAddProgram,
}: StudentDrawerProps) => {
  const [activeTab, setActiveTab] = useState<TabKey>('overview')
  const [showAddProgram, setShowAddProgram] = useState(false)

  const streakDays = useMemo(() => {
    if (!student) return 0
    let streak = 0
    const d = new Date()
    for (let i = 0; i < 30; i++) {
      const dateStr = formatLocalDate(d)
      if (sessions.some((s) => s.date === dateStr && s.status === 'completed')) {
        streak++
      } else if (i > 0) break
      d.setDate(d.getDate() - 1)
    }
    return streak
  }, [student, sessions])

  if (!student) return null

  const gradient = getAvatarGradient(student.name)
  const points = student.totalPoints || 0
  const gradeStyle = getGradeStyle(student.grade)
  const level = getNextLevel(points)
  const enrollments = student.enrollments || []
  const totalSessionsUsed = enrollments.reduce((acc, en) => acc + (en.sessionsUsed || 0), 0)

  const completedSessions = sessions.filter((s) => s.status === 'completed').length
  const totalSess = sessions.length
  const overallAttendance = totalSess > 0 ? Math.round((completedSessions / totalSess) * 100) : 0

  const today = formatLocalDate(new Date())
  const todaySessions = sessions.filter((s) => s.date === today)

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={cn(
          inline
            ? 'relative overflow-hidden rounded-2xl border border-border shadow-elevation-1'
            : 'fixed inset-0 z-[300] bg-black/40 backdrop-blur-sm',
        )}
        onClick={inline ? undefined : onClose}
      >
        <motion.div
          initial={inline ? { opacity: 0, y: 10 } : { x: '100%' }}
          animate={inline ? { opacity: 1, y: 0 } : { x: 0 }}
          exit={inline ? { opacity: 0, y: 10 } : { x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 250 }}
          onClick={(e) => e.stopPropagation()}
          className={cn(
            inline
              ? 'max-h-[80vh] w-full overflow-y-auto bg-card'
              : 'absolute bottom-0 end-0 top-0 w-full max-w-lg overflow-y-auto border-s border-border bg-card shadow-elevation-3',
          )}
          dir="rtl"
        >
          {/* Header */}
          <div className="sticky top-0 z-20 bg-gradient-to-l from-primary to-primary-deep">
            <div className="flex items-center justify-between p-4">
              <button
                onClick={onClose}
                className="flex h-10 items-center gap-1 rounded-lg bg-white/15 px-3 text-xs font-bold text-on-primary transition-colors hover:bg-white/25 md:h-8"
                aria-label="رجوع"
              >
                <ChevronLeft size={14} />
                رجوع
              </button>
              <span className="text-xs font-bold text-on-primary">بيانات الطالب</span>
              <div className="w-8" />
            </div>
          </div>

          {/* Profile */}
          <div className="border-b border-border bg-surface p-5">
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  'flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br shadow-elevation-2',
                  gradient.g,
                )}
              >
                <span className={cn('text-xl font-bold', gradient.on)}>
                  {student.name?.charAt(0) || 'ط'}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="truncate text-base font-bold text-main">{student.name}</h2>
                  {streakDays >= 3 && (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-warning-soft px-1.5 py-0.5 text-[9px] font-bold text-warning">
                      <Flame size={9} /> {streakDays}
                    </span>
                  )}
                </div>
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[10px] font-bold ring-1',
                      gradeStyle,
                    )}
                  >
                    <GraduationCap size={10} />
                    {student.grade}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-lg bg-warning-soft px-2 py-0.5 text-[10px] font-bold text-warning">
                    <Star size={10} />
                    {points.toLocaleString()} XP
                  </span>
                  {student.enrollments && student.enrollments.length > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-lg bg-info-soft px-2 py-0.5 text-[10px] font-bold text-info">
                      <BookOpen size={10} />
                      {student.enrollments.length} برامج
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="sticky top-[57px] z-10 border-b border-border bg-card">
            <div className="flex">
              {tabs.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.key
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={cn(
                      'relative flex flex-1 items-center justify-center gap-1.5 py-3 text-[10px] font-bold transition-all',
                      isActive ? 'text-primary' : 'text-muted hover:text-main',
                    )}
                  >
                    <Icon size={13} />
                    {tab.label}
                    {isActive && (
                      <motion.div
                        layoutId="tab-underline"
                        className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-primary"
                      />
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Tab Content */}
          <div className="space-y-4 p-4">
            {activeTab === 'overview' && (
              <>
                {/* Duolingo-style XP Bar */}
                <div className="rounded-2xl border border-border bg-surface p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-warning to-warning-hover shadow-elevation-1">
                        <Trophy size={16} className="text-on-warning" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-main">{level.label}</p>
                        <p className="text-[9px] text-muted">المستوى الحالي</p>
                      </div>
                    </div>
                    <div className="text-end">
                      <p className="text-base font-bold tabular-nums text-warning">
                        {points.toLocaleString()}
                      </p>
                      <p className="text-[9px] text-muted">إجمالي XP</p>
                    </div>
                  </div>

                  {level.nextLabel && (
                    <div className="space-y-1.5">
                      <div className="h-2.5 overflow-hidden rounded-full bg-border">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${level.progress}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                          className="h-full rounded-full bg-gradient-to-l from-warning via-warning-hover to-warning"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Zap size={10} className="text-warning" />
                          <span className="text-[9px] text-muted">
                            {level.next - points} XP للمستوى التالي
                          </span>
                        </div>
                        <span className="text-[9px] font-bold tabular-nums text-warning">
                          {Math.round(level.progress)}%
                        </span>
                      </div>
                    </div>
                  )}

                  {streakDays > 0 && (
                    <div className="mt-3 flex items-center gap-2 border-t border-border pt-3">
                      <div className="flex items-center gap-1.5 rounded-xl bg-warning-soft px-2.5 py-1.5">
                        <Flame size={14} className="text-warning" />
                        <span className="text-[10px] font-bold text-warning">{streakDays} يوم</span>
                      </div>
                      <span className="text-[9px] text-muted">
                        سلسلة متصلة <Flame size={9} className="inline text-warning" />
                      </span>
                    </div>
                  )}
                </div>

                {/* Quick Stats Cards */}
                <div className="grid grid-cols-2 gap-2">
                  {[
                    {
                      icon: BookOpen,
                      value: totalSessionsUsed,
                      label: 'الحصص المنفذة',
                      tone: 'bg-success-soft',
                      text: 'text-success',
                    },
                    {
                      icon: TrendingUp,
                      value: `${overallAttendance}%`,
                      label: 'نسبة الحضور',
                      tone: 'bg-info-soft',
                      text: 'text-info',
                    },
                    {
                      icon: Users,
                      value: enrollments.length,
                      label: 'البرامج النشطة',
                      tone: 'bg-primary-soft',
                      text: 'text-primary',
                    },
                    {
                      icon: DollarSign,
                      value: `${student.sessionPrice?.toLocaleString() || 0} ${getCurrencySymbol(student.currency)}`,
                      label: 'سعر الحصة',
                      tone: 'bg-warning-soft',
                      text: 'text-warning',
                    },
                  ].map((item, i) => {
                    const Icon = item.icon
                    return (
                      <div key={i} className="rounded-xl border border-border bg-card p-3">
                        <span
                          className={cn(
                            'mb-1.5 flex h-8 w-8 items-center justify-center rounded-lg',
                            item.tone,
                            item.text,
                          )}
                        >
                          <Icon size={14} />
                        </span>
                        <p className="truncate text-sm font-black tabular-nums text-main">
                          {item.value}
                        </p>
                        <p className="mt-0.5 text-[10px] font-bold text-muted">{item.label}</p>
                      </div>
                    )
                  })}
                </div>

                {/* Today's Sessions */}
                {todaySessions.length > 0 && (
                  <div className="rounded-2xl border border-border bg-surface p-4">
                    <h3 className="mb-3 flex items-center gap-1.5 text-[11px] font-bold text-muted">
                      <Calendar size={12} />
                      حصص اليوم
                    </h3>
                    <div className="space-y-2">
                      {todaySessions.slice(0, 3).map((s, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2.5 rounded-xl border border-border bg-card p-2"
                        >
                          <div
                            className={cn(
                              'h-2 w-2 shrink-0 rounded-full',
                              s.status === 'completed' ? 'bg-success' : 'bg-warning',
                            )}
                          />
                          <span className="flex-1 text-[10px] font-bold text-main">
                            {s.subject}
                          </span>
                          <span
                            className={cn(
                              'text-[9px] font-bold',
                              s.status === 'completed' ? 'text-success' : 'text-warning',
                            )}
                          >
                            {s.status === 'completed' ? 'تمت' : 'مجدولة'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Contact & Account */}
                <div className="rounded-2xl border border-border bg-surface p-4">
                  <h3 className="mb-3 text-[11px] font-bold text-muted">معلومات التواصل</h3>
                  <div className="space-y-2">
                    {student.parentPhone && (
                      <div className="flex items-center justify-between rounded-xl border border-border bg-card p-2.5">
                        <span className="text-[10px] text-muted">هاتف ولي الأمر</span>
                        <span className="font-mono text-[10px] font-bold text-main" dir="ltr">
                          {student.parentPhone}
                        </span>
                      </div>
                    )}
                    {student.studentPhone && (
                      <div className="flex items-center justify-between rounded-xl border border-border bg-card p-2.5">
                        <span className="text-[10px] text-muted">هاتف الطالب</span>
                        <span className="font-mono text-[10px] font-bold text-main" dir="ltr">
                          {student.studentPhone}
                        </span>
                      </div>
                    )}
                    {student.curriculum && (
                      <div className="flex items-center justify-between rounded-xl border border-border bg-card p-2.5">
                        <span className="text-[10px] text-muted">المنهج</span>
                        <span className="text-[10px] font-bold text-main">
                          {normalizeCurriculum(student.curriculum)}
                        </span>
                      </div>
                    )}
                    {student.username && (
                      <div className="flex items-center justify-between rounded-xl border border-border bg-card p-2.5">
                        <span className="text-[10px] text-muted">اسم المستخدم</span>
                        <span className="font-mono text-[10px] font-bold text-info">
                          @{student.username}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={`tel:${student.parentPhone}`}
                    className="flex items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-[11px] font-bold text-on-primary outline-none transition-all hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.98]"
                  >
                    <Phone size={13} /> اتصال
                  </a>
                  <a
                    href={`https://wa.me/${student.parentPhone?.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 rounded-xl bg-success py-2.5 text-[11px] font-bold text-on-success outline-none transition-all hover:bg-success-hover focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.98]"
                  >
                    <MessageSquare size={13} /> واتساب
                  </a>
                </div>
              </>
            )}

            {activeTab === 'programs' && (
              <div className="space-y-3">
                {enrollments.length === 0 ? (
                  <div className="py-12 text-center text-muted">
                    <BookOpen size={36} className="mx-auto mb-2 opacity-30" />
                    <p className="text-xs font-bold text-muted">لا توجد برامج</p>
                    <p className="text-xs text-muted">لم يتم إضافة أي برامج لهذا الطالب</p>
                  </div>
                ) : (
                  enrollments.map((en, i) => {
                    const used = en.sessionsUsed || 0
                    const total = en.sessionsTotal || 0
                    const remaining = total - used
                    const isLow = remaining <= 2
                    const progress = total > 0 ? Math.round((used / total) * 100) : 0
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="rounded-2xl border border-border bg-card p-3 shadow-elevation-1 transition-all hover:shadow-elevation-2"
                      >
                        <div className="mb-2.5 flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-soft text-primary ring-1 ring-primary/20">
                              <BookOpen size={14} />
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-main">{en.subject}</h4>
                              <p className="text-[9px] text-muted">
                                {enrollmentTeacherName(en) || '—'}
                              </p>
                              {en.curriculum ? (
                                <span className="mt-1 inline-flex items-center gap-0.5 rounded bg-primary-soft px-1.5 py-0.5 text-[9px] font-bold text-primary ring-1 ring-primary/20">
                                  <BookOpen size={8} /> {normalizeCurriculum(en.curriculum)}
                                </span>
                              ) : null}
                            </div>
                          </div>
                          {isLow && (
                            <span className="animate-pulse rounded-lg bg-error-soft px-2 py-0.5 text-[9px] font-bold text-error ring-1 ring-error-soft">
                              رصيد منخفض
                            </span>
                          )}
                        </div>

                        {/* Session Grid */}
                        <div className="mb-2.5 flex flex-wrap gap-1">
                          {[...Array(Math.min(total, 24))].map((_, idx) => (
                            <div
                              key={idx}
                              className={cn(
                                'h-3 w-3 rounded transition-all',
                                idx < used
                                  ? 'bg-success'
                                  : idx === used
                                    ? 'bg-warning ring-1 ring-warning'
                                    : 'bg-border',
                              )}
                            />
                          ))}
                          {total > 24 && (
                            <span className="self-center text-[9px] text-muted">+{total - 24}</span>
                          )}
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <div className="flex-1">
                            <div className="h-1.5 overflow-hidden rounded-full bg-surface ring-1 ring-border">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.6, delay: i * 0.08 }}
                                className={`h-full rounded-full ${isLow ? 'bg-gradient-to-l from-error to-error-hover' : 'bg-gradient-to-l from-primary to-primary-light'}`}
                              />
                            </div>
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            <span className="text-[9px] text-muted">
                              {used}/{total}
                            </span>
                            <span
                              className={cn(
                                'text-[10px] font-bold tabular-nums',
                                isLow ? 'text-error' : 'text-success',
                              )}
                            >
                              {remaining} رصيد
                            </span>
                          </div>
                        </div>

                        {/* Extra program stats */}
                        <div className="mt-2.5 grid grid-cols-3 gap-1.5 border-t border-border pt-2.5">
                          <div className="text-center">
                            <p className="text-[10px] font-black tabular-nums text-success">
                              {used}
                            </p>
                            <p className="text-[9px] font-bold text-muted">حصة منفذة</p>
                          </div>
                          <div className="text-center">
                            <p
                              className={cn(
                                'text-[10px] font-black tabular-nums',
                                isLow ? 'text-error' : 'text-warning',
                              )}
                            >
                              {remaining}
                            </p>
                            <p className="text-[9px] font-bold text-muted">حصة متبقية</p>
                          </div>
                          <div className="text-center">
                            <p className="text-[10px] font-black text-info">
                              {getCurrencySymbol(en.curr)}
                            </p>
                            <p className="text-[9px] font-bold text-muted">العملة</p>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })
                )}

                {/* Add Program CTA */}
                {showAddProgram ? (
                  <div className="rounded-2xl border border-border bg-surface p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-[11px] font-bold text-main">إضافة برنامج جديد</p>
                      <button
                        onClick={() => setShowAddProgram(false)}
                        className="text-[10px] font-bold text-muted transition-colors hover:text-main"
                        aria-label="إغلاق نموذج إضافة برنامج"
                      >
                        إلغاء
                      </button>
                    </div>
                    <EnrollmentForm
                      teachers={teachers}
                      onSubmit={(data) => onAddProgram?.(data)}
                      isLoading={isAddingProgram}
                      defaultCurrency={student.currency}
                    />
                  </div>
                ) : (
                  <button
                    onClick={() => setShowAddProgram(true)}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border py-3 text-[10px] font-bold text-muted transition-all hover:border-primary hover:text-primary"
                  >
                    <Plus size={13} /> إضافة برنامج جديد
                  </button>
                )}
              </div>
            )}

            {activeTab === 'timeline' && (
              <div className="space-y-1">
                {sessions.length === 0 ? (
                  <div className="py-12 text-center text-muted">
                    <Clock size={36} className="mx-auto mb-2 opacity-30" />
                    <p className="text-xs font-bold text-muted">لا توجد نشاطات</p>
                    <p className="text-xs text-muted">سيظهر هنا سجل الحصص والمدفوعات</p>
                  </div>
                ) : (
                  <div className="relative">
                    {sessions.slice(0, 20).map((s, idx) => {
                      const isCompleted = s.status === 'completed'
                      const isCancelled = s.status === 'cancelled'
                      const isLast = idx === Math.min(sessions.length - 1, 19)
                      return (
                        <div key={idx} className="flex gap-3 pb-4 last:pb-0">
                          <div className="flex flex-col items-center">
                            <div
                              className={cn(
                                'z-10 flex h-8 w-8 items-center justify-center rounded-xl ring-2 ring-card',
                                isCompleted
                                  ? 'bg-success-soft text-success'
                                  : isCancelled
                                    ? 'bg-error-soft text-error'
                                    : 'bg-warning-soft text-warning',
                              )}
                            >
                              {isCompleted ? (
                                <CheckCircle2 size={13} />
                              ) : isCancelled ? (
                                <X size={13} />
                              ) : (
                                <Calendar size={13} />
                              )}
                            </div>
                            {!isLast && (
                              <div
                                className={cn(
                                  'min-h-2 w-px flex-1',
                                  isCompleted ? 'bg-success-soft' : 'bg-border',
                                )}
                              />
                            )}
                          </div>
                          <div className="min-w-0 flex-1 pt-0.5">
                            <div className="flex items-center gap-2">
                              <p className="text-[11px] font-bold text-main">{s.subject}</p>
                              <span
                                className={cn(
                                  'text-[9px] font-bold',
                                  isCompleted
                                    ? 'text-success'
                                    : isCancelled
                                      ? 'text-error'
                                      : 'text-warning',
                                )}
                              >
                                {isCompleted ? 'حضر' : isCancelled ? 'غائب' : 'مجدول'}
                              </span>
                            </div>
                            <p className="mt-0.5 text-[9px] text-muted">{s.date}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
