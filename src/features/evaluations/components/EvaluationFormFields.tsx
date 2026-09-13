import { motion } from 'framer-motion'
import { CheckCircle2, Zap, Check } from 'lucide-react'
import { cn } from '../../../lib/utils'
import { RATING_OPTIONS } from '../types/constants'

interface EvaluationFormFieldsProps {
  formData: { rating: string; points: number; notes: string }
  onChange: (data: { rating: string; points: number; notes: string }) => void
  onSubmit: (e: React.FormEvent) => void
  onCancel?: () => void
  isSubmitting?: boolean
  formId: string
  submitLabel?: string
  className?: string
}

export const EvaluationFormFields = ({
  formData,
  onChange,
  onSubmit,
  onCancel,
  isSubmitting,
  formId,
  submitLabel = 'إرسال التقييم',
  className,
}: EvaluationFormFieldsProps) => (
  <form id={formId} onSubmit={onSubmit} className={cn('space-y-5', className)} dir="rtl">
    {/* Rating */}
    <div>
      <label className="mb-2.5 block text-xs font-bold text-muted">مستوى التميز</label>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {RATING_OPTIONS.map((opt) => {
          const isSelected = formData.rating === opt.value
          const OptIcon = opt.icon
          return (
            <button
              type="button"
              key={opt.value}
              onClick={() => onChange({ ...formData, rating: opt.value })}
              aria-pressed={isSelected}
              className={cn(
                'relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 px-2 py-3.5 transition-all duration-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
                isSelected
                  ? cn(opt.bg, opt.border, opt.color, 'shadow-elevation-1')
                  : 'border-border bg-surface text-muted hover:border-primary/40 hover:bg-hover hover:text-main',
              )}
            >
              {isSelected && (
                <motion.span
                  layoutId="rating-check"
                  className="absolute end-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full"
                  style={{ backgroundColor: 'currentColor' }}
                  aria-hidden="true"
                >
                  <Check size={10} strokeWidth={3.5} className="text-white" />
                </motion.span>
              )}
              <OptIcon size={22} strokeWidth={isSelected ? 2.4 : 1.9} />
              <span className="text-center text-xs font-extrabold leading-snug">{opt.value}</span>
            </button>
          )
        })}
      </div>
    </div>

    {/* XP Points */}
    <div>
      <div className="mb-2.5 flex items-center justify-between">
        <label className="text-xs font-bold text-muted">نقاط المكافأة (XP)</label>
      </div>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {[5, 10, 15, 20, 25, 30, 50].map((p) => {
          const isSelected = formData.points === p
          return (
            <button
              key={p}
              type="button"
              onClick={() => onChange({ ...formData, points: p })}
              aria-pressed={isSelected}
              className={cn(
                'rounded-lg border px-3 py-1.5 text-micro font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
                isSelected
                  ? 'border-primary bg-primary-soft font-black text-primary shadow-elevation-1 dark:bg-primary/10'
                  : 'border-border bg-surface text-muted hover:border-primary/40 hover:text-primary',
              )}
            >
              +{p}
            </button>
          )
        })}
      </div>
      <div className="flex items-center gap-2.5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary-soft dark:bg-primary/10">
          <Zap size={16} className="text-primary" />
        </div>
        <input
          type="number"
          value={formData.points || ''}
          onChange={(e) =>
            onChange({
              ...formData,
              points: Math.min(50, Math.max(0, Number(e.target.value))),
            })
          }
          placeholder="0"
          min="0"
          max="50"
          aria-label="عدد النقاط من 0 إلى 50"
          className="flex-1 rounded-xl border border-border bg-surface px-3 py-2.5 text-center text-sm font-bold tabular-nums text-main outline-none transition-all focus:border-primary focus-visible:ring-2 focus-visible:ring-focus"
        />
        <span className="text-micro text-muted">/ 50</span>
      </div>
      <p className="mt-1.5 text-micro text-muted">الحد الأقصى 50 نقطة في كل تقييم</p>
    </div>

    {/* Notes */}
    <div>
      <label htmlFor="eval-notes" className="mb-2 block text-xs font-bold text-muted">
        رسالة الإشادة (تظهر لولي الأمر)
      </label>
      <textarea
        id="eval-notes"
        value={formData.notes}
        onChange={(e) => onChange({ ...formData, notes: e.target.value })}
        rows={3}
        className="w-full resize-none rounded-xl border border-border bg-surface px-3 py-2.5 text-sm outline-none transition-all placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/10 dark:bg-card dark:text-main"
        placeholder="مثال: أداء ممتاز اليوم..."
      />
    </div>

    {/* Footer */}
    {(onCancel || onSubmit) && (
      <div className="flex gap-3 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border border-border bg-surface py-3 text-xs font-bold text-main transition-all hover:bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.98]"
          >
            إلغاء
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            'flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-95 disabled:cursor-not-allowed disabled:opacity-50',
            onCancel
              ? 'bg-primary text-on-primary shadow-elevation-1 hover:bg-primary/90'
              : 'bg-primary text-on-primary shadow-elevation-1 hover:bg-primary/90',
          )}
        >
          <CheckCircle2 size={14} /> {isSubmitting ? 'جاري الإرسال...' : submitLabel}
        </button>
      </div>
    )}
  </form>
)
