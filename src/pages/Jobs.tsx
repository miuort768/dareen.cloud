import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FileText, ChevronRight, ChevronLeft, Send, CheckCircle2, Briefcase } from 'lucide-react';
import { api } from '../lib/api';
import { MobileHeader } from '../components/public/MobileHeader';
import { PublicFooter } from '../components/public/PublicFooter';
import { SEO } from '../components/SEO';
import { JobsHeroBanner, JobsSuccessView, JobsFormStep, JobsErrorModal } from './jobs-page';
import { SUBJECTS } from '../data/subjects';

const steps = [
    { id: 1, title: 'المعلومات الشخصية', icon: Briefcase },
    { id: 2, title: 'المؤهلات والوظيفة', icon: Briefcase },
    { id: 3, title: 'المادة', icon: Briefcase },
    { id: 4, title: 'الخبرات', icon: Briefcase },
];

const stepFields: Record<number, (keyof typeof formInitial)[]> = {
    1: ['name', 'phone', 'whatsapp'],
    2: ['position', 'qualification', 'grade'],
    3: ['subject'],
    4: ['graduationYear', 'onlineYears', 'curriculums'],
};

const optionalFields = new Set(['whatsapp', 'grade', 'graduationYear', 'onlineYears', 'curriculums', 'subject']);

const formInitial = { name: '', phone: '', whatsapp: '', position: '', qualification: '', grade: '', subject: '', graduationYear: '', onlineYears: '', curriculums: '' };

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

    const canProceed = useCallback(() => {
        const fields = stepFields[step] || [];
        return fields.every(f => optionalFields.has(f) || form[f]?.trim().length > 0);
    }, [step, form]);

    const nextStep = useCallback(() => {
        if (step < totalSteps && canProceed()) setStep(s => s + 1);
    }, [step, totalSteps, canProceed]);

    const prevStep = useCallback(() => {
        if (step > 1) setStep(s => s - 1);
    }, [step]);

    useEffect(() => {
        const id = setTimeout(() => {
            const firstField = stepFields[step]?.[0];
            if (firstField && firstField !== 'subject') inputRefs.current[firstField]?.focus();
        }, 300);
        return () => clearTimeout(id);
    }, [step]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (step < totalSteps) nextStep(); }
    };

    const handleSubmit = async (e: React.FormEvent | React.MouseEvent) => {
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

    if (submitted) return <JobsSuccessView />;

    return (
        <div className="min-h-screen bg-background flex flex-col" dir="rtl">
            <SEO title="التوظيف | دارين السابعة" description="فرصة للانضمام إلى فريق دارين السابعة للتعليم والتدريب. نبحث عن معلمات متميزات للتدريس أون لاين في جميع المواد. قدمي طلبك الآن."
                url="https://dareen.cloud/jobs" image="/dareen_logo_new.jpg"
                breadcrumbs={[{ name: 'الرئيسية', item: '/' }, { name: 'التوظيف', item: '/jobs' }]} />
            <script type="application/ld+json">
                {JSON.stringify({
                    '@context': 'https://schema.org', '@type': 'WebPage', name: 'التوظيف في دارين السابعة',
                    description: 'فرص عمل وانضمام إلى فريق دارين السابعة للتعليم والتدريب',
                    publisher: { '@type': 'EducationalOrganization', name: 'دارين السابعة', url: 'https://dareen.cloud' },
                    breadcrumb: { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'الرئيسية', item: 'https://dareen.cloud/' }, { '@type': 'ListItem', position: 2, name: 'التوظيف', item: 'https://dareen.cloud/jobs' }] }
                })}
            </script>
            <MobileHeader hideThemeToggle />
            <JobsHeroBanner />

            <main className="flex-grow -mt-4 md:-mt-6 relative z-20">
                <div className="container mx-auto px-4 max-w-3xl">
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                        className="bg-card border border-border/50 shadow-soft rounded-card">

                        <div className="p-4 md:p-10 border-b border-border/50">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-sm md:text-lg font-bold font-heading text-main flex items-center gap-2">
                                    <FileText className="w-4 h-4 md:w-5 md:h-5 text-primary" />تقديم طلب التوظيف
                                </h2>
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
                                <JobsFormStep step={step} form={form} subjects={SUBJECTS as unknown as string[]} inputRefs={inputRefs}
                                    onChange={handleChange} onSubjectChange={(s) => setForm(prev => ({ ...prev, subject: s }))}
                                    onKeyDown={handleKeyDown} />
                            </div>

                            <div className="p-4 md:p-10 border-t border-border/50">
                                <div className="flex items-center justify-between gap-3">
                                    <button type="button" onClick={prevStep} disabled={step === 1} aria-label="الخطوة السابقة"
                                        className="px-5 md:px-6 py-3 md:py-4 bg-card border border-border/50 text-muted font-bold text-xs transition-all disabled:opacity-20 flex items-center gap-2 hover:bg-surface rounded-card">
                                        <ChevronRight size={14} /> السابق
                                    </button>
                                    {step < totalSteps ? (
                                        <button type="button" onClick={nextStep} disabled={!canProceed()} aria-label="الخطوة التالية"
                                            className="flex-1 md:flex-none px-8 md:px-10 py-3 md:py-4 bg-primary hover:bg-primary-hover text-on-primary font-bold text-xs transition-all disabled:opacity-30 flex items-center justify-center gap-2 rounded-card shadow-soft">
                                            التالي <ChevronLeft size={14} />
                                        </button>
                                    ) : (
                                        <button type="button" onClick={handleSubmit} disabled={loading || !form.name || !form.phone || !form.position || !form.qualification}
                                            className="flex-1 md:flex-none px-8 md:px-10 py-3 md:py-4 bg-success hover:bg-success-hover text-on-primary font-bold text-xs transition-all disabled:opacity-30 flex items-center justify-center gap-2 rounded-card shadow-soft">
                                            {loading ? <span className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" /> : <Send size={14} />}
                                            تقديم الطلب
                                        </button>
                                    )}
                                </div>
                            </div>
                        </form>
                    </motion.div>
                </div>
            </main>

            <div className="mt-8 md:mt-12"><PublicFooter /></div>
            <JobsErrorModal errorMsg={errorMsg} onClose={() => setErrorMsg('')} />
        </div>
    );
};
