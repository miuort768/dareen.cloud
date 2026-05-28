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
    { id: 'indigo', label: 'نيلي', class: 'bg-indigo-500' },
    { id: 'blue', label: 'أزرق', class: 'bg-blue-500' },
    { id: 'emerald', label: 'زمردي', class: 'bg-emerald-500' },
    { id: 'rose', label: 'وردي', class: 'bg-rose-500' },
    { id: 'amber', label: 'كهرماني', class: 'bg-amber-500' },
    { id: 'purple', label: 'أرجواني', class: 'bg-purple-500' },
    { id: 'cyan', label: 'سيان', class: 'bg-cyan-500' },
    { id: 'teal', label: 'تركواز', class: 'bg-teal-500' },
    { id: 'orange', label: 'برتقالي', class: 'bg-orange-500' },
    { id: 'slate', label: 'صخري', class: 'bg-slate-500' },
    { id: 'pink', label: 'زهري', class: 'bg-pink-500' },
    { id: 'lime', label: 'ليموني', class: 'bg-lime-500' },
    { id: 'sky', label: 'سماوي', class: 'bg-sky-500' },
    { id: 'fuchsia', label: 'فوشيا', class: 'bg-fuchsia-500' },
    { id: 'sunset', label: 'غروب', class: 'bg-gradient-to-tr from-orange-500 to-rose-500' },
    { id: 'ocean', label: 'محيط', class: 'bg-gradient-to-tr from-blue-500 to-cyan-400' },
    { id: 'forest', label: 'غابة', class: 'bg-gradient-to-tr from-emerald-500 to-lime-400' },
    { id: 'royal', label: 'ملكي', class: 'bg-gradient-to-tr from-purple-600 to-indigo-500' },
    { id: 'electric', label: 'كهربائي', class: 'bg-gradient-to-tr from-violet-500 to-fuchsia-400' },
    { id: 'berry', label: 'توت', class: 'bg-gradient-to-tr from-pink-500 to-purple-400' },
    { id: 'gold', label: 'ذهبي', class: 'bg-amber-400' },
    { id: 'crimson', label: 'قرمزي', class: 'bg-rose-600' },
    { id: 'midnight', label: 'ليلي', class: 'bg-slate-900' },
    { id: 'lava', label: 'حمم', class: 'bg-orange-600' },
    { id: 'mint', label: 'نعناع', class: 'bg-emerald-400' },
    { id: 'lavender', label: 'خزامي', class: 'bg-indigo-300' },
    { id: 'spring', label: 'ربيعي', class: 'bg-lime-400' },
    { id: 'flame', label: 'لهب', class: 'bg-orange-500' },
    { id: 'nebula', label: 'سديم', class: 'bg-gradient-to-tr from-violet-600 to-indigo-400' },
    { id: 'aurora', label: 'شفق', class: 'bg-gradient-to-tr from-emerald-400 to-cyan-400' },
    { id: 'fire', label: 'نار', class: 'bg-gradient-to-tr from-red-600 to-orange-500' },
    { id: 'ice', label: 'جليد', class: 'bg-gradient-to-tr from-sky-400 to-blue-500' },
    { id: 'jungle', label: 'أدغال', class: 'bg-gradient-to-tr from-green-600 to-emerald-400' },
    { id: 'desert', label: 'صحراء', class: 'bg-gradient-to-tr from-yellow-600 to-amber-500' },
    { id: 'coffee', label: 'قهوة', class: 'bg-stone-600' },
];

export const SectionCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={cn(
        'bg-white dark:bg-slate-900 border border-slate-100/50 dark:border-slate-800/50 rounded-none shadow-sm p-5',
        className
    )}>
        {children}
    </div>
);

export const SectionTitle = ({ icon: Icon, label, sub }: { icon: LucideIcon; label: string; sub?: string }) => (
    <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100/50 dark:border-slate-800/50">
        <div className="w-8 h-8 flex items-center justify-center" style={{ backgroundColor: '#2563EB12' }}>
            <Icon size={16} style={{ color: '#2563EB' }} />
        </div>
        <div>
            <p className="text-sm font-bold text-slate-800 dark:text-white">{label}</p>
            {sub && <p className="text-[10px] font-bold text-slate-400 mt-0.5">{sub}</p>}
        </div>
    </div>
);

export const FieldLabel = ({ children }: { children: React.ReactNode }) => (
    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
        {children}
    </label>
);

export const InputField = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input
        {...props}
        className={cn(
            'w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700',
            'px-3 py-2.5 text-sm font-bold text-slate-800 dark:text-white',
            'focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 transition-all',
            props.className
        )}
    />
);

export const TextAreaField = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
    <textarea
        {...props}
        className={cn(
            'w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700',
            'px-3 py-2.5 text-sm font-bold text-slate-800 dark:text-white resize-none',
            'focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 transition-all',
            props.className
        )}
    />
);

export const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button
        onClick={onChange}
        className={cn(
            'w-11 h-6 rounded-full relative transition-all duration-300 shrink-0',
            checked ? 'bg-[#2563EB]' : 'bg-slate-200 dark:bg-slate-700'
        )}
    >
        <div className={cn(
            'absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-300',
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
            'flex items-center justify-center gap-2 bg-[#2563EB] hover:bg-blue-700',
            'text-white text-xs font-bold px-4 py-2.5 shadow-sm active:scale-95 transition-all',
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
            'flex items-center justify-center gap-2 bg-white dark:bg-slate-800',
            'hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300',
            'text-xs font-bold px-4 py-2.5 border border-slate-200 dark:border-slate-700 shadow-sm active:scale-95 transition-all',
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
            'flex items-center justify-center gap-2 border border-rose-200 dark:border-rose-800',
            'hover:bg-rose-600 hover:border-rose-600 hover:text-white text-rose-600',
            'text-xs font-bold px-4 py-2.5 shadow-sm active:scale-95 transition-all',
            className
        )}
        style={{ backgroundColor: '#F43F5E12' }}
    >
        {children}
    </button>
);

export const ToggleRow = ({
    icon: Icon, label, sub, checked, onChange
}: { icon: LucideIcon; label: string; sub?: string; checked: boolean; onChange: () => void }) => (
    <div className="flex items-center justify-between py-3 px-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100/50 dark:border-slate-800/50">
        <div className="flex items-center gap-3">
            <div className="w-7 h-7 flex items-center justify-center" style={{ backgroundColor: '#2563EB12' }}>
                <Icon size={14} style={{ color: '#2563EB' }} />
            </div>
            <div>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{label}</p>
                {sub && <p className="text-[10px] font-bold text-slate-400 mt-0.5">{sub}</p>}
            </div>
        </div>
        <Toggle checked={checked} onChange={onChange} />
    </div>
);
