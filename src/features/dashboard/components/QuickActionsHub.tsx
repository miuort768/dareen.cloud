import { UserPlus, FilePlus, Megaphone, Calendar, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const actions = [
    {
        title: 'إضافة طالب جديد',
        icon: UserPlus,
        href: '/students?action=new',
        color: 'bg-primary-soft text-primary',
        description: 'تسجيل طالب جديد في النظام'
    },
    {
        title: 'إصدار فاتورة',
        icon: FilePlus,
        href: '/student-invoices?action=new',
        color: 'bg-success-soft text-success',
        description: 'إنشاء فاتورة مالية جديدة'
    },
    {
        title: 'الجدول الاسبوعي',
        icon: Calendar,
        href: '/schedule',
        color: 'bg-info-soft text-info',
        description: 'إدارة المواعيد والجدول'
    },
    {
        title: 'إعلان عام',
        icon: Megaphone,
        href: '/announcements',
        color: 'bg-warning-soft text-warning',
        description: 'بث إعلان للمنصة بأكملها'
    }
];

const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.25, delay: i * 0.04 }
    })
};

export const QuickActionsHub = () => {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
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
                                "group h-full p-4 rounded-2xl bg-card border border-border",
                                "hover:border-border/80 transition-all duration-200",
                                "font-dash"
                            )}>
                                <div className="flex flex-col gap-3">
                                    <div className={cn(
                                        "w-10 h-10 rounded-xl flex items-center justify-center",
                                        action.color,
                                        "group-hover:scale-105 transition-transform duration-200"
                                    )}>
                                        <Icon size={18} />
                                    </div>

                                    <div className="space-y-0.5">
                                        <h3 className="font-bold text-sm text-main leading-tight">
                                            {action.title}
                                        </h3>
                                        <p className="text-[11px] text-muted leading-tight">
                                            {action.description}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-1 text-[11px] font-medium text-muted group-hover:text-primary transition-colors">
                                        <span>انتقال</span>
                                        <ArrowLeft size={10} />
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
