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
  { label: 'المعلمات', key: 'teachers', icon: Users, color: '#8B5CF6' },
  { label: 'الإجمالي', key: 'total', icon: DollarSign, color: '#10B981' },
  { label: 'المدفوع', key: 'paid', icon: CheckCircle2, color: '#2563EB' },
  { label: 'المعلق', key: 'unpaid', icon: AlertCircle, color: '#F43F5E' },
  { label: 'مصاريف', key: 'expenses', icon: CreditCard, color: '#F59E0B' },
  { label: 'النسبة', key: 'percent', icon: Percent, color: '#E11D48' },
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
          'rounded-none p-3 flex items-center gap-3 dark:brightness-[0.65]'
        )}
        style={{ backgroundColor: s.color }}
      >
        <div className="w-9 h-9 rounded-none flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
          <s.icon size={16} className="text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-bold text-white/70 leading-none">{s.label}</p>
          <p className="text-sm font-black mt-1 tabular-nums leading-none text-white">
            {getValue(stats, s.key)}
          </p>
        </div>
      </div>
    ))}
  </div>
);
