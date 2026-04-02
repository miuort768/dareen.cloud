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
        { value: 'ممتاز', icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-50', border: 'border-yellow-200' },
        { value: 'جيد جدًا', icon: ThumbsUp, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200' },
        { value: 'جيد', icon: CheckCircle2, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200' },
        { value: 'يحتاج تحسين', icon: ThumbsDown, color: 'text-rose-500', bg: 'bg-rose-50', border: 'border-rose-200' }
    ];

    if (isLoading) return <div className="p-8 text-center text-gray-500 animate-pulse font-black">جاري تحميل التقييمات...</div>;

    return (
        <div className="space-y-6 pb-20 animate-in fade-in duration-500" dir="rtl">
            <div className="flex justify-between items-center bg-white dark:bg-gray-900 p-6 rounded-none border shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center rounded-none shadow-sm">
                        <Award size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-gray-900 dark:text-white">التقييمات ونقاط الطلاب</h2>
                        <p className="text-xs font-bold text-gray-500">سجل التقييمات الأكاديمية والتحفيزية (Gamification)</p>
                    </div>
                </div>
                {(currentUser?.role === 'teacher' || currentUser?.role === 'admin') && (
                    <button
                        onClick={() => { resetForm(); setIsModalOpen(true); }}
                        className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-black text-sm uppercase tracking-widest hover:bg-primary-700 active:scale-95 transition-all shadow-lg rounded-none"
                    >
                        <Plus size={18} />
                        تقييم جديد
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {evaluations.map((ev) => {
                    const student = students.find(s => s.id === ev.studentId);
                    const ratingData = ratingOptions.find(r => r.value === ev.rating) || ratingOptions[0];
                    return (
                        <div key={ev.id} className="bg-white dark:bg-gray-900 p-5 rounded-none border shadow-sm relative overflow-hidden group">
                            <div className={cn("absolute top-0 right-0 w-1.5 h-full", ratingData.bg.replace('bg-', 'bg-').replace('50', '500'))} />
                            
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h4 className="font-black text-sm text-gray-900 dark:text-white pl-2">
                                        {student?.name || 'طالب غير معروف'}
                                    </h4>
                                    <p className="text-[10px] text-gray-500 font-bold mt-1">بواسطة: {ev.teacherName}</p>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <span className={cn("px-2 py-1 text-[10px] font-black tracking-widest border", ratingData.bg, ratingData.color, ratingData.border)}>
                                        {ev.rating}
                                    </span>
                                    {Number(ev.points) > 0 && (
                                        <span className="flex items-center gap-1 text-xs font-black text-yellow-600 bg-yellow-100 px-2 py-0.5 border border-yellow-200">
                                            +{ev.points} <Star size={10} className="fill-current" />
                                        </span>
                                    )}
                                </div>
                            </div>
                            
                            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-none text-xs text-gray-700 dark:text-gray-300 font-medium">
                                <MessageSquare size={14} className="inline ml-2 text-gray-400" />
                                {ev.notes || 'لا توجد ملاحظات'}
                            </div>

                            <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
                                <span className="text-[10px] font-bold text-gray-400">
                                    {format(new Date(ev.created_at || ev.date), 'PP', { locale: ar })}
                                </span>
                                {(currentUser?.role === 'admin' || currentUser?.id === ev.teacherId) && (
                                    <button onClick={() => handleDelete(ev.id)} className="text-gray-400 hover:text-rose-600 transition-colors p-1">
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
                {evaluations.length === 0 && (
                    <div className="col-span-full py-16 text-center border-2 border-dashed border-gray-200 dark:border-gray-800">
                        <Award size={48} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-black text-gray-500">لا توجد تقييمات للطلبة حتى الآن</h3>
                    </div>
                )}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
                    <div className="bg-white dark:bg-gray-900 rounded-none shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                            <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                                <Star className="text-yellow-500" />
                                تقييم طالب جديد
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <Trash2 size={24} className="hidden" />
                                &times;
                            </button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto">
                            <form id="evaluation-form" onSubmit={onSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-black text-gray-700 dark:text-gray-300 mb-2">الطالب</label>
                                    <select
                                        value={formData.studentId}
                                        onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                                        required
                                        className="w-full border-gray-300 dark:border-gray-700 dark:bg-gray-800 rounded-none focus:ring-primary-500 focus:border-primary-500 p-3 shadow-sm font-bold text-sm"
                                    >
                                        <option value="">-- اختر الطالب --</option>
                                        {students.map(s => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-black text-gray-700 dark:text-gray-300 mb-2">التقييم</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {ratingOptions.map((opt) => {
                                            const isSelected = formData.rating === opt.value;
                                            return (
                                                <button
                                                    type="button"
                                                    key={opt.value}
                                                    onClick={() => setFormData({ ...formData, rating: opt.value })}
                                                    className={cn(
                                                        "p-3 border flex flex-col items-center justify-center gap-2 rounded-none transition-all",
                                                        isSelected ? cn(opt.bg, opt.border, opt.color, "ring-2 ring-current") : "border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800"
                                                    )}
                                                >
                                                    <opt.icon size={24} />
                                                    <span className="text-xs font-black">{opt.value}</span>
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-black text-gray-700 dark:text-gray-300 mb-2">نقاط المكافأة (اختياري)</label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="number"
                                            value={formData.points}
                                            onChange={(e) => setFormData({ ...formData, points: Number(e.target.value) })}
                                            className="w-full border-gray-300 dark:border-gray-700 dark:bg-gray-800 rounded-none focus:ring-yellow-500 focus:border-yellow-500 p-3 shadow-sm font-bold text-sm"
                                        />
                                        <div className="bg-yellow-100 text-yellow-700 p-3 flex items-center justify-center border border-yellow-200">
                                            <Star size={20} />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-black text-gray-700 dark:text-gray-300 mb-2">ملاحظات وتقرير المعلم</label>
                                    <textarea
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        rows={4}
                                        className="w-full border-gray-300 dark:border-gray-700 dark:bg-gray-800 rounded-none focus:ring-primary-500 focus:border-primary-500 p-3 shadow-sm text-sm"
                                        placeholder="اكتب تفاصيل عن أداء الطالب خلال الحصة لتظهر لولي الأمر..."
                                    />
                                </div>
                            </form>
                        </div>
                        
                        <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="px-6 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-black text-sm uppercase tracking-widest hover:bg-gray-50 rounded-none shadow-sm"
                            >
                                إلغاء
                            </button>
                            <button
                                type="submit"
                                form="evaluation-form"
                                className="px-6 py-2.5 bg-primary-600 text-white font-black text-sm uppercase tracking-widest hover:bg-primary-700 active:scale-95 transition-all shadow-md rounded-none"
                            >
                                حفظ واعتماد التقييم
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
