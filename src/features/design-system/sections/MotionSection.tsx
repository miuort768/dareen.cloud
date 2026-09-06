const EXAMPLES = [
  { label: 'Hover Scale', class: 'hover:scale-110 transition-transform' },
  { label: 'Fade In', class: 'hover:opacity-70 transition-opacity' },
  { label: 'Slide', class: 'hover:translate-x-2 transition-transform' },
  { label: 'Shadow', class: 'hover:shadow-elevation-3 transition-shadow' },
] as const

export function MotionSection() {
  return (
    <section>
      <h2 className="mb-4 text-lg font-bold">الحركة — Motion</h2>
      <p className="mb-4 text-sm text-muted">
        حركات بسيطة للحالات التفاعلية (قيد التطوير — سيضاف لاحقاً Easing و Duration)
      </p>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {EXAMPLES.map((ex) => (
          <div key={ex.label} className="flex flex-col items-center gap-3">
            <div
              className={`flex h-20 w-20 cursor-pointer items-center justify-center rounded-card bg-primary text-xs font-bold text-on-primary transition-all duration-300 ${ex.class}`}
            >
              Hover
            </div>
            <span className="text-xs text-muted">{ex.label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
