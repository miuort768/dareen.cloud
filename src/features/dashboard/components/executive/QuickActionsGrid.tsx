import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, UserPlus, FileText, Settings, Shield, BookOpen } from 'lucide-react';
import { cn } from '../../../../lib/utils';

const QUICK_ACTIONS = [
    { label: 'إضافة طالب', icon: UserPlus, color: 'text-chart-1', bg: 'bg-chart-1/10', path: '/students/add' },
    { label: 'تسجيل جلسة', icon: PlusCircle, color: 'text-chart-2', bg: 'bg-chart-2/10', path: '/sessions/add' },
    { label: 'رفع ملف', icon: BookOpen, color: 'text-chart-4', bg: 'bg-chart-4/10', path: '/study-material/upload' },
    { label: 'التقارير', icon: FileText, color: 'text-chart-5', bg: 'bg-chart-5/10', path: '/reports' },
    { label: 'نسخ احتياطي', icon: Shield, color: 'text-chart-3', bg: 'bg-chart-3/10', path: '/settings' },
    { label: 'الإعدادات', icon: Settings, color: 'text-muted', bg: 'bg-surface', path: '/settings' },
];

export const QuickActionsGrid = memo(function QuickActionsGrid() {
    const navigate = useNavigate();

    return (
        <div className="bg-card border border-border shadow-sm rounded-3xl p-5">
            <h3 className="text-sm font-semibold text-muted mb-4">إجراءات سريعة</h3>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {QUICK_ACTIONS.map((action) => {
                    const Icon = action.icon;
                    return (
                        <button
                            key={action.label}
                            onClick={() => navigate(action.path)}
                            className={cn(
                                'flex flex-col items-center gap-1.5 py-4 px-2 rounded-2xl transition-all duration-200 hover:-translate-y-0.5 cursor-pointer',
                                action.bg
                            )}
                            style={{ color: 'inherit' }}
                            title={action.label}
                        >
                            <Icon size={24} className={action.color} />
                            <span className={cn('text-[10px] font-medium leading-tight', action.color)}>{action.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
});
