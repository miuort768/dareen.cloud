import { motion } from 'framer-motion'
import { Image } from '../../shared/components/ui'
import { AnimateOnScroll } from '../../components/ui/AnimateOnScroll'
import { Zap, BookOpen, Sparkles, Target } from 'lucide-react'

export const AboutStory = () => (
  <section className="relative overflow-hidden bg-background py-6 md:py-8">
    <div className="container relative z-10 mx-auto px-4">
      <AnimateOnScroll animation="fadeUp">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-12 lg:flex-row lg:gap-20">
          <div className="order-2 w-full lg:order-1 lg:w-1/2">
            <div className="relative">
              <div className="absolute start-0 top-0 h-full w-full -rotate-3 scale-105 rounded-[3rem] bg-gradient-to-br from-primary/5 to-transparent blur-xl"></div>
              <div className="relative grid grid-cols-2 gap-4">
                <div className="space-y-4 pt-8">
                  <div className="h-64 overflow-hidden rounded-[2rem] shadow-2xl">
                    <Image
                      src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800"
                      className="h-full w-full"
                      alt="تعلم تعاوني"
                    />
                  </div>
                  <div className="flex h-48 flex-col justify-end rounded-[2rem] bg-warning p-6 text-on-warning shadow-elevation-4">
                    <Sparkles size={24} className="mb-4 text-white/90" />
                    <p className="text-xl font-black">إبداع مستمر</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex h-48 flex-col justify-end rounded-[2rem] bg-primary-hover p-6 text-on-primary shadow-elevation-4">
                    <Target size={24} className="mb-4 text-white/90" />
                    <h4 className="text-xl font-black text-on-primary">أهداف محققة</h4>
                  </div>
                  <div className="h-64 overflow-hidden rounded-[2rem] shadow-2xl">
                    <Image
                      src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=800"
                      className="h-full w-full"
                      alt="تدريس فعال"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="order-1 w-full text-start lg:order-2 lg:w-1/2">
            <div className="mb-4 inline-flex items-center gap-2 rounded-card bg-card px-4 py-1.5 text-main dark:bg-surface dark:text-main">
              <span className="text-micro font-black">تعرف عليـــنا</span>
            </div>
            <h2 className="mb-6 font-heading text-2xl font-black leading-tight text-main md:text-4xl md:leading-tight">
              ريادة في التعليم،
              <br />
              <span className="mt-2 block text-primary">نهضة في الفكر</span>
            </h2>
            <p className="mb-8 max-w-xl text-sm font-medium leading-relaxed text-muted md:text-base">
              بدأ دارين السابعة كحلم صغير لتقديم تعليم يختلف عن المألوف، واليوم أصبحنا منارة تعليمية
              يثق بها الآلاف. نعتمد على استراتيجيات التعلم النشط ونركز على تمكين الطالب من أدوات
              البحث والابتكار، ليواجه تحديات المستقبل بذكاء وثقة.
            </p>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
              variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
              className="space-y-4"
            >
              <motion.div
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                transition={{ duration: 0.4 }}
                className="flex items-start gap-4 rounded-card border border-border bg-background p-6 transition-colors hover:bg-surface dark:bg-card dark:hover:bg-card"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-card bg-card text-primary shadow-elevation-1">
                  <Zap size={24} />
                </div>
                <div>
                  <h3 className="mb-1 text-lg font-black text-main">رؤية الابتكار</h3>
                  <p className="text-sm font-medium text-muted">
                    أن نكون الخيار الأول للتعليم النوعي المبتكر في المنطقة العربية.
                  </p>
                </div>
              </motion.div>
              <motion.div
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                transition={{ duration: 0.4 }}
                className="flex items-start gap-4 rounded-card border border-border bg-background p-6 transition-colors hover:bg-surface dark:bg-card dark:hover:bg-card"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-card bg-card text-warning shadow-elevation-1">
                  <BookOpen size={24} />
                </div>
                <div>
                  <h3 className="mb-1 text-lg font-black text-main">رسالة التمكين</h3>
                  <p className="text-sm font-medium text-muted">
                    تقديم تجربة تعليمية قيمّة وملهمة تُطلق العنان لإبداع الطالب وتضمن تفوقه.
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </AnimateOnScroll>
    </div>
  </section>
)
