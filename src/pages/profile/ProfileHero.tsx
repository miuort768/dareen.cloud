import { ArrowRight, Share2, Edit3, Target, Calendar, User, BookOpen } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Avatar } from '../../shared/components/ui'
import { useCurrentUser, useShowNotification } from '../../context/AppContext'

interface ProfileHeroProps {
  name: string
  role: 'student' | 'teacher' | 'parent'
  subtitle?: string
  rank?: { name: string; icon: string }
  points?: number
  attendanceRate?: number
  stats?: { attendanceRate?: number; studentsCount?: number; [key: string]: any }
  hideNavButtons?: boolean
  onEditName?: () => void
}

const ROLE_CONFIG = {
  student: {
    label: 'طالب',
    dashboard: '/student-dashboard',
  },
  teacher: {
    label: 'معلم معتمد',
    dashboard: '/teacher-dashboard',
  },
  parent: {
    label: 'ولي أمر',
    dashboard: '/parent-dashboard',
  },
}

export const ProfileHero = ({ name, role, subtitle, rank, points, attendanceRate, stats, hideNavButtons = false, onEditName }: ProfileHeroProps) => {
  const navigate = useNavigate()
  const config = ROLE_CONFIG[role]
  const currentUser = useCurrentUser()
  const showNotification = useShowNotification()

  const canAccessSettings =
    !!currentUser &&
    (currentUser.permissions?.includes('*') || currentUser.permissions?.includes('settings'))

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: document.title, url: window.location.href })
        return
      } catch (e) {
        if ((e as Error)?.name === 'AbortError') return
      }
    }
    try {
      await navigator.clipboard.writeText(window.location.href)
      showNotification('تم نسخ رابط الملف الشخصي', 'success')
    } catch {
      showNotification('تعذر نسخ الرابط', 'error')
    }
  }

  // Derive a progress metric to show in the circle
  const progressValue = attendanceRate !== undefined ? attendanceRate : stats?.attendanceRate || 0
  const showProgress = progressValue > 0 || role === 'teacher' || role === 'student'

  const radius = 54
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (progressValue / 100) * circumference

  return (
    <div className="relative overflow-hidden rounded-b-[2.5rem] border-b border-x border-border/70 bg-card p-6 shadow-elevation-1 transition-all duration-300 md:p-8" dir="rtl">
      <div className="pointer-events-none absolute -end-24 -top-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -start-24 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />

      {/* Top bar */}
      <div className="relative z-10 mb-8 flex items-center justify-between">
        {!hideNavButtons && (
          <button
            onClick={() => navigate(config.dashboard)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-4 py-2 text-xs font-bold text-muted transition-all hover:bg-hover active:scale-95"
          >
            <ArrowRight size={14} />
            لوحة التحكم
          </button>
        )}
        <div className="flex items-center gap-2">
          {onEditName && (
            <button
              onClick={onEditName}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-surface transition-all hover:bg-hover active:scale-95"
              aria-label="تعديل الاسم"
              title="تعديل الاسم"
            >
              <Edit3 size={14} className="text-muted" />
            </button>
          )}
          {!hideNavButtons && canAccessSettings && (
            <button
              onClick={() => navigate('/settings')}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-surface transition-all hover:bg-hover active:scale-95"
            >
              <Edit3 size={14} className="text-muted" />
            </button>
          )}
          {!hideNavButtons && (
            <button
              onClick={handleShare}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-surface transition-all hover:bg-hover active:scale-95"
            >
              <Share2 size={14} className="text-muted" />
            </button>
          )}
        </div>
      </div>

      <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-5">
          <div className="relative shrink-0">
            <Avatar name={name} size="xl" />
            <div className="absolute -bottom-1 -end-1 h-5 w-5 rounded-full border-[3px] border-card bg-success">
              <div className="h-full w-full animate-ping rounded-full bg-success opacity-50" />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold text-primary">
                <User size={12} />
                {config.label}
              </span>
              {rank && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-warning/10 px-3 py-1 text-[11px] font-bold text-warning">
                  {rank.icon} {rank.name}
                </span>
              )}
            </div>
            
            <h1 className="mb-1.5 truncate text-2xl font-black leading-tight text-main md:text-3xl">{name}</h1>
            
            {subtitle && (
              <p className="text-sm font-bold text-muted flex items-center gap-1.5">
                <BookOpen size={14} />
                {subtitle}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col items-center gap-5 sm:flex-row sm:justify-end">
          {showProgress && (
            <div className="relative shrink-0">
              <svg className="h-[100px] w-[100px] -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r={radius} fill="none" stroke="currentColor" className="text-border/50" strokeWidth="8" />
                <circle cx="60" cy="60" r={radius} fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} className="text-primary transition-all duration-1000 ease-out" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-black text-main tabular-nums">{progressValue}%</span>
                <span className="text-[9px] font-bold text-muted">الالتزام</span>
              </div>
            </div>
          )}

          {points !== undefined && (
            <div className="flex items-center gap-2.5 rounded-2xl border border-border bg-surface px-5 py-3 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/10 text-warning">
                <Target size={18} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-muted">النقاط</p>
                <p className="text-lg font-black text-main tabular-nums">{points}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
