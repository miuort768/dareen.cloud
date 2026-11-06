import { memo } from 'react'
import type { PresenceUser } from '../../services/executiveService'
import { Users, GraduationCap, BookOpen, User, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'

const ROLE_TILES: {
  role: string
  label: string
  sublabel: string
  icon: typeof Users
  iconBg: string
  iconText: string
}[] = [
  {
    role: 'student',
    label: 'الطلاب',
    sublabel: 'نشطون بالدروس',
    icon: GraduationCap,
    iconBg: 'bg-primary-soft',
    iconText: 'text-primary',
  },
  {
    role: 'teacher',
    label: 'المعلمون',
    sublabel: 'في الحصص الحالية',
    icon: BookOpen,
    iconBg: 'bg-info-soft',
    iconText: 'text-info',
  },
  {
    role: 'parent',
    label: 'أولياء الأمور',
    sublabel: 'يتابعون التقرير',
    icon: User,
    iconBg: 'bg-success-soft',
    iconText: 'text-success',
  },
  {
    role: 'admin',
    label: 'الإدارة',
    sublabel: 'فريق المتابعة',
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
    <div
      className="rounded-[24px] border border-border bg-card p-4 font-dash shadow-elevation-1 sm:p-5"
      dir="rtl"
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-success-soft shadow-soft">
            <Users size={16} className="text-success" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-main">المتصلون بالمنصة الآن</h3>
            <p className="text-[10px] text-muted">حضور تفاعلي لحظي لجميع المستخدمين</p>
          </div>
        </div>
        <div className="border-success/30 flex items-center gap-2 rounded-full border bg-success-soft px-3 py-1 shadow-soft">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
          </span>
          <span className="text-xs font-semibold tabular-nums text-success">
            {onlineCount} من {total} متصل
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
              className="border-border/70 bg-surface/40 group flex flex-col items-center gap-2 rounded-2xl border p-4 transition-all duration-normal hover:-translate-y-0.5 hover:border-border hover:bg-card hover:shadow-soft"
            >
              <span
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-xl shadow-soft transition-transform duration-normal group-hover:scale-110',
                  tile.iconBg,
                  tile.iconText,
                )}
              >
                <Icon size={17} strokeWidth={2} />
              </span>
              <span
                className={cn(
                  'font-dash text-2xl font-bold tabular-nums leading-none tracking-tight',
                  count > 0 ? 'text-main' : 'text-dim',
                )}
              >
                {count}
              </span>
              <div className="text-center">
                <span className="block text-xs font-semibold text-main">{tile.label}</span>
                <span className="block text-[10px] text-muted">{tile.sublabel}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
})
