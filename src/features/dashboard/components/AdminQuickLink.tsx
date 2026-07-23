import { motion } from 'framer-motion';
import { cn } from '../../../lib/utils';

const variants: Record<string, string> = {
    info: "bg-info-soft text-info",
    success: "bg-success-soft text-success",
    primary: "bg-primary-soft text-primary",
    warning: "bg-warning-soft text-warning"
};

export const QuickLink = ({ icon: Icon, label, variant, onClick }: {
    icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
    label: string;
    variant: 'info' | 'success' | 'primary' | 'warning';
    onClick?: () => void
}) => (
    <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className="rounded-2xl p-4 flex items-center gap-3 bg-card border border-border active:scale-95 cursor-pointer text-end"
        aria-label={label}
    >
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", variants[variant])}>
            <Icon size={16} strokeWidth={1.5} />
        </div>
        <span className="text-xs font-bold text-main">{label}</span>
    </motion.button>
);
