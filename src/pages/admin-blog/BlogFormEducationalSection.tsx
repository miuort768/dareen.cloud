import { Tag } from 'lucide-react';
import type { BlogPost } from './types';

const grades = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
const subjects = [
    { value: 'arabic', label: 'عربي' }, { value: 'math', label: 'رياضيات' },
    { value: 'islamic', label: 'إسلامية' }, { value: 'english', label: 'إنجليزي' },
    { value: 'science', label: 'علوم' }, { value: 'physics', label: 'فيزياء' },
    { value: 'chemistry', label: 'كيمياء' }, { value: 'biology', label: 'أحياء' },
    { value: 'history', label: 'تاريخ' }, { value: 'geography', label: 'جغرافيا' },
    { value: 'social', label: 'اجتماعيات' }, { value: 'computer', label: 'حاسب آلي' },
    { value: 'stats', label: 'إحصاء' },
];

interface BlogFormEducationalSectionProps {
    currentPost: Partial<BlogPost>;
    onSet: (field: string, value: string | number | boolean) => void;
    onSetCurrentPost: React.Dispatch<React.SetStateAction<Partial<BlogPost> | null>>;
}

export const BlogFormEducationalSection = ({ currentPost, onSet, onSetCurrentPost }: BlogFormEducationalSectionProps) => {
    const isDisabled = currentPost.contentType === 'foundation' || currentPost.contentType === 'more';

    return (
        <div className="p-4 rounded-2xl bg-error-soft/50 border border-error/10">
            <p className="text-micro font-bold mb-4 text-error">تصنيف تعليمي — سيظهر في صفحة المواد</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                    <label className="text-micro font-bold text-dim block mb-1">نوع المحتوى</label>
                    <select value={currentPost.contentType}
                        onChange={(e) => { const v = e.target.value; onSetCurrentPost((prev) => ({ ...prev, contentType: v, ...((v === 'foundation' || v === 'more') ? { curriculum: '', level: '', grade: '', term: '', subject: '' } : {}) })); }}
                        aria-label="نوع المحتوى"
                        className="w-full bg-card border border-border px-3 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-focus rounded-xl outline-none">
                        <option value="notes">مذكرات</option><option value="solutions">حل كتب</option>
                        <option value="more">المزيد</option><option value="foundation">تأسيس</option>
                    </select>
                </div>
                <div>
                    <label className="text-micro font-bold text-dim block mb-1">المنهج</label>
                    <select value={currentPost.curriculum} onChange={(e) => onSet('curriculum', e.target.value)}
                        disabled={isDisabled}
                        aria-label="المنهج الدراسي"
                        className="w-full bg-card border border-border px-3 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-focus rounded-xl outline-none disabled:opacity-50">
                        <option value="">بدون تحديد</option>
                        <option value="kuwait">الكويت</option><option value="qatar">قطر</option>
                        <option value="uae">الإمارات</option><option value="saudi">السعودية</option>
                    </select>
                </div>
                <div>
                    <label className="text-micro font-bold text-dim block mb-1">المرحلة</label>
                    <select value={currentPost.level} onChange={(e) => onSet('level', e.target.value)}
                        disabled={isDisabled}
                        aria-label="المرحلة الدراسية"
                        className="w-full bg-card border border-border px-3 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-focus rounded-xl outline-none disabled:opacity-50">
                        <option value="">بدون تحديد</option>
                        <option value="primary">ابتدائي</option><option value="middle">متوسط</option>
                        <option value="secondary">ثانوي</option><option value="basic">أساسي (عمان)</option>
                        <option value="preparatory">إعدادي (مصر)</option>
                    </select>
                </div>
                <div>
                    <label className="text-micro font-bold text-dim block mb-1">الصف</label>
                    <select value={currentPost.grade} onChange={(e) => onSet('grade', e.target.value)}
                        disabled={isDisabled}
                        aria-label="الصف الدراسي"
                        className="w-full bg-card border border-border px-3 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-focus rounded-xl outline-none disabled:opacity-50">
                        <option value="">بدون تحديد</option>
                        {grades.map(g => <option key={g} value={g}>صف {g}</option>)}
                    </select>
                </div>
                <div>
                    <label className="text-micro font-bold text-dim block mb-1">الفصل</label>
                    <select value={currentPost.term} onChange={(e) => onSet('term', e.target.value)}
                        disabled={isDisabled}
                        aria-label="الفصل الدراسي"
                        className="w-full bg-card border border-border px-3 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-focus rounded-xl outline-none disabled:opacity-50">
                        <option value="">بدون</option><option value="1">الفصل الأول</option>
                        <option value="2">الفصل الثاني</option>
                    </select>
                </div>
                <div>
                    <label className="text-micro font-bold text-dim block mb-1">المادة</label>
                    <select value={currentPost.subject} onChange={(e) => onSet('subject', e.target.value)}
                        disabled={isDisabled}
                        aria-label="المادة الدراسية"
                        className="w-full bg-card border border-border px-3 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-focus rounded-xl outline-none disabled:opacity-50">
                        <option value="">بدون تحديد</option>
                        {subjects.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                </div>
            </div>
        </div>
    );
};
