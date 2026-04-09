import React from 'react';
import { Search, Filter, GraduationCap, X } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface AttendanceFiltersProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    filterStatus: string;
    onStatusChange: (value: string) => void;
    filterTeacher: string;
    onTeacherChange: (value: string) => void;
    uniqueTeachers: string[];
}

export const AttendanceFilters: React.FC<AttendanceFiltersProps> = ({
    searchTerm,
    onSearchChange,
    filterStatus,
    onStatusChange,
    filterTeacher,
    onTeacherChange,
    uniqueTeachers
}) => {
    return (
        <div className="bg-white border-4 border-gray-950 p-6 md:p-8 shadow-[8px_8px_0px_0px_black] mb-10 rounded-none overflow-hidden relative">
            {/* Design accents */}
            <div className="absolute top-0 right-0 w-2 h-full bg-amber-400"></div>
            
            <div className="flex items-center gap-3 mb-8 border-b-4 border-gray-950 pb-4">
                <div className="w-10 h-10 bg-gray-950 text-white flex items-center justify-center border-2 border-gray-950 shadow-[2px_2px_0px_0px_black]">
                    <Filter size={20} />
                </div>
                <h3 className="text-xl font-black text-gray-950 uppercase tracking-tighter italic">لوحة التحكم في فرز السجلات</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Search Input */}
                <div className="relative group">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 px-1 italic">اسم الطالب أو المعلمة</label>
                    <Search className="absolute right-4 top-[44px] text-gray-950 w-5 h-5 group-focus-within:text-primary-600 transition-colors pointer-events-none" />
                    <input
                        type="text"
                        placeholder="ابحث عن نتيجة معينة..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-6 pr-14 py-4 border-4 border-gray-950 focus:outline-none focus:bg-white text-base font-black rounded-none bg-gray-50 transition-all shadow-[inset_2px_2px_4px_rgba(0,0,0,0.05)] placeholder:font-black placeholder:text-gray-300 uppercase tracking-tight"
                    />
                    {searchTerm && (
                        <button 
                            onClick={() => onSearchChange('')}
                            className="absolute left-4 top-[44px] text-gray-400 hover:text-rose-600"
                        >
                            <X size={20} />
                        </button>
                    )}
                </div>

                {/* Status Filter */}
                <div className="relative">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 px-1 italic">حالة الحصة الحالية</label>
                    <Filter className="absolute right-4 top-[44px] text-gray-950 w-5 h-5 pointer-events-none" />
                    <select
                        value={filterStatus}
                        onChange={(e) => onStatusChange(e.target.value)}
                        className="w-full pl-6 pr-14 py-4 border-4 border-gray-950 focus:outline-none bg-gray-50 font-black text-base appearance-none cursor-pointer rounded-none uppercase tracking-tight"
                    >
                        <option value="all">كافة الحالات المسجلة</option>
                        <option value="scheduled">مجدولة للمستقبل ⏳</option>
                        <option value="completed">تم الحضور والتحصيل 🟢</option>
                        <option value="cancelled">غياب أو اعتذار 🔴</option>
                    </select>
                </div>

                {/* Teacher Filter */}
                <div className="relative">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 px-1 italic">تصفية حسب المعلمة</label>
                    <GraduationCap className="absolute right-4 top-[44px] text-gray-950 w-5 h-5 pointer-events-none" />
                    <select
                        value={filterTeacher}
                        onChange={(e) => onTeacherChange(e.target.value)}
                        className="w-full pl-6 pr-14 py-4 border-4 border-gray-950 focus:outline-none bg-gray-50 font-black text-base appearance-none cursor-pointer rounded-none uppercase tracking-tight"
                    >
                        <option value="all">جميع طاقم التدريس</option>
                        {uniqueTeachers.map(teacher => (
                            <option key={teacher} value={teacher}>{teacher}</option>
                        ))}
                    </select>
                    <div className="absolute left-4 top-[48px] pointer-events-none text-primary-600 font-black text-[10px]">SELECT</div>
                </div>
            </div>
            
            <div className="mt-8 flex justify-end gap-3 no-print">
                <button 
                    onClick={() => { onSearchChange(''); onStatusChange('all'); onTeacherChange('all'); }}
                    className="px-6 py-2 border-2 border-gray-950 text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all shadow-[4px_4px_0px_0px_black] active:shadow-none translate-y-0 active:translate-y-0.5 active:translate-x-0.5"
                >
                    إعادة ضبط الفلاتر
                </button>
            </div>
        </div>
    );
};
