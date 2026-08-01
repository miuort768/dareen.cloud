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
                    "bg-primary text-white font-bold text-base",
                    "hover:bg-primary-hover hover:border-primary/50 hover:shadow-lg hover:shadow-primary/20",
                    "active:bg-primary-active",
                    "transition-all duration-200",
                    "flex items-center justify-center gap-3",
                    "group"
                )}
            >
                <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/20 group-hover:bg-white/30 transition-colors">
                    <Play size={20} fill="currentColor" />
                </span>
                <span className="text-lg">بدء الحصة الآن</span>
                {sessionAvailable && (
                    <span className="px-2 py-0.5 rounded-lg bg-success text-white text-[10px] font-bold animate-pulse">
                        متاح
                    </span>
                )}
            </button>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {actions.map((action, i) => {
                    const Icon = action.icon;

                    return (
                        <Link key={`action-${i}`} to={action.href} className="block h-full">
                            <div className={cn(
                                "group h-full p-4 rounded-2xl bg-card border border-border",
                                "hover:border-border-strong transition-all duration-200",
                                "font-dash"
                            )}>
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                                        action.color,
                                        "group-hover:scale-105 transition-transform duration-200"
                                    )}>
                                        <Icon size={18} />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-sm text-main leading-tight truncate">
                                            {action.title}
                                        </h3>
                                        <div className="flex items-center gap-1 text-[11px] font-medium text-muted group-hover:text-primary transition-colors mt-1">
                                            <span>انتقال</span>
                                            <ArrowLeft size={10} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};
