import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
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
import {
  Play, BookOpen, Trophy,
  Video, Star,
  ChevronLeft, Users
} from 'lucide-react';

const quickFeatures = [
  { icon: BookOpen, label: 'دروس خصوصية أونلاين', desc: 'مع نخبة معلمين للمناهج الخليجية', color: 'text-violet-600', colorDark: 'dark:text-violet-400', bg: 'bg-violet-50', bgDark: 'dark:bg-violet-900/30', border: 'border-violet-100', borderDark: 'dark:border-violet-900/50' },
  { icon: Trophy, label: 'مناهج خليجية', desc: 'كويتي، سعودي، إماراتي، قطري وعماني', color: 'text-sky-600', colorDark: 'dark:text-sky-400', bg: 'bg-sky-50', bgDark: 'dark:bg-sky-900/30', border: 'border-sky-100', borderDark: 'dark:border-sky-900/50' },
  { icon: Video, label: 'تحفيظ قرآن عن بعد', desc: 'تجويد وإتقان مع قراء مجازين', color: 'text-emerald-600', colorDark: 'dark:text-emerald-400', bg: 'bg-emerald-50', bgDark: 'dark:bg-emerald-900/30', border: 'border-emerald-100', borderDark: 'dark:border-emerald-900/50' },
  { icon: Star, label: 'متابعة دورية', desc: 'تقارير أسبوعية لمتابعة المستوى', color: 'text-amber-600', colorDark: 'dark:text-amber-400', bg: 'bg-amber-50', bgDark: 'dark:bg-amber-900/30', border: 'border-amber-100', borderDark: 'dark:border-amber-900/50' },
];

const getFilteredCourses = (category: string) =>
  category === 'all' ? COURSES : COURSES.filter(c => c.category === category);

const heroSlides = [
  { title: 'منصة دارين', subtitle: 'دروس خصوصية أونلاين', desc: 'أفضل المعلمين وأحدث التقنيات لتفوق أبنائكم في الكويت والخليج.', image: '/hero-child.png', alt: 'طفل يدرس على منصة دارين السابعة للتعليم عن بعد في الكويت' },
  { title: 'دورات تفاعلية', subtitle: 'تعلم بأحدث الأساليب', desc: 'دروس خصوصية تفاعلية في جميع المواد للمناهج الكويتية والخليجية.', image: '/teacher-foundation.png', alt: 'معلم خصوصي يشرح درس أونلاين لطالب في الكويت' },
  { title: 'مستقبل مشرق', subtitle: 'مع نخبة المعلمين', desc: 'كوادر تعليمية متميزة لضمان أفضل النتائج في الرياضيات والعلوم واللغات.', image: '/dareen_books_portal_v3.png', alt: 'مكتبة دارين السابعة التعليمية - كتب ومواد دراسية للمناهج الخليجية' },
];

const stages = CATEGORIES;

export const Home = () => {
  const { adminPhone, heroBanners } = useSettingsStore();
  const whatsappNumber = adminPhone.replace(/\D/g, '');
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
    }, 10000);
    return () => clearInterval(timer);
  }, [reviews.length]);

  const reviewSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'دارين السابعة - منصة تعليم عن بعد',
    description: 'منصة تعليم عن بعد رائدة في الكويت والخليج. دروس خصوصية أونلاين، تحفيظ قرآن، وتأسيس للمناهج الخليجية.',
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
    <div className="min-h-full bg-[#F8F8FC] dark:bg-slate-950 font-sans text-gray-800 dark:text-slate-100 relative overflow-x-hidden transition-colors duration-500">
      <SEO title="دارين السابعة | منصة تعليم عن بعد في السعودية والكويت والخليج" description="تعليم عن بعد في السعودية، الكويت، الإمارات، قطر، وعمان والبحرين. دروس خصوصية أونلاين في الرياضيات والعلوم واللغة العربية والإنجليزية، قدرات وتحصيلي، تحفيظ قرآن، تأسيس أطفال، ومراجعات للمناهج السعودية والكويتية والقطرية والعمانية والبحرينية مع أفضل المعلمين في الدوحة والريان ومسقط وصلالة والمنامة. احجز حصة تجريبية مجانية." url="https://dareen.cloud/" image="/hero-child.png" keywords="دارين السابعة, تعليم عن بعد, منصة تعليمية, دروس خصوصية الكويت, مدرس خصوصي كورسات السعودية, تحفيظ قرآن, مناهج خليجية, تأسيس أطفال, مراجعات نهائية, قدرات تحصيلي, اونلاين" breadcrumbs={[{ name: 'الرئيسية', item: '/' }]} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewSchema) }} />
      <MobileHeader />

      {/* ─── Mobile App Content ─── */}
      <main className="md:hidden pb-4 px-2 max-w-lg mx-auto relative">

        {/* Hero Carousel */}
        <section className="relative bg-gradient-to-br from-violet-100 via-violet-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-950 rounded-2xl overflow-hidden mb-4 shadow-sm border border-violet-100/50 dark:border-slate-800">
          {heroSlides.map((slide, i) => (
            <div key={i} className={`${heroIndex === i ? 'block' : 'hidden'} p-5`}>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                   <h1 className="text-[18px] font-black text-indigo-950 dark:text-indigo-100 leading-tight mb-0.5">{slide.title}{heroIndex === 0 && <span className="text-blue-600 dark:text-blue-400"> السابعة</span>}</h1>
                  <p className="text-[12px] font-bold text-violet-600 dark:text-violet-400 mb-0.5">{slide.subtitle}</p>
                  <p className="text-[9px] text-slate-500 dark:text-slate-400 leading-relaxed mb-3">{slide.desc}</p>
                  <div className="flex flex-col gap-1.5">
                    <Link to="/courses" className="bg-white dark:bg-slate-200 text-slate-900 dark:text-slate-900 text-[10px] font-bold px-4 py-2 rounded-full shadow-lg shadow-black/10 dark:shadow-slate-900/30 hover:bg-slate-100 dark:hover:bg-slate-300 transition-all flex items-center justify-center gap-1 w-full">
                      <Play className="w-3 h-3 fill-slate-900" />
                      تصفح الدورات
                    </Link>
                    <Link to="/login" className="bg-indigo-600 text-white text-[10px] font-bold px-4 py-2 rounded-full shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all w-full text-center">
                      تسجيل الدخول
                    </Link>
                  </div>
                </div>
                <div className="relative shrink-0">
                  <div className="absolute inset-0 bg-violet-200/50 dark:bg-violet-800/30 rounded-full blur-xl" />
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
                      <button key={d} onClick={() => setHeroIndex(d)} aria-label={`الانتقال إلى الشريحة ${d + 1}`} className={`w-1.5 h-1.5 rounded-full transition-all ${heroIndex === d ? 'bg-indigo-600 w-3' : 'bg-slate-300 dark:bg-slate-600'}`} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* Quick Features */}
        <section className="mb-4">
          <div className="grid grid-cols-2 gap-1.5">
            {quickFeatures.map((f, i) => (
              <div key={i} className={`flex items-center gap-2 p-2 bg-white dark:bg-slate-900 rounded-xl shadow-sm border ${f.border} ${f.borderDark} transition-all`}>
                <div className={`w-10 h-10 rounded-xl ${f.bg} ${f.bgDark} flex items-center justify-center shrink-0`}>
                  <f.icon className={`${f.color} ${f.colorDark}`} size={20} />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] font-black text-slate-800 dark:text-white block leading-tight mb-0">{f.label}</span>
                  <span className="text-[6px] text-slate-400 font-medium block leading-tight">{f.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* How to Subscribe */}
        <div className="mb-4">
            <HowToSubscribe />
        </div>

        {/* Latest Courses */}
        <section className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-[15px] font-black text-slate-900 dark:text-white">أحدث الدورات</h2>
            <Link to="/courses" className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
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
                className={`whitespace-nowrap px-3 py-1.5 rounded-full text-[10px] font-bold transition-all flex items-center gap-1.5 ${
                  activeCategory === cat.value
                    ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-md shadow-indigo-600/20'
                    : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                }`}
              >
                <cat.icon size={12} className={activeCategory === cat.value ? 'text-white' : cat.color} />
                {cat.label}
              </button>
            ))}
          </div>

          {/* Course Cards */}
          <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1 no-scrollbar mt-3">
            {getFilteredCourses(activeCategory).slice(0, 6).map((c, i) => (
              <motion.a
                key={c.id}
                href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`السلام عليكم، أرغب في الاستفسار عن ${c.title}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.08 }}
                className="min-w-[180px] w-[180px] bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden shrink-0 block"
              >
                <div className="relative h-24 bg-white dark:bg-slate-800 overflow-hidden">
                  <img
                    src={c.image}
                    alt={c.title}
                    width="180"
                    height="96"
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                  <span className={`absolute top-2 right-2 text-white text-[8px] font-black px-2 py-0.5 rounded-full shadow-sm ${
                    c.category === 'foundation' ? 'bg-emerald-500' :
                    c.category === 'quran' ? 'bg-amber-500' :
                    c.category === 'gulf' ? 'bg-sky-500' :
                    c.category === 'english' ? 'bg-violet-500' : 'bg-rose-500'
                  }`}>
                    {CATEGORIES.find(cat => cat.value === c.category)?.label || c.category}
                  </span>
                </div>
                <div className="p-3">
                  <h3 className="text-[12px] font-black text-slate-900 dark:text-white mb-0.5">{c.title}</h3>
                  <p className="text-[9px] text-slate-400 font-medium mb-2 line-clamp-1 dark:text-slate-400">{c.desc}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-slate-400" />
                      <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400">{c.students}</span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span className="text-[9px] font-bold text-slate-600 dark:text-slate-300">{c.rating}</span>
                    </div>
                  </div>
                </div>
              </motion.a>
            ))}
          </div>
        </section>


        {/* Existing Sections (restyled layout) */}
        <div className="space-y-4">
          <div style={{ contentVisibility: 'auto' }}>
            <WhyChooseUs />
          </div>
          <div style={{ contentVisibility: 'auto' }}>
            <QuranSection whatsappNumber={whatsappNumber} />
          </div>
          <div className="hidden" style={{ contentVisibility: 'auto' }}>
            <HowItWorks whatsappNumber={whatsappNumber} />
          </div>
          <div style={{ contentVisibility: 'auto' }}>
            <Testimonials reviews={reviews} currentIndex={currentIndex} />
          </div>
          <div style={{ contentVisibility: 'auto' }}>
            <MasarSection />
          </div>
          <div style={{ contentVisibility: 'auto' }}>
            <FAQSection />
          </div>
        </div>
      </main>

      {/* ─── Desktop content (unchanged) ─── */}
      <div className="hidden md:block">
        <HeroSection typewriterText={typewriterText} whatsappNumber={whatsappNumber} bannersArray={bannersArray} />
        <div style={{ contentVisibility: 'auto' }}>
          <WhyChooseUs />
        </div>
        <div style={{ contentVisibility: 'auto' }}>
          <QuranSection whatsappNumber={whatsappNumber} />
        </div>
        <div style={{ contentVisibility: 'auto' }}>
          <HowItWorks whatsappNumber={whatsappNumber} />
        </div>
        <div style={{ contentVisibility: 'auto' }}>
          <Testimonials reviews={reviews} currentIndex={currentIndex} />
        </div>
        <div style={{ contentVisibility: 'auto' }}>
          <MasarSection />
        </div>
        <div style={{ contentVisibility: 'auto' }}>
          <FAQSection />
        </div>
      </div>

      <footer>
        <PublicFooter />
      </footer>

      {/* Bottom Nav removed */}
    </div>
  );
};
