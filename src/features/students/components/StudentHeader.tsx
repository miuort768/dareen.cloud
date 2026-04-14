import { Users, GraduationCap, Plus, X } from 'lucide-react';

interface StudentHeaderProps {
    count: number;
    showAddForm: boolean;
    onToggleAddForm: () => void;
}

export const StudentHeader = ({ count, showAddForm, onToggleAddForm }: StudentHeaderProps) => {
    return (
        <div className="relative bg-white border-2 border-gray-950 p-4 shadow-[2px_2px_0px_0px_black] overflow-hidden mb-6 rounded-none">
            {/* Brutalist Pattern Background */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 2px, transparent 0)', backgroundSize: '24px 24px' }}></div>
            <div className="absolute top-0 right-0 w-32 h-full bg-primary-600/10 -skew-x-12 transform translate-x-16 pointer-events-none"></div>

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary-600 text-white border-2 border-gray-950 flex items-center justify-center transform -rotate-3 shadow-[2px_2px_0px_0px_black]">
                        <Users size={24} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <GraduationCap size={14} className="text-primary-600" />
                            <span className="text-[9px] font-black text-primary-600 uppercase tracking-widest">نظام إدارة الأكاديمية</span>
                        </div>
                        <h1 className="text-xl md:text-2xl font-black text-gray-950 tracking-tighter uppercase leading-none">قاعدة بيانات الطلاب</h1>
                        <div className="mt-2 flex items-center gap-2">
                             <div className="bg-gray-950 text-white px-2 py-0.5 text-[9px] font-black uppercase tracking-widest border-2 border-gray-950">
                                {count} طالب مسجل
                             </div>
                             <div className="bg-emerald-50 text-emerald-700 border-2 border-emerald-600 px-2 py-0.5 text-[9px] font-black uppercase">
                                الحالة: نشط
                             </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap gap-4 no-print items-center">
                    <button
                        onClick={onToggleAddForm}
                        className={`group relative px-4 py-2 font-black uppercase tracking-widest transition-all text-xs ${
                            showAddForm 
                            ? 'bg-rose-500 text-white border-2 border-gray-950 shadow-[2px_2px_0px_0px_black]' 
                            : 'bg-primary-600 text-white border-2 border-gray-950 shadow-[2px_2px_0px_0px_black] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none'
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            {showAddForm ? <X size={16} /> : <Plus size={16} />}
                            <span>{showAddForm ? 'إلغاء العملية' : 'إضافة طالب جديد'}</span>
                        </div>
                    </button>
                    
                    <div className="hidden lg:flex items-center gap-3 border-l-2 border-gray-100 pr-3">
                        <div className="text-right">
                            <p className="text-[9px] font-black text-gray-400 uppercase leading-none">تحديث تلقائي</p>
                            <p className="text-[10px] font-black text-gray-950 uppercase mt-0.5">متصل الآن</p>
                        </div>
                        <div className="w-2.5 h-2.5 bg-emerald-500 rounded-none border-2 border-gray-950 animate-pulse"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};
