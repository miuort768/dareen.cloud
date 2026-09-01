import { useEffect, useState } from 'react'
import { Radio, ShieldCheck } from 'lucide-react'

export interface StudentActiveSession {
  id: string
  studentId: string
  teacherName?: string
  subject: string
  startedAt: string
}

interface LiveSessionBannerProps {
  session: StudentActiveSession | null
}

/** بانر "حصتك جارية الآن" — مؤقت مباشر + اسم المعلمة والمادة (للطالب) */
export const LiveSessionBanner = ({ session }: LiveSessionBannerProps) => {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (!session?.startedAt) return
    const start = new Date(session.startedAt).getTime()
    const compute = () => setElapsed(Math.max(0, Math.floor((Date.now() - start) / 1000)))
    compute()
    const t = setInterval(compute, 1000)
    return () => clearInterval(t)
  }, [session?.startedAt])

  if (!session) return null

  const mm = Math.floor(elapsed / 60)
  const ss = elapsed % 60
  const time = `${mm}:${ss.toString().padStart(2, '0')}`

  return (
    <div
      className="border-error/40 relative overflow-hidden rounded-none border bg-error-soft shadow-sm transition-colors duration-300"
      role="status"
      aria-label="حصة جارية الآن"
    >
      <div
        className="bg-error/10 pointer-events-none absolute -end-10 -top-10 h-32 w-32 rounded-full blur-2xl"
        aria-hidden="true"
      />
      <div className="relative flex items-center justify-between gap-3 p-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-none bg-card shadow-sm">
            <Radio size={18} className="text-error" />
            <span
              className="border-error/40 absolute inset-0 animate-ping rounded-none border-2"
              aria-hidden="true"
            />
          </div>
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-xs font-black text-main">
              <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-error" />
              حصتك جارية الآن
            </p>
            <p className="mt-0.5 truncate text-[11px] font-bold text-muted">{session.subject}</p>
            <p className="mt-0.5 flex items-center gap-1 truncate text-[11px] font-bold text-error">
              <ShieldCheck size={10} className="shrink-0" />
              المعلمة: {session.teacherName || 'غير محددة'}
            </p>
          </div>
        </div>
        <div
          className="shrink-0 rounded-none bg-card px-3 py-2 text-center shadow-sm"
          aria-live="off"
        >
          <p className="font-mono text-xl font-black tabular-nums leading-none tracking-widest text-error">
            {time}
          </p>
          <p className="mt-1 text-[9px] font-bold uppercase text-muted">مدة الحصة</p>
        </div>
      </div>
    </div>
  )
}
