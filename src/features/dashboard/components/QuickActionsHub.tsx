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
            title: 'الجدول الاسبوعي', 
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
                    className="group bg-white dark:bg-slate-900 border-2 border-slate-950 dark:border-slate-800 p-4 md:p-6 rounded-none shadow-[6px_6px_0px_0px_rgba(92,89,242,0.2)] dark:shadow-[6px_6px_0px_0px_rgba(30,41,59,1)] hover:shadow-none hover:translate-x-1 hover:-translate-y-1 transition-all flex flex-col gap-4 active:scale-95"
                >
                    <div className="flex items-center justify-between">
                        <div className={cn("w-12 h-12 rounded-none flex items-center justify-center transition-transform group-hover:scale-105 shadow-sm border border-slate-950/10", action.bg)}>
                            <action.icon size={20} className={action.color} />
                        </div>
                        <ArrowLeft size={18} className="text-slate-300 group-hover:text-indigo-500 group-hover:-translate-x-1 transition-all" />
                    </div>
                    
                    <div className="min-w-0">
                        <h3 className="font-black text-slate-900 dark:text-white text-sm md:text-base mb-1 tracking-tighter uppercase">{action.title}</h3>
                        <p className="text-[10px] md:text-xs font-bold text-slate-400 dark:text-slate-500 leading-tight truncate opacity-80 uppercase tracking-widest">{action.description}</p>
                    </div>
                </Link>
            ))}
        </>
    );
};
