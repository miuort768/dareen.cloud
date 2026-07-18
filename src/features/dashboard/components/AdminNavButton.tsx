import { cn } from '../../../lib/utils';

const iconProps = { size: 18, strokeWidth: 1.5 };

export const NavButton = ({ label, subtext, icon: Icon, variant, onClick }: { label: string; subtext: string; icon: React.ComponentType<{ size?: number; strokeWidth?: number }>; variant: 'info' | 'success' | 'primary' | 'warning'; onClick?: () => void }) => (
    <button
        onClick={onClick}
        className={cn(
            "rounded-card p-4 flex flex-col items-center justify-center gap-1.5 shadow-soft active:scale-95 transition-all w-full",
            variant === 'info' && "bg-info",
            variant === 'success' && "bg-success",
            variant === 'primary' && "bg-primary",
            variant === 'warning' && "bg-warning"
        )}
        aria-label={label}
    >
        <div className="w-10 h-10 rounded-card bg-white/15 flex items-center justify-center shadow-soft text-on-primary">
            <Icon {...iconProps} />
        </div>
        <span className="text-micro font-bold text-on-primary leading-none mt-1">{label}</span>
        <span className="text-micro font-medium text-on-primary/70">{subtext}</span>
    </button>
);
