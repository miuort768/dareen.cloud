import { UserPlus, FileText, CalendarDays, Megaphone, ArrowLeft, Play } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface QuickActionsProps {
    onStartSession?: () => void;
    sessionAvailable?: boolean;
}

const actions = [
    {
        title: 'إضافة طالب',
        icon: UserPlus,
        href: '/students?action=new',
        color: 'bg-primary-soft text-primary',
    },
    {
        title: 'إصدار فاتورة',
        icon: FileText,
        href: '/student-invoices?action=new',
        color: 'bg-success-soft text-success',
    },
    {
        title: 'الجدول الأسبوعي',
        icon: CalendarDays,
        href: '/schedule',
        color: 'bg-info-soft text-info',
    },
    {
        title: 'إعلان عام',
        icon: Megaphone,
        href: '/announcements',
        color: 'bg-warning-soft text-warning',
    },
];

export const QuickActions = ({ onStartSession, sessionAvailable }: QuickActionsProps) => {
    const navigate = useNavigate();

    return (
        <div className="space-y-3" dir="rtl">
            <button
                onClick={() => {
                    if (onStartSession) onStartSession();
                    else navigate('/schedule');
                }}
                className={cn(
                    "w-full p-4 rounded-2xl border-2 border-primary/30",
                    "bg-primary dark:bg-primary text-on-primary dark:text-on-primary font-bold text-sm",
                    "hover:bg-primary-hover hover:border-primary/50 hover:shadow-lg hover:shadow-primary/20",
                    "active:bg-primary-active",
                    "transition-all duration-200",
                    "flex items-center justify-center gap-3",
                    "group"
                )}
            >
                <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/20 dark:bg-black/20 group-hover:bg-white/30 dark:group-hover:bg-black/30 transition-colors">
                    <Play size={18} fill="currentColor" />
                </span>
                <span className="text-base">بدء الحصة الآن</span>
                {sessionAvailable && (
                    <span className="px-2 py-0.5 rounded-lg bg-success dark:bg-primary text-on-success dark:text-black text-[10px] font-bold animate-pulse">
                        متاح
                    </span>
                )}
            </button>

            <div className="grid grid-cols-2 gap-2.5">
                {actions.map((action, i) => {
                    const Icon = action.icon;

                    return (
                        <Link key={`action-${i}`} to={action.href} className="block h-full">
                            <div className={cn(
                                "group h-full p-4 sm:p-4 rounded-2xl bg-card dark:bg-card border border-border dark:border-primary/20",
                                "hover:border-primary/30 dark:hover:border-primary/40 hover:shadow-sm transition-all duration-200",
                                "active:scale-[0.97]"
                            )}>
                                <div className="flex flex-col items-center gap-2.5 text-center">
                                    <div className={cn(
                                        "w-11 h-11 rounded-xl flex items-center justify-center",
                                        action.color,
                                        "group-hover:scale-105 transition-transform duration-200"
                                    )}>
                                        <Icon size={20} />
                                    </div>
                                    <h3 className="font-bold text-[13px] text-main dark:text-main leading-tight">
                                        {action.title}
                                    </h3>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};
