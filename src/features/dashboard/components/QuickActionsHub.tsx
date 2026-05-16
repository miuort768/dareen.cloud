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
                    <div className="absolute top-0 right-0 w-12 h-12 bg-slate-950/5 -translate-y-6 translate-x-6 rotate-45 group-hover:rotate-0 transition-transform duration-500" />
                    
                    <div className="flex items-center justify-between lg:justify-start lg:gap-4 relative z-10 w-full lg:w-auto">
                        <div className={cn("w-10 h-10 rounded-none flex items-center justify-center transition-all group-hover:rotate-6 border border-slate-950/10 shrink-0", action.bg)}>
                            <action.icon size={18} className={action.color} />
                        </div>
                        
                        {/* Text Content - Side by side on LG */}
                        <div className="min-w-0 hidden lg:block">
                            <h3 className="font-black text-slate-900 dark:text-white text-sm md:text-base mb-0.5 tracking-tight uppercase truncate">{action.title}</h3>
                            <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-tight">{action.description}</p>
                        </div>

                        {/* Arrows/Rocket for Mobile only in this flex box */}
                        <div className="flex items-center gap-1.5 lg:hidden">
                            <Rocket size={12} className="text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <ArrowLeft size={16} className="text-slate-300 group-hover:text-indigo-600 group-hover:-translate-x-1 transition-all" />
                        </div>
                    </div>
                    
                    {/* Text Content - Stacked for Mobile */}
                    <div className="min-w-0 relative z-10 lg:hidden">
                        <h3 className="font-black text-slate-900 dark:text-white text-sm md:text-base mb-0.5 tracking-tight uppercase truncate">{action.title}</h3>
                        <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-tight">{action.description}</p>
                    </div>

                    {/* Arrows/Rocket for Desktop - Positioned at far left */}
                    <div className="hidden lg:flex items-center gap-1.5 relative z-10">
                        <Rocket size={12} className="text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <ArrowLeft size={16} className="text-slate-300 group-hover:text-indigo-600 group-hover:-translate-x-1 transition-all" />
                    </div>
                </Link>
            ))}
        </div>
    );


};

