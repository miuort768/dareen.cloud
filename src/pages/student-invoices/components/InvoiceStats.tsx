import { TrendingUp, Wallet, AlertCircle, FileText, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface InvoiceStatsProps {
    totalRevenue: number;
    pendingRevenue: number;
    overdueRevenue: number;
    invoicesLength: number;
    paidCount: number;
    pendingCount: number;
}

const stats = [
  { label: 'المحصل', key: 'total', icon: TrendingUp, color: 'var(--bg-success)' },
  { label: 'معلق', key: 'pending', icon: Wallet, color: 'var(--bg-warning)' },
  { label: 'متأخر', key: 'overdue', icon: AlertCircle, color: 'var(--bg-error)' },
  { label: 'الفواتير', key: 'count', icon: FileText, color: 'var(--bg-primary)' },
  { label: 'المدفوعة', key: 'paid', icon: CheckCircle, color: 'var(--bg-primary)' },
  { label: 'المعلقة', key: 'unpaid', icon: XCircle, color: 'var(--bg-error)' },
] as const;

const getValue = (props: InvoiceStatsProps, key: string) => {
  switch (key) {
    case 'total': return `${props.totalRevenue.toLocaleString()} ج.م`;
    case 'pending': return `${props.pendingRevenue.toLocaleString()} ج.م`;
    case 'overdue': return `${props.overdueRevenue.toLocaleString()} ج.م`;
    case 'count': return props.invoicesLength;
    case 'paid': return props.paidCount;
    case 'unpaid': return props.pendingCount;
    default: return '';
  }
};

export const InvoiceStats = (props: InvoiceStatsProps) => (
  <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
    {stats.map((s, i) => (
      <div
        key={i}
        className={cn(
          'rounded-2xl p-3 flex items-center gap-3 dark:brightness-[0.65]'
        )}
        style={{ backgroundColor: s.color }}
      >
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-white/15">
          <s.icon size={16} className="text-on-primary" />
        </div>
        <div className="min-w-0">
          <p className="text-micro font-bold text-on-primary/70 leading-none">{s.label}</p>
          <p className="text-sm font-black mt-1 tabular-nums leading-none text-on-primary">
            {getValue(props, s.key)}
          </p>
        </div>
      </div>
    ))}
  </div>
);
