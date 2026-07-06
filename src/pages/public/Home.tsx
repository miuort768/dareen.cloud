import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AnimateOnScroll } from '../../components/ui/AnimateOnScroll';
import { useSettingsStore } from '../../store/settingsStore';
import { SEO } from '../../components/SEO';
import { MobileHeader } from '../../components/public/MobileHeader';
import { PublicFooter } from '../../components/public/PublicFooter';
import { MasarSection } from '../../components/public/MasarSection';
import { COURSES, CATEGORIES } from '../../data/courses';
import { WhyChooseUs } from './components/WhyChooseUs';
import { QuranSection } from './components/QuranSection';
import { HowItWorks } from './components/HowItWorks';
import { Testimonials } from './components/Testimonials';
import { FAQSection } from './components/FAQSection';
import { HeroSection } from './components/HeroSection';
import { HowToSubscribe } from './components/HowToSubscribe';
import { AppDownloadSection } from './components/AppDownloadSection';
import { StatsCounter } from './components/StatsCounter';
import {
  Play, Trophy,
  Video, Star, Download, GraduationCap, Headphones, BadgeCheck,
  ChevronLeft, Users, Gift
} from 'lucide-react';

type FeatureVariant = 'primary' | 'info' | 'success' | 'warning';

const featureStyles: Record<FeatureVariant, { bg: string; text: string }> = {
  primary: { bg: 'bg-primary-soft', text: 'text-primary' },
  info: { bg: 'bg-info-soft', text: 'text-info' },
  success: { bg: 'bg-success-soft', text: 'text-success' },
  warning: { bg: 'bg-warning-soft', text: 'text-warning-dark' },
};

const quickFeatures: { icon: typeof Gift; label: string; desc: string; variant: FeatureVariant }[] = [
  { icon: Gift, label: 'حصة مجانية تجريبية', desc: 'لك حصة مجانية في كل مادة', variant: 'primary' },
  { icon: Trophy, label: 'مناهج خليجية', desc: 'كويتي، سعودي، إماراتي، قطري وعماني', variant: 'info' },
  { icon: Video, label: 'تحفيظ قرآن', desc: 'تجويد وإتقان مع قراء مجازين', variant: 'success' },
  { icon: Star, label: 'متابعة دورية', desc: 'تقارير أسبوعية لمتابعة المستوى', variant: 'warning' },
];

const getFilteredCourses = (category: string) =>
  category === 'all' ? COURSES : COURSES.filter(c => c.category === category);

const heroSlides = [
  { title: 'منصة دارين', subtitle: 'دروس خصوصية فردية اونلاين', desc: 'أفضل المعلمين وأحدث التقنيات لتفوق أبنائكم.', image: '/hero-child.png', alt: 'طفل يدرس على منصة دارين السابعة للتعليم عن بعد في الكويت' },
  { title: 'دورات تفاعلية', subtitle: 'تعلم بأحدث الأساليب', desc: 'دروس خصوصية تفاعلية في جميع المواد للمناهج الكويتية والخليجية.', image: '/teacher-foundation.png', alt: 'معلم خصوصي يشرح درس أونلاين لطالب في الكويت' },
  { title: 'مستقبل مشرق', subtitle: 'مع نخبة المعلمين', desc: 'كوادر تعليمية متميزة لضمان أفضل النتائج في الرياضيات والعلوم واللغات.', image: '/dareen_books_portal_v3.png', alt: 'مكتبة دارين السابعة التعليمية - كتب ومواد دراسية للمناهج الخليجية' },
];

const stages = CATEGORIES;

export const Home = () => {
  const { adminPhone, heroBanners, whatsappNumbers } = useSettingsStore();
  const defaultNumber = adminPhone.replace(/\D/g, '');

  const getNumber = (label: string): string => {
    try {
      const entries = JSON.parse(whatsappNumbers);
      const found = entries.find((e: { label: string; phone: string }) => e.label === label);
      return found ? found.phone.replace(/\D/g, '') : defaultNumber;
    } catch {
      return defaultNumber;
    }
  };

  const requestFreeNumber = getNumber('طلب حصة مجانية');
  const bookFreeNumber = getNumber('احجز حصتك المجانية الآن');
  const memorizingNumber = getNumber('ابدأ الحفظ الآن');
  const excellenceNumber = getNumber('ابدأ رحلة التميز');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeCategory, setActiveCategory] = useState('all');
  const [typewriterText, setTypewriterText] = useState("");
  const [heroIndex, setHeroIndex] = useState(0);

  let bannersArray = ["", "", "", ""];
  try {
    if (heroBanners) {
      bannersArray = JSON.parse(heroBanners);
    }
  } catch { /* ignore */ }

  const reviews = [
    { name: "أم راشد", role: "ولية أمر", content: "مشكورين وايد على جهودكم، عيالي وايد تحسن مستواهم من عقب ما سجلوا معاكم. صراحة فرق كبير بالأداء المدرسي.", avatar: "/images/avatars/mom1.png" },
    { name: "أم ناصر", role: "ولية أمر", content: "المعهد يبيض الويه، والمدرسين ما يقصرون مع الطلبة. ولدي صار يحب يدرس ويشارك بالحصة بكل حماس.", avatar: "/images/avatars/mom2.png" },
    { name: "أم وضحة", role: "ولية أمر", content: "طريقة التدريس وايد حلوة وتشد الياهل، بنتي كانت تمل من الدراسة بس الحين صارت هي اللي تذكرني بموعد الحصة.", avatar: "/images/avatars/mom3.png" },
    { name: "أبو فهد", role: "ولي أمر", content: "والله يا جماعة دارين السابعة غير، عيالي استفادوا حيل وصاروا يحبون الحصة. الله يبيض وجيهكم وما قصرتوا صراحة على هالمجهود.", avatar: "/images/avatars/mom1.png" },
    { name: "أم جاسم", role: "ولية أمر", content: "الله يعطيكم العافية على المتابعة الدورية، صج تهتمون بأدق التفاصيل والتقارير اللي توصلنا تريح البال وتطمنا على عيالنا.", avatar: "/images/avatars/mom1.png" },
    { name: "أم دلال", role: "ولية أمر", content: "أحسن قرار خذيته إني سجلت عيالي بدارين السابعة. المدرسين قمة في الأخلاق والتعامل، ويوصلون المعلومة بسلاسة.", avatar: "/images/avatars/mom2.png" },
    { name: "أم ريم", role: "ولية أمر", content: "مشكورة وايد إدارة المعهد على هذا المستوى الراقي. التأسيس عندكم وايد قوي وساعد عيالي يتخطون وايد صعوبات.", avatar: "/images/avatars/mom3.png" }
  ];

  useEffect(() => {
    const fullText = "منصة دارين السابعة";
    let i = 0;
    let isDeleting = false;
    let typingSpeed = 150;

    const type = () => {
      const currentText = isDeleting
        ? fullText.substring(0, i - 1)
        : fullText.substring(0, i + 1);
      setTypewriterText(currentText);

      if (!isDeleting && i === fullText.length) {
        isDeleting = true;
        typingSpeed = 2000;
      } else if (isDeleting && i === 0) {
        isDeleting = false;
        typingSpeed = 500;
      } else {
        i += isDeleting ? -1 : 1;
        typingSpeed = isDeleting ? 75 : 150;
      }
      setTimeout(type, typingSpeed);
    };

    const timer = setTimeout(type, typingSpeed);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % reviews.length);
    }, 13000);
    return () => clearInterval(timer);
  }, [reviews.length]);

  const reviewSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'دارين السابعة - منصة تعليم عن بعد',
    description: 'منصة تعليم عن بعد رائدة في الكويت والخليج. دروس خصوصية، تحفيظ قرآن، وتأسيس للمناهج الخليجية.',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      bestRating: '5',
      ratingCount: '120',
      reviewCount: reviews.length.toString(),
    },
    review: reviews.map(r => ({
      '@type': 'Review',
      author: { '@type': 'Person', name: r.name },
      reviewBody: r.content,
      reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
    })),
  };

  return (
    <div className="min-h-full bg-surface text-main relative overflow-x-hidden transition-colors duration-500">
      <SEO title="دارين السابعة | منصة تعليم عن بعد في الكويت والخليج" description="تعليم عن بعد في الكويت، السعودية، قطر، الإمارات، وعمان. دروس خصوصية، تحفيظ قرآن، وتأسيس للمناهج الخليجية مع أفضل المعلمين. احجز حصة تجريبية مجانية الآن." url="https://dareen.cloud/" image="/hero-child.png" breadcrumbs={[{ name: 'الرئيسية', item: '/' }]} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewSchema) }} />
      <MobileHeader />

      {/* ─── Mobile App Content ─── */}
      <main className="md:hidden pb-4 px-2 max-w-lg mx-auto relative">

        {/* Mobile Nav Buttons */}
        <div className="flex gap-1.5 mt-2 mb-3">
          <a href={`https://wa.me/${requestFreeNumber}?text=${encodeURIComponent('السلام عليكم، أرغب في حجز حصة مجانية في دارين السابعة')}`} target="_blank" rel="noopener noreferrer" className="flex-1 bg-primary text-on-primary text-xs font-bold px-1.5 py-2 rounded-full flex items-center justify-center gap-1 transition-all hover:brightness-110 active:scale-[0.97] shadow-lg shadow-black/20">
            <Headphones className="w-2.5 h-2.5 shrink-0" />
            طلب حصة مجانية
          </a>
          <Link to="/books" className="flex-1 bg-primary text-on-primary text-xs font-bold px-1.5 py-2 rounded-full flex items-center justify-center gap-1 transition-all hover:brightness-110 active:scale-[0.97] shadow-lg shadow-black/20">
            <Download className="w-2.5 h-2.5 shrink-0" />
            تحميل مذكرات مجانية
          </Link>
        </div>

        {/* Hero Carousel */}
        <section className="relative bg-gradient-to-br from-primary-light via-primary-soft to-card dark:from-[var(--bg-primary)] dark:via-[var(--bg-primary)] dark:to-[var(--bg-background)] rounded-card overflow-hidden mb-4 shadow-sm border border-border/50 dark:border-border">
          {heroSlides.map((slide, i) => (
            <div key={i} className={`${heroIndex === i ? 'block' : 'hidden'} p-5`}>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                   <h1 className="text-lg font-black text-main leading-tight mb-0.5">{slide.title}{heroIndex === 0 && <span className="text-info"> السابعة <BadgeCheck className="w-4 h-4 inline-block text-info -mt-0.5" /></span>}</h1>
                  <p className="text-xs font-bold text-primary mb-0.5">{slide.subtitle}</p>
                  <p className="text-xs text-muted leading-relaxed mb-3">{slide.desc}</p>
                  <div className="flex flex-col gap-1.5">
                    <Link to="/courses" className="bg-surface text-main text-xs font-bold px-4 py-2 rounded-full shadow-card hover:bg-hover transition-all flex items-center justify-center gap-1 w-full">
                      <Play className="w-3 h-3 fill-main" />
                      تصفح الدورات
                    </Link>
                    <Link to="/login" className="bg-primary text-on-primary text-xs font-bold px-4 py-2 rounded-full shadow-card hover:bg-primary-hover transition-all w-full text-center">
                      تسجيل الدخول
                    </Link>
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
                      <img src={slide.image} alt={slide.alt} width="90" height="90" className="w-full h-auto object-contain drop-shadow-lg" loading="lazy" />
                    )}
                  </div>
                  <div className="flex justify-center gap-1 -mt-1">
                    {[0, 1, 2].map((d) => (
                      <button key={d} onClick={() => setHeroIndex(d)} aria-label={`الانتقال إلى الشريحة ${d + 1}`} className={`w-1.5 h-1.5 rounded-full transition-all ${heroIndex === d ? 'bg-primary w-3' : 'bg-muted'}`} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* Quick Features */}
        <AnimateOnScroll>
          <section className="mb-4">
            <div className="grid grid-cols-2 gap-1.5">
              {quickFeatures.map((f, i) => {
                const s = featureStyles[f.variant];
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.08 }}
                    className={`flex items-center gap-2 p-2 ${s.bg} rounded-card shadow-sm border border-border transition-all`}
                  >
                    <div className={`w-10 h-10 rounded-card ${s.bg} flex items-center justify-center shrink-0`}>
                      <f.icon className={s.text} size={20} />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-black text-main block leading-tight mb-0">{f.label}</span>
                      <span className="text-micro text-muted font-medium block leading-tight">{f.desc}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>
        </AnimateOnScroll>

        {/* How to Subscribe */}
        <AnimateOnScroll>
          <div className="mb-4">
              <HowToSubscribe whatsappNumber={bookFreeNumber} />
          </div>
        </AnimateOnScroll>

        {/* Latest Courses */}
        <section className="px-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-black text-main">أحدث الدورات</h2>
            <Link to="/courses" className="text-sm font-bold text-primary flex items-center gap-1">
              عرض الكل
              <ChevronLeft className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Stage Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {stages.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeCategory === cat.value
                    ? 'bg-primary text-on-primary shadow-md shadow-black/20'
                    : 'bg-surface text-muted border border-border'
                }`}
              >
                <cat.icon size={12} className={activeCategory === cat.value ? 'text-on-primary' : 'text-muted'} />
                {cat.label}
              </button>
            ))}
          </div>

          {/* Course Cards */}
          <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1 no-scrollbar mt-3">
            {getFilteredCourses(activeCategory).slice(0, 6).map((c, i) => (
              <motion.a
                key={c.id}
                href={`https://wa.me/${requestFreeNumber}?text=${encodeURIComponent(`السلام عليكم، أرغب في الاستفسار عن ${c.title}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.08 }}
                className="min-w-[180px] w-[180px] bg-surface rounded-card shadow-sm border border-border overflow-hidden shrink-0 block"
              >
                <div className="relative h-24 bg-surface overflow-hidden">
                  <img
                    src={c.image}
                    alt={c.title}
                    width="180"
                    height="96"
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                  <span className={`absolute top-2 right-2 text-micro font-black px-2 py-0.5 rounded-full shadow-sm ${
                    c.category === 'foundation' ? 'bg-success text-on-success' :
                    c.category === 'quran' ? 'bg-warning text-on-warning' :
                    c.category === 'gulf' ? 'bg-info text-on-info' :
                    c.category === 'english' ? 'bg-primary text-on-primary' : 'bg-error text-on-error'
                  }`}>
                    {CATEGORIES.find(cat => cat.value === c.category)?.label || c.category}
                  </span>
                </div>
                <div className="p-3">
                  <h3 className="text-xs font-black text-main mb-0.5">{c.title}</h3>
                  <p className="text-xs text-muted font-medium mb-2 line-clamp-1">{c.desc}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-dim" />
                      <span className="text-xs font-bold text-muted">{c.students}</span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      <Star className="w-3 h-3 text-warning fill-warning" />
                      <span className="text-xs font-bold text-main">{c.rating}</span>
                    </div>
                  </div>
                </div>
              </motion.a>
            ))}
          </div>
        </section>


        {/* Existing Sections (restyled layout) */}
        <div className="space-y-4">
          <AnimateOnScroll animation="slideRight">
            <div style={{ contentVisibility: 'auto' }}>
              <AppDownloadSection />
            </div>
          </AnimateOnScroll>
          <AnimateOnScroll>
            <div style={{ contentVisibility: 'auto' }}>
              <WhyChooseUs whatsappNumber={excellenceNumber} />
            </div>
          </AnimateOnScroll>
          <AnimateOnScroll>
            <div style={{ contentVisibility: 'auto' }}>
              <QuranSection whatsappNumber={memorizingNumber} />
            </div>
          </AnimateOnScroll>
          <div className="hidden" style={{ contentVisibility: 'auto' }}>
            <HowItWorks whatsappNumber={bookFreeNumber} />
          </div>
          <AnimateOnScroll animation="slideLeft">
            <div style={{ contentVisibility: 'auto' }}>
              <Testimonials reviews={reviews} currentIndex={currentIndex} />
            </div>
          </AnimateOnScroll>
          <AnimateOnScroll>
            <div style={{ contentVisibility: 'auto' }}>
              <MasarSection />
            </div>
          </AnimateOnScroll>
          <AnimateOnScroll>
            <div style={{ contentVisibility: 'auto' }}>
              <FAQSection />
            </div>
          </AnimateOnScroll>
        </div>
      </main>

      {/* ─── Desktop content (unchanged) ─── */}
      <div className="hidden md:block">
        <AnimateOnScroll animation="scaleIn" duration={0.7}>
          <HeroSection typewriterText={typewriterText} whatsappNumber={requestFreeNumber} bannersArray={bannersArray} />
        </AnimateOnScroll>
        <AnimateOnScroll>
          <StatsCounter />
        </AnimateOnScroll>
        <div style={{ contentVisibility: 'auto' }}>
          <AnimateOnScroll>
            <WhyChooseUs whatsappNumber={excellenceNumber} />
          </AnimateOnScroll>
        </div>
        <div style={{ contentVisibility: 'auto' }}>
          <AnimateOnScroll>
            <QuranSection whatsappNumber={memorizingNumber} />
          </AnimateOnScroll>
        </div>
        <div style={{ contentVisibility: 'auto' }}>
          <AnimateOnScroll>
            <HowItWorks whatsappNumber={bookFreeNumber} />
          </AnimateOnScroll>
        </div>
        <div style={{ contentVisibility: 'auto' }}>
          <AnimateOnScroll animation="slideLeft">
            <Testimonials reviews={reviews} currentIndex={currentIndex} />
          </AnimateOnScroll>
        </div>
        <div style={{ contentVisibility: 'auto' }}>
          <AnimateOnScroll>
            <MasarSection />
          </AnimateOnScroll>
        </div>
        <div style={{ contentVisibility: 'auto' }}>
          <AnimateOnScroll>
            <FAQSection />
          </AnimateOnScroll>
        </div>
      </div>

      {/* Hidden keywords for homepage - دارين السابعة */}
      <div className="absolute opacity-0 pointer-events-none overflow-hidden h-0" aria-hidden="true">
        <h2>الكلمات المفتاحية - الصفحة الرئيسية دارين السابعة</h2>
        <p>منصة تعليم عن بعد, أفضل منصة تعليمية, مدرس خصوصي أونلاين, دروس خصوصية الخليج, مناهج الكويت, مناهج السعودية, تعليم عن بعد في الكويت, تعليم عن بعد في السعودية, تعليم أونلاين, حصة مجانية, تجربة مجانية, مدرس رياضيات, مدرس علوم, مدرس لغة عربية, مدرس لغة إنجليزية, تأسيس أطفال, تحفيظ قرآن, قدرات وتحصيلي, مراجعات نهائية, نتائج مضمونة, تفوق دراسي, متابعة أسبوعية, تقارير دورية, مناهج خليجية, معلمين نخبة, فصول تفاعلية, تعليم مباشر, أفضل مدرسين, دروس تقوية, تحسين المستوى, تعليم عن بعد للأطفال, تعليم أونلاين للطلاب, المدرسة الافتراضية, أفضل منصة تعليمية في الكويت, أفضل منصة تعليمية في السعودية, أفضل منصة تعليمية في الإمارات, أفضل منصة تعليمية في قطر, أفضل منصة تعليمية في عمان, أفضل منصة تعليمية في البحرين, تطبيق تعليمي, تطبيق دارين السابعة, تحميل التطبيق, حمل التطبيق الآن, دورات دارين السابعة, دورات المناهج الخليجية, دورات تقوية أونلاين, دروس خصوصية في الرياضيات, دروس خصوصية في العلوم, دروس خصوصية في اللغة العربية, دروس خصوصية في اللغة الإنجليزية, تحفيظ قرآن عن بعد, تأسيس قراءة وكتابة, شرح المنهج الكويتي, شرح المنهج السعودي, حل كتب المنهج, مذكرات تعليمية, اختبارات تجريبية, حصة تجريبية مجانية, واتساب دارين, أرقام مدرسين خصوصيين, معهد تعليمي, أكاديمية تعليمية, أفضل مدرس خصوصي في الخليج</p>
        <h3>كلمات مفتاحية طويلة - الصفحة الرئيسية</h3>
        <p>أفضل منصة تعليم عن بعد في الكويت والسعودية والخليج, مدرس خصوصي أونلاين للمناهج الخليجية, دروس تقوية في الرياضيات والعلوم واللغات, حصة تجريبية مجانية لكل المواد, تحسين المستوى الدراسي للطلاب, متابعة أسبوعية مع تقارير دورية, شرح المنهج الكويتي والسعودي والإماراتي, تحفيظ القرآن الكريم عن بعد للأطفال, تأسيس الأطفال في القراءة والكتابة والحساب, أفضل المدرسين الخصوصيين في الخليج, دروس خصوصية أونلاين بأسعار مناسبة, باقات اشتراك دروس خصوصية مخفضة, تطبيق تعليمي للمناهج الخليجية, تجربة تعليمية متكاملة من أي مكان, فصول دراسية افتراضية تفاعلية, نخبة معلمين للمناهج الخليجية, نتائج مضمونة وتحسين الدرجات, دروس خصوصية فردية أونلاين, تعليم عن بعد بجودة عالية, منصة تعليمية عربية للمناهج العربية, دورات تقوية في جميع المواد, مراجعات نهائية قبل الاختبارات, اختبارات قدرات وتحصيلي, ذاكر من البيت بأفضل المدرسين, تعليم أونلاين في الكويت والسعودية والإمارات وقطر وعمان والبحرين, واتساب دارين السابعة للاستفسار والتسجيل, احجز حصتك المجانية الآن, دورات دارين السابعة التعليمية, قصص نجاح طلاب دارين السابعة</p>
      </div>

      <footer>
        <PublicFooter />
      </footer>

      {/* Bottom Nav removed */}
    </div>
  );
};
