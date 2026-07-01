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
];

export function RegressionChecklist() {
  return (
    <section>
      <h2 className="text-lg font-bold mb-4">قائمة التحقق — Visual Regression Checklist</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {ITEMS.map(item => (
          <label key={item} className="flex items-center gap-3 p-3 rounded-card border hover:bg-hover cursor-pointer transition-colors">
            <input type="checkbox" className="rounded border text-primary focus:ring-primary shrink-0" />
            <span className="text-sm text-main">{item}</span>
          </label>
        ))}
      </div>
    </section>
  );
}
