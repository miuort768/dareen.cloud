import { motion } from 'framer-motion'
import { ShieldCheck, Lightbulb, Heart, Star, Users, Award, ArrowLeft, Zap } from 'lucide-react'

const features = [
  {
    title: 'بيئة تعليمية متطورة',
    desc: 'نخبة من المعلمين المبدعين لتدريس المناهج الكويتية والخليجية.',
    variant: 'success' as const,
  },
  {
    title: 'خبرة واسعة ومؤهلة',
    desc: 'سنوات عديدة من الخبرة في التعليم عن بعد والدروس الخصوصية.',
    variant: 'primary' as const,
  },
  {
    title: 'نتائج مبهرة وملموسة',
    desc: 'نفخر بتحقيقات طلابنا التي تتجاوز التوقعات مع نسب نجاح استثنائية.',
    variant: 'accent' as const,
    ribbon: true,
  },
]

const variantClasses: Record<string, { icon: string; bg: string; card: string }> = {
  success: {
    icon: 'text-on-success dark:text-white',
    bg: 'bg-white/10 dark:bg-primary/10',
    card: 'bg-success dark:bg-card dark:border dark:border-primary/20',
  },
  primary: {
    icon: 'text-on-primary dark:text-white',
    bg: 'bg-white/10 dark:bg-primary/10',
    card: 'bg-primary dark:bg-card dark:border dark:border-primary/20',
  },
  accent: {
    icon: 'text-on-accent dark:text-white',
    bg: 'bg-white/10 dark:bg-primary/10',
    card: 'bg-accent dark:bg-card dark:border dark:border-primary/30',
  },
}

const featureIcons = [ShieldCheck, Lightbulb, Heart]

interface WhyChooseUsProps {
  whatsappNumber?: string
}

export const WhyChooseUs = ({ whatsappNumber = '201015098836' }: WhyChooseUsProps) => {
  return (
    <section className="relative overflow-hidden bg-surface pb-0 pt-4 transition-colors duration-500 dark:bg-card md:pt-10">
      {/* Gold glow decorations */}
      <div className="pointer-events-none absolute -start-40 -top-40 h-80 w-80 rounded-full bg-accent-soft blur-[100px] dark:bg-primary/[0.04]" />
      <div className="pointer-events-none absolute -bottom-40 -end-40 h-80 w-80 rounded-full bg-primary/5 blur-[100px] dark:bg-primary/[0.04]" />
      <div className="bg-primary/3 pointer-events-none absolute end-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px] dark:bg-primary/[0.02]" />

      <div className="container relative z-10 mx-auto px-4 md:px-8">
        {/* Section Header */}
        <div className="mb-4 text-center md:mb-6">
          <h2 className="mb-3 flex items-center justify-center gap-2 font-heading text-2xl font-black text-main dark:text-white md:mb-4 md:text-5xl">
            <Zap className="h-5 w-5 fill-warning text-warning dark:fill-primary dark:text-primary md:hidden" />
            <span>لماذا </span>
            <span className="inline-block rounded-full bg-gradient-to-l from-primary to-primary-hover px-4 py-1.5 text-xl font-extrabold text-on-primary dark:from-primary dark:to-primary dark:text-card md:text-4xl">
              تختارنا؟
            </span>
          </h2>
          <p className="mx-auto max-w-4xl text-sm font-medium leading-relaxed text-muted dark:text-white/80 md:text-base lg:text-xs">
            <span className="hidden md:inline">
              في دارين السابعة، لا نكتفي بالتعليم فقط — نصنع تجربة متكاملة تجمع بين الجودة والدعم
              والتقدير.
              <br />
              نعمل بشغف لنحول الفراغ إلى مسار مهني ناجح يلبي طموحاتك ويتخطى توقعاتك.
            </span>
            <span className="md:hidden">
              في دارين السابعة، لا نكتفي بالتعليم فقط — نصنع تجربة متكاملة تجمع بين الجودة والدعم
              والتقدير. نعمل بشغف لنحول الفراغ إلى مسار مهني ناجح.
            </span>
          </p>
        </div>

        {/* Mobile Layout */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          className="space-y-4 md:hidden"
        >
          {features.map((f, i) => {
            const Icon = featureIcons[i]
            const vc = variantClasses[f.variant]
            if (!Icon || !vc) return null
            return (
              <motion.div
                key={f.title}
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                transition={{ duration: 0.4 }}
                className={`relative flex items-center gap-4 p-4 ${vc.card} rounded-2xl shadow-sm backdrop-blur-sm`}
              >
                {f.ribbon && (
                  <div className="absolute -end-2 -top-2 flex items-center gap-1 rounded-full bg-gradient-to-br from-primary to-primary-hover px-2 py-0.5 text-micro font-black text-on-primary shadow-lg dark:from-primary dark:to-primary dark:text-card">
                    <Star
                      size={8}
                      className="fill-warning text-warning dark:fill-card dark:text-card"
                    />
                    الأكثر طلباً
                  </div>
                )}
                <div
                  className={`h-12 w-12 rounded-2xl ${vc.bg} flex shrink-0 items-center justify-center`}
                >
                  <Icon className={vc.icon} size={22} />
                </div>
                <div>
                  <h3 className={`text-sm font-black ${vc.icon} dark:text-white`}>{f.title}</h3>
                  <p
                    className={`text-micro ${vc.icon} mt-0.5 font-medium leading-relaxed opacity-90 dark:text-white/70`}
                  >
                    {f.desc}
                  </p>
                </div>
              </motion.div>
            )
          })}

          {/* Showcase card (mobile) */}
          <div className="relative mt-6 overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary-hover p-5 dark:border dark:border-primary/20 dark:from-card dark:via-surface dark:to-card">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNENEFGMzciIGZpbGwtb3BhY2l0eT0iMC4wNCI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
            <div className="relative z-10 text-center">
              <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/10 px-3 py-1 dark:border-primary/20 dark:bg-primary/10">
                <Star size={12} className="text-warning dark:text-primary" />
                <span className="text-micro font-bold text-on-primary opacity-90 dark:text-white/90">
                  البصمة المميزة
                </span>
              </div>
              <h3 className="mb-2 font-heading text-lg font-black text-on-primary dark:text-white">
                نبني معًا مجدنا
              </h3>
              <p className="mx-auto mb-4 max-w-xs text-micro font-medium leading-relaxed text-on-primary opacity-90 dark:text-white/80">
                كل يوم نتعلم ونكبر معاً لتقدم لكم أفضل خدمة تعليمية ممكنة. رؤيتكم هي محرّك نجاحنا
                ومحفّز تطورنا.
              </p>
              <a
                href={`https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent('مرحباً، أرغب في الاستفسار عن خدماتكم التعليمية')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/15 px-5 py-2.5 text-xs font-extrabold text-on-primary shadow-lg transition-all hover:bg-white/25 active:scale-[0.98] dark:bg-gradient-to-r dark:from-primary dark:to-primary dark:text-card"
              >
                تواصل معنا الآن
                <ArrowLeft size={14} />
              </a>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center dark:border-primary/10 dark:bg-white/5">
                <Star size={16} className="mx-auto mb-1 text-warning dark:text-warning" />
                <div className="text-lg font-black text-on-primary dark:text-warning">10+</div>
                <div className="text-micro font-bold text-on-primary dark:text-white/60">
                  سنوات خبرة
                </div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center dark:border-primary/10 dark:bg-white/5">
                <Users size={16} className="mx-auto mb-1 text-info dark:text-warning" />
                <div className="text-lg font-black text-on-primary dark:text-warning">70+</div>
                <div className="text-micro font-bold text-on-primary dark:text-white/60">
                  معلم خبير
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Desktop Layout */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
          className="mx-auto hidden max-w-6xl grid-cols-3 gap-4 pb-4 md:grid md:pb-6"
        >
          {features.map((f, i) => {
            const Icon = featureIcons[i]
            const vc = variantClasses[f.variant]
            if (!Icon || !vc) return null
            return (
              <motion.div
                key={f.title}
                variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }}
                transition={{ duration: 0.5 }}
                className={`relative p-6 ${vc.card} group flex items-start gap-4 rounded-2xl shadow-sm transition-all hover:shadow-md dark:hover:shadow-primary/5`}
              >
                {f.ribbon && (
                  <div className="absolute -end-2 -top-2 flex items-center gap-1 rounded-full bg-gradient-to-br from-primary to-primary-hover px-2 py-0.5 text-micro font-black text-on-primary shadow-lg dark:from-primary dark:to-primary dark:text-card">
                    <Star
                      size={8}
                      className="fill-warning text-warning dark:fill-card dark:text-card"
                    />
                    الأكثر طلباً
                  </div>
                )}
                <div
                  className={`h-14 w-14 rounded-2xl ${vc.bg} flex shrink-0 items-center justify-center`}
                >
                  <Icon className={vc.icon} size={24} />
                </div>
                <div>
                  <h3 className={`text-base font-black ${vc.icon} mb-1 dark:text-white`}>
                    {f.title}
                  </h3>
                  <p
                    className={`text-xs ${vc.icon} font-medium leading-relaxed dark:text-white/70`}
                  >
                    {f.desc}
                  </p>
                </div>
              </motion.div>
            )
          })}

          {/* Showcase card (desktop) */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary-hover p-6 shadow-lg dark:border dark:border-primary/20 dark:from-card dark:via-surface dark:to-card md:col-span-3 md:p-8">
            <div className="absolute start-0 top-0 h-64 w-64 -translate-y-1/2 translate-x-1/2 rounded-full bg-on-primary opacity-5 blur-3xl dark:bg-primary"></div>
            <div className="absolute bottom-0 end-0 h-64 w-64 -translate-x-1/2 translate-y-1/2 rounded-full bg-on-primary opacity-5 blur-3xl dark:bg-primary"></div>
            <div className="relative z-10 flex flex-col items-center gap-6 lg:flex-row">
              <div className="flex-1 text-center lg:text-start">
                <div className="mx-auto mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-3 py-1 dark:border-primary/20 dark:bg-primary/10 lg:mx-0">
                  <Award size={16} className="text-warning dark:text-primary" />
                  <span className="text-xs font-bold text-on-primary dark:text-white/90">
                    البصمة المميزة
                  </span>
                </div>
                <h3 className="mb-2 font-heading text-xl font-black text-on-primary dark:text-white md:text-2xl">
                  نبني معًا مجدنا
                </h3>
                <p className="mx-auto max-w-xl text-xs font-medium leading-relaxed text-on-primary dark:text-white/80 md:text-sm lg:mx-0">
                  كل يوم نتعلم ونكبر معاً لتقدم لكم أفضل خدمة تعليمية ممكنة. رؤيتكم هي محرّك نجاحنا
                  ومحفّز تطورنا.
                </p>
              </div>
              <div className="grid w-full shrink-0 grid-cols-2 gap-4 sm:gap-6 lg:w-auto">
                <div className="rounded-2xl border border-white/10 bg-white/10 p-6 text-center transition-all duration-300 group-hover:bg-white/15 dark:border-primary/10 dark:bg-white/5 dark:group-hover:bg-primary/[0.06]">
                  <Users className="mx-auto mb-3 h-8 w-8 text-info dark:text-warning" />
                  <div className="text-3xl font-black text-on-primary dark:text-warning">+70</div>
                  <div className="text-xs font-bold text-on-primary dark:text-white/60">
                    معلم خبير
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/10 p-6 text-center transition-all duration-300 group-hover:bg-white/15 dark:border-primary/10 dark:bg-white/5 dark:group-hover:bg-primary/[0.06]">
                  <Star className="mx-auto mb-3 h-8 w-8 text-warning dark:text-warning" />
                  <div className="text-3xl font-black text-on-primary dark:text-warning">+10</div>
                  <div className="text-xs font-bold text-on-primary dark:text-white/60">
                    سنوات خبرة
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
