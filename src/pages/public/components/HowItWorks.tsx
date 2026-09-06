import { motion } from 'framer-motion'
import { Users, Star, Zap, ArrowLeft, Gift } from 'lucide-react'
import { cn } from '../../../lib/utils'

interface HowItWorksProps {
  whatsappNumber: string
}

export const HowItWorks = ({ whatsappNumber }: HowItWorksProps) => {
  return (
    <section
      id="how-it-works"
      className="relative scroll-mt-32 overflow-hidden bg-surface py-4 transition-colors duration-500 dark:bg-background"
    >
      <div className="absolute inset-0 z-0">
        <div className="absolute start-[-10%] top-0 h-[500px] w-[500px] animate-pulse rounded-full bg-primary/[0.05] blur-[100px] dark:bg-primary/[0.08]"></div>
        <div className="bg-success/[0.03] absolute bottom-0 end-[-10%] h-[500px] w-[500px] rounded-full blur-[100px] dark:bg-primary/[0.05]"></div>
      </div>

      <div className="container relative z-10 mx-auto px-4">
        <div className="mb-4 text-center">
          <div className="mx-auto mb-4 inline-flex scale-90 items-center gap-2 rounded-full border bg-primary px-3 py-1 text-on-primary dark:border-primary/40 dark:bg-primary/20 dark:text-primary">
            <Zap size={12} className="text-warning dark:text-primary" />
            <span className="text-micro font-black">حصتك المجانية بانتظارك</span>
          </div>
          <h2 className="font-heading text-xl font-black text-main dark:text-main md:text-5xl">
            كيف تشترك في <span className="text-primary dark:text-primary">المعهد؟</span>
          </h2>
        </div>

        <div className="relative mx-auto max-w-4xl pt-4">
          <div className="pointer-events-none absolute inset-0 hidden overflow-visible md:block">
            <svg
              className="absolute end-[25%] top-[30px] h-[60px] w-[25%]"
              viewBox="0 0 200 60"
              fill="none"
            >
              <path
                d="M0 30 C 50 0, 150 0, 200 30"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="6 6"
                className="text-dim dark:text-primary/40"
              />
              <path
                d="M195 25 L205 32 L195 39"
                stroke="currentColor"
                strokeWidth="2"
                className="text-dim dark:text-primary/40"
              />
            </svg>
            <svg
              className="absolute start-[25%] top-[30px] h-[60px] w-[25%]"
              viewBox="0 0 200 60"
              fill="none"
            >
              <path
                d="M0 30 C 50 60, 150 60, 200 30"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="6 6"
                className="text-dim dark:text-primary/40"
              />
              <path
                d="M195 25 L205 32 L195 39"
                stroke="currentColor"
                strokeWidth="2"
                className="text-dim dark:text-primary/40"
              />
            </svg>
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
            className="grid grid-cols-3 gap-2 md:gap-4"
          >
            {[
              {
                id: '01',
                title: 'اختر المنهج',
                desc: 'حدد منهجك والمادة',
                icon: <Users className="h-5 w-5 md:h-6 md:w-6" />,
                color: 'from-primary-active to-primary-active dark:from-primary dark:to-warning',
              },
              {
                id: '02',
                title: 'حصة مجانية',
                desc: 'حصة تجريبية مجانية لك',
                icon: <Star className="h-5 w-5 md:h-6 md:w-6" />,
                color: 'from-success to-success dark:from-primary dark:to-warning',
              },
              {
                id: '03',
                title: 'اشترك الآن',
                desc: 'تواصل لحجز مقعدك',
                icon: <Zap className="h-5 w-5 md:h-6 md:w-6" />,
                color: 'from-primary to-primary dark:from-primary dark:to-warning',
              },
            ].map((step) => (
              <motion.div
                key={step.id}
                variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }}
                transition={{ duration: 0.5 }}
                className="group relative flex flex-col items-center"
              >
                <div
                  className={cn(
                    'relative mb-4 flex h-[55px] w-[55px] items-center justify-center rounded-[30%] bg-gradient-to-br text-on-primary shadow-elevation-4 transition-all duration-500 group-hover:rotate-6 group-hover:scale-110 dark:text-on-primary md:mb-6 md:h-[90px] md:w-[90px]',
                    step.color,
                  )}
                >
                  <div className="scale-75 md:scale-100">{step.icon}</div>
                  <span className="absolute -start-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full border border-border bg-surface text-micro font-black text-main shadow-elevation-3 dark:border-primary/50 dark:bg-background dark:text-primary md:-start-2 md:-top-2 md:h-6 md:w-6 md:text-micro">
                    {step.id}
                  </span>
                </div>

                <div className="w-full px-1 text-center md:px-4">
                  <div className="mb-1 text-xs font-black text-main transition-colors group-hover:text-primary dark:text-main dark:group-hover:text-accent md:text-sm">
                    {step.title}
                  </div>
                  <p className="hidden text-micro font-bold leading-tight text-main dark:text-muted sm:block md:text-micro">
                    {step.desc}
                  </p>
                </div>

                <div className="absolute -start-2 top-[45px] hidden h-1.5 w-1.5 rounded-full bg-surface group-last:hidden dark:bg-primary md:block"></div>
              </motion.div>
            ))}
          </motion.div>

          <div className="mt-10 flex justify-center">
            <a
              href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('السلام عليكم، أرغب في البدء وحجز حصة تجريبية مجانية')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative overflow-hidden rounded-xl bg-primary px-8 py-3.5 text-sm font-extrabold text-on-primary shadow-elevation-4 transition-all hover:scale-105 active:scale-95 dark:bg-gradient-to-r dark:from-primary dark:to-warning dark:text-on-primary"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary opacity-0 transition-opacity duration-500 group-hover:opacity-100 dark:from-primary dark:to-warning"></div>
              <div className="relative flex items-center gap-2">
                <Gift size={16} />
                <span className="text-micro font-black">حصتك المجانية بانتظارك</span>
                <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
              </div>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
