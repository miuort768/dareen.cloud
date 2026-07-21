import { UserPlus, FilePlus, Megaphone, Calendar, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

const actions = [
    {
        title: 'إضافة طالب جديد',
        icon: UserPlus,
        href: '/students?action=new',
        color: 'primary',
        description: 'تسجيل طالب جديد في النظام'
    },
    {
        title: 'إصدار فاتورة',
        icon: FilePlus,
        href: '/student-invoices?action=new',
        color: 'success',
        description: 'إنشاء فاتورة مالية جديدة'
    },
    {
        title: 'الجدول الاسبوعي',
        icon: Calendar,
        href: '/schedule',
        color: 'info',
        description: 'إدارة المواعيد والجدول'
    },
    {
        title: 'إعلان عام',
        icon: Megaphone,
        href: '/announcements',
        color: 'warning',
        description: 'بث إعلان للمنصة بأكملها'
    }
];

const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] } }
};

export const QuickActionsHub = () => {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {actions.map((action, i) => {
                const Icon = action.icon;
                const colorMap: Record<string, { bg: string; text: string; ring: string; hover: string }> = {
                    primary: { bg: 'bg-primary/5', text: 'text-primary', ring: 'ring-primary/20', hover: 'hover:ring-primary/30' },
                    success: { bg: 'bg-success/5', text: 'text-success', ring: 'ring-success/20', hover: 'hover:ring-success/30' },
                    info: { bg: 'bg-info/5', text: 'text-info', ring: 'ring-info/20', hover: 'hover:ring-info/30' },
                    warning: { bg: 'bg-warning/5', text: 'text-warning', ring: 'ring-warning/20', hover: 'hover:ring-warning/30' },
                };
                const c = colorMap[action.color] || colorMap.primary;

                return (
                    <motion.div
                        key={`action-${i}`}
                        variants={itemVariants}
                        custom={i}
                    >
                        <Link to={action.href} className="block h-full">
                            <Card className="group h-full hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer border-border/50">
                                <CardContent className="p-4 md:p-5 h-full flex flex-col justify-between gap-3">
                                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center ring-1 transition-all duration-200 group-hover:scale-110", c.bg, c.text, c.ring)}>
                                        <Icon size={18} />
                                    </div>

                                    <div className="space-y-0.5">
                                        <h3 className="font-semibold text-sm text-main leading-tight truncate">
                                            {action.title}
                                        </h3>
                                        <p className="text-[11px] font-medium text-muted leading-tight">
                                            {action.description}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-1 text-[11px] font-medium text-muted group-hover:text-primary transition-colors">
                                        <span>انتقال</span>
                                        <ArrowLeft size={11} />
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    </motion.div>
                );
            })}
        </div>
    );
};
