import { safeJsonLd } from '../../shared/utils/jsonLd'
import { useState } from 'react'
import { MobileHeader } from '../../components/public/MobileHeader'
import { PublicFooter } from '../../components/public/PublicFooter'
import {
  Phone,
  Mail,
  MapPin,
  Send,
  CheckCircle2,
  MessageCircle,
  Sparkles,
  Heart,
} from 'lucide-react'
import { useSettingsStore } from '../../store/settingsStore'
import { SEO } from '../../components/SEO'
import { cn } from '../../lib/utils'
import { api } from '../../lib/api'
import { AnimateOnScroll } from '../../components/ui/AnimateOnScroll'

export const Contact = () => {
  const adminPhone = useSettingsStore((s) => s.adminPhone)
  const whatsappNumber = adminPhone.replace(/\D/g, '')
  const [formState, setFormState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errorDetail, setErrorDetail] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    subject: 'استفسار عن دورة تعليمية',
    curriculum: 'المنهج الكويتي',
    message: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormState('submitting')
    try {
      await api.post('/contact', formData)
      setFormData({
        name: '',
        phone: '',
        subject: 'استفسار عن دورة تعليمية',
        curriculum: 'المنهج الكويتي',
        message: '',
      })
      setFormState('success')
    } catch (err) {
      setFormState('error')
      setErrorDetail(err instanceof Error ? err.message : String(err))
    }
  }

  const contactCards = [
    {
      icon: Phone,
      title: 'واتساب / هاتف',
      value: adminPhone,
      href: `https://wa.me/${whatsappNumber}`,
      gradient: 'from-success to-info',
      bg: 'bg-success-light dark:bg-success-soft',
      border: 'border-success dark:border-success-soft',
      iconColor: 'text-success',
    },
    {
      icon: Mail,
      title: 'البريد الإلكتروني',
      value: 'info@dareen7.online',
      href: 'mailto:info@dareen7.online',
      gradient: 'from-primary to-primary',
      bg: 'bg-primary-soft dark:bg-primary/10',
      border: 'border-primary dark:border-primary/20',
      iconColor: 'text-primary',
    },
    {
      icon: MapPin,
      title: 'المقر الرئيسي',
      value: 'بني سويف — مصر',
      href: '#',
      gradient: 'from-warning to-warning',
      bg: 'bg-warning-light dark:bg-warning-soft',
      border: 'border-warning dark:border-warning-soft',
      iconColor: 'text-warning',
    },
  ]

  return (
    <div className="flex min-h-full flex-col bg-background font-sans text-main">
      <SEO
        title="اتصل بنا"
        description="تواصل مع فريق دارين السابعة للاستفسار عن دروس خصوصية أونلاين في الرياض وجدة والكويت ودبي والدوحة والريان ومسقط وصلالة والمنامة والمحرق، قدرات وتحصيلي، تحفيظ قرآن، تأسيس أطفال، واشتراكات الطلاب في السعودية والكويت والإمارات وقطر وعمان والبحرين. احجز حصة تجريبية مجانية عبر واتساب."
        url="https://dareen.cloud/contact"
        image="/dareen_logo_new.jpg"
        breadcrumbs={[
          { name: 'الرئيسية', item: '/' },
          { name: 'اتصل بنا', item: '/contact' },
        ]}
      />
      <script type="application/ld+json">
        {safeJsonLd({
          '@context': 'https://schema.org',
          '@type': 'ContactPage',
          name: 'اتصل بنا - دارين السابعة',
          description: 'تواصل مع فريق دارين السابعة للاستفسار عن خدمات التعليم عن بعد',
          mainEntity: {
            '@type': 'EducationalOrganization',
            name: 'دارين السابعة',
            url: 'https://dareen.cloud',
            telephone: `+${adminPhone}`,
            email: 'info@dareen7.online',
            contactPoint: {
              '@type': 'ContactPoint',
              telephone: `+${adminPhone}`,
              contactType: 'customer service',
              availableLanguage: ['Arabic', 'English'],
            },
          },
        })}
      </script>
      <MobileHeader />

      <main className="relative flex-grow overflow-hidden pb-2 md:pt-28">
        {/* Subtle background glows */}
        <div className="pointer-events-none absolute start-0 top-0 h-[500px] w-[500px] -translate-y-1/2 translate-x-1/3 rounded-none bg-primary/5 blur-[120px]" />
        <div className="pointer-events-none absolute bottom-0 end-0 h-[400px] w-[400px] -translate-x-1/3 translate-y-1/3 rounded-none bg-success-soft blur-[100px]" />

        <div className="container relative z-10 mx-auto max-w-5xl px-4">
          {/* ── Hero Header ── */}
          <AnimateOnScroll animation="fadeUp">
            <div className="mb-6 text-center">
              <div className="mb-1 inline-flex items-center gap-2 rounded-full border border-primary bg-primary-soft px-4 py-1.5 backdrop-blur-sm dark:border-primary/20 dark:bg-primary/10 md:mb-5">
                <Sparkles size={13} className="text-primary" />
                <span className="mt-[3px] text-micro font-black text-primary md:mt-0">
                  نحن في خدمتك
                </span>
              </div>
              <h1 className="mb-1 font-heading text-3xl font-black text-main md:mb-3 md:text-5xl">
                تواصل مع{' '}
                <span className="bg-gradient-to-r from-primary to-primary bg-clip-text text-transparent">
                  دارين السابعة
                </span>
              </h1>
              <p className="mx-auto max-w-xl text-sm leading-relaxed text-muted md:text-base">
                فريقنا جاهز للرد على جميع استفساراتك
                <br className="md:hidden" /> ومساعدتك في الانضمام إلى عالم دارين السابعة التعليمي.
              </p>
            </div>
          </AnimateOnScroll>

          {/* ── Image Banner ── */}
          <div className="mb-6">
            <picture>
              <source srcSet="/dareen8.webp" type="image/webp" />
              <source srcSet="/dareen8.avif" type="image/avif" />
              <img
                src="/dareen8.png"
                alt="دارين السابعة"
                width="1983"
                height="793"
                loading="lazy"
                className="mx-auto block h-auto w-full max-w-[400px] md:max-w-full"
              />
            </picture>
          </div>

          {/* ── Contact Form Card ── */}
          <AnimateOnScroll animation="fadeUp">
            <div className="shadow-elevation-1/40 overflow-hidden rounded-none border border-border bg-card shadow-elevation-4 dark:shadow-black/40">
              {/* Top accent bar */}
              <div className="h-1.5 bg-gradient-to-r from-primary via-primary to-warning" />

              {formState === 'success' ? (
                <div className="px-6 py-20 text-center" role="status" aria-live="polite">
                  <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-none bg-success-light text-success">
                    <CheckCircle2 size={44} />
                  </div>
                  <h2 className="mb-2 text-2xl font-black text-main">تم الإرسال بنجاح!</h2>
                  <p className="mb-8 flex items-center justify-center gap-1.5 text-sm text-muted">
                    سنتواصل معك في أقرب وقت{' '}
                    <Heart size={14} className="fill-warning text-warning" />
                  </p>
                  <button
                    onClick={() => setFormState('idle')}
                    className="rounded-none bg-primary px-8 py-3 text-sm font-bold text-on-primary outline-none transition-all hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-focus"
                  >
                    إرسال رسالة أخرى
                  </button>
                </div>
              ) : (
                <div className="p-6 md:p-8">
                  <div className="mb-4">
                    <h2 className="mb-1 text-xl font-black text-main">أرسل لنا رسالة</h2>
                    <p className="flex items-center gap-1.5 text-sm text-muted">
                      سنتواصل معك في أقرب وقت{' '}
                      <Heart size={12} className="fill-warning text-warning" />
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {formState === 'error' && (
                      <div
                        className="border border-error bg-error-light p-4 text-center dark:border-error-soft dark:bg-error-soft"
                        role="alert"
                        aria-live="assertive"
                      >
                        <p className="text-micro font-black text-error">
                          عذراً، حدث خطأ في الإرسال. الرجاء المحاولة مرة أخرى أو التواصل عبر واتساب.
                        </p>
                        {errorDetail && (
                          <p className="mt-2 text-micro text-error opacity-70">{errorDetail}</p>
                        )}
                      </div>
                    )}
                    {/* Row: Name + Phone */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-1.5">
                        <label
                          htmlFor="contact-name"
                          className="block text-micro font-black text-muted"
                        >
                          الاسم الكامل
                        </label>
                        <input
                          id="contact-name"
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                          className="w-full rounded-none border border-border bg-background px-4 py-3 text-sm font-bold text-main outline-none transition-all placeholder:text-dim focus:border-primary focus:ring-2 focus:ring-primary/10 dark:bg-card dark:placeholder:text-muted"
                          placeholder="أدخل اسمك الكريم..."
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label
                          htmlFor="contact-phone"
                          className="block text-micro font-black text-muted"
                        >
                          رقم الهاتف
                        </label>
                        <input
                          id="contact-phone"
                          required
                          type="tel"
                          inputMode="numeric"
                          pattern="[0-9+\s]*"
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData((p) => ({
                              ...p,
                              phone: e.target.value.replace(/[^0-9+\s]/g, ''),
                            }))
                          }
                          className="w-full rounded-none border border-border bg-background px-4 py-3 text-end text-sm font-bold text-main outline-none transition-all placeholder:text-dim focus:border-primary focus:ring-2 focus:ring-primary/10 dark:bg-card dark:placeholder:text-muted"
                          placeholder="+965 XXXX XXXX"
                          dir="ltr"
                        />
                      </div>
                    </div>

                    {/* Subject */}
                    <div className="space-y-1.5">
                      <label
                        htmlFor="contact-subject"
                        className="block text-micro font-black text-muted"
                      >
                        الموضوع
                      </label>
                      <select
                        id="contact-subject"
                        value={formData.subject}
                        onChange={(e) => setFormData((p) => ({ ...p, subject: e.target.value }))}
                        className="w-full appearance-none rounded-none border border-border bg-background bg-[length:14px] bg-no-repeat px-4 py-3 ps-10 text-sm font-bold text-main outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 dark:bg-card"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                          backgroundPosition: 'left 14px center',
                        }}
                      >
                        <option>استفسار عن دورة تعليمية</option>
                        <option>طلب حصة تجريبية</option>
                        <option>مشكلة تقنية في المنصة</option>
                        <option>اقتراحات وتطوير</option>
                        <option>أخرى</option>
                      </select>
                    </div>

                    {/* Curriculum */}
                    <div className="space-y-1.5">
                      <label
                        htmlFor="contact-curriculum"
                        className="block text-micro font-black text-muted"
                      >
                        المنهج
                      </label>
                      <select
                        id="contact-curriculum"
                        value={formData.curriculum}
                        onChange={(e) => setFormData((p) => ({ ...p, curriculum: e.target.value }))}
                        className="w-full appearance-none rounded-none border border-border bg-background bg-[length:14px] bg-no-repeat px-4 py-3 ps-10 text-sm font-bold text-main outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 dark:bg-card"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                          backgroundPosition: 'left 14px center',
                        }}
                      >
                        <option>المنهج الكويتي</option>
                        <option>المنهج القطري</option>
                        <option>المنهج السعودي</option>
                        <option>المنهج الإماراتي</option>
                        <option>سلطنة عمان</option>
                        <option>منهج آخر</option>
                      </select>
                    </div>

                    {/* Message */}
                    <div className="space-y-1.5">
                      <label
                        htmlFor="contact-message"
                        className="block text-micro font-black text-muted"
                      >
                        رسالتك
                      </label>
                      <textarea
                        id="contact-message"
                        rows={4}
                        required
                        value={formData.message}
                        onChange={(e) => setFormData((p) => ({ ...p, message: e.target.value }))}
                        className="w-full resize-none rounded-none border border-border bg-background px-4 py-3 text-sm font-bold text-main outline-none transition-all placeholder:text-dim focus:border-primary focus:ring-2 focus:ring-primary/10 dark:bg-card"
                        placeholder="اكتب استفسارك بالتفصيل هنا..."
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-1 gap-4 pt-1 sm:grid-cols-2">
                      {/* Submit */}
                      <button
                        type="submit"
                        disabled={formState === 'submitting'}
                        className={cn(
                          'flex items-center justify-center gap-2 rounded-none py-3.5 text-sm font-black outline-none transition-all focus-visible:ring-2 focus-visible:ring-focus',
                          formState === 'submitting'
                            ? 'cursor-not-allowed bg-card text-muted'
                            : 'bg-primary text-on-primary shadow-elevation-3 shadow-primary/20 hover:bg-primary-hover',
                        )}
                      >
                        <span className={cn(formState === 'submitting' && 'animate-pulse')}>
                          {formState === 'submitting' ? 'جاري الإرسال...' : 'إرسال الرسالة'}
                        </span>
                        {formState !== 'submitting' && <Send size={16} />}
                      </button>

                      {/* WhatsApp CTA */}
                      <a
                        href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('السلام عليكم، أرغب في الاستفسار عن خدمات دارين السابعة')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 rounded-none bg-success py-3.5 text-sm font-black text-on-success shadow-elevation-3 transition-all hover:bg-success-dark"
                      >
                        <MessageCircle size={16} />
                        <span>تواصل واتساب</span>
                      </a>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </AnimateOnScroll>

          {/* ── Contact Info Cards ── */}
          <div className="mb-4 mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {contactCards.map((card) => (
              <AnimateOnScroll key={card.title} animation="fadeUp" delay={0.05} duration={0.4}>
                <a
                  href={card.href}
                  target={card.href !== '#' ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  className="group block rounded-none border border-border bg-card p-5 shadow-elevation-1"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        'flex h-12 w-12 shrink-0 items-center justify-center rounded-none bg-gradient-to-br text-on-primary shadow-elevation-3',
                        card.gradient,
                      )}
                    >
                      <card.icon size={20} />
                    </div>
                    <div className="min-w-0 flex-grow">
                      <p className="mb-0.5 text-micro font-black text-muted">{card.title}</p>
                      <p
                        className="truncate text-sm font-bold text-main"
                        dir={card.title.includes('هاتف') ? 'ltr' : 'rtl'}
                      >
                        {card.value}
                      </p>
                    </div>
                  </div>
                </a>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  )
}
