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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {actions.map((action, i) => (
                <Link
                    key={i}
                    to={action.href}
                    className="group relative bg-white dark:bg-gray-950 border-4 border-gray-900 dark:border-gray-800 p-6 hover:-translate-y-1 transition-all duration-300 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.1)] overflow-hidden"
                >
                    <div className={cn(
                        "absolute top-0 right-0 w-2 h-full",
                        action.color === 'blue' ? 'bg-blue-600' :
                        action.color === 'emerald' ? 'bg-emerald-600' :
                        action.color === 'rose' ? 'bg-rose-600' :
                        'bg-amber-600'
                    )}></div>
                    
                    <div className="flex items-start justify-between mb-4">
                        <div className={cn(
                            "p-3 border-2 border-current rounded-none",
                            action.color === 'blue' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30' :
                            action.color === 'emerald' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30' :
                            action.color === 'rose' ? 'bg-rose-50 text-rose-600 dark:bg-rose-900/30' :
                            'bg-amber-50 text-amber-600 dark:bg-amber-900/30'
                        )}>
                            <action.icon size={24} />
                        </div>
                        <ArrowRight size={20} className="text-gray-300 group-hover:text-gray-950 dark:group-hover:text-white group-hover:translate-x-[-10px] transition-all" />
                    </div>
                    
                    <h3 className="font-black text-gray-950 dark:text-white text-lg mb-1 tracking-tight">{action.title}</h3>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{action.description}</p>
                </Link>
            ))}
        </div>
    );
};
