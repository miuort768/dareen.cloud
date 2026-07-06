/* eslint-disable react-refresh/only-export-components */
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

export const THEME_COLORS = [
    { id: 'indigo', label: 'نيلي', class: 'bg-primary' },
    { id: 'blue', label: 'أزرق', class: 'bg-info' },
    { id: 'emerald', label: 'زمردي', class: 'bg-success' },
    { id: 'rose', label: 'وردي', class: 'bg-error' },
    { id: 'amber', label: 'كهرماني', class: 'bg-warning' },
    { id: 'purple', label: 'أرجواني', class: 'bg-primary' },
    { id: 'cyan', label: 'سيان', class: 'bg-info' },
    { id: 'teal', label: 'تركواز', class: 'bg-info' },
    { id: 'orange', label: 'برتقالي', class: 'bg-warning' },
    { id: 'slate', label: 'صخري', class: 'bg-background0' },
    { id: 'pink', label: 'زهري', class: 'bg-primary' },
    { id: 'lime', label: 'ليموني', class: 'bg-success' },
    { id: 'sky', label: 'سماوي', class: 'bg-info' },
    { id: 'fuchsia', label: 'فوشيا', class: 'bg-primary' },
    { id: 'sunset', label: 'غروب', class: 'bg-gradient-to-tr from-[var(--bg-warning)] to-[var(--bg-error)]' },
    { id: 'ocean', label: 'محيط', class: 'bg-gradient-to-tr from-[var(--bg-info)] to-[var(--bg-info)]' },
    { id: 'forest', label: 'غابة', class: 'bg-gradient-to-tr from-[var(--bg-success)] to-[var(--bg-success)]' },
    { id: 'royal', label: 'ملكي', class: 'bg-gradient-to-tr from-[var(--bg-primary)] to-[var(--bg-primary)]' },
    { id: 'electric', label: 'كهربائي', class: 'bg-gradient-to-tr from-[var(--bg-primary)] to-[var(--bg-primary)]' },
    { id: 'berry', label: 'توت', class: 'bg-gradient-to-tr from-[var(--bg-primary)] to-[var(--bg-primary)]' },
    { id: 'gold', label: 'ذهبي', class: 'bg-warning' },
    { id: 'crimson', label: 'قرمزي', class: 'bg-error' },
    { id: 'midnight', label: 'ليلي', class: 'bg-primary-active' },
    { id: 'lava', label: 'حمم', class: 'bg-warning' },
    { id: 'mint', label: 'نعناع', class: 'bg-success' },
    { id: 'lavender', label: 'خزامي', class: 'bg-primary-light' },
    { id: 'spring', label: 'ربيعي', class: 'bg-success' },
    { id: 'flame', label: 'لهب', class: 'bg-warning' },
    { id: 'nebula', label: 'سديم', class: 'bg-gradient-to-tr from-[var(--bg-primary)] to-[var(--bg-primary)]' },
    { id: 'aurora', label: 'شفق', class: 'bg-gradient-to-tr from-[var(--bg-success)] to-[var(--bg-info)]' },
    { id: 'fire', label: 'نار', class: 'bg-gradient-to-tr from-[var(--bg-error)] to-[var(--bg-warning)]' },
    { id: 'ice', label: 'جليد', class: 'bg-gradient-to-tr from-[var(--bg-info)] to-[var(--bg-info)]' },
    { id: 'jungle', label: 'أدغال', class: 'bg-gradient-to-tr from-[var(--bg-success)] to-[var(--bg-success)]' },
    { id: 'desert', label: 'صحراء', class: 'bg-gradient-to-tr from-[var(--bg-warning)] to-[var(--bg-warning)]' },
    { id: 'coffee', label: 'قهوة', class: 'bg-card' },
];

export const SectionCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={cn(
        'bg-card border border-border rounded-2xl shadow-sm p-5',
        className
    )}>
        {children}
    </div>
);

export const SectionTitle = ({ icon: Icon, label, sub }: { icon: LucideIcon; label: string; sub?: string }) => (
    <div className="flex items-center gap-3 mb-4 pb-3 border-b border-border">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-primary-soft">
            <Icon size={16} className="text-primary" />
        </div>
        <div>
            <p className="text-sm font-bold text-main">{label}</p>
            {sub && <p className="text-[10px] font-bold text-dim mt-0.5">{sub}</p>}
        </div>
    </div>
);

export const FieldLabel = ({ children }: { children: React.ReactNode }) => (
    <label className="block text-[11px] font-bold text-muted mb-1.5 uppercase tracking-wide">
        {children}
    </label>
);

export const InputField = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input
        {...props}
        className={cn(
            'w-full bg-surface border border-border',
            'px-3 py-2.5 text-sm font-bold text-main',
            'focus:outline-none focus:border-primary focus:ring-2 focus:ring-focus transition-all',
            props.className
        )}
    />
);

export const TextAreaField = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
    <textarea
        {...props}
        className={cn(
            'w-full bg-surface border border-border',
            'px-3 py-2.5 text-sm font-bold text-main resize-none',
            'focus:outline-none focus:border-primary focus:ring-2 focus:ring-focus transition-all',
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
            checked ? 'bg-primary' : 'bg-border'
        )}
    >
        <div className={cn(
            'absolute top-0.5 w-5 h-5 bg-card rounded-full shadow transition-all duration-300',
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
            'flex items-center justify-center gap-2 bg-gradient-to-l from-primary to-primary-light',
            'text-on-primary text-xs font-bold px-4 py-2.5 shadow-sm active:scale-95 transition-all',
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
            'flex items-center justify-center gap-2 bg-card border border-border',
            'hover:bg-surface text-muted',
            'text-xs font-bold px-4 py-2.5 shadow-sm active:scale-95 transition-all',
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
            'flex items-center justify-center gap-2 border border-error',
            'hover:bg-error hover:border-error hover:text-on-primary text-error bg-error-soft',
            'text-xs font-bold px-4 py-2.5 shadow-sm active:scale-95 transition-all',
            className
        )}
    >
        {children}
    </button>
);

export const ToggleRow = ({
    icon: Icon, label, sub, checked, onChange
}: { icon: LucideIcon; label: string; sub?: string; checked: boolean; onChange: () => void }) => (
    <div className="flex items-center justify-between py-3 px-4 bg-surface border border-border">
        <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-primary-soft">
                <Icon size={14} className="text-primary" />
            </div>
            <div>
                <p className="text-xs font-bold text-main">{label}</p>
                {sub && <p className="text-[10px] font-bold text-dim mt-0.5">{sub}</p>}
            </div>
        </div>
        <Toggle checked={checked} onChange={onChange} />
    </div>
);
