import { motion } from 'framer-motion';
import { cn } from '../../../lib/utils';

const glassBg = "bg-white/70 dark:bg-white/[0.07] backdrop-blur-xl border border-white/20 dark:border-white/10";

const variants: Record<string, string> = {
    info: "from-info to-cyan-400",
    success: "from-success to-emerald-400",
    primary: "from-primary to-purple-500",
    warning: "from-warning to-amber-400"
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
        className={cn("rounded-2xl p-4 flex items-center gap-3 shadow-lg shadow-black/[0.03] active:scale-95 cursor-pointer text-end", glassBg)}
        aria-label={label}
    >
        <div className={cn("w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0 shadow-lg", variants[variant])}>
            <Icon size={16} strokeWidth={1.5} className="text-white" />
        </div>
        <span className="text-xs font-bold text-main">{label}</span>
    </motion.button>
);
