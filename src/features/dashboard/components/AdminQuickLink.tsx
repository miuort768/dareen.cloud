import { cn } from '../../../lib/utils';

const iconProps = { size: 18, strokeWidth: 1.5 };

export const QuickLink = ({ icon: Icon, label, variant, onClick }: { icon: React.ComponentType<{ size?: number; strokeWidth?: number }>; label: string; variant: 'info' | 'success' | 'primary' | 'warning'; onClick?: () => void }) => (
    <button
        onClick={onClick}
        className="bg-card rounded-card p-4 flex items-center gap-3 shadow-soft border border-border active:scale-95 transition-all hover:shadow-md"
        aria-label={label}
    >
        <div className={cn(
            "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
            variant === 'info' && "bg-info-soft text-info",
            variant === 'success' && "bg-success-soft text-success",
            variant === 'primary' && "bg-primary-soft text-primary",
            variant === 'warning' && "bg-warning-soft text-warning"
        )}>
            <Icon size={16} strokeWidth={1.5} />
        </div>
        <span className="text-xs font-bold text-main">{label}</span>
    </button>
);
