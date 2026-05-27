import { Users, DollarSign, CheckCircle2, AlertCircle, CreditCard, Percent } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface TeacherStats {
    totalTeachers: number;
    totalAmount: number;
    paidAmount: number;
    unpaidAmount: number;
    personalExpenses: number;
    unpaidPercentage: number;
}

interface InvoiceStatsProps {
    stats: TeacherStats;
}

const items = [
  { label: 'المعلمات', key: 'teachers', icon: Users, gradient: 'from-blue-500 to-cyan-500', shadow: 'shadow-blue-200 dark:shadow-blue-950' },
  { label: 'الإجمالي', key: 'total', icon: DollarSign, gradient: 'from-emerald-500 to-green-600', shadow: 'shadow-emerald-200 dark:shadow-emerald-950' },
  { label: 'المدفوع', key: 'paid', icon: CheckCircle2, gradient: 'from-violet-500 to-purple-600', shadow: 'shadow-violet-200 dark:shadow-violet-950' },
  { label: 'المعلق', key: 'unpaid', icon: AlertCircle, gradient: 'from-rose-500 to-pink-600', shadow: 'shadow-rose-200 dark:shadow-rose-950' },
  { label: 'مصاريف', key: 'expenses', icon: CreditCard, gradient: 'from-amber-400 to-orange-500', shadow: 'shadow-amber-200 dark:shadow-amber-950' },
  { label: 'النسبة', key: 'percent', icon: Percent, gradient: 'from-purple-500 to-fuchsia-500', shadow: 'shadow-purple-200 dark:shadow-purple-950' },
] as const;

const getValue = (s: TeacherStats, key: string) => {
  switch (key) {
    case 'teachers': return s.totalTeachers;
    case 'total': return `${s.totalAmount.toLocaleString()} ج.م`;
    case 'paid': return `${s.paidAmount.toLocaleString()} ج.م`;
    case 'unpaid': return `${s.unpaidAmount.toLocaleString()} ج.م`;
    case 'expenses': return `${s.personalExpenses.toLocaleString()} ج.م`;
    case 'percent': return `${s.unpaidPercentage}%`;
    default: return '';
  }
};

export const InvoiceStats = ({ stats }: InvoiceStatsProps) => (
  <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
    {items.map((s, i) => (
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
          <s.icon size={16} className="text-white" />
        </div>
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">{s.label}</p>
        <p className="text-xs font-black text-slate-800 dark:text-white mt-0.5 tabular-nums">
          {getValue(stats, s.key)}
        </p>
      </div>
    ))}
  </div>
);
