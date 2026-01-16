import { Users, GraduationCap, Plus, X } from 'lucide-react';

interface StudentHeaderProps {
    count: number;
    showAddForm: boolean;
    onToggleAddForm: () => void;
}

export const StudentHeader = ({ count, showAddForm, onToggleAddForm }: StudentHeaderProps) => {
    return (
        <div className="relative bg-primary-600 p-8 shadow-xl overflow-hidden mb-6 border-b-4 border-primary-500">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner rounded-none">
                        <Users size={32} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-white mb-2 tracking-tight">إدارة شؤون الطلاب</h1>
                        <div className="flex items-center gap-2 bg-black/20 backdrop-blur-sm px-3 py-1 border border-white/10 w-fit rounded-none">
                            <GraduationCap size={14} className="text-primary-300" />
                            <p className="text-white text-xs font-bold leading-none shadow-sm">
                                إجمالي الطلاب المسجلين: <span className="text-yellow-400 text-sm font-black mx-1">{count}</span> طالب
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 no-print items-center">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner rounded-none">
                        <span className="text-white font-black text-xl">{count}</span>
                    </div>
                    <button
                        onClick={onToggleAddForm}
                        className="bg-white text-primary-700 px-6 py-3 rounded-none flex items-center gap-3 hover:bg-white/95 active:bg-primary-50 transition-all font-black shadow-[0_10px_20px_-10px_rgba(0,0,0,0.3)] transform hover:-translate-y-1 active:translate-y-0 h-12"
                    >
                        {showAddForm ? <X size={20} /> : <Plus size={20} />}
                        <span>{showAddForm ? 'إلغاء العملية' : 'إضافة طالب جديد'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
