const TEXT_SIZES = [
  { label: 'H1', className: 'text-4xl font-bold' },
  { label: 'H2', className: 'text-3xl font-bold' },
  { label: 'H3', className: 'text-2xl font-bold' },
  { label: 'H4', className: 'text-xl font-bold' },
  { label: 'Body Large', className: 'text-lg' },
  { label: 'Body', className: 'text-base' },
  { label: 'Body Small', className: 'text-sm' },
  { label: 'Caption', className: 'text-xs text-muted' },
];

export function TypographySection() {
  return (
    <section>
      <h2 className="text-lg font-bold mb-4">الطباعة — Typography</h2>
      <div className="space-y-3">
        {TEXT_SIZES.map(({ label, className }) => (
          <div key={label} className="flex items-center gap-4 p-3 rounded-card border">
            <span className="text-xs text-muted font-mono w-24 shrink-0">{label}</span>
            <p className={className}>مرحباً بكم في منصة دارين التعليمية</p>
          </div>
        ))}
      </div>
    </section>
  );
}
