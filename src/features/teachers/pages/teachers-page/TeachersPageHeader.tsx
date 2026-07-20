import { Plus, X, Presentation } from 'lucide-react';
import { cn } from '../../../../lib/utils';

interface TeachersPageHeaderProps {
    totalTeachers: number;
    showAddForm: boolean;
    onToggleForm: () => void;
}

export const TeachersPageHeader = ({ totalTeachers, showAddForm, onToggleForm }: TeachersPageHeaderProps) => (
    <div className="bg-primary shadow-soft rounded-card px-5 md:px-7 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-card flex items-center justify-center bg-primary-soft">
                <Presentation size={22} className="text-primary" />
            </div>
            <div>
                <h1 className="text-card-title font-bold font-heading text-on-primary leading-tight">إدارة المعلمات</h1>
                <p className="text-xs text-on-primary/70 mt-0.5">إدارة بيانات المعلمات ومتابعة الحصص</p>
                <div className="hidden md:flex items-center gap-3 mt-2">
                    <span className="text-xs text-on-primary/60">{totalTeachers} معلمة</span>
                    <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
                    <span className="text-xs px-2 py-0.5 rounded-card bg-error text-on-error font-bold">نشطة</span>
                </div>
            </div>
        </div>
        <div className="flex items-center gap-3 no-print">
            <button onClick={onToggleForm}
                className={cn("h-9 px-4 flex items-center justify-center gap-2 text-xs font-bold transition-all shadow-soft active:scale-95 rounded-xl",
                    showAddForm ? "bg-error text-on-error hover:bg-error-hover" : "bg-white/15 text-on-primary border border-white/20 hover:bg-white/25")}>
                {showAddForm ? <X size={14} /> : <Plus size={14} />}
                <span className="hidden md:inline">{showAddForm ? 'إلغاء' : 'إضافة معلمة'}</span>
            </button>
        </div>
    </div>
);
