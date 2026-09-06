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
 * ترويسة متدرجة موحدة لصفحات السياق (الحضور، المواعيد، الجداول، المنتدى...).
 * هوية (أيقونة + عنوان + وصف) + فاصل عمودي + فتحة end للإحصاءات/البحث.
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
      'relative overflow-hidden rounded-card bg-gradient-to-br from-primary via-primary-deep to-primary-hover p-5 shadow-elevation-2 md:p-6',
      className,
    )}
  >
    <div className="pointer-events-none absolute -end-16 -top-20 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
    <div className="pointer-events-none absolute -bottom-20 -start-16 h-48 w-48 rounded-full bg-black/10 blur-3xl" />
    {decor}

    <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-6">
      <div className="flex items-center gap-4">
        {Icon && (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 shadow-elevation-3 backdrop-blur-sm">
            <Icon size={22} className={cn('text-on-primary', iconClassName)} />
          </div>
        )}
        <div>
          <h1 className="text-xl font-black leading-tight text-on-primary">{title}</h1>
          {subtitle && <p className="text-xs text-white/90">{subtitle}</p>}
        </div>
      </div>

      {end && (
        <>
          <div className="hidden h-12 w-px bg-white/20 lg:block" />
          {end}
        </>
      )}
    </div>
  </motion.div>
)

GradientHeroCard.displayName = 'GradientHeroCard'
