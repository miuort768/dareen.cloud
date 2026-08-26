import { motion } from 'framer-motion'
import { Sparkles, GraduationCap } from 'lucide-react'

export const JobsHeroBanner = () => (
  <section className="relative overflow-hidden bg-primary pb-4 pt-2 md:pb-12 md:pt-28">
    <div className="container relative z-10 mx-auto px-4">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 md:flex-row md:gap-10">
        <div className="flex-1 text-center md:text-start">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-3 inline-flex items-center gap-2 rounded-card bg-white/15 px-3 py-1 md:mb-4 md:px-4 md:py-1.5"
          >
            <Sparkles size={12} className="text-on-primary" />
            <span className="text-xs font-bold text-on-primary md:text-sm">
              خطوة لتكوني من العائلة
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-2 font-heading text-2xl font-bold leading-tight text-on-primary md:mb-3 md:text-5xl"
          >
            فرصة للانضمام <span className="text-accent">إلى دارين السابعة</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-4 max-w-lg text-xs leading-relaxed text-white/70 md:mb-0 md:text-lg"
          >
            نبحث عن{' '}
            <span className="inline-block rounded-card bg-white/15 px-3 py-1 text-on-primary backdrop-blur-sm">
              معلمات متميزات
            </span>{' '}
            للتدريس أون لاين.
            <br /> انضمي إلى بيئة تعليمية مبتكرة تقدر الإبداع والتميز.
          </motion.p>
        </div>
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="hidden shrink-0 md:block"
        >
          <div className="flex h-40 w-40 items-center justify-center rounded-card bg-white/15 md:h-52 md:w-52">
            <div className="text-center">
              <GraduationCap size={56} className="mx-auto mb-2 text-on-primary" />
              <span className="block text-xs font-bold text-white/70">نحن ننتظرك</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
    <div className="absolute bottom-0 end-0 h-10 w-full bg-gradient-to-t from-background to-transparent md:h-16" />
  </section>
)
