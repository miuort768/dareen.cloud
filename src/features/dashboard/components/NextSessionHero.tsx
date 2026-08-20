import { useState, useEffect } from 'react'
import { Clock, GraduationCap } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TimelineSession {
  id: string
  studentId?: string
  studentName: string
  time: string
  subject: string
  status: string
}

interface NextSessionHeroProps {
  timeline?: TimelineSession[]
}

const parseTime = (t?: string) => {
  const raw = String(t || '')
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
    .trim()
  const match = raw.match(/(\d{1,2})\s*[:.]?\s*(\d{0,2})/)
  if (!match) return { h: 0, m: 0 }
  let h = parseInt(match[1], 10) || 0
  const m = match[2] ? parseInt(match[2], 10) || 0 : 0
  const lower = raw.toLowerCase()
  if (lower.includes('pm') && h < 12) h += 12
  if (lower.includes('am') && h === 12) h = 0
  return { h: h % 24, m: m % 60 }
}

export const NextSessionHero = ({ timeline }: NextSessionHeroProps) => {
  const nextSession = timeline?.find((s) => s.status === 'scheduled' || s.status === 'in-progress')
  const [timeLeft, setTimeLeft] = useState('')
  const [isNow, setIsNow] = useState(false)

  useEffect(() => {
    if (!nextSession) return

    const updateTimer = () => {
      const { h: hours, m: minutes } = parseTime(nextSession.time)
      const now = new Date()
      const sessionTime = new Date()
      sessionTime.setHours(hours, minutes, 0)
      sessionTime.setSeconds(0)

      const diff = sessionTime.getTime() - now.getTime()

      if (diff <= 0) {
        setIsNow(true)
        setTimeLeft('00:00:00')
        return
      }

      setIsNow(false)
      const h = Math.floor(diff / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setTimeLeft(
        `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`,
      )
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [nextSession])

  if (!nextSession) return null

  return (
    <div className="relative overflow-hidden rounded-2xl bg-primary p-5 dark:bg-primary">
      <div className="pointer-events-none absolute start-0 top-0 h-48 w-48 rounded-full bg-white/5 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 end-0 h-32 w-32 rounded-full bg-white/5 blur-3xl" />

      <div className="relative z-10">
        <div className="mb-3 flex items-center gap-2">
          <div className="h-2 w-2 animate-pulse rounded-full bg-success" />
          <span className="dark:text-on-primary/70 text-micro font-bold text-white/70">
            الحصة القادمة
          </span>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="bg-on-primary/15 dark:bg-on-primary/15 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl">
            <GraduationCap size={24} className="text-white dark:text-on-primary" />
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="mb-0.5 text-lg font-bold leading-tight text-on-primary">
              {nextSession?.subject || ''}
            </h2>
            <p className="dark:text-on-primary/70 text-sm font-medium text-white/70">
              {nextSession?.studentName || ''}
            </p>
            {nextSession?.studentGrade && (
              <p className="dark:text-on-primary/60 text-[10px] font-medium text-white/60">
                Grade: {nextSession.studentGrade}
              </p>
            )}
            {nextSession?.curriculum && (
              <p className="dark:text-on-primary/60 text-[10px] font-medium text-white/60">
                {nextSession.curriculum}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-on-primary/15 dark:bg-on-primary/15 flex items-center gap-2 rounded-xl px-3 py-2">
              <Clock size={15} className="dark:text-on-primary/70 text-white/80" />
              <span className={cn('text-xl font-bold tabular-nums tracking-wider text-white')}>
                {isNow ? 'الآن' : timeLeft}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="dark:text-on-primary/60 text-sm font-medium text-white/60">
            {nextSession?.time || ''}
          </span>
        </div>
      </div>
    </div>
  )
}
