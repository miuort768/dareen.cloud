import { Star, ThumbsUp, CheckCircle2, ThumbsDown } from 'lucide-react';

export const RATING_OPTIONS = [
    { value: 'ممتاز', icon: Star, color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200', pill: 'bg-yellow-100 text-yellow-700' },
    { value: 'جيد جدًا', icon: ThumbsUp, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', pill: 'bg-emerald-100 text-emerald-700' },
    { value: 'جيد', icon: CheckCircle2, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', pill: 'bg-blue-100 text-blue-700' },
    { value: 'يحتاج تحسين', icon: ThumbsDown, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', pill: 'bg-orange-100 text-orange-700' },
] as const;
