import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AnimateOnScroll } from '../../components/ui/AnimateOnScroll';
import { useSettingsStore } from '../../store/settingsStore';
import { useAcademyName } from '../../context/AppContext';


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
import { useIsAuthenticated } from '../../context/useApp';



export const Home = () => {
    const academyName = useAcademyName();
    const adminPhone = useSettingsStore(s => s.adminPhone);
    const heroBanners = useSettingsStore(s => s.heroBanners);
    const whatsappNumbers = useSettingsStore(s => s.whatsappNumbers);
    const isAuthenticated = useIsAuthenticated();
    const defaultNumber = adminPhone.replace(/\D/g, '');

    const getNumber = (label: string): string => {
        try {
            const entries = JSON.parse(whatsappNumbers);
            const found = entries.find((e: { label: string; phone: string }) => e.label === label);
            return found ? found.phone.replace(/\D/g, '') : defaultNumber;
        } catch (e) { console.warn(e); return defaultNumber; }
    };

    const requestFreeNumber = getNumber('Ўб» Ќ’… гћ«дн…');
    const bookFreeNumber = getNumber('«Ќћ“ Ќ’ я «бгћ«дн… «б¬д');
    const memorizingNumber = getNumber('«»ѕ√ «бЌЁў «б¬д');
    const excellenceNumber = getNumber('«»ѕ√ —Ќб… «б гн“');
    const signupNowNumber = getNumber('”ћб «б¬д');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [activeCategory, setActiveCategory] = useState('all');
    const [typewriterText, setTypewriterText] = useState("");
    const [heroIndex, setHeroIndex] = useState(0);

    let bannersArray = ["", "", "", ""];
    try { if (heroBanners) bannersArray = JSON.parse(heroBanners); } catch (e) { console.warn(e); }

    useEffect(() => {
        const fullText = `гд’… ${academyName}`;
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
    }, [academyName]);

    useEffect(() => {
        const timer = setInterval(() => setCurrentIndex((prev) => (prev + 1) % reviews.length), 13000);
        return () => clearInterval(timer);
    }, [reviews.length]);

    return (
        <div className="min-h-full bg-surface dark:bg-background text-main dark:text-main relative overflow-x-hidden transition-colors duration-500">
            <SEO title="гд’…  Џбнг Џд »Џѕ Ён «бяжн  ж«бќбнћ"
                description=" Џбнг Џд »Џѕ Ён «бяжн ° «б”Џжѕн…° ёЎ—° «б≈г«—« ° жЏг«д. ѕ—ж” ќ’ж’н…°  ЌЁнў ё—¬д° ж √”н” ббгд«ећ «бќбнћн… гЏ √Ё÷б «бгЏбгнд. «Ќћ“ Ќ’…  ћ—н»н… гћ«дн… «б¬д."
                url="https://dareen.cloud/" image="/hero-child.png"
                breadcrumbs={[{ name: '«б—∆н”н…', item: '/' }]} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewSchema) }} />
            <MobileHeader />
            <main className="md:hidden pb-4 px-2 max-w-lg mx-auto relative">
                <div className="flex gap-1.5 mt-2 mb-3">
                    <a href={`https://wa.me/${requestFreeNumber}?text=${encodeURIComponent(`«б”б«г Џбняг° √—џ» Ён Ќћ“ Ќ’… гћ«дн… Ён ${academyName}`)}`}
                        target="_blank" rel="noopener noreferrer"
                        className="flex-1 bg-primary dark:bg-gradient-to-r dark:from-primary dark:to-warning text-on-primary dark:text-on-primary font-extrabold text-xs px-1.5 py-2 rounded-full flex items-center justify-center gap-1 transition-all hover:brightness-110 active:scale-[0.97] shadow-lg shadow-black/20">
                        <Headphones className="w-2.5 h-2.5 shrink-0" /> Ўб» Ќ’… гћ«дн…
                    </a>
                    <Link to="/books"
                        className="flex-1 bg-primary dark:bg-white/10 dark:text-main text-on-primary text-xs font-bold px-1.5 py-2 rounded-full border dark:border-primary/30 flex items-center justify-center gap-1 transition-all hover:brightness-110 active:scale-[0.97] shadow-lg shadow-black/20">
                        <Play className="w-2.5 h-2.5 shrink-0 dark:text-primary" />  Ќгнб г–я—«  гћ«дн…
                    </Link>
                </div>
                <section className="relative bg-gradient-to-br from-primary-light via-primary-soft to-card dark:from-surface dark:via-card dark:to-surface rounded-card overflow-hidden mb-4 shadow-sm border border-border/50 dark:border-primary/30">
                    {heroSlides.map((slide, i) => (
                        <div key={`hero-${i}`} className={`${heroIndex === i ? 'block' : 'hidden'} p-5`}>
                            <div className="flex items-center gap-4">
                                <div className="flex-1">
                                    <h1 className="text-lg font-black text-main dark:text-main leading-tight mb-0.5">{slide.title}{heroIndex === 0 && <span className="text-success-dark dark:text-primary"> «б”«»Џ… <BadgeCheck className="w-4 h-4 inline-block text-success-dark dark:text-primary -mt-0.5" /></span>}</h1>
                                    <p className="text-xs font-bold text-primary dark:text-primary mb-0.5">{slide.subtitle}</p>
                                    <p className="text-micro text-muted dark:text-muted leading-relaxed mb-3">{slide.desc}</p>
                                    <div className="flex flex-col gap-1.5">
                                        <Link to="/courses" className="bg-surface dark:bg-white/10 text-main dark:text-main border dark:border-primary/30 text-xs font-bold px-4 py-2 rounded-full shadow-card hover:bg-hover transition-all flex items-center justify-center gap-1 w-full">
                                            <Play className="w-3 h-3 fill-main dark:fill-primary dark:text-primary" />  ’ЁЌ «бѕж—« 
                                        </Link>
                                        <Link to={isAuthenticated ? "/dashboard" : "/login"} className="bg-primary dark:bg-gradient-to-r dark:from-primary dark:to-warning text-on-primary dark:text-on-primary font-extrabold text-xs px-4 py-2 rounded-full shadow-card transition-all w-full text-center">{isAuthenticated ? 'бжЌ… «б Ќяг' : ' ”ћнб «бѕќжб'}</Link>
                                    </div>
                                </div>
                                <div className="relative shrink-0">
                                    <div className="absolute inset-0 bg-primary-light/50 dark:bg-primary/10 rounded-full blur-xl" />
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
                                            <button key={d} onClick={() => setHeroIndex(d)} aria-label={`«б«д ё«б ≈бм «б‘—нЌ… ${d + 1}`}
                                                className={`w-1.5 h-1.5 rounded-full transition-all ${heroIndex === d ? 'bg-primary dark:bg-primary w-3' : 'bg-muted dark:bg-zinc-600'}`} />
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
                                        className={`flex items-center gap-2 p-2 ${s.bg} dark:bg-card rounded-card shadow-sm border border-border dark:border-primary/20 transition-all`}>
                                        <div className={`w-10 h-10 rounded-card ${s.bg} dark:bg-primary/15 flex items-center justify-center shrink-0`}>
                                            <f.icon className={`${s.text} dark:text-primary`} size={20} />
                                        </div>
                                        <div className="min-w-0">
                                            <span className="text-micro font-black text-main dark:text-main block leading-tight mb-0">{f.label}</span>
                                            <span className="text-micro text-main dark:text-muted font-medium block leading-tight">{f.desc}</span>
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
                        <h2 className="text-lg font-black text-main dark:text-main">√ЌѕЋ «бѕж—« </h2>
                        <Link to="/courses" className="text-sm font-bold text-primary dark:text-primary flex items-center gap-1">Џ—÷ «бяб <ChevronLeft className="w-3.5 h-3.5" /></Link>
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                        {stages.map((cat) => (
                            <button key={cat.value} onClick={() => setActiveCategory(cat.value)}
                                className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${activeCategory === cat.value ? 'bg-primary dark:bg-gradient-to-r dark:from-primary dark:to-warning text-on-primary dark:text-on-primary shadow-md shadow-black/20' : 'bg-surface dark:bg-hover text-muted dark:text-muted border border-border dark:border-primary/30'}`}>
                                <cat.icon size={12} className={activeCategory === cat.value ? 'text-on-primary dark:text-on-primary' : 'text-muted dark:text-primary'} /> {cat.label}
                            </button>
                        ))}
                    </div>
                    <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1 no-scrollbar mt-3">
                        {getFilteredCourses(activeCategory).slice(0, 6).map((c, i) => (
                            <motion.a key={c.id}
                                href={`https://wa.me/${requestFreeNumber}?text=${encodeURIComponent(`«б”б«г Џбняг° √—џ» Ён «б«” Ё”«— Џд ${c.title}`)}`}
                                target="_blank" rel="noopener noreferrer"
                                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.35, delay: i * 0.08 }}
                                className="min-w-[180px] w-[180px] bg-surface dark:bg-card rounded-card shadow-sm border border-border dark:border-primary/25 overflow-hidden shrink-0 block">
                                <div className="relative h-24 bg-surface dark:bg-background overflow-hidden">
                                    <Image src={c.image} alt={c.title} className="h-24" />
                                    <span className={`absolute top-2 start-2 text-micro font-black px-2 py-0.5 rounded-full shadow-sm ${c.category === 'foundation' ? 'bg-success text-on-success' : c.category === 'quran' ? 'bg-warning dark:bg-primary text-on-warning dark:text-on-primary' : c.category === 'gulf' ? 'bg-info text-on-info' : c.category === 'english' ? 'bg-primary dark:bg-primary text-on-primary dark:text-on-primary' : 'bg-error text-on-error'}`}>
                                        {stages.find(cat => cat.value === c.category)?.label || c.category}
                                    </span>
                                </div>
                                <div className="p-3">
                                    <h3 className="text-xs font-black text-main dark:text-main mb-0.5">{c.title}</h3>
                                    <p className="text-xs text-muted dark:text-muted font-medium mb-2 line-clamp-1">{c.desc}</p>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1"><Users className="w-3 h-3 text-dim dark:text-muted" /><span className="text-xs font-bold text-muted dark:text-muted">{c.students}</span></div>
                                        <div className="flex items-center gap-0.5"><Star className="w-3 h-3 text-warning dark:text-primary fill-warning dark:fill-primary" /><span className="text-xs font-bold text-main dark:text-main">{c.rating}</span></div>
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
                    <AnimateOnScroll><div style={{ contentVisibility: 'auto' }}><HowItWorks whatsappNumber={bookFreeNumber} /></div></AnimateOnScroll>
                    <AnimateOnScroll animation="slideLeft"><div style={{ contentVisibility: 'auto' }}><Testimonials reviews={reviews} currentIndex={currentIndex} /></div></AnimateOnScroll>
                    <AnimateOnScroll><div style={{ contentVisibility: 'auto' }}><MasarSection /></div></AnimateOnScroll>
                    <AnimateOnScroll><div style={{ contentVisibility: 'auto' }}><FAQSection /></div></AnimateOnScroll>
                </div>
            </main>
            <div className="hidden md:block">
                <AnimateOnScroll animation="scaleIn" duration={0.7}><HeroSection typewriterText={typewriterText} signupNowNumber={signupNowNumber} bannersArray={bannersArray} /></AnimateOnScroll>
                <AnimateOnScroll><StatsCounter /></AnimateOnScroll>
                <div style={{ contentVisibility: 'auto' }}><AnimateOnScroll><WhyChooseUs whatsappNumber={excellenceNumber} /></AnimateOnScroll></div>
                <div style={{ contentVisibility: 'auto' }}><AnimateOnScroll><QuranSection whatsappNumber={memorizingNumber} /></AnimateOnScroll></div>
                <div style={{ contentVisibility: 'auto' }}><AnimateOnScroll><HowItWorks whatsappNumber={bookFreeNumber} /></AnimateOnScroll></div>
                <div style={{ contentVisibility: 'auto' }}><AnimateOnScroll animation="slideLeft"><Testimonials reviews={reviews} currentIndex={currentIndex} /></AnimateOnScroll></div>
                <div style={{ contentVisibility: 'auto' }}><AnimateOnScroll><MasarSection /></AnimateOnScroll></div>
                <div style={{ contentVisibility: 'auto' }}><AnimateOnScroll><FAQSection /></AnimateOnScroll></div>
            </div>
            <div className="absolute opacity-0 pointer-events-none overflow-hidden h-0" aria-hidden="true">
                <h2>«бябг«  «бгЁ «Ќн… - «б’ЁЌ… «б—∆н”н… ѕ«—нд «б”«»Џ…</h2>
                <p>гд’…  Џбнг Џд »Џѕ, √Ё÷б гд’…  Џбнгн…, гѕ—” ќ’ж’н √ждб«нд, ѕ—ж” ќ’ж’н… «бќбнћ, гд«ећ «бяжн , гд«ећ «б”Џжѕн…,  Џбнг Џд »Џѕ Ён «бяжн ,  Џбнг Џд »Џѕ Ён «б”Џжѕн…,  Џбнг √ждб«нд, Ќ’… гћ«дн…,  ћ—»… гћ«дн…, гѕ—” —н«÷н« , гѕ—” Џбжг, гѕ—” бџ… Џ—»н…, гѕ—” бџ… ≈дћбн“н…,  √”н” √ЎЁ«б,  ЌЁнў ё—¬д, ёѕ—«  ж Ќ’нбн, г—«ћЏ«  де«∆н…, д «∆ћ г÷гжд…,  Ёжё ѕ—«”н, г «»Џ… √”»жЏн…,  ё«—н— ѕж—н…, гд«ећ ќбнћн…, гЏбгнд дќ»…, Ё’жб  Ё«Џбн…,  Џбнг г»«‘—, √Ё÷б гѕ—”нд, ѕ—ж”  ёжн…,  Ќ”нд «бг” жм,  Џбнг Џд »Џѕ бб√ЎЁ«б,  Џбнг √ждб«нд ббЎб«», «бгѕ—”… «б«Ё —«÷н…, √Ё÷б гд’…  Џбнгн… Ён «бяжн , √Ё÷б гд’…  Џбнгн… Ён «б”Џжѕн…, √Ё÷б гд’…  Џбнгн… Ён «б≈г«—« , √Ё÷б гд’…  Џбнгн… Ён ёЎ—, √Ё÷б гд’…  Џбнгн… Ён Џг«д, √Ё÷б гд’…  Џбнгн… Ён «б»Ќ—нд,  Ў»нё  Џбнгн,  Ў»нё ѕ«—нд «б”«»Џ…,  Ќгнб «б Ў»нё, Ќгб «б Ў»нё «б¬д, ѕж—«  ѕ«—нд «б”«»Џ…, ѕж—«  «бгд«ећ «бќбнћн…, ѕж—«   ёжн… √ждб«нд, ѕ—ж” ќ’ж’н… Ён «б—н«÷н« , ѕ—ж” ќ’ж’н… Ён «бЏбжг, ѕ—ж” ќ’ж’н… Ён «ббџ… «бЏ—»н…, ѕ—ж” ќ’ж’н… Ён «ббџ… «б≈дћбн“н…,  ЌЁнў ё—¬д Џд »Џѕ,  √”н” ё—«Ѕ… жя «»…, ‘—Ќ «бгдећ «бяжн н, ‘—Ќ «бгдећ «б”Џжѕн, Ќб я » «бгдећ, г–я—«   Џбнгн…, «ќ »«—«   ћ—н»н…, Ќ’…  ћ—н»н… гћ«дн…, ж« ”«» ѕ«—нд, √—ё«г гѕ—”нд ќ’ж’ннд, гЏеѕ  Џбнгн, √я«ѕнгн…  Џбнгн…, √Ё÷б гѕ—” ќ’ж’н Ён «бќбнћ</p>
                <h3>ябг«  гЁ «Ќн… Ўжнб… - «б’ЁЌ… «б—∆н”н…</h3>
                <p>√Ё÷б гд’…  Џбнг Џд »Џѕ Ён «бяжн  ж«б”Џжѕн… ж«бќбнћ, гѕ—” ќ’ж’н √ждб«нд ббгд«ећ «бќбнћн…, ѕ—ж”  ёжн… Ён «б—н«÷н«  ж«бЏбжг ж«ббџ« , Ќ’…  ћ—н»н… гћ«дн… бяб «бгж«ѕ,  Ќ”нд «бг” жм «бѕ—«”н ббЎб«», г «»Џ… √”»жЏн… гЏ  ё«—н— ѕж—н…, ‘—Ќ «бгдећ «бяжн н ж«б”Џжѕн ж«б≈г«—« н,  ЌЁнў «бё—¬д «бя—нг Џд »Џѕ бб√ЎЁ«б,  √”н” «б√ЎЁ«б Ён «бё—«Ѕ… ж«бя «»… ж«бЌ”«», √Ё÷б «бгѕ—”нд «бќ’ж’ннд Ён «бќбнћ, ѕ—ж” ќ’ж’н… √ждб«нд »√”Џ«— гд«”»…, »«ё«  «‘ —«я ѕ—ж” ќ’ж’н… гќЁ÷…,  Ў»нё  Џбнгн ббгд«ећ «бќбнћн…,  ћ—»…  Џбнгн… г я«гб… гд √н гя«д, Ё’жб ѕ—«”н… «Ё —«÷н…  Ё«Џбн…, дќ»… гЏбгнд ббгд«ећ «бќбнћн…, д «∆ћ г÷гжд… ж Ќ”нд «бѕ—ћ« , ѕ—ж” ќ’ж’н… Ё—ѕн… √ждб«нд,  Џбнг Џд »Џѕ »ћжѕ… Џ«бн…, гд’…  Џбнгн… Џ—»н… ббгд«ећ «бЏ—»н…, ѕж—«   ёжн… Ён ћгнЏ «бгж«ѕ, г—«ћЏ«  де«∆н… ё»б «б«ќ »«—« , «ќ »«—«  ёѕ—«  ж Ќ’нбн, –«я— гд «б»н  »√Ё÷б «бгѕ—”нд,  Џбнг √ждб«нд Ён «бяжн  ж«б”Џжѕн… ж«б≈г«—«  жёЎ— жЏг«д ж«б»Ќ—нд, ж« ”«» ѕ«—нд «б”«»Џ… бб«” Ё”«— ж«б ”ћнб, «Ќћ“ Ќ’ я «бгћ«дн… «б¬д, ѕж—«  ѕ«—нд «б”«»Џ… «б Џбнгн…, ё’’ дћ«Ќ Ўб«» ѕ«—нд «б”«»Џ…</p>
            </div>
            <footer><PublicFooter /></footer>
        </div>
    );
};
