import { memo } from 'react'
import type { PresenceUser } from '../../services/executiveService'
import { Users, GraduationCap, BookOpen, User, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'

const ROLE_TILES: {
  role: string
  label: string
  icon: typeof Users
  iconBg: string
  iconText: string
}[] = [
  {
    role: 'student',
    label: 'طالب',
    icon: GraduationCap,
    iconBg: 'bg-primary-soft',
    iconText: 'text-primary',
  },
  {
    role: 'teacher',
    label: 'معلم',
    icon: BookOpen,
    iconBg: 'bg-info-soft',
    iconText: 'text-info',
  },
  {
    role: 'parent',
    label: 'ولي أمر',
    icon: User,
    iconBg: 'bg-success-soft',
    iconText: 'text-success',
  },
  {
    role: 'admin',
    label: 'مدير',
    icon: Shield,
    iconBg: 'bg-accent-soft',
    iconText: 'text-accent',
  },
]

export const PresenceGrid = memo(function PresenceGrid({
  users,
  total,
}: {
  users: PresenceUser[]
  total: number
}) {
  if (!users) return null

  const onlineUsers = users.filter((u) => u.status === 'online')
  const onlineCount = onlineUsers.length

  const onlineByRole: Record<string, number> = {}
  onlineUsers.forEach((u) => {
    onlineByRole[u.role] = (onlineByRole[u.role] || 0) + 1
  })

  return (
    <div className="rounded-none border border-border bg-card p-5 font-dash" dir="rtl">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-success-soft">
            <Users size={16} className="text-success" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-main">الحضور المباشر</h3>
            <p className="text-[10px] text-muted">المتصلون الآن</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 rounded-lg border border-border bg-success-soft px-2 py-0.5">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" />
          <span className="text-[10px] font-bold tabular-nums text-success">
            {onlineCount}/{total}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {ROLE_TILES.map((tile) => {
          const Icon = tile.icon
          const count = onlineByRole[tile.role] || 0
          return (
            <div
              key={tile.role}
              className="flex flex-col items-center gap-1.5 rounded-xl border border-border bg-surface p-3"
            >
              <span
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-lg',
                  tile.iconBg,
                  tile.iconText,
                )}
              >
                <Icon size={15} />
              </span>
              <span
                className={cn(
                  'text-xl font-black tabular-nums leading-none',
                  count > 0 ? 'text-main' : 'text-dim',
                )}
              >
                {count}
              </span>
              <span className="text-[10px] font-bold text-muted">{tile.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
})
