import { UserPlus, FilePlus, Megaphone, Calendar, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const actions = [
    {
        title: 'إضافة طالب جديد',
        icon: UserPlus,
        href: '/students?action=new',
        gradient: 'from-primary to-purple-500',
        description: 'تسجيل طالب جديد في النظام'
    },
    {
        title: 'إصدار فاتورة',
        icon: FilePlus,
        href: '/student-invoices?action=new',
        gradient: 'from-success to-emerald-500',
        description: 'إنشاء فاتورة مالية جديدة'
    },
    {
        title: 'الجدول الاسبوعي',
        icon: Calendar,
        href: '/schedule',
        gradient: 'from-info to-cyan-500',
        description: 'إدارة المواعيد والجدول'
    },
    {
        title: 'إعلان عام',
        icon: Megaphone,
        href: '/announcements',
        gradient: 'from-warning to-amber-500',
        description: 'بث إعلان للمنصة بأكملها'
    }
];

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, delay: i * 0.06, ease: [0.25, 0.1, 0.25, 1] }
    })
};

const bgGlow: Record<string, string> = {
    'from-primary to-purple-500': 'shadow-primary/10',
    'from-success to-emerald-500': 'shadow-success/10',
    'from-info to-cyan-500': 'shadow-info/10',
    'from-warning to-amber-500': 'shadow-warning/10',
};

export const QuickActionsHub = () => {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {actions.map((action, i) => {
                const Icon = action.icon;

                return (
                    <motion.div
                        key={`action-${i}`}
                        custom={i}
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <Link to={action.href} className="block h-full">
                            <div className={cn(
                                "group h-full p-5 rounded-3xl",
                                "bg-card/70 backdrop-blur-xl",
                                "border border-white/20 dark:border-white/10",
                                "shadow-[0_8px_32px_-4px_rgba(0,0,0,0.04)]",
                                "hover:shadow-[0_16px_48px_-8px_rgba(99,102,241,0.12)]",
                                "hover:-translate-y-1",
                                "transition-all duration-300",
                                "font-dash"
                            )}>
                                <div className="flex flex-col gap-4">
                                    <div className={cn(
                                        "w-12 h-12 rounded-2xl flex items-center justify-center",
                                        "bg-gradient-to-br shadow-lg",
                                        action.gradient,
                                        "text-white",
                                        "group-hover:scale-110 transition-transform duration-300"
                                    )}>
                                        <Icon size={20} />
                                    </div>

                                    <div className="space-y-1">
                                        <h3 className="font-bold text-base text-main leading-tight">
                                            {action.title}
                                        </h3>
                                        <p className="text-xs text-muted leading-tight">
                                            {action.description}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-1 text-xs font-medium text-muted group-hover:text-primary transition-colors">
                                        <span>انتقال</span>
                                        <ArrowLeft size={11} />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                );
            })}
        </div>
    );
};
