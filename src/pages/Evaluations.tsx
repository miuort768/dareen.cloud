import { useState, useEffect } from 'react';
import { 
    Star, 
    Award, 
    Plus, 
    ThumbsUp, 
    ThumbsDown, 
    MessageSquare,
    CheckCircle2,
    Trash2
} from 'lucide-react';
import { api } from '../lib/api';
import { useApp } from '../context/AppContext';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

export const Evaluations = () => {
    const { currentUser } = useApp();
    const [evaluations, setEvaluations] = useState<any[]>([]);
    const [students, setStudents] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
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

    if (isLoading) return <div className="p-8 text-center text-gray-500 animate-pulse font-black">جاري تحميل التقييمات...</div>;

    return (
        <div className="space-y-8 pb-20 animate-in fade-in duration-500" dir="rtl">
            {/* Header Banner - Premium Style */}
            <div className="relative bg-primary-600 p-8 shadow-xl overflow-hidden border-b-4 border-primary-500 rounded-none shrink-0">
                {/* Background Shapes */}
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 rounded-full -mr-20 -mt-20 blur-[100px] pointer-events-none"></div>
                <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
                
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner group">
                            <Award size={36} className="text-yellow-400 group-hover:scale-110 transition-transform duration-300" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-black text-white mb-2 tracking-tight">سجل التقييمات والتحفيز</h1>
                            <p className="text-white/80 text-sm font-bold flex items-center gap-2">
                                <Star size={16} className="text-yellow-400" />
                                متابعة وتقييم أداء الطلاب لتعزيز المهارات
                            </p>
                        </div>
                    </div>
                    {/* Add button */}
                    {(currentUser?.role === 'teacher' || currentUser?.role === 'admin') && (
                        <button
                            onClick={() => { resetForm(); setIsModalOpen(true); }}
                            className="bg-white text-primary-600 px-6 py-3 flex items-center justify-center gap-3 font-black text-sm uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:-translate-y-1 transition-all border-2 border-transparent hover:border-yellow-400 w-full md:w-auto"
                        >
                            <Plus size={20} className="text-primary-600" />
                            تقييم طالب جديد
                        </button>
                    )}
                </div>
            </div>

            <div className="px-4 md:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {evaluations.map((ev) => {
                        const student = students.find(s => s.id === ev.studentId);
                        const ratingData = ratingOptions.find(r => r.value === ev.rating) || ratingOptions[0];
                        const EvIcon = ratingData.icon;
                        
                        return (
                            <div key={ev.id} className="relative bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-800 p-0 shadow-sm hover:shadow-xl transition-all duration-300 group rounded-none overflow-hidden flex flex-col">
                                {/* Top Accent Line */}
                                <div className={cn("absolute top-0 inset-x-0 h-1.5", ratingData.bg.replace('bg-', 'bg-').replace('100', '500').replace('50', '500'))} />
                                
                                <div className="p-5 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex-1 min-w-0 pr-2">
                                            <h4 className="font-black text-base text-gray-900 dark:text-white truncate">
                                                {student?.name || 'طالب غير معروف'}
                                            </h4>
                                            <p className="text-[11px] text-gray-400 dark:text-gray-500 font-bold mt-1">بواسطة: {ev.teacherName}</p>
                                        </div>
                                        <div className="flex flex-col items-end gap-2 shrink-0 pl-2">
                                            <div className={cn("flex items-center gap-1.5 px-3 py-1 text-xs font-black tracking-wider border rounded-none shadow-sm shadow-current/10", ratingData.bg, ratingData.color, ratingData.border)}>
                                                <EvIcon size={12} strokeWidth={3} />
                                                {ev.rating}
                                            </div>
                                            {Number(ev.points) > 0 && (
                                                <div className="flex items-center gap-1 text-xs font-black text-amber-600 bg-gradient-to-r from-amber-100 to-yellow-50 px-2.5 py-1 border border-amber-200 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                                                    +{ev.points} <Star size={12} className="fill-amber-500 text-amber-500 animate-pulse" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="mt-auto pt-3 border-t border-gray-50 dark:border-gray-800">
                                        <div className="relative bg-gray-50 dark:bg-gray-800/80 p-3 text-xs text-gray-700 dark:text-gray-300 font-semibold leading-relaxed border-r-2 border-primary-400">
                                            <MessageSquare size={14} className="absolute left-3 top-3 text-gray-300 dark:text-gray-600" />
                                            <span className="pr-1 block min-h-[3rem] whitespace-pre-wrap">{ev.notes || 'لا توجد رسالة أو ملاحظات مرفقة.'}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Footer */}
                                <div className="bg-gray-50 dark:bg-gray-900/50 px-5 py-3 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center mt-auto">
                                    <span className="text-[10px] font-black tracking-widest text-gray-400 uppercase">
                                        {format(new Date(ev.created_at || ev.date), 'dd MMM yyyy', { locale: ar })}
                                    </span>
                                    {(currentUser?.role === 'admin' || currentUser?.id === ev.teacherId) && (
                                        <button onClick={() => handleDelete(ev.id)} className="text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 p-1.5 transition-colors group-hover:opacity-100 lg:opacity-0 focus:opacity-100 rounded-none">
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    {evaluations.length === 0 && (
                        <div className="col-span-full py-20 px-4 text-center bg-gray-50 dark:bg-gray-800/20 border-2 border-dashed border-gray-200 dark:border-gray-700">
                            <div className="w-24 h-24 mx-auto bg-white dark:bg-gray-800 shadow-xl rounded-full flex items-center justify-center mb-6">
                                <Award size={48} className="text-primary-400 dark:text-primary-500" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">لا توجد تقييمات للطلبة حتى الآن</h3>
                            <p className="text-sm font-bold text-gray-500 max-w-md mx-auto">التقييمات تساعد الطلاب على التحفيز وتوفر لأولياء الأمور نظرة شاملة عن أداء أبنائهم، ابدأ بتقييم طالب الآن!</p>
                            {(currentUser?.role === 'teacher' || currentUser?.role === 'admin') && (
                                <button
                                    onClick={() => { resetForm(); setIsModalOpen(true); }}
                                    className="mt-8 mx-auto bg-primary-600 text-white px-8 py-3 flex items-center justify-center gap-3 font-black text-sm uppercase tracking-widest hover:bg-primary-700 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] hover:-translate-y-1"
                                >
                                    <Plus size={18} /> إضافة التقييم الأول
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
                    <div className="bg-white dark:bg-gray-900 rounded-none shadow-2xl w-full max-w-xl border-2 border-primary-500 flex flex-col max-h-[90vh] overflow-hidden transform scale-100 transition-transform">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-primary-50/50 dark:bg-primary-900/20 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-2xl pointer-events-none"></div>
                            <h3 className="text-xl font-black text-primary-900 dark:text-primary-100 flex items-center gap-3 relative z-10">
                                <Star className="text-yellow-500 fill-yellow-500" />
                                تقييم طالب جديد
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 p-2 transition-colors relative z-10">
                                <Trash2 size={24} className="hidden" />
                                &times;
                            </button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto">
                            <form id="evaluation-form" onSubmit={onSubmit} className="space-y-8">
                                <div>
                                    <label className="block text-xs font-black text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-widest">الطالب المحدد</label>
                                    <select
                                        value={formData.studentId}
                                        onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                                        required
                                        className="w-full border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-900 rounded-none focus:ring-0 focus:border-primary-500 p-3.5 font-bold text-sm text-gray-900 dark:text-white transition-colors cursor-pointer"
                                    >
                                        <option value="">-- اختر الطالب --</option>
                                        {students.map(s => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-black text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-widest">مستوى التقييم</label>
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
                                                        "p-4 border-2 flex flex-col items-center justify-center gap-3 rounded-none transition-all duration-200 relative overflow-hidden group",
                                                        isSelected 
                                                            ? cn(opt.bg, opt.border, opt.color, "shadow-inner") 
                                                            : "border-gray-100 dark:border-gray-800 text-gray-500 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800"
                                                    )}
                                                >
                                                    {isSelected && <div className="absolute inset-0 bg-white/40 dark:bg-black/20 pointer-events-none" />}
                                                    <OptIcon size={28} className={cn("relative z-10 transition-transform duration-300 group-hover:scale-110", isSelected && "scale-110")} />
                                                    <span className="text-sm font-black tracking-wide relative z-10">{opt.value}</span>
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-black text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-widest flex justify-between">
                                        <span>نقاط المكافأة الإضافية</span>
                                        <span className="text-yellow-600 text-[10px] bg-yellow-50 px-2 py-0.5 border border-yellow-200">اختياري</span>
                                    </label>
                                    <div className="flex">
                                        <input
                                            type="number"
                                            value={formData.points || ''}
                                            onChange={(e) => setFormData({ ...formData, points: Number(e.target.value) })}
                                            placeholder="0"
                                            min="0"
                                            className="w-full border-2 border-l-0 border-gray-200 dark:border-gray-700 dark:bg-gray-900 rounded-none focus:ring-0 focus:border-yellow-500 p-3.5 font-black text-xl text-yellow-600 text-center transition-colors shadow-inner"
                                        />
                                        <div className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-500 px-6 flex items-center justify-center border-2 border-gray-200 dark:border-gray-700 border-r-0 shrink-0">
                                            <Star size={24} className="fill-yellow-500" />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-black text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-widest">رسالة إلى ولي الأمر</label>
                                    <textarea
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        rows={4}
                                        className="w-full border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-900 rounded-none focus:ring-0 focus:border-primary-500 p-4 shadow-sm text-sm font-semibold transition-colors resize-none placeholder:font-medium placeholder:text-gray-400/80"
                                        placeholder="اكتب تقريراً تفصيلياً أو ملاحظات دقيقة عن أداء الطالب لتظهر لولي أمره بشكل مباشر..."
                                    />
                                </div>
                            </form>
                        </div>
                        
                        <div className="p-6 border-t font-black border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 flex justify-end gap-3 shrink-0">
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="px-6 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-xs uppercase tracking-widest hover:bg-gray-50 hover:text-gray-900 transition-colors rounded-none"
                            >
                                إلغاء
                            </button>
                            <button
                                type="submit"
                                form="evaluation-form"
                                className="px-8 py-3 bg-primary-600 text-white text-xs uppercase tracking-widest hover:bg-primary-700 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] transition-all rounded-none gap-2 flex items-center"
                            >
                                إرسال واعتماد
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
