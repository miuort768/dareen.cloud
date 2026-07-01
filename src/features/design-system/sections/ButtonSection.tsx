const VARIANTS = [
  { label: 'Primary', className: 'bg-primary text-on-primary hover:bg-primary-hover active:bg-primary-active' },
  { label: 'Secondary', className: 'bg-card text-main border hover:bg-hover active:bg-hover' },
  { label: 'Outline', className: 'border border-primary text-primary hover:bg-primary-soft active:bg-primary active:text-on-primary' },
  { label: 'Ghost', className: 'text-muted hover:bg-hover active:text-dim' },
  { label: 'Destructive', className: 'bg-error text-on-error hover:bg-error-hover active:bg-error-active' },
] as const;

const SIZES = [
  { label: 'SM', className: 'px-3 py-1.5 text-xs' },
  { label: 'MD', className: 'px-4 py-2 text-sm' },
  { label: 'LG', className: 'px-6 py-3 text-base' },
] as const;

export function ButtonSection() {
  return (
    <section>
      <h2 className="text-lg font-bold mb-4">الأزرار — Buttons</h2>
      <div className="space-y-6">
        {VARIANTS.map(variant => (
          <div key={variant.label}>
            <h3 className="text-sm font-semibold text-muted mb-3">{variant.label}</h3>
            <div className="flex flex-wrap gap-3 items-center">
              {SIZES.map(size => (
                <button key={size.label} className={`rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-focus ${size.className} ${variant.className}`}>
                  {variant.label} {size.label}
                </button>
              ))}
              <button disabled className={`rounded-md font-medium transition-colors opacity-50 cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-focus ${SIZES[1].className} ${variant.className}`}>
                Disabled
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
