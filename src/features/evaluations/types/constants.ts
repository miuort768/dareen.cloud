import { Star, ThumbsUp, CheckCircle2, ThumbsDown } from 'lucide-react';

export const RATING_OPTIONS = [
    { value: 'ممتاز', icon: Star, color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200', pill: 'bg-yellow-100 text-yellow-700' },
    { value: 'جيد جدًا', icon: ThumbsUp, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', pill: 'bg-emerald-100 text-emerald-700' },
    { value: 'جيد', icon: CheckCircle2, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', pill: 'bg-blue-100 text-blue-700' },
    { value: 'يحتاج تحسين', icon: ThumbsDown, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200', pill: 'bg-rose-100 text-rose-700' },
] as const;
