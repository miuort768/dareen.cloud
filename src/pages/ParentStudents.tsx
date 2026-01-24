import { useState, useEffect } from 'react';
import {
    User,
    BarChart3,
    Calendar,
    Search,
    Users,
    CheckCircle2,
    BookOpen,
    TrendingUp
} from 'lucide-react';
import { api } from '../lib/api';

export const ParentStudents = () => {
    const [students, setStudents] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                setIsLoading(true);
                const data = await api.get<any[]>('/parents/my-children');
                setStudents(data);
            } catch (error) {
                console.error('Error fetching students:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchStudents();
    }, []);

    const filteredStudents = students.filter((s: any) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="h-12 w-48 bg-gray-100 dark:bg-gray-800 animate-pulse"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => <div key={i} className="h-64 bg-gray-100 dark:bg-gray-800 animate-pulse"></div>)}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-20 animate-in fade-in duration-500" dir="rtl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">قائمة الأبناء</h1>
                    <p className="text-sm text-gray-500 font-bold dark:text-gray-400">إدارة ومتابعة التفاصيل الدراسية لكل ابن</p>
                </div>

                <div className="relative group w-full md:w-72">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="بحث عن ابن..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pr-10 pl-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 focus:outline-none focus:border-primary-500 font-bold transition-all text-sm"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredStudents.map((student: any) => (
                    <div key={student.id} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden group hover:border-primary-500 transition-all duration-300 flex flex-col">
                        {/* Kid Profile Header */}
                        <div className="bg-gray-900 p-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-primary-600/10 -translate-y-12 translate-x-12 rotate-45 group-hover:scale-110 transition-transform"></div>
                            <div className="relative z-10 flex items-center gap-4">
                                <div className="w-14 h-14 bg-white/10 flex items-center justify-center text-white border border-white/20">
                                    <User size={28} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-white leading-tight">{student.name}</h3>
                                    <p className="text-primary-400 text-[10px] font-black uppercase tracking-widest mt-1">{student.grade || 'غير محدد'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Kid Rapid Metrics */}
                        <div className="grid grid-cols-2 border-b border-gray-50 dark:border-gray-800">
                            <div className="p-4 flex flex-col items-center justify-center border-l border-gray-50 dark:border-gray-800">
                                <BookOpen size={16} className="text-primary-500 mb-1" />
                                <span className="text-[10px] font-black text-gray-400 uppercase">المواد</span>
                                <span className="text-lg font-black text-gray-900 dark:text-white">{(student.enrollments || []).length}</span>
                            </div>
                            <div className="p-4 flex flex-col items-center justify-center">
                                <TrendingUp size={16} className="text-emerald-500 mb-1" />
                                <span className="text-[10px] font-black text-gray-400 uppercase">نسبة الحضور</span>
                                <span className="text-lg font-black text-emerald-600">
                                    {(() => {
                                        const enrolled = student.enrollments || [];
                                        if (enrolled.length === 0) return '0%';
                                        const total = enrolled.reduce((sum: number, en: any) => sum + Number(en.sessionsTotal || 0), 0);
                                        const used = enrolled.reduce((sum: number, en: any) => sum + Number(en.sessionsUsed || 0), 0);
                                        return total > 0 ? `${Math.round((used / total) * 100)}%` : '0%';
                                    })()}
                                </span>
                            </div>
                        </div>

                        {/* Detailed Enrollments List */}
                        <div className="p-6 space-y-4 flex-1">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-800 pb-1 flex items-center justify-between">
                                تفاصيل المواد الدراسيـة
                                <CheckCircle2 size={12} className="text-gray-300" />
                            </p>
                            <div className="space-y-4">
                                {(student.enrollments || []).map((en: any, idx: number) => (
                                    <div key={idx} className="bg-gray-50 dark:bg-gray-800/50 p-3 relative overflow-hidden group/item">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h4 className="text-sm font-black text-gray-900 dark:text-white">{en.subject}</h4>
                                                <p className="text-[9px] text-gray-500 font-bold italic">المعلم: {en.teacher}</p>
                                            </div>
                                            <div className="text-left">
                                                <span className="text-[10px] font-black text-primary-600">حضر {en.sessionsUsed} من {en.sessionsTotal}</span>
                                            </div>
                                        </div>
                                        {/* Progress Bar */}
                                        <div className="w-full h-1 bg-gray-200 dark:bg-gray-700 overflow-hidden">
                                            <div
                                                className="h-full bg-primary-600 transition-all duration-1000"
                                                style={{ width: `${en.sessionsTotal > 0 ? (en.sessionsUsed / en.sessionsTotal) * 100 : 0}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                                {(student.enrollments || []).length === 0 && (
                                    <div className="py-6 text-center">
                                        <p className="text-[10px] text-gray-400 font-bold italic">لا توجد مواد مسجلة حالياً لهذا الابن</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="p-6 pt-0 mt-auto grid grid-cols-2 gap-2">
                            <button className="py-2.5 bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2">
                                <Calendar size={14} />
                                جدول الحصص
                            </button>
                            <button className="py-2.5 bg-primary-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-primary-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary-600/20">
                                <BarChart3 size={14} />
                                كشف الدرجات
                            </button>
                        </div>
                    </div>
                ))}

                {filteredStudents.length === 0 && (
                    <div className="col-span-full py-20 bg-gray-50 dark:bg-gray-800/20 text-center border border-dashed border-gray-200 dark:border-gray-800 animate-in slide-in-from-bottom duration-700">
                        <Users size={48} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-black text-gray-400 uppercase tracking-widest">لا يوجد أبناء مسجلين</h3>
                        <p className="text-xs text-gray-500 font-bold mt-2 italic">يرجى التواصل مع إدارة المعهد في حال وجود أي استفسار.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
