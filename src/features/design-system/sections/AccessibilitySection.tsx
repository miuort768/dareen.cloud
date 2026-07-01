const CHECKS = [
  { label: 'تباين النصوص', status: 'manual', desc: 'WCAG AA يتطلب نسبة تباين 4.5:1 على الأقل للنصوص العادية' },
  { label: 'Focus Ring', status: 'manual', desc: 'جميع العناصر التفاعلية يجب أن تحتوي على focus ring مرئي' },
  { label: 'Keyboard Navigation', status: 'manual', desc: 'يجب أن يكون جميع العناصر قابلة للوصول عبر keyboard' },
  { label: 'Color Blind Friendly', status: 'manual', desc: 'عدم الاعتماد على اللون فقط لنقل المعلومات' },
  { label: 'Labels', status: 'manual', desc: 'جميع حقول النماذج يجب أن تحتوي على labels' },
  { label: 'Alt Text', status: 'manual', desc: 'جميع الصور يجب أن تحتوي على alt text' },
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
        هذه المؤشرات يدوية حاليًا — سيتم أتمتتها لاحقًا
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
