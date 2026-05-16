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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {actions.map((action, i) => (
                <Link
                    key={i}
                    to={action.href}
                    className="group bg-white dark:bg-slate-900 border-2 border-slate-950 dark:border-slate-800 p-5 rounded-none shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1.5 hover:translate-y-1.5 transition-all flex flex-col gap-4 active:scale-[0.98] relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-12 h-12 bg-slate-950/5 -translate-y-6 translate-x-6 rotate-45 group-hover:rotate-0 transition-transform duration-500" />
                    
                    <div className="flex items-center justify-between relative z-10">
                        <div className={cn("w-10 h-10 rounded-none flex items-center justify-center transition-all group-hover:rotate-6 shadow-md border border-slate-950/10", action.bg)}>
                            <action.icon size={18} className={action.color} />
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Rocket size={12} className="text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <ArrowLeft size={16} className="text-slate-300 group-hover:text-indigo-600 group-hover:-translate-x-1 transition-all" />
                        </div>
                    </div>
                    
                    <div className="min-w-0 relative z-10">
                        <h3 className="font-black text-slate-900 dark:text-white text-sm md:text-base mb-0.5 tracking-tight uppercase truncate">{action.title}</h3>
                        <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-tight">{action.description}</p>
                    </div>
                </Link>
            ))}
        </div>
    );


};

