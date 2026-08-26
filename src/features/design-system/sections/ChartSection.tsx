import { mockChartData } from '../data/mockData'

export function ChartSection() {
  const maxVal = Math.max(...mockChartData.map((d) => d.value))
  return (
    <section>
      <h2 className="mb-4 text-lg font-bold">الرسوم البيانية — Charts</h2>
      <div
        className="rounded-card border p-4"
        role="img"
        aria-label="رسم بياني عمودي يوضح الإيرادات الشهرية"
      >
        <h3 className="mb-4 text-sm font-semibold text-muted">
          رسم بياني عمودي — الإيرادات الشهرية
        </h3>
        <div className="flex h-40 items-end gap-3">
          {mockChartData.map((d) => (
            <div key={d.name} className="flex flex-1 flex-col items-center gap-1">
              <span className="text-micro text-muted">{d.value}</span>
              <div
                className="w-full rounded-t bg-primary transition-all"
                style={{ height: `${(d.value / maxVal) * 100}%` }}
              />
              <span className="text-micro text-muted">{d.name}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {mockChartData.map((d, i) => {
          const colors = [
            'var(--bg-primary)',
            'var(--bg-success)',
            'var(--bg-warning)',
            'var(--bg-error)',
            'var(--bg-info)',
            'var(--text-accent)',
          ]
          return (
            <div key={d.name} className="flex items-center gap-2 rounded-card border p-3">
              <div
                className="h-3 w-3 shrink-0 rounded-full"
                style={{ backgroundColor: colors[i] }}
              />
              <div className="text-xs text-muted">
                {d.name}: <strong className="text-main">{d.value}</strong>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
