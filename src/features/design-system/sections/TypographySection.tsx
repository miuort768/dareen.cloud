const TEXT_SIZES = [
  { label: 'H1', className: 'text-4xl font-bold' },
  { label: 'H2', className: 'text-3xl font-bold' },
  { label: 'H3', className: 'text-2xl font-bold' },
  { label: 'H4', className: 'text-xl font-bold' },
  { label: 'Body Large', className: 'text-lg' },
  { label: 'Body', className: 'text-base' },
  { label: 'Body Small', className: 'text-sm' },
  { label: 'Caption', className: 'text-xs text-muted' },
]

export function TypographySection() {
  return (
    <section>
      <h2 className="mb-4 text-lg font-bold">الطباعة — Typography</h2>
      <div className="space-y-3">
        {TEXT_SIZES.map(({ label, className }) => (
          <div key={label} className="flex items-center gap-4 rounded-card border p-3">
            <span className="w-24 shrink-0 font-mono text-xs text-muted">{label}</span>
            <p className={className}>مرحباً بكم في منصة دارين السابعة التعليمية</p>
          </div>
        ))}
      </div>
    </section>
  )
}
