import { memo } from 'react'
import type { ActivityItem as ServiceItem } from '../../services/executiveService'
import {
  History,
  TrendingUp,
  UserPlus,
  CreditCard,
  Edit3,
  Trash2,
  GraduationCap,
  Lock,
  Clock,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const ICON_MAP: Record<string, typeof History> = {
  person_add: UserPlus,
  payment: CreditCard,
  edit: Edit3,
  delete: Trash2,
  school: GraduationCap,
  lock: Lock,
  trending_up: TrendingUp,
}

const VARIANT_CONFIG: Record<string, { bg: string; text: string }> = {
  user: { bg: 'bg-info-soft', text: 'text-info' },
  session: { bg: 'bg-success-soft', text: 'text-success' },
  payment: { bg: 'bg-warning-soft', text: 'text-warning' },
  system: { bg: 'bg-surface', text: 'text-muted' },
}

export const ActivityFeed = memo(function ActivityFeed({ items }: { items: ServiceItem[] }) {
  if (!items) return null

  return (
    <div className="rounded-2xl border border-border bg-card p-5 font-dash" dir="rtl">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-soft">
          <History size={16} className="text-primary" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-main">النشاطات</h3>
          <p className="text-[10px] text-muted">آخر العمليات</p>
        </div>
      </div>

      <div className="custom-scrollbar max-h-[280px] space-y-1.5 overflow-y-auto">
        {items.length === 0 && (
          <div className="py-8 text-center">
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-surface">
              <History size={16} className="text-dim" />
            </div>
            <p className="text-xs font-bold text-muted">لا توجد نشاطات</p>
          </div>
        )}
        {items.map((item) => {
          const Icon = ICON_MAP[item.icon] || History
          const v = VARIANT_CONFIG[item.group] || VARIANT_CONFIG.system || { bg: '', text: '' }

          return (
            <div
              key={item.id}
              className="flex items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-surface"
            >
              <div
                className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', v.bg)}
              >
                <Icon size={13} className={v.text} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[11px] font-bold text-main">
                  <span className="text-primary">{item.username}</span> {item.action}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Clock size={9} className="text-muted" />
                <span className="text-[9px] tabular-nums text-muted">{item.timestamp}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
})
