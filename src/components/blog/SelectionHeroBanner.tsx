import type { ReactNode } from 'react'
import { ArrowLeft, MessageCircle } from 'lucide-react'
import { cn } from '../../lib/utils'

export interface SelectionStep {
  label: string
  state: 'done' | 'current'
}

interface SelectionHeroBannerProps {
  steps: SelectionStep[]
  title: ReactNode
  description: string
  whatsappNumber: string
  className?: string
}

/**
 * Shared banner for the library selection steps (curriculum / level / language).
 * Single source for the internal element order so the mobile and desktop
 * surfaces cannot drift apart. Mobile keeps the solid gradient card; desktop
 * switches to an open, edge-free layout (no solid rectangle) with a soft
 * fading tint and a hairline divider.
 */
export function SelectionHeroBanner({
  steps,
  title,
  description,
  whatsappNumber,
  className,
}: SelectionHeroBannerProps) {
  return (
    <section
      className={cn(
        'relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-deep via-primary to-primary-deep shadow-elevation-1 lg:rounded-none lg:border-b lg:border-divider lg:bg-none lg:shadow-none',
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -end-20 -top-24 h-56 w-56 rounded-full border border-white/10 sm:h-72 sm:w-72 lg:hidden" />
        <div className="absolute -bottom-28 start-[-10%] h-56 w-56 rounded-full bg-accent-soft opacity-30 blur-[80px] lg:hidden" />
        <div className="absolute inset-x-0 top-0 hidden h-2/3 bg-gradient-to-b from-primary-soft to-transparent lg:block" />
      </div>

      <div className="relative p-4 sm:p-5 lg:px-0 lg:py-8">
        <div className="min-w-0">
          <ol className="flex flex-wrap items-center gap-1.5" aria-label="مسار الاختيار">
            {steps.map((step, i) => (
              <li key={`${step.label}-${i}`} className="flex items-center gap-1.5">
                {i > 0 && (
                  <ArrowLeft
                    size={11}
                    className="shrink-0 text-white/40 lg:text-dim"
                    aria-hidden="true"
                  />
                )}
                <span
                  aria-current={step.state === 'current' ? 'step' : undefined}
                  className={cn(
                    'max-w-[45vw] truncate rounded-full px-2.5 py-1 text-[10px] font-extrabold backdrop-blur-sm sm:text-[11px] lg:backdrop-blur-none',
                    step.state === 'current'
                      ? 'bg-accent text-on-accent'
                      : 'border border-white/15 bg-white/10 text-white/75 lg:border-border lg:bg-card lg:text-muted',
                  )}
                >
                  {step.label}
                </span>
              </li>
            ))}
          </ol>

          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-6 lg:mt-5">
            <div className="min-w-0">
              {/* h1: both hero surfaces stay mounted and CSS decides which one is
                  exposed (md:hidden / hidden md:block), so the selection views keep
                  exactly one h1 per rendered viewport. On desktop the open layout
                  flips the title to the page foreground and re-tints its accent word. */}
              <h1 className="font-heading text-xl font-black leading-tight text-on-primary sm:text-2xl lg:text-4xl lg:text-main lg:[&_span]:text-primary">
                {title}
              </h1>
              <p className="mt-1 max-w-xl text-[11px] font-bold leading-relaxed text-white/75 sm:text-xs lg:max-w-2xl lg:text-sm lg:text-muted">
                {description}
              </p>
            </div>

            <a
              href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('السلام عليكم، أرغب في حجز حصة تجريبية مجانية')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-[11px] font-extrabold text-on-accent shadow-[0_4px_20px_rgba(212,175,55,0.3)] transition-all hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 active:scale-[0.97] sm:min-h-11 sm:w-auto sm:px-6 sm:text-xs lg:rounded-2xl"
            >
              <MessageCircle size={14} />
              طلب حصة مجانية
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
