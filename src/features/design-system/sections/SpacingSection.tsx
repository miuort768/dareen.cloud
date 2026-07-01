const SPACING = [
  { label: 'XS', space: 'p-1', size: '4px' },
  { label: 'SM', space: 'p-2', size: '8px' },
  { label: 'MD', space: 'p-4', size: '16px' },
  { label: 'LG', space: 'p-6', size: '24px' },
  { label: 'XL', space: 'p-8', size: '32px' },
  { label: '2XL', space: 'p-12', size: '48px' },
] as const;

export function SpacingSection() {
  return (
    <section>
      <h2 className="text-lg font-bold mb-4">المسافات — Spacing</h2>
      <div className="space-y-3">
        {SPACING.map(s => (
          <div key={s.label} className="flex items-center gap-4">
            <span className="text-xs text-muted font-mono w-12">{s.label}</span>
            <span className="text-xs text-dim font-mono w-16">{s.size}</span>
            <div className={`bg-primary-soft rounded flex-1 ${s.space}`}>
              <div className="bg-primary/20 h-4 rounded" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
