const ALERTS = [
  { label: 'Success', className: 'bg-success-soft border-success text-success-dark' },
  { label: 'Warning', className: 'bg-warning-soft border-warning text-warning-dark' },
  { label: 'Error', className: 'bg-error-soft border-error text-error-dark' },
  { label: 'Info', className: 'bg-info-soft border-info text-info-dark' },
] as const;

export function AlertSection() {
  return (
    <section>
      <h2 className="text-lg font-bold mb-4">التنبيهات — Alerts</h2>
      <div className="space-y-3">
        {ALERTS.map(alert => (
          <div key={alert.label} className={`rounded-md border p-4 text-sm ${alert.className}`}>
            <strong className="font-bold">{alert.label}:</strong> هذا تنبيه توضيحي لحالة {alert.label} في النظام.
          </div>
        ))}
      </div>
    </section>
  );
}
