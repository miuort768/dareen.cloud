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
                    className="group bg-white dark:bg-slate-900 border-2 border-slate-950 dark:border-slate-800 p-5 rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all flex flex-col items-center text-center gap-3 active:scale-95"
                >
                    <div className="flex items-center justify-between w-full mb-1">
                        <div className={cn("w-12 h-12 rounded-none border-2 border-slate-950 flex items-center justify-center transition-transform group-hover:scale-110", action.bg)}>
                            <action.icon size={20} className={action.color} />
                        </div>
                        <div className="w-8 h-8 flex items-center justify-center bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-none group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                        </div>
                    </div>
                    
                    <div className="min-w-0">
                        <h3 className="font-black text-slate-950 dark:text-white text-xs mb-1 uppercase tracking-tighter">{action.title}</h3>
                        <p className="text-[9px] font-black text-slate-400 leading-none truncate uppercase tracking-widest opacity-80">{action.description}</p>
                    </div>
                </Link>
            ))}
        </>
    );
};
