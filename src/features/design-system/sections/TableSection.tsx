import { mockTableData } from '../data/mockData'

export function TableSection() {
  return (
    <section>
      <h2 className="mb-4 text-lg font-bold">الجداول — Tables</h2>
      <div className="overflow-x-auto rounded-card border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-surface">
              <th className="p-3 text-start font-semibold text-muted">الاسم</th>
              <th className="p-3 text-start font-semibold text-muted">المادة</th>
              <th className="p-3 text-start font-semibold text-muted">الحالة</th>
              <th className="p-3 text-start font-semibold text-muted">الدرجة</th>
            </tr>
          </thead>
          <tbody>
            {mockTableData.map((row, i) => (
              <tr
                key={row.id}
                className={`border-b transition-colors last:border-0 hover:bg-hover ${i === 1 ? 'bg-primary-soft' : ''}`}
              >
                <td className="p-3 text-main">{row.name}</td>
                <td className="p-3 text-muted">{row.subject}</td>
                <td className="p-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      row.status === 'نشط'
                        ? 'bg-success-soft text-success-dark'
                        : row.status === 'غير نشط'
                          ? 'bg-warning-soft text-warning-dark'
                          : 'bg-error-soft text-error-dark'
                    }`}
                  >
                    {row.status}
                  </span>
                </td>
                <td className="p-3 font-mono text-main">{row.grade}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex items-center justify-between text-sm">
        <p className="text-muted">عرض 1-5 من 20</p>
        <div className="flex gap-2">
          <button className="rounded border px-3 py-1 text-muted outline-none hover:bg-hover focus-visible:ring-2 focus-visible:ring-focus">
            السابق
          </button>
          <button className="rounded bg-primary px-3 py-1 text-on-primary outline-none focus-visible:ring-2 focus-visible:ring-focus">
            1
          </button>
          <button className="rounded border px-3 py-1 text-muted outline-none hover:bg-hover focus-visible:ring-2 focus-visible:ring-focus">
            2
          </button>
          <button className="rounded border px-3 py-1 text-muted outline-none hover:bg-hover focus-visible:ring-2 focus-visible:ring-focus">
            التالي
          </button>
        </div>
      </div>
    </section>
  )
}
