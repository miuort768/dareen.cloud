import React from 'react'
import { motion } from 'framer-motion'
import { fadeUp } from '../animations/fadeUp'
import { cn } from '../../lib/utils'

export interface SectionCardProps {
  children: React.ReactNode
  className?: string
  id?: string
  /** حركة دخول fadeUp — تُفعَّل في بطاقات اللوحات وصفحات الحسابات */
  animated?: boolean
  delay?: number
  /** نوع حركة الدخول — fadeUp (لوحات المعلمة، 16px) أو soft (صفحات الحسابات، 14px) */
  entrance?: 'fadeUp' | 'soft'
  /** نمط محدد البطاقة (افتراضي border-border) */
  border?: 'border' | 'divider'
  /** الحشوة الداخلية (افتراضي none — يحددها المُستدعي) */
  padding?: 'none' | 'sm' | 'base' | 'md'
  /** الظل (افتراضي none) */
  shadow?: 'none' | 'soft' | 'elevation-1'
  /** رفع الظل عند المرور */
  hover?: boolean
  /** نوع الانتقال (افتراضي none) */
  transition?: 'none' | 'all' | 'colors'
  /** تطبيق --duration-slow مع الانتقال */
  slow?: boolean
  /** قصّ المحتوى داخل الحواف (الجداول/الرسوم) */
  overflowHidden?: boolean
  /** عنوان القسم */
  title?: string
  /** لون النقطة قبل العنوان (نمط لوحات المعلمة، افتراضي primary) */
  titleTone?: string
  /** أيقونة جاهزة (رقاقة ملونة) — نمط صفحات الحسابات */
  icon?: React.ReactNode
  description?: React.ReactNode
  descClassName?: string
  action?: React.ReactNode
}

const PADDING: Record<NonNullable<SectionCardProps['padding']>, string> = {
  none: '',
  sm: 'p-4 md:p-5',
  base: 'p-5',
  md: 'p-5 md:p-6',
}

const SHADOW: Record<NonNullable<SectionCardProps['shadow']>, string> = {
  none: '',
  soft: 'shadow-soft',
  'elevation-1': 'shadow-elevation-1',
}

/**
 * بطاقة قسم موحدة — مصدر واحد لكل تعريفات SectionCard الـ 8 المكررة سابقًا
 * (الإعدادات/لوحات المعلمة/صفحات الحسابات/التقارير/الفواتير/تقفيل الشهر).
 * كل عائلة تضبط افتراضاتها عبر wrapper رفيع يحافظ على الكلاسات الدقيقة
 * (radius موحّد: rounded-card = --radius-card = 1rem = rounded-2xl سابقًا).
 */
export const SectionCard: React.FC<SectionCardProps> = ({
  children,
  className,
  id,
  animated = false,
  delay = 0,
  entrance = 'fadeUp',
  border = 'border',
  padding = 'none',
  shadow = 'none',
  hover = false,
  transition = 'none',
  slow = false,
  overflowHidden = false,
  title,
  titleTone = 'bg-primary',
  icon,
  description,
  descClassName,
  action,
}) => {
  const chrome = cn(
    'rounded-card border bg-card',
    border === 'divider' ? 'border-divider' : 'border-border',
    PADDING[padding],
    SHADOW[shadow],
    hover && 'hover:shadow-elevation-2',
    transition === 'all' ? 'transition-all' : transition === 'colors' ? 'transition-colors' : '',
    slow && transition !== 'none' && 'duration-slow',
    overflowHidden && 'overflow-hidden',
    className,
  )

  /* رأس القسم: نقطة+عنوان (لوحات المعلمة) أو أيقونة+عنوان+وصف+إجراء (صفحات الحسابات) */
  const hasHeader = Boolean(title || icon || description || action)
  const dotHeader =
    hasHeader && Boolean(title) && !icon && !description && !action ? (
      <div className="mb-3 flex items-center gap-2">
        <span className={cn('h-1.5 w-1.5 rounded-full', titleTone)} aria-hidden="true" />
        <h2 className="text-sm font-black text-main">{title}</h2>
      </div>
    ) : null
  const fullHeader =
    hasHeader && !dotHeader ? (
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          {icon}
          <div>
            {title && <h2 className="text-sm font-black leading-tight text-main">{title}</h2>}
            {description && (
              <p className={cn('mt-0.5 text-micro text-muted', descClassName)}>{description}</p>
            )}
          </div>
        </div>
        {action}
      </div>
    ) : null

  if (animated) {
    const entranceProps =
      entrance === 'soft'
        ? ({
            initial: { opacity: 0, y: 14 } as const,
            animate: { opacity: 1, y: 0 } as const,
            transition: { delay, duration: 0.35 } as const,
          } as const)
        : fadeUp(delay)
    return (
      <motion.section id={id} {...entranceProps} className={chrome}>
        {dotHeader}
        {fullHeader}
        {children}
      </motion.section>
    )
  }

  return (
    <div id={id} className={chrome}>
      {dotHeader}
      {fullHeader}
      {children}
    </div>
  )
}

SectionCard.displayName = 'SectionCard'
