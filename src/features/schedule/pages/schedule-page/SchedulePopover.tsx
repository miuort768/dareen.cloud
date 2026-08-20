import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  CalendarDays,
  BookOpen,
  GraduationCap,
  User,
  Star,
  Send,
  CheckCircle2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useCurrentUser } from '@/context/AppContext'

interface ScheduleEvent {
  id: string
  studentId: string
  studentName: string
  studentGrade: string
  teacherName: string
  subject: string
  curriculum: string
  day: string
  hour: string
  period: string
  time: string
  studentPoints?: number
}

const SUBJECT_COLORS: Record<string, { bg: string; text: string; on: string; chip: string }> = {
  رياضيات: {
    bg: 'bg-primary',
    text: 'text-primary',
    on: 'text-on-primary',
    chip: 'bg-primary/[12%]',
  },
  علوم: { bg: 'bg-success', text: 'text-success', on: 'text-on-success', chip: 'bg-success/[12%]' },
  عربي: { bg: 'bg-warning', text: 'text-warning', on: 'text-on-warning', chip: 'bg-warning/[12%]' },
  انجليزي: { bg: 'bg-info', text: 'text-info', on: 'text-on-info', chip: 'bg-info/[12%]' },
  دين: { bg: 'bg-accent', text: 'text-accent', on: 'text-on-accent', chip: 'bg-accent/[12%]' },
  تاريخ: { bg: 'bg-error', text: 'text-error', on: 'text-on-error', chip: 'bg-error/[12%]' },
  قرآن: { bg: 'bg-accent', text: 'text-accent', on: 'text-on-accent', chip: 'bg-accent/[12%]' },
  قواعد: {
    bg: 'bg-primary',
    text: 'text-primary',
    on: 'text-on-primary',
    chip: 'bg-primary/[12%]',
  },
  بلاغة: { bg: 'bg-info', text: 'text-info', on: 'text-on-info', chip: 'bg-info/[12%]' },
  فقه: { bg: 'bg-success', text: 'text-success', on: 'text-on-success', chip: 'bg-success/[12%]' },
  توحيد: { bg: 'bg-accent', text: 'text-accent', on: 'text-on-accent', chip: 'bg-accent/[12%]' },
  تفسير: {
    bg: 'bg-warning',
    text: 'text-warning',
    on: 'text-on-warning',
    chip: 'bg-warning/[12%]',
  },
  نحو: { bg: 'bg-error', text: 'text-error', on: 'text-on-error', chip: 'bg-error/[12%]' },
}

const FALLBACKS = [
  { bg: 'bg-primary', text: 'text-primary', on: 'text-on-primary', chip: 'bg-primary/[12%]' },
  { bg: 'bg-success', text: 'text-success', on: 'text-on-success', chip: 'bg-success/[12%]' },
  { bg: 'bg-warning', text: 'text-warning', on: 'text-on-warning', chip: 'bg-warning/[12%]' },
  { bg: 'bg-info', text: 'text-info', on: 'text-on-info', chip: 'bg-info/[12%]' },
  { bg: 'bg-accent', text: 'text-accent', on: 'text-on-accent', chip: 'bg-accent/[12%]' },
  { bg: 'bg-error', text: 'text-error', on: 'text-on-error', chip: 'bg-error/[12%]' },
]

const getSC = (subject: string) =>
  SUBJECT_COLORS[subject?.trim() || ''] ||
  FALLBACKS[Math.abs((subject?.trim() || '').length) % FALLBACKS.length]

interface SchedulePopoverProps {
  event: ScheduleEvent | null
  onClose: () => void
  onViewStudent: () => void
}

export const SchedulePopover = ({ event, onClose }: SchedulePopoverProps) => {
  const currentUser = useCurrentUser()
  const queryClient = useQueryClient()
  const [noteText, setNoteText] = useState('')
  const [showNoteInput, setShowNoteInput] = useState(false)
  const [sent, setSent] = useState(false)

  const sendNoteMutation = useMutation({
    mutationFn: (note: string) =>
      api.post('/notifications', {
        receiverId: event?.studentId,
        title: `ملاحظة من المدير`,
        body: note,
        type: 'info',
        senderName: currentUser?.name || 'مدير النظام',
        context: `${event?.subject} — ${event?.day} ${event?.time}`,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      setSent(true)
      setNoteText('')
      setShowNoteInput(false)
      setTimeout(() => setSent(false), 3000)
    },
  })

  if (!event) return null
  const c = getSC(event.subject)

  const handleSendNote = () => {
    if (!noteText.trim()) return
    sendNoteMutation.mutate(noteText.trim())
  }

  return (
    <AnimatePresence>
      {/* Full-screen backdrop — click outside to close */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        onKeyDown={(e) => {
          if (e.key === 'Escape') onClose()
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 10 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="w-full max-w-sm"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-elevation-2">
            {/* Header gradient */}
            <div className={`relative p-4 pb-5 ${c.bg}`}>
              <div className="absolute inset-0 opacity-10">
                <svg width="100%" height="100%">
                  <defs>
                    <pattern
                      id="popover-grid"
                      x="0"
                      y="0"
                      width="20"
                      height="20"
                      patternUnits="userSpaceOnUse"
                    >
                      <circle cx="2" cy="2" r="1" fill="white" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#popover-grid)" />
                </svg>
              </div>
              <div className="relative z-10 flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 ring-2 ring-white/30">
                    <BookOpen size={18} className="text-white" />
                  </div>
                  <div>
                    <h3 className={cn('text-sm font-bold', c.on)}>{event.subject}</h3>
                    <p className="mt-0.5 text-[10px] text-white/70">
                      {event.curriculum || 'المنهج العام'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-white/60 transition-colors hover:bg-white/15 hover:text-white"
                  aria-label="إغلاق"
                >
                  <X size={14} />
                </button>
              </div>
              {event.studentPoints != null && event.studentPoints > 0 && (
                <div className="relative z-10 mt-2 flex items-center gap-1.5">
                  <div className="flex items-center gap-1 rounded-lg bg-white/15 px-2 py-0.5">
                    <Star size={8} className="text-warning" fill="currentColor" />
                    <span className="text-[9px] font-bold text-white">
                      {event.studentPoints} نقطة
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="space-y-3 p-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl bg-surface p-3">
                  <User size={12} className="mb-1 text-muted" />
                  <p className="text-[9px] font-bold text-muted">الطالب</p>
                  <p className="mt-0.5 text-xs font-bold text-main">{event.studentName}</p>
                </div>
                <div className="rounded-xl bg-surface p-3">
                  <GraduationCap size={12} className="mb-1 text-muted" />
                  <p className="text-[9px] font-bold text-muted">المعلمة</p>
                  <p className="mt-0.5 text-xs font-bold text-main">{event.teacherName}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-surface p-3">
                <CalendarDays size={12} className="shrink-0 text-muted" />
                <div>
                  <p className="text-[9px] font-bold text-muted">الموعد</p>
                  <p className="mt-0.5 text-xs font-bold text-main">
                    {event.day} — {event.time}
                  </p>
                </div>
              </div>
              {event.studentGrade && (
                <div className="flex items-center gap-2 rounded-xl bg-surface p-3">
                  <Star size={12} className="shrink-0 text-muted" />
                  <div>
                    <p className="text-[9px] font-bold text-muted">الصف</p>
                    <p className="mt-0.5 text-xs font-bold text-main">{event.studentGrade}</p>
                  </div>
                </div>
              )}

              {/* Note input */}
              <AnimatePresence>
                {showNoteInput && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <textarea
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      placeholder="اكتب ملاحظتك هنا..."
                      rows={3}
                      className="w-full resize-none rounded-xl border border-border bg-surface px-3 py-2.5 text-xs font-bold text-main outline-none placeholder:font-normal placeholder:text-muted focus:border-primary focus:ring-1 focus:ring-primary/20"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Sent confirmation */}
              <AnimatePresence>
                {sent && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2 rounded-xl bg-success-soft p-3"
                  >
                    <CheckCircle2 size={14} className="shrink-0 text-success" />
                    <span className="text-xs font-bold text-success">تم إرسال الملاحظة بنجاح</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Actions */}
            <div className="flex gap-2 p-4 pt-0">
              {showNoteInput ? (
                <>
                  <button
                    onClick={() => {
                      setShowNoteInput(false)
                      setNoteText('')
                    }}
                    className="flex h-10 items-center justify-center gap-1.5 rounded-xl border border-border bg-surface px-4 text-[10px] font-bold text-main transition-all hover:bg-hover active:scale-95"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={handleSendNote}
                    disabled={!noteText.trim() || sendNoteMutation.isPending}
                    className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary text-[10px] font-bold text-on-primary transition-all hover:bg-primary-hover active:scale-95 disabled:opacity-50"
                  >
                    <Send size={12} />
                    {sendNoteMutation.isPending ? 'جاري الإرسال...' : 'إرسال الملاحظة'}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowNoteInput(true)}
                  className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary text-[10px] font-bold text-on-primary transition-all hover:bg-primary-hover active:scale-95"
                >
                  <Send size={12} />
                  إرسال ملاحظة
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
