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
  pending: { label: 'بانتظار', dot: 'bg-warning', bg: 'bg-warning/15', text: 'text-warning' },
  completed: { label: 'تمت بنجاح', dot: 'bg-success', bg: 'bg-success/15', text: 'text-success' },
  cancelled: { label: 'ملغية', dot: 'bg-error', bg: 'bg-error/15', text: 'text-error' },
  converted: { label: 'محولة', dot: 'bg-primary', bg: 'bg-primary/15', text: 'text-primary' },
}

const avatarGradients = [
  { g: 'from-primary to-primary-deep', on: 'text-on-primary' },
  { g: 'from-success to-success-dark', on: 'text-on-success' },
  { g: 'from-warning to-warning-dark', on: 'text-on-warning' },
  { g: 'from-error to-error-dark', on: 'text-on-error' },
  { g: 'from-info to-info-dark', on: 'text-on-info' },
  { g: 'from-chart-4 to-chart-4/80', on: 'text-white' },
]

const getAvatarGradient = (name: string) => {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return avatarGradients[Math.abs(hash) % avatarGradients.length]
}

const formatPhone = (phone: string) => {
  if (!phone) return ''
  if (phone.length > 8) return `${phone.slice(0, 4)}...${phone.slice(-3)}`
  return phone
}

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
  const cfg = statusConfig[t.status] || statusConfig.pending
  const gradient = getAvatarGradient(t.studentName)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className={cn(
        'group overflow-hidden rounded-2xl border border-border bg-card text-right font-dash transition-all duration-300 hover:shadow-elevation-2',
        onCardClick && 'cursor-pointer',
      )}
      dir="rtl"
    >
      <div className="cursor-pointer p-4 pb-3" onClick={onCardClick}>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br shadow-md',
                gradient.g,
              )}
            >
              <User size={18} className={gradient.on} />
            </div>
            <div className="text-right">
              <h3 className="text-[14px] font-bold leading-tight text-main">{t.studentName}</h3>
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

          <div className="flex items-center gap-2 text-[11px] text-muted">
            <span className="inline-flex items-center gap-1">
              <Calendar size={11} />
              {t.date}
            </span>
            {t.time && (
              <>
                <span className="text-muted/30">|</span>
                <span className="inline-flex items-center gap-1">
                  <Clock size={11} />
                  {t.time}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="mb-3 grid grid-cols-3 gap-2.5">
          <div className="bg-surface/80 dark:bg-card/90 border-border/80 rounded-xl border p-2.5 text-right">
            <p className="mb-1 text-[10px] font-bold text-muted">المادة</p>
            <div className="flex items-center justify-start gap-1.5">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-primary/15">
                <BookOpen size={12} className="text-primary" />
              </div>
              <span className="truncate text-[11px] font-extrabold text-main">
                {t.subject || '—'}
              </span>
            </div>
          </div>
          <div className="bg-surface/80 dark:bg-card/90 border-border/80 rounded-xl border p-2.5 text-right">
            <p className="mb-1 text-[10px] font-bold text-muted">المعلمة</p>
            <div className="flex items-center justify-start gap-1.5">
              <div className="bg-success/15 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg">
                <GraduationCap size={12} className="text-success" />
              </div>
              <span className="truncate text-[11px] font-extrabold text-main">
                {t.teacherName || '—'}
              </span>
            </div>
          </div>
          <div className="bg-surface/80 dark:bg-card/90 border-border/80 rounded-xl border p-2.5 text-right">
            <p className="mb-1 text-[10px] font-bold text-muted">رقم التواصل</p>
            <div className="flex items-center justify-start gap-1.5">
              <div className="bg-warning/15 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg">
                <Phone size={12} className="text-warning" />
              </div>
              <span className="truncate font-mono text-[11px] font-extrabold text-main" dir="ltr">
                {formatPhone(t.parentPhone)}
              </span>
            </div>
          </div>
        </div>

        {t.notes && (
          <div
            className={cn(
              'mb-2 cursor-pointer rounded-xl text-[11px] transition-all',
              showNotes ? 'bg-warning/15 dark:bg-warning/25 border-warning/40 border-2 p-3' : '',
            )}
            onClick={(e) => {
              e.stopPropagation()
              setShowNotes(!showNotes)
            }}
          >
            {showNotes ? (
              <div className="flex items-start gap-2">
                <MessageCircle size={14} className="mt-0.5 shrink-0 font-bold text-warning" />
                <div className="min-w-0 flex-1 text-right">
                  <p className="font-semibold leading-relaxed text-main">{t.notes}</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowNotes(false)
                    }}
                    className="mt-1 inline-flex items-center gap-1 text-[10px] font-black text-warning"
                  >
                    <ChevronUp size={10} />
                    أقل
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-warning/10 dark:bg-warning/20 border-warning/30 flex items-center gap-1.5 rounded-lg border px-3 py-2 font-semibold text-main">
                <MessageCircle size={13} className="shrink-0 text-warning" />
                <span className="line-clamp-1 flex-1 text-right">{t.notes}</span>
                <ChevronDown size={11} className="shrink-0 text-warning" />
              </div>
            )}
          </div>
        )}
      </div>

      <div
        className="flex items-center justify-between gap-2 border-t border-border bg-surface px-4 py-3 dark:bg-card"
        role="toolbar"
        aria-label="إجراءات الحصة"
      >
        <div className="flex flex-1 flex-wrap items-center gap-2">
          {onCall && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onCall(t.parentPhone)
              }}
              className="bg-info/15 border-info/30 hover:bg-info/25 flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-[11px] font-extrabold text-info transition-all active:scale-95"
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
              className="bg-success/15 border-success/30 hover:bg-success/25 flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-[11px] font-extrabold text-success transition-all active:scale-95"
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
            className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-2 text-[11px] font-extrabold text-main transition-all hover:bg-hover active:scale-95"
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
                'flex items-center gap-1.5 rounded-xl border-2 px-3 py-2 text-[11px] font-extrabold shadow-sm transition-all active:scale-95',
                isPaid
                  ? 'border-success/40 bg-success/15 cursor-default text-success'
                  : 'shadow-success/20 border-success bg-success text-on-success hover:bg-success-dark',
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
            className="shadow-error/20 flex items-center gap-1.5 rounded-xl border-2 border-error bg-error px-3 py-2 text-[11px] font-extrabold text-on-error shadow-sm transition-all hover:bg-error-hover active:scale-95"
            aria-label="حذف"
          >
            <Trash2 size={14} /> حذف
          </button>
        </div>
      </div>
    </motion.div>
  )
}
