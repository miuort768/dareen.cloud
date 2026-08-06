import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { MobileHeader } from '../../components/public/MobileHeader';
import { PublicFooter } from '../../components/public/PublicFooter';
import { Image } from '../../shared/components/ui';
import { Search, Users, Sparkles, Star, MessageCircle } from 'lucide-react';
import { useSettingsStore } from '../../store/settingsStore';
import { useAcademyName } from '../../context/AppContext';
import { SEO } from '../../components/SEO';
import { COURSES, CATEGORIES } from '../../data/courses';
import { AnimateOnScroll } from '../../components/ui/AnimateOnScroll';

const parseStudentCount = (s: string) => {
  const n = parseFloat(s.replace(/[kK]/, ''));
  return s.includes('k') || s.includes('K') ? Math.round(n * 1000) : Math.round(n);
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
        className={star <= Math.floor(rating) ? 'text-warning fill-warning' : 'text-dim dark:text-muted fill-none'}
      />
    ))}
    <span className="text-micro font-black text-muted ms-1">{rating}</span>
  </div>
);

export const Courses = () => {
  const academyName = useAcademyName();
  const adminPhone = useSettingsStore(s => s.adminPhone);
  const whatsappNumbers = useSettingsStore(s => s.whatsappNumbers);

  const getNumber = (label: string): string => {
    try {
      const entries: { label: string; phone: string }[] = JSON.parse(whatsappNumbers);
      const found = entries.find((e) => e.label === label);
      return found ? found.phone.replace(/\D/g, '') : adminPhone.replace(/\D/g, '');
    } catch (e) { console.warn(e); return adminPhone.replace(/\D/g, ''); }
  };

  const whatsappNumber = getNumber('تواصل عبر واتساب');
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

  const courseSchema = useMemo(() => ({
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: COURSES.map((c, i) => ({
      '@type': 'Course',
      position: i + 1,
      name: c.title,
      description: c.desc,
      provider: { '@type': 'EducationalOrganization', name: academyName, url: 'https://dareen.cloud' },
      aggregateRating: { '@type': 'AggregateRating', ratingValue: c.rating, bestRating: 5, ratingCount: parseStudentCount(c.students) },
      offers: { '@type': 'Offer', priceCurrency: 'SAR', price: '0', availability: 'https://schema.org/InStock' },
    })),
  }), [academyName]);

  return (
    <div className="min-h-full bg-background font-sans text-main relative flex flex-col">
      <SEO title="الدورات التعليمية أونلاين" description="دورات تعليمية أونلاين للمناهج السعودية والكويتية والإماراتية والقطرية والعمانية والبحرينية. دروس خصوصية في الرياضيات والعلوم واللغة العربية والإنجليزية وقدرات وتحصيلي في الرياض وجدة والكويت ودبي والدوحة والريان ومسقط وصلالة والمنامة والمحرق. تأسيس أطفال، تحفيظ قرآن، مراجعات نهائية مع نخبة المعلمين الخبراء." url="https://dareen.cloud/courses" image="/dareen_books_portal_v3.png" breadcrumbs={[{ name: 'الرئيسية', item: '/' }, { name: 'الدورات', item: '/courses' }]} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema) }} />
      <MobileHeader />

      <main className="flex-grow md:pt-32 pb-16 md:pb-24 relative overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-15%] right-[-10%] w-[60%] h-[60%] bg-gradient-to-br from-[var(--bg-primary)]/8 to-[var(--bg-primary)]/8 rounded-full blur-[140px]" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-gradient-to-tr from-[var(--bg-info)]/5 to-[var(--bg-primary)]/5 rounded-full blur-[120px]" />
          <div className="absolute top-[40%] left-[50%] translate-x-[-50%] w-[80%] h-[1px] bg-gradient-to-r from-transparent via-[var(--bg-primary)]/20 to-transparent" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 max-w-7xl">
                        <AnimateOnScroll animation="fadeUp">
                        <div className="text-center mb-4 md:mb-6">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-soft/60 dark:bg-primary/10 backdrop-blur-sm border border-primary dark:border-primary/20 rounded-full mb-2 md:mb-6">
                                <Sparkles size={13} className="text-primary" />
                                <span className="text-micro font-black text-primary">استكشف مسيرتك التعليمية</span>
                            </div>

                            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-heading font-black text-main mb-2 md:mb-4 leading-tight tracking-tight">
                                <span className="text-primary">
                                    دورات
                                </span>{' '}
                                {academyName}
                            </h1>

                            <p className="text-sm sm:text-base text-muted max-w-2xl mx-auto leading-relaxed font-medium md:whitespace-nowrap">
                                برامج تعليمية مصممة بعناية لتُناسب جميع المراحل والمستويات — بأسلوب تفاعلي يجعل التعلّم تجربة ممتعة
                            </p>
                        </div>
                        </AnimateOnScroll>

                        <div className="max-w-4xl mx-auto mb-6">
            <div className="relative group">
              <input
                type="text"
                aria-label="ابحث عن دورتك المفضلة"
                placeholder="ابحث عن دورتك المفضلة..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-5 ps-12 py-4 rounded-card bg-card border border-border dark:border-border/50 shadow-lg shadow-sm/50 dark:shadow-black/20 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 outline-none transition-all text-base placeholder:text-dim dark:placeholder:text-muted font-bold dark:focus:shadow-lg"
              />
              <Search className="absolute start-4 top-1/2 -translate-y-1/2 text-dim dark:text-muted w-5 h-5 group-focus-within:text-primary transition-colors" />
            </div>

            <div className="flex flex-wrap justify-center gap-2 mt-6">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setActiveCategory(cat.value)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-card font-black text-xs transition-all duration-300 ${
                    activeCategory === cat.value
                      ? 'bg-primary-active dark:bg-surface text-on-primary dark:text-main shadow-lg shadow-card/20 dark:shadow-lg'
                      : 'bg-surface text-muted border border-border hover:border-border/20 hover:text-main'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <cat.icon size={14} className={activeCategory === cat.value ? 'text-on-primary dark:text-main' : cat.color} />
                    <span>{cat.label}</span>
                  </span>
                </button>
              ))}
                        </div>
                            </div>

          {filteredCourses.length > 0 ? (
            <motion.div
              key={activeCategory + searchQuery}
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-5"
            >
              {filteredCourses.map((course) => (
                <motion.div
                  key={course.id}
                  variants={cardVariants}
                   className="group relative bg-card border border-border dark:border-border/50 rounded-card overflow-hidden flex flex-col h-full shadow-sm hover:shadow-xl hover:shadow-primary/5 dark:hover:shadow-xl transition-all duration-500"
                >
                  <div className="relative h-44 overflow-hidden bg-background dark:bg-card">
                    <Image
                      src={course.image}
                      alt={course.title}
                      className="w-full h-full"
                      imgClassName="object-contain scale-[1.15] group-hover:scale-[1.25] transition-transform duration-700 ease-out"
                    />

                    <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-card to-transparent" />

                    <div className="absolute top-3 start-3 z-10">
                      <div className={`px-2.5 py-1 rounded-lg text-micro font-black text-on-primary shadow-lg bg-gradient-to-br ${course.color}`}>
                        {CATEGORIES.find(c => c.value === course.category)?.label || course.category}
                      </div>
                    </div>

                    <div className="absolute bottom-3 end-3 z-10">
                      <div className="bg-surface/90 dark:bg-card backdrop-blur-sm rounded-lg shadow-sm px-2 py-1 flex items-center gap-1">
                        <StarRating rating={course.rating} />
                      </div>
                    </div>
                  </div>

                    <div className="p-3 pb-0 flex flex-col flex-1">
                    <h2 className="text-lg md:text-xl font-heading font-black text-main leading-snug group-hover:text-primary dark:group-hover:text-primary transition-colors">
                      {course.title}
                    </h2>

                    <p className="text-xs text-muted leading-relaxed line-clamp-2 mt-2 mb-4">
                      {course.desc}
                    </p>

                    <div className="mt-auto flex items-center justify-between py-3 border-t border-border dark:border-border/50">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-primary-soft dark:bg-primary/10 flex items-center justify-center">
                          <Users size={12} className="text-primary" />
                        </div>
                        <div>
                          <span className="text-xs font-black text-main leading-none block">{course.students}</span>
                          <span className="text-micro font-bold text-muted">طالب</span>
                        </div>
                      </div>

                      <span className="flex items-center gap-1.5 text-xs font-black text-success bg-success-light dark:bg-success/10 px-3 py-1.5 rounded-lg">
                        <Sparkles size={10} />
                        تجربة مجانية
                      </span>
                    </div>
                  </div>

                  <a
                    href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`السلام عليكم، أرغب في الاستفسار عن ${course.title}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mx-3 mb-3 flex items-center justify-center gap-2 bg-success hover:bg-success-dark dark:bg-primary dark:hover:bg-primary-dark text-on-success dark:text-on-primary text-xs font-black py-2.5 rounded-card transition-all duration-300 shadow-lg shadow-success/20 hover:shadow-success/30 dark:shadow-primary/20 active:scale-[0.97] dark:shadow-lg"
                  >
                    <MessageCircle size={14} />
                    تواصل عبر واتساب
                  </a>

                  {/* Hidden SEO keywords for this course */}
                  {course.seoKeywords && (
                    <div className="absolute opacity-0 pointer-events-none overflow-hidden h-0" aria-hidden="true">
                      <h2>الكلمات المفتاحية - {course.title}</h2>
                      <p>{course.seoKeywords.short}</p>
                      <h3>كلمات مفتاحية طويلة - {course.title}</h3>
                      <p>{course.seoKeywords.long}</p>
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="text-center py-20"
            >
              <div className="w-16 h-16 rounded-card bg-background dark:bg-card/50 flex items-center justify-center mx-auto mb-4 border border-border dark:border-border/50">
                <Search size={28} className="text-dim dark:text-muted" />
              </div>
              <h2 className="text-xl font-black text-main mb-1">لا توجد نتائج</h2>
              <p className="text-sm text-muted font-medium">جرّب كلمات بحث مختلفة أو اختر تصنيفاً آخر</p>
            </motion.div>
          )}
        </div>
      </main>

      <PublicFooter />
    </div>
  );
};
