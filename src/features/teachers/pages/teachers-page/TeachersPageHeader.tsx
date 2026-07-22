import { Plus, X, Users } from 'lucide-react';
import { cn } from '../../../../lib/utils';

interface TeachersPageHeaderProps {
    totalTeachers: number;
    showAddForm: boolean;
    onToggleForm: () => void;
}

export const TeachersPageHeader = ({ totalTeachers, showAddForm, onToggleForm }: TeachersPageHeaderProps) => (
    <div className="bg-surface border border-border/50 rounded-2xl p-3 md:p-4">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary-soft flex items-center justify-center">
                    <Users size={17} className="text-primary" />
                </div>
                <div>
                    <h1 className="text-sm font-bold text-main leading-tight">إدارة المعلمات</h1>
                    <p className="text-[10px] text-dim">{totalTeachers} معلمة نشطة</p>
                </div>
            </div>
            <button onClick={onToggleForm}
                className={cn("flex items-center gap-1.5 text-[11px] font-bold px-3 py-2 rounded-xl active:scale-[0.97] transition-transform",
                    showAddForm ? "bg-error text-on-error" : "bg-primary text-on-primary")}>
                {showAddForm ? <X size={13} /> : <Plus size={13} />}
                {showAddForm ? 'إلغاء' : 'إضافة'}
            </button>
        </div>
    </div>
);