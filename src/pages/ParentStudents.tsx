import { useState, useEffect } from 'react';
import {
    User,
    Calendar,
    Search,
    Users,
    CheckCircle2,
    BookOpen,
    TrendingUp,
    X,
    ChevronLeft,
    ChevronRight,
    AlertCircle,
    XCircle
} from 'lucide-react';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { api } from '../lib/api';

export const ParentStudents = () => {
    const [students, setStudents] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Modal & Session View State
    const [viewingStudent, setViewingStudent] = useState<any | null>(null);
    const [viewingAttendanceStudent, setViewingAttendanceStudent] = useState<any | null>(null);
    const [viewingSubject, setViewingSubject] = useState<any | null>(null);
    const [childSessions, setChildSessions] = useState<any[]>([]);
    const [isSessionsLoading, setIsSessionsLoading] = useState(false);

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

    const fetchChildSessions = async (studentId: string) => {
        try {
            setIsSessionsLoading(true);
            const data = await api.get<any[]>(`/parents/child-sessions/${studentId}`);
            setChildSessions(data);
        } catch (error) {
            console.error('Error fetching sessions:', error);
        } finally {
            setIsSessionsLoading(false);
        }
    };

    const handleViewDates = (student: any) => {
        setViewingStudent(student);
        setViewingSubject(null);
        fetchChildSessions(student.id);
    };

    const handleViewAttendance = (student: any) => {
        setViewingAttendanceStudent(student);
        fetchChildSessions(student.id);
    };

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
                                تفاصيل المواد الدراسية
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
                            <button
                                onClick={() => handleViewDates(student)}
                                className="py-2.5 bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2"
                            >
                                <Calendar size={14} />
                                تواريخ الحصص
                            </button>
                            <button
                                onClick={() => handleViewAttendance(student)}
                                className="py-2.5 bg-primary-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-primary-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary-600/20"
                            >
                                <TrendingUp size={14} />
                                نسبة الحضور الإجمالية
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

            {/* Session Dates Modal - Modern Drill Down View */}
            {viewingStudent && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
                    <div
                        className="absolute inset-0 bg-gray-950/60 backdrop-blur-sm"
                        onClick={() => setViewingStudent(null)}
                    />
                    <div className="relative w-full max-w-2xl bg-white dark:bg-gray-900 shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 flex flex-col max-h-[90vh]">
                        {/* Modal Header */}
                        <div className="p-6 bg-gray-900 text-white flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-white/10">
                                    <Calendar size={20} className="text-primary-400" />
                                </div>
                                <div className="text-right">
                                    <h2 className="text-lg font-black leading-none">{viewingStudent.name}</h2>
                                    <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-widest">
                                        {viewingSubject ? `مواعيد حصص: ${viewingSubject.subject}` : 'اختر المادة لعرض التواريخ'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setViewingStudent(null)}
                                className="p-2 hover:bg-white/10 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 overflow-y-auto no-scrollbar p-6">
                            {!viewingSubject ? (
                                /* Step 1: Subject Selection */
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {(viewingStudent.enrollments || []).map((en: any, idx: number) => (
                                        <button
                                            key={idx}
                                            onClick={() => setViewingSubject(en)}
                                            className="p-5 border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40 hover:border-primary-500 hover:bg-white dark:hover:bg-gray-800 transition-all text-right group flex items-center justify-between"
                                        >
                                            <div>
                                                <h4 className="font-black text-gray-900 dark:text-white mb-1">{en.subject}</h4>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{en.teacher}</p>
                                            </div>
                                            <ChevronLeft size={18} className="text-gray-300 group-hover:text-primary-500 transform group-hover:-translate-x-1 transition-all" />
                                        </button>
                                    ))}
                                    {(viewingStudent.enrollments || []).length === 0 && (
                                        <div className="col-span-full py-12 text-center text-gray-400 font-bold italic">لا توجد مواد مسجلة لعرض مواعيدها</div>
                                    )}
                                </div>
                            ) : (
                                /* Step 2: Date Timeline */
                                <div className="space-y-6">
                                    <button
                                        onClick={() => setViewingSubject(null)}
                                        className="flex items-center gap-2 text-[10px] font-black text-primary-600 uppercase tracking-widest hover:underline mb-4"
                                    >
                                        <ChevronRight size={14} />
                                        العودة لقائمة المواد
                                    </button>

                                    {isSessionsLoading ? (
                                        <div className="space-y-4">
                                            {[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 animate-pulse" />)}
                                        </div>
                                    ) : (
                                        <div className="relative border-r-2 border-primary-500/20 pr-6 mr-3 space-y-8">
                                            {childSessions
                                                .filter(s => s.subject === viewingSubject.subject && (s.status === 'completed' || s.status === 'absent'))
                                                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                                .map((session, sIdx) => (
                                                    <div key={sIdx} className="relative">
                                                        <div className={cn(
                                                            "absolute -right-[33px] top-1.5 w-4 h-4 rounded-none bg-white dark:bg-gray-900 border-4",
                                                            session.status === 'completed' ? "border-emerald-500" : "border-rose-500"
                                                        )}></div>
                                                        <div className="bg-gray-50 dark:bg-gray-800/40 p-4 border border-gray-100 dark:border-gray-800 group hover:border-primary-500 transition-all">
                                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                                                                <div>
                                                                    <p className="text-sm font-black text-gray-900 dark:text-white">
                                                                        {format(new Date(session.date), 'eeee, d MMMM yyyy', { locale: ar })}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            {session.notes && (
                                                                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                                                                    <p className="text-[10px] text-gray-500 font-bold italic bg-white dark:bg-gray-900 p-2 border-r-2 border-primary-400">
                                                                        ملاحظة المعلم: {session.notes}
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            {childSessions.filter(s => s.subject === viewingSubject.subject && (s.status === 'completed' || s.status === 'absent')).length === 0 && (
                                                <div className="py-20 text-center">
                                                    <AlertCircle size={32} className="mx-auto text-gray-200 mb-4" />
                                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">لا توجد حصص مسجلة لهذه المادة بعد</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-gray-50 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900 flex justify-end shrink-0">
                            <button
                                onClick={() => setViewingStudent(null)}
                                className="px-6 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-[10px] font-black uppercase tracking-widest transition-all"
                            >
                                إغلاق
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Total Attendance Report Modal */}
            {viewingAttendanceStudent && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
                    <div
                        className="absolute inset-0 bg-gray-950/60 backdrop-blur-sm"
                        onClick={() => setViewingAttendanceStudent(null)}
                    />
                    <div className="relative w-full max-w-2xl bg-white dark:bg-gray-900 shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 flex flex-col max-h-[90vh]">
                        {/* Modal Header */}
                        <div className="p-6 bg-emerald-600 text-white flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-white/10">
                                    <TrendingUp size={20} className="text-white" />
                                </div>
                                <div className="text-right">
                                    <h2 className="text-lg font-black leading-none">{viewingAttendanceStudent.name}</h2>
                                    <p className="text-[10px] text-white/80 font-bold mt-1 uppercase tracking-widest">
                                        تقرير نسب الحضور والانصراف لكل المواد
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setViewingAttendanceStudent(null)}
                                className="p-2 hover:bg-white/10 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-4">
                            {isSessionsLoading ? (
                                <div className="space-y-4">
                                    {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-gray-100 dark:bg-gray-800 animate-pulse" />)}
                                </div>
                            ) : (
                                <>
                                    {(viewingAttendanceStudent.enrollments || []).map((en: any, idx: number) => {
                                        const subjectSessions = childSessions.filter(s => s.subject === en.subject);
                                        const attended = subjectSessions.filter(s => s.status === 'completed').length;
                                        const totalRecorded = subjectSessions.length;
                                        const absent = subjectSessions.filter(s => s.status === 'absent').length;
                                        const percentage = totalRecorded > 0 ? Math.round((attended / totalRecorded) * 100) : 0;

                                        return (
                                            <div key={idx} className="p-5 border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40 relative overflow-hidden group">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <h4 className="font-black text-gray-900 dark:text-white mb-1 text-sm">{en.subject}</h4>
                                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">المعلم: {en.teacher}</p>
                                                    </div>
                                                    <div className="text-left">
                                                        <span className="text-xl font-black text-emerald-600 tracking-tighter">{percentage}%</span>
                                                        <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest leading-none">نسبة الالتزام</p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-3 mb-4">
                                                    <div className="bg-emerald-50 dark:bg-emerald-900/10 p-2 flex items-center gap-3">
                                                        <CheckCircle2 size={16} className="text-emerald-500" />
                                                        <div>
                                                            <p className="text-[9px] text-emerald-600 font-black uppercase">حضر</p>
                                                            <p className="text-sm font-black text-emerald-700 dark:text-emerald-400">{attended} حصة</p>
                                                        </div>
                                                    </div>
                                                    <div className="bg-rose-50 dark:bg-rose-900/10 p-2 flex items-center gap-3">
                                                        <XCircle size={16} className="text-rose-500" />
                                                        <div>
                                                            <p className="text-[9px] text-rose-600 font-black uppercase">غاب</p>
                                                            <p className="text-sm font-black text-rose-700 dark:text-rose-400">{absent} حصة</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Progress Bar Container */}
                                                <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 overflow-hidden">
                                                    <div
                                                        className="h-full bg-emerald-500 transition-all duration-1000 ease-out"
                                                        style={{ width: `${percentage}%` }}
                                                    ></div>
                                                </div>
                                                <p className="text-[9px] text-gray-400 font-bold mt-2 text-right">إجمالي الجلسات المسجلة من المعلم: {totalRecorded}</p>
                                            </div>
                                        );
                                    })}

                                    {(viewingAttendanceStudent.enrollments || []).length === 0 && (
                                        <div className="py-20 text-center">
                                            <AlertCircle size={32} className="mx-auto text-gray-200 mb-4" />
                                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">لا توجد اشتراكات مسجلة لهذا الابن بعد</p>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-gray-50 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900 flex justify-end shrink-0">
                            <button
                                onClick={() => setViewingAttendanceStudent(null)}
                                className="px-6 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-[10px] font-black uppercase tracking-widest transition-all"
                            >
                                إغلاق
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
