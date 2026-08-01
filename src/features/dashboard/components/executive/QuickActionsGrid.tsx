import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, UserPlus, FileText, Settings, Shield, BookOpen, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

const QUICK_ACTIONS = [
    { label: 'إضافة طالب', icon: UserPlus, color: 'text-primary', bg: 'bg-primary-soft', path: '/students/add' },
    { label: 'تسجيل جلسة', icon: PlusCircle, color: 'text-success', bg: 'bg-success-soft', path: '/sessions/add' },
    { label: 'رفع ملف', icon: BookOpen, color: 'text-info', bg: 'bg-info-soft', path: '/study-material/upload' },
    { label: 'التقارير', icon: FileText, color: 'text-warning', bg: 'bg-warning-soft', path: '/reports' },
    { label: 'نسخ احتياطي', icon: Shield, color: 'text-primary', bg: 'bg-primary-soft', path: '/settings' },
    { label: 'الإعدادات', icon: Settings, color: 'text-muted', bg: 'bg-surface', path: '/settings' },
];

export const QuickActionsGrid = memo(function QuickActionsGrid() {
    const navigate = useNavigate();

    return (
        <div className="rounded-2xl bg-card border border-border p-5 font-dash" dir="rtl">
            <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-xl bg-primary-soft flex items-center justify-center">
                    <Zap size={16} className="text-primary" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-main">إجراءات سريعة</h3>
                    <p className="text-[10px] text-muted">الوصول المباشر</p>
                </div>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {QUICK_ACTIONS.map((action) => {
                    const Icon = action.icon;
                    return (
                        <button
                            key={action.label}
                            onClick={() => navigate(action.path)}
                            className="group flex flex-col items-center gap-2 py-4 px-2 rounded-2xl border border-border hover:border-border-strong bg-surface hover:bg-hover transition-all duration-200 cursor-pointer"
                            title={action.label}
                        >
                            <div className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110",
                                action.bg
                            )}>
                                <Icon size={18} className={action.color} />
                            </div>
                            <span className="text-[10px] font-bold leading-tight text-muted group-hover:text-main transition-colors">
                                {action.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
});
