import { UserPlus, FileText, CalendarDays, Megaphone, ArrowLeft, Play, Zap } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface QuickActionsProps {
    onStartSession?: () => void;
    sessionAvailable?: boolean;
}

const actions = [
    {
        title: '≈÷«›… ÿ«·»',
        subtitle: ' ”ÃÌ· ÃœÌœ',
        icon: UserPlus,
        href: '/students?action=new',
        color: 'bg-primary-soft text-primary',
    },
    {
        title: '≈’œ«— ›« Ê—…',
        subtitle: '≈‰‘«¡ ›« Ê—…',
        icon: FileText,
        href: '/student-invoices?action=new',
        color: 'bg-success-soft text-success',
    },
    {
        title: '«·ÃœÊ· «·√”»Ê⁄Ì',
        subtitle: '⁄—÷ «·Õ’’',
        icon: CalendarDays,
        href: '/schedule',
        color: 'bg-info-soft text-info',
    },
    {
        title: '≈⁄·«‰ ⁄«„',
        subtitle: '»À ≈‘⁄«—',
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
                    "w-full p-4 rounded-2xl",
                    "bg-gradient-to-l from-primary via-primary to-primary-deep dark:from-primary dark:via-primary dark:to-warning",
                    "text-on-primary dark:text-on-primary font-bold text-sm",
                    "hover:shadow-lg hover:shadow-primary/25 dark:hover:shadow-primary/20",
                    "active:scale-[0.98]",
                    "transition-all duration-200",
                    "flex items-center justify-center gap-3",
                    "group relative overflow-hidden"
                )}
            >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.15)_0%,transparent_70%)]" />
                <span className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-white/20 dark:bg-background/20 group-hover:bg-white/30 dark:group-hover:bg-black/30 transition-colors">
                    <Play size={18} fill="currentColor" />
                </span>
                <span className="relative text-base">»œ¡ «·Õ’… «·¬‰</span>
                {sessionAvailable && (
                    <span className="relative px-2 py-0.5 rounded-lg bg-on-primary/20 text-on-primary text-[10px] font-bold animate-pulse">
                        „ «Õ
                    </span>
                )}
            </button>

            <div className="grid grid-cols-2 gap-2.5">
                {actions.map((action, i) => {
                    const Icon = action.icon;

                    return (
                        <Link key={`action-${i}`} to={action.href} className="block h-full">
                            <div className={cn(
                                "group h-full p-4 rounded-2xl bg-card dark:bg-card border border-border dark:border-primary/20",
                                "hover:border-primary/30 dark:hover:border-primary/30 hover:shadow-sm transition-all duration-200",
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
                                    <div>
                                        <h3 className="font-bold text-[13px] text-main dark:text-main leading-tight">
                                            {action.title}
                                        </h3>
                                        <p className="text-[10px] text-muted dark:text-muted mt-0.5">
                                            {action.subtitle}
                                        </p>
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
