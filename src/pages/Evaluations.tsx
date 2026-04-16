import { useState, useEffect, useMemo } from 'react';
import { 
    Star, 
    Award, 
    Plus, 
    ThumbsUp, 
    ThumbsDown,
    CheckCircle2,
    Trash2,
    User,
    History,
    ChevronDown,
    ChevronUp,
    Zap
} from 'lucide-react';
import { api } from '../lib/api';
import { useApp } from '../context/AppContext';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
// ar is not used here but could be for date formatting in the future, removing to fix build error

export const Evaluations = () => {
    const { currentUser } = useApp();
    const [evaluations, setEvaluations] = useState<any[]>([]);
    const [students, setStudents] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null);
    
    // Form state
    const [formData, setFormData] = useState({
        studentId: '',
        rating: 'ممتاز',
        points: 0,
        notes: ''
    });

    const resetForm = () => setFormData({ studentId: '', rating: 'ممتاز', points: 0, notes: '' });

    useEffect(() => {
        fetchData();
    }, [currentUser]);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            
            if (currentUser?.role === 'parent') {
                const myChildren = await api.get<any[]>('/parents/my-children');
                setStudents(myChildren);
                
                const evalsPromises = myChildren.map(c => api.get<any[]>(`/evaluations/student/${c.id}`));
                const allEvalsResults = await Promise.all(evalsPromises);
                setEvaluations(allEvalsResults.flat());
            } else {
                const studentsRes = await api.get<any[]>('/students');
                setStudents(studentsRes);

                let evalsUrl = '/evaluations';
                if (currentUser?.role === 'teacher') {
                    evalsUrl = `/evaluations/teacher/${currentUser.id}`;
                }
                const evalsRes = await api.get<any[]>(evalsUrl);
                setEvaluations(evalsRes);
            }
        } catch (error) {
            console.error('Error fetching evaluations:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const teacherStudents = useMemo(() => {
        if (!currentUser) return [];
        if (currentUser.role === 'admin') return students;
        if (currentUser.role === 'teacher') {
            return students.filter(s => 
                s.enrollments?.some((e: any) => 
                    e.teacherId === currentUser.id || 
                    e.teacher === (currentUser.teacherName || currentUser.name)
                )
            );
        }
        return students; // For parents/others, show whatever students state has
    }, [students, currentUser]);

    const onSubmit = async (e: any) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                teacherId: currentUser?.id,
                teacherName: currentUser?.teacherName || currentUser?.name
            };
            await api.post('/evaluations', payload);
            setIsModalOpen(false);
            resetForm();
            fetchData();
        } catch (error) {
            console.error('Error submitting evaluation', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('هل أنت متأكد من حذف هذا التقييم؟ سيتم خصم النقاط من الطالب.')) return;
        try {
            await api.delete(`/evaluations/${id}`);
            fetchData();
        } catch (error) {
            console.error('Error deleting evaluation', error);
        }
    };

    const ratingOptions = [
        { value: 'ممتاز', icon: Star, color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' },
        { value: 'جيد جدًا', icon: ThumbsUp, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
        { value: 'جيد', icon: CheckCircle2, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
        { value: 'يحتاج تحسين', icon: ThumbsDown, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200' }
    ];

    if (isLoading) return <div className="p-8 text-center text-gray-500 animate-pulse font-black">جاري تحميل سجل التقييمات...</div>;

    return (
        <div className="space-y-8 pb-20 animate-in fade-in duration-500" dir="rtl">
            {/* Header Banner - Redesigned with White Theme and Geometric Patterns */}
            <div className="relative bg-white dark:bg-slate-950 p-8 border-b border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                {/* Geometric Background Patterns */}
                <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.07] pointer-events-none">
                    <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px), radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px', backgroundPosition: '0 0, 10px 10px' }}></div>
                    <div className="absolute top-10 right-10 w-64 h-64 border-2 border-indigo-500 rotate-45"></div>
                    <div className="absolute -bottom-20 -left-10 w-48 h-48 border border-emerald-500 rounded-full"></div>
                </div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-slate-200 dark:border-slate-800 shadow-sm relative group overflow-hidden">
                            <div className="absolute inset-0 bg-indigo-500/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                            <Award size={32} strokeWidth={2.5} className="relative z-10" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tighter uppercase italic">تقييم الطلاب والتحفيز</h1>
                            <div className="flex items-center gap-3">
                                <span className="h-[2px] w-8 bg-indigo-500"></span>
                                <p className="text-slate-500 dark:text-slate-400 text-xs font-black uppercase tracking-widest flex items-center gap-2">
                                    <Zap size={12} className="text-amber-500 fill-current" />
                                    نظام المكافآت الذكي والتقييم الأكاديمي الشامل
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-6 md:px-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                    {teacherStudents.map((student) => {
                        const studentEvals = evaluations
                            .filter(ev => ev.studentId === student.id)
                            .sort((a, b) => new Date(b.created_at || b.date).getTime() - new Date(a.created_at || a.date).getTime());
                        
                        const lastEval = studentEvals[0];
                        const lastRating = lastEval ? ratingOptions.find(r => r.value === lastEval.rating) || ratingOptions[0] : null;
                        const isExpanded = expandedStudentId === student.id;

                        return (
                            <div key={student.id} className="bg-white dark:bg-gray-900 border-4 border-gray-950 shadow-[8px_8px_0px_0px_black] flex flex-col group transition-all hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[12px_12px_0px_0px_black]">
                                {/* Student Profile Header */}
                                <div className="p-4 border-b-2 border-gray-950 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-10 h-10 bg-white border-2 border-gray-950 flex items-center justify-center text-gray-400 shrink-0">
                                            <User size={20} />
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="font-black text-sm text-gray-950 dark:text-white truncate">{student.name}</h4>
                                            <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">{student.grade}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className="bg-yellow-400 text-gray-950 px-2 py-0.5 border-2 border-gray-950 text-[9px] font-black shadow-[1px_1px_0px_0px_black]">
                                            {student.totalPoints || 0} XP
                                        </span>
                                    </div>
                                </div>

                                {/* Last Evaluation Status */}
                                <div className="p-4 flex-1 flex flex-col">
                                    {lastEval ? (
                                        <div className="space-y-3 mb-4">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">آخر تقييم</span>
                                                <div className={cn("flex items-center gap-1 px-2 py-0.5 text-[9px] font-black border-2 border-gray-950 transition-none", lastRating?.bg, lastRating?.color)}>
                                                    {lastRating?.icon && <lastRating.icon size={10} strokeWidth={3} />}
                                                    {lastEval.rating}
                                                </div>
                                            </div>
                                            <div className="bg-gray-50 dark:bg-gray-800 p-3 border-2 border-dashed border-gray-200 dark:border-gray-700 relative">
                                                <p className="text-[10px] font-bold text-gray-700 dark:text-gray-300 italic line-clamp-2">
                                                    "{lastEval.notes || 'بدون ملاحظات'}"
                                                </p>
                                                <History size={10} className="absolute bottom-1.5 left-1.5 text-gray-300" />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex-1 flex flex-col items-center justify-center py-4 text-center space-y-2 opacity-40">
                                            <Award size={24} className="text-gray-300" />
                                            <p className="text-[8px] font-black uppercase tracking-widest">لم يتم التقييم بعد</p>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="grid grid-cols-2 gap-2 mt-auto">
                                        <button
                                            onClick={() => { setFormData({ ...formData, studentId: student.id }); setIsModalOpen(true); }}
                                            className="bg-primary-600 text-white border-2 border-gray-950 px-3 py-2 text-[10px] font-black uppercase tracking-tighter shadow-[2px_2px_0px_0px_black] hover:bg-primary-700 active:translate-y-0.5 active:shadow-none flex items-center justify-center gap-2"
                                        >
                                            <Plus size={14} strokeWidth={3} />
                                            أضف تقييم
                                        </button>
                                        <button
                                            onClick={() => setExpandedStudentId(isExpanded ? null : student.id)}
                                            className="bg-white dark:bg-gray-800 text-gray-950 dark:text-white border-2 border-gray-950 px-3 py-2 text-[10px] font-black uppercase tracking-tighter shadow-[2px_2px_0px_0px_black] hover:bg-gray-50 active:translate-y-0.5 active:shadow-none flex items-center justify-center gap-2"
                                        >
                                            {isExpanded ? <ChevronUp size={14} strokeWidth={3} /> : <ChevronDown size={14} strokeWidth={3} />}
                                            السجل ({studentEvals.length})
                                        </button>
                                    </div>
                                </div>

                                {/* Expanded History List */}
                                {isExpanded && (
                                    <div className="bg-gray-950 text-white p-4 border-t-4 border-gray-950 max-h-[300px] overflow-y-auto custom-scrollbar-dark">
                                        <h5 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                            <Star size={12} className="text-yellow-400" />
                                            تاريخ التقييمات الكامل
                                        </h5>
                                        <div className="space-y-4">
                                            {studentEvals.map((ev) => {
                                                const r = ratingOptions.find(ro => ro.value === ev.rating) || ratingOptions[0];
                                                return (
                                                    <div key={ev.id} className="border-l-2 border-gray-800 pl-4 py-1 relative">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[14px]">{r.icon && <r.icon size={12} className="text-primary-400" />}</span>
                                                                <span className="text-xs font-black text-white">{ev.rating}</span>
                                                                {ev.points > 0 && <span className="text-[9px] font-black text-yellow-400">+{ev.points} XP</span>}
                                                            </div>
                                                            <span className="text-[9px] font-black text-gray-600 uppercase">
                                                                {format(new Date(ev.created_at || ev.date), 'dd/MM/yy')}
                                                            </span>
                                                        </div>
                                                        <p className="text-[10px] font-medium text-gray-400 mb-2 leading-relaxed">{ev.notes}</p>
                                                        {(currentUser?.role === 'admin' || currentUser?.id === ev.teacherId) && (
                                                            <button 
                                                                onClick={() => handleDelete(ev.id)}
                                                                className="text-rose-500 hover:text-rose-400 p-1 transition-colors"
                                                            >
                                                                <Trash2 size={12} />
                                                            </button>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                            {studentEvals.length === 0 && (
                                                <p className="text-[10px] text-gray-600 italic">لا يوجد سجل تاريخي.</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {teacherStudents.length === 0 && (
                        <div className="col-span-full py-20 px-4 text-center bg-gray-50 dark:bg-gray-800/20 border-4 border-dashed border-gray-950">
                            <div className="w-24 h-24 mx-auto bg-white dark:bg-gray-800 shadow-xl border-4 border-gray-950 flex items-center justify-center mb-6">
                                <User size={48} className="text-gray-300" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-950 dark:text-white mb-2 uppercase tracking-tighter">لا يوجد طلاب مسجلون حالياً</h3>
                            <p className="text-sm font-black text-gray-500 max-w-md mx-auto uppercase">بمجرد تعيين طلاب لكِ في البرامج التعليمية، سيظهرون هنا تلقائياً لتقييمهم.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal - Unified Form */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
                    <div className="bg-white dark:bg-gray-900 border-4 border-gray-950 shadow-[15px_15px_0px_0px_black] w-full max-w-xl flex flex-col max-h-[90vh] overflow-hidden">
                        <div className="p-4 border-b-2 border-gray-950 bg-primary-600 text-white flex justify-between items-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
                            <h3 className="text-lg font-black flex items-center gap-2 relative z-10 uppercase tracking-tighter">
                                <Award size={20} />
                                {formData.studentId ? `تقييم: ${students.find(s => s.id === formData.studentId)?.name}` : 'تقييم طالب جديد'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="bg-white text-gray-950 w-8 h-8 flex items-center justify-center border-2 border-gray-950 shadow-[2px_2px_0px_0px_black] hover:bg-gray-100 transition-colors font-black text-lg">
                                &times;
                            </button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto custom-scrollbar">
                            <form id="evaluation-form" onSubmit={onSubmit} className="space-y-6">
                                {!formData.studentId && (
                                    <div>
                                        <label className="block text-xs font-black text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-[0.2em]">اختر الطالب</label>
                                        <select
                                            value={formData.studentId}
                                            onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                                            required
                                            className="w-full border-2 border-gray-950 dark:bg-gray-800 dark:border-gray-700 p-2.5 font-black text-xs text-gray-950 dark:text-white focus:ring-2 focus:ring-primary-600/20 outline-none appearance-none cursor-pointer"
                                        >
                                            <option value="">-- اختر من قائمة طلابك --</option>
                                            {teacherStudents.map(s => (
                                                <option key={s.id} value={s.id}>{s.name} ({s.grade})</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-xs font-black text-gray-500 dark:text-gray-400 mb-4 uppercase tracking-[0.2em]">مستوى التميز</label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {ratingOptions.map((opt) => {
                                            const isSelected = formData.rating === opt.value;
                                            const OptIcon = opt.icon;
                                            return (
                                                <button
                                                    type="button"
                                                    key={opt.value}
                                                    onClick={() => setFormData({ ...formData, rating: opt.value })}
                                                    className={cn(
                                                        "p-3 border-2 transition-all duration-200 flex flex-col items-center justify-center gap-2",
                                                        isSelected 
                                                            ? cn(opt.bg, "border-gray-950 translate-x-0.5 translate-y-0.5 shadow-none", opt.color) 
                                                            : "border-gray-950 bg-white dark:bg-gray-800 text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-[2px_2px_0px_0px_black]"
                                                    )}
                                                >
                                                    <OptIcon size={18} strokeWidth={isSelected ? 4 : 2} className={cn(isSelected && "animate-bounce")} />
                                                    <span className="text-[9px] font-black uppercase tracking-widest">{opt.value}</span>
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-black text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-[0.2em] flex justify-between">
                                        <span>نقاط المكافأة (XP)</span>
                                        <div className="flex gap-2">
                                            {[5, 10, 20, 50].map(p => (
                                                <button 
                                                    key={p} 
                                                    type="button" 
                                                    onClick={() => setFormData({...formData, points: p})}
                                                    className="bg-yellow-400 text-gray-950 border-2 border-gray-950 px-2 font-black text-[9px] hover:bg-yellow-500"
                                                >
                                                    +{p}
                                                </button>
                                            ))}
                                        </div>
                                    </label>
                                    <div className="flex">
                                        <input
                                            type="number"
                                            value={formData.points || ''}
                                            onChange={(e) => setFormData({ ...formData, points: Number(e.target.value) })}
                                            placeholder="0"
                                            min="0"
                                            className="w-full border-2 border-l-0 border-gray-950 dark:bg-gray-800 dark:border-gray-700 p-2.5 font-black text-xl text-yellow-600 text-center outline-none focus:bg-yellow-50 transition-colors"
                                        />
                                        <div className="bg-yellow-400 text-gray-950 px-4 flex items-center justify-center border-2 border-gray-950 border-r-0 shrink-0 shadow-[2px_0px_0px_0px_black_inset]">
                                            <Zap size={18} className="fill-current" />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-black text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-[0.2em]">رسالة الإشادة (تظهر لولي الأمر)</label>
                                    <textarea
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        rows={3}
                                        className="w-full border-2 border-gray-950 dark:bg-gray-800 dark:border-gray-700 p-3 shadow-inner text-xs font-bold transition-all focus:bg-gray-50 dark:focus:bg-gray-700 outline-none resize-none placeholder:text-gray-300"
                                        placeholder="مثال: أداء ممتاز اليوم..."
                                    />
                                </div>
                            </form>
                        </div>
                        
                        <div className="p-4 border-t-2 border-gray-950 bg-gray-50 dark:bg-gray-800 flex justify-end gap-3 shrink-0">
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="px-6 py-2.5 bg-white dark:bg-gray-700 border-2 border-gray-950 text-gray-950 dark:text-white text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition-all shadow-[2px_2px_0px_0px_black] active:translate-y-0.5 active:shadow-none"
                            >
                                إلغاء
                            </button>
                            <button
                                type="submit"
                                form="evaluation-form"
                                className="px-8 py-2.5 bg-primary-600 text-white border-2 border-gray-950 text-[10px] font-black uppercase tracking-widest hover:bg-primary-700 transition-all shadow-[3px_3px_0px_0px_black] active:translate-y-0.5 active:shadow-none flex items-center gap-2"
                            >
                                <CheckCircle2 size={16} />
                                إرسال التقييم
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
