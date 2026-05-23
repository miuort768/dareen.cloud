import { UserPlus, FilePlus, Megaphone, Calendar, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../../../lib/utils';

const actions = [
    { 
        title: 'إضافة طالب جديد', 
        icon: UserPlus, 
        href: '/students?action=new', 
        gradient: 'from-indigo-500 to-indigo-600',
        shadow: 'shadow-indigo-500/20',
        description: 'تسجيل طالب جديد في النظام'
    },
    { 
        title: 'إصدار فاتورة', 
        icon: FilePlus, 
        href: '/student-invoices?action=new', 
        gradient: 'from-emerald-500 to-emerald-600',
        shadow: 'shadow-emerald-500/20',
        description: 'إنشاء فاتورة مالية جديدة'
    },
    { 
        title: 'الجدول الاسبوعي', 
        icon: Calendar, 
        href: '/schedule', 
        gradient: 'from-amber-500 to-amber-600',
        shadow: 'shadow-amber-500/20',
        description: 'إدارة المواعيد والجدول'
    },
    { 
        title: 'إعلان عام', 
        icon: Megaphone, 
        href: '/announcements?action=new', 
        gradient: 'from-rose-500 to-rose-600',
        shadow: 'shadow-rose-500/20',
        description: 'بث إعلان للمنصة بأكملها'
    }
];

export const QuickActionsHub = () => {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {actions.map((action, i) => (
                <Link
                    key={i}
                    to={action.href}
                    className={cn(
                        "relative overflow-hidden",
                        "bg-gradient-to-br",
                        action.gradient,
                        "border border-white/20",
                        "p-5",
                        "transition-all duration-300 active:scale-[0.98]",
                        action.shadow
                    )}
                >
                    {/* Content */}
                    <div className="relative z-10 flex flex-col gap-4">
                        <div className={cn(
                            "w-11 h-11 flex items-center justify-center",
                            "bg-white/20 text-white shadow-sm"
                        )}>
                            <action.icon size={20} className="stroke-[2.5]" />
                        </div>

                        <div>
                            <h3 className="font-medium text-sm md:text-base leading-tight tracking-tight truncate text-white">
                                {action.title}
                            </h3>
                            <p className="text-[10px] font-normal mt-1 text-white/70">
                                {action.description}
                            </p>
                        </div>

                        <div className="flex items-center gap-1 text-[9px] font-medium uppercase tracking-widest text-white/40">
                            <span>انتقال</span>
                            <ArrowLeft size={12} />
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
};

