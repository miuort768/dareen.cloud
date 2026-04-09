import { Users, GraduationCap, Plus, X, Search, Filter } from 'lucide-react';

interface StudentHeaderProps {
    count: number;
    showAddForm: boolean;
    onToggleAddForm: () => void;
}

export const StudentHeader = ({ count, showAddForm, onToggleAddForm }: StudentHeaderProps) => {
    return (
        <div className="relative bg-white border-4 border-gray-950 p-8 shadow-[10px_10px_0px_0px_black] overflow-hidden mb-8 rounded-none">
            {/* Brutalist Pattern Background */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 2px, transparent 0)', backgroundSize: '24px 24px' }}></div>
            <div className="absolute top-0 right-0 w-32 h-full bg-primary-600/10 -skew-x-12 transform translate-x-16 pointer-events-none"></div>

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-primary-600 text-white border-4 border-gray-950 flex items-center justify-center transform -rotate-3 shadow-[4px_4px_0px_0px_black]">
                        <Users size={32} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <GraduationCap size={16} className="text-primary-600" />
                            <span className="text-[10px] font-black text-primary-600 uppercase tracking-[0.3em]">نظام إدارة الأكاديمية</span>
                        </div>
                        <h1 className="text-2xl md:text-4xl font-black text-gray-950 tracking-tighter uppercase leading-none">قاعدة بيانات الطلاب</h1>
                        <div className="mt-3 flex items-center gap-2">
                             <div className="bg-gray-950 text-white px-3 py-1 text-xs font-black uppercase tracking-widest border-2 border-gray-950">
                                {count} طالب مسجل
                             </div>
                             <div className="bg-emerald-50 text-emerald-700 border-2 border-emerald-600 px-3 py-1 text-[10px] font-black uppercase">
                                الحالة: نشط
                             </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap gap-4 no-print items-center">
                    <button
                        onClick={onToggleAddForm}
                        className={`group relative px-8 py-4 font-black uppercase tracking-widest transition-all ${
                            showAddForm 
                            ? 'bg-rose-500 text-white border-4 border-gray-950 shadow-[4px_4px_0px_0px_black]' 
                            : 'bg-primary-600 text-white border-4 border-gray-950 shadow-[4px_4px_0px_0px_black] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none'
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            {showAddForm ? <X size={20} /> : <Plus size={20} />}
                            <span>{showAddForm ? 'إلغاء العملية' : 'إضافة طالب جديد'}</span>
                        </div>
                    </button>
                    
                    <div className="hidden lg:flex items-center gap-4 border-l-4 border-gray-100 pr-4">
                        <div className="text-right">
                            <p className="text-[10px] font-black text-gray-400 uppercase leading-none">تحديث تلقائي</p>
                            <p className="text-xs font-black text-gray-950 uppercase mt-1">متصل الآن</p>
                        </div>
                        <div className="w-3 h-3 bg-emerald-500 rounded-none border-2 border-gray-950 animate-pulse"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};
