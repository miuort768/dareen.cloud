import { mockChartData } from '../data/mockData';

export function ChartSection() {
  const maxVal = Math.max(...mockChartData.map(d => d.value));
  return (
    <section>
      <h2 className="text-lg font-bold mb-4">الرسوم البيانية — Charts</h2>
      <div className="rounded-card border p-4">
        <h3 className="text-sm font-semibold text-muted mb-4">رسم بياني عمودي — الإيرادات الشهرية</h3>
        <div className="flex items-end gap-3 h-40">
          {mockChartData.map(d => (
            <div key={d.name} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[10px] text-muted">{d.value}</span>
              <div
                className="w-full rounded-t bg-primary transition-all"
                style={{ height: `${(d.value / maxVal) * 100}%` }}
              />
              <span className="text-[10px] text-muted">{d.name}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
        {mockChartData.map((d, i) => {
          const colors = ['var(--bg-primary)', 'var(--bg-success)', 'var(--bg-warning)', 'var(--bg-error)', 'var(--bg-info)', 'var(--text-accent)'];
          return (
            <div key={d.name} className="flex items-center gap-2 p-3 rounded-card border">
              <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: colors[i] }} />
              <div className="text-xs text-muted">{d.name}: <strong className="text-main">{d.value}</strong></div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
