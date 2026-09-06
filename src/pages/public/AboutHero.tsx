import { motion } from 'framer-motion'
import { Sparkles, Award, Users, Heart } from 'lucide-react'
import { AnimateOnScroll } from '../../components/ui/AnimateOnScroll'

export const AboutHero = () => (
  <section className="relative overflow-hidden bg-background pb-8 dark:bg-background md:pb-12 md:pt-32">
    <div className="pointer-events-none absolute start-0 top-0 hidden h-[500px] w-[500px] -translate-y-1/2 translate-x-1/2 rounded-full bg-primary/5 blur-[120px] md:block"></div>
    <div className="pointer-events-none absolute bottom-0 end-0 hidden h-80 w-80 -translate-x-1/2 translate-y-1/2 rounded-full bg-primary/5 blur-[100px] md:block"></div>
    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/simple-dashed.png')] opacity-[0.03]"></div>

    <div className="container relative z-10 mx-auto px-4 text-center">
      <AnimateOnScroll animation="fadeUp">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary bg-primary-soft px-4 py-1.5 backdrop-blur-sm dark:border-primary/20 dark:bg-primary/10">
          <Sparkles size={13} className="text-primary" />
          <span className="text-micro font-black text-primary">دارين السابعة | ريادة تعليمية</span>
        </div>

        <h1 className="relative mb-4 font-heading text-2xl font-black leading-none text-main md:text-4xl md:leading-tight lg:text-5xl">
          <span className="sr-only">
            عن دارين السابعة للتعليم والتدريب - أفضل منصة للتعليم عن بعد والدروس الخصوصية في الكويت
            والخليج
          </span>
          <span aria-hidden="true">
            نحن لا نُدرّس فقط،
            <br className="md:hidden" />
            <span className="hidden md:inline"> </span>
          </span>
          <span className="inline-block py-1 text-primary" aria-hidden="true">
            نحن نبني مستقبلاً
          </span>
        </h1>

        <p className="mx-auto mb-8 max-w-3xl px-4 text-xs font-medium leading-relaxed text-muted md:text-base md:leading-relaxed">
          في دارين السابعة، منصة تعليم عن بعد رائدة في السعودية والكويت والخليج، نؤمن بأن كل طالب هو
          مشروع نجاح بحد ذاته. نجمع بين أصالة القيم العربية وأحدث تقنيات التعليم الرقمي في السعودية،
          الكويت، الإمارات، قطر وعمان والبحرين لتقديم دروس خصوصية أونلاين، قدرات وتحصيلي، تحفيظ
          قرآن، وتأسيس أطفال وفق المناهج الخليجية.
        </p>
      </AnimateOnScroll>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
        variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
        className="flex flex-wrap justify-center gap-8 md:gap-12"
      >
        <motion.div
          variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center"
        >
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-card bg-primary-soft text-primary shadow-elevation-1 transition-transform group-hover:scale-110 dark:bg-card">
            <Award size={24} />
          </div>
          <span className="text-xl font-black text-main md:text-2xl">10+</span>
          <span className="mt-1 text-micro font-black text-muted">سنوات تميز</span>
        </motion.div>
        <motion.div
          variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center"
        >
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-card bg-primary-soft text-primary shadow-elevation-1 transition-transform group-hover:scale-110 dark:bg-card">
            <Users size={24} />
          </div>
          <span className="text-xl font-black text-main md:text-2xl">5k+</span>
          <span className="mt-1 text-micro font-black text-muted">طالب فخور</span>
        </motion.div>
        <motion.div
          variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center"
        >
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-card bg-warning-light text-warning shadow-elevation-1 transition-transform group-hover:scale-110 dark:bg-warning-soft">
            <Heart size={24} />
          </div>
          <span className="text-xl font-black text-main md:text-2xl">100%</span>
          <span className="mt-1 text-micro font-black text-muted">ثقة وتفاني</span>
        </motion.div>
      </motion.div>
    </div>
  </section>
)
