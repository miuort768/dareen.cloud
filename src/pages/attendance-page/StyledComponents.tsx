import { cn } from '../../lib/utils';

export const SectionCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={cn('bg-card border border-border rounded-2xl shadow-sm p-4 md:p-5', className)}>{children}</div>
);

export const SectionTitle = ({ icon: Icon, label, sub }: { icon: React.ComponentType<{ size?: number }>; label: string; sub?: string }) => (
    <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-primary-soft text-primary flex items-center justify-center"><Icon size={16} /></div>
        <div>
            <p className="text-sm font-bold text-main leading-none">{label}</p>
            {sub && <p className="text-micro font-bold text-muted mt-1">{sub}</p>}
        </div>
    </div>
);

export const PrimaryBtn = ({ onClick, children, className = '', disabled }: {
    onClick?: () => void; children: React.ReactNode; className?: string; disabled?: boolean;
}) => (
    <button disabled={disabled} onClick={onClick}
        className={cn('flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover',
            'text-on-primary text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm active:scale-95',
            'disabled:opacity-50 disabled:cursor-not-allowed', className)}>
        {children}
    </button>
);
