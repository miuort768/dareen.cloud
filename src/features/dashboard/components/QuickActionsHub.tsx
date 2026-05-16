import { UserPlus, FilePlus, Megaphone, Calendar, Rocket } from 'lucide-react';
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
            description: 'تسجيل جديد'
        },
        { 
            title: 'إصدار فاتورة', 
            icon: FilePlus, 
            href: '/student-invoices?action=new', 
            color: 'text-white',
            bg: 'bg-emerald-600',
            description: 'فاتورة مالية'
        },
        { 
            title: 'الجدول الاسبوعي', 
            icon: Calendar, 
            href: '/schedule', 
            color: 'text-white',
            bg: 'bg-amber-500',
            description: 'إدارة المواعيد'
        },
        { 
            title: 'إعلان عام', 
            icon: Megaphone, 
            href: '/announcements?action=new', 
            color: 'text-white',
            bg: 'bg-rose-600',
            description: 'بث عام'
        }
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {actions.map((action, i) => (
                <Link
                    key={i}
                    to={action.href}
                    className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-none hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 active:scale-[0.98] relative overflow-hidden shadow-sm hover:shadow-md"
                >
                    <div className="absolute top-0 right-0 w-12 h-12 bg-slate-950/5 -translate-y-6 translate-x-6 rotate-45 transition-transform duration-500" />
                    
                    <div className="flex items-center justify-between lg:justify-start lg:gap-4 relative z-10 w-full lg:w-auto">
                        <div className={cn("w-10 h-10 rounded-none flex items-center justify-center border border-slate-950/10 shrink-0", action.bg)}>
                            <action.icon size={18} className={action.color} />
                        </div>
                        
                        {/* Text Content - Side by side on LG */}
                        <div className="min-w-0 hidden lg:block">
                            <h3 className="font-black text-slate-900 dark:text-white text-sm md:text-base mb-0.5 tracking-tight uppercase truncate">{action.title}</h3>
                            <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-tight">{action.description}</p>
                        </div>

                        {/* Rocket for Mobile only */}
                        <div className="flex items-center lg:hidden">
                            <Rocket size={14} className="text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </div>
                    
                    {/* Text Content - Stacked for Mobile */}
                    <div className="min-w-0 relative z-10 lg:hidden">
                        <h3 className="font-black text-slate-900 dark:text-white text-sm md:text-base mb-0.5 tracking-tight uppercase truncate">{action.title}</h3>
                        <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-tight">{action.description}</p>
                    </div>

                    {/* Rocket for Desktop */}
                    <div className="hidden lg:flex items-center relative z-10">
                        <Rocket size={14} className="text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                </Link>
            ))}
        </div>
    );


};

