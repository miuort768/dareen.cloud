import { Play, BookOpen, Send, UserCheck } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface QuickActionsProps {
    navigate: (path: string) => void;
    onStartSession: () => void;
}

const actions = [
    { label: 'بدء حصة', icon: Play, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
    { label: 'إضافة واجب', icon: BookOpen, path: '/tasks', color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
    { label: 'إرسال إشعار', icon: Send, path: '/chat', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10' },
    { label: 'تسجيل حضور', icon: UserCheck, path: '/attendance', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-500/10' },
];

export const QuickActions = ({ navigate, onStartSession }: QuickActionsProps) => (
    <div className="grid grid-cols-4 gap-2 sm:gap-3">
        {actions.map(action => (
            <button
                key={action.label}
                onClick={() => action.path ? navigate(action.path) : onStartSession()}
                className={cn(
                    "bg-white dark:bg-slate-800 rounded-2xl p-3 sm:p-4 shadow-sm border border-slate-100 dark:border-slate-700 transition-all text-center",
                    "hover:shadow-md hover:-translate-y-0.5 active:scale-[0.97]"
                )}
            >
                <div className={cn("w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center mx-auto mb-1.5", action.bg)}>
                    <action.icon size={18} className={action.color} />
                </div>
                <span className="block text-[9px] sm:text-[10px] font-bold text-slate-600 dark:text-slate-400 leading-tight">
                    {action.label}
                </span>
            </button>
        ))}
    </div>
);
