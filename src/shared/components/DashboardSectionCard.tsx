import React from 'react'
import { SectionCard } from './SectionCard'

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
 * رفيع فوق SectionCard المشتركة للتوحيد (نهاية توحيد الـ 8 تعريفات).
 */
export const DashboardSectionCard: React.FC<DashboardSectionCardProps> = ({
  children,
  title,
  tone = 'bg-primary',
  id,
  delay = 0,
  className,
}) => (
  <SectionCard
    animated
    delay={delay}
    id={id}
    padding="base"
    shadow="elevation-1"
    transition="colors"
    slow
    title={title}
    titleTone={tone}
    className={className}
  >
    {children}
  </SectionCard>
)

DashboardSectionCard.displayName = 'DashboardSectionCard'
