import { motion } from 'framer-motion';
import { cn } from '../../../lib/utils';

const iconProps = { size: 18, strokeWidth: 1.5 };

const variants: Record<string, string> = {
    info: "bg-info-soft text-info",
    success: "bg-success-soft text-success",
    primary: "bg-primary-soft text-primary",
    warning: "bg-warning-soft text-warning"
};

export const NavButton = ({ label, subtext, icon: Icon, variant, onClick }: {
    label: string;
    subtext: string;
    icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
    variant: 'info' | 'success' | 'primary' | 'warning';
    onClick?: () => void
}) => (
    <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className={cn("rounded-2xl p-5 flex flex-col items-center gap-2 active:scale-95 w-full bg-card border border-border")}
        aria-label={label}
    >
        <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center", variants[variant])}>
            <Icon {...iconProps} />
        </div>
        <span className="text-xs font-bold text-main leading-tight text-center">{label}</span>
        <span className="text-[10px] font-medium text-muted">{subtext}</span>
    </motion.button>
);
