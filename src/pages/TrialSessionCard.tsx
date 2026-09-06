import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Phone,
  MessageSquare,
  Pencil,
  Trash2,
  BookOpen,
  Calendar,
  Clock,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  CircleDollarSign,
  User,
  GraduationCap,
} from 'lucide-react'
import { cn } from '../lib/utils'
import type { TrialSession } from './TrialSessions'

interface TrialSessionCardProps {
  session: TrialSession
  onConvert: (id: string) => void
  onEdit: (session: TrialSession) => void
  onDelete: (id: string) => void
  onCall?: (phone: string) => void
  onWhatsApp?: (phone: string) => void
  onCardClick?: () => void
  onPaid?: (id: string) => void
  isPaid?: boolean
  isConverting: boolean
}

const statusConfig: Record<string, { label: string; dot: string; bg: string; text: string }> = {
  pending: { label: 'بانتظار', dot: 'bg-warning', bg: 'bg-warning-soft', text: 'text-warning' },
  completed: { label: 'تمت بنجاح', dot: 'bg-success', bg: 'bg-success-soft', text: 'text-success' },
  cancelled: { label: 'ملغية', dot: 'bg-error', bg: 'bg-error-soft', text: 'text-error' },
  converted: { label: 'محولة', dot: 'bg-primary', bg: 'bg-primary-soft', text: 'text-primary' },
}

const avatarGradients = [
  { g: 'from-primary to-primary-deep', on: 'text-on-primary' },
  { g: 'from-success to-success-dark', on: 'text-on-success' },
  { g: 'from-warning to-warning-dark', on: 'text-on-warning' },
  { g: 'from-error to-error-dark', on: 'text-on-error' },
  { g: 'from-info to-info-dark', on: 'text-on-info' },
]

const getAvatarGradient = (name: string) => {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return avatarGradients[Math.abs(hash) % avatarGradients.length] ?? avatarGradients[0]!
}

const formatPhone = (phone: string) => {
  if (!phone) return ''
  if (phone.length > 8) return `${phone.slice(0, 4)}•••${phone.slice(-3)}`
  return phone
}

const actionBtnBase =
  'flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-[11px] font-extrabold transition-all active:scale-95 outline-none focus-visible:ring-2 focus-visible:ring-focus'

export const TrialSessionCard = ({
  session: t,
  onEdit,
  onDelete,
  onCall,
  onWhatsApp,
  onCardClick,
  onPaid,
  isPaid,
}: TrialSessionCardProps) => {
  const [showNotes, setShowNotes] = useState(false)
  const cfg = statusConfig[t.status] ||
    statusConfig.pending || { label: '', dot: '', bg: '', text: '' }
  const gradient = getAvatarGradient(t.studentName)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className={cn(
        'group overflow-hidden rounded-2xl border border-border bg-card text-start font-dash shadow-elevation-0 transition-all duration-slow hover:shadow-elevation-1 md:rounded-2xl',
        onCardClick && 'cursor-pointer',
      )}
      dir="rtl"
    >
      <div className="cursor-pointer p-4 pb-3" onClick={onCardClick}>
        {/* Header: student + status | date/time */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br shadow-elevation-2',
                gradient.g,
              )}
            >
              <User size={18} className={gradient.on} />
            </div>
            <div className="text-start">
              <h3 className="text-sm font-bold leading-tight text-main">{t.studentName}</h3>
              <span
                className={cn(
                  'mt-1 inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[9px] font-bold',
                  cfg.bg,
                  cfg.text,
                )}
              >
                <span className={cn('h-1.5 w-1.5 rounded-full', cfg.dot)} />
                {cfg.label}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-bold text-muted">
            <span className="inline-flex items-center gap-1">
              <Calendar size={11} />
              {t.date}
            </span>
            {t.time && (
              <>
                <span className="text-muted opacity-30">|</span>
                <span className="inline-flex items-center gap-1">
                  <Clock size={11} />
                  {t.time}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Session info: stacked on mobile, 3 columns on sm+ */}
        <div className="mb-3 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          <div className="rounded-xl border border-primary-soft bg-primary-soft p-2.5 text-start">
            <p className="mb-1 text-[10px] font-bold text-primary">المادة</p>
            <div className="flex items-center justify-start gap-1.5">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white/60 dark:bg-white/10">
                <BookOpen size={12} className="text-primary" />
              </div>
              <span className="truncate text-[11px] font-extrabold text-main">
                {t.subject || '—'}
              </span>
            </div>
          </div>
          <div className="rounded-xl border border-success-soft bg-success-soft p-2.5 text-start">
            <p className="mb-1 text-[10px] font-bold text-success">المعلمة</p>
            <div className="flex items-center justify-start gap-1.5">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white/60 dark:bg-white/10">
                <GraduationCap size={12} className="text-success" />
              </div>
              <span className="truncate text-[11px] font-extrabold text-main">
                {t.teacherName || '—'}
              </span>
            </div>
          </div>
          <div className="rounded-xl border border-warning-soft bg-warning-soft p-2.5 text-start">
            <p className="mb-1 text-[10px] font-bold text-warning">رقم التواصل</p>
            <div className="flex items-center justify-start gap-1.5">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white/60 dark:bg-white/10">
                <Phone size={12} className="text-warning" />
              </div>
              <span className="truncate font-mono text-[11px] font-extrabold text-main" dir="ltr">
                {formatPhone(t.parentPhone)}
              </span>
            </div>
          </div>
        </div>

        {/* Notes accordion */}
        {t.notes && (
          <div
            className={cn(
              'cursor-pointer rounded-xl text-[11px] transition-all',
              showNotes
                ? 'border-2 border-warning bg-warning-soft p-3'
                : 'border border-warning-soft bg-warning-soft',
            )}
            onClick={(e) => {
              e.stopPropagation()
              setShowNotes(!showNotes)
            }}
          >
            {showNotes ? (
              <div className="flex items-start gap-2">
                <MessageCircle size={14} className="mt-0.5 shrink-0 font-bold text-warning" />
                <div className="min-w-0 flex-1 text-start">
                  <p className="font-semibold leading-relaxed text-main">{t.notes}</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowNotes(false)
                    }}
                    className="mt-1 inline-flex items-center gap-1 text-[10px] font-black text-warning outline-none focus-visible:ring-2 focus-visible:ring-focus"
                  >
                    <ChevronUp size={10} />
                    أقل
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-1 py-1.5 font-semibold text-main">
                <MessageCircle size={13} className="shrink-0 text-warning" />
                <span className="line-clamp-1 flex-1 text-start">{t.notes}</span>
                <ChevronDown size={11} className="shrink-0 text-warning" />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mobile actions: 2-col grid + full-width delete */}
      <div
        className="border-t border-border bg-surface px-4 py-3 dark:bg-card md:hidden"
        role="toolbar"
        aria-label="إجراءات الحصة"
      >
        <div className="grid grid-cols-2 gap-2">
          {onWhatsApp && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onWhatsApp(t.parentPhone)
              }}
              className={cn(actionBtnBase, 'bg-success-soft text-success hover:bg-success-light')}
              aria-label="واتساب"
            >
              <MessageSquare size={13} /> واتساب
            </button>
          )}
          {onCall && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onCall(t.parentPhone)
              }}
              className={cn(actionBtnBase, 'bg-info-soft text-info hover:bg-info-light')}
              aria-label="اتصال"
            >
              <Phone size={13} /> اتصال
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onEdit(t)
            }}
            className={cn(actionBtnBase, 'bg-primary-soft text-primary hover:bg-primary-light')}
            aria-label="تعديل"
          >
            <Pencil size={13} /> تعديل
          </button>
          {onPaid && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onPaid(t.id)
              }}
              disabled={isPaid}
              className={cn(
                actionBtnBase,
                isPaid
                  ? 'cursor-default bg-success-soft text-success'
                  : 'border-transparent bg-gradient-to-br from-success to-success-dark text-on-success shadow-elevation-2 hover:shadow-elevation-3',
              )}
              aria-label="مدفوعة"
            >
              <CircleDollarSign size={14} /> {isPaid ? 'تم الدفع' : 'دفع'}
            </button>
          )}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete(t.id)
          }}
          className={cn(
            actionBtnBase,
            'mt-2 w-full border-error bg-error text-on-error shadow-elevation-1 hover:bg-error-hover',
          )}
          aria-label="حذف"
        >
          <Trash2 size={14} /> حذف
        </button>
      </div>

      {/* Desktop actions: single row */}
      <div
        className="hidden items-center justify-between gap-2 border-t border-border bg-surface px-4 py-3 dark:bg-card md:flex"
        role="toolbar"
        aria-label="إجراءات الحصة"
      >
        <div className="flex items-center gap-2">
          {onCall && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onCall(t.parentPhone)
              }}
              className={cn(actionBtnBase, 'bg-info-soft text-info hover:bg-info-light')}
              aria-label="اتصال"
            >
              <Phone size={13} /> اتصال
            </button>
          )}
          {onWhatsApp && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onWhatsApp(t.parentPhone)
              }}
              className={cn(actionBtnBase, 'bg-success-soft text-success hover:bg-success-light')}
              aria-label="واتساب"
            >
              <MessageSquare size={13} /> واتساب
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onEdit(t)
            }}
            className={cn(actionBtnBase, 'bg-primary-soft text-primary hover:bg-primary-light')}
            aria-label="تعديل"
          >
            <Pencil size={13} /> تعديل
          </button>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {onPaid && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onPaid(t.id)
              }}
              disabled={isPaid}
              className={cn(
                actionBtnBase,
                isPaid
                  ? 'cursor-default bg-success-soft text-success'
                  : 'border-transparent bg-gradient-to-br from-success to-success-dark text-on-success shadow-elevation-2 hover:shadow-elevation-3',
              )}
              aria-label="مدفوعة"
            >
              <CircleDollarSign size={14} /> {isPaid ? 'تم الدفع' : 'دفع'}
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete(t.id)
            }}
            className={cn(
              actionBtnBase,
              'border-error bg-error text-on-error shadow-elevation-1 hover:bg-error-hover',
            )}
            aria-label="حذف"
          >
            <Trash2 size={14} /> حذف
          </button>
        </div>
      </div>
    </motion.div>
  )
}
