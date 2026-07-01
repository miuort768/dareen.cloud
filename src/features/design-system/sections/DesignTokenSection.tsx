import { typography, spacing, radius, shadows } from '../../../theme/design-tokens';

const SPACING_KEYS = ['0', '1', '2', '4', '6', '8', '12', '16', '20', '24', '32', '48', '64', '96'];

export function DesignTokenSection() {
  return (
    <section>
      <h2 className="text-lg font-bold mb-4">Design Tokens — Non-Color</h2>
      <p className="text-sm text-muted mb-6">المصدر: <code className="text-primary font-mono">src/theme/design-tokens.ts</code></p>

      {/* Typography */}
      <div className="mb-10">
        <h3 className="text-base font-semibold mb-4">الخطوط — Typography</h3>
        <div className="space-y-6">
          {Object.entries(typography.fontFamily).map(([key, value]) => (
            <div key={key} className="flex items-center gap-4">
              <span className="text-xs text-muted font-mono w-24">--font-family-{key}</span>
              <span style={{ fontFamily: value }} className="text-main text-base">
                اللغة العربية — English Text 0123
              </span>
            </div>
          ))}
        </div>
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {Object.entries(typography.fontSize).map(([key, { size, lineHeight }]) => (
            <div key={key} className="p-3 rounded-card border">
              <div className="text-xs text-muted font-mono mb-1">--font-size-{key}</div>
              <div className="text-xs text-dim font-mono">{size} / {lineHeight}</div>
              <div className="mt-2 text-main truncate" style={{ fontSize: size, lineHeight }}>
                اللغة العربية
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Spacing */}
      <div className="mb-10">
        <h3 className="text-base font-semibold mb-4">المسافات — Spacing</h3>
        <div className="space-y-2">
          {SPACING_KEYS.map(key => {
            const value = spacing[key];
            const cssVar = `--space-${key.replace('.', '-')}`;
            return (
              <div key={key} className="flex items-center gap-4">
                <span className="text-xs text-muted font-mono w-24 text-left shrink-0">{cssVar}</span>
                <span className="text-xs text-dim font-mono w-16 shrink-0">{value}</span>
                <div
                  className="bg-primary rounded h-6 shrink-0"
                  style={{ width: value }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Radius */}
      <div className="mb-10">
        <h3 className="text-base font-semibold mb-4">الزوايا — Border Radius</h3>
        <div className="flex flex-wrap gap-6">
          {Object.entries(radius).map(([key, value]) => {
            const cssVar = key === 'DEFAULT' ? '--radius' : `--radius-${key}`;
            return (
              <div key={key} className="flex flex-col items-center gap-2">
                <div
                  className="w-16 h-16 bg-primary"
                  style={{ borderRadius: value }}
                />
                <span className="text-xs text-muted font-mono">{cssVar}</span>
                <span className="text-[10px] text-dim font-mono">{value}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Shadows */}
      <div className="mb-10">
        <h3 className="text-base font-semibold mb-4">الظلال — Shadows</h3>
        <div className="flex flex-wrap gap-6">
          {Object.entries(shadows).map(([key, value]) => {
            const cssVar = key === 'DEFAULT' ? '--shadow' : `--shadow-${key}`;
            return (
              <div key={key} className="flex flex-col items-center gap-2">
                <div
                  className="w-28 h-20 bg-card border rounded-card"
                  style={{ boxShadow: value }}
                />
                <span className="text-xs text-muted font-mono">{cssVar}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
