const RADII = [
  { label: 'none', class: 'rounded-2xl' },
  { label: 'sm', class: 'rounded-sm' },
  { label: 'md', class: 'rounded-md' },
  { label: 'lg', class: 'rounded-lg' },
  { label: 'xl', class: 'rounded-xl' },
  { label: '2xl', class: 'rounded-2xl' },
  { label: '3xl', class: 'rounded-3xl' },
  { label: 'full', class: 'rounded-full' },
] as const

export function RadiusSection() {
  return (
    <section>
      <h2 className="mb-4 text-lg font-bold">الزوايا — Border Radius</h2>
      <div className="flex flex-wrap gap-4">
        {RADII.map((r) => (
          <div key={r.label} className="flex flex-col items-center gap-2">
            <div className={`h-16 w-16 bg-primary ${r.class}`} />
            <span className="font-mono text-xs text-muted">{r.label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
