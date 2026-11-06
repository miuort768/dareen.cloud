import React from 'react'
import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import { cn } from '../../lib/utils'

interface GradientHeroCardProps {
  icon?: LucideIcon
  iconClassName?: string
  title: string
  subtitle?: string
  /** محتوى يوضع بعد الفاصل العمودي (إحصاءات، بحث...) */
  end?: React.ReactNode
  /** طبقة ديكور تُرسم داخل التدرج قبل المحتوى */
  decor?: React.ReactNode
  className?: string
}

/**
 * ترويسة متدرجة موحدة وفخمة لصفحات السياق (الحضور، المواعيد، الفواتير، الدفعات...)
 * تصميم Double-Bezel بإضاءة محيطية دقيقة ولمسات زجاجية عصرية.
 */
export const GradientHeroCard = ({
  icon: Icon,
  iconClassName,
  title,
  subtitle,
  end,
  decor,
  className,
}: GradientHeroCardProps) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className={cn(
      'to-primary-deep/40 group relative rounded-[28px] bg-gradient-to-br from-white/20 via-primary/30 p-1 shadow-elevation-2 transition-all duration-normal hover:shadow-elevation-3 sm:p-1.5',
      className,
    )}
  >
    <div className="relative overflow-hidden rounded-[24px] border border-white/20 bg-gradient-to-br from-primary via-primary-active to-primary-deep p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.25)] md:p-7">
      <div className="pointer-events-none absolute -end-16 -top-20 h-56 w-56 rounded-full bg-white/15 blur-3xl transition-opacity duration-slow group-hover:opacity-80" />
      <div className="bg-accent/20 pointer-events-none absolute -bottom-20 -start-16 h-48 w-48 rounded-full blur-3xl transition-opacity duration-slow group-hover:opacity-80" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(255,255,255,0.18),rgba(255,255,255,0))] opacity-80" />
      {decor}

      <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-6">
        <div className="flex items-center gap-4">
          {Icon && (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/15 shadow-elevation-2 backdrop-blur-md">
              <Icon size={22} className={cn('text-on-primary', iconClassName)} />
            </div>
          )}
          <div>
            <h1 className="font-heading text-xl font-bold leading-tight tracking-tight text-on-primary md:text-2xl">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-1 text-xs font-normal text-white/90 md:text-sm">{subtitle}</p>
            )}
          </div>
        </div>

        {end && (
          <>
            <div className="hidden h-12 w-px bg-white/20 lg:block" />
            <div className="w-full lg:w-auto">{end}</div>
          </>
        )}
      </div>
    </div>
  </motion.div>
)

GradientHeroCard.displayName = 'GradientHeroCard'
