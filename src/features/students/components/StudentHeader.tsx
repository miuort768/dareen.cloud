import { Users, GraduationCap, Plus, X } from 'lucide-react';

interface StudentHeaderProps {
    count: number;
    showAddForm: boolean;
    onToggleAddForm: () => void;
}

export const StudentHeader = ({ count, showAddForm, onToggleAddForm }: StudentHeaderProps) => {
    return (
        <div className="relative bg-primary-600 p-8 shadow-xl overflow-hidden mb-6 border-b-4 border-primary-500 rounded-none">
            {/* Background Geometric Enhancement - Richer & Larger Shapes */}
            {/* Major Glows & Blobs */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full -mr-20 -mt-40 blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-white/5 rounded-full -ml-40 -mb-60 blur-[150px] pointer-events-none"></div>

            {/* Central Geometric elements */}
            <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] border-[1px] border-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
            <div className="absolute top-1/2 left-1/2 w-[800px] h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-1/2 -translate-y-1/2 rotate-45 pointer-events-none"></div>
            <div className="absolute top-1/2 left-1/2 w-[800px] h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-1/2 -translate-y-1/2 -rotate-45 pointer-events-none"></div>

            {/* Large Structural Shapes */}
            <div className="absolute top-[-20%] left-[-5%] w-[35%] h-[140%] bg-gradient-to-br from-white/5 to-transparent rotate-12 pointer-events-none hidden lg:block"></div>
            <div className="absolute top-[-30%] right-[15%] w-[120px] h-[160%] bg-white/5 -rotate-12 pointer-events-none hidden lg:block"></div>

            {/* Large Geometric Outlines */}
            <div className="absolute top-1/2 right-10 w-80 h-80 border-[30px] border-white/5 rounded-full -translate-y-1/2 pointer-events-none"></div>

            {/* Pattern Layer */}
            <div className="absolute inset-0 opacity-[0.1] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1.5px, transparent 0)', backgroundSize: '28px 28px' }}></div>

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner rounded-none">
                        <Users size={32} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl md:text-3xl font-black text-white mb-2 tracking-tight">إدارة شؤون الطلاب</h1>
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
