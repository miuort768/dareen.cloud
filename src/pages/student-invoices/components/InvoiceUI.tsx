import { cn } from '../../../lib/utils';
import { RefreshCw } from 'lucide-react';

export const SectionCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={cn(
    'bg-card border border-border rounded-2xl',
    className
  )}>
    {children}
  </div>
);

export const SectionTitle = ({ icon: Icon, label, sub }: { icon: React.ComponentType<{ size?: number }>; label: string; sub?: string }) => (
  <div className="flex items-center gap-3 mb-4 pb-3 border-b border-border">
    <div className="w-8 h-8 rounded-xl bg-primary-soft text-primary flex items-center justify-center">
      <Icon size={15} />
    </div>
    <div>
      <p className="text-sm font-bold text-main">{label}</p>
      {sub && <p className="text-micro font-bold text-muted mt-0.5">{sub}</p>}
    </div>
  </div>
);

export const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-micro font-bold text-muted mb-1 uppercase tracking-wide">
    {children}
  </label>
);

const baseInput = [
  'w-full bg-surface border border-border',
  'px-3 py-2 text-xs font-medium text-main',
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
      'active:scale-[0.97] text-on-primary text-xs font-bold px-4 py-2 transition-all rounded-xl',
      'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
      className
    )}
  >
    {loading ? <RefreshCw size={14} className="animate-spin" /> : children}
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
      'hover:bg-hover text-muted',
      'text-xs font-bold px-3 py-2 border border-border transition-all rounded-xl',
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
      'flex items-center justify-center gap-2 bg-card border border-error',
      'hover:bg-error hover:border-error hover:text-on-error text-error',
      'text-xs font-bold px-3 py-2 transition-all rounded-xl',
      'active:scale-[0.97]',
      className
    )}
  >
    {children}
  </button>
);
