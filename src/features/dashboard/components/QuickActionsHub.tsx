import { UserPlus, FilePlus, Megaphone, Calendar, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../../../lib/utils';
import { Card } from '../../../shared/components/ui';

const actions = [
    { 
        title: 'إضافة طالب جديد', 
        icon: UserPlus, 
        href: '/students?action=new', 
        iconColor: 'text-primary',
        iconBg: 'bg-primary-soft',
        description: 'تسجيل طالب جديد في النظام'
    },
    { 
        title: 'إصدار فاتورة', 
        icon: FilePlus, 
        href: '/student-invoices?action=new', 
        iconColor: 'text-success',
        iconBg: 'bg-success-soft',
        description: 'إنشاء فاتورة مالية جديدة'
    },
    { 
        title: 'الجدول الاسبوعي', 
        icon: Calendar, 
        href: '/schedule', 
        iconColor: 'text-info',
        iconBg: 'bg-info-soft',
        description: 'إدارة المواعيد والجدول'
    },
    { 
        title: 'إعلان عام', 
        icon: Megaphone, 
        href: '/announcements', 
        iconColor: 'text-warning-dark',
        iconBg: 'bg-warning-soft',
        description: 'بث إعلان للمنصة بأكملها'
    }
];

export const QuickActionsHub = () => {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {actions.map((action, i) => (
                <Link
                    key={`action-${i}`}
                    to={action.href}
                    className="group block"
                >
                    <Card variant="elevated" hoverLift className="!p-5 !border-border">
                        <div className="flex flex-col gap-4">
                            <div className={cn('w-11 h-11 rounded-2xl flex items-center justify-center shadow-sm', action.iconBg, action.iconColor)}>
                                <action.icon size={20} strokeWidth={1.5} />
                            </div>

                            <div>
                                <h3 className="font-bold text-sm text-main leading-tight truncate">
                                    {action.title}
                                </h3>
                                <p className="text-micro font-medium mt-1 text-muted">
                                    {action.description}
                                </p>
                            </div>

                            <div className="flex items-center gap-1 text-micro font-bold text-muted group-hover:text-primary transition-colors">
                                <span>انتقال</span>
                                <ArrowLeft size={12} strokeWidth={1.5} />
                            </div>
                        </div>
                    </Card>
                </Link>
            ))}
        </div>
    );
};
