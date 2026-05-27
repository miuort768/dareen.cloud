import { UserPlus, FilePlus, Megaphone, Calendar, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../../../lib/utils';

const actions = [
    { 
        title: 'إضافة طالب جديد', 
        icon: UserPlus, 
        href: '/students?action=new', 
        color: '#2563EB',
        description: 'تسجيل طالب جديد في النظام'
    },
    { 
        title: 'إصدار فاتورة', 
        icon: FilePlus, 
        href: '/student-invoices?action=new', 
        color: '#22C55E',
        description: 'إنشاء فاتورة مالية جديدة'
    },
    { 
        title: 'الجدول الاسبوعي', 
        icon: Calendar, 
        href: '/schedule', 
        color: '#38BDF8',
        description: 'إدارة المواعيد والجدول'
    },
    { 
        title: 'إعلان عام', 
        icon: Megaphone, 
        href: '/announcements?action=new', 
        color: '#F97316',
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
                        "relative overflow-hidden rounded-2xl",
                        "bg-white dark:bg-slate-900",
                        "border border-slate-100 dark:border-slate-800",
                        "p-5 shadow-sm",
                        "transition-all duration-300 active:scale-[0.98] hover:shadow-md",
                        "group"
                    )}
                >
                    {/* Gradient top accent */}
                    <div className="absolute top-0 right-0 left-0 h-1 rounded-full" style={{ backgroundColor: action.color }} />
                    
                    {/* Content */}
                    <div className="relative z-10 flex flex-col gap-4">
                        <div className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-sm" style={{ backgroundColor: `${action.color}12`, color: action.color }}>
                            <action.icon size={20} strokeWidth={1.5} />
                        </div>

                        <div>
                            <h3 className="font-bold text-sm text-[#0F172A] dark:text-white leading-tight truncate">
                                {action.title}
                            </h3>
                            <p className="text-[10px] font-medium mt-1 text-[#64748B] dark:text-slate-500">
                                {action.description}
                            </p>
                        </div>

                        <div className="flex items-center gap-1 text-[9px] font-bold text-[#94A3B8] dark:text-slate-600 group-hover:text-[#2563EB] transition-colors">
                            <span>انتقال</span>
                            <ArrowLeft size={12} strokeWidth={1.5} />
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
};

