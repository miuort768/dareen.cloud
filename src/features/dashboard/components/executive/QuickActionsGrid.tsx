import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, UserPlus, FileText, Settings, Shield, BookOpen, Zap } from 'lucide-react';

const QUICK_ACTIONS = [
    { label: 'إضافة طالب', icon: UserPlus, color: 'var(--chart-1)', bg: 'rgba(99,102,241,0.08)', path: '/students/add' },
    { label: 'تسجيل جلسة', icon: PlusCircle, color: 'var(--chart-2)', bg: 'rgba(34,197,94,0.08)', path: '/sessions/add' },
    { label: 'رفع ملف', icon: BookOpen, color: 'var(--chart-4)', bg: 'rgba(168,85,247,0.08)', path: '/study-material/upload' },
    { label: 'التقارير', icon: FileText, color: 'var(--chart-5)', bg: 'rgba(249,115,22,0.08)', path: '/reports' },
    { label: 'نسخ احتياطي', icon: Shield, color: 'var(--chart-3)', bg: 'rgba(236,72,153,0.08)', path: '/settings' },
    { label: 'الإعدادات', icon: Settings, color: 'var(--text-muted)', bg: 'rgba(100,116,139,0.08)', path: '/settings' },
];

export const QuickActionsGrid = memo(function QuickActionsGrid() {
    const navigate = useNavigate();

    return (
        <div className="relative overflow-hidden rounded-3xl bg-white/80 dark:bg-card/80 backdrop-blur-xl border border-border/50 dark:border-border/50 shadow-lg shadow-black/5">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-soft/5 via-transparent to-surface/10 dark:from-primary-soft/5 dark:to-surface/10 pointer-events-none" />
            <div className="relative p-5">
                <div className="flex items-center gap-2 mb-4">
                    <Zap size={16} className="text-muted/60" />
                    <h3 className="text-sm font-semibold text-muted dark:text-muted/80">إجراءات سريعة</h3>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                    {QUICK_ACTIONS.map((action) => {
                        const Icon = action.icon;
                        return (
                            <button
                                key={action.label}
                                onClick={() => navigate(action.path)}
                                className="group relative flex flex-col items-center gap-2 py-4 px-2 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-pointer border border-transparent hover:border-border/20"
                                style={{ backgroundColor: action.bg }}
                                title={action.label}
                            >
                                <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg"
                                    style={{ backgroundColor: action.color + '15' }}
                                >
                                    <Icon size={20} style={{ color: action.color }} />
                                </div>
                                <span className="text-micro font-medium leading-tight text-muted/70 dark:text-muted/50 group-hover:text-main dark:group-hover:text-on-primary/80 transition-colors duration-200">{action.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
});
