import type { ReactNode } from 'react'
import { ArrowLeft, MessageCircle } from 'lucide-react'
import { cn } from '../../lib/utils'

export interface SelectionStep {
  label: string
  state: 'done' | 'current'
}

export interface SelectionStat {
  value: string
  label: string
}

interface SelectionHeroBannerProps {
  steps: SelectionStep[]
  title: ReactNode
  description: string
  whatsappNumber: string
  stats?: SelectionStat[]
  className?: string
}

/**
 * Shared banner for the library selection steps (curriculum / level / language).
 * Single source for the internal element order so the mobile and desktop
 * surfaces cannot drift apart. On desktop it splits into two columns: the copy
 * on the start side and an optional decorative + stats panel on the end side.
 */
export function SelectionHeroBanner({
  steps,
  title,
  description,
  whatsappNumber,
  stats,
  className,
}: SelectionHeroBannerProps) {
  const hasStats = !!stats && stats.length > 0
  return (
    <section
      className={cn(
        'relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-deep via-primary to-primary-deep shadow-elevation-1 lg:rounded-none',
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -end-20 -top-24 h-56 w-56 rounded-full border border-white/10 sm:h-72 sm:w-72" />
        <div className="absolute -bottom-28 start-[-10%] h-56 w-56 rounded-full bg-accent-soft opacity-30 blur-[80px]" />
      </div>

      <div className="relative p-4 sm:p-5 lg:grid lg:grid-cols-[1fr_20rem] lg:items-center lg:gap-8 lg:p-7">
        <div className="min-w-0">
          <ol className="flex flex-wrap items-center gap-1.5" aria-label="مسار الاختيار">
            {steps.map((step, i) => (
              <li key={`${step.label}-${i}`} className="flex items-center gap-1.5">
                {i > 0 && (
                  <ArrowLeft size={11} className="shrink-0 text-white/40" aria-hidden="true" />
                )}
                <span
                  aria-current={step.state === 'current' ? 'step' : undefined}
                  className={cn(
                    'max-w-[45vw] truncate rounded-full px-2.5 py-1 text-[10px] font-extrabold backdrop-blur-sm sm:text-[11px]',
                    step.state === 'current'
                      ? 'bg-accent text-on-accent'
                      : 'border border-white/15 bg-white/10 text-white/75',
                  )}
                >
                  {step.label}
                </span>
              </li>
            ))}
          </ol>

          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-6 lg:mt-4">
            <div className="min-w-0">
              {/* h1: both hero surfaces stay mounted and CSS decides which one is
                  exposed (md:hidden / hidden md:block), so the selection views keep
                  exactly one h1 per rendered viewport. */}
              <h1 className="font-heading text-xl font-black leading-tight text-on-primary sm:text-2xl lg:text-3xl">
                {title}
              </h1>
              <p className="mt-1 max-w-xl text-[11px] font-bold leading-relaxed text-white/75 sm:text-xs lg:text-sm">
                {description}
              </p>
            </div>

            <a
              href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('السلام عليكم، أرغب في حجز حصة تجريبية مجانية')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-[11px] font-extrabold text-on-accent shadow-[0_4px_20px_rgba(212,175,55,0.3)] transition-all hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 active:scale-[0.97] sm:min-h-11 sm:w-auto sm:px-6 sm:text-xs"
            >
              <MessageCircle size={14} />
              طلب حصة مجانية
            </a>
          </div>
        </div>

        {hasStats && (
          <div className="relative mt-4 hidden overflow-hidden rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm lg:mt-0 lg:flex lg:flex-col lg:justify-center">
            <div
              className="pointer-events-none absolute -end-10 -top-12 h-32 w-32 rounded-full border border-white/10"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute -bottom-14 -start-8 h-36 w-36 rounded-full bg-accent-soft opacity-25 blur-[50px]"
              aria-hidden="true"
            />
            <div
              className={cn(
                'relative grid gap-3',
                stats.length > 1 ? 'grid-cols-2' : 'grid-cols-1',
              )}
            >
              {stats.map((stat, i) => (
                <div
                  key={`${stat.label}-${i}`}
                  className="rounded-xl border border-white/10 bg-white/10 px-3 py-3 text-center"
                >
                  <span className="block font-dash text-2xl font-black text-on-primary">
                    {stat.value}
                  </span>
                  <span className="mt-0.5 block text-[11px] font-bold text-white/75">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
