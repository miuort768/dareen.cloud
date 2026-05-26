import { useState } from 'react';
import { Briefcase, Send, GraduationCap, Calendar, Award, Globe, BookOpen, User, CheckCircle2, Sparkles } from 'lucide-react';
import { api } from '../lib/api';

export const Jobs = () => {
    const [form, setForm] = useState({
        name: '',
        position: '',
        qualification: '',
        grade: '',
        graduationYear: '',
        onlineYears: '',
        curriculums: ''
    });
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name || !form.position || !form.qualification) return;
        setLoading(true);
        try {
            await api.post('/jobs', form);
            setSubmitted(true);
        } catch {
            alert('حدث خطأ أثناء الإرسال. حاول مرة أخرى.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 dark:from-[#020617] dark:via-slate-950 dark:to-indigo-950/20 font-sans" dir="rtl">
            <div className="max-w-2xl mx-auto px-4 py-16">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="w-16 h-16 bg-indigo-600 rounded-none flex items-center justify-center mx-auto mb-6 shadow-[4px_4px_0_rgba(0,0,0,0.1)]">
                        <Briefcase size={32} className="text-white" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-medium text-slate-900 dark:text-white uppercase tracking-tighter mb-3">
                        التوظيف
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-normal max-w-md mx-auto leading-relaxed">
                        انضمي إلى فريق دارين السابعة التعليمي — نبحث عن معلمات متميزات للتدريس أون لاين
                    </p>
                </div>

                {submitted ? (
                    <div className="bg-white dark:bg-slate-900 border-2 border-emerald-500/30 p-12 text-center shadow-sm">
                        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-none flex items-center justify-center mx-auto mb-6 border border-emerald-200 dark:border-emerald-800">
                            <CheckCircle2 size={32} className="text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <h2 className="text-xl font-medium text-slate-900 dark:text-white uppercase tracking-tighter mb-2">تم استلام طلبك</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-normal">سنقوم بمراجعة طلبك والتواصل معك في أقرب فرصة. بارك الله فيك.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                            <h2 className="text-sm font-medium text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                                <Sparkles size={16} className="text-indigo-500" />
                                نموذج تقديم الوظيفة
                            </h2>
                        </div>

                        <div className="p-8 space-y-6">
                            <InputField
                                icon={User}
                                label="الاسم"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="الاسم الكامل"
                                required
                            />

                            <InputField
                                icon={Briefcase}
                                label="الوظيفة المطلوبة"
                                name="position"
                                value={form.position}
                                onChange={handleChange}
                                placeholder="معلمة رياضيات - معلمة لغة عربية ..."
                                required
                            />

                            <InputField
                                icon={GraduationCap}
                                label="المؤهل العلمي"
                                name="qualification"
                                value={form.qualification}
                                onChange={handleChange}
                                placeholder="بكالوريوس - ماجستير ..."
                                required
                            />

                            <InputField
                                icon={Award}
                                label="التقدير"
                                name="grade"
                                value={form.grade}
                                onChange={handleChange}
                                placeholder="ممتاز - جيد جداً ..."
                            />

                            <InputField
                                icon={Calendar}
                                label="سنة التخرج"
                                name="graduationYear"
                                value={form.graduationYear}
                                onChange={handleChange}
                                placeholder="مثال: 2020"
                                type="number"
                            />

                            <InputField
                                icon={Globe}
                                label="سنوات الخبرة في التدريس أون لاين"
                                name="onlineYears"
                                value={form.onlineYears}
                                onChange={handleChange}
                                placeholder="عدد السنوات"
                            />

                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                    <BookOpen size={14} className="text-indigo-500 shrink-0" />
                                    المناهج التي قمت بتدريسها
                                </label>
                                <textarea
                                    name="curriculums"
                                    value={form.curriculums}
                                    onChange={handleChange}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 min-h-[100px] text-sm font-normal text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500 transition-all placeholder:text-slate-400 resize-none"
                                    placeholder="منهج كويتي - سعودي - قطري - عماني ..."
                                />
                            </div>
                        </div>

                        <div className="p-8 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                            <button
                                type="submit"
                                disabled={loading || !form.name || !form.position || !form.qualification}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 px-6 text-sm font-medium uppercase tracking-widest transition-all disabled:opacity-30 flex items-center justify-center gap-3 active:scale-[0.99]"
                            >
                                {loading ? (
                                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <Send size={16} />
                                )}
                                تقديم الطلب
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

interface InputFieldProps {
    icon: React.FC<{ size?: number; className?: string }>;
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder: string;
    required?: boolean;
    type?: string;
}

const InputField = ({ icon: Icon, label, name, value, onChange, placeholder, required, type = 'text' }: InputFieldProps) => (
    <div className="space-y-2">
        <label className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
            <Icon size={14} className="text-indigo-500 shrink-0" />
            {label}
            {required && <span className="text-rose-500">*</span>}
        </label>
        <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 py-3.5 px-4 text-sm font-normal text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500 transition-all placeholder:text-slate-400"
        />
    </div>
);
