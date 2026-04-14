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
                    className="group relative bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-3 hover:shadow-md transition-all duration-300 rounded-2xl overflow-hidden"
                >
                    <div className={cn(
                        "absolute top-0 right-0 w-1 h-full",
                        action.color === 'blue' ? 'bg-blue-600' :
                        action.color === 'emerald' ? 'bg-emerald-600' :
                        action.color === 'rose' ? 'bg-rose-600' :
                        'bg-amber-600'
                    )}></div>
                    
                    <div className="flex items-center justify-between mb-2">
                        <div className={cn(
                            "p-2 rounded-xl",
                            action.color === 'blue' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30' :
                            action.color === 'emerald' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30' :
                            action.color === 'rose' ? 'bg-rose-50 text-rose-600 dark:bg-rose-900/30' :
                            'bg-amber-50 text-amber-600 dark:bg-amber-900/30'
                        )}>
                            <action.icon size={16} />
                        </div>
                        <ArrowRight size={14} className="text-gray-300 group-hover:text-primary-600 transition-all" />
                    </div>
                    
                    <h3 className="font-bold text-gray-900 dark:text-white text-xs mb-0.5 tracking-tight">{action.title}</h3>
                    <p className="text-[9px] font-medium text-gray-400 uppercase tracking-tighter truncate">{action.description}</p>
                </Link>
            ))}
        </div>
    );
};
