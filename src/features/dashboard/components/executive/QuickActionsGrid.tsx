import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, UserPlus, FileText, Settings, Shield, BookOpen } from 'lucide-react';

const QUICK_ACTIONS = [
    { label: 'إضافة طالب', icon: UserPlus, color: '#3b82f6', bg: '#eff6ff', path: '/students/add' },
    { label: 'تسجيل جلسة', icon: PlusCircle, color: '#22c55e', bg: '#f0fdf4', path: '/sessions/add' },
    { label: 'رفع ملف', icon: BookOpen, color: '#8b5cf6', bg: '#f5f3ff', path: '/study-material/upload' },
    { label: 'التقارير', icon: FileText, color: '#f59e0b', bg: '#fffbeb', path: '/reports' },
    { label: 'نسخ احتياطي', icon: Shield, color: '#ec4899', bg: '#fdf2f8', path: '/settings' },
    { label: 'الإعدادات', icon: Settings, color: '#6b7280', bg: '#f3f4f6', path: '/settings' },
];

export const QuickActionsGrid = memo(function QuickActionsGrid() {
    const navigate = useNavigate();

    return (
        <div className="rounded-3xl p-5 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-4">إجراءات سريعة</h3>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {QUICK_ACTIONS.map((action) => {
                    const Icon = action.icon;
                    return (
                        <button
                            key={action.label}
                            onClick={() => navigate(action.path)}
                            className="flex flex-col items-center gap-1.5 py-4 px-2 rounded-2xl transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
                            style={{ backgroundColor: action.bg, color: action.color }}
                            title={action.label}
                        >
                            <Icon size={24} />
                            <span className="text-[10px] font-medium leading-tight">{action.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
});
