import { UserPlus, FilePlus, Megaphone, ArrowLeft, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../../../lib/utils';

export const QuickActionsHub = () => {
    const actions = [
        { 
            title: 'إضافة طالب جديد', 
            icon: UserPlus, 
            href: '/students?action=new', 
            color: 'indigo',
            gradient: 'from-indigo-600 to-blue-600',
            description: 'تسجيل طالب جديد في النظام'
        },
        { 
            title: 'إصدار فاتورة', 
            icon: FilePlus, 
            href: '/student-invoices?action=new', 
            color: 'emerald',
            gradient: 'from-emerald-600 to-teal-600',
            description: 'إنشاء فاتورة رسوم دراسية'
        },
        { 
            title: 'تعديل الجدول', 
            icon: Calendar, 
            href: '/schedule', 
            color: 'amber',
            gradient: 'from-amber-600 to-orange-600',
            description: 'إدارة مواعيد الحصص'
        },
        { 
            title: 'إعلان عام', 
            icon: Megaphone, 
            href: '/announcements?action=new', 
            color: 'rose',
            gradient: 'from-rose-600 to-pink-600',
            description: 'نشر تنبيه لجميع المستخدمين'
        }
    ];

    return (
        <>
            {actions.map((action, i) => (
                <Link
                    key={i}
                    to={action.href}
                    className="group relative bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl p-5 rounded-[2rem] border border-white dark:border-slate-800 shadow-xl transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 overflow-hidden"
                >
                    {/* Background Glow */}
                    <div className={cn(
                        "absolute -top-10 -left-10 w-24 h-24 bg-gradient-to-br opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-20",
                        action.gradient
                    )}></div>

                    <div className="relative flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <div className={cn(
                                "w-10 h-10 flex items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3",
                                action.gradient
                            )}>
                                <action.icon size={18} />
                            </div>
                            <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-slate-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 -translate-x-4 group-hover:translate-x-0">
                                <ArrowLeft size={14} className="text-gray-400 group-hover:text-indigo-500" />
                            </div>
                        </div>
                        
                        <div>
                            <h3 className="font-bold text-slate-800 dark:text-white text-sm mb-1">{action.title}</h3>
                            <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 leading-tight">{action.description}</p>
                        </div>
                    </div>
                </Link>
            ))}
        </>
    );
};
