import { Star, ThumbsUp, CheckCircle2, Minus, XCircle, ThumbsDown } from 'lucide-react'

/**
 * سلّم التقييم — لوحة هادئة ومتدرجة:
 * أخضر (ممتاز) → بنفسجي (جيد جدًا) → سماوي (جيد) → رمادي (مقبول)
 * → كهرماني نهاريًا / رمادي ليليًا (يحتاج تحسين) → وردي (ضعيف).
 * ملاحظة: لا يوجد أي لون كهرماني (أصفر) في الوضع الليلي إطلاقًا.
 */
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
    color: 'text-primary dark:text-primary',
    bg: 'bg-primary-soft dark:bg-primary/10',
    border: 'border-primary',
    pill: 'bg-primary-soft text-primary dark:bg-primary/10',
  },
  {
    value: 'جيد',
    icon: CheckCircle2,
    color: 'text-info-strong',
    bg: 'bg-info-soft',
    border: 'border-info',
    pill: 'bg-info-soft text-info-strong',
  },
  {
    value: 'مقبول',
    icon: Minus,
    color: 'text-main',
    bg: 'bg-hover',
    border: 'border-strong',
    pill: 'bg-hover text-muted',
  },
  {
    value: 'يحتاج تحسين',
    icon: ThumbsDown,
    color: 'text-warning-strong dark:text-main',
    bg: 'bg-warning-soft dark:bg-hover',
    border: 'border-warning dark:border-strong',
    pill: 'bg-warning-soft text-warning-strong dark:bg-hover dark:text-muted',
  },
  {
    value: 'ضعيف',
    icon: XCircle,
    color: 'text-error-strong',
    bg: 'bg-error-soft',
    border: 'border-error',
    pill: 'bg-error-soft text-error-strong',
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

/**
 * تدرجات أفاتار الطلاب — مصدر واحد (4 ألوان هادئة، بلا كهرماني/ذهبي).
 * نهايات التدرجات من توكنات معرفة في الوضعين معًا (لا to-*-hover غير المعرف).
 */
export const AVATAR_GRADIENTS = [
  { g: 'from-primary to-primary/70', on: 'text-on-primary' },
  { g: 'from-success to-success-dark', on: 'text-on-success' },
  { g: 'from-info to-info-hover', on: 'text-on-info' },
  { g: 'from-error to-error-hover', on: 'text-on-error' },
] as const

export const getAvatarGradient = (name: string) => {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length]!
}
