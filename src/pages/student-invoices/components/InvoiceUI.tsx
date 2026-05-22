import { cn } from '../../../lib/utils';
import { RefreshCw } from 'lucide-react';

export const SectionCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={cn(
    'bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-white/20 dark:border-slate-700/30',
    'rounded-2xl shadow-lg shadow-slate-200/50 dark:shadow-slate-950/30 p-4 md:p-5',
    className
  )}>
    {children}
  </div>
);

export const SectionTitle = ({ icon: Icon, label, sub }: { icon: React.ComponentType<{ size?: number }>; label: string; sub?: string }) => (
  <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
    <div className="w-8 h-8 flex items-center justify-center bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl shadow-sm shadow-indigo-200 dark:shadow-indigo-950">
      <Icon size={15} className="text-white" />
    </div>
    <div>
      <p className="text-sm font-bold text-slate-800 dark:text-white">{label}</p>
      {sub && <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

export const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
    {children}
  </label>
);

const baseInput = [
  'w-full bg-white/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700',
  'rounded-xl px-3 py-2.5 text-sm font-medium text-slate-800 dark:text-white',
  'focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200/50 dark:focus:ring-indigo-700/50',
  'transition-all duration-200',
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
      'flex items-center justify-center gap-2 bg-gradient-to-br from-indigo-500 to-violet-600',
      'hover:from-indigo-600 hover:to-violet-700 active:scale-[0.97]',
      'text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-200 dark:shadow-indigo-950',
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
      'flex items-center justify-center gap-2 bg-white/70 dark:bg-slate-800/70',
      'hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300',
      'text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 transition-all shadow-sm',
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
      'flex items-center justify-center gap-2 bg-white/70 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-800',
      'hover:bg-rose-600 hover:border-rose-600 hover:text-white text-rose-600',
      'text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm',
      'active:scale-[0.97]',
      className
    )}
  >
    {children}
  </button>
);
