import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Send, GraduationCap, Calendar, Award, Globe, BookOpen, User, CheckCircle2, Sparkles, Phone, MessageCircle, ChevronLeft, ChevronRight, Building2 } from 'lucide-react';
import { api } from '../lib/api';
import { MobileHeader } from '../components/public/MobileHeader';
import { PublicFooter } from '../components/public/PublicFooter';

const steps = [
    { id: 1, title: 'المعلومات الشخصية', icon: User },
    { id: 2, title: 'المؤهلات والوظيفة', icon: GraduationCap },
    { id: 3, title: 'الخبرات', icon: Award },
];

const stepFields: Record<number, (keyof typeof formInitial)[]> = {
    1: ['name', 'phone', 'whatsapp'],
    2: ['position', 'qualification', 'grade'],
    3: ['graduationYear', 'onlineYears', 'curriculums'],
};

const formInitial = {
    name: '',
    phone: '',
    whatsapp: '',
    position: '',
    qualification: '',
    grade: '',
    graduationYear: '',
    onlineYears: '',
    curriculums: '',
};

export const Jobs = () => {
    const [form, setForm] = useState(formInitial);
    const [step, setStep] = useState(1);
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const totalSteps = steps.length;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const canProceed = () => {
        const fields = stepFields[step] || [];
        return fields.every(f => {
            if (f === 'whatsapp' || f === 'grade' || f === 'graduationYear' || f === 'onlineYears' || f === 'curriculums') return true;
            return form[f]?.trim().length > 0;
        });
    };

    const nextStep = () => {
        if (step < totalSteps) setStep(s => s + 1);
    };

    const prevStep = () => {
        if (step > 1) setStep(s => s - 1);
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

    if (submitted) {
        return (
            <div className="min-h-screen bg-[#fafafa] dark:bg-slate-950 font-sans flex flex-col" dir="rtl">
                <MobileHeader />
                <main className="flex-grow flex items-start justify-center px-4 pt-8 pb-20">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="max-w-md w-full bg-white dark:bg-slate-900 border-2 border-emerald-500/30 p-10 md:p-14 text-center shadow-xl relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 blur-3xl" />
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/5 rounded-full -ml-16 -mb-16 blur-3xl" />
                        <div className="relative z-10">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                                className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-6 border-2 border-emerald-200 dark:border-emerald-800"
                            >
                                <CheckCircle2 size={40} className="text-emerald-600 dark:text-emerald-400" />
                            </motion.div>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">تم استلام طلبك!</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">سنقوم بمراجعة طلبك والتواصل معك في أقرب فرصة. بارك الله فيك.</p>
                        </div>
                    </motion.div>
                </main>
                <PublicFooter />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fafafa] dark:bg-slate-950 font-sans flex flex-col" dir="rtl">
            <MobileHeader />

            {/* Hero Banner */}
            <section className="relative pt-14 md:pt-28 pb-8 md:pb-12 overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-10 right-10 w-64 h-64 bg-white/5 rounded-full blur-[80px]" />
                    <div className="absolute bottom-10 left-10 w-48 h-48 bg-white/5 rounded-full blur-[60px]" />
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5" />
                </div>
                <div className="container mx-auto px-4 relative z-10">
                    <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10 max-w-5xl mx-auto">
                        <div className="flex-1 text-center md:text-right">
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 border border-white/20 rounded-full mb-4 backdrop-blur-sm"
                            >
                                <Sparkles size={12} className="text-amber-300" />
                                <span className="text-[10px] font-black text-white/90">انضمي إلى فريقنا</span>
                            </motion.div>
                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="text-3xl md:text-5xl font-black text-white mb-3 leading-tight"
                            >
                                فرصة للانضمام{' '}
                                <span className="text-amber-300">إلى دارين السابعة</span>
                            </motion.h1>
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-white/80 text-sm md:text-base max-w-lg leading-relaxed font-medium"
                            >
                                نبحث عن معلمات متميزات للتدريس أون لاين.<br /> انضمي إلى بيئة تعليمية مبتكرة تقدر الإبداع والتميز.
                            </motion.p>
                        </div>
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3, duration: 0.6 }}
                            className="hidden md:block shrink-0"
                        >
                            <div className="w-40 h-40 md:w-52 md:h-52 bg-white/10 rounded-[2rem] flex items-center justify-center backdrop-blur-sm border border-white/20 shadow-2xl">
                                <div className="text-center">
                                    <Building2 size={56} className="text-amber-300 mx-auto mb-2" />
                                    <span className="text-white/80 text-[10px] font-black block">نحن ننتظرك</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
                <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-[#fafafa] to-transparent dark:from-slate-950" />
            </section>

            <main className="flex-grow -mt-6 relative z-20">
                <div className="container mx-auto px-4 max-w-2xl">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/50 dark:shadow-black/30 border border-slate-100 dark:border-slate-800 overflow-hidden"
                    >
                        {/* Progress Steps */}
                        <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-sm font-black text-slate-900 dark:text-white">تقديم طلب التوظيف</h2>
                                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
                                    الخطوة {step} من {totalSteps}
                                </span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 md:gap-4">
                                {steps.map((s, i) => (
                                    <div key={s.id} className="flex flex-col items-center gap-1.5 md:gap-2">
                                        <div className="flex items-center gap-1.5 md:gap-2 w-full">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black transition-all duration-500 shrink-0 ${step === s.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 scale-110' : step > s.id ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500'}`}>
                                                {step > s.id ? <CheckCircle2 size={14} /> : s.id}
                                            </div>
                                            {i < steps.length - 1 && <div className={`flex-1 h-0.5 transition-colors duration-500 ${step > s.id ? 'bg-emerald-400' : 'bg-slate-200 dark:bg-slate-700'}`} />}
                                        </div>
                                        <span className={`text-[10px] font-bold transition-colors text-center ${step === s.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`}>{s.title}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <form onSubmit={(e) => { e.preventDefault(); if (step < totalSteps) nextStep(); }}>
                            <div className="p-6 md:p-8">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={step}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.25 }}
                                        className="space-y-5"
                                    >
                                        {step === 1 && (
                                            <>
                                                <div className="mb-4">
                                                    <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                                                        <User size={16} className="text-indigo-500" />
                                                        المعلومات الشخصية
                                                    </h3>
                                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">البيانات الأساسية للتواصل معك</p>
                                                </div>
                                                <InputField icon={User} label="الاسم" name="name" value={form.name} onChange={handleChange} placeholder="الاسم الكامل" required />
                                                <InputField icon={Phone} label="رقم الهاتف" name="phone" value={form.phone} onChange={handleChange} placeholder="مثال: 96512345678" type="tel" required />
                                                <InputField icon={MessageCircle} label="رقم واتساب" name="whatsapp" value={form.whatsapp} onChange={handleChange} placeholder="نفس الرقم أو رقم آخر" type="tel" />
                                            </>
                                        )}

                                        {step === 2 && (
                                            <>
                                                <div className="mb-4">
                                                    <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                                                        <GraduationCap size={16} className="text-indigo-500" />
                                                        المؤهلات والوظيفة
                                                    </h3>
                                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">مؤهلاتك العلمية والوظيفة المطلوبة</p>
                                                </div>
                                                <InputField icon={Briefcase} label="الوظيفة المطلوبة" name="position" value={form.position} onChange={handleChange} placeholder="معلمة رياضيات - معلمة لغة عربية ..." required />
                                                <InputField icon={GraduationCap} label="المؤهل العلمي" name="qualification" value={form.qualification} onChange={handleChange} placeholder="بكالوريوس - ماجستير ..." required />
                                                <InputField icon={Award} label="التقدير" name="grade" value={form.grade} onChange={handleChange} placeholder="ممتاز - جيد جداً ..." />
                                            </>
                                        )}

                                        {step === 3 && (
                                            <>
                                                <div className="mb-4">
                                                    <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                                                        <Award size={16} className="text-indigo-500" />
                                                        الخبرات
                                                    </h3>
                                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">خبراتك السابقة والمناهج التي درستيها</p>
                                                </div>
                                                <InputField icon={Calendar} label="سنة التخرج" name="graduationYear" value={form.graduationYear} onChange={handleChange} placeholder="مثال: 2020" type="number" />
                                                <InputField icon={Globe} label="سنوات الخبرة في التدريس أون لاين" name="onlineYears" value={form.onlineYears} onChange={handleChange} placeholder="عدد السنوات" />
                                                <div className="space-y-2">
                                                    <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 dark:text-slate-400">
                                                        <BookOpen size={12} className="text-indigo-500 shrink-0" />
                                                        المناهج التي قمت بتدريسها
                                                    </label>
                                                    <textarea
                                                        name="curriculums"
                                                        value={form.curriculums}
                                                        onChange={handleChange}
                                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 min-h-[90px] text-sm font-normal text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all placeholder:text-slate-400 resize-none"
                                                        placeholder="منهج كويتي - سعودي - قطري - عماني ..."
                                                    />
                                                </div>
                                            </>
                                        )}
                                    </motion.div>
                                </AnimatePresence>
                            </div>

                            {/* Actions */}
                            <div className="p-6 md:p-8 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                                <div className="flex items-center justify-between gap-3">
                                    <button
                                        type="button"
                                        onClick={prevStep}
                                        disabled={step === 1}
                                        className="px-5 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-black text-xs transition-all disabled:opacity-20 flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700"
                                    >
                                        <ChevronRight size={14} />
                                        السابق
                                    </button>

                                    {step < totalSteps ? (
                                        <button
                                            type="button"
                                            onClick={nextStep}
                                            disabled={!canProceed()}
                                            className="flex-1 md:flex-none px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs transition-all disabled:opacity-30 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
                                        >
                                            التالي
                                            <ChevronLeft size={14} />
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={handleSubmit}
                                            disabled={loading || !form.name || !form.phone || !form.position || !form.qualification}
                                            className="flex-1 md:flex-none px-8 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-black text-xs transition-all disabled:opacity-30 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                                        >
                                            {loading ? (
                                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <Send size={14} />
                                            )}
                                            تقديم الطلب
                                        </button>
                                    )}
                                </div>
                            </div>
                        </form>
                    </motion.div>
                </div>
            </main>

            <div className="mt-8 md:mt-12">
                <PublicFooter />
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
    <div className="space-y-1.5">
        <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 dark:text-slate-400">
            <Icon size={12} className="text-indigo-500 shrink-0" />
            {label}
            {required && <span className="text-rose-400">*</span>}
        </label>
        <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 py-3 px-4 text-sm font-normal text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all placeholder:text-slate-400"
        />
    </div>
);
