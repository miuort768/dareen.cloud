import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Phone,
  MessageCircle,
  Edit,
  Trash2,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  TrendingUp,
  Clock,
  AlertCircle,
  Star,
  AlertTriangle,
  KeyRound,
} from 'lucide-react'
import { cn } from '../../../lib/utils'
import { ProgressBar } from '../../../shared/components/ui'
import type { Parent, Student } from '../../../types'
import type { FamilyScheduleItem } from '../types'

interface ParentDrawerProps {
  parent: Parent | null
  details: {
    children: Student[]
    familySchedule: FamilyScheduleItem[]
    totalEnrollments: number
    totalSessions: number
    completedSessions: number
    completionRate: number
  } | null
  onClose: () => void
  onEdit?: (parent: Parent) => void
  onDelete?: (id: string) => void
  onWhatsApp?: (phone: string) => void
  onCall?: (phone: string) => void
  inline?: boolean
}

type TabKey = 'overview' | 'schedule'

const StatCell = ({
  icon: Icon,
  value,
  label,
  color,
}: {
  icon: typeof Users
  value: React.ReactNode
  label: string
  color: string
}) => (
  <div className="rounded-xl border border-border bg-card p-3">
    <div className={cn('mb-2 flex h-7 w-7 items-center justify-center rounded-lg', color)}>
      <Icon size={12} />
    </div>
    <p className="text-sm font-bold tabular-nums text-main">{value}</p>
    <p className="mt-0.5 text-[9px] text-muted">{label}</p>
  </div>
)

const OverviewTab = ({
  parent,
  details,
  children,
  handleCall,
  handleWhatsApp,
  onEdit,
  onDelete,
}: {
  parent: Parent
  details: ParentDrawerProps['details']
  children: Student[]
  handleCall: () => void
  handleWhatsApp: () => void
  onEdit?: (parent: Parent) => void
  onDelete?: (id: string) => void
}) => (
  <>
    {/* Contact */}
    <div className="space-y-2">
      <h5 className="flex items-center gap-1.5 text-[9px] font-bold text-muted">
        <Star size={10} /> بيانات التواصل
      </h5>
      <div className="grid grid-cols-1 gap-1.5">
        <div className="flex items-center gap-2.5 rounded-xl border border-success-soft bg-success-soft px-3 py-2.5">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-success-soft">
            <Phone size={11} className="text-success" />
          </div>
          <div>
            <p className="text-[9px] text-muted">الهاتف</p>
            <p className="font-mono text-[11px] font-bold text-main" dir="ltr">
              {parent.phone}
            </p>
          </div>
        </div>
        {parent.phone2 && (
          <div className="flex items-center gap-2.5 rounded-xl border border-info-soft bg-info-soft px-3 py-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-info-soft">
              <Phone size={11} className="text-info" />
            </div>
            <div>
              <p className="text-[9px] text-muted">هاتف إضافي</p>
              <p className="font-mono text-[11px] font-bold text-main" dir="ltr">
                {parent.phone2}
              </p>
            </div>
          </div>
        )}
        {parent.username && (
          <div className="flex items-center gap-2.5 rounded-xl border border-primary-soft bg-primary-soft px-3 py-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary-soft">
              <KeyRound size={11} className="text-primary" />
            </div>
            <div>
              <p className="text-[9px] text-muted">اسم المستخدم</p>
              <p className="font-mono text-[11px] font-bold text-main" dir="ltr">
                {parent.username}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>

    {/* Quick Stats */}
    <div className="grid grid-cols-2 gap-2">
      <StatCell
        icon={Users}
        value={children.length}
        label="الأبناء"
        color="text-primary bg-primary-soft"
      />
      <StatCell
        icon={BookOpen}
        value={details?.totalEnrollments || 0}
        label="الاشتراكات"
        color="text-info bg-info-soft"
      />
      <StatCell
        icon={Calendar}
        value={`${details?.completedSessions || 0}/${details?.totalSessions || 0}`}
        label="الحصص"
        color="text-success bg-success-soft"
      />
      <StatCell
        icon={TrendingUp}
        value={`${details?.completionRate || 0}%`}
        label="الإنجاز"
        color="text-warning bg-warning-soft"
      />
    </div>

    {/* Children */}
    <div className="space-y-2">
      <h5 className="flex items-center gap-1.5 text-[9px] font-bold text-muted">
        <GraduationCap size={10} />
        الأبناء المسجلين
        <span className="rounded bg-primary-soft px-1.5 py-0.5 text-[9px] font-bold text-primary">
          {children.length}
        </span>
      </h5>
      <div className="space-y-2">
        {children.length > 0 ? (
          children.map((child) => {
            const total = (child.enrollments || []).reduce((s, en) => s + en.sessionsTotal, 0)
            const used = (child.enrollments || []).reduce((s, en) => s + en.sessionsUsed, 0)
            const progress = total > 0 ? Math.round((used / total) * 100) : 0
            return (
              <div
                key={child.id}
                className="rounded-xl border border-border bg-card p-3 transition-all hover:border-primary/20"
              >
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-[10px] font-bold text-primary">
                      {(child.name || '?').charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-[11px] font-bold text-main">{child.name}</p>
                      <p className="text-[9px] text-muted">{child.grade || '—'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {(child.enrollments || []).some(
                      (en) => en.sessionsTotal - en.sessionsUsed <= 2,
                    ) && <AlertCircle size={10} className="text-error" />}
                    <span className="text-[9px] font-bold text-muted">
                      {used}/{total}
                    </span>
                  </div>
                </div>
                {total > 0 && (
                  <ProgressBar
                    value={progress}
                    variant={progress >= 75 ? 'success' : progress >= 50 ? 'warning' : 'error'}
                    className="h-1.5"
                  />
                )}
                {(child.enrollments || []).length > 0 && (
                  <div className="mt-2 space-y-1">
                    {(child.enrollments || []).slice(0, 2).map((en, i) => (
                      <div key={i} className="flex items-center justify-between px-1 text-[9px]">
                        <span className="flex items-center gap-1 text-muted">
                          <BookOpen size={8} />
                          {en.subject}
                        </span>
                        <span className="font-bold text-main">
                          {en.sessionsUsed}/{en.sessionsTotal} حصة
                        </span>
                      </div>
                    ))}
                    {(child.enrollments || []).length > 2 && (
                      <p className="px-1 text-[8px] text-muted">
                        +{(child.enrollments || []).length - 2} مواد
                      </p>
                    )}
                  </div>
                )}
              </div>
            )
          })
        ) : (
          <div className="rounded-xl border border-dashed border-border py-8 text-center">
            <Users size={28} className="mx-auto mb-2 text-muted" />
            <p className="text-[10px] text-muted">لا يوجد أبناء مرتبطين</p>
          </div>
        )}
      </div>
    </div>

    {/* Actions */}
    <div className="grid grid-cols-2 gap-2 pt-2">
      <button
        onClick={handleCall}
        className="flex items-center justify-center gap-2 rounded-xl bg-success py-2.5 text-[10px] font-bold text-on-success outline-none transition-all hover:bg-success-hover focus-visible:ring-2 focus-visible:ring-focus active:scale-95 dark:bg-success dark:text-on-success dark:hover:bg-success-hover"
      >
        <Phone size={12} /> اتصال
      </button>
      <button
        onClick={handleWhatsApp}
        className="flex items-center justify-center gap-2 rounded-xl bg-warning py-2.5 text-[10px] font-bold text-on-warning outline-none transition-all hover:bg-warning-hover focus-visible:ring-2 focus-visible:ring-focus active:scale-95 dark:bg-warning dark:text-on-warning dark:hover:bg-warning-hover"
      >
        <MessageCircle size={12} /> واتساب
      </button>
      <button
        onClick={() => onEdit?.(parent)}
        className="flex items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-[10px] font-bold text-on-primary outline-none transition-all hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-focus active:scale-95 dark:bg-primary dark:text-on-primary dark:hover:bg-primary-hover"
      >
        <Edit size={12} /> تعديل
      </button>
      <button
        onClick={() => onDelete?.(parent.id)}
        className="flex items-center justify-center gap-2 rounded-xl bg-error py-2.5 text-[10px] font-bold text-on-error outline-none transition-all hover:bg-error-hover focus-visible:ring-2 focus-visible:ring-focus active:scale-95 dark:bg-error dark:text-on-error dark:hover:bg-error-hover"
      >
        <Trash2 size={12} /> حذف
      </button>
    </div>
  </>
)

const DAY_ORDER = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة']

const toMinutes = (h: string) => {
  const [hh = '', mm = '0'] = String(h || '').split(':')
  const mins = parseInt(hh, 10) * 60 + parseInt(mm, 10)
  return Number.isNaN(mins) ? 0 : mins
}

const ScheduleTab = ({ familySchedule }: { familySchedule: FamilyScheduleItem[] }) => (
  <div className="space-y-3">
    <h5 className="flex items-center gap-1.5 text-[9px] font-bold text-muted">
      <Clock size={10} />
      الجدول العائلي الموحد
    </h5>
    {familySchedule.length > 0 ? (
      DAY_ORDER.map((day) => {
        const dayItems = familySchedule
          .filter((s) => s.day === day)
          .sort((a, b) => toMinutes(a.hour) - toMinutes(b.hour))
        if (dayItems.length === 0) return null
        return (
          <div key={day} className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="flex items-center gap-2 border-b border-border bg-primary-soft px-3 py-2">
              <Calendar size={12} className="text-primary" />
              <p className="text-[10px] font-bold text-primary">{day}</p>
              <span className="ms-auto text-[9px] font-bold text-primary/70">
                {dayItems.length} حصة
              </span>
            </div>
            <div className="divide-y divide-border">
              {dayItems.map((s, i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-[10px] font-bold text-primary">
                    {(s.studentName || '?').charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] font-bold text-main">{s.studentName}</p>
                    <p className="truncate text-[9px] text-muted">
                      {s.subject}
                      {s.teacherName ? (
                        <span className="font-bold text-primary"> • {s.teacherName}</span>
                      ) : null}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1 rounded-lg border border-border bg-surface px-2 py-1 text-[9px] font-bold">
                    <Clock size={9} className="text-primary" />
                    <span className="font-mono text-primary">
                      {s.hour} {s.period === 'am' ? 'ص' : 'م'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })
    ) : (
      <div className="rounded-xl border border-dashed border-border py-12 text-center">
        <Calendar size={32} className="mx-auto mb-2 text-muted opacity-40" />
        <p className="text-[10px] text-muted">لا توجد مواعيد حالياً</p>
      </div>
    )}
  </div>
)

const ParentHeader = ({
  parent,
  hasOverdue,
  childrenCount,
  onClose,
}: {
  parent: Parent
  hasOverdue: boolean
  childrenCount: number
  onClose: () => void
}) => (
  <div className="relative overflow-hidden bg-gradient-to-l from-primary to-primary-deep p-5">
    <div className="pointer-events-none absolute -end-8 -top-8 h-28 w-28 rounded-full bg-white/10 blur-xl" />
    <div className="pointer-events-none absolute -bottom-10 -start-6 h-24 w-24 rounded-full bg-white/5 blur-lg" />
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        onClose()
      }}
      className="absolute end-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 text-on-primary outline-none backdrop-blur-sm transition-all hover:bg-white/30 focus-visible:ring-2 focus-visible:ring-focus active:scale-90"
      aria-label="إغلاق"
    >
      <X size={18} />
    </button>
    <div className="relative z-10 flex items-center gap-4 pe-12">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-xl font-bold text-on-primary shadow-lg ring-2 ring-white/30 backdrop-blur-sm">
        {(parent.name || '?').charAt(0)}
      </div>
      <div className="min-w-0">
        <h2 className="truncate text-base font-bold text-on-primary">{parent.name}</h2>
        <p className="mt-0.5 flex items-center gap-1.5 text-[10px] font-medium text-white/70">
          <Users size={9} />
          {childrenCount} {childrenCount === 1 ? 'ابن' : 'أبناء'} مسجلين
        </p>
        <div className="mt-1.5 flex items-center gap-1.5">
          {hasOverdue && (
            <span className="flex items-center gap-1 rounded-lg bg-error-soft px-1.5 py-0.5 text-[9px] font-bold text-error">
              <AlertTriangle size={8} /> متأخرات
            </span>
          )}
          <span
            className={cn(
              'flex items-center gap-1 rounded-lg px-1.5 py-0.5 text-[9px] font-bold',
              childrenCount > 0 ? 'bg-success-soft text-success' : 'bg-surface text-muted',
            )}
          >
            <span
              className={cn('h-1 w-1 rounded-full', childrenCount > 0 ? 'bg-success' : 'bg-muted')}
            />
            {childrenCount > 0 ? 'نشط' : 'غير نشط'}
          </span>
        </div>
      </div>
    </div>
  </div>
)

const TabsBar = ({ tab, onTabChange }: { tab: TabKey; onTabChange: (t: TabKey) => void }) => (
  <div className="flex border-b border-border bg-card px-3">
    {[
      { key: 'overview' as TabKey, label: 'نظرة عامة', icon: Users },
      { key: 'schedule' as TabKey, label: 'الجدول العائلي', icon: Calendar },
    ].map((t) => (
      <button
        key={t.key}
        onClick={() => onTabChange(t.key)}
        className={cn(
          'flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-[10px] font-bold transition-all',
          tab === t.key
            ? 'border-primary text-primary'
            : 'border-transparent text-muted hover:text-main',
        )}
      >
        <t.icon size={12} />
        {t.label}
      </button>
    ))}
  </div>
)

export const ParentDrawer = ({
  parent,
  details,
  onClose,
  onEdit,
  onDelete,
  onWhatsApp,
  onCall,
  inline = false,
}: ParentDrawerProps) => {
  const [tab, setTab] = useState<TabKey>('overview')

  useEffect(() => {
    if (!parent) return
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [parent, onClose])

  if (!parent) return null

  const children = details?.children || []
  const familySchedule = details?.familySchedule || []
  const hasOverdue = children.some((c) =>
    (c.enrollments || []).some((en) => en.sessionsTotal - en.sessionsUsed <= 2),
  )

  const handleCall = () => onCall?.(parent.phone)
  const handleWhatsApp = () => onWhatsApp?.(parent.phone)

  if (inline) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className="overflow-hidden rounded-2xl border border-border bg-card shadow-elevation-1"
        dir="rtl"
      >
        <ParentHeader
          parent={parent}
          hasOverdue={hasOverdue}
          childrenCount={children.length}
          onClose={onClose}
        />
        <TabsBar tab={tab} onTabChange={setTab} />
        <div className="space-y-5 p-4 sm:p-5">
          {tab === 'overview' ? (
            <OverviewTab
              parent={parent}
              details={details}
              children={children}
              handleCall={handleCall}
              handleWhatsApp={handleWhatsApp}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ) : (
            <ScheduleTab familySchedule={familySchedule} />
          )}
        </div>
      </motion.div>
    )
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[60] flex justify-end"
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative flex w-full max-w-md flex-col overflow-hidden border-s border-border bg-background shadow-elevation-2"
          dir="rtl"
        >
          <ParentHeader
            parent={parent}
            hasOverdue={hasOverdue}
            childrenCount={children.length}
            onClose={onClose}
          />
          <TabsBar tab={tab} onTabChange={setTab} />
          <div className="no-scrollbar flex-1 space-y-5 overflow-y-auto px-4 py-4">
            {tab === 'overview' ? (
              <OverviewTab
                parent={parent}
                details={details}
                children={children}
                handleCall={handleCall}
                handleWhatsApp={handleWhatsApp}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ) : (
              <ScheduleTab familySchedule={familySchedule} />
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
