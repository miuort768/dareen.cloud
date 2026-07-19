import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AnimateOnScroll } from '../../components/ui/AnimateOnScroll';
import { useSettingsStore } from '../../store/settingsStore';


import { SEO } from '../../components/SEO';
import { MobileHeader } from '../../components/public/MobileHeader';
import { PublicFooter } from '../../components/public/PublicFooter';
import { MasarSection } from '../../components/public/MasarSection';
import { WhyChooseUs } from './components/WhyChooseUs';
import { QuranSection } from './components/QuranSection';
import { HowItWorks } from './components/HowItWorks';
import { Testimonials } from './components/Testimonials';
import { FAQSection } from './components/FAQSection';
import { HeroSection } from './components/HeroSection';
import { HowToSubscribe } from './components/HowToSubscribe';
import { AppDownloadSection } from './components/AppDownloadSection';
import { StatsCounter } from './components/StatsCounter';
import { Image } from '../../shared/components/ui';
import { Play, Headphones, Users, Star, ChevronLeft, BadgeCheck } from 'lucide-react';
import { featureStyles, quickFeatures, getFilteredCourses, heroSlides, stages, reviews, reviewSchema } from './home-page';



export const Home = () => {
    const adminPhone = useSettingsStore(s => s.adminPhone);
    const heroBanners = useSettingsStore(s => s.heroBanners);
    const whatsappNumbers = useSettingsStore(s => s.whatsappNumbers);
    const defaultNumber = adminPhone.replace(/\D/g, '');

    const getNumber = (label: string): string => {
        try {
            const entries = JSON.parse(whatsappNumbers);
            const found = entries.find((e: { label: string; phone: string }) => e.label === label);
            return found ? found.phone.replace(/\D/g, '') : defaultNumber;
        } catch (e) { console.warn(e); return defaultNumber; }
    };

    const requestFreeNumber = getNumber('طلب حصة مجانية');
    const bookFreeNumber = getNumber('احجز حصتك المجانية الآن');
    const memorizingNumber = getNumber('ابدأ الحفظ الآن');
    const excellenceNumber = getNumber('ابدأ رحلة التميز');
    const signupNowNumber = getNumber('سجل الآن');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [activeCategory, setActiveCategory] = useState('all');
    const [typewriterText, setTypewriterText] = useState("");
    const [heroIndex, setHeroIndex] = useState(0);

    let bannersArray = ["", "", "", ""];
    try { if (heroBanners) bannersArray = JSON.parse(heroBanners); } catch (e) { console.warn(e); }

    useEffect(() => {
        const fullText = "منصة دارين السابعة";
        let i = 0, isDeleting = false, typingSpeed = 150, timer: ReturnType<typeof setTimeout>;
        const type = () => {
            const currentText = isDeleting ? fullText.substring(0, i - 1) : fullText.substring(0, i + 1);
            setTypewriterText(currentText);
            if (!isDeleting && i === fullText.length) { isDeleting = true; typingSpeed = 2000; }
            else if (isDeleting && i === 0) { isDeleting = false; typingSpeed = 500; }
            else { i += isDeleting ? -1 : 1; typingSpeed = isDeleting ? 75 : 150; }
            timer = setTimeout(type, typingSpeed);
        };
        timer = setTimeout(type, typingSpeed);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        const timer = setInterval(() => setCurrentIndex((prev) => (prev + 1) % reviews.length), 13000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="min-h-full bg-surface text-main relative overflow-x-hidden transition-colors duration-500">
            <SEO title="دارين السابعة | منصة تعليم عن بعد في الكويت والخليج"
                description="تعليم عن بعد في الكويت، السعودية، قطر، الإمارات، وعمان. دروس خصوصية، تحفيظ قرآن، وتأسيس للمناهج الخليجية مع أفضل المعلمين. احجز حصة تجريبية مجانية الآن."
                url="https://dareen.cloud/" image="/hero-child.png"
                breadcrumbs={[{ name: 'الرئيسية', item: '/' }]} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewSchema) }} />
            <MobileHeader />
            <main className="md:hidden pb-4 px-2 max-w-lg mx-auto relative">
                <div className="flex gap-1.5 mt-2 mb-3">
                    <a href={`https://wa.me/${requestFreeNumber}?text=${encodeURIComponent('السلام عليكم، أرغب في حجز حصة مجانية في دارين السابعة')}`}
                        target="_blank" rel="noopener noreferrer"
                        className="flex-1 bg-primary text-on-primary text-xs font-bold px-1.5 py-2 rounded-full flex items-center justify-center gap-1 transition-all hover:brightness-110 active:scale-[0.97] shadow-lg shadow-black/20">
                        <Headphones className="w-2.5 h-2.5 shrink-0" /> طلب حصة مجانية
                    </a>
                    <Link to="/books"
                        className="flex-1 bg-primary text-on-primary text-xs font-bold px-1.5 py-2 rounded-full flex items-center justify-center gap-1 transition-all hover:brightness-110 active:scale-[0.97] shadow-lg shadow-black/20">
                        <Play className="w-2.5 h-2.5 shrink-0" /> تحميل مذكرات مجانية
                    </Link>
                </div>
                <section className="relative bg-gradient-to-br from-primary-light via-primary-soft to-card dark:from-primary dark:via-primary dark:to-background rounded-card overflow-hidden mb-4 shadow-sm border border-border/50 dark:border-border">
                    {heroSlides.map((slide, i) => (
                        <div key={`hero-${i}`} className={`${heroIndex === i ? 'block' : 'hidden'} p-5`}>
                            <div className="flex items-center gap-4">
                                <div className="flex-1">
                                    <h1 className="text-lg font-black text-main dark:text-main leading-tight mb-0.5">{slide.title}{heroIndex === 0 && <span className="text-success-dark"> السابعة <BadgeCheck className="w-4 h-4 inline-block text-success-dark -mt-0.5" /></span>}</h1>
                                    <p className="text-xs font-bold text-primary dark:text-warning mb-0.5">{slide.subtitle}</p>
                                    <p className="text-micro text-muted dark:text-on-primary leading-relaxed mb-3">{slide.desc}</p>
                                    <div className="flex flex-col gap-1.5">
                                        <Link to="/courses" className="bg-surface text-main text-xs font-bold px-4 py-2 rounded-full shadow-card hover:bg-hover transition-all flex items-center justify-center gap-1 w-full">
                                            <Play className="w-3 h-3 fill-main" /> تصفح الدورات
                                        </Link>
                                        <Link to="/login" className="bg-primary text-on-primary text-xs font-bold px-4 py-2 rounded-full shadow-card hover:bg-primary-hover transition-all w-full text-center">تسجيل الدخول</Link>
                                    </div>
                                </div>
                                <div className="relative shrink-0">
                                    <div className="absolute inset-0 bg-primary-light/50 dark:bg-primary-soft rounded-full blur-xl" />
                                    <div className="relative w-[90px]">
                                        {i === 0 ? (
                                            <picture>
                                                <source srcSet="/hero-child.webp" type="image/webp" />
                                                <img src={slide.image} alt={slide.alt} width="90" height="90" className="w-full h-auto object-contain drop-shadow-lg" fetchPriority="high" />
                                            </picture>
                                        ) : (
                                            <Image src={slide.image} alt={slide.alt} className="w-full h-auto" imgClassName="object-contain drop-shadow-lg" />
                                        )}
                                    </div>
                                    <div className="flex justify-center gap-1 -mt-1">
                                        {[0, 1, 2].map((d) => (
                                            <button key={d} onClick={() => setHeroIndex(d)} aria-label={`الانتقال إلى الشريحة ${d + 1}`}
                                                className={`w-1.5 h-1.5 rounded-full transition-all ${heroIndex === d ? 'bg-primary w-3' : 'bg-muted'}`} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </section>
                <AnimateOnScroll>
                    <section className="mb-4">
                        <div className="grid grid-cols-2 gap-1.5">
                            {quickFeatures.map((f, i) => {
                                const s = featureStyles[f.variant];
                                return (
                                    <motion.div key={`hero-${i}`} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.08 }}
                                        className={`flex items-center gap-2 p-2 ${s.bg} rounded-card shadow-sm border border-border transition-all`}>
                                        <div className={`w-10 h-10 rounded-card ${s.bg} flex items-center justify-center shrink-0`}>
                                            <f.icon className={s.text} size={20} />
                                        </div>
                                        <div className="min-w-0">
                                            <span className="text-micro font-black text-main block leading-tight mb-0">{f.label}</span>
                                            <span className="text-micro text-main font-medium block leading-tight">{f.desc}</span>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </section>
                </AnimateOnScroll>
                <AnimateOnScroll>
                    <div className="mb-4"><HowToSubscribe whatsappNumber={bookFreeNumber} /></div>
                </AnimateOnScroll>
                <section className="px-1">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-black text-main">أحدث الدورات</h2>
                        <Link to="/courses" className="text-sm font-bold text-primary flex items-center gap-1">عرض الكل <ChevronLeft className="w-3.5 h-3.5" /></Link>
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                        {stages.map((cat) => (
                            <button key={cat.value} onClick={() => setActiveCategory(cat.value)}
                                className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${activeCategory === cat.value ? 'bg-primary text-on-primary shadow-md shadow-black/20' : 'bg-surface text-muted border border-border'}`}>
                                <cat.icon size={12} className={activeCategory === cat.value ? 'text-on-primary' : 'text-muted'} /> {cat.label}
                            </button>
                        ))}
                    </div>
                    <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1 no-scrollbar mt-3">
                        {getFilteredCourses(activeCategory).slice(0, 6).map((c, i) => (
                            <motion.a key={c.id}
                                href={`https://wa.me/${requestFreeNumber}?text=${encodeURIComponent(`السلام عليكم، أرغب في الاستفسار عن ${c.title}`)}`}
                                target="_blank" rel="noopener noreferrer"
                                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.35, delay: i * 0.08 }}
                                className="min-w-[180px] w-[180px] bg-surface rounded-card shadow-sm border border-border overflow-hidden shrink-0 block">
                                <div className="relative h-24 bg-surface overflow-hidden">
                                    <Image src={c.image} alt={c.title} className="h-24" />
                                    <span className={`absolute top-2 start-2 text-micro font-black px-2 py-0.5 rounded-full shadow-sm ${c.category === 'foundation' ? 'bg-success text-on-success' : c.category === 'quran' ? 'bg-warning text-on-warning' : c.category === 'gulf' ? 'bg-info text-on-info' : c.category === 'english' ? 'bg-primary text-on-primary' : 'bg-error text-on-error'}`}>
                                        {stages.find(cat => cat.value === c.category)?.label || c.category}
                                    </span>
                                </div>
                                <div className="p-3">
                                    <h3 className="text-xs font-black text-main mb-0.5">{c.title}</h3>
                                    <p className="text-xs text-muted font-medium mb-2 line-clamp-1">{c.desc}</p>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1"><Users className="w-3 h-3 text-dim" /><span className="text-xs font-bold text-muted">{c.students}</span></div>
                                        <div className="flex items-center gap-0.5"><Star className="w-3 h-3 text-warning fill-warning" /><span className="text-xs font-bold text-main">{c.rating}</span></div>
                                    </div>
                                </div>
                            </motion.a>
                        ))}
                    </div>
                </section>
                <div className="space-y-4">
                    <AnimateOnScroll animation="slideRight"><div style={{ contentVisibility: 'auto' }}><AppDownloadSection /></div></AnimateOnScroll>
                    <AnimateOnScroll><div style={{ contentVisibility: 'auto' }}><WhyChooseUs whatsappNumber={excellenceNumber} /></div></AnimateOnScroll>
                    <AnimateOnScroll><div style={{ contentVisibility: 'auto' }}><QuranSection whatsappNumber={memorizingNumber} /></div></AnimateOnScroll>
                    <div className="hidden" style={{ contentVisibility: 'auto' }}><HowItWorks whatsappNumber={bookFreeNumber} /></div>
                    <AnimateOnScroll animation="slideLeft"><div style={{ contentVisibility: 'auto' }}><Testimonials reviews={reviews} currentIndex={currentIndex} /></div></AnimateOnScroll>
                    <AnimateOnScroll><div style={{ contentVisibility: 'auto' }}><MasarSection /></div></AnimateOnScroll>
                    <AnimateOnScroll><div style={{ contentVisibility: 'auto' }}><FAQSection /></div></AnimateOnScroll>
                </div>
            </main>
            <div className="hidden md:block">
                <AnimateOnScroll animation="scaleIn" duration={0.7}><HeroSection typewriterText={typewriterText} whatsappNumber={requestFreeNumber} signupNowNumber={signupNowNumber} bannersArray={bannersArray} /></AnimateOnScroll>
                <AnimateOnScroll><StatsCounter /></AnimateOnScroll>
                <div style={{ contentVisibility: 'auto' }}><AnimateOnScroll><WhyChooseUs whatsappNumber={excellenceNumber} /></AnimateOnScroll></div>
                <div style={{ contentVisibility: 'auto' }}><AnimateOnScroll><QuranSection whatsappNumber={memorizingNumber} /></AnimateOnScroll></div>
                <div style={{ contentVisibility: 'auto' }}><AnimateOnScroll><HowItWorks whatsappNumber={bookFreeNumber} /></AnimateOnScroll></div>
                <div style={{ contentVisibility: 'auto' }}><AnimateOnScroll animation="slideLeft"><Testimonials reviews={reviews} currentIndex={currentIndex} /></AnimateOnScroll></div>
                <div style={{ contentVisibility: 'auto' }}><AnimateOnScroll><MasarSection /></AnimateOnScroll></div>
                <div style={{ contentVisibility: 'auto' }}><AnimateOnScroll><FAQSection /></AnimateOnScroll></div>
            </div>
            <div className="absolute opacity-0 pointer-events-none overflow-hidden h-0" aria-hidden="true">
                <h2>الكلمات المفتاحية - الصفحة الرئيسية دارين السابعة</h2>
                <p>منصة تعليم عن بعد, أفضل منصة تعليمية, مدرس خصوصي أونلاين, دروس خصوصية الخليج, مناهج الكويت, مناهج السعودية, تعليم عن بعد في الكويت, تعليم عن بعد في السعودية, تعليم أونلاين, حصة مجانية, تجربة مجانية, مدرس رياضيات, مدرس علوم, مدرس لغة عربية, مدرس لغة إنجليزية, تأسيس أطفال, تحفيظ قرآن, قدرات وتحصيلي, مراجعات نهائية, نتائج مضمونة, تفوق دراسي, متابعة أسبوعية, تقارير دورية, مناهج خليجية, معلمين نخبة, فصول تفاعلية, تعليم مباشر, أفضل مدرسين, دروس تقوية, تحسين المستوى, تعليم عن بعد للأطفال, تعليم أونلاين للطلاب, المدرسة الافتراضية, أفضل منصة تعليمية في الكويت, أفضل منصة تعليمية في السعودية, أفضل منصة تعليمية في الإمارات, أفضل منصة تعليمية في قطر, أفضل منصة تعليمية في عمان, أفضل منصة تعليمية في البحرين, تطبيق تعليمي, تطبيق دارين السابعة, تحميل التطبيق, حمل التطبيق الآن, دورات دارين السابعة, دورات المناهج الخليجية, دورات تقوية أونلاين, دروس خصوصية في الرياضيات, دروس خصوصية في العلوم, دروس خصوصية في اللغة العربية, دروس خصوصية في اللغة الإنجليزية, تحفيظ قرآن عن بعد, تأسيس قراءة وكتابة, شرح المنهج الكويتي, شرح المنهج السعودي, حل كتب المنهج, مذكرات تعليمية, اختبارات تجريبية, حصة تجريبية مجانية, واتساب دارين, أرقام مدرسين خصوصيين, معهد تعليمي, أكاديمية تعليمية, أفضل مدرس خصوصي في الخليج</p>
                <h3>كلمات مفتاحية طويلة - الصفحة الرئيسية</h3>
                <p>أفضل منصة تعليم عن بعد في الكويت والسعودية والخليج, مدرس خصوصي أونلاين للمناهج الخليجية, دروس تقوية في الرياضيات والعلوم واللغات, حصة تجريبية مجانية لكل المواد, تحسين المستوى الدراسي للطلاب, متابعة أسبوعية مع تقارير دورية, شرح المنهج الكويتي والسعودي والإماراتي, تحفيظ القرآن الكريم عن بعد للأطفال, تأسيس الأطفال في القراءة والكتابة والحساب, أفضل المدرسين الخصوصيين في الخليج, دروس خصوصية أونلاين بأسعار مناسبة, باقات اشتراك دروس خصوصية مخفضة, تطبيق تعليمي للمناهج الخليجية, تجربة تعليمية متكاملة من أي مكان, فصول دراسية افتراضية تفاعلية, نخبة معلمين للمناهج الخليجية, نتائج مضمونة وتحسين الدرجات, دروس خصوصية فردية أونلاين, تعليم عن بعد بجودة عالية, منصة تعليمية عربية للمناهج العربية, دورات تقوية في جميع المواد, مراجعات نهائية قبل الاختبارات, اختبارات قدرات وتحصيلي, ذاكر من البيت بأفضل المدرسين, تعليم أونلاين في الكويت والسعودية والإمارات وقطر وعمان والبحرين, واتساب دارين السابعة للاستفسار والتسجيل, احجز حصتك المجانية الآن, دورات دارين السابعة التعليمية, قصص نجاح طلاب دارين السابعة</p>
            </div>
            <footer><PublicFooter /></footer>
        </div>
    );
};
