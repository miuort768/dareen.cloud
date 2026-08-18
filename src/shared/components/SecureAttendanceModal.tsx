import React, { useState, useEffect, useRef } from 'react'
import { ShieldCheck, X, CheckCircle2, XCircle, Lock, BookOpen, Star } from 'lucide-react'
import { cn } from '../../lib/utils'
import { Button } from '../components/ui/Button'

interface SecureAttendanceModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (
    status: 'completed' | 'cancelled',
    topics?: string,
    homework?: string,
    needsCompensation?: boolean,
  ) => Promise<boolean | void>
  studentName: string
  date: string
}

export const SecureAttendanceModal: React.FC<SecureAttendanceModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  studentName,
  date,
}) => {
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState<'completed' | 'cancelled'>('completed')
  const [topics, setTopics] = useState('')
  const [homework, setHomework] = useState('')
  const [needsCompensation, setNeedsCompensation] = useState(false)
  const [error, setError] = useState('')
  const submittedRef = useRef(false)

  useEffect(() => {
    if (isOpen) {
      setPassword('')
      setStatus('completed')
      setTopics('')
      setHomework('')
      setNeedsCompensation(false)
      setError('')
      submittedRef.current = false
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleConfirm = async () => {
    if (submittedRef.current) return
    const secret = import.meta.env.VITE_ATTENDANCE_SECRET || ''
    if (password.toLowerCase() !== secret.toLowerCase()) {
      setError('كلمة المرور غير صحيحة')
      return
    }
    submittedRef.current = true
    try {
      const ok = await onConfirm(status, topics, homework, needsCompensation)
      if (ok !== false) {
        onClose()
      } else {
        submittedRef.current = false
        setError('تعذر تسجيل الحصة، حاول مرة أخرى')
      }
    } catch {
      submittedRef.current = false
      setError('تعذر تسجيل الحصة، حاول مرة أخرى')
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto overflow-x-hidden p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose()
      }}
    >
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm duration-200 animate-in fade-in"
        onClick={onClose}
      ></div>

      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-elevation-3 duration-200 animate-in zoom-in-95 dark:bg-card">
        {/* Accent bar */}
        <div className="h-1 w-full bg-primary"></div>

        <div className="p-6">
          {/* Header */}
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 dark:bg-primary/15">
                <ShieldCheck size={20} className="text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-main">تسجيل حضور مؤكد</h3>
                <p className="text-[11px] text-muted">كلمة مرور المشرف مطلوبة</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-surface text-muted transition-all hover:bg-hover hover:text-main"
              aria-label="إغلاق"
            >
              <X size={16} />
            </button>
          </div>

          {/* Student info */}
          <div className="mb-5 rounded-xl bg-surface p-4 text-center dark:bg-hover">
            <p className="mb-1 text-[11px] font-medium text-muted">تسجيل للطالب</p>
            <h4 className="text-base font-bold text-main">{studentName}</h4>
            <span className="mt-1 inline-block rounded-lg bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary">
              بتاريخ: {date}
            </span>
          </div>

          {/* Status toggle */}
          <div className="mb-5 grid grid-cols-2 gap-2.5">
            <button
              onClick={() => setStatus('completed')}
              className={cn(
                'flex flex-col items-center gap-2 rounded-xl border-2 p-3.5 transition-all',
                status === 'completed'
                  ? 'bg-success/10 border-success text-success'
                  : 'hover:border-success/50 border-border bg-surface text-muted',
              )}
            >
              <CheckCircle2
                size={22}
                className={status === 'completed' ? 'text-success' : 'text-dim'}
              />
              <span className="text-xs font-bold">حضور</span>
            </button>
            <button
              onClick={() => setStatus('cancelled')}
              className={cn(
                'flex flex-col items-center gap-2 rounded-xl border-2 p-3.5 transition-all',
                status === 'cancelled'
                  ? 'bg-error/10 border-error text-error'
                  : 'hover:border-error/50 border-border bg-surface text-muted',
              )}
            >
              <XCircle size={22} className={status === 'cancelled' ? 'text-error' : 'text-dim'} />
              <span className="text-xs font-bold">غياب</span>
            </button>
          </div>

          {/* Completed fields */}
          {status === 'completed' && (
            <div className="mb-5 space-y-3.5 duration-200 animate-in fade-in slide-in-from-top-2">
              <div className="space-y-1.5">
                <label
                  htmlFor="attendance-topics"
                  className="flex items-center gap-1.5 text-[11px] font-bold text-muted"
                >
                  <BookOpen size={12} className="text-success" /> ما تم إنجازه في الحصة
                </label>
                <textarea
                  id="attendance-topics"
                  placeholder="مثلاً: مراجعة سورة البقرة، أول 10 آيات..."
                  className="focus:ring-success/20 w-full resize-none rounded-xl border border-border bg-surface p-3 text-xs font-medium leading-relaxed transition-all focus:border-success focus:ring-1 dark:bg-hover dark:text-main"
                  rows={2}
                  value={topics}
                  onChange={(e) => setTopics(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label
                  htmlFor="attendance-homework"
                  className="flex items-center gap-1.5 text-[11px] font-bold text-muted"
                >
                  <Star size={12} className="text-warning" /> الواجب المطلوب
                </label>
                <input
                  id="attendance-homework"
                  type="text"
                  placeholder="مثلاً: حفظ الجزء الثاني من الصفحة..."
                  className="focus:ring-warning/20 w-full rounded-xl border border-border bg-surface p-3 text-xs font-medium transition-all focus:border-warning focus:ring-1 dark:bg-hover dark:text-main"
                  value={homework}
                  onChange={(e) => setHomework(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Cancelled checkbox */}
          {status === 'cancelled' && (
            <div className="mb-5 duration-200 animate-in fade-in slide-in-from-top-2">
              <label className="bg-error/5 border-error/20 hover:bg-error/10 flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 transition-colors">
                <input
                  type="checkbox"
                  checked={needsCompensation}
                  onChange={(e) => setNeedsCompensation(e.target.checked)}
                  className="h-4 w-4 cursor-pointer rounded accent-error"
                />
                <div>
                  <p className="text-xs font-bold text-main">تحتاج لحصة تعويض؟</p>
                  <p className="text-[10px] text-muted">
                    سيتم إضافتها لقائمة الانتظار لجدولتها لاحقاً
                  </p>
                </div>
              </label>
            </div>
          )}

          {/* Password */}
          <div className="mb-5 space-y-1.5">
            <label
              htmlFor="attendance-password"
              className="flex items-center gap-1.5 text-[11px] font-bold text-muted"
            >
              <Lock size={12} /> كلمة المرور للتأكيد
            </label>
            <input
              id="attendance-password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (error) setError('')
              }}
              placeholder="أدخل كلمة المرور..."
              className={cn(
                'w-full rounded-xl border bg-surface p-3 text-center font-mono text-xs font-medium tracking-widest outline-none transition-all focus:ring-1 dark:bg-hover dark:text-main',
                error
                  ? 'focus:ring-error/20 border-error'
                  : 'border-border focus:border-primary focus:ring-primary/20',
              )}
              autoFocus
            />
            {error && <p className="text-center text-[11px] font-bold text-error">{error}</p>}
          </div>

          {/* Submit */}
          <Button onClick={handleConfirm} variant="primary" size="lg" className="w-full">
            تأكيد التسجيل
          </Button>
        </div>
      </div>
    </div>
  )
}
