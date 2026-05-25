import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSettingsStore } from '../../store/settingsStore';
import { SEO } from '../../components/SEO';
import { PublicNavbar } from '../../components/public/PublicNavbar';
import { PublicFooter } from '../../components/public/PublicFooter';
import { MasarSection } from '../../components/public/MasarSection';
import { WhyChooseUs } from './components/WhyChooseUs';
import { QuranSection } from './components/QuranSection';
import { HowItWorks } from './components/HowItWorks';
import { Testimonials } from './components/Testimonials';
import { FAQSection } from './components/FAQSection';
import { HeroSection } from './components/HeroSection';
import {
  Bell, Search, Play, BookOpen, Award, Trophy,
  Video, MessageCircle, Star, Home as HomeIcon, Library, User, MoreHorizontal,
  GraduationCap, ChevronLeft, Monitor, Users
} from 'lucide-react';

const quickFeatures = [
  { icon: BookOpen, label: 'دوراتي', desc: 'تعلم واستمر', color: 'text-emerald-500', bg: 'bg-emerald-50' },
  { icon: Award, label: 'الشهادات', desc: 'إنجازاتك', color: 'text-blue-500', bg: 'bg-blue-50' },
  { icon: Trophy, label: 'التحديات', desc: 'نافس وتفوق', color: 'text-violet-500', bg: 'bg-violet-50' },
  { icon: Video, label: 'بث مباشر', desc: 'حصص مباشرة', color: 'text-orange-500', bg: 'bg-orange-50' },
  { icon: MessageCircle, label: 'الاستشارات', desc: 'اسأل وتعلم', color: 'text-emerald-500', bg: 'bg-emerald-50' },
];

const latestCourses = [
  {
    title: 'الرياضيات المتقدمة', stage: 'المرحلة الثانوية',
    badge: 'الأكثر مبيعًا', badgeColor: 'bg-emerald-500',
    students: '2.5K', rating: 4.8, image: '/teacher-foundation.png',
  },
  {
    title: 'اللغة الإنجليزية', stage: 'المرحلة المتوسطة',
    badge: 'جديد', badgeColor: 'bg-violet-500',
    students: '1.8K', rating: 4.7, image: '/dareen_books_portal_v3.png',
  },
  {
    title: 'العلوم المتكاملة', stage: 'المرحلة المتوسطة',
    badge: 'الأكثر مبيعًا', badgeColor: 'bg-emerald-500',
    students: '1.6K', rating: 4.6, image: '/hero-child.png',
  },
];

const stages = ['الكل', 'المرحلة الابتدائية', 'المرحلة المتوسطة', 'المرحلة الثانوية', 'مهارات عامة'];

export const Home = () => {
  const { adminPhone, heroBanners } = useSettingsStore();
  const whatsappNumber = adminPhone.replace(/\D/g, '');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeStage, setActiveStage] = useState('الكل');
  const [typewriterText, setTypewriterText] = useState("");

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
    }, 5000);
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
      <SEO title="دارين السابعة | منصة تعليم عن بعد في الكويت والخليج" description="تعليم عن بعد في الكويت، السعودية، قطر، الإمارات، وعمان. دروس خصوصية أونلاين، تحفيظ قرآن، وتأسيس للمناهج الخليجية مع أفضل المعلمين. احجز حصة تجريبية مجانية الآن." url="https://dareen.cloud/" image="/hero-child.png" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewSchema) }} />
      <PublicNavbar />

      {/* ─── Mobile App Content ─── */}
      <main className="md:hidden pt-4 pb-28 px-4 max-w-lg mx-auto relative">
        {/* Header */}
        <header className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-11 h-11 rounded-[16px] bg-gradient-to-br from-indigo-600 to-indigo-800 flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-[15px] font-black text-indigo-950 leading-tight">دارين</h1>
              <p className="text-[9px] font-bold text-slate-500 leading-tight">للتعليم والتدريب</p>
              <p className="text-[7px] text-slate-400 leading-tight">Darren of Education and Online Learning</p>
            </div>
          </div>
          <button aria-label="الإشعارات" className="relative w-10 h-10 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center">
            <Bell className="w-5 h-5 text-slate-600" />
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
          </button>
        </header>

        {/* Search Bar */}
        <div className="relative mb-5">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="ابحث عن دورة أو درس..."
            className="w-full bg-white rounded-full py-3.5 pr-11 pl-5 text-[13px] text-slate-700 placeholder:text-slate-400 border border-slate-200/80 shadow-sm outline-none focus:border-indigo-300 transition-colors"
          />
        </div>

        {/* Hero Banner */}
        <section className="relative bg-gradient-to-br from-violet-100 via-violet-50 to-white rounded-[32px] overflow-hidden mb-6 p-5 shadow-sm border border-violet-100/50">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="text-[22px] font-black text-indigo-950 leading-tight mb-1"
              >
                منصة دارين
              </motion.h2>
              <p className="text-[13px] font-bold text-violet-600 mb-2">للتعليم والتدريب عن بعد</p>
              <p className="text-[10px] text-slate-500 leading-relaxed mb-4">
                منصة متكاملة تجمع بين أفضل المعلمين وأحدث تقنيات التعليم الإلكتروني لضمان تفوق أبنائكم دائماً.
              </p>
              <div className="flex gap-2">
                <Link
                  to="/courses"
                  className="bg-indigo-600 text-white text-[11px] font-bold px-5 py-2.5 rounded-full shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  ابدأ الآن
                </Link>
                <button
                  onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-white text-slate-700 text-[11px] font-bold px-5 py-2.5 rounded-full border border-slate-200 hover:border-indigo-200 transition-all"
                >
                  استكشف الدورات
                </button>
              </div>
            </div>
            <div className="relative shrink-0">
              <div className="absolute inset-0 bg-violet-200/50 rounded-full blur-xl" />
              <div className="relative w-[110px]">
                <img
                  src="/hero-child.png"
                  alt="طفل يدرس على منصة دارين السابعة"
                  width="110"
                  height="110"
                  className="w-full h-auto object-contain drop-shadow-lg"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-center gap-1.5 mt-3">
            <span className="w-2 h-2 rounded-full bg-indigo-600" />
            <span className="w-2 h-2 rounded-full bg-slate-300" />
            <span className="w-2 h-2 rounded-full bg-slate-300" />
          </div>
        </section>

        {/* Quick Features */}
        <section className="mb-6">
          <div className="flex gap-2.5 overflow-x-auto pb-1 -mx-1 px-1 no-scrollbar">
            {quickFeatures.map((f, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="flex flex-col items-center gap-1.5 min-w-[68px] p-3 bg-white rounded-2xl shadow-sm border border-slate-100/50 shrink-0 hover:shadow-md transition-all"
                aria-label={f.label}
              >
                <div className={`w-9 h-9 rounded-xl ${f.bg} flex items-center justify-center`}>
                  <f.icon className={f.color} size={18} />
                </div>
                <span className="text-[10px] font-black text-slate-800">{f.label}</span>
                <span className="text-[8px] text-slate-400 font-medium -mt-0.5">{f.desc}</span>
              </motion.button>
            ))}
          </div>
        </section>

        {/* Latest Courses */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[15px] font-black text-slate-900">أحدث الدورات</h3>
            <Link to="/courses" className="text-[11px] font-bold text-indigo-600 flex items-center gap-1">
              عرض الكل
              <ChevronLeft className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Stage Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {stages.map((s) => (
              <button
                key={s}
                onClick={() => setActiveStage(s)}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-[10px] font-bold transition-all ${
                  activeStage === s
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'bg-white text-slate-500 border border-slate-200'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Course Cards */}
          <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1 no-scrollbar mt-3">
            {latestCourses.map((c, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.08 }}
                className="min-w-[180px] w-[180px] bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden shrink-0"
              >
                <div className="relative h-24 bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
                  <img
                    src={c.image}
                    alt={c.title}
                    width="180"
                    height="96"
                    className="w-full h-full object-contain p-2"
                  />
                  <span className={`absolute top-2 right-2 ${c.badgeColor} text-white text-[8px] font-black px-2 py-0.5 rounded-full shadow-sm`}>
                    {c.badge}
                  </span>
                </div>
                <div className="p-3">
                  <h4 className="text-[12px] font-black text-slate-900 mb-0.5">{c.title}</h4>
                  <p className="text-[9px] text-slate-400 font-medium mb-2">{c.stage}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-slate-400" />
                      <span className="text-[9px] font-bold text-slate-500">{c.students}</span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span className="text-[9px] font-bold text-slate-600">{c.rating}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Continue Learning */}
        <section className="mb-6">
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-3xl overflow-hidden p-5 shadow-xl shadow-indigo-600/20">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-[15px] font-black text-white mb-1">تابع تعلمك</h3>
                <p className="text-[13px] font-bold text-indigo-200">أساسيات البرمجة</p>
                <p className="text-[9px] text-indigo-300 font-medium mb-3">المستوى المبتدئ</p>
                <div className="w-full bg-white/20 rounded-full h-2 mb-2">
                  <div className="bg-white rounded-full h-2 w-[60%]" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-white">60%</span>
                  <span className="bg-white/20 text-white text-[9px] font-bold px-3 py-1 rounded-full">متابعة</span>
                </div>
              </div>
              <div className="relative shrink-0 mr-3">
                <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center">
                  <Monitor className="w-10 h-10 text-white/80" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Existing Sections (restyled layout) */}
        <div className="space-y-6">
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
        <div className="hidden md:block">
          <PublicFooter />
        </div>
      </footer>

      {/* ─── Bottom Navigation (mobile only) ─── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 pb-[env(safe-area-inset-bottom)]">
        <div className="bg-white/95 backdrop-blur-2xl mx-3 mb-3 rounded-[28px] shadow-2xl shadow-slate-900/10 border border-slate-100/80 px-2 py-2">
          <div className="flex items-center justify-around">
            {[
              { icon: HomeIcon, label: 'الرئيسية', active: true },
              { icon: Library, label: 'مكتبة الدورات', active: false, isCenter: true },
              { icon: User, label: 'الملف الشخصي', active: false },
              { icon: MoreHorizontal, label: 'المزيد', active: false },
            ].map((item, i) => (
              <button
                key={i}
                className={`flex flex-col items-center gap-0.5 transition-all ${item.active ? '-mt-6' : ''}`}
                aria-label={item.label}
              >
                {item.active ? (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-xl shadow-indigo-600/30">
                    <item.icon className="w-5 h-5 text-white" />
                  </div>
                ) : (
                  <>
                    <div className="w-8 h-8 flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-slate-400" />
                    </div>
                    <span className="text-[8px] font-medium text-slate-400">{item.label}</span>
                  </>
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
};
