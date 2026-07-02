import { Star, ThumbsUp, CheckCircle2, ThumbsDown } from 'lucide-react';

export const RATING_OPTIONS = [
    { value: 'ممتاز', icon: Star, color: 'text-warning', bg: 'bg-warning-light', border: 'border-warning', pill: 'bg-warning-light text-warning' },
    { value: 'جيد جدًا', icon: ThumbsUp, color: 'text-success', bg: 'bg-success-light', border: 'border-success', pill: 'bg-success-light text-success' },
    { value: 'جيد', icon: CheckCircle2, color: 'text-primary', bg: 'bg-primary-soft', border: 'border-primary', pill: 'bg-primary-light text-primary' },
    { value: 'يحتاج تحسين', icon: ThumbsDown, color: 'text-warning', bg: 'bg-warning-light', border: 'border-warning', pill: 'bg-warning-light text-warning' },
] as const;
