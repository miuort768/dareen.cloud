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
  { label: 'المحصل', key: 'total', icon: TrendingUp, color: '#10B981' },
  { label: 'معلق', key: 'pending', icon: Wallet, color: '#F59E0B' },
  { label: 'متأخر', key: 'overdue', icon: AlertCircle, color: '#F43F5E' },
  { label: 'الفواتير', key: 'count', icon: FileText, color: '#2563EB' },
  { label: 'المدفوعة', key: 'paid', icon: CheckCircle, color: '#8B5CF6' },
  { label: 'المعلقة', key: 'unpaid', icon: XCircle, color: '#E11D48' },
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
          'bg-white dark:bg-slate-900 border border-slate-100/50 dark:border-slate-800/50 shadow-sm rounded-2xl',
          'p-3 flex items-center gap-3'
        )}
      >
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${s.color}12` }}>
          <s.icon size={16} style={{ color: s.color }} />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-bold text-slate-400 leading-none">{s.label}</p>
          <p className="text-sm font-black mt-1 tabular-nums leading-none" style={{ color: s.color }}>
            {getValue(props, s.key)}
          </p>
        </div>
      </div>
    ))}
  </div>
);
