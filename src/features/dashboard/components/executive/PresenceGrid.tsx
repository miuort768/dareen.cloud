import { memo } from 'react'
import type { PresenceUser } from '../../services/executiveService'
import { Users } from 'lucide-react'
import { cn } from '@/lib/utils'

const STATUS_BG: Record<string, string> = {
  online: 'bg-success-soft',
  away: 'bg-warning-soft',
  offline: 'bg-surface',
}

const STATUS_TEXT: Record<string, string> = {
  online: 'text-success',
  away: 'text-warning',
  offline: 'text-muted',
}

const ROLE_LABELS: Record<string, string> = {
  admin: 'مدير',
  teacher: 'معلم',
  parent: 'ولي أمر',
  student: 'طالب',
}

function getInitials(name: string): string {
  return (name || '?').charAt(0).toUpperCase()
}

export const PresenceGrid = memo(function PresenceGrid({
  users,
  total,
}: {
  users: PresenceUser[]
  total: number
}) {
  if (!users) return null
  const onlineCount = users.filter((u) => u.status === 'online').length

  return (
    <div className="border-success-soft/60 rounded-2xl border bg-card p-5 font-dash" dir="rtl">
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

      <div className="custom-scrollbar grid max-h-[320px] grid-cols-1 gap-1 overflow-y-auto sm:grid-cols-2">
        {users.length === 0 && (
          <div className="py-8 text-center">
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-surface">
              <Users size={16} className="text-dim" />
            </div>
            <p className="text-xs font-bold text-muted">لا يوجد متصلين</p>
          </div>
        )}
        {users.map((user) => {
          const initials = getInitials(user.name)
          return (
            <div
              key={user.userId}
              className="flex items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-surface"
            >
              <div className="relative shrink-0">
                <div
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold',
                    STATUS_BG[user.status] || 'bg-surface',
                    STATUS_TEXT[user.status] || 'text-muted',
                  )}
                >
                  {initials}
                </div>
                {user.status === 'online' && (
                  <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card bg-success">
                    <span className="absolute inset-0 animate-ping rounded-full bg-success opacity-40" />
                  </span>
                )}
                {user.status === 'away' && (
                  <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card bg-warning" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[11px] font-bold text-main">{user.name || 'مستخدم'}</p>
                <p className="text-[10px] text-muted">
                  {ROLE_LABELS[user.role] || user.role}
                  {user.teachingSubject && ` · ${user.teachingSubject}`}
                </p>
              </div>
              {user.status === 'offline' && user.secondsAgo < 3600 && (
                <span className="whitespace-nowrap text-[9px] tabular-nums text-muted">
                  منذ{' '}
                  {user.secondsAgo < 60
                    ? `${user.secondsAgo}ث`
                    : `${Math.round(user.secondsAgo / 60)}د`}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
})
