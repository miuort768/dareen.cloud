import { cn } from '../../../lib/utils';
import { RefreshCw } from 'lucide-react';

export const SectionCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={cn(
    'bg-white dark:bg-slate-900 border border-slate-100/50 dark:border-slate-800/50 shadow-sm rounded-2xl',
    className
  )}>
    {children}
  </div>
);

export const SectionTitle = ({ icon: Icon, label, sub }: { icon: React.ComponentType<{ size?: number }>; label: string; sub?: string }) => (
  <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100/50 dark:border-slate-800/50">
    <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#8B5CF612' }}>
      <Icon size={15} style={{ color: '#8B5CF6' }} />
    </div>
    <div>
      <p className="text-sm font-bold text-slate-800 dark:text-white">{label}</p>
      {sub && <p className="text-[10px] font-bold text-slate-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

export const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wide">
    {children}
  </label>
);

const baseInput = [
  'w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700',
  'px-3 py-2 text-xs font-bold text-slate-800 dark:text-white',
  'focus:outline-none focus:border-[#6C4BFF] focus:ring-2 focus:ring-purple-200/50 dark:focus:ring-purple-700/50',
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
      'flex items-center justify-center gap-2 bg-[#8B5CF6] hover:bg-[#7c3aed]',
      'active:scale-[0.97] text-white text-xs font-bold px-4 py-2 transition-all shadow-sm rounded-xl',
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
      'flex items-center justify-center gap-2 bg-white dark:bg-slate-800',
      'hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300',
      'text-xs font-bold px-3 py-2 border border-slate-200 dark:border-slate-700 transition-all shadow-sm rounded-xl',
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
      'flex items-center justify-center gap-2 bg-white dark:bg-rose-900/10 border border-rose-200 dark:border-rose-800',
      'hover:bg-rose-600 hover:border-rose-600 hover:text-white text-rose-600',
      'text-xs font-bold px-3 py-2 transition-all shadow-sm rounded-xl',
      'active:scale-[0.97]',
      className
    )}
  >
    {children}
  </button>
);
