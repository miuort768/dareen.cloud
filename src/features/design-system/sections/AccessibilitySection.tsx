const CHECKS = [
  { label: 'تباين النصوص', status: 'pass', desc: 'WCAG AA ✅ text-main 17.5:1, text-muted 4.62:1, Primary btn 6.3:1' },
  { label: 'تباين الأزرار', status: 'pass', desc: 'Destructive btn أُصلح (rose[500]→rose[600]): 3.67:1→4.82:1 ✅' },
  { label: 'Focus Ring', status: 'pass', desc: 'جميع الأزرار + الـ Pagination + Dark toggle ✅ | Nav tabs أُضيف ✅' },
  { label: 'Keyboard Navigation', status: 'pass', desc: 'Tab order يعمل — Sidebar mock غير تفاعلي (مقصود لعرض فقط)' },
  { label: 'Color Blind Friendly', status: 'pass', desc: 'الحالة تُنقل عبر النص واللون معًا (Status Badges في الجدول)' },
  { label: 'Labels', status: 'pass', desc: 'جميع حقول النماذج لها htmlFor/id ✅ (أُضيف في Gate 3)' },
  { label: 'Semantic HTML', status: 'pass', desc: '<header>/<nav>/<main>/<table> مع <thead>/<th> ✅ | Banner role="alert" ✅' },
  { label: 'Alt Text', status: 'pass', desc: 'Charts role="img" aria-label أُضيف ✅ — لا صور بدون alt' },
  { label: 'Dark Mode Primary Contrast', status: 'fail', desc: 'Known Issue: 4.47:1 (يجتاز AA Large فقط) — يُراجع في Sprint 3' },
] as const;

const STATUS_LABELS: Record<string, string> = {
  manual: 'يدوي',
  pass: 'ناجح',
  fail: 'فاشل',
};

const STATUS_COLORS: Record<string, string> = {
  manual: 'bg-warning-soft text-warning-dark border-warning',
  pass: 'bg-success-soft text-success-dark border-success',
  fail: 'bg-error-soft text-error-dark border-error',
};

export function AccessibilitySection() {
  return (
    <section>
      <h2 className="text-lg font-bold mb-4">إمكانية الوصول — Accessibility</h2>
      <p className="text-sm text-muted mb-4">
        نتائج Gate 3 — آخر تحديث: 2026-07-01
      </p>
      <div className="space-y-3">
        {CHECKS.map(check => (
          <div key={check.label} className={`rounded-md border px-4 py-3 ${STATUS_COLORS[check.status]}`}>
            <div className="flex items-center justify-between mb-1">
              <strong className="text-sm font-bold">{check.label}</strong>
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/50">
                {STATUS_LABELS[check.status]}
              </span>
            </div>
            <p className="text-xs opacity-80">{check.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
