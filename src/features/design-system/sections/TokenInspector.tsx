import { semantic } from '../../../theme/semantic'

const EXAMPLE_TOKENS = [
  { label: 'زر Primary', token: 'bg-primary' },
  { label: 'نص أساسي', token: 'text-main' },
  { label: 'حدود', token: 'border' },
  { label: 'خلفية نجاح', token: 'bg-success' },
  { label: 'نص باهت', token: 'text-dim' },
] as const

export function TokenInspector() {
  return (
    <section>
      <h2 className="mb-4 text-lg font-bold">مفتش الـ Tokens — Token Inspector</h2>
      <p className="mb-4 text-sm text-muted">تتبع مصدر اللون من المكون إلى الـ Primitive</p>
      <div className="space-y-3">
        {EXAMPLE_TOKENS.map((ex) => {
          const value = semantic[ex.token as keyof typeof semantic]
          return (
            <div key={ex.token} className="rounded-card border p-4">
              <div className="flex items-center gap-4">
                <div
                  className="h-8 w-8 shrink-0 rounded-md border"
                  style={{ backgroundColor: value }}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs">
                    <span className="font-bold text-main">{ex.label}</span>
                    <span className="text-muted">↓</span>
                    <span className="text-primary">{ex.token}</span>
                    <span className="text-muted">↓</span>
                    <span className="text-dim">--{ex.token}</span>
                    <span className="text-muted">↓</span>
                    <span className="text-dim">{value}</span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
