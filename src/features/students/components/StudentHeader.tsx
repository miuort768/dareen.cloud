import { Plus, X } from 'lucide-react';
import { Image } from '../../../shared/components/ui';
import { cn } from '../../../lib/utils';

interface StudentHeaderProps {
    count: number;
    showAddForm: boolean;
    onToggleAddForm: () => void;
}

export const StudentHeader = ({ count, showAddForm, onToggleAddForm }: StudentHeaderProps) => {
    return (
        <div className="relative overflow-hidden bg-error px-4 md:px-8 py-8 flex flex-row items-center justify-between gap-4 border-b border-error-hover shadow-sm" dir="rtl">
            {/* Geometric Background Element */}
            <div className="absolute top-0 start-0 w-64 h-64 bg-white/10 rotate-45 -translate-y-1/2 translate-x-1/2 blur-2xl pointer-events-none"></div>

            <div className="relative z-10 flex items-center gap-4">
                <div className="w-12 h-12 overflow-hidden border-2 border-success shadow-lg shrink-0 bg-white/5 ">
                        <Image src="/chat-avatar.jpg" alt="الشعار" className="w-full h-full" />
                    </div>
                <div>
                    <h1 className="text-sm md:text-xl font-medium text-on-primary uppercase tracking-tighter">سجل الطلاب والمنتسبين</h1>
                    <div className="hidden md:flex items-center gap-3 mt-1.5">
                         <p className="text-micro text-on-error font-medium uppercase tracking-widest">الإدارة الأكاديمية • {count} طالب نشط</p>
                         <span className="w-1.5 h-1.5 bg-white shadow-[0_0_8px_rgb(255_255_255_/_0.5)] animate-pulse"></span>
                         <span className="text-micro font-medium text-on-error uppercase tracking-widest border border-white/20 px-2 py-0.5 bg-white/10">مركز التحكم</span>
                    </div>
                </div>
            </div>

            <div className="relative z-10 flex items-center gap-3 no-print">
                <button
                    onClick={onToggleAddForm}
                    className={cn(
                        "h-12 px-6 flex items-center justify-center gap-2 text-xs font-medium uppercase tracking-widest transition-all shadow-sm active:scale-95 border",
                        showAddForm 
                        ? "bg-card text-error border-white hover:bg-error-soft" 
                        : "bg-primary text-on-primary border-primary hover:bg-primary-hover"
                    )}
                >
                    {showAddForm ? <X size={16} strokeWidth={2.5} /> : <Plus size={16} strokeWidth={2.5} />}
                    <span className="hidden sm:inline">{showAddForm ? 'إلغاء العملية' : 'إضافة طالب جديد'}</span>
                </button>
            </div>
        </div>
    );
};

