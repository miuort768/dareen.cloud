import { safeJsonLd } from '../../shared/utils/jsonLd'
import { useState, useMemo } from 'react'
import type { Variants } from 'framer-motion'
import { motion } from 'framer-motion'
import { MobileHeader } from '../../components/public/MobileHeader'
import { PublicFooter } from '../../components/public/PublicFooter'
import { Image } from '../../shared/components/ui'
import { Search, Users, Sparkles, Star, MessageCircle } from 'lucide-react'
import { useSettingsStore } from '../../store/settingsStore'
import { useAcademyName } from '../../context/AppContext'
import { SEO } from '../../components/SEO'
import { COURSES, CATEGORIES } from '../../data/courses'
import { AnimateOnScroll } from '../../components/ui/AnimateOnScroll'

const parseStudentCount = (s: string) => {
  const n = parseFloat(s.replace(/[kK]/, ''))
  return s.includes('k') || s.includes('K') ? Math.round(n * 1000) : Math.round(n)
}

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06 },
  },
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        size={10}
        className={
          star <= Math.floor(rating)
            ? 'fill-warning text-warning dark:fill-primary dark:text-primary'
            : 'fill-none text-dim dark:text-dim'
        }
      />
    ))}
    <span className="ms-1 text-micro font-black text-muted dark:text-muted">{rating}</span>
  </div>
)

export const Courses = () => {
  const academyName = useAcademyName()
  const adminPhone = useSettingsStore((s) => s.adminPhone)
  const whatsappNumbers = useSettingsStore((s) => s.whatsappNumbers)

  const getNumber = (label: string): string => {
    try {
      const entries: { label: string; phone: string }[] = JSON.parse(whatsappNumbers)
      const found = entries.find((e) => e.label === label)
      return found ? found.phone.replace(/\D/g, '') : adminPhone.replace(/\D/g, '')
    } catch (e) {
      console.warn(e)
      return adminPhone.replace(/\D/g, '')
    }
  }

  const whatsappNumber = getNumber('تواصل عبر واتساب')
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredCourses = useMemo(
    () =>
      COURSES.filter((course) => {
        const matchesCategory = activeCategory === 'all' || course.category === activeCategory
        const searchLower = (searchQuery || '').toLowerCase().trim()
        const matchesSearch =
          !searchLower ||
          (course.title || '').toLowerCase().includes(searchLower) ||
          (course.desc || '').toLowerCase().includes(searchLower)
        return matchesCategory && matchesSearch
      }),
    [activeCategory, searchQuery],
  )

  const courseSchema = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      itemListElement: COURSES.map((c, i) => ({
        '@type': 'Course',
        position: i + 1,
        name: c.title,
        description: c.desc,
        provider: {
          '@type': 'EducationalOrganization',
          name: academyName,
          url: 'https://dareen.cloud',
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: c.rating,
          bestRating: 5,
          ratingCount: parseStudentCount(c.students),
        },
        offers: {
          '@type': 'Offer',
          priceCurrency: 'EGP',
          price: '0',
          availability: 'https://schema.org/InStock',
        },
      })),
    }),
    [academyName],
  )

  return (
    <div className="relative flex min-h-full flex-col bg-background font-sans text-main transition-colors duration-500 dark:bg-background">
      <SEO
        title="الدورات التعليمية أونلاين"
        description="دورات تعليمية أونلاين للمناهج السعودية والكويتية والإماراتية والقطرية والعمانية والبحرينية. دروس خصوصية في الرياضيات والعلوم واللغة العربية والإنجليزية وقدرات وتحصيلي في الرياض وجدة والكويت ودبي والدوحة والريان ومسقط وصلالة والمنامة والمحرق. تأسيس أطفال، تحفيظ قرآن، مراجعات نهائية مع نخبة المعلمين الخبراء."
        url="https://dareen.cloud/courses"
        image="/dareen_books_portal_v3.png"
        breadcrumbs={[
          { name: 'الرئيسية', item: '/' },
          { name: 'الدورات', item: '/courses' },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(courseSchema) }}
      />
      <MobileHeader />

      <main className="relative flex-grow overflow-x-clip pb-6 md:pb-10 md:pt-32">
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <div className="absolute right-[-10%] top-[-15%] h-[60%] w-[60%] rounded-full bg-gradient-to-br from-primary/5 to-primary/5 blur-[140px] dark:from-primary/[0.05] dark:to-primary/[0.05]" />
          <div className="to-primary/3 absolute bottom-[-10%] left-[-10%] h-[50%] w-[50%] rounded-full bg-gradient-to-tr from-info-soft blur-[120px] dark:from-primary/[0.03] dark:to-primary/[0.03]" />
          <div className="absolute left-[50%] top-[40%] h-px w-[80%] -translate-x-1/2 bg-gradient-to-r from-transparent via-primary/10 to-transparent dark:via-primary/20" />
        </div>

        <div className="container relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AnimateOnScroll animation="fadeUp">
            <div className="mb-4 text-center md:mb-6">
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary bg-primary-soft px-4 py-1.5 backdrop-blur-sm dark:border-primary/30 dark:bg-primary/15 md:mb-6">
                <Sparkles size={13} className="text-primary dark:text-primary" />
                <span className="text-micro font-black text-primary dark:text-primary">
                  استكشف مسيرتك التعليمية
                </span>
              </div>

              <h1 className="mb-2 font-heading text-xl font-black leading-tight text-main dark:text-main sm:text-4xl md:mb-4 lg:text-5xl">
                <span className="text-primary dark:text-primary">دورات</span> {academyName}
              </h1>

              <p className="mx-auto max-w-2xl text-sm font-medium leading-relaxed text-muted dark:text-muted sm:text-base">
                برامج تعليمية مصممة بعناية لتُناسب جميع المراحل والمستويات — بأسلوب تفاعلي يجعل
                التعلّم تجربة ممتعة
              </p>
            </div>
          </AnimateOnScroll>

          <div className="mx-auto mb-6 max-w-4xl">
            <div className="group relative">
              <input
                type="text"
                aria-label="ابحث عن دورتك المفضلة"
                placeholder="ابحث عن دورتك المفضلة..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="shadow-elevation-1/50 w-full rounded-card border border-border bg-card px-5 py-4 ps-12 text-base font-bold shadow-elevation-3 outline-none transition-all placeholder:text-dim focus-visible:border-primary/50 focus-visible:ring-4 focus-visible:ring-primary/10 dark:border-primary/30 dark:bg-card dark:shadow-black/20 dark:placeholder:text-dim dark:focus-visible:border-primary/50 dark:focus-visible:shadow-elevation-3 dark:focus-visible:ring-primary/10"
              />
              <Search className="absolute start-4 top-1/2 h-5 w-5 -translate-y-1/2 text-dim transition-colors group-focus-within:text-primary dark:text-dim dark:group-focus-within:text-primary" />
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-2.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setActiveCategory(cat.value)}
                  className={`flex cursor-pointer items-center gap-2 rounded-card px-4 py-2.5 text-xs font-black transition-all duration-300 ${
                    activeCategory === cat.value
                      ? 'bg-primary-active text-on-primary shadow-elevation-3 dark:bg-primary dark:text-on-primary dark:shadow-primary/20'
                      : 'border border-border bg-surface text-muted hover:border-primary/30 hover:text-main hover:shadow-elevation-2 dark:border-primary/20 dark:bg-card dark:text-muted dark:hover:border-primary/40 dark:hover:text-main'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <cat.icon
                      size={14}
                      className={
                        activeCategory === cat.value
                          ? 'text-on-primary dark:text-on-primary'
                          : cat.color
                      }
                    />
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
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5 xl:grid-cols-4"
            >
              {filteredCourses.map((course) => (
                <motion.div
                  key={course.id}
                  variants={cardVariants}
                  className="group relative flex h-full flex-col overflow-hidden rounded-card border border-border bg-card shadow-elevation-1 transition-all duration-500 hover:shadow-elevation-4 hover:shadow-primary/5 dark:border-primary/20 dark:bg-card dark:hover:shadow-primary/10"
                >
                  <div className="relative h-44 overflow-hidden bg-background dark:bg-card">
                    <Image
                      src={course.image}
                      alt={course.title}
                      className="h-full w-full"
                      imgClassName="object-contain scale-[1.15] group-hover:scale-[1.25] transition-transform duration-700 ease-out"
                    />

                    <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-card to-transparent dark:from-card" />

                    <div className="absolute start-3 top-3 z-10">
                      <div
                        className={`rounded-lg bg-gradient-to-br px-2.5 py-1 text-micro font-black text-on-primary shadow-elevation-3 ${course.color}`}
                      >
                        {CATEGORIES.find((c) => c.value === course.category)?.label ||
                          course.category}
                      </div>
                    </div>

                    <div className="absolute bottom-3 end-3 z-10">
                      <div className="flex items-center gap-1 rounded-lg bg-surface px-2 py-1 shadow-elevation-1 backdrop-blur-sm dark:bg-card">
                        <StarRating rating={course.rating} />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-3 pb-0">
                    <h2 className="font-heading text-lg font-black leading-snug text-main transition-colors group-hover:text-primary dark:text-main dark:group-hover:text-primary md:text-xl">
                      {course.title}
                    </h2>

                    <p className="mb-4 mt-2 line-clamp-2 text-xs leading-relaxed text-muted dark:text-muted">
                      {course.desc}
                    </p>

                    <div className="mt-auto flex items-center justify-between border-t border-border py-3 dark:border-primary/15">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-soft dark:bg-primary/15">
                          <Users size={12} className="text-primary dark:text-primary" />
                        </div>
                        <div>
                          <span className="block text-xs font-black leading-none text-main dark:text-main">
                            {course.students}
                          </span>
                          <span className="text-micro font-bold text-muted dark:text-dim">
                            طالب
                          </span>
                        </div>
                      </div>

                      <span className="flex items-center gap-1.5 rounded-lg bg-success-light px-3 py-1.5 text-xs font-black text-success dark:bg-primary/10 dark:text-primary dark:shadow-[0_0_6px_rgba(99,102,241,0.12)]">
                        <Sparkles size={10} />
                        تجربة مجانية
                      </span>
                    </div>
                  </div>

                  <a
                    href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`السلام عليكم، أرغب في الاستفسار عن ${course.title}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mx-3 mb-3 flex items-center justify-center gap-2 rounded-card bg-success py-2.5 text-xs font-black text-on-success shadow-elevation-3 transition-all duration-300 hover:bg-success-dark active:scale-[0.97] dark:bg-primary dark:text-on-primary dark:shadow-elevation-3 dark:shadow-primary/20 dark:hover:bg-warning"
                  >
                    <MessageCircle size={14} />
                    تواصل عبر واتساب
                  </a>

                  {course.seoKeywords && (
                    <div
                      className="pointer-events-none absolute h-0 overflow-hidden opacity-0"
                      aria-hidden="true"
                    >
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
              className="py-20 text-center"
            >
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-card border border-border bg-background dark:border-primary/30 dark:bg-card">
                <Search size={28} className="text-dim dark:text-dim" />
              </div>
              <h2 className="mb-1 text-xl font-black text-main dark:text-main">لا توجد نتائج</h2>
              <p className="text-sm font-medium text-muted dark:text-muted">
                جرّب كلمات بحث مختلفة أو اختر تصنيفاً آخر
              </p>
            </motion.div>
          )}
        </div>
      </main>

      <PublicFooter />
    </div>
  )
}
