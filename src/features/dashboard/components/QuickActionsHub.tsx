import { UserPlus, FilePlus, Megaphone, ArrowLeft, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../../../lib/utils';

export const QuickActionsHub = () => {
    const actions = [
        { 
            title: 'إضافة طالب جديد', 
            icon: UserPlus, 
            href: '/students?action=new', 
            color: 'text-[#5c59f2]',
            bg: 'bg-indigo-50 dark:bg-indigo-900/20',
            description: 'تسجيل طالب جديد'
        },
        { 
            title: 'إصدار فاتورة', 
            icon: FilePlus, 
            href: '/student-invoices?action=new', 
            color: 'text-emerald-600',
            bg: 'bg-emerald-50 dark:bg-emerald-900/20',
            description: 'رسوم دراسية'
        },
        { 
            title: 'تعديل الجدول', 
            icon: Calendar, 
            href: '/schedule', 
            color: 'text-amber-500',
            bg: 'bg-amber-50 dark:bg-amber-900/20',
            description: 'مواعيد الحصص'
        },
        { 
            title: 'إعلان عام', 
            icon: Megaphone, 
            href: '/announcements?action=new', 
            color: 'text-rose-600',
            bg: 'bg-rose-50 dark:bg-rose-900/20',
            description: 'تنبيه للجميع'
        }
    ];

    return (
        <>
            {actions.map((action, i) => (
                <Link
                    key={i}
                    to={action.href}
                    className="group bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-none shadow-sm hover:shadow-md transition-all flex flex-col gap-3 active:scale-95"
                >
                    <div className="flex items-center justify-between">
                        <div className={cn("w-10 h-10 rounded-none flex items-center justify-center transition-transform group-hover:scale-105", action.bg)}>
                            <action.icon size={18} className={action.color} />
                        </div>
                        <ArrowLeft size={16} className="text-slate-300 group-hover:text-slate-500 group-hover:-translate-x-1 transition-all" />
                    </div>
                    
                    <div className="min-w-0">
                        <h3 className="font-bold text-slate-800 dark:text-white text-xs mb-1 tracking-tight">{action.title}</h3>
                        <p className="text-[10px] font-bold text-slate-400 leading-none truncate opacity-60 uppercase italic">{action.description}</p>
                    </div>
                </Link>
            ))}
        </>
    );
};
