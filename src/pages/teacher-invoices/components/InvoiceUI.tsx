import { motion } from 'framer-motion';
import { cn } from '../../../lib/utils';
import { RefreshCw } from 'lucide-react';

export const SectionCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={cn('bg-card border border-border/60 rounded-2xl shadow-sm', className)}>
        {children}
    </div>
);

export const SectionTitle = ({ icon: Icon, label, sub }: { icon: React.ComponentType<{ size?: number }>; label: string; sub?: string }) => (
  <div className="flex items-center gap-3">
    <div className="w-8 h-8 rounded-xl bg-primary-soft text-primary flex items-center justify-center">
      <Icon size={15} />
    </div>
    <div>
      <p className="text-xs font-bold text-main">{label}</p>
      {sub && <p className="text-[8px] text-muted mt-0.5">{sub}</p>}
    </div>
  </div>
);

export const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-[8px] font-bold text-muted mb-1 uppercase tracking-wide">
    {children}
  </label>
);

const baseInput = [
  'w-full bg-surface border border-border/60',
  'px-3 py-2 text-[10px] font-bold text-main',
  'focus:outline-none focus:ring-2 focus:ring-focus',
  'transition-all duration-200 rounded-xl',
].join(' ');

export const InputField = (props: React.InputHTMLAttributes<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
  const inputProps = props as React.InputHTMLAttributes<HTMLInputElement>;
  const Component = inputProps.type === 'select' ? 'select' : inputProps.type === 'textarea' ? 'textarea' : 'input';
  return <Component {...inputProps} className={cn(baseInput, props.className)} />;
};

export const PrimaryBtn = ({ onClick, loading, children, className = '', disabled, type }: {
  onClick?: () => void; loading?: boolean; children: React.ReactNode; className?: string; disabled?: boolean; type?: "button" | "submit" | "reset"
}) => (
  <button
    type={type}
    disabled={disabled || loading}
    onClick={onClick}
    className={cn(
      'flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover',
      'active:scale-[0.97] text-on-primary text-[9px] font-bold px-4 py-2 transition-all rounded-xl',
      'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
      className
    )}
  >
    {loading ? <RefreshCw size={13} className="animate-spin" /> : children}
  </button>
);

export const SecondaryBtn = ({ onClick, children, className = '', title }: {
  onClick?: () => void; children: React.ReactNode; className?: string; title?: string
}) => (
  <button
    title={title}
    onClick={onClick}
    className={cn(
      'flex items-center justify-center gap-2 bg-card',
      'hover:bg-surface text-muted',
      'text-[9px] font-bold px-3 py-2 border border-border/60 transition-all rounded-xl',
      'active:scale-[0.97]',
      className
    )}
  >
    {children}
  </button>
);

export const DangerBtn = ({ onClick, children, className = '', title }: {
  onClick?: () => void; children: React.ReactNode; className?: string; title?: string
}) => (
  <button
    title={title}
    onClick={onClick}
    className={cn(
      'flex items-center justify-center gap-2 bg-card border border-error/30',
      'hover:bg-error hover:border-error hover:text-on-error text-error',
      'text-[9px] font-bold px-3 py-2 transition-all rounded-xl',
      'active:scale-[0.97]',
      className
    )}
  >
    {children}
  </button>
);

/** Premium KPI card for InvoiceStats */
export const KpiCard = ({ title, value, icon: Icon, accent }: {
    title: string; value: string | number; icon: React.ComponentType<{ size?: number }>;
    accent: 'primary' | 'success' | 'error' | 'warning' | 'info';
}) => {
    const gradientMap = {
        primary: 'from-primary to-purple-400',
        success: 'from-success to-emerald-400',
        error: 'from-error to-rose-400',
        warning: 'from-warning to-amber-400',
        info: 'from-info to-blue-400',
    };
    const bgMap = {
        primary: 'bg-primary/[8%] text-primary',
        success: 'bg-success/[8%] text-success',
        error: 'bg-error/[8%] text-error',
        warning: 'bg-warning/[8%] text-warning',
        info: 'bg-info/[8%] text-info',
    };
    return (
        <motion.div whileHover={{ scale: 1.01, y: -1 }}
            className="relative overflow-hidden rounded-2xl bg-card border border-border/60 shadow-sm hover:shadow-md transition-all p-3.5">
            <div className={`absolute inset-0 opacity-[0.02] bg-gradient-to-br ${gradientMap[accent]}`} />
            <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${gradientMap[accent]}`} />
            <div className="relative flex items-start gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${bgMap[accent]}`}>
                    <Icon size={14} />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-[9px] font-bold text-muted">{title}</p>
                    <motion.p initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                        className="text-sm font-bold text-main tabular-nums leading-none mt-0.5">
                        {value}
                    </motion.p>
                </div>
            </div>
        </motion.div>
    );
};