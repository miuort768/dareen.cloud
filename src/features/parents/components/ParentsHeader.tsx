import React from 'react';
import { Users, TrendingUp, UserPlus, Download, X } from 'lucide-react';
import { StatsCard } from '../../../shared/components/StatsCard';

interface ParentsHeaderProps {
    totalParents: number;
    totalLinkedStudents: number;
    showAddForm: boolean;
    onToggleAddForm: () => void;
    onImport: () => void;
    onExport: () => void;
}

export const ParentsHeader: React.FC<ParentsHeaderProps> = ({
    totalParents,
    totalLinkedStudents,
    showAddForm,
    onToggleAddForm,
    onImport,
    onExport
}) => {
    return (
        <div className="space-y-6">
            <div className="relative bg-primary-600 p-8 shadow-xl overflow-hidden border-b-4 border-primary-500 rounded-none">
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

                <div className="relative flex items-center justify-between flex-wrap gap-6 px-2">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner relative group">
                            <Users size={36} className="text-white relative z-10" />
                        </div>
                        <div>
                            <h1 className="text-xl md:text-3xl font-black text-white mb-1 tracking-tight uppercase">أولياء الأمور</h1>
                            <p className="text-white/80 text-[10px] md:text-sm font-bold flex items-center gap-2">
                                <TrendingUp size={14} className="text-white" />
                                إدارة أولياء الأمور والبيانات العائلية
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap no-print w-full md:w-auto mt-4 md:mt-0">
                        <div className="flex gap-2 w-full md:w-auto">
                            <button
                                onClick={onToggleAddForm}
                                className="flex-1 md:flex-none justify-center bg-white text-primary-700 px-4 py-2 md:px-6 md:py-3 rounded-none flex items-center gap-2 md:gap-3 hover:bg-white/95 active:bg-primary-50 transition-all font-black text-xs md:text-base shadow-lg transform hover:-translate-y-1 active:translate-y-0"
                            >
                                {showAddForm ? <X size={16} className="md:w-5 md:h-5" /> : <UserPlus size={16} className="md:w-5 md:h-5" />}
                                <span>{showAddForm ? 'إلغاء' : 'إضافة ولي أمر'}</span>
                            </button>
                            <button
                                onClick={onImport}
                                className="flex-1 md:flex-none justify-center bg-primary-900/40 backdrop-blur-md text-white border border-white/20 px-4 py-2 md:px-6 md:py-3 rounded-none flex items-center gap-2 md:gap-3 hover:bg-primary-900/60 transition-all font-black text-xs md:text-base shadow-lg"
                            >
                                <Download size={16} className="md:w-5 md:h-5" />
                                <span>استيراد</span>
                            </button>
                            <button
                                onClick={onExport}
                                className="flex-1 md:flex-none justify-center bg-primary-900/40 backdrop-blur-md text-white border border-white/20 px-4 py-2 md:px-6 md:py-3 rounded-none flex items-center gap-2 md:gap-3 hover:bg-primary-900/60 transition-all font-black text-xs md:text-base shadow-lg"
                            >
                                <Download size={16} className="md:w-5 md:h-5 rotate-180" />
                                <span>تصدير</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <StatsCard
                    title="إجمالي أولياء الأمور"
                    value={totalParents}
                    icon={Users}
                    color="blue"
                    trend="نشط"
                />
                <StatsCard
                    title="الطلاب المرتبطين"
                    value={totalLinkedStudents}
                    icon={Users}
                    color="blue"
                    trend="طالب"
                />
            </div>
        </div>
    );
};
