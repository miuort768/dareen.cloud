import { Play, BookOpen, Send, UserCheck } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface QuickActionsProps {
    navigate: (path: string) => void;
    onStartSession: () => void;
}

const actions = [
    { label: 'بدء حصة', icon: Play, color: 'text-success', bg: 'bg-success-soft' },
    { label: 'إضافة واجب', icon: BookOpen, path: '/tasks', color: 'text-primary', bg: 'bg-primary-soft' },
    { label: 'إرسال إشعار', icon: Send, path: '/chat', color: 'text-warning-dark', bg: 'bg-warning-soft' },
    { label: 'تسجيل حضور', icon: UserCheck, path: '/attendance', color: 'text-accent', bg: 'bg-accent-soft' },
];

export const QuickActions = ({ navigate, onStartSession }: QuickActionsProps) => (
    <div className="grid grid-cols-4 gap-2 sm:gap-3">
        {actions.map(action => (
            <button
                key={action.label}
                onClick={() => action.path ? navigate(action.path) : onStartSession()}
                className={cn(
                    "bg-card border border-border rounded-2xl p-3 sm:p-4 shadow-sm transition-all text-center",
                    "hover:shadow-md hover:-translate-y-0.5 active:scale-[0.97]"
                )}
            >
                <div className={cn("w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center mx-auto mb-1.5", action.bg)}>
                    <action.icon size={18} className={action.color} />
                </div>
                <span className="block text-micro sm:text-micro font-bold text-muted leading-tight">
                    {action.label}
                </span>
            </button>
        ))}
    </div>
);
