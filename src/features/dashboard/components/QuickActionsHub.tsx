import { UserPlus, FilePlus, Megaphone, ArrowRight, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../../../lib/utils';

export const QuickActionsHub = () => {
    const actions = [
        { 
            title: 'إضافة طالب جديد', 
            icon: UserPlus, 
            href: '/students?action=new', 
            color: 'blue',
            description: 'تسجيل طالب جديد في النظام'
        },
        { 
            title: 'إصدار فاتورة', 
            icon: FilePlus, 
            href: '/student-invoices?action=new', 
            color: 'emerald',
            description: 'إنشاء فاتورة رسوم دراسية'
        },
        { 
            title: 'إعلان عام', 
            icon: Megaphone, 
            href: '/announcements?action=new', 
            color: 'rose',
            description: 'نشر تنبيه لجميع المستخدمين'
        },
        { 
            title: 'تعديل الجدول', 
            icon: Calendar, 
            href: '/schedule', 
            color: 'amber',
            description: 'إدارة مواعيد الحصص'
        }
    ];

    return (
        <div className="grid grid-cols-2 gap-3 mb-0">
            {actions.map((action, i) => (
                <Link
                    key={i}
                    to={action.href}
                    className="group relative bg-white dark:bg-slate-900 border-2 border-gray-950 dark:border-slate-800 p-3 hover:translate-x-0.5 hover:translate-y-0.5 transition-all duration-300 rounded-none overflow-hidden shadow-[2px_2px_0px_0px_black]"
                >
                    <div className={cn(
                        "absolute top-0 right-0 w-1 h-full bg-gray-950",
                        action.color === 'blue' ? 'bg-blue-600' :
                        action.color === 'emerald' ? 'bg-emerald-600' :
                        action.color === 'rose' ? 'bg-rose-600' :
                        'bg-amber-600'
                    )}></div>
                    
                    <div className="flex items-center justify-between mb-2">
                        <div className={cn(
                            "p-2 rounded-none border-2 border-gray-950",
                            action.color === 'blue' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30' :
                            action.color === 'emerald' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30' :
                            action.color === 'rose' ? 'bg-rose-50 text-rose-600 dark:bg-rose-900/30' :
                            'bg-amber-50 text-amber-600 dark:bg-amber-900/30'
                        )}>
                            <action.icon size={16} />
                        </div>
                        <ArrowRight size={14} className="text-gray-300 group-hover:text-gray-950 transition-all" />
                    </div>
                    
                    <h3 className="font-black text-gray-950 dark:text-white text-[11px] mb-0.5 tracking-tighter uppercase italic">{action.title}</h3>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter truncate">{action.description}</p>
                </Link>
            ))}
        </div>
    );
};
