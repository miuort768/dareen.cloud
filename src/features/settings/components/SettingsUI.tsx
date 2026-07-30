import type { LucideIcon } from 'lucide-react';
import { RefreshCw } from 'lucide-react';
import { cn } from '../../../lib/utils';

export const AVAILABLE_PERMISSIONS = [
    { id: '*', label: 'وصول كامل (Admin)' },
    { id: 'view_students', label: 'عرض الطلاب' },
    { id: 'manage_students', label: 'إدارة الطلاب' },
    { id: 'view_teachers', label: 'عرض المعلمين' },
    { id: 'manage_teachers', label: 'إدارة المعلمين' },
    { id: 'view_finance', label: 'عرض المالية' },
    { id: 'manage_finance', label: 'إدارة المالية' },
    { id: 'manage_system', label: 'إدارة النظام' }
];

export const SectionCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={cn(
        'bg-card border border-border/30 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300',
        className
    )}>
        {children}
    </div>
);

export const SectionTitle = ({ icon: Icon, label, sub }: { icon: LucideIcon; label: string; sub?: string }) => (
    <div className="flex items-center gap-3 mb-5 pb-4 border-b border-border/30">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-primary/10">
            <Icon size={17} className="text-primary" />
        </div>
        <div>
            <p className="text-sm font-bold text-main">{label}</p>
            {sub && <p className="text-[11px] font-bold text-muted mt-0.5">{sub}</p>}
        </div>
    </div>
);

export const FieldLabel = ({ children }: { children: React.ReactNode }) => (
    <label className="block text-[11px] font-bold text-muted mb-1.5">
        {children}
    </label>
);

export const InputField = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input
        {...props}
        className={cn(
            'w-full bg-background border border-border/40',
            'px-3.5 py-2.5 text-sm font-bold text-main',
            'focus:outline-none focus:border-primary focus:ring-2 focus:ring-focus/50 transition-all',
            'placeholder:text-muted/60',
            props.className
        )}
    />
);

export const TextAreaField = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
    <textarea
        {...props}
        className={cn(
            'w-full bg-background border border-border/40',
            'px-3.5 py-2.5 text-sm font-bold text-main resize-none',
            'focus:outline-none focus:border-primary focus:ring-2 focus:ring-focus/50 transition-all',
            'placeholder:text-muted/60',
            props.className
        )}
    />
);

export const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className={cn(
            'w-11 h-6 rounded-full relative transition-all duration-300 shrink-0',
            checked ? 'bg-primary shadow-sm shadow-primary/30' : 'bg-border/60'
        )}
    >
        <div className={cn(
            'absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300',
            checked ? 'translate-x-5' : 'translate-x-0.5'
        )} />
    </button>
);

export const PrimaryBtn = ({ onClick, loading, children, className = '' }: {
    onClick?: () => void; loading?: boolean; children: React.ReactNode; className?: string
}) => (
    <button
        onClick={onClick}
        className={cn(
            'flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover',
            'text-on-primary text-xs font-bold px-5 py-2.5 rounded-xl active:scale-95 transition-all shadow-sm hover:shadow-md',
            className
        )}
    >
        {loading ? <RefreshCw size={14} className="animate-spin" /> : children}
    </button>
);

export const SecondaryBtn = ({ onClick, children, className = '' }: {
    onClick?: () => void; children: React.ReactNode; className?: string
}) => (
    <button
        onClick={onClick}
        className={cn(
            'flex items-center justify-center gap-2 bg-card border border-border/40 hover:bg-surface',
            'text-muted hover:text-main text-xs font-bold px-5 py-2.5 rounded-xl active:scale-95 transition-all',
            className
        )}
    >
        {children}
    </button>
);

export const DangerBtn = ({ onClick, children, className = '' }: {
    onClick?: () => void; children: React.ReactNode; className?: string
}) => (
    <button
        onClick={onClick}
        className={cn(
            'flex items-center justify-center gap-2 border-2 border-error/30 bg-error/10',
            'hover:bg-error hover:text-on-error text-error text-xs font-bold px-5 py-2.5 rounded-xl active:scale-95 transition-all shadow-sm hover:shadow-md',
            className
        )}
    >
        {children}
    </button>
);

export const ToggleRow = ({
    icon: Icon, label, sub, checked, onChange
}: { icon: LucideIcon; label: string; sub?: string; checked: boolean; onChange: () => void }) => (
    <div className="flex items-center justify-between py-3 px-4 bg-background border border-border/30 rounded-xl">
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary/10">
                <Icon size={15} className="text-primary" />
            </div>
            <div>
                <p className="text-xs font-bold text-main">{label}</p>
                {sub && <p className="text-[11px] font-bold text-muted mt-0.5">{sub}</p>}
            </div>
        </div>
        <Toggle checked={checked} onChange={onChange} />
    </div>
);
