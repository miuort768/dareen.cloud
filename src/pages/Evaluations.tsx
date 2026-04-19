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
    Zap,
    X,
    BookOpen,
    TrendingUp,
    Search
} from 'lucide-react';
import { api } from '../lib/api';
import { useApp } from '../context/AppContext';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

export const Evaluations = () => {
    const { currentUser } = useApp();
    const [evaluations, setEvaluations] = useState<any[]>([]);
    const [students, setStudents] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [historyModalStudent, setHistoryModalStudent] = useState<any | null>(null);
    
    const [formData, setFormData] = useState({
        studentId: '',
        rating: 'ممتاز',
        points: 0,
        notes: ''
    });
    const [searchTerm, setSearchTerm] = useState('');

    const resetForm = () => setFormData({ studentId: '', rating: 'ممتاز', points: 0, notes: '' });

    useEffect(() => { fetchData(); }, [currentUser]);

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
                if (currentUser?.role === 'teacher') evalsUrl = `/evaluations/teacher/${currentUser.id}`;
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
        return students;
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
        { value: 'ممتاز', icon: Star, color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200', pill: 'bg-yellow-100 text-yellow-700' },
        { value: 'جيد جدًا', icon: ThumbsUp, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', pill: 'bg-emerald-100 text-emerald-700' },
        { value: 'جيد', icon: CheckCircle2, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', pill: 'bg-blue-100 text-blue-700' },
        { value: 'يحتاج تحسين', icon: ThumbsDown, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200', pill: 'bg-rose-100 text-rose-700' }
    ];

    // --- Total XP for the group
    const totalXP = useMemo(() => evaluations.reduce((sum, ev) => sum + (ev.points || 0), 0), [evaluations]);

    if (isLoading) return (
        <div className="space-y-4 p-6">
            {[...Array(6)].map((_, i) => (
                <div key={i} className="h-40 bg-slate-100 animate-pulse" />
            ))}
        </div>
    );

    return (
        <div className="space-y-6 pb-20 animate-in fade-in duration-500" dir="rtl">

            {/* ─── Soft Modern Header ─── */}
            <div className="relative overflow-hidden rounded-none bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 px-6 py-8 text-white shadow-lg shadow-indigo-500/20">
                <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1.5px, transparent 0)', backgroundSize: '28px 28px' }} />
                <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-white/15 flex items-center justify-center backdrop-blur-sm border border-white/20 shadow-inner">
                            <Award size={28} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl md:text-2xl font-black tracking-tight leading-none mb-1">تقييم الطلاب والتحفيز</h1>
                            <p className="text-white/70 text-[9px] md:text-[11px] font-bold flex items-center gap-1.5 truncate max-w-[200px] sm:max-w-none">
                                <Zap size={11} className="fill-current" />
                                نظام المكافآت الذكي والتقييم الأكاديمي الشامل
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* XP summary chip */}
                        <div className="bg-white/15 border border-white/20 px-4 py-2 backdrop-blur-sm flex items-center gap-2">
                            <p className="text-[9px] font-black opacity-60 uppercase tracking-widest whitespace-nowrap">إجمالي النقاط:</p>
                            <p className="text-base font-black tabular-nums whitespace-nowrap">{totalXP} <span className="text-xs opacity-60">XP</span></p>
                        </div>
                        {currentUser?.role !== 'parent' && (
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="flex items-center gap-1.5 bg-white text-indigo-700 font-black text-[10px] md:text-xs px-2.5 md:px-4 py-2 md:py-2.5 shadow-lg hover:shadow-xl hover:scale-105 transition-all shrink-0"
                            >
                                <Plus size={14} strokeWidth={3} />
                                <span className="hidden sm:inline">تقييم جديد</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* ─── Full-width Search Bar ─── */}
            <div className="relative">
                <Search size={15} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="ابحث عن طالب باسمه أو صفه..."
                    className="w-full pr-10 pl-10 py-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 bg-white text-sm font-bold text-slate-700 dark:text-white placeholder:text-slate-300 placeholder:font-normal outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
                />
                {searchTerm && (
                    <button
                        onClick={() => setSearchTerm('')}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-rose-500 transition-colors"
                    >
                        <X size={14} />
                    </button>
                )}
            </div>
            <div className="px-2 md:px-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {teacherStudents.filter(s =>
                        !searchTerm ||
                        (s.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (s.grade || '').toLowerCase().includes(searchTerm.toLowerCase())
                    ).map((student) => {
                        const studentEvals = evaluations
                            .filter(ev => ev.studentId === student.id)
                            .sort((a, b) => new Date(b.created_at || b.date).getTime() - new Date(a.created_at || a.date).getTime());
                        
                        const lastEval = studentEvals[0];
                        const lastRating = lastEval ? ratingOptions.find(r => r.value === lastEval.rating) || ratingOptions[0] : null;
                        const totalStudentXP = studentEvals.reduce((s, ev) => s + (ev.points || 0), 0);

                        return (
                            <div key={student.id}
                                className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden group"
                            >
                                {/* Card Top Accent */}
                                <div className={cn("h-1.5 w-full", lastRating ? lastRating.bg.replace('bg-', 'bg-') : 'bg-slate-100')} style={{ background: lastRating ? undefined : '#e2e8f0' }}>
                                    <div className={cn("h-full w-full", lastRating?.bg ?? 'bg-slate-200')} />
                                </div>

                                {/* Student Info */}
                                <div className="p-4 flex items-center gap-3 border-b border-slate-50 dark:border-slate-800">
                                    <div className="w-11 h-11 bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-900">
                                        <User size={18} className="text-indigo-500" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h4 className="font-black text-sm text-slate-900 dark:text-white truncate">{student.name}</h4>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate flex items-center gap-1">
                                            <BookOpen size={8} className="shrink-0" />{student.grade}
                                        </p>
                                    </div>
                                    <div className="shrink-0 text-center">
                                        <span className="bg-amber-400/20 text-amber-700 dark:text-amber-400 text-[9px] font-black px-2 py-0.5 border border-amber-200/50">
                                            {totalStudentXP} XP
                                        </span>
                                    </div>
                                </div>

                                {/* Last Evaluation */}
                                <div className="p-4 flex-1 flex flex-col gap-3">
                                    {lastEval ? (
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">آخر تقييم</span>
                                                {lastRating && (
                                                    <span className={cn("flex items-center gap-1 text-[9px] font-bold px-2 py-0.5", lastRating.pill)}>
                                                        <lastRating.icon size={9} />
                                                        {lastEval.rating}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="bg-slate-50 dark:bg-slate-800/50 p-3 border border-slate-100 dark:border-slate-700">
                                                <p className="text-[10px] font-bold text-slate-600 dark:text-slate-300 italic line-clamp-2 leading-relaxed">
                                                    "{lastEval.notes || 'بدون ملاحظات'}"
                                                </p>
                                                <p className="text-[8px] text-slate-400 mt-1.5">
                                                    {format(new Date(lastEval.created_at || lastEval.date), 'dd/MM/yyyy')}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <TrendingUp size={10} className="text-indigo-400" />
                                                <span className="text-[9px] text-slate-400 font-bold">{studentEvals.length} تقييم مسجل</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex-1 flex flex-col items-center justify-center py-6 text-center">
                                            <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-2 border border-dashed border-slate-200 dark:border-slate-700">
                                                <Award size={20} className="text-slate-300" />
                                            </div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">لم يتم التقييم بعد</p>
                                        </div>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                {currentUser?.role !== 'parent' && (
                                    <div className="px-4 pb-4 grid grid-cols-2 gap-2">
                                        <button
                                            onClick={() => { setFormData({ ...formData, studentId: student.id }); setIsModalOpen(true); }}
                                            className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 text-[10px] font-black transition-all flex items-center justify-center gap-1.5 shadow-sm shadow-indigo-500/20"
                                        >
                                            <Plus size={12} strokeWidth={3} /> أضف تقييم
                                        </button>
                                        <button
                                            onClick={() => setHistoryModalStudent(student)}
                                            className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 py-2 text-[10px] font-black transition-all flex items-center justify-center gap-1.5"
                                        >
                                            <History size={12} /> السجل ({studentEvals.length})
                                        </button>
                                    </div>
                                )}
                                {currentUser?.role === 'parent' && (
                                    <div className="px-4 pb-4">
                                        <button
                                            onClick={() => setHistoryModalStudent(student)}
                                            className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 py-2 text-[10px] font-black transition-all flex items-center justify-center gap-1.5"
                                        >
                                            <History size={12} /> عرض السجل الكامل ({studentEvals.length})
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {teacherStudents.length === 0 && (
                        <div className="col-span-full py-20 flex flex-col items-center justify-center text-center bg-slate-50 dark:bg-slate-900/30 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                            <div className="w-20 h-20 mx-auto bg-white dark:bg-slate-800 rounded-2xl shadow-sm flex items-center justify-center mb-4 border border-slate-100 dark:border-slate-700">
                                <User size={36} className="text-slate-300" />
                            </div>
                            <h3 className="text-lg font-black text-slate-700 dark:text-white mb-1">لا يوجد طلاب مسجلون حالياً</h3>
                            <p className="text-sm text-slate-400 max-w-xs">بمجرد تعيين طلاب لكِ، سيظهرون هنا تلقائياً.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* ─── Add Evaluation Modal ─── */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
                    <div className="bg-white dark:bg-slate-900 shadow-2xl w-full max-w-xl flex flex-col max-h-[90vh] overflow-hidden border border-slate-100 dark:border-slate-800">
                        {/* Modal Header */}
                        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-gradient-to-r from-indigo-600 to-violet-600 text-white">
                            <h3 className="text-base font-black flex items-center gap-2">
                                <Award size={18} />
                                {formData.studentId ? `تقييم: ${students.find(s => s.id === formData.studentId)?.name}` : 'إضافة تقييم جديد'}
                            </h3>
                            <button onClick={() => { setIsModalOpen(false); resetForm(); }} className="w-8 h-8 bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors">
                                <X size={16} />
                            </button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto space-y-6">
                            <form id="evaluation-form" onSubmit={onSubmit} className="space-y-6">
                                {!formData.studentId && (
                                    <div>
                                        <label className="block text-xs font-black text-slate-500 mb-2 uppercase tracking-widest">اختر الطالب</label>
                                        <select
                                            value={formData.studentId}
                                            onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                                            required
                                            className="w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-800 px-4 py-3 font-bold text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500/30 outline-none"
                                        >
                                            <option value="">-- اختر من قائمة طلابك --</option>
                                            {teacherStudents.map(s => (
                                                <option key={s.id} value={s.id}>{s.name} ({s.grade})</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-xs font-black text-slate-500 mb-3 uppercase tracking-widest">مستوى التميز</label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
                                                            ? cn(opt.bg, opt.border, opt.color, "shadow-md scale-105")
                                                            : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-400 hover:border-slate-300"
                                                    )}
                                                >
                                                    <OptIcon size={18} strokeWidth={isSelected ? 3 : 2} className={cn(isSelected && "animate-bounce")} />
                                                    <span className="text-[9px] font-black uppercase tracking-widest leading-none">{opt.value}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest">نقاط المكافأة (XP)</label>
                                        <div className="flex gap-1.5">
                                            {[5, 10, 20, 50].map(p => (
                                                <button
                                                    key={p}
                                                    type="button"
                                                    onClick={() => setFormData({...formData, points: p})}
                                                    className="bg-amber-100 text-amber-700 hover:bg-amber-200 border border-amber-200 px-2 py-0.5 font-black text-[9px] transition-colors"
                                                >+{p}</button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-10 h-10 bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
                                            <Zap size={16} className="text-amber-500 fill-current" />
                                        </div>
                                        <input
                                            type="number"
                                            value={formData.points || ''}
                                            onChange={(e) => setFormData({ ...formData, points: Number(e.target.value) })}
                                            placeholder="0"
                                            min="0"
                                            className="flex-1 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 px-4 py-2.5 font-black text-lg text-amber-600 text-center outline-none focus:ring-2 focus:ring-amber-400/30"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-black text-slate-500 mb-2 uppercase tracking-widest">رسالة الإشادة (تظهر لولي الأمر)</label>
                                    <textarea
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        rows={3}
                                        className="w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-800 px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/30 resize-none placeholder:text-slate-300 transition-all"
                                        placeholder="مثال: أداء ممتاز اليوم..."
                                    />
                                </div>
                            </form>
                        </div>
                        
                        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                            <button type="button" onClick={() => { setIsModalOpen(false); resetForm(); }} className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-white text-xs font-black hover:bg-slate-200 transition-all">
                                إلغاء
                            </button>
                            <button type="submit" form="evaluation-form" className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2">
                                <CheckCircle2 size={14} /> إرسال التقييم
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── History Modal ─── */}
            {historyModalStudent && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
                    <div className="bg-white dark:bg-slate-900 shadow-2xl w-full max-w-xl flex flex-col max-h-[85vh] overflow-hidden border border-slate-100 dark:border-slate-800">
                        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center border border-indigo-100 dark:border-indigo-900">
                                    <User size={18} className="text-indigo-500" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-slate-900 dark:text-white">سجل التقييمات الكامل</h3>
                                    <p className="text-indigo-600 dark:text-indigo-400 text-[10px] font-black">{historyModalStudent.name}</p>
                                </div>
                            </div>
                            <button onClick={() => setHistoryModalStudent(null)} className="w-8 h-8 bg-slate-200 dark:bg-slate-700 hover:bg-rose-100 hover:text-rose-600 flex items-center justify-center transition-colors">
                                <X size={16} />
                            </button>
                        </div>

                        <div className="p-4 overflow-y-auto space-y-3 bg-slate-50/50 dark:bg-slate-950">
                            {evaluations
                                .filter(ev => ev.studentId === historyModalStudent.id)
                                .sort((a, b) => new Date(b.created_at || b.date).getTime() - new Date(a.created_at || a.date).getTime())
                                .map((ev) => {
                                    const r = ratingOptions.find(ro => ro.value === ev.rating) || ratingOptions[0];
                                    return (
                                        <div key={ev.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 shadow-sm hover:border-indigo-200 transition-all group">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <span className={cn("flex items-center gap-1.5 text-[9px] font-black px-2 py-1", r.pill)}>
                                                        <r.icon size={10} strokeWidth={3} />
                                                        {ev.rating}
                                                    </span>
                                                    {ev.points > 0 && (
                                                        <span className="text-[8px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 border border-amber-100">
                                                            +{ev.points} XP
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[9px] font-bold text-slate-400 tabular-nums">
                                                        {format(new Date(ev.created_at || ev.date), 'dd/MM/yyyy')}
                                                    </span>
                                                    {(currentUser?.role === 'admin' || currentUser?.id === ev.teacherId) && (
                                                        <button onClick={() => handleDelete(ev.id)} className="text-slate-300 hover:text-rose-500 transition-colors p-1 hover:bg-rose-50">
                                                            <Trash2 size={12} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400 italic leading-relaxed border-r-2 border-indigo-200 pr-3">
                                                "{ev.notes || 'لا يوجد ملاحظات'}"
                                            </p>
                                            <div className="mt-2 pt-2 border-t border-slate-50 dark:border-slate-800 flex items-center gap-1.5">
                                                <User size={8} className="text-slate-300" />
                                                <span className="text-[8px] font-bold text-slate-400">بواسطة: {ev.teacherName || 'نظام آلي'}</span>
                                            </div>
                                        </div>
                                    );
                                })
                            }

                            {evaluations.filter(ev => ev.studentId === historyModalStudent.id).length === 0 && (
                                <div className="py-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                                    <History size={28} className="mx-auto text-slate-200 mb-3" />
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">لا يوجد سجل تقييمات حالياً</p>
                                </div>
                            )}
                        </div>

                        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-center bg-white dark:bg-slate-900">
                            <button onClick={() => setHistoryModalStudent(null)} className="px-8 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-xs hover:opacity-90 transition-all">
                                إغلاق
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
