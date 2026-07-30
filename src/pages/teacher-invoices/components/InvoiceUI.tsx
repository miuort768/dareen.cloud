import { motion } from 'framer-motion';
import { cn } from '../../../lib/utils';
import { RefreshCw } from 'lucide-react';

export const SectionCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={cn('bg-card border border-border/30 rounded-2xl shadow-sm hover:shadow-md transition-all', className)}>
        {children}
    </div>
);

export const SectionTitle = ({ icon: Icon, label, sub }: { icon: React.ComponentType<{ size?: number }>; label: string; sub?: string }) => (
  <div className="flex items-center gap-3">
    <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
      <Icon size={16} />
    </div>
    <div>
      <p className="text-sm font-bold text-main">{label}</p>
      {sub && <p className="text-[10px] text-muted mt-0.5">{sub}</p>}
    </div>
  </div>
);

export const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-[10px] font-bold text-muted mb-1">{children}</label>
);

const baseInput = [
  'w-full bg-background border border-border/40',
  'px-3.5 py-2.5 text-xs font-bold text-main',
  'focus:outline-none focus:ring-2 focus:ring-focus/50 focus:border-primary',
  'transition-all duration-200 rounded-xl placeholder:text-muted/60',
].join(' ');

export const InputField = (props: React.InputHTMLAttributes<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
  const inputProps = props as React.InputHTMLAttributes<HTMLInputElement>;
  const Component = inputProps.type === 'select' ? 'select' : inputProps.type === 'textarea' ? 'textarea' : 'input';
  return <Component {...inputProps} className={cn(baseInput, props.className)} />;
};

export const PrimaryBtn = ({ onClick, loading, children, className = '', disabled, type }: {
  onClick?: () => void; loading?: boolean; children: React.ReactNode; className?: string; disabled?: boolean; type?: "button" | "submit" | "reset"
}) => (
  <button type={type} disabled={disabled || loading} onClick={onClick}
    className={cn('flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover active:scale-[0.97] text-on-primary text-xs font-bold px-5 py-2.5 transition-all rounded-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 shadow-sm hover:shadow-md', className)}>
    {loading ? <RefreshCw size={14} className="animate-spin" /> : children}
  </button>
);

export const SecondaryBtn = ({ onClick, children, className = '', title }: {
  onClick?: () => void; children: React.ReactNode; className?: string; title?: string
}) => (
  <button title={title} onClick={onClick}
    className={cn('flex items-center justify-center gap-2 bg-card border border-border/40 hover:bg-surface text-muted hover:text-main text-xs font-bold px-4 py-2.5 transition-all rounded-xl active:scale-[0.97]', className)}>
    {children}
  </button>
);

export const DangerBtn = ({ onClick, children, className = '', title }: {
  onClick?: () => void; children: React.ReactNode; className?: string; title?: string
}) => (
  <button title={title} onClick={onClick}
    className={cn('flex items-center justify-center gap-2 border-2 border-error/30 bg-error/10 hover:bg-error hover:text-on-primary text-error text-xs font-bold px-4 py-2.5 transition-all rounded-xl active:scale-[0.97]', className)}>
    {children}
  </button>
);

const kpiAccentMap = {
    primary: { gradient: 'from-primary/20 to-primary/5', iconBg: 'bg-primary/10 text-primary', accent: 'bg-primary' },
    success: { gradient: 'from-success/20 to-success/5', iconBg: 'bg-success/10 text-success', accent: 'bg-success' },
    error: { gradient: 'from-error/20 to-error/5', iconBg: 'bg-error/10 text-error', accent: 'bg-error' },
    warning: { gradient: 'from-warning/20 to-warning/5', iconBg: 'bg-warning/10 text-warning', accent: 'bg-warning' },
    info: { gradient: 'from-info/20 to-info/5', iconBg: 'bg-info/10 text-info', accent: 'bg-info' },
};

export const KpiCard = ({ title, value, icon: Icon, accent }: {
    title: string; value: string | number; icon: React.ComponentType<{ size?: number }>;
    accent: 'primary' | 'success' | 'error' | 'warning' | 'info';
}) => {
    const style = kpiAccentMap[accent];
    return (
        <motion.div whileHover={{ scale: 1.02, y: -2 }}
            className={cn("relative overflow-hidden rounded-xl bg-gradient-to-br border border-border/50 p-3.5", style.gradient)}>
            <div className="flex items-center justify-between mb-3">
                <div className={cn("p-2 rounded-lg", style.iconBg)}><Icon size={16} /></div>
                <div className={cn("h-1 w-10 rounded-full", style.accent)} />
            </div>
            <p className="text-[10px] text-muted mb-0.5">{title}</p>
            <motion.p initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                className="text-lg font-bold text-main tabular-nums leading-none">{value}</motion.p>
        </motion.div>
    );
};
