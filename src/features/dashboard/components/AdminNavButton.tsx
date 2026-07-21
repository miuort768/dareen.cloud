import { motion } from 'framer-motion';
import { cn } from '../../../lib/utils';

const iconProps = { size: 18, strokeWidth: 1.5 };

const gradients: Record<string, string> = {
    info: "from-info to-cyan-500",
    success: "from-success to-emerald-500",
    primary: "from-primary to-purple-500",
    warning: "from-warning to-amber-500"
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
        className={cn("rounded-2xl p-5 flex flex-col items-center gap-2 shadow-lg active:scale-95 w-full", "bg-gradient-to-br", gradients[variant])}
        aria-label={label}
    >
        <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center shadow-inner text-white">
            <Icon {...iconProps} />
        </div>
        <span className="text-xs font-bold text-white leading-tight text-center">{label}</span>
        <span className="text-[10px] font-medium text-white/70">{subtext}</span>
    </motion.button>
);
