import { ClipboardCheck, TrendingUp } from 'lucide-react'

interface LanguageToolsBarProps {
  languageName: string
}

/**
 * Language tools strip (quiz + levels) — decorative entry points only.
 * Buttons are intentionally non-functional for now ("قريبًا").
 */
export const LanguageToolsBar = ({ languageName }: LanguageToolsBarProps) => (
  <div className="mb-5 flex flex-wrap items-center gap-2.5 rounded-2xl border border-border bg-card p-4 shadow-elevation-1 lg:rounded-none">
    <span className="inline-flex items-center gap-1.5 text-sm font-black text-main">
      <TrendingUp size={15} className="text-primary" />
      أدوات {languageName}
    </span>
    <button
      type="button"
      title="قريبًا"
      className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-black text-on-primary shadow-elevation-1 outline-none transition-all hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.97] sm:min-h-0 sm:py-2.5"
    >
      <ClipboardCheck size={14} />
      اختبار تحديد المستوى
    </button>
    {['المستوى الأول', 'المستوى الثاني', 'المستوى الثالث'].map((lvl) => (
      <button
        key={lvl}
        type="button"
        title="قريبًا"
        className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-border bg-surface px-5 py-2.5 text-xs font-extrabold text-main outline-none transition-all hover:border-primary/40 hover:text-primary focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.97] sm:min-h-0 sm:py-2"
      >
        {lvl}
      </button>
    ))}
  </div>
)
