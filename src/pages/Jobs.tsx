import { useState, useRef, useEffect, useCallback, forwardRef, type ComponentType } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Send, GraduationCap, Calendar, Award, Globe, BookOpen, User, CheckCircle2, Sparkles, Phone, MessageCircle, ChevronLeft, ChevronRight, Building2, BookMarked, AlertTriangle, X, FileText } from 'lucide-react';
import { api } from '../lib/api';
import { MobileHeader } from '../components/public/MobileHeader';
import { PublicFooter } from '../components/public/PublicFooter';
import { SEO } from '../components/SEO';

const subjects = [
    'القرآن الكريم',
    'المواد الشرعية',
    'اللغة العربية',
    'اللغة الإنجليزية',
    'اللغة الفرنسية',
    'الرياضيات',
    'الدراسات الاجتماعية',
    'العلوم أو فروعها',
];

const steps = [
    { id: 1, title: 'المعلومات الشخصية', icon: User },
    { id: 2, title: 'المؤهلات والوظيفة', icon: GraduationCap },
    { id: 3, title: 'المادة', icon: BookMarked },
    { id: 4, title: 'الخبرات', icon: Award },
];

const stepFields: Record<number, (keyof typeof formInitial)[]> = {
    1: ['name', 'phone', 'whatsapp'],
    2: ['position', 'qualification', 'grade'],
    3: ['subject'],
    4: ['graduationYear', 'onlineYears', 'curriculums'],
};

const optionalFields = new Set(['whatsapp', 'grade', 'graduationYear', 'onlineYears', 'curriculums', 'subject']);

const formInitial = {
    name: '',
    phone: '',
    whatsapp: '',
    position: '',
    qualification: '',
    grade: '',
    subject: '',
    graduationYear: '',
    onlineYears: '',
    curriculums: '',
};

export const Jobs = () => {
    const [form, setForm] = useState(formInitial);
    const [step, setStep] = useState(1);
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const inputRefs = useRef<Record<string, HTMLInputElement | HTMLTextAreaElement | null>>({});
    const totalSteps = steps.length;

    useEffect(() => {
        const html = document.documentElement;
        const wasDark = html.classList.contains('dark');
        if (wasDark) html.classList.remove('dark');
        return () => { if (wasDark) html.classList.add('dark'); };
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if ((name === 'phone' || name === 'whatsapp' || name === 'graduationYear' || name === 'onlineYears') && value !== '' && !/^[\d+]+$/.test(value)) return;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const canProceed = () => {
        const fields = stepFields[step] || [];
        return fields.every(f => {
            if (optionalFields.has(f)) return true;
            return form[f]?.trim().length > 0;
        });
    };

    const nextStep = useCallback(() => {
        if (step < totalSteps && canProceed()) {
            setStep(s => s + 1);
        }
    }, [step, totalSteps, canProceed]);

    const prevStep = useCallback(() => {
        if (step > 1) setStep(s => s - 1);
    }, [step]);

    useEffect(() => {
        const id = setTimeout(() => {
            const firstField = stepFields[step]?.[0];
            if (firstField && firstField !== 'subject') {
                inputRefs.current[firstField]?.focus();
            }
        }, 300);
        return () => clearTimeout(id);
    }, [step]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (step < totalSteps) nextStep();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name || !form.phone || !form.position || !form.qualification) return;
        setLoading(true);
        try {
            await api.post('/jobs', form);
            setSubmitted(true);
        } catch (err: unknown) {
            setErrorMsg(err instanceof Error ? err.message : 'حدث خطأ أثناء الإرسال. حاول مرة أخرى.');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-background flex flex-col" dir="rtl">
                <MobileHeader hideThemeToggle />
                <main className="flex-grow flex items-start md:items-center justify-center px-4 md:pt-0 pt-8 pb-20">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="max-w-lg w-full bg-card border border-success/30 shadow-soft rounded-card p-8 md:p-10 text-center"
                    >
                        <div className="space-y-6">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                                className="w-16 h-16 bg-success-soft rounded-card flex items-center justify-center mx-auto"
                            >
                                <CheckCircle2 size={32} className="text-success" />
                            </motion.div>
                            <h2 className="text-2xl md:text-3xl font-bold font-heading text-main mb-3">تم استلام طلبك!</h2>
                            <p className="text-base md:text-lg text-muted">سنقوم بمراجعة طلبك والتواصل معك في أقرب فرصة. بارك الله فيك.</p>
                        </div>
                    </motion.div>
                </main>
                <PublicFooter />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex flex-col" dir="rtl">
            <SEO title="التوظيف | دارين السابعة - خطوة لتكون من العائلة" description="فرصة للانضمام إلى فريق دارين السابعة للتعليم والتدريب. نبحث عن معلمات متميزات للتدريس أون لاين في جميع المواد. قدمي طلبك الآن." url="https://dareen.cloud/jobs" image="/dareen_logo_new.jpg" breadcrumbs={[{ name: 'الرئيسية', item: '/' }, { name: 'التوظيف', item: '/jobs' }]} />
            <script type="application/ld+json">
                {JSON.stringify({
                    '@context': 'https://schema.org',
                    '@type': 'WebPage',
                    name: 'التوظيف في دارين السابعة',
                    description: 'فرص عمل وانضمام إلى فريق دارين السابعة للتعليم والتدريب',
                    publisher: { '@type': 'EducationalOrganization', name: 'دارين السابعة', url: 'https://dareen.cloud' },
                    breadcrumb: { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'الرئيسية', item: 'https://dareen.cloud/' }, { '@type': 'ListItem', position: 2, name: 'التوظيف', item: 'https://dareen.cloud/jobs' }] }
                })}
            </script>
            <MobileHeader hideThemeToggle />

            {/* Hero Banner */}
            <section className="relative pt-2 md:pt-28 pb-4 md:pb-12 overflow-hidden bg-primary">
                <div className="container mx-auto px-4 relative z-10">
                    <div className="flex flex-col md:flex-row items-center gap-3 md:gap-10 max-w-5xl mx-auto">
                        <div className="flex-1 text-center md:text-start">
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="inline-flex items-center gap-2 px-3 py-1 md:px-4 md:py-1.5 bg-white/15 rounded-card mb-3 md:mb-4"
                            >
                                <Sparkles size={12} className="text-warning" />
                                 <span className="text-xs md:text-sm font-bold text-on-primary">خطوة لتكون من العائلة</span>
                            </motion.div>
                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="text-2xl md:text-5xl font-bold font-heading text-on-primary mb-2 md:mb-3 leading-tight"
                            >
                                فرصة للانضمام{' '}
                                <span className="text-warning">إلى دارين السابعة</span>
                            </motion.h1>
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-on-primary/70 text-xs md:text-lg max-w-lg leading-relaxed mb-4 md:mb-0"
                            >
                                نبحث عن <span className="inline-block px-3 py-1 bg-warning text-on-warning rounded-card">معلمات متميزات</span> للتدريس أون لاين.<br /> انضمي إلى بيئة تعليمية مبتكرة تقدر الإبداع والتميز.
                            </motion.p>
                        </div>
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3, duration: 0.6 }}
                            className="hidden md:block shrink-0"
                        >
                            <div className="w-40 h-40 md:w-52 md:h-52 bg-white/15 rounded-card flex items-center justify-center">
                                <div className="text-center">
                                    <Building2 size={56} className="text-warning mx-auto mb-2" />
                                    <span className="text-on-primary/70 text-xs font-bold block">نحن ننتظرك</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
                <div className="absolute bottom-0 end-0 w-full h-10 md:h-16 bg-gradient-to-t from-background to-transparent" />
            </section>

            <main className="flex-grow -mt-4 md:-mt-6 relative z-20">
                <div className="container mx-auto px-4 max-w-3xl">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-card border border-border/50 shadow-soft rounded-card"
                    >
                        {/* Progress Steps */}
                        <div className="p-4 md:p-10 border-b border-border/50">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-sm md:text-lg font-bold font-heading text-main flex items-center gap-2"><FileText className="w-4 h-4 md:w-5 md:h-5 text-primary" />تقديم طلب التوظيف</h2>
                                                <div className="flex items-center gap-1.5 md:hidden">
                                                    {steps.map(s => (
                                                        <div key={s.id} className={`w-2 h-2 rounded-full transition-all duration-300 ${step === s.id ? 'w-5 bg-primary' : step > s.id ? 'bg-success' : 'bg-card border border-border/50'}`} />
                                                    ))}
                                                </div>
                                                <span className="text-xs font-bold text-muted bg-card border border-border/50 px-3 py-1 rounded-card hidden md:inline-block">
                                                    الخطوة {step} من {totalSteps}
                                                </span>
                            </div>
                            <p className="text-xs font-bold text-primary md:hidden">{steps.find(s => s.id === step)?.title}</p>
                            <div className="hidden md:grid grid-cols-4 gap-2 md:gap-4">
                                {steps.map((s, i) => (
                                    <div key={s.id} className="flex flex-col items-center gap-1.5 md:gap-2">
                                        <div className="flex items-center gap-1.5 md:gap-2 w-full">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 shrink-0 ${step === s.id ? 'bg-primary text-on-primary' : step > s.id ? 'bg-success text-on-primary' : 'bg-card border border-border/50 text-muted'}`}>
                                                {step > s.id ? <CheckCircle2 size={16} /> : s.id}
                                            </div>
                                            {i < steps.length - 1 && <div className={`flex-1 h-0.5 transition-colors duration-500 ${step > s.id ? 'bg-success' : 'bg-border'}`} />}
                                        </div>
                                        <span className={`text-xs font-bold transition-colors text-center ${step === s.id ? 'text-primary' : 'text-muted'}`}>{s.title}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <form onSubmit={(e) => { e.preventDefault(); if (step < totalSteps) nextStep(); }} onKeyDown={handleKeyDown}>
                            <div className="p-4 md:p-10">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={step}
                                        initial={{ opacity: 0, y: 12 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -12 }}
                                        transition={{ duration: 0.2 }}
                                        className="space-y-5 md:space-y-6"
                                    >
                                        {step === 1 && (
                                            <>
                                                <div className="mb-4">
                                                    <h3 className="text-base md:text-lg font-bold font-heading text-main flex items-center gap-2">
                                                        <User size={16} className="text-primary" />
                                                        المعلومات الشخصية
                                                    </h3>
                                                    <p className="text-xs text-muted mt-0.5">البيانات الأساسية للتواصل معك</p>
                                                </div>
                                                <InputField ref={el => inputRefs.current['name'] = el} icon={User} label="الاسم" name="name" value={form.name} onChange={handleChange} placeholder="الاسم الكامل" required autoComplete="name" />
                                                <InputField ref={el => inputRefs.current['phone'] = el} icon={Phone} label="رقم الهاتف" name="phone" value={form.phone} onChange={handleChange} placeholder="مثال: 96512345678" type="tel" required inputMode="numeric" autoComplete="tel" />
                                                <InputField ref={el => inputRefs.current['whatsapp'] = el} icon={MessageCircle} label="رقم واتساب" name="whatsapp" value={form.whatsapp} onChange={handleChange} placeholder="نفس الرقم أو رقم آخر" type="tel" inputMode="numeric" />
                                            </>
                                        )}

                                        {step === 2 && (
                                            <>
                                                <div className="mb-4">
                                                    <h3 className="text-base md:text-lg font-bold font-heading text-main flex items-center gap-2">
                                                        <GraduationCap size={16} className="text-primary" />
                                                        المؤهلات والوظيفة
                                                    </h3>
                                                    <p className="text-xs text-muted mt-0.5">مؤهلاتك العلمية والوظيفة المطلوبة</p>
                                                </div>
                                                <InputField ref={el => inputRefs.current['position'] = el} icon={Briefcase} label="الوظيفة المطلوبة" name="position" value={form.position} onChange={handleChange} placeholder="معلمة رياضيات - معلمة لغة عربية ..." required autoComplete="organization-title" />
                                                <InputField ref={el => inputRefs.current['qualification'] = el} icon={GraduationCap} label="المؤهل العلمي" name="qualification" value={form.qualification} onChange={handleChange} placeholder="بكالوريوس - ماجستير ..." required />
                                                <InputField ref={el => inputRefs.current['grade'] = el} icon={Award} label="التقدير" name="grade" value={form.grade} onChange={handleChange} placeholder="ممتاز - جيد جداً ..." />
                                            </>
                                        )}

                                        {step === 3 && (
                                            <>
                                                <div className="mb-4">
                                                    <h3 className="text-base md:text-lg font-bold font-heading text-main flex items-center gap-2">
                                                        <BookMarked size={16} className="text-primary" />
                                                        المادة التي تدرسها
                                                    </h3>
                                                    <p className="text-xs text-muted mt-0.5">اختياري المادة أو المواد التي تقومين بتدريسها</p>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                                    {subjects.map(s => (
                                                        <label
                                                            key={s}
                                                            onClick={() => setForm(prev => ({ ...prev, subject: s }))}
                                                    className={`flex items-center gap-3 p-4 md:p-5 rounded-card border cursor-pointer transition-all min-h-[60px] md:min-h-[68px] ${
                                                             form.subject === s
                                                                  ? 'border-2 border-primary bg-primary-soft'
                                                                  : 'border-border/50 bg-card hover:border-border'
                                                    }`}
                                                        >
                                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                                                 form.subject === s
                                                                     ? 'border-primary'
                                                                     : 'border-border/50'
                                                            }`}>
                                                                {form.subject === s && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                                                            </div>
                                                            <span className={`text-sm font-bold leading-tight ${
                                                                 form.subject === s
                                                                     ? 'text-primary'
                                                                     : 'text-muted'
                                                            }`}>{s}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </>
                                        )}

                                        {step === 4 && (
                                            <>
                                                <div className="mb-4">
                                                    <h3 className="text-base md:text-lg font-bold font-heading text-main flex items-center gap-2">
                                                        <Award size={16} className="text-primary" />
                                                        الخبرات
                                                    </h3>
                                                    <p className="text-xs text-muted mt-0.5">خبراتك السابقة والمناهج التي درستيها</p>
                                                </div>
                                                <InputField ref={el => inputRefs.current['graduationYear'] = el} icon={Calendar} label="سنة التخرج" name="graduationYear" value={form.graduationYear} onChange={handleChange} placeholder="مثال: 2020" type="number" />
                                                <InputField ref={el => inputRefs.current['onlineYears'] = el} icon={Globe} label="سنوات الخبرة في التدريس أون لاين" name="onlineYears" value={form.onlineYears} onChange={handleChange} placeholder="عدد السنوات" />
                                                <div className="space-y-2">
                                                    <label className="flex items-center gap-2 text-xs text-muted">
                                                        <BookOpen size={12} className="text-primary shrink-0" />
                                                        المناهج التي قمت بتدريسها
                                                    </label>
                                                    <textarea
                                                        ref={el => inputRefs.current['curriculums'] = el}
                                                        name="curriculums"
                                                        value={form.curriculums}
                                                        onChange={handleChange}
                                                        onKeyDown={handleKeyDown}
                                                        style={{ touchAction: 'manipulation' }}
                                                            className="w-full bg-card border border-border/60 rounded-xl p-4 min-h-[90px] md:min-h-[120px] text-sm md:text-base text-main focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-muted resize-none"
                                                        placeholder="منهج كويتي - سعودي - قطري - عماني ..."
                                                    />
                                                </div>
                                            </>
                                        )}
                                    </motion.div>
                                </AnimatePresence>
                            </div>

                            {/* Actions */}
                            <div className="p-4 md:p-10 border-t border-border/50">
                                <div className="flex items-center justify-between gap-3">
                                    <button
                                        type="button"
                                        onClick={prevStep}
                                        disabled={step === 1}
                                        aria-label="الخطوة السابقة"
                                        className="px-5 md:px-6 py-3 md:py-4 bg-card border border-border/50 text-muted font-bold text-xs transition-all disabled:opacity-20 flex items-center gap-2 hover:bg-surface rounded-card"
                                    >
                                        <ChevronRight size={14} />
                                        السابق
                                    </button>

                                    {step < totalSteps ? (
                                        <button
                                            type="button"
                                            onClick={nextStep}
                                            disabled={!canProceed()}
                                            aria-label="الخطوة التالية"
                                            className="flex-1 md:flex-none px-8 md:px-10 py-3 md:py-4 bg-primary hover:bg-primary-hover text-on-primary font-bold text-xs transition-all disabled:opacity-30 flex items-center justify-center gap-2 rounded-card shadow-soft"
                                        >
                                            التالي
                                            <ChevronLeft size={14} />
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={handleSubmit}
                                            disabled={loading || !form.name || !form.phone || !form.position || !form.qualification}
                                            aria-label="تقديم الطلب"
                                            className="flex-1 md:flex-none px-8 md:px-10 py-3 md:py-4 bg-success hover:bg-success-hover text-on-primary font-bold text-xs transition-all disabled:opacity-30 flex items-center justify-center gap-2 rounded-card shadow-soft"
                                        >
                                            {loading ? (
                                                <span className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
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

            {/* Error Modal */}
            <AnimatePresence>
                {errorMsg && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
                        onClick={() => setErrorMsg('')}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                            className="bg-card border border-error/50 shadow-soft rounded-card p-6 max-w-sm w-full text-center"
                            onClick={e => e.stopPropagation()}
                        >
                            <button
                                type="button"
                                onClick={() => setErrorMsg('')}
                                aria-label="إغلاق"
                                className="absolute top-3 end-3 w-8 h-8 flex items-center justify-center text-muted hover:text-error transition-colors rounded-card"
                            >
                                <X size={16} />
                            </button>
                            <div className="w-16 h-16 bg-error/10 rounded-card flex items-center justify-center mx-auto mb-5">
                                <AlertTriangle size={32} className="text-error" />
                            </div>
                            <h3 className="text-lg font-bold font-heading text-main mb-2">عذراً</h3>
                            <p className="text-sm text-muted leading-relaxed">{errorMsg}</p>
                            <button
                                type="button"
                                onClick={() => setErrorMsg('')}
                                aria-label="إغلاق"
                                className="mt-6 w-full py-3 bg-error hover:bg-error-hover text-on-primary font-bold text-xs rounded-card transition-all"
                            >
                                حسناً
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

interface InputFieldProps {
    icon: ComponentType<{ size?: number; className?: string }>;
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder: string;
    required?: boolean;
    type?: string;
    inputMode?: 'text' | 'numeric' | 'tel' | 'url' | 'email' | 'decimal';
    autoComplete?: string;
}

const InputField = forwardRef<HTMLInputElement, InputFieldProps>(({ icon: Icon, label, name, value, onChange, placeholder, required, type = 'text', inputMode, autoComplete }, ref) => (
    <div className="space-y-1.5">
        <label className="flex items-center gap-2 text-xs text-muted">
            <Icon size={12} className="text-primary shrink-0" />
            {label}
            {required && <span className="text-error">*</span>}
            {!required && <span className="text-xs text-muted">(اختياري)</span>}
        </label>
        <input
            ref={ref}
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            inputMode={inputMode}
            autoComplete={autoComplete}
            style={{ touchAction: 'manipulation' }}
            className="w-full bg-card border border-border/60 rounded-xl py-3 px-4 text-sm text-main focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-muted"
        />
    </div>
));
InputField.displayName = 'InputField';
