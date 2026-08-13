import type { LucideIcon } from 'lucide-react';
import { RefreshCw } from 'lucide-react';
import { cn } from '../../../lib/utils';

export const ALLOWED_CURRENCIES = [
    { code: 'EGP', name: 'جنيه مصري', symbol: 'ج.م' },
    { code: 'USD', name: 'دولار أمريكي', symbol: '$' },
    { code: 'KWD', name: 'دينار كويتي', symbol: 'د.ك' },
    { code: 'SAR', name: 'ريال سعودي', symbol: 'ر.س' },
    { code: 'AED', name: 'درهم إماراتي', symbol: 'د.إ' },
    { code: 'QAR', name: 'ريال قطري', symbol: 'ر.ق' },
    { code: 'OMR', name: 'ريال عماني', symbol: 'ر.ع' },
    { code: 'BHD', name: 'دينار بحريني', symbol: 'د.ب' },
    { code: 'JOD', name: 'دينار أردني', symbol: 'د.أ' },
];

export const ALLOWED_CURRENCY_CODES = ALLOWED_CURRENCIES.map(c => c.code);

export const AVAILABLE_PERMISSIONS = [
    { id: '*', label: 'وصول كامل (Admin)', group: 'عام' },
    { id: 'dashboard', label: 'لوحة التحكم', group: 'الصفحات' },
    { id: 'students', label: 'إدارة الطلاب', group: 'الصفحات' },
    { id: 'teachers', label: 'إدارة المعلمين', group: 'الصفحات' },
    { id: 'evaluations', label: 'التقييمات والنقاط', group: 'الصفحات' },
    { id: 'parents', label: 'أولياء الأمور', group: 'الصفحات' },
    { id: 'monthly_closing', label: 'تقفيل الشهر', group: 'الصفحات' },
    { id: 'attendance', label: 'الحضور والغياب', group: 'الصفحات' },
    { id: 'schedule', label: 'الجداول الدراسية', group: 'الصفحات' },
    { id: 'appointments', label: 'المواعيد', group: 'الصفحات' },
    { id: 'finance', label: 'المالية', group: 'الصفحات' },
    { id: 'leads', label: 'العملاء والمهتمين', group: 'الصفحات' },
    { id: 'trial_sessions', label: 'جلسات المراجعة', group: 'الصفحات' },
    { id: 'student_invoices', label: 'فواتير الطلاب', group: 'الصفحات' },
    { id: 'teacher_invoices', label: 'فواتير المعلمات', group: 'الصفحات' },
    { id: 'tasks', label: 'المهام والطلبات', group: 'الصفحات' },
    { id: 'chat', label: 'الدردشة', group: 'الصفحات' },
    { id: 'reports', label: 'التقارير', group: 'الصفحات' },
    { id: 'announcements', label: 'إدارة الإعلانات', group: 'الصفحات' },
    { id: 'forum', label: 'المنتدى', group: 'الصفحات' },
    { id: 'settings', label: 'الإعدادات', group: 'الصفحات' },
    { id: 'admin', label: 'إدارة متقدمة (أدوار/مراقبة)', group: 'الصفحات' },
    { id: 'admin_contacts', label: 'رسائل الاتصال', group: 'الصفحات' },
    { id: 'admin_jobs', label: 'طلبات التوظيف', group: 'الصفحات' },
    { id: 'parent_dashboard', label: 'بوابة المتابعة (ولي أمر)', group: 'لوحات مخصصة' },
    { id: 'parent_students', label: 'الأبناء', group: 'لوحات مخصصة' },
    { id: 'parent_announcements', label: 'إعلانات ولي الأمر', group: 'لوحات مخصصة' },
    { id: 'student_dashboard', label: 'حساب الطالب', group: 'لوحات مخصصة' },
    { id: 'students.create', label: 'إضافة طالب', group: 'أذونات تفصيلية' },
    { id: 'students.edit', label: 'تعديل طالب', group: 'أذونات تفصيلية' },
    { id: 'students.delete', label: 'حذف طالب', group: 'أذونات تفصيلية' },
    { id: 'teachers.create', label: 'إضافة معلم', group: 'أذونات تفصيلية' },
    { id: 'teachers.edit', label: 'تعديل معلم', group: 'أذونات تفصيلية' },
    { id: 'teachers.delete', label: 'حذف معلم', group: 'أذونات تفصيلية' },
    { id: 'sessions.create', label: 'إضافة جلسة', group: 'أذونات تفصيلية' },
    { id: 'sessions.edit', label: 'تعديل جلسة', group: 'أذونات تفصيلية' },
    { id: 'finance.transactions.create', label: 'إضافة معاملة مالية', group: 'أذونات تفصيلية' },
    { id: 'finance.transactions.delete', label: 'حذف معاملة مالية', group: 'أذونات تفصيلية' },
    { id: 'finance.invoices.edit', label: 'تعديل الفواتير', group: 'أذونات تفصيلية' },
    { id: 'finance.reports', label: 'التقارير المالية', group: 'أذونات تفصيلية' },
    { id: 'system.users', label: 'إدارة المستخدمين', group: 'أذونات تفصيلية' },
    { id: 'system.backup', label: 'النسخ الاحتياطي', group: 'أذونات تفصيلية' },
    { id: 'system.audit', label: 'سجل التدقيق', group: 'أذونات تفصيلية' },
];

export const SectionCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={cn(
        'bg-card border border-border/20 rounded-2xl p-5 md:p-6',
        'shadow-sm hover:shadow-md transition-all duration-300',
        className
    )}>
        {children}
    </div>
);

export const SectionTitle = ({ icon: Icon, label, sub }: { icon: LucideIcon; label: string; sub?: string }) => (
    <div className="flex items-center gap-3 mb-5 pb-4 border-b border-border/20">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shadow-sm">
            <Icon size={18} className="text-primary" />
        </div>
        <div className="flex-1">
            <p className="text-sm font-bold text-main">{label}</p>
            {sub && <p className="text-[11px] font-bold text-muted mt-0.5">{sub}</p>}
        </div>
        <div className="w-16 h-0.5 rounded-full bg-gradient-to-l from-primary/40 to-transparent hidden sm:block" />
    </div>
);

export const FieldLabel = ({ children }: { children: React.ReactNode }) => (
    <label className="block text-[11px] font-bold text-muted mb-1.5 tracking-wide">
        {children}
    </label>
);

export const InputField = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input
        {...props}
        className={cn(
            'w-full bg-background border border-border/30',
            'px-4 py-3 text-sm font-bold text-main',
            'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10',
            'transition-all duration-200 rounded-xl',
            'placeholder:text-muted/50',
            props.className
        )}
    />
);

export const TextAreaField = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
    <textarea
        {...props}
        className={cn(
            'w-full bg-background border border-border/30',
            'px-4 py-3 text-sm font-bold text-main resize-none',
            'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10',
            'transition-all duration-200 rounded-xl',
            'placeholder:text-muted/50',
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
            checked
                ? 'bg-gradient-to-r from-primary to-primary-active shadow-sm shadow-primary/30'
                : 'bg-border/60 hover:bg-border'
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
            'flex items-center justify-center gap-2 bg-gradient-to-br from-primary to-primary-active',
            'hover:from-primary-hover hover:to-primary',
            'text-on-primary text-xs font-bold px-6 py-3 rounded-xl',
            'active:scale-[0.97] transition-all duration-200',
            'shadow-sm hover:shadow-md shadow-primary/20',
            'disabled:opacity-50 disabled:cursor-not-allowed',
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
            'flex items-center justify-center gap-2 bg-card border border-border/30',
            'hover:bg-surface hover:border-border text-muted hover:text-main',
            'text-xs font-bold px-5 py-2.5 rounded-xl',
            'active:scale-[0.97] transition-all duration-200',
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
            'flex items-center justify-center gap-2 bg-gradient-to-br from-error/10 to-error/5',
            'border-2 border-error/30 hover:border-error hover:from-error hover:to-error-dark',
            'hover:text-on-error text-error text-xs font-bold px-5 py-2.5 rounded-xl',
            'active:scale-[0.97] transition-all duration-200 shadow-sm hover:shadow-md',
            className
        )}
    >
        {children}
    </button>
);

export const ToggleRow = ({
    icon: Icon, label, sub, checked, onChange
}: { icon: LucideIcon; label: string; sub?: string; checked: boolean; onChange: () => void }) => (
    <div className="flex items-center justify-between py-3 px-4 bg-background border border-border/20 rounded-xl hover:border-border/40 transition-colors duration-200">
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary/10 shrink-0">
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
