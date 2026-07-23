import { useState } from 'react';
import { MobileHeader } from '../../components/public/MobileHeader';
import { PublicFooter } from '../../components/public/PublicFooter';
import { Phone, Mail, MapPin, Send, CheckCircle2, MessageCircle, Sparkles } from 'lucide-react';
import { useSettingsStore } from '../../store/settingsStore';
import { SEO } from '../../components/SEO';
import { cn } from '../../lib/utils';
import { api } from '../../lib/api';
import { AnimateOnScroll } from '../../components/ui/AnimateOnScroll';

export const Contact = () => {
    const adminPhone = useSettingsStore(s => s.adminPhone);
    const whatsappNumber = adminPhone.replace(/\D/g, '');
    const [formState, setFormState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const [errorDetail, setErrorDetail] = useState('');
    const [formData, setFormData] = useState({ name: '', phone: '', subject: 'استفسار عن دورة تعليمية', curriculum: 'المنهج الكويتي', message: '' });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormState('submitting');
        try {
            await api.post('/contact', formData);
            setFormData({ name: '', phone: '', subject: 'استفسار عن دورة تعليمية', curriculum: 'المنهج الكويتي', message: '' });
            setFormState('success');
        } catch (err) {
            setFormState('error');
            setErrorDetail(err instanceof Error ? err.message : String(err));
        }
    };

    const contactCards = [
        {
            icon: Phone,
            title: 'واتساب / هاتف',
            value: adminPhone,
            href: `https://wa.me/${whatsappNumber}`,
            gradient: 'from-[var(--bg-success)] to-[var(--bg-info)]',
            bg: 'bg-success-light dark:bg-success/10',
            border: 'border-success dark:border-success/20',
            iconColor: 'text-success',
        },
        {
            icon: Mail,
            title: 'البريد الإلكتروني',
            value: 'miuort768@gmail.com',
            href: 'mailto:miuort768@gmail.com',
            gradient: 'from-primary to-primary',
            bg: 'bg-primary-soft dark:bg-primary/10',
            border: 'border-primary dark:border-primary/20',
            iconColor: 'text-primary',
        },
        {
            icon: MapPin,
            title: 'المقر الرئيسي',
            value: 'بني سويف — مصر',
            href: '#',
            gradient: 'from-[var(--bg-warning)] to-[var(--bg-warning)]',
            bg: 'bg-warning-light dark:bg-warning/10',
            border: 'border-warning dark:border-warning/20',
            iconColor: 'text-warning',
        },
    ];

    return (
        <div className="min-h-full bg-white dark:bg-background font-sans text-main dark:text-main flex flex-col">
            <SEO title="اتصل بنا | دارين السابعة - دروس خصوصية أونلاين في السعودية والكويت والخليج" description="تواصل مع فريق دارين السابعة للاستفسار عن دروس خصوصية أونلاين في الرياض وجدة والكويت ودبي والدوحة والريان ومسقط وصلالة والمنامة والمحرق، قدرات وتحصيلي، تحفيظ قرآن، تأسيس أطفال، واشتراكات الطلاب في السعودية والكويت والإمارات وقطر وعمان والبحرين. احجز حصة تجريبية مجانية عبر واتساب." url="https://dareen.cloud/contact" image="/dareen_logo_new.jpg" breadcrumbs={[{ name: 'الرئيسية', item: '/' }, { name: 'اتصل بنا', item: '/contact' }]} />
            <script type="application/ld+json">
                {JSON.stringify({
                    '@context': 'https://schema.org',
                    '@type': 'ContactPage',
                    name: 'اتصل بنا - دارين السابعة',
                    description: 'تواصل مع فريق دارين السابعة للاستفسار عن خدمات التعليم عن بعد',
                    mainEntity: { '@type': 'EducationalOrganization', name: 'دارين السابعة', url: 'https://dareen.cloud', telephone: `+${adminPhone}`, email: 'miuort768@gmail.com', contactPoint: { '@type': 'ContactPoint', telephone: `+${adminPhone}`, contactType: 'customer service', availableLanguage: ['Arabic', 'English'] } }
                })}
            </script>
            <MobileHeader />

            <main className="flex-grow md:pt-28 pb-2 relative overflow-hidden">
                {/* Subtle background glows */}
                <div className="absolute top-0 start-0 w-[500px] h-[500px] bg-primary/5 rounded-none blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                <div className="absolute bottom-0 end-0 w-[400px] h-[400px] bg-success/5 rounded-none blur-[100px] translate-y-1/3 -translate-x-1/3 pointer-events-none" />

                <div className="container mx-auto px-4 relative z-10 max-w-5xl">

                    {/* ── Hero Header ── */}
                    <AnimateOnScroll animation="fadeUp">
                    <div className="text-center mb-6">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-soft/60 dark:bg-primary/10 backdrop-blur-sm border border-primary dark:border-primary/20 rounded-full mb-1 md:mb-5">
                            <Sparkles size={13} className="text-primary dark:text-primary" />
                            <span className="text-micro font-black text-primary dark:text-primary mt-[3px] md:mt-0">نحن في خدمتك</span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-heading font-black text-main dark:text-main mb-1 md:mb-3">
                            تواصل مع{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary">
                                دارين السابعة
                            </span>
                        </h1>
                        <p className="text-muted dark:text-muted text-sm md:text-base max-w-xl mx-auto leading-relaxed">
                            فريقنا جاهز للرد على جميع استفساراتك<br className="md:hidden" /> ومساعدتك في الانضمام إلى عالم دارين التعليمي.
                        </p>
                    </div>
                    </AnimateOnScroll>

                    {/* ── Image Banner ── */}
                    <div className="mb-6">
                        <picture>
                            <source srcSet="/dareen8.webp" type="image/webp" />
                            <source srcSet="/dareen8.avif" type="image/avif" />
                            <img src="/dareen8.png" alt="دارين السابعة" width="1983" height="793" loading="lazy"
                                className="w-full max-w-[400px] md:max-w-full mx-auto h-auto block" />
                        </picture>
                    </div>

                    {/* ── Contact Form Card ── */}
                    <AnimateOnScroll animation="fadeUp">
                    <div className="bg-card border border-border dark:border-border rounded-none overflow-hidden shadow-xl shadow-sm/40 dark:shadow-black/40">
                        {/* Top accent bar */}
                        <div className="h-1.5 bg-gradient-to-r from-primary via-primary to-warning" />

                        {formState === 'success' ? (
                            <div className="py-20 text-center px-6">
                                <div className="w-20 h-20 bg-success-light rounded-none flex items-center justify-center mx-auto mb-5 text-success">
                                    <CheckCircle2 size={44} />
                                </div>
                                <h2 className="text-2xl font-black text-main dark:text-main mb-2">تم الإرسال بنجاح!</h2>
                                <p className="text-muted dark:text-muted mb-8 text-sm">سيقوم فريقنا بالرد عليك في أقرب وقت ممكن.</p>
                                <button
                                    onClick={() => setFormState('idle')}
                                    className="px-8 py-3 bg-primary text-on-primary font-bold rounded-none hover:bg-primary-hover transition-all text-sm"
                                >
                                    إرسال رسالة أخرى
                                </button>
                            </div>
                        ) : (
                            <div className="p-6 md:p-8">
                                <div className="mb-4">
                                    <h2 className="text-xl font-black text-main dark:text-main mb-1">أرسل لنا رسالة</h2>
                                    <p className="text-muted text-sm">سنتواصل معك خلال 24 ساعة.</p>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {formState === 'error' && (
                                        <div className="bg-error-light dark:bg-error/10 border border-error dark:border-error/20 p-4 text-center">
                                            <p className="text-micro font-black text-error">عذراً، حدث خطأ في الإرسال. الرجاء المحاولة مرة أخرى أو التواصل عبر واتساب.</p>
                                            {errorDetail && (
                                                <p className="text-micro text-error mt-2 opacity-70">{errorDetail}</p>
                                            )}
                                        </div>
                                    )}
                                    {/* Row: Name + Phone */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label htmlFor="contact-name" className="text-micro font-black text-muted  block">الاسم الكامل</label>
                                            <input
                                                id="contact-name"
                                                type="text"
                                                value={formData.name}
                                                onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                                                className="w-full bg-background dark:bg-card border border-border dark:border-border rounded-none px-4 py-3 text-sm font-bold text-main dark:text-main outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-dim dark:placeholder:text-muted"
                                                placeholder="أدخل اسمك الكريم..."
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label htmlFor="contact-phone" className="text-micro font-black text-muted  block">رقم الهاتف</label>
                                            <input
                                                id="contact-phone"
                                                required
                                                type="tel"
                                                inputMode="numeric"
                                                pattern="[0-9+\s]*"
                                                value={formData.phone}
                                                onChange={e => setFormData(p => ({ ...p, phone: e.target.value.replace(/[^0-9+\s]/g, '') }))}
                                                className="w-full bg-background dark:bg-card border border-border dark:border-border rounded-none px-4 py-3 text-sm font-bold text-main dark:text-main outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all text-end placeholder:text-dim dark:placeholder:text-muted"
                                                placeholder="+965 XXXX XXXX"
                                                dir="ltr"
                                            />
                                        </div>
                                    </div>

                                    {/* Subject */}
                                    <div className="space-y-1.5">
                                        <label htmlFor="contact-subject" className="text-micro font-black text-muted  block">الموضوع</label>
                                        <select
                                            id="contact-subject"
                                            value={formData.subject}
                                            onChange={e => setFormData(p => ({ ...p, subject: e.target.value }))}
                                            className="w-full bg-background dark:bg-card border border-border dark:border-border rounded-none px-4 py-3 text-sm font-bold text-main dark:text-main outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all appearance-none bg-[length:14px] bg-no-repeat ps-10"
                                            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundPosition: 'right 14px center' }}
                                        >
                                            <option>استفسار عن دورة تعليمية</option>
                                            <option>طلب حصة تجريبية</option>
                                            <option>مشكلة تقنية في المنصة</option>
                                            <option>اقتراحات وتطوير</option>
                                            <option>أخرى</option>
                                        </select>
                                    </div>

                                    {/* Curriculum */}
                                    <div className="space-y-1.5">
                                        <label htmlFor="contact-curriculum" className="text-micro font-black text-muted block">المنهج</label>
                                        <select
                                            id="contact-curriculum"
                                            value={formData.curriculum}
                                            onChange={e => setFormData(p => ({ ...p, curriculum: e.target.value }))}
                                            className="w-full bg-background dark:bg-card border border-border dark:border-border rounded-none px-4 py-3 text-sm font-bold text-main dark:text-main outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all appearance-none bg-[length:14px] bg-no-repeat ps-10"
                                            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundPosition: 'right 14px center' }}
                                        >
                                            <option>المنهج الكويتي</option>
                                            <option>المنهج القطري</option>
                                            <option>المنهج السعودي</option>
                                            <option>المنهج الإماراتي</option>
                                            <option>سلطنة عمان</option>
                                            <option>منهج آخر</option>
                                        </select>
                                    </div>

                                    {/* Message */}
                                    <div className="space-y-1.5">
                                        <label htmlFor="contact-message" className="text-micro font-black text-muted  block">رسالتك</label>
                                        <textarea
                                            id="contact-message"
                                            rows={4}
                                            value={formData.message}
                                            onChange={e => setFormData(p => ({ ...p, message: e.target.value }))}
                                            className="w-full bg-background dark:bg-card border border-border dark:border-border rounded-none px-4 py-3 text-sm font-bold text-main dark:text-main outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all resize-none placeholder:text-dim"
                                            placeholder="اكتب استفسارك بالتفصيل هنا..."
                                        />
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                                        {/* Submit */}
                                        <button
                                            type="submit"
                                            disabled={formState === 'submitting'}
                                            className={cn(
                                                "flex items-center justify-center gap-2 py-3.5 rounded-none font-black text-sm  transition-all",
                                                formState === 'submitting'
                                                    ? 'bg-card text-muted cursor-not-allowed'
                                                    : 'bg-primary hover:bg-primary-hover text-on-primary shadow-lg shadow-primary/20'
                                            )}
                                        >
                                            <span className={cn(formState === 'submitting' && 'animate-pulse')}>
                                                {formState === 'submitting' ? 'جاري الإرسال...' : 'إرسال الرسالة'}
                                            </span>
                                            {formState !== 'submitting' && <Send size={16} />}
                                        </button>

                                        {/* WhatsApp CTA */}
                                        <a
                                            href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('السلام عليكم، أرغب في الاستفسار عن خدمات دارين السابعة')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-center gap-2 py-3.5 rounded-none font-black text-sm  bg-success hover:bg-success-dark text-on-success shadow-lg shadow-success/20 transition-all"
                                        >
                                            <MessageCircle size={16} />
                                            <span>تواصل واتساب</span>
                                        </a>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                    </AnimateOnScroll>

                    {/* ── Contact Info Cards ── */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 mb-4">
                        {contactCards.map((card) => (
                            <AnimateOnScroll key={card.title} animation="fadeUp" delay={0.05} duration={0.4}>
                                <a
                                    href={card.href}
                                    target={card.href !== '#' ? '_blank' : undefined}
                                    rel="noopener noreferrer"
                                    className="group bg-card p-5 rounded-none border border-border dark:border-border shadow-sm block"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={cn("w-12 h-12 rounded-none bg-gradient-to-br text-on-primary flex items-center justify-center shadow-lg shrink-0", card.gradient)}>
                                            <card.icon size={20} />
                                        </div>
                                        <div className="flex-grow min-w-0">
                                            <p className="text-micro font-black text-muted dark:text-muted mb-0.5">{card.title}</p>
                                            <p className="text-sm font-bold text-main dark:text-main truncate" dir={card.title.includes('هاتف') ? 'ltr' : 'rtl'}>{card.value}</p>
                                        </div>
                                    </div>
                                </a>
                            </AnimateOnScroll>
                        ))}
                    </div>

                </div>
            </main>

            <PublicFooter />
        </div>
    );
};

