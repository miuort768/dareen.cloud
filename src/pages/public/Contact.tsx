import { useState } from 'react';
import { PublicNavbar } from '../../components/public/PublicNavbar';
import { PublicFooter } from '../../components/public/PublicFooter';
import { Phone, Mail, MapPin, Send, Globe, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { SEO } from '../../components/SEO';
import { cn } from '../../lib/utils';

export const Contact = () => {
    const { adminPhone } = useSettings();
    const whatsappNumber = adminPhone.replace(/\D/g, '');
    const [formState, setFormState] = useState<'idle' | 'submitting' | 'success'>('idle');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setFormState('submitting');
        // Simulate API call
        setTimeout(() => setFormState('success'), 1500);
    };

    const contactInfo = [
        {
            icon: Phone,
            title: 'رقم الهاتف / واتساب',
            content: adminPhone,
            link: `https://wa.me/${whatsappNumber}`,
            color: 'bg-emerald-50 text-emerald-600',
            label: 'تواصل معنا مباشرة'
        },
        {
            icon: Mail,
            title: 'البريد الإلكتروني',
            content: 'miuort768@gmail.com',
            link: 'mailto:miuort768@gmail.com',
            color: 'bg-blue-50 text-blue-600',
            label: 'راسلنا عبر البريد'
        },
        {
            icon: MapPin,
            title: 'المقر الرئيسي',
            content: 'بني سويف - مصر',
            link: '#',
            color: 'bg-gold/10 text-gold-hover',
            label: 'تفضل بزيارتنا'
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50/50 font-sans text-gray-800 relative flex flex-col overflow-x-hidden">
            <SEO
                title="اتصل بنا"
                description="تواصل مع معهد دارين لتعليم والتدريب. نحن هنا للرد على استفساراتكم ومساعدتكم في اختيار المسار التعليمي الأنسب لأبنائكم."
            />
            <PublicNavbar />

            <main className="flex-grow pt-24 md:pt-32 pb-20 relative">
                {/* Background Decorations */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gold/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] translate-y-1/4 -translate-x-1/4 pointer-events-none"></div>

                <div className="container mx-auto px-4 relative z-10">
                    {/* Page Header */}
                    <div className="text-center max-w-4xl mx-auto mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gray-900 text-gold rounded-full mb-6">
                            <span className="w-2 h-2 rounded-full bg-gold animate-pulse"></span>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">نحن في خدمتك</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-heading font-black text-gray-900 mb-6">
                            تواصل مع <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-gold">مركز دارين</span>
                        </h1>
                        <p className="text-gray-500 text-lg md:text-xl font-medium leading-relaxed">
                            يسعدنا الرد على جميع استفساراتكم ومساعدتكم في الانضمام إلى عالم دارين التعليمي.
                            فريقنا جاهز لخدمتكم على مدار الساعة.
                        </p>
                    </div>

                    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                        {/* Contact Form Container */}
                        <div className="bg-white p-8 md:p-12 shadow-2xl shadow-gray-200/50 border border-gray-100 rounded-none relative overflow-hidden group">
                            {/* Gradient border accent */}
                            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-gold to-emerald-500"></div>

                            {formState === 'success' ? (
                                <div className="py-20 text-center animate-fade-in">
                                    <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-500">
                                        <CheckCircle2 size={48} />
                                    </div>
                                    <h2 className="text-3xl font-black text-gray-900 mb-4">تم الإرسال بنجاح!</h2>
                                    <p className="text-gray-500 text-lg mb-8">شكراً لتواصلك معنا. سيقوم فريقنا بالرد عليك في أقرب وقت ممكن.</p>
                                    <button
                                        onClick={() => setFormState('idle')}
                                        className="px-8 py-4 bg-gray-900 text-white font-bold rounded-none hover:bg-gold transition-all"
                                    >
                                        إرسال رسالة أخرى
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="mb-10">
                                        <h2 className="text-2xl font-black text-gray-800 mb-2">أرسل لنا رسالة</h2>
                                        <p className="text-gray-400 font-medium">املأ النموذج أدناه وسنتصل بك في غضون 24 ساعة.</p>
                                    </div>

                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest block">الاسم الكامل</label>
                                                <input required type="text" className="w-full bg-gray-50 border border-gray-100 px-5 py-4 outline-none focus:border-gold transition-all rounded-none font-bold" placeholder="أدخل اسمك هنا..." />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest block">رقم الهاتف</label>
                                                <input required type="tel" className="w-full bg-gray-50 border border-gray-100 px-5 py-4 outline-none focus:border-gold transition-all rounded-none font-bold text-left" placeholder="+965 XXXX XXXX" dir="ltr" />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest block">الموضوع</label>
                                            <select className="w-full bg-gray-50 border border-gray-100 px-5 py-4 outline-none focus:border-gold transition-all rounded-none font-bold appearance-none">
                                                <option>استفسار عن دورة تعليمية</option>
                                                <option>طلب حصة تجريبية</option>
                                                <option>مشكلة تقنية في المنصة</option>
                                                <option>اقتراحات وتطوير</option>
                                                <option>أخرى</option>
                                            </select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest block">رسالتك</label>
                                            <textarea required rows={5} className="w-full bg-gray-50 border border-gray-100 px-5 py-4 outline-none focus:border-gold transition-all rounded-none font-bold resize-none" placeholder="اكتب استفسارك بالتفصيل هنا..."></textarea>
                                        </div>

                                        <button
                                            disabled={formState === 'submitting'}
                                            type="submit"
                                            className={cn(
                                                "w-full py-5 bg-gray-900 text-white font-black text-sm uppercase tracking-[0.2em] rounded-none transition-all flex items-center justify-center gap-3 overflow-hidden group",
                                                formState === 'submitting' ? 'bg-gray-400' : 'hover:bg-gold shadow-xl shadow-gray-200'
                                            )}
                                        >
                                            <span className={cn(formState === 'submitting' && 'animate-pulse')}>
                                                {formState === 'submitting' ? 'جاري الإرسال...' : 'إرسال الرسالة الآن'}
                                            </span>
                                            {formState !== 'submitting' && <Send size={18} className="group-hover:translate-x-[-5px] group-hover:-translate-y-1 transition-transform" />}
                                        </button>
                                    </form>
                                </>
                            )}
                        </div>

                        {/* Contact Info Side */}
                        <div className="space-y-8">
                            {/* Visual Quote Card */}
                            <div className="bg-gray-900 p-8 text-white relative overflow-hidden rounded-none">
                                <Globe className="absolute -bottom-6 -left-6 text-white/5 w-48 h-48" />
                                <div className="relative z-10">
                                    <div className="h-1 w-24 bg-gold mb-6"></div>
                                    <h3 className="text-2xl font-black mb-4 font-heading leading-tight">سعداء بخدمتكم في كل مكان</h3>
                                    <p className="text-gray-400 font-medium leading-relaxed">بفضل نظامنا التعليمي المطور، نصلكم أينما كنتم في الكويت ودول الخليج. جودة التعليم لا تعرف حدوداً مع دارين.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                {contactInfo.map((info, idx) => (
                                    <a
                                        key={idx}
                                        href={info.link}
                                        target={info.link !== '#' ? '_blank' : undefined}
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-6 p-6 bg-white border border-gray-100 hover:border-gold transition-all group rounded-none"
                                    >
                                        <div className={cn("w-16 h-16 shrink-0 flex items-center justify-center rounded-none transition-all group-hover:scale-110", info.color)}>
                                            <info.icon size={28} />
                                        </div>
                                        <div className="flex-grow">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{info.label}</span>
                                                <ArrowLeft size={16} className="text-gray-200 group-hover:text-gold transition-colors group-hover:-translate-x-1" />
                                            </div>
                                            <h4 className="text-lg font-black text-gray-800">{info.title}</h4>
                                            <p className="text-gray-500 font-bold" dir={info.title.includes('الهاتف') ? 'ltr' : 'rtl'}>{info.content}</p>
                                        </div>
                                    </a>
                                ))}
                            </div>


                        </div>
                    </div>
                </div>
            </main>

            <PublicFooter />
        </div>
    );
};
