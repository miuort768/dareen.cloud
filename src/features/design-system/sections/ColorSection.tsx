import { semantic } from '../../../theme/semantic';

const GROUPS = [
  {
    label: 'الخلفيات',
    tokens: ['bg-surface', 'bg-background', 'bg-card', 'bg-hover'],
  },
  {
    label: 'Primary',
    tokens: ['bg-primary', 'bg-primary-hover', 'bg-primary-active', 'bg-primary-soft', 'bg-primary-light'],
  },
  {
    label: 'Accent (Gold)',
    tokens: ['bg-accent', 'bg-accent-hover', 'bg-accent-soft', 'bg-accent-light'],
  },
  {
    label: 'الحالات',
    tokens: ['bg-success', 'bg-warning', 'bg-error', 'bg-info', 'bg-success-soft', 'bg-warning-soft', 'bg-error-soft', 'bg-info-soft'],
  },
  {
    label: 'النصوص',
    tokens: ['text-main', 'text-muted', 'text-dim', 'text-inverse', 'text-on-primary', 'text-primary', 'text-accent'],
  },
  {
    label: 'الحدود',
    tokens: ['border', 'border-strong', 'divider'],
  },
];

export function ColorSection() {
  return (
    <section>
      <h2 className="text-lg font-bold mb-4">الألوان — Semantic Tokens</h2>
      <div className="space-y-6">
        {GROUPS.map(group => (
          <div key={group.label}>
            <h3 className="text-sm font-semibold text-muted mb-3">{group.label}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {group.tokens.map(token => {
                const value = semantic[token as keyof typeof semantic];
                return (
                  <div key={token} className="flex items-center gap-3 p-3 rounded-card border">
                    <div
                      className="w-10 h-10 rounded-md shrink-0 border"
                      style={{
                        backgroundColor: token.startsWith('text-') ? 'transparent' : value,
                        borderColor: token.startsWith('border-') || token === 'border' || token === 'divider' ? value : undefined,
                      }}
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-mono text-main">{token}</div>
                      <div className="text-[10px] text-muted font-mono truncate">{value}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
