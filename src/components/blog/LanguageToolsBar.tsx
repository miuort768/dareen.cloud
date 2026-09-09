import { ClipboardCheck, TrendingUp } from 'lucide-react'

interface LanguageToolsBarProps {
  languageName: string
}

const LEVELS = ['المستوى الأول', 'المستوى الثاني', 'المستوى الثالث']

/**
 * Language tools strip (quiz + levels) — decorative entry points only.
 * Buttons are intentionally non-functional for now ("قريبًا").
 */
export const LanguageToolsBar = ({ languageName }: LanguageToolsBarProps) => (
  <div className="mb-5 rounded-2xl border border-border bg-card p-4 shadow-elevation-1 lg:rounded-none">
    <div className="mb-3 flex items-center gap-2">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
        <TrendingUp size={15} />
      </span>
      <span className="text-sm font-black text-main">أدوات {languageName}</span>
    </div>

    <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
      <button
        type="button"
        title="قريبًا"
        className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-black text-on-primary shadow-elevation-1 outline-none transition-all hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.97] sm:w-auto"
      >
        <ClipboardCheck size={14} />
        اختبار تحديد المستوى
      </button>

      <div className="grid flex-1 grid-cols-3 gap-2.5 sm:flex sm:gap-2.5">
        {LEVELS.map((lvl) => (
          <button
            key={lvl}
            type="button"
            title="قريبًا"
            className="inline-flex min-h-11 cursor-pointer items-center justify-center whitespace-nowrap rounded-xl border border-border bg-surface px-2 text-[11px] font-extrabold text-main outline-none transition-all hover:border-primary/40 hover:text-primary focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.97] sm:px-5 sm:text-xs"
          >
            {lvl}
          </button>
        ))}
      </div>
    </div>
  </div>
)
