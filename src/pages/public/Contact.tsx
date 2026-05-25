import { useState } from 'react';
import { MobileHeader } from '../../components/public/MobileHeader';
import { PublicFooter } from '../../components/public/PublicFooter';
import { Phone, Mail, MapPin, Send, CheckCircle2, MessageCircle } from 'lucide-react';
import { useSettingsStore } from '../../store/settingsStore';
import { SEO } from '../../components/SEO';
import { cn } from '../../lib/utils';

export const Contact = () => {
    const { adminPhone } = useSettingsStore();
    const whatsappNumber = adminPhone.replace(/\D/g, '');
    const [formState, setFormState] = useState<'idle' | 'submitting' | 'success'>('idle');
    const [formData, setFormData] = useState({ name: '', phone: '', subject: 'استفسار عن دورة تعليمية', message: '' });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setFormState('submitting');
        setTimeout(() => setFormState('success'), 1500);
    };

    const contactCards = [
        {
            icon: Phone,
            title: 'واتساب / هاتف',
            value: adminPhone,
            href: `https://wa.me/${whatsappNumber}`,
            gradient: 'from-emerald-500 to-teal-600',
            bg: 'bg-emerald-50 dark:bg-emerald-500/10',
            border: 'border-emerald-100 dark:border-emerald-500/20',
            iconColor: 'text-emerald-600',
        },
        {
            icon: Mail,
            title: 'البريد الإلكتروني',
            value: 'miuort768@gmail.com',
            href: 'mailto:miuort768@gmail.com',
            gradient: 'from-indigo-500 to-purple-600',
            bg: 'bg-indigo-50 dark:bg-indigo-500/10',
            border: 'border-indigo-100 dark:border-indigo-500/20',
            iconColor: 'text-indigo-600',
        },
        {
            icon: MapPin,
            title: 'المقر الرئيسي',
            value: 'بني سويف — مصر',
            href: '#',
            gradient: 'from-amber-500 to-orange-600',
            bg: 'bg-amber-50 dark:bg-amber-500/10',
            border: 'border-amber-100 dark:border-amber-500/20',
            iconColor: 'text-amber-600',
        },
    ];

    return (
        <div className="min-h-full bg-[#fafafa] dark:bg-slate-950 font-sans text-gray-800 dark:text-slate-100 flex flex-col">
            <SEO title="اتصل بنا | دارين السابعة للتعليم عن بعد" description="تواصل مع فريق دارين السابعة للاستفسار عن دوراتنا التعليمية، اشتراكات الطلاب، أو الدعم الفني. اتصل بنا عبر واتساب أو نموذج التواصل لدعم فوري." url="https://dareen.cloud/contact" image="/dareen_logo_new.jpg" />
            <MobileHeader />

            <main className="flex-grow pt-24 md:pt-28 pb-6 relative overflow-hidden">
                {/* Subtle background glows */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-none blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/5 rounded-none blur-[100px] translate-y-1/3 -translate-x-1/3 pointer-events-none" />

                <div className="container mx-auto px-4 relative z-10 max-w-5xl">

                    {/* ── Hero Header ── */}
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-none mb-5">
                            <span className="w-2 h-2 rounded-none bg-indigo-500 animate-pulse" />
                            <span className="text-[10px] font-black  text-indigo-600 dark:text-indigo-400">نحن في خدمتك</span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-heading font-black text-gray-900 dark:text-white mb-3">
                            تواصل مع{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-500">
                                دارين السابعة
                            </span>
                        </h1>
                        <p className="text-gray-500 dark:text-slate-400 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
                            فريقنا جاهز للرد على جميع استفساراتك ومساعدتك في الانضمام إلى عالم دارين التعليمي.
                        </p>
                    </div>

                    {/* ── Contact Info Cards ── */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
                        {contactCards.map((card) => (
                            <a
                                key={card.title}
                                href={card.href}
                                target={card.href !== '#' ? '_blank' : undefined}
                                rel="noopener noreferrer"
                                className={cn(
                                    "group flex flex-row items-center gap-4 p-5 border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg",
                                    card.bg, card.border
                                )}
                            >
                                <div className={cn("w-11 h-11 shrink-0 flex items-center justify-center bg-white dark:bg-slate-800 shadow-sm group-hover:scale-110 transition-transform", card.iconColor)}>
                                    <card.icon size={20} />
                                </div>
                                <div className="flex-grow min-w-0">
                                    <p className="text-[9px] font-black  text-gray-400 dark:text-slate-500 mb-0.5">{card.title}</p>
                                    <p className="text-sm font-bold text-gray-800 dark:text-white truncate" dir={card.title.includes('هاتف') ? 'ltr' : 'rtl'}>{card.value}</p>
                                </div>
                            </a>
                        ))}
                    </div>

                    {/* ── Contact Form Card ── */}
                    <div className="bg-white dark:bg-slate-900/60 dark:backdrop-blur-xl border border-gray-100 dark:border-slate-800 rounded-none overflow-hidden shadow-xl shadow-gray-200/40 dark:shadow-black/40">
                        {/* Top accent bar */}
                        <div className="h-1.5 bg-gradient-to-r from-indigo-600 via-purple-500 to-amber-500" />

                        {formState === 'success' ? (
                            <div className="py-20 text-center px-6">
                                <div className="w-20 h-20 bg-emerald-50 rounded-none flex items-center justify-center mx-auto mb-5 text-emerald-500">
                                    <CheckCircle2 size={44} />
                                </div>
                                <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">تم الإرسال بنجاح!</h2>
                                <p className="text-gray-500 dark:text-slate-400 mb-8 text-sm">سيقوم فريقنا بالرد عليك في أقرب وقت ممكن.</p>
                                <button
                                    onClick={() => setFormState('idle')}
                                    className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-none hover:bg-indigo-700 transition-all text-sm"
                                >
                                    إرسال رسالة أخرى
                                </button>
                            </div>
                        ) : (
                            <div className="p-6 md:p-10">
                                <div className="mb-8">
                                    <h2 className="text-xl font-black text-gray-900 dark:text-white mb-1">أرسل لنا رسالة</h2>
                                    <p className="text-gray-400 text-sm">سنتواصل معك خلال 24 ساعة.</p>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-5">
                                    {/* Row: Name + Phone */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-gray-400  block">الاسم الكامل</label>
                                            <input
                                                required
                                                type="text"
                                                value={formData.name}
                                                onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                                                className="w-full bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-none px-4 py-3 text-sm font-bold text-gray-900 dark:text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all placeholder:text-gray-300"
                                                placeholder="أدخل اسمك الكريم..."
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-gray-400  block">رقم الهاتف</label>
                                            <input
                                                required
                                                type="tel"
                                                value={formData.phone}
                                                onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                                                className="w-full bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-none px-4 py-3 text-sm font-bold text-gray-900 dark:text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all text-left placeholder:text-gray-300"
                                                placeholder="+965 XXXX XXXX"
                                                dir="ltr"
                                            />
                                        </div>
                                    </div>

                                    {/* Subject */}
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400  block">الموضوع</label>
                                        <select
                                            value={formData.subject}
                                            onChange={e => setFormData(p => ({ ...p, subject: e.target.value }))}
                                            className="w-full bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-none px-4 py-3 text-sm font-bold text-gray-900 dark:text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all"
                                        >
                                            <option>استفسار عن دورة تعليمية</option>
                                            <option>طلب حصة تجريبية</option>
                                            <option>مشكلة تقنية في المنصة</option>
                                            <option>اقتراحات وتطوير</option>
                                            <option>أخرى</option>
                                        </select>
                                    </div>

                                    {/* Message */}
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400  block">رسالتك</label>
                                        <textarea
                                            required
                                            rows={4}
                                            value={formData.message}
                                            onChange={e => setFormData(p => ({ ...p, message: e.target.value }))}
                                            className="w-full bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-none px-4 py-3 text-sm font-bold text-gray-900 dark:text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all resize-none placeholder:text-gray-300"
                                            placeholder="اكتب استفسارك بالتفصيل هنا..."
                                        />
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                        {/* Submit */}
                                        <button
                                            type="submit"
                                            disabled={formState === 'submitting'}
                                            className={cn(
                                                "flex items-center justify-center gap-2 py-3.5 rounded-none font-black text-sm  transition-all",
                                                formState === 'submitting'
                                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20'
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
                                            className="flex items-center justify-center gap-2 py-3.5 rounded-none font-black text-sm  bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 transition-all"
                                        >
                                            <MessageCircle size={16} />
                                            <span>تواصل واتساب</span>
                                        </a>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>

                </div>
            </main>

            <PublicFooter />
        </div>
    );
};

