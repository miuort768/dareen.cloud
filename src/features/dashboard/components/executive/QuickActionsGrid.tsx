import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, UserPlus, FileText, Settings, Shield, BookOpen, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const QUICK_ACTIONS = [
    { label: 'إضافة طالب', icon: UserPlus, colorClass: 'text-chart-1', bgClass: 'bg-card', iconBgClass: 'bg-chart-1/15', path: '/students/add' },
    { label: 'تسجيل جلسة', icon: PlusCircle, colorClass: 'text-chart-2', bgClass: 'bg-card', iconBgClass: 'bg-chart-2/15', path: '/sessions/add' },
    { label: 'رفع ملف', icon: BookOpen, colorClass: 'text-chart-4', bgClass: 'bg-card', iconBgClass: 'bg-chart-4/15', path: '/study-material/upload' },
    { label: 'التقارير', icon: FileText, colorClass: 'text-chart-5', bgClass: 'bg-card', iconBgClass: 'bg-chart-5/15', path: '/reports' },
    { label: 'نسخ احتياطي', icon: Shield, colorClass: 'text-chart-3', bgClass: 'bg-card', iconBgClass: 'bg-chart-3/15', path: '/settings' },
    { label: 'الإعدادات', icon: Settings, colorClass: 'text-muted', bgClass: 'bg-card', iconBgClass: 'bg-muted/15', path: '/settings' },
];

export const QuickActionsGrid = memo(function QuickActionsGrid() {
    const navigate = useNavigate();

    return (
        <Card>
            <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
                <Zap size={16} className="text-muted" />
                <h3 className="text-xs text-muted">إجراءات سريعة</h3>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {QUICK_ACTIONS.map((action) => {
                    const Icon = action.icon;
                    return (
                        <button
                            key={action.label}
                            onClick={() => navigate(action.path)}
                            className="group relative flex flex-col items-center gap-2 py-4 px-2 rounded-2xl transition-all duration-300 hover:shadow-soft cursor-pointer border border-border/30 hover:border-border/60 bg-surface/50 hover:bg-surface"
                            title={action.label}
                        >
                            <div
                                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${action.iconBgClass}`}
                            >
                                <Icon size={20} className={action.colorClass} />
                            </div>
                            <span className="text-micro font-medium leading-tight text-muted group-hover:text-main transition-colors duration-200">{action.label}</span>
                        </button>
                    );
                })}
            </div>
        </CardContent></Card>
    );
});
