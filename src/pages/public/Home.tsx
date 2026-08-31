import { safeJsonLd } from '../../shared/utils/jsonLd'
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AnimateOnScroll } from '../../components/ui/AnimateOnScroll'
import { useSettingsStore } from '../../store/settingsStore'
import { useAcademyName } from '../../context/AppContext'

import { SEO } from '../../components/SEO'
import { MobileHeader } from '../../components/public/MobileHeader'
import { PublicFooter } from '../../components/public/PublicFooter'
import { MasarSection } from '../../components/public/MasarSection'
import { WhyChooseUs } from './components/WhyChooseUs'
import { QuranSection } from './components/QuranSection'
import { HowItWorks } from './components/HowItWorks'
import { Testimonials } from './components/Testimonials'
import { FAQSection } from './components/FAQSection'
import { HeroSection } from './components/HeroSection'
import { HowToSubscribe } from './components/HowToSubscribe'
import { AppDownloadSection } from './components/AppDownloadSection'
import { StatsCounter } from './components/StatsCounter'
import { Image } from '../../shared/components/ui'
import { Play, Headphones, Users, Star, ChevronLeft, BadgeCheck } from 'lucide-react'
import {
  featureStyles,
  quickFeatures,
  getFilteredCourses,
  heroSlides,
  stages,
  reviews,
  reviewSchema,
} from './home-page'
import { useIsAuthenticated } from '../../context/useApp'

export const Home = () => {
  const academyName = useAcademyName()
  const adminPhone = useSettingsStore((s) => s.adminPhone)
  const heroBanners = useSettingsStore((s) => s.heroBanners)
  const whatsappNumbers = useSettingsStore((s) => s.whatsappNumbers)
  const isAuthenticated = useIsAuthenticated()
  const defaultNumber = adminPhone.replace(/\D/g, '')

  const getNumber = (label: string): string => {
    try {
      const entries = JSON.parse(whatsappNumbers)
      const found = entries.find((e: { label: string; phone: string }) => e.label === label)
      return found ? found.phone.replace(/\D/g, '') : defaultNumber
    } catch (e) {
      console.warn(e)
      return defaultNumber
    }
  }

  const requestFreeNumber = getNumber('��� ��� ������')
  const bookFreeNumber = getNumber('���� ���� �������� ����')
  const memorizingNumber = getNumber('���� ����� ����')
  const excellenceNumber = getNumber('���� ���� ������')
  const signupNowNumber = getNumber('��� ����')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [activeCategory, setActiveCategory] = useState('all')
  const [typewriterText, setTypewriterText] = useState('')
  const [heroIndex, setHeroIndex] = useState(0)

  let bannersArray = ['', '', '', '']
  try {
    if (heroBanners) bannersArray = JSON.parse(heroBanners)
  } catch (e) {
    console.warn(e)
  }

  useEffect(() => {
    const fullText = `���� ${academyName}`
    let i = 0,
      isDeleting = false,
      typingSpeed = 150,
      timer: ReturnType<typeof setTimeout>
    const type = () => {
      const currentText = isDeleting ? fullText.substring(0, i - 1) : fullText.substring(0, i + 1)
      setTypewriterText(currentText)
      if (!isDeleting && i === fullText.length) {
        isDeleting = true
        typingSpeed = 2000
      } else if (isDeleting && i === 0) {
        isDeleting = false
        typingSpeed = 500
      } else {
        i += isDeleting ? -1 : 1
        typingSpeed = isDeleting ? 75 : 150
      }
      timer = setTimeout(type, typingSpeed)
    }
    timer = setTimeout(type, typingSpeed)
    return () => clearTimeout(timer)
  }, [academyName])

  useEffect(() => {
    const timer = setInterval(() => setCurrentIndex((prev) => (prev + 1) % reviews.length), 13000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="relative min-h-full overflow-x-hidden bg-surface text-main transition-colors duration-500 dark:bg-background dark:text-main">
      <SEO
        title="���� ����� �� ��� �� ������ �������"
        description="����� �� ��� �� �����ʡ �������ɡ ��ѡ �������ʡ �����. ���� �����ɡ ����� ���� ������ ������� �������� �� ���� ��������. ���� ��� ������� ������ ����."
        url="https://dareen.cloud/"
        image="/hero-child.png"
        breadcrumbs={[{ name: '��������', item: '/' }]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(reviewSchema) }}
      />
      <MobileHeader />
      <main className="relative mx-auto max-w-lg px-2 pb-4 md:hidden">
        <div className="mb-3 mt-2 flex gap-1.5">
          <a
            href={`https://wa.me/${requestFreeNumber}?text=${encodeURIComponent(`������ ����� ���� �� ��� ��� ������ �� ${academyName}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center gap-1 rounded-full bg-primary px-1.5 py-2 text-xs font-extrabold text-on-primary shadow-lg shadow-black/20 transition-all hover:brightness-110 active:scale-[0.97] dark:bg-gradient-to-r dark:from-primary dark:to-warning dark:text-on-primary"
          >
            <Headphones className="h-2.5 w-2.5 shrink-0" /> ��� ��� ������
          </a>
          <Link
            to="/books"
            className="flex flex-1 items-center justify-center gap-1 rounded-full border bg-primary px-1.5 py-2 text-xs font-bold text-on-primary shadow-lg shadow-black/20 transition-all hover:brightness-110 active:scale-[0.97] dark:border-primary/30 dark:bg-white/10 dark:text-main"
          >
            <Play className="h-2.5 w-2.5 shrink-0 dark:text-primary" /> ����� ������ ������
          </Link>
        </div>
        <section className="relative mb-4 overflow-hidden rounded-card border border-border bg-gradient-to-br from-primary-light via-primary-soft to-card shadow-sm dark:border-primary/30 dark:from-card dark:via-surface dark:to-card">
          {heroSlides.map((slide, i) => (
            <div key={`hero-${i}`} className={`${heroIndex === i ? 'block' : 'hidden'} p-5`}>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <h1 className="mb-0.5 text-lg font-black leading-tight text-main dark:text-main">
                    {slide.title}
                    {heroIndex === 0 && (
                      <span className="text-success-dark dark:text-primary">
                        {' '}
                        �������{' '}
                        <BadgeCheck className="-mt-0.5 inline-block h-4 w-4 text-success-dark dark:text-primary" />
                      </span>
                    )}
                  </h1>
                  <p className="mb-0.5 text-xs font-bold text-primary dark:text-primary">
                    {slide.subtitle}
                  </p>
                  <p className="dark:text-soft mb-3 text-micro leading-relaxed text-muted">
                    {slide.desc}
                  </p>
                  <div className="flex flex-col gap-1.5">
                    <Link
                      to="/courses"
                      className="flex w-full items-center justify-center gap-1 rounded-full border bg-surface px-4 py-2 text-xs font-bold text-main shadow-card transition-all hover:bg-hover dark:border-primary/30 dark:bg-white/10 dark:text-main"
                    >
                      <Play className="h-3 w-3 fill-main dark:fill-primary dark:text-primary" />{' '}
                      ���� �������
                    </Link>
                    <Link
                      to={isAuthenticated ? '/dashboard' : '/login'}
                      className="w-full rounded-full bg-primary px-4 py-2 text-center text-xs font-extrabold text-on-primary shadow-card transition-all dark:bg-gradient-to-r dark:from-primary dark:to-warning dark:text-on-primary"
                    >
                      {isAuthenticated ? '���� ������' : '����� ������'}
                    </Link>
                  </div>
                </div>
                <div className="relative shrink-0">
                  <div className="absolute inset-0 rounded-full bg-primary-light blur-xl dark:bg-primary/10" />
                  <div className="relative w-[90px]">
                    {i === 0 ? (
                      <picture>
                        <source srcSet="/hero-child.webp" type="image/webp" />
                        <img
                          src={slide.image}
                          alt={slide.alt}
                          width="90"
                          height="90"
                          className="h-auto w-full object-contain drop-shadow-lg"
                          fetchPriority="high"
                        />
                      </picture>
                    ) : (
                      <Image
                        src={slide.image}
                        alt={slide.alt}
                        className="h-auto w-full"
                        imgClassName="object-contain drop-shadow-lg"
                      />
                    )}
                  </div>
                  <div className="-mt-1 flex justify-center gap-1">
                    {[0, 1, 2].map((d) => (
                      <button
                        key={d}
                        onClick={() => setHeroIndex(d)}
                        aria-label={`�������� ��� ������� ${d + 1}`}
                        className={`h-1.5 w-1.5 rounded-full transition-all ${heroIndex === d ? 'w-3 bg-primary dark:bg-primary' : 'bg-muted dark:bg-surface'}`}
                      />
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
                const s = featureStyles[f.variant]
                return (
                  <motion.div
                    key={`hero-${i}`}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.08 }}
                    className={`flex items-center gap-2 p-2 ${s.bg} rounded-card border border-border shadow-sm transition-all dark:border-primary/20 dark:bg-card`}
                  >
                    <div
                      className={`h-10 w-10 rounded-card ${s.bg} flex shrink-0 items-center justify-center dark:bg-primary/15`}
                    >
                      <f.icon className={`${s.text} dark:text-primary`} size={20} />
                    </div>
                    <div className="min-w-0">
                      <span className="mb-0 block text-micro font-black leading-tight text-main dark:text-main">
                        {f.label}
                      </span>
                      <span className="dark:text-soft block text-micro font-medium leading-tight text-main">
                        {f.desc}
                      </span>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </section>
        </AnimateOnScroll>
        <AnimateOnScroll>
          <div className="mb-4">
            <HowToSubscribe whatsappNumber={bookFreeNumber} />
          </div>
        </AnimateOnScroll>
        <section className="px-1">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-black text-main dark:text-main">���� �������</h2>
            <Link
              to="/courses"
              className="flex items-center gap-1 text-sm font-bold text-primary dark:text-primary"
            >
              ��� ���� <ChevronLeft className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="no-scrollbar flex gap-2 overflow-x-auto pb-2">
            {stages.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-bold transition-all ${activeCategory === cat.value ? 'bg-primary text-on-primary shadow-md shadow-black/20 dark:bg-gradient-to-r dark:from-primary dark:to-warning dark:text-on-primary' : 'dark:text-soft border border-border bg-surface text-muted dark:border-primary/30 dark:bg-surface'}`}
              >
                <cat.icon
                  size={12}
                  className={
                    activeCategory === cat.value
                      ? 'text-on-primary dark:text-on-primary'
                      : 'text-muted dark:text-primary'
                  }
                />{' '}
                {cat.label}
              </button>
            ))}
          </div>
          <div className="no-scrollbar -mx-1 mt-3 flex gap-3 overflow-x-auto px-1 pb-1">
            {getFilteredCourses(activeCategory)
              .slice(0, 6)
              .map((c, i) => (
                <motion.a
                  key={c.id}
                  href={`https://wa.me/${requestFreeNumber}?text=${encodeURIComponent(`������ ����� ���� �� ��������� �� ${c.title}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: i * 0.08 }}
                  className="block w-[180px] min-w-[180px] shrink-0 overflow-hidden rounded-card border border-border bg-surface shadow-sm dark:border-primary/25 dark:bg-card"
                >
                  <div className="relative h-24 overflow-hidden bg-surface dark:bg-background">
                    <Image src={c.image} alt={c.title} className="h-24" />
                    <span
                      className={`absolute start-2 top-2 rounded-full px-2 py-0.5 text-micro font-black shadow-sm ${c.category === 'foundation' ? 'bg-success text-on-success' : c.category === 'quran' ? 'bg-warning text-on-warning dark:bg-primary dark:text-on-primary' : c.category === 'gulf' ? 'bg-info text-on-info' : c.category === 'english' ? 'bg-primary text-on-primary dark:bg-primary dark:text-on-primary' : 'bg-error text-on-error'}`}
                    >
                      {stages.find((cat) => cat.value === c.category)?.label || c.category}
                    </span>
                  </div>
                  <div className="p-3">
                    <h3 className="mb-0.5 text-xs font-black text-main dark:text-main">
                      {c.title}
                    </h3>
                    <p className="mb-2 line-clamp-1 text-xs font-medium text-muted dark:text-muted">
                      {c.desc}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3 text-dim dark:text-muted" />
                        <span className="dark:text-soft text-xs font-bold text-muted">
                          {c.students}
                        </span>
                      </div>
                      <div className="flex items-center gap-0.5">
                        <Star className="h-3 w-3 fill-warning text-warning dark:fill-primary dark:text-primary" />
                        <span className="text-xs font-bold text-main dark:text-main">
                          {c.rating}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.a>
              ))}
          </div>
        </section>
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
          <AnimateOnScroll>
            <div style={{ contentVisibility: 'auto' }}>
              <HowItWorks whatsappNumber={bookFreeNumber} />
            </div>
          </AnimateOnScroll>
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
      <div className="hidden md:block">
        <AnimateOnScroll animation="scaleIn" duration={0.7}>
          <HeroSection
            typewriterText={typewriterText}
            signupNowNumber={signupNowNumber}
            requestFreeNumber={requestFreeNumber}
            academyName={academyName}
            bannersArray={bannersArray}
          />
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
      <div
        className="pointer-events-none absolute h-0 overflow-hidden opacity-0"
        aria-hidden="true"
      >
        <h2>������� ��������� - ������ �������� ����� �������</h2>
        <p>
          ���� ����� �� ���, ���� ���� �������, ���� ����� �������, ���� ������ ������, �����
          ������, ����� ��������, ����� �� ��� �� ������, ����� �� ��� �� ��������, ����� �������,
          ��� ������, ����� ������, ���� �������, ���� ����, ���� ��� �����, ���� ��� ��������,
          ����� �����, ����� ����, ����� �������, ������� ������, ����� ������, ���� �����, ������
          �������, ������ �����, ����� ������, ������ ����, ���� �������, ����� �����, ���� ������,
          ���� �����, ����� �������, ����� �� ��� �������, ����� ������� ������, ������� ����������,
          ���� ���� ������� �� ������, ���� ���� ������� �� ��������, ���� ���� ������� �� ��������,
          ���� ���� ������� �� ���, ���� ���� ������� �� ����, ���� ���� ������� �� �������, �����
          ������, ����� ����� �������, ����� �������, ��� ������� ����, ����� ����� �������, �����
          ������� ��������, ����� ����� �������, ���� ������ �� ���������, ���� ������ �� ������,
          ���� ������ �� ����� �������, ���� ������ �� ����� ����������, ����� ���� �� ���, �����
          ����� ������, ��� ������ �������, ��� ������ �������, �� ��� ������, ������ �������,
          �������� �������, ��� ������� ������, ������ ����� �������, ����� ������ �������, ����
          ������, �������� �������, ���� ���� ����� �� ������
        </p>
        <h3>����� ������� ����� - ������ ��������</h3>
        <p>
          ���� ���� ����� �� ��� �� ������ ��������� �������, ���� ����� ������� ������� ��������,
          ���� ����� �� ��������� ������� �������, ��� ������� ������ ��� ������, ����� �������
          ������� ������, ������ ������� �� ������ �����, ��� ������ ������� �������� ����������,
          ����� ������ ������ �� ��� �������, ����� ������� �� ������� �������� �������, ����
          �������� ��������� �� ������, ���� ������ ������� ������ ������, ����� ������ ���� ������
          �����, ����� ������ ������� ��������, ����� ������� ������� �� �� ����, ���� ������
          �������� �������, ���� ������ ������� ��������, ����� ������ ������ �������, ���� ������
          ����� �������, ����� �� ��� ����� �����, ���� ������� ����� ������� �������, ����� �����
          �� ���� ������, ������� ������ ��� ����������, �������� ����� �������, ���� �� ����� �����
          ��������, ����� ������� �� ������ ��������� ��������� ���� ����� ��������, ������ �����
          ������� ��������� ��������, ���� ���� �������� ����, ����� ����� ������� ���������, ���
          ���� ���� ����� �������
        </p>
      </div>
      <footer>
        <PublicFooter />
      </footer>
    </div>
  )
}
