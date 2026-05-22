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
  { label: 'المحصل', key: 'total', icon: TrendingUp, gradient: 'from-emerald-500 to-green-600', shadow: 'shadow-emerald-200 dark:shadow-emerald-950' },
  { label: 'معلق', key: 'pending', icon: Wallet, gradient: 'from-amber-400 to-orange-500', shadow: 'shadow-amber-200 dark:shadow-amber-950' },
  { label: 'متأخر', key: 'overdue', icon: AlertCircle, gradient: 'from-rose-500 to-pink-600', shadow: 'shadow-rose-200 dark:shadow-rose-950' },
  { label: 'الفواتير', key: 'count', icon: FileText, gradient: 'from-blue-500 to-cyan-500', shadow: 'shadow-blue-200 dark:shadow-blue-950' },
  { label: 'المدفوعة', key: 'paid', icon: CheckCircle, gradient: 'from-indigo-500 to-violet-600', shadow: 'shadow-indigo-200 dark:shadow-indigo-950' },
  { label: 'المعلقة', key: 'unpaid', icon: XCircle, gradient: 'from-purple-500 to-fuchsia-500', shadow: 'shadow-purple-200 dark:shadow-purple-950' },
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
          'relative overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm',
          'border border-white/20 dark:border-slate-700/30 p-3 rounded-2xl shadow-lg shadow-slate-200/50 dark:shadow-slate-950/30',
          'flex flex-col items-center text-center group'
        )}
      >
        <div className={cn(
          "w-9 h-9 rounded-xl flex items-center justify-center mb-2 bg-gradient-to-br shadow-sm",
          s.gradient, s.shadow,
          "transition-transform group-hover:scale-110 duration-200"
        )}>
          <s.icon size={16} className="text-white" />
        </div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{s.label}</p>
        <p className="text-xs font-black text-slate-800 dark:text-white mt-0.5 tabular-nums">
          {getValue(props, s.key)}
        </p>
      </div>
    ))}
  </div>
);
