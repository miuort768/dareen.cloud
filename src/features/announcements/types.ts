import { Bell, AlertTriangle, Calendar, PartyPopper } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export type AnnouncementType = 'general' | 'urgent' | 'holiday' | 'event'

export interface Announcement {
  id: string
  title: string
  content: string
  type: AnnouncementType
  date: string
  isActive: boolean
}

interface AnnouncementTypeMeta {
  icon: LucideIcon
  label: string
  /** كلاسات Tailwind الدلالية للشارات */
  badge: string
  iconBg: string
  iconText: string
  /** ألوان CSS Variables للاستخدام مع opacity modifier غير المدعوم */
  cssVar: { color: string; bg: string; border: string }
}

/** المصدر الموحد لأيقونات وأسماء وألوان أنواع الإعلانات — يُستخدم في كل الواجهات */
export const ANNOUNCEMENT_TYPE_CONFIG: Record<AnnouncementType, AnnouncementTypeMeta> = {
  general: {
    icon: Bell,
    label: 'عام',
    badge: 'bg-surface text-muted',
    iconBg: 'bg-background',
    iconText: 'text-muted',
    cssVar: { color: 'var(--text-muted)', bg: 'var(--bg-card)', border: 'var(--border)' },
  },
  urgent: {
    icon: AlertTriangle,
    label: 'عاجل',
    badge: 'bg-error-soft text-error',
    iconBg: 'bg-error-soft',
    iconText: 'text-error',
    cssVar: {
      color: 'var(--text-error)',
      bg: 'var(--bg-error-soft)',
      border: 'var(--border-error)',
    },
  },
  holiday: {
    icon: Calendar,
    label: 'إجازة',
    badge: 'bg-warning-soft text-warning',
    iconBg: 'bg-warning-soft',
    iconText: 'text-warning',
    cssVar: {
      color: 'var(--text-warning)',
      bg: 'var(--bg-warning-soft)',
      border: 'var(--border-warning)',
    },
  },
  event: {
    icon: PartyPopper,
    label: 'فعالية',
    badge: 'bg-info-soft text-info',
    iconBg: 'bg-info-soft',
    iconText: 'text-info',
    cssVar: { color: 'var(--text-info)', bg: 'var(--bg-info-soft)', border: 'var(--border-info)' },
  },
}

export const announcementTypeOf = (type: string | undefined): AnnouncementTypeMeta =>
  ANNOUNCEMENT_TYPE_CONFIG[(type as AnnouncementType) || 'general'] ??
  ANNOUNCEMENT_TYPE_CONFIG.general
