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
  { label: 'المحصل', key: 'total', icon: TrendingUp, gradient: 'from-emerald-500 to-green-600' },
  { label: 'معلق', key: 'pending', icon: Wallet, gradient: 'from-amber-400 to-orange-500' },
  { label: 'متأخر', key: 'overdue', icon: AlertCircle, gradient: 'from-rose-500 to-pink-600' },
  { label: 'الفواتير', key: 'count', icon: FileText, gradient: 'from-blue-500 to-cyan-500' },
  { label: 'المدفوعة', key: 'paid', icon: CheckCircle, gradient: 'from-blue-500 to-violet-600' },
  { label: 'المعلقة', key: 'unpaid', icon: XCircle, gradient: 'from-purple-500 to-fuchsia-500' },
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
          'relative bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700/50 shadow-sm rounded-2xl',
          'p-3 flex flex-col items-center text-center'
        )}
      >
        <div className={cn(
          "w-8 h-8 flex items-center justify-center bg-gradient-to-br text-white shadow-sm mb-1.5 rounded-xl",
          s.gradient
        )}>
          <s.icon size={14} />
        </div>
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">{s.label}</p>
        <p className="text-xs font-black text-slate-800 dark:text-white mt-0.5 tabular-nums">
          {getValue(props, s.key)}
        </p>
      </div>
    ))}
  </div>
);
