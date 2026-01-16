import React from 'react';
import { Users, TrendingUp, UserPlus, Download, X } from 'lucide-react';
import { StatsCard } from '../../../shared/components/StatsCard';

interface ParentsHeaderProps {
    totalParents: number;
    totalLinkedStudents: number;
    showAddForm: boolean;
    onToggleAddForm: () => void;
    onImport: () => void;
}

export const ParentsHeader: React.FC<ParentsHeaderProps> = ({
    totalParents,
    totalLinkedStudents,
    showAddForm,
    onToggleAddForm,
    onImport
}) => {
    return (
        <div className="space-y-6">
            <div className="relative bg-primary-600 p-8 shadow-xl overflow-hidden border-b-4 border-primary-500 rounded-none">
                <div className="relative flex items-center justify-between flex-wrap gap-6 px-2">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner relative group">
                            <Users size={36} className="text-white relative z-10" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-white mb-1 tracking-tight uppercase">أولياء الأمور</h1>
                            <p className="text-primary-100/80 text-sm font-bold flex items-center gap-2">
                                <TrendingUp size={14} className="text-primary-300" />
                                إدارة أولياء الأمور والبيانات العائلية
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 flex-wrap no-print">
                        <div className="flex gap-2">
                            <button
                                onClick={onToggleAddForm}
                                className="bg-white text-primary-700 px-6 py-3 rounded-none flex items-center gap-3 hover:bg-white/95 active:bg-primary-50 transition-all font-black shadow-lg transform hover:-translate-y-1 active:translate-y-0"
                            >
                                {showAddForm ? <X size={20} /> : <UserPlus size={20} />}
                                <span>{showAddForm ? 'إلغاء الأمر' : 'إضافة ولي أمر'}</span>
                            </button>
                            <button
                                onClick={onImport}
                                className="bg-primary-900/40 backdrop-blur-md text-white border border-white/20 px-6 py-3 rounded-none flex items-center gap-3 hover:bg-primary-900/60 transition-all font-black shadow-lg"
                            >
                                <Download size={20} />
                                <span>استيراد الكل</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
