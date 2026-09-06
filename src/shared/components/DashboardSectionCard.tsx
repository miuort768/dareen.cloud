import React from 'react'
import { motion } from 'framer-motion'
import { fadeUp } from '../animations/fadeUp'
import { cn } from '../../lib/utils'

export interface DashboardSectionCardProps {
  children: React.ReactNode
  /** عنوان اختياري للقسم — يُعرض بنقطة لونية قبل العنوان */
  title?: string
  /** لون النقطة قبل العنوان (افتراضي primary) */
  tone?: string
  id?: string
  delay?: number
  className?: string
}

/**
 * بطاقة قسم موحدة للوحات — قسم هادلة بحدود وظل ناعم مع حركة دخول fadeUp.
 * تجمع نمط Surface (بطاقة + عنوان/لون) ونمط Desktop (حركة دخول متدرجة).
 */
export const DashboardSectionCard: React.FC<DashboardSectionCardProps> = ({
  children,
  title,
  tone = 'bg-primary',
  id,
  delay = 0,
  className,
}) => (
  <motion.section
    {...fadeUp(delay)}
    id={id}
    className={cn(
      'rounded-card border border-border bg-card p-5 shadow-elevation-1 transition-colors duration-slow',
      className,
    )}
  >
    {title && (
      <div className="mb-3 flex items-center gap-2">
        <span className={cn('h-1.5 w-1.5 rounded-full', tone)} aria-hidden="true" />
        <h2 className="text-sm font-black text-main">{title}</h2>
      </div>
    )}
    {children}
  </motion.section>
)

DashboardSectionCard.displayName = 'DashboardSectionCard'
