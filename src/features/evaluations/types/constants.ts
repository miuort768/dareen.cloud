import { Star, ThumbsUp, CheckCircle2, Minus, XCircle, ThumbsDown } from 'lucide-react'

export const RATING_OPTIONS = [
  {
    value: 'ممتاز',
    icon: Star,
    color: 'text-success-strong',
    bg: 'bg-success-soft',
    border: 'border-success',
    pill: 'bg-success-soft text-success-strong',
  },
  {
    value: 'جيد جدًا',
    icon: ThumbsUp,
    color: 'text-success-strong',
    bg: 'bg-success-soft',
    border: 'border-success',
    pill: 'bg-success-soft text-success-strong',
  },
  {
    value: 'جيد',
    icon: CheckCircle2,
    color: 'text-primary dark:text-primary',
    bg: 'bg-primary-soft',
    border: 'border-primary',
    pill: 'bg-primary-soft text-primary dark:text-primary',
  },
  {
    value: 'مقبول',
    icon: Minus,
    color: 'text-warning-strong',
    bg: 'bg-warning-soft',
    border: 'border-warning',
    pill: 'bg-warning-soft text-warning-strong',
  },
  {
    value: 'ضعيف',
    icon: XCircle,
    color: 'text-error-strong',
    bg: 'bg-error-soft',
    border: 'border-error',
    pill: 'bg-error-soft text-error-strong',
  },
  {
    value: 'يحتاج تحسين',
    icon: ThumbsDown,
    color: 'text-warning-strong',
    bg: 'bg-warning-soft',
    border: 'border-warning',
    pill: 'bg-warning-soft text-warning-strong',
  },
] as const

/** القيمة الرقمية الموحدة لكل تقدير (المصدر الوحيد — كانت مكررة ×3 بنواقص) */
const RATING_VALUE_MAP: Record<string, number> = {
  ممتاز: 5,
  'جيد جدًا': 4,
  جيد: 3,
  مقبول: 3,
  ضعيف: 2,
  'يحتاج تحسين': 2,
}

export const ratingValueOf = (rating: string | undefined): number =>
  RATING_VALUE_MAP[rating || ''] ?? 3

/** متوسط التقييمات الرقمي (1 منفذ مشترك بدل 3 نسخ) */
export const averageRatingOf = (evals: { rating: string }[]): number => {
  if (evals.length === 0) return 0
  const sum = evals.reduce((acc, ev) => acc + ratingValueOf(ev.rating), 0)
  return Math.round((sum / evals.length) * 10) / 10
}

/** تدرجات أفاتار الطلاب — مصدر واحد (كانت مكررة في Card وDrawer مع to-warning-hover غير المعرف سابقًا) */
export const AVATAR_GRADIENTS = [
  { g: 'from-primary to-primary-hover', on: 'text-on-primary' },
  { g: 'from-success to-success-hover', on: 'text-on-success' },
  { g: 'from-info to-info-hover', on: 'text-on-info' },
  { g: 'from-warning to-warning-hover', on: 'text-on-warning' },
  { g: 'from-error to-error-hover', on: 'text-on-error' },
  { g: 'from-accent to-accent-hover', on: 'text-on-accent' },
] as const

export const getAvatarGradient = (name: string) => {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length]!
}
