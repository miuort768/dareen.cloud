import { mockTableData } from '../data/mockData';

export function TableSection() {
  return (
    <section>
      <h2 className="text-lg font-bold mb-4">الجداول — Tables</h2>
      <div className="overflow-x-auto rounded-card border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-surface border-b">
              <th className="text-start p-3 font-semibold text-muted">الاسم</th>
              <th className="text-start p-3 font-semibold text-muted">المادة</th>
              <th className="text-start p-3 font-semibold text-muted">الحالة</th>
              <th className="text-start p-3 font-semibold text-muted">الدرجة</th>
            </tr>
          </thead>
          <tbody>
            {mockTableData.map((row, i) => (
              <tr key={row.id} className={`border-b last:border-0 hover:bg-hover transition-colors ${i === 1 ? 'bg-primary-soft' : ''}`}>
                <td className="p-3 text-main">{row.name}</td>
                <td className="p-3 text-muted">{row.subject}</td>
                <td className="p-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    row.status === 'نشط' ? 'bg-success-soft text-success-dark' :
                    row.status === 'غير نشط' ? 'bg-warning-soft text-warning-dark' :
                    'bg-error-soft text-error-dark'
                  }`}>
                    {row.status}
                  </span>
                </td>
                <td className="p-3 font-mono text-main">{row.grade}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between mt-3 text-sm">
        <p className="text-muted">عرض 1-5 من 20</p>
        <div className="flex gap-2">
          <button className="px-3 py-1 rounded border text-muted hover:bg-hover focus:outline-none focus:ring-2 focus:ring-focus">السابق</button>
          <button className="px-3 py-1 rounded bg-primary text-on-primary focus:outline-none focus:ring-2 focus:ring-focus">1</button>
          <button className="px-3 py-1 rounded border text-muted hover:bg-hover focus:outline-none focus:ring-2 focus:ring-focus">2</button>
          <button className="px-3 py-1 rounded border text-muted hover:bg-hover focus:outline-none focus:ring-2 focus:ring-focus">التالي</button>
        </div>
      </div>
    </section>
  );
}
