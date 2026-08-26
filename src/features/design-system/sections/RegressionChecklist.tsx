const ITEMS = [
  'جميع النصوص مقروءة',
  'Hover واضح',
  'Focus واضح',
  'Disabled واضح',
  'Contrast جيد',
  'لا يوجد Gold في العناصر اليومية',
  'لا يوجد لون خارج الـ Tokens',
  'Charts متناسقة',
  'Sidebar متوازن',
  'Landing متناسقة',
  'Dashboard متناسق',
  'Dark Mode متوازن',
  'جميع الأزرار متناسقة',
  'الرسوم البيانية متناسقة',
  'النماذج موحدة',
  'الجداول موحدة',
  'البطاقات متناسقة',
  'التنبيهات متناسقة',
]

export function RegressionChecklist() {
  return (
    <section>
      <h2 className="mb-4 text-lg font-bold">قائمة التحقق — Visual Regression Checklist</h2>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {ITEMS.map((item) => (
          <label
            key={item}
            className="flex cursor-pointer items-center gap-3 rounded-card border p-3 transition-colors hover:bg-hover"
          >
            <input
              type="checkbox"
              className="shrink-0 rounded border text-primary focus:ring-primary"
            />
            <span className="text-sm text-main">{item}</span>
          </label>
        ))}
      </div>
    </section>
  )
}
