import { useEffect, useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { X, Loader2, LinkIcon, Copy, CheckCircle2, Radio, ExternalLink, Users } from 'lucide-react'
import { api } from '../../../lib/api'
import { startLiveSession } from '../../../services/liveSessionService'
import { useCurrentUser } from '../../../context/AppContext'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import type { Student } from '../../../types'

const PROVIDERS = [
  { value: 'google_meet', label: 'Google Meet' },
  { value: 'zoom', label: 'Zoom' },
  { value: 'custom', label: 'رابط آخر' },
]

interface StartLiveSessionDialogProps {
  open: boolean
  onClose: () => void
  defaultStudentId?: string
  defaultSubject?: string
}

export const StartLiveSessionDialog = ({
  open,
  onClose,
  defaultStudentId,
  defaultSubject,
}: StartLiveSessionDialogProps) => {
  const queryClient = useQueryClient()
  const currentUser = useCurrentUser()

  const [studentId, setStudentId] = useState('')
  const [subject, setSubject] = useState('')
  const [provider, setProvider] = useState('google_meet')
  const [meetingUrl, setMeetingUrl] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [started, setStarted] = useState<{ id: string; meetingUrl: string } | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (open) {
      setStudentId(defaultStudentId || '')
      setSubject(defaultSubject || '')
      setProvider('google_meet')
      setMeetingUrl('')
      setError(null)
      setStarted(null)
      setCopied(false)
    }
  }, [open, defaultStudentId, defaultSubject])

  const { data: students = [], isLoading: loadingStudents } = useQuery<Student[]>({
    queryKey: ['students'],
    queryFn: async () => {
      const data = await api.get<{ data: Student[] } | Student[]>('/students')
      return Array.isArray(data) ? data : data.data || []
    },
  })

  const ownStudents = useMemo(() => {
    if (currentUser?.role !== 'teacher') return students
    const teacherId = currentUser.id
    const teacherName = currentUser.teacherName || currentUser.name
    return students.filter((s) =>
      (s.enrollments || []).some(
        (e) =>
          (e.teacherId && e.teacherId === teacherId) ||
          (typeof e.teacher === 'string' && e.teacher === teacherName) ||
          (e.teacher && typeof e.teacher === 'object' && e.teacher.id === teacherId),
      ),
    )
  }, [students, currentUser])

  const startMutation = useMutation({
    mutationFn: startLiveSession,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['live-sessions'] })
      setStarted({ id: res.id, meetingUrl: res.meetingUrl })
    },
    onError: (err: unknown) => {
      setError(err instanceof Error ? err.message : 'فشل بدء الحصة')
    },
  })

  const handleStart = () => {
    if (!studentId) {
      setError('يرجى اختيار الطالب قبل بدء الحصة')
      return
    }
    if (!meetingUrl.trim()) {
      setError('يرجى إدخال رابط الاجتماع')
      return
    }
    setError(null)
    startMutation.mutate({
      title: `حصة مباشرة: ${subject || currentUser?.name}`,
      subject,
      meetingProvider: provider as 'google_meet' | 'zoom' | 'custom',
      meetingUrl: meetingUrl.trim(),
      targetStudentId: studentId,
    })
  }

  const copyLink = async () => {
    if (!started) return
    try {
      await navigator.clipboard.writeText(started.meetingUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* ignore */
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="بدء حصة مباشرة"
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose()
      }}
    >
      <div
        className="no-scrollbar max-h-[90vh] w-full max-w-md space-y-5 overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-2xl dark:border-border dark:bg-card"
        onClick={(e) => e.stopPropagation()}
      >
        {started ? (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-main dark:text-main">بدأت الحصة!</h3>
              <button
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface transition-colors hover:bg-hover dark:bg-hover dark:hover:bg-primary/5"
                aria-label="إغلاق"
              >
                <X size={16} className="text-muted dark:text-muted" />
              </button>
            </div>

            <div className="dark:bg-success/10 border-success/30 flex flex-col items-center gap-3 rounded-2xl border bg-success-soft p-5 text-center">
              <div className="bg-success/15 flex h-14 w-14 items-center justify-center rounded-2xl">
                <CheckCircle2 size={26} className="text-success" />
              </div>
              <p className="text-[13px] font-bold leading-relaxed text-main dark:text-main">
                تم إشعار الطالب وولي الأمر بأن الحصة جارية الآن
              </p>
              <p className="text-[11px] font-medium text-muted dark:text-muted">
                رابط الحصة جاهز ويمكن نسخه أو مشاركته
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-border bg-background p-3 dark:border-border dark:bg-hover">
              <div className="min-w-0 flex-1">
                <p className="mb-0.5 text-[10px] font-bold text-muted dark:text-muted">
                  رابط الحصة
                </p>
                <p
                  className="truncate text-[11px] font-medium text-primary dark:text-primary"
                  dir="ltr"
                >
                  {started.meetingUrl}
                </p>
              </div>
              <button
                onClick={copyLink}
                className="flex h-9 shrink-0 items-center gap-1.5 rounded-xl bg-primary px-3 text-[11px] font-bold text-on-primary transition-colors hover:bg-primary-hover dark:bg-primary dark:text-on-primary dark:hover:bg-primary-active"
                aria-label="نسخ الرابط"
              >
                {copied ? <CheckCircle2 size={13} /> : <Copy size={13} />}
                {copied ? 'تم النسخ' : 'نسخ'}
              </button>
              <a
                href={started.meetingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 shrink-0 items-center gap-1.5 rounded-xl bg-success px-3 text-[11px] font-bold text-on-success transition-opacity hover:opacity-90 dark:bg-success dark:text-on-success"
              >
                <ExternalLink size={12} />
                الدخول
              </a>
            </div>

            <Button
              onClick={onClose}
              className="h-11 w-full rounded-xl bg-primary text-xs font-bold text-on-primary dark:bg-primary dark:text-on-primary"
            >
              تم
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft dark:bg-primary/10">
                  <Radio size={16} className="text-primary dark:text-primary" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-main dark:text-main">بدء حصة مباشرة</h3>
                  <p className="mt-0.5 text-[10px] text-muted dark:text-muted">
                    اختر الطالب ثم ضع الرابط ليصل له وولي أمره
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface transition-colors hover:bg-hover dark:bg-hover dark:hover:bg-primary/5"
                aria-label="إغلاق"
              >
                <X size={16} className="text-muted dark:text-muted" />
              </button>
            </div>

            <div>
              <label
                htmlFor="start-live-student"
                className="mb-2 block text-xs font-bold text-muted dark:text-muted"
              >
                الطالب <span className="text-error">*</span>
              </label>
              <div className="flex gap-2">
                <select
                  id="start-live-student"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus dark:border-border dark:bg-surface"
                >
                  <option value="">— اختر الطالب —</option>
                  {loadingStudents && (
                    <option value="" disabled>
                      جاري تحميل الطلاب...
                    </option>
                  )}
                  {ownStudents.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              {!loadingStudents && ownStudents.length === 0 && (
                <p className="mt-1 flex items-center gap-1.5 text-[11px] font-bold text-muted dark:text-muted">
                  <Users size={12} />
                  لا يوجد طلاب مضافون لك حالياً.
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="start-live-subject"
                className="mb-2 block text-xs font-bold text-muted dark:text-muted"
              >
                المادة
              </label>
              <input
                id="start-live-subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="الرياضيات"
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus dark:border-border dark:bg-surface"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold text-muted dark:text-muted">
                نوع الاجتماع
              </label>
              <div className="flex gap-2">
                {PROVIDERS.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => setProvider(p.value)}
                    className={cn(
                      'flex-1 rounded-xl border-2 px-2 py-3 text-[11px] font-bold transition-all',
                      provider === p.value
                        ? 'border-primary bg-primary-soft text-primary dark:border-primary dark:bg-primary/10 dark:text-primary'
                        : 'border-border text-muted hover:border-primary/30 dark:border-border dark:text-muted dark:hover:border-primary/30',
                    )}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label
                htmlFor="start-live-meeting-url"
                className="mb-2 block text-xs font-bold text-muted dark:text-muted"
              >
                رابط الاجتماع <span className="text-error">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  id="start-live-meeting-url"
                  type="url"
                  value={meetingUrl}
                  onChange={(e) => setMeetingUrl(e.target.value)}
                  placeholder={
                    provider === 'google_meet'
                      ? 'https://meet.google.com/abc-defg-hij'
                      : provider === 'zoom'
                        ? 'https://zoom.us/j/1234567890'
                        : 'https://...'
                  }
                  className="flex-1 rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus dark:border-border dark:bg-surface"
                />
                {provider === 'google_meet' && (
                  <a
                    href="https://meet.google.com/new"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-success/10 border-success/20 hover:bg-success/20 flex items-center gap-1 whitespace-nowrap rounded-xl border px-3 py-3 text-[11px] font-bold text-success transition-colors"
                    title="إنشاء رابط Google Meet جديد"
                  >
                    <LinkIcon size={14} /> إنشاء
                  </a>
                )}
              </div>
            </div>

            {error && <p className="text-xs font-bold text-error">{error}</p>}

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={onClose}
                className="h-11 flex-1 rounded-xl text-xs font-bold"
              >
                إلغاء
              </Button>
              <Button
                onClick={handleStart}
                disabled={startMutation.isPending || !studentId || !meetingUrl.trim()}
                className="h-11 flex-1 gap-2 rounded-xl bg-primary text-xs font-bold text-on-primary dark:bg-primary dark:text-on-primary"
              >
                {startMutation.isPending ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> جاري...
                  </>
                ) : (
                  'بدء الحصة'
                )}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
