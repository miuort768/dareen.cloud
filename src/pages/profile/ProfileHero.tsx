import { ArrowRight, Share2, Edit3 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Avatar } from '../../shared/components/ui'
import { useCurrentUser, useShowNotification } from '../../context/AppContext'

interface ProfileHeroProps {
  name: string
  role: 'student' | 'teacher' | 'parent'
  subtitle?: string
  rank?: { name: string; icon: string }
}

const ROLE_CONFIG = {
  student: {
    label: 'طالب',
    gradient: 'from-primary/20 via-primary/5 to-transparent',
    dashboard: '/student-dashboard',
  },
  teacher: {
    label: 'معلم معتمد',
    gradient: 'from-info/20 via-info/5 to-transparent',
    dashboard: '/teacher-dashboard',
  },
  parent: {
    label: 'ولي أمر',
    gradient: 'from-warning/20 via-warning/5 to-transparent',
    dashboard: '/parent-dashboard',
  },
}

export const ProfileHero = ({ name, role, subtitle, rank }: ProfileHeroProps) => {
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

  return (
    <div className="from-primary/8 relative overflow-hidden rounded-b-3xl bg-gradient-to-b via-background to-background">
      {/* Decorative background circles */}
      <div className="absolute -end-20 -top-20 h-40 w-40 rounded-full bg-primary/5 blur-3xl" />
      <div className="bg-info/5 absolute -start-10 -top-10 h-32 w-32 rounded-full blur-3xl" />

      <div className="relative px-5 pb-6 pt-4">
        {/* Top bar */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate(config.dashboard)}
            className="bg-card/80 border-border/50 inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-[11px] font-bold text-muted backdrop-blur-sm transition-all active:scale-95"
          >
            <ArrowRight size={12} />
            العودة
          </button>
          <div className="flex items-center gap-2">
            {canAccessSettings && (
              <button
                onClick={() => navigate('/settings')}
                className="bg-card/80 border-border/50 flex h-8 w-8 items-center justify-center rounded-xl border backdrop-blur-sm transition-all active:scale-95"
              >
                <Edit3 size={13} className="text-muted" />
              </button>
            )}
            <button
              onClick={handleShare}
              className="bg-card/80 border-border/50 flex h-8 w-8 items-center justify-center rounded-xl border backdrop-blur-sm transition-all active:scale-95"
            >
              <Share2 size={13} className="text-muted" />
            </button>
          </div>
        </div>

        {/* Avatar + Info */}
        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            <Avatar name={name} size="xl" />
            <div className="absolute -bottom-0.5 -end-0.5 h-4 w-4 rounded-full border-2 border-background bg-success">
              <div className="h-full w-full animate-ping rounded-full bg-success opacity-50" />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center gap-2">
              <span className="rounded-lg bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                {config.label}
              </span>
              <span className="bg-success/10 inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold text-success">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" />
                متصل
              </span>
            </div>
            <h1 className="mb-0.5 truncate text-lg font-bold leading-tight text-main">{name}</h1>
            <div className="flex flex-wrap items-center gap-2">
              {subtitle && (
                <span className="truncate text-[11px] font-medium text-muted">{subtitle}</span>
              )}
              {rank && (
                <span className="bg-warning/10 inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold text-warning">
                  {rank.icon} {rank.name}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
