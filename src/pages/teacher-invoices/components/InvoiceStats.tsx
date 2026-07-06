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
  { label: 'المعلمات', key: 'teachers', icon: Users, color: 'var(--bg-primary)' },
  { label: 'الإجمالي', key: 'total', icon: DollarSign, color: 'var(--bg-success)' },
  { label: 'المدفوع', key: 'paid', icon: CheckCircle2, color: 'var(--bg-info)' },
  { label: 'المعلق', key: 'unpaid', icon: AlertCircle, color: 'var(--bg-error)' },
  { label: 'مصاريف', key: 'expenses', icon: CreditCard, color: 'var(--bg-warning)' },
  { label: 'النسبة', key: 'percent', icon: Percent, color: 'var(--bg-error)' },
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
            {getValue(stats, s.key)}
          </p>
        </div>
      </div>
    ))}
  </div>
);
