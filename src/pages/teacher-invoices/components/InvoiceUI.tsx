import { cn } from '../../../lib/utils';
import { RefreshCw } from 'lucide-react';

export const SectionCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={cn(
        'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm p-4 md:p-5',
        className
    )}>
        {children}
    </div>
);

export const SectionTitle = ({ icon: Icon, label, sub }: { icon: React.ComponentType<{ size?: number }>; label: string; sub?: string }) => (
    <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="w-8 h-8 flex items-center justify-center bg-[#eef2ff] dark:bg-indigo-900/30 rounded-xl">
            <Icon size={16} className="text-[#5c59f2]" />
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

export const InputField = (props: React.InputHTMLAttributes<HTMLInputElement | HTMLSelectElement>) => {
    const inputProps = props as React.InputHTMLAttributes<HTMLInputElement>;
    const Component = inputProps.type === 'select' ? 'select' : 'input';
    return (
        <Component
            {...inputProps}
            className={cn(
                'w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700',
                'rounded-xl px-3 py-2.5 text-sm font-medium text-slate-800 dark:text-white',
                'focus:outline-none focus:border-[#5c59f2] focus:ring-2 focus:ring-[#5c59f2]/10 transition-all',
                props.className
            )}
        />
    );
};

export const PrimaryBtn = ({ onClick, loading, children, className = '', disabled, type }: {
    onClick?: () => void; loading?: boolean; children: React.ReactNode; className?: string; disabled?: boolean; type?: "button" | "submit" | "reset"
}) => (
    <button
        type={type}
        disabled={disabled || loading}
        onClick={onClick}
        className={cn(
            'flex items-center justify-center gap-2 bg-[#5c59f2] hover:bg-indigo-700',
            'text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm',
            'disabled:opacity-50 disabled:cursor-not-allowed',
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
            'flex items-center justify-center gap-2 bg-slate-50 dark:bg-slate-800',
            'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300',
            'text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 transition-all shadow-xs',
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
            'flex items-center justify-center gap-2 bg-rose-50 dark:bg-rose-900/20',
            'hover:bg-rose-600 hover:text-white text-rose-600',
            'text-xs font-bold px-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-800 transition-all',
            className
        )}
    >
        {children}
    </button>
);
