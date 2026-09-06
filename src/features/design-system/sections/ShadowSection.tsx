const SHADOWS = [
  { label: 'sm', class: 'shadow-elevation-1' },
  { label: 'card', class: 'shadow-card' },
  { label: 'md', class: 'shadow-elevation-2' },
  { label: 'lg', class: 'shadow-elevation-3' },
  { label: 'xl', class: 'shadow-elevation-4' },
  { label: 'gold', class: 'shadow-gold' },
  { label: 'glass', class: 'shadow-glass' },
] as const

export function ShadowSection() {
  return (
    <section>
      <h2 className="mb-4 text-lg font-bold">الظلال — Shadows</h2>
      <div className="flex flex-wrap gap-6">
        {SHADOWS.map((s) => (
          <div key={s.label} className="flex flex-col items-center gap-2">
            <div className={`h-16 w-24 rounded-card border bg-card ${s.class}`} />
            <span className="font-mono text-xs text-muted">{s.label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
