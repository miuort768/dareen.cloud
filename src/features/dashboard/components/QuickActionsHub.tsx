import { UserPlus, FilePlus, Megaphone, Calendar, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../../../lib/utils';

const actions = [
    { 
        title: 'إضافة طالب جديد', 
        icon: UserPlus, 
        href: '/students?action=new', 
        gradient: 'from-indigo-500 to-indigo-600',
        hoverGradient: 'group-hover:from-indigo-600 group-hover:to-indigo-700',
        shadow: 'shadow-indigo-500/20',
        description: 'تسجيل طالب جديد في النظام'
    },
    { 
        title: 'إصدار فاتورة', 
        icon: FilePlus, 
        href: '/student-invoices?action=new', 
        gradient: 'from-emerald-500 to-emerald-600',
        hoverGradient: 'group-hover:from-emerald-600 group-hover:to-emerald-700',
        shadow: 'shadow-emerald-500/20',
        description: 'إنشاء فاتورة مالية جديدة'
    },
    { 
        title: 'الجدول الاسبوعي', 
        icon: Calendar, 
        href: '/schedule', 
        gradient: 'from-amber-500 to-amber-600',
        hoverGradient: 'group-hover:from-amber-600 group-hover:to-amber-700',
        shadow: 'shadow-amber-500/20',
        description: 'إدارة المواعيد والجدول'
    },
    { 
        title: 'إعلان عام', 
        icon: Megaphone, 
        href: '/announcements?action=new', 
        gradient: 'from-rose-500 to-rose-600',
        hoverGradient: 'group-hover:from-rose-600 group-hover:to-rose-700',
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
                        "group relative overflow-hidden",
                        "bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-900/90",
                        "border border-slate-200 dark:border-slate-800",
                        "rounded-2xl p-5",
                        "transition-all duration-300 hover:shadow-lg active:scale-[0.98]",
                        "hover:border-transparent",
                        action.shadow
                    )}
                >
                    {/* Hover gradient overlay */}
                    <div className={cn(
                        "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                        "bg-gradient-to-br",
                        action.gradient
                    )} />

                    {/* Content */}
                    <div className="relative z-10 flex flex-col gap-4">
                        <div className={cn(
                            "w-11 h-11 rounded-xl flex items-center justify-center",
                            "bg-gradient-to-br text-white shadow-lg",
                            action.gradient,
                            "transition-all duration-300 group-hover:scale-110 group-hover:rotate-3",
                            action.shadow
                        )}>
                            <action.icon size={20} className="stroke-[2.5]" />
                        </div>

                        <div>
                            <h3 className={cn(
                                "font-black text-sm md:text-base leading-tight tracking-tight truncate",
                                "text-slate-900 dark:text-white",
                                "transition-colors duration-300 group-hover:text-white"
                            )}>
                                {action.title}
                            </h3>
                            <p className={cn(
                                "text-[10px] font-bold mt-1",
                                "text-slate-400 dark:text-slate-500",
                                "transition-colors duration-300 group-hover:text-white/70"
                            )}>
                                {action.description}
                            </p>
                        </div>

                        <div className={cn(
                            "flex items-center gap-1 text-[9px] font-black uppercase tracking-widest",
                            "text-slate-300 dark:text-slate-600",
                            "transition-all duration-300 group-hover:text-white/50"
                        )}>
                            <span>انتقال</span>
                            <ArrowLeft size={12} className="transition-transform group-hover:-translate-x-1" />
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
};

