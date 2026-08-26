import { typography, spacing, radius, shadows } from '../../../theme/design-tokens'

const SPACING_KEYS = ['0', '1', '2', '4', '6', '8', '12', '16', '20', '24', '32', '48', '64', '96']

export function DesignTokenSection() {
  return (
    <section>
      <h2 className="mb-4 text-lg font-bold">Design Tokens — Non-Color</h2>
      <p className="mb-6 text-sm text-muted">
        المصدر: <code className="font-mono text-primary">src/theme/design-tokens.ts</code>
      </p>

      {/* Typography */}
      <div className="mb-10">
        <h3 className="mb-4 text-base font-semibold">الخطوط — Typography</h3>
        <div className="space-y-6">
          {Object.entries(typography.fontFamily).map(([key, value]) => (
            <div key={key} className="flex items-center gap-4">
              <span className="w-24 font-mono text-xs text-muted">--font-family-{key}</span>
              <span style={{ fontFamily: value }} className="text-base text-main">
                اللغة العربية — English Text 0123
              </span>
            </div>
          ))}
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {Object.entries(typography.fontSize).map(([key, { size, lineHeight }]) => (
            <div key={key} className="rounded-card border p-3">
              <div className="mb-1 font-mono text-xs text-muted">--font-size-{key}</div>
              <div className="font-mono text-xs text-dim">
                {size} / {lineHeight}
              </div>
              <div className="mt-2 truncate text-main" style={{ fontSize: size, lineHeight }}>
                اللغة العربية
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Spacing */}
      <div className="mb-10">
        <h3 className="mb-4 text-base font-semibold">المسافات — Spacing</h3>
        <div className="space-y-2">
          {SPACING_KEYS.map((key) => {
            const value = spacing[key]
            const cssVar = `--space-${key.replace('.', '-')}`
            return (
              <div key={key} className="flex items-center gap-4">
                <span className="w-24 shrink-0 text-end font-mono text-xs text-muted">
                  {cssVar}
                </span>
                <span className="w-16 shrink-0 font-mono text-xs text-dim">{value}</span>
                <div className="h-6 shrink-0 rounded bg-primary" style={{ width: value }} />
              </div>
            )
          })}
        </div>
      </div>

      {/* Radius */}
      <div className="mb-10">
        <h3 className="mb-4 text-base font-semibold">الزوايا — Border Radius</h3>
        <div className="flex flex-wrap gap-6">
          {Object.entries(radius).map(([key, value]) => {
            const cssVar = key === 'DEFAULT' ? '--radius' : `--radius-${key}`
            return (
              <div key={key} className="flex flex-col items-center gap-2">
                <div className="h-16 w-16 bg-primary" style={{ borderRadius: value }} />
                <span className="font-mono text-xs text-muted">{cssVar}</span>
                <span className="font-mono text-micro text-dim">{value}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Shadows */}
      <div className="mb-10">
        <h3 className="mb-4 text-base font-semibold">الظلال — Shadows</h3>
        <div className="flex flex-wrap gap-6">
          {Object.entries(shadows).map(([key, value]) => {
            const cssVar = key === 'DEFAULT' ? '--shadow' : `--shadow-${key}`
            return (
              <div key={key} className="flex flex-col items-center gap-2">
                <div
                  className="h-20 w-28 rounded-card border bg-card"
                  style={{ boxShadow: value }}
                />
                <span className="font-mono text-xs text-muted">{cssVar}</span>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
