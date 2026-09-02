import type { Student } from '../../types'
import { cn } from '../../lib/utils'

interface ChildSwitcherProps {
  children: Student[]
  selectedId: string | null
  onSelect: (id: string) => void
}

const AVATAR_TONES = [
  'bg-primary text-on-primary',
  'bg-success text-on-success',
  'bg-info text-on-info',
  'bg-accent text-on-accent',
  'bg-error text-on-error',
]

export const ChildSwitcher = ({ children: kids, selectedId, onSelect }: ChildSwitcherProps) => {
  if (kids.length === 0) return null

  return (
    <div
      role="tablist"
      aria-label="اختيار الابن"
      className="no-scrollbar flex gap-2 overflow-x-auto py-0.5"
    >
      {kids.map((child, idx) => {
        const active = child.id === selectedId
        const tone = AVATAR_TONES[idx % AVATAR_TONES.length]
        return (
          <button
            key={child.id}
            role="tab"
            aria-selected={active}
            onClick={() => onSelect(child.id)}
            className={cn(
              'inline-flex shrink-0 items-center gap-2 rounded-none border px-3 py-2 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.97]',
              active
                ? 'border-primary bg-primary shadow-sm'
                : 'border-border bg-surface hover:bg-hover',
            )}
          >
            <span
              className={cn(
                'flex h-7 w-7 shrink-0 items-center justify-center rounded-none text-xs font-black',
                active ? 'bg-on-primary/20 text-on-primary' : tone,
              )}
              aria-hidden="true"
            >
              {(child.name || 'ط').charAt(0)}
            </span>
            <span className="min-w-0">
              <span
                className={cn(
                  'block max-w-28 truncate text-xs font-bold',
                  active ? 'text-on-primary' : 'text-main',
                )}
              >
                {child.name}
              </span>
              {child.grade && (
                <span
                  className={cn(
                    'block max-w-28 truncate text-[9px] font-bold',
                    active ? 'text-on-primary/70' : 'text-muted',
                  )}
                >
                  {child.grade}
                </span>
              )}
            </span>
          </button>
        )
      })}
    </div>
  )
}
