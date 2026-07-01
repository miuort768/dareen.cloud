const RADII = [
  { label: 'none', class: 'rounded-none' },
  { label: 'sm', class: 'rounded-sm' },
  { label: 'md', class: 'rounded-md' },
  { label: 'lg', class: 'rounded-lg' },
  { label: 'xl', class: 'rounded-xl' },
  { label: '2xl', class: 'rounded-2xl' },
  { label: '3xl', class: 'rounded-3xl' },
  { label: 'full', class: 'rounded-full' },
] as const;

export function RadiusSection() {
  return (
    <section>
      <h2 className="text-lg font-bold mb-4">الزوايا — Border Radius</h2>
      <div className="flex flex-wrap gap-4">
        {RADII.map(r => (
          <div key={r.label} className="flex flex-col items-center gap-2">
            <div className={`w-16 h-16 bg-primary ${r.class}`} />
            <span className="text-xs text-muted font-mono">{r.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
