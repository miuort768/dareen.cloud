const SHADOWS = [
  { label: 'sm', class: 'shadow-sm' },
  { label: 'md', class: 'shadow-md' },
  { label: 'lg', class: 'shadow-lg' },
  { label: 'xl', class: 'shadow-xl' },
] as const;

export function ShadowSection() {
  return (
    <section>
      <h2 className="text-lg font-bold mb-4">الظلال — Shadows</h2>
      <div className="flex flex-wrap gap-6">
        {SHADOWS.map(s => (
          <div key={s.label} className="flex flex-col items-center gap-2">
            <div className={`w-24 h-16 bg-card border rounded-card ${s.class}`} />
            <span className="text-xs text-muted font-mono">{s.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
