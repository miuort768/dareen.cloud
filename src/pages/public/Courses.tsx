import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { MobileHeader } from '../../components/public/MobileHeader';
import { PublicFooter } from '../../components/public/PublicFooter';
import { Search, Users, Sparkles, Star, MessageCircle } from 'lucide-react';
import { useSettingsStore } from '../../store/settingsStore';
import { SEO } from '../../components/SEO';
import { COURSES, CATEGORIES } from '../../data/courses';

const parseStudentCount = (s: string) => {
  const n = parseFloat(s.replace(/[kK]/, ''));
  return s.includes('k') || s.includes('K') ? Math.round(n * 1000) : Math.round(n);
};

const courseSchema = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  itemListElement: COURSES.map((c, i) => ({
    '@type': 'Course',
    position: i + 1,
    name: c.title,
    description: c.desc,
    provider: { '@type': 'EducationalOrganization', name: 'دارين السابعة', url: 'https://dareen.cloud' },
    aggregateRating: { '@type': 'AggregateRating', ratingValue: c.rating, bestRating: 5, ratingCount: parseStudentCount(c.students) },
    offers: { '@type': 'Offer', priceCurrency: 'KWD', price: '0', availability: 'https://schema.org/InStock' },
  })),
};

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        size={10}
        className={star <= Math.floor(rating) ? 'text-amber-400 fill-amber-400' : 'text-amber-200 fill-amber-100'}
      />
    ))}
    <span className="text-[10px] font-black text-gray-600 mr-1">{rating}</span>
  </div>
);

export const Courses = () => {
  const { adminPhone } = useSettingsStore();
  const whatsappNumber = adminPhone.replace(/\D/g, '');
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCourses = useMemo(() =>
    COURSES.filter(course => {
      const matchesCategory = activeCategory === 'all' || course.category === activeCategory;
      const searchLower = (searchQuery || '').toLowerCase().trim();
      const matchesSearch = !searchLower ||
        (course.title || '').toLowerCase().includes(searchLower) ||
        (course.desc || '').toLowerCase().includes(searchLower);
      return matchesCategory && matchesSearch;
    }),
    [activeCategory, searchQuery]
  );

  return (
    <div className="min-h-full bg-[#fafafa] dark:bg-slate-950 font-sans text-gray-800 dark:text-slate-100 relative flex flex-col">
      <SEO title="الدورات التعليمية أونلاين | دارين السابعة" description="دورات تعليمية أونلاين للمناهج الكويتية والسعودية والقطرية. تأسيس لغة عربية، تحفيظ قرآن، مراجعات نهائية، وقدرات. دروس خصوصية مع نخبة المعلمين في الخليج." url="https://dareen.cloud/courses" image="/dareen_books_portal_v3.png" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema) }} />
      <MobileHeader />

      <main className="flex-grow md:pt-32 pb-4 md:pb-6 relative overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-15%] right-[-10%] w-[60%] h-[60%] bg-gradient-to-br from-indigo-500/8 to-purple-500/8 rounded-full blur-[140px]" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-gradient-to-tr from-sky-500/5 to-indigo-500/5 rounded-full blur-[120px]" />
          <div className="absolute top-[40%] left-[50%] translate-x-[-50%] w-[80%] h-[1px] bg-gradient-to-r from-transparent via-indigo-200/20 to-transparent" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 max-w-7xl">
          <div className="text-center mb-6 md:mb-8">
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50/60 dark:bg-indigo-500/10 backdrop-blur-sm border border-indigo-100 dark:border-indigo-500/20 rounded-full mb-6"
            >
              <Sparkles size={13} className="text-indigo-600 dark:text-indigo-400" />
              <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-300">استكشف مسيرتك التعليمية</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-heading font-black text-slate-900 dark:text-slate-50 mb-4 leading-[1.15] tracking-tight"
            >
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                دورات
              </span>{' '}
              دارين السابعة
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed font-medium"
            >
              برامج تعليمية مصممة بعناية لتُناسب جميع المراحل والمستويات — بأسلوب تفاعلي يجعل التعلّم تجربة ممتعة
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="max-w-4xl mx-auto mb-10"
          >
            <div className="relative group">
              <input
                type="text"
                placeholder="ابحث عن دورتك المفضلة..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-5 pr-12 py-4 rounded-2xl bg-white dark:bg-slate-900/80 dark:backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 shadow-lg shadow-slate-200/50 dark:shadow-black/20 focus:border-indigo-400/50 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-base placeholder:text-slate-300 dark:placeholder:text-slate-600 font-bold"
              />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 w-5 h-5 group-focus-within:text-indigo-500 transition-colors" />
            </div>

            <div className="flex flex-wrap justify-center gap-2 mt-6">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setActiveCategory(cat.value)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs transition-all duration-300 ${
                    activeCategory === cat.value
                      ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-950 shadow-lg shadow-slate-900/20'
                      : 'bg-white dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700/50 hover:border-slate-900/20 dark:hover:border-slate-100/20 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  <cat.icon size={14} className={activeCategory === cat.value ? 'text-white dark:text-slate-950' : cat.color} />
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </motion.div>

          {filteredCourses.length > 0 ? (
            <motion.div
              key={activeCategory + searchQuery}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 lg:gap-6"
            >
              {filteredCourses.map((course) => (
                <motion.div
                  key={course.id}
                  variants={cardVariants}
                  className="group relative bg-white dark:bg-slate-900/50 dark:backdrop-blur-xl border border-slate-100 dark:border-slate-800/50 rounded-2xl overflow-hidden flex flex-col h-full shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 dark:hover:shadow-indigo-500/5 transition-all duration-500"
                >
                  <div className="relative h-44 overflow-hidden bg-slate-50 dark:bg-slate-800/30">
                    <img
                      src={course.image}
                      alt={course.title}
                      width="400"
                      height="300"
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-contain scale-[1.15] group-hover:scale-[1.25] transition-transform duration-700 ease-out"
                    />

                    <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white dark:from-slate-900 to-transparent" />

                    <div className="absolute top-3 right-3 z-10">
                      <div className={`px-2.5 py-1 rounded-lg text-[9px] font-black text-white shadow-lg bg-gradient-to-br ${course.color}`}>
                        {CATEGORIES.find(c => c.value === course.category)?.label || course.category}
                      </div>
                    </div>

                    <div className="absolute bottom-3 left-3 z-10">
                      <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-lg shadow-sm px-2 py-1 flex items-center gap-1">
                        <StarRating rating={course.rating} />
                      </div>
                    </div>
                  </div>

                  <div className="p-4 pb-0 flex flex-col flex-1">
                    <h3 className="text-lg md:text-xl font-heading font-black text-slate-900 dark:text-slate-50 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {course.title}
                    </h3>

                    <p className="text-[12px] text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2 mt-2 mb-4">
                      {course.desc}
                    </p>

                    <div className="mt-auto flex items-center justify-between py-3 border-t border-slate-100 dark:border-slate-800/50">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
                          <Users size={12} className="text-indigo-500" />
                        </div>
                        <div>
                          <span className="text-[11px] font-black text-slate-900 dark:text-slate-100 leading-none block">{course.students}</span>
                          <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500">طالب</span>
                        </div>
                      </div>

                      <span className="flex items-center gap-1.5 text-[11px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1.5 rounded-lg">
                        <Sparkles size={10} />
                        تجربة مجانية
                      </span>
                    </div>
                  </div>

                  <a
                    href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`السلام عليكم، أرغب في الاستفسار عن ${course.title}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mx-4 mb-4 flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-[12px] font-black py-3 rounded-xl transition-all duration-300 shadow-lg shadow-green-500/20 hover:shadow-green-500/30 active:scale-[0.98]"
                  >
                    <MessageCircle size={14} />
                    تواصل عبر واتساب
                  </a>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20"
            >
              <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center mx-auto mb-4 border border-slate-200 dark:border-slate-700/50">
                <Search size={28} className="text-slate-300 dark:text-slate-600" />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 mb-1">لا توجد نتائج</h3>
              <p className="text-sm text-slate-400 dark:text-slate-500 font-medium">جرّب كلمات بحث مختلفة أو اختر تصنيفاً آخر</p>
            </motion.div>
          )}
        </div>
      </main>

      <PublicFooter />
    </div>
  );
};
