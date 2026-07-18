


const EXAMPLES = [
  { label: 'Hover Scale', class: 'hover:scale-110 transition-transform' },
  { label: 'Fade In', class: 'hover:opacity-70 transition-opacity' },
  { label: 'Slide', class: 'hover:translate-x-2 transition-transform' },
  { label: 'Shadow', class: 'hover:shadow-lg transition-shadow' },
] as const;

export function MotionSection() {
  return (
    <section>
      <h2 className="text-lg font-bold mb-4">الحركة — Motion</h2>
      <p className="text-sm text-muted mb-4">حركات بسيطة للحالات التفاعلية (قيد التطوير — سيضاف لاحقاً Easing و Duration)</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {EXAMPLES.map(ex => (
          <div key={ex.label} className="flex flex-col items-center gap-3">
            <div className={`w-20 h-20 bg-primary text-on-primary rounded-card flex items-center justify-center text-xs font-bold cursor-pointer transition-all duration-300 ${ex.class}`}>
              Hover
            </div>
            <span className="text-xs text-muted">{ex.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
