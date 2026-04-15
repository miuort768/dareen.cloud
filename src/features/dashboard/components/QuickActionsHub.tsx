import { UserPlus, FilePlus, Megaphone, ArrowLeft, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../../../lib/utils';

export const QuickActionsHub = () => {
    const actions = [
        { 
            title: 'إضافة طالب جديد', 
            icon: UserPlus, 
            href: '/students?action=new', 
            color: 'bg-indigo-600',
            description: 'تسجيل طالب جديد في النظام'
        },
        { 
            title: 'إصدار فاتورة', 
            icon: FilePlus, 
            href: '/student-invoices?action=new', 
            color: 'bg-emerald-600',
            description: 'إنشاء فاتورة رسوم دراسية'
        },
        { 
            title: 'تعديل الجدول', 
            icon: Calendar, 
            href: '/schedule', 
            color: 'bg-amber-500',
            description: 'إدارة مواعيد الحصص'
        },
        { 
            title: 'إعلان عام', 
            icon: Megaphone, 
            href: '/announcements?action=new', 
            color: 'bg-rose-600',
            description: 'تنبيه لجميع المستخدمين'
        }
    ];

    return (
        <>
            {actions.map((action, i) => (
                <Link
                    key={i}
                    to={action.href}
                    className="group relative bg-white dark:bg-slate-900 p-4 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:bg-slate-50 flex flex-col gap-3"
                >
                    <div className="flex items-center justify-between">
                        <div className={cn(
                            "w-8 h-8 flex items-center justify-center rounded-none text-white border border-slate-900 shadow-none",
                            action.color
                        )}>
                            <action.icon size={16} />
                        </div>
                        <ArrowLeft size={16} className="text-slate-200 group-hover:text-slate-400 group-hover:-translate-x-1 transition-all" />
                    </div>
                    
                    <div className="min-w-0">
                        <h3 className="font-bold text-slate-900 dark:text-white text-[11px] mb-1 leading-none uppercase tracking-tight">{action.title}</h3>
                        <p className="text-[9px] font-medium text-slate-400 dark:text-gray-500 leading-none truncate italic">{action.description}</p>
                    </div>
                </Link>
            ))}
        </>
    );
};
