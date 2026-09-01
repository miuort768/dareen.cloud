import { useState, useEffect } from 'react'
import { Clock, GraduationCap } from 'lucide-react'

interface TimelineSession {
  id: string
  studentId?: string
  studentName: string
  time: string
  subject: string
  status: string
  studentGrade?: string
  curriculum?: string
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
  let h = (match[1] ? parseInt(match[1], 10) : 0) || 0
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
    <div className="relative h-full overflow-hidden rounded-3xl bg-primary p-5 shadow-lg shadow-primary/25 sm:p-6">
      <div className="relative z-10">
        <div className="mb-4 flex items-center gap-2">
          <div className="h-2 w-2 animate-pulse rounded-full bg-success" />
          <span className="text-micro font-bold text-on-primary opacity-80">الحصة القادمة</span>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
            <GraduationCap size={26} className="text-on-primary" />
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="mb-0.5 truncate text-lg font-black leading-tight text-on-primary md:text-xl">
              {nextSession?.subject || ''}
            </h2>
            <p className="truncate text-sm font-bold text-on-primary opacity-80">
              {nextSession?.studentName || ''}
            </p>
            {nextSession?.studentGrade && (
              <p className="text-[10px] font-bold text-on-primary opacity-65">
                الصف: {nextSession.studentGrade}
              </p>
            )}
            {nextSession?.curriculum && (
              <p className="truncate text-[10px] font-bold text-on-primary opacity-65">
                {nextSession.curriculum}
              </p>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-2 rounded-2xl bg-white/15 px-3.5 py-2.5 backdrop-blur-sm">
            <Clock size={15} className="text-on-primary opacity-80" />
            <span className="text-xl font-black tabular-nums tracking-wider text-on-primary">
              {isNow ? 'الآن' : timeLeft}
            </span>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-white/15 pt-3">
          <span className="flex items-center gap-1.5 text-sm font-bold text-on-primary opacity-75">
            <Clock size={13} />
            {nextSession?.time || ''}
          </span>
          {isNow && (
            <span className="rounded-lg bg-white/20 px-2.5 py-1 text-[10px] font-black text-on-primary">
              جارية الآن
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
