import { UserPlus, FilePlus, Megaphone, ArrowLeft, Calendar, Rocket } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../../../lib/utils';

export const QuickActionsHub = () => {
    const actions = [
        { 
            title: 'إضافة طالب جديد', 
            icon: UserPlus, 
            href: '/students?action=new', 
            color: 'text-white',
            bg: 'bg-indigo-600',
            description: 'New Registration'
        },
        { 
            title: 'إصدار فاتورة', 
            icon: FilePlus, 
            href: '/student-invoices?action=new', 
            color: 'text-white',
            bg: 'bg-emerald-600',
            description: 'Financial Invoice'
        },
        { 
            title: 'الجدول الاسبوعي', 
            icon: Calendar, 
            href: '/schedule', 
            color: 'text-white',
            bg: 'bg-amber-500',
            description: 'Time Management'
        },
        { 
            title: 'إعلان عام', 
            icon: Megaphone, 
            href: '/announcements?action=new', 
            color: 'text-white',
            bg: 'bg-rose-600',
            description: 'Public Broadcast'
        }
    ];

    return (
        <>
            {actions.map((action, i) => (
                <Link
                    key={i}
                    to={action.href}
                    className="group bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-800 p-6 rounded-none shadow-[8px_8px_0px_0px_rgba(79,70,229,1)] dark:shadow-[8px_8px_0px_0px_rgba(79,70,229,0.3)] hover:shadow-none hover:translate-x-2 hover:translate-y-2 transition-all flex flex-col gap-6 active:scale-95 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-16 h-16 bg-slate-900/5 -translate-y-8 translate-x-8 rotate-45 group-hover:rotate-0 transition-transform duration-500" />
                    
                    <div className="flex items-center justify-between relative z-10">
                        <div className={cn("w-14 h-14 rounded-none flex items-center justify-center transition-all group-hover:rotate-6 shadow-lg", action.bg)}>
                            <action.icon size={24} className={action.color} />
                        </div>
                        <div className="flex items-center gap-2">
                            <Rocket size={14} className="text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <ArrowLeft size={20} className="text-slate-300 group-hover:text-indigo-600 group-hover:-translate-x-1 transition-all" />
                        </div>
                    </div>
                    
                    <div className="min-w-0 relative z-10">
                        <h3 className="font-black text-slate-900 dark:text-white text-base md:text-lg mb-1 tracking-tight uppercase">{action.title}</h3>
                        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">{action.description}</p>
                    </div>
                </Link>
            ))}
        </>
    );
};

